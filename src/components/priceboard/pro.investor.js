import React, { useEffect, useState } from "react";
import {
  checkRequestOpenAccSinglebond,
  getIdentityStatus,
  getInfoSingleAccount,
} from "../../clients/bond.api.client";
import FlowSingleBond from "./popup/flow.singlebond";
import ContractRegisSingleBond from "./popup/contract.regisbond";
import { displayNoti, isBusinessCustomer } from "../../helpers";
import { loadOwnerAccount } from "../../actions/customer.actions";
import moment from "moment";

function ProInvestor(props) {
  const { lang, authInfo } = props;
  const [reqOpenAccSingleBond, setReqOpenAccSingleBond] = useState(null);
  const [regisSinglebond, setRegisSinglebond] = useState(null);

  const [flowSingleBond, setFlowSingleBond] = useState(null);
  const [openContractRegisBond, setOpenContractRegisBond] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState(null);

  useEffect(() => {
    getRequestOpenAccSinglebond();
  }, []);

  useEffect(() => {
    if (props.ownerAccount && props.accountInfo) {
      handleCheckCustomerProduct(props.ownerAccount.customerProduct);
    }
  }, [props.ownerAccount, props.accountInfo]);

  const getRequestOpenAccSinglebond = () => {
    checkRequestOpenAccSinglebond().then((res) => {
      if (res.data) {
        const pendingAccount = res.data.find(
          (e) => e.status === "PENDING" || e.status === "CONFIRMED"
        );
        if (pendingAccount) {
          setReqOpenAccSingleBond(pendingAccount);
        }
      }
    });
  };

  const fetchInfoSingleAccount = () => {
    const { accountInfo } = props;
    if (accountInfo?.custodyId) {
      getInfoSingleAccount(accountInfo.custodyId).then((res) => {
        if (res.data) {
          const { data } = res;
          const today = moment();
          if (
            data.investorType === "PINV" &&
            data.vsdStatus === "A" &&
            moment(data.effectivePinvDate, "YYYY-MM-DD").isAfter(today)
          ) {
            setEffectiveDate(data.effectivePinvDate);
          }
          if (
            data.investorType === "NORM" &&
            data.vsdStatus === "A" &&
            moment(data.effectiveTradeDate, "YYYY-MM-DD").isAfter(today)
          ) {
            setEffectiveDate(data.effectiveTradeDate);
          }
        }
      });
    }
  };

  const handleCheckCustomerProduct = (customerProduct) => {
    const statusRegisted = ["IN_PROGRESS", "CONTRACTIVE", "COMPLETED"];
    const codeExit =
      customerProduct && customerProduct.find((e) => e.code === "03003001");

    if (codeExit && statusRegisted.includes(codeExit.status)) {
      fetchInfoSingleAccount();
    } else {
      setRegisSinglebond(true);
    }
  };

  const fetchIdentityStatus = () => {
    getIdentityStatus()
      .then((res) => {
        const { data, status } = res;
        if (status == 204 || status == 400) {
          setFlowSingleBond("info");
          return;
        }
        if (data && data[0]) {
          if (data[0].identityStatus == "Đã phê duyệt") {
            setFlowSingleBond("info");
          } else {
            setFlowSingleBond("cid");
          }
        }
      })
      .catch((err) => {
        const { message, code } = err.response.data;
        displayNoti(`${message} (${code})`, "error");
      });
  };
  const businessCustomer = isBusinessCustomer(props.accounts);
  return (
    <div>
      <div className="proinvestor">
        {authInfo.isProInvestor ? (
          <div>{lang["congratsPro"]}</div>
        ) : (
          <div>
            <p style={{ marginBottom: 0 }}>{lang["normalInvestor"]}</p>
            <span>
              {lang["proInvestorInfo"]}{" "}
              <a
                href="https://dautu.vndirect.com.vn/nha-dau-tu-chuyen-nghiep-la-gi/"
                target="_blank"
              >
                {lang["here"]}
              </a>
              .
            </span>
          </div>
        )}
      </div>
      <div>
        {reqOpenAccSingleBond && (
          <div
            className="warning65"
            style={{ marginTop: 10, marginBottom: 10 }}
          >
            <span style={{ marginRight: 5 }}>
              Quý khách chưa hoàn tất đăng ký giao dịch trái phiếu doanh nghiệp
              riêng lẻ.
            </span>
            <span
              onClick={() => {
                setOpenContractRegisBond(true);
              }}
              className="anoffer pointer"
            >
              Hoàn tất ngay
            </span>
          </div>
        )}

        {regisSinglebond && !reqOpenAccSingleBond && (
          <div
            className="warning65"
            style={{ marginTop: 10, marginBottom: 10 }}
          >
            <span style={{ marginRight: 5 }}>
              Quý khách chưa đăng ký giao dịch trái phiếu doanh nghiệp riêng lẻ.
            </span>
            {!businessCustomer ? (
              <span
                onClick={() => fetchIdentityStatus()}
                className="anoffer pointer"
              >
                Đăng ký ngay
              </span>
            ) : (
              <span>
                Vui lòng liên hệ Tổng đài 1900545409 hoặc NVCS để được hỗ trợ
              </span>
            )}
          </div>
        )}

        {effectiveDate && (
          <div
            className="warning65"
            style={{ marginTop: 10, marginBottom: 10 }}
          >
            <span>
              Quý khách đã đăng ký mở tài khoản giao dịch Trái phiếu riêng lẻ
              thành công. Quý khách có thể bắt đầu giao dịch từ ngày{" "}
              {moment(effectiveDate, "YYYY-MM-DD").format("DD/MM/YYYY")}
            </span>
          </div>
        )}
        {flowSingleBond && (
          <FlowSingleBond
            {...props}
            reCall={() => {
              setTimeout(() => {
                props.dispatch(loadOwnerAccount());
              }, 2000);
            }}
            step={flowSingleBond}
            handleClose={() => {
              setFlowSingleBond(false);
            }}
          />
        )}

        {openContractRegisBond && reqOpenAccSingleBond && (
          <ContractRegisSingleBond
            {...reqOpenAccSingleBond}
            onClose={() => setOpenContractRegisBond(null)}
          />
        )}
      </div>
    </div>
  );
}

export default ProInvestor