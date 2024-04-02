import React, { useEffect, useRef, useState } from 'react';
import {
  check2AuthBeforeRedirect,
  genLabelTypeBond,
  genNTypeBond,
  useOnClickOutside,
} from "../../../helpers";
import VbondCodeCell from "./cell";
import moment from "moment";
import PopupContainer from "../../../components/popup/index";
import { openPopup } from "../../../actions/customer.actions";
import {
  checkRequestOpenAccSinglebond,
  getInfoSingleAccount,
} from "../../../clients/bond.api.client";
import StatusAccountRegistration from "../../priceboard/popup/status.account";
import FlowSingleBond from "../../priceboard/popup/flow.singlebond";
import ReactTooltip from "react-tooltip";

const TableVbond = (props) => {
  const [typeBond, setTypeBond] = useState(1);
  const [statusAccountRegisBond, setStatusAccountRegisBond] = useState(false);
  const [regisSingleBond, setRegisSingleBond] = useState(false);
  const { lang, data, portfolios, scheduleRestrictedList, popup } = props;
  const langLocal = localStorage.getItem("lang")
    ? localStorage.getItem("lang")
    : "vi";

  const checkTransferLimited = (list, product_type) => {
    if (list && list.length === 0) return null;
    const today = moment();
    const data = list.find(
      (e) =>
        (today.isSameOrAfter(moment(e.start_date, "YYYY-MM-DD")) &&
          today.isSameOrBefore(moment(e.end_date, "YYYY-MM-DD"))) ||
        (e.start_date === e.end_date &&
          today.format("YYYY-MM-DD") === e.end_date)
    );
    if (
      data &&
      (data.product_type === "ALL" || data.product_type === product_type) &&
      (data.side === "ALL" || data.side === "NS")
    ) {
      return data;
    }
    return null;
  };

  const checkListTransferLimitedv1 = (list, product_type) => {
    if (list.length === 0) return null;
    const today = moment();
    const data = list.find((e) =>
      today.isBefore(moment(e.start_date, "YYYY-MM-DD"))
    );
    if (
      data &&
      (data.product_type === "ALL" || data.product_type === product_type)
    ) {
      return data;
    }
    return null;
  };

  const handleCheckCustomerProduct = (portfolio) => {
    const { ownerAccount, accountInfo } = props;
    const customerProduct = ownerAccount.customerProduct;
    const statusRegisted = ["IN_PROGRESS", "CONTRACTIVE", "COMPLETED"];
    const codeExit =
      customerProduct && customerProduct.find((e) => e.code === "03003001");
    if (codeExit && statusRegisted.includes(codeExit.status)) {
      if (accountInfo?.custodyId) {
        getInfoSingleAccount(accountInfo.custodyId).then((res) => {
          if (res.data) {
            const { data } = res;
            const today = moment();
            if (
              (data.effectiveTradeDate &&
                moment(data.effectiveTradeDate, "YYYY-MM-DD").isAfter(today)) ||
              (data.effectivePinvDate &&
                moment(data.effectivePinvDate, "YYYY-MM-DD").isAfter(today))
            ) {
              props.dispatch(
                openPopup({
                  type: "notiday-transaction",
                  data,
                })
              );
            } else {
              check2AuthBeforeRedirect(
                `/danh-muc/dat-ban/${portfolio.bondCode}/${
                  portfolio.productType
                }?from=danh-muc&origin_quantity=${
                  portfolio.sellableQuantity
                }&quantity=${portfolio.sellableQuantity}&deal_id=${
                  portfolio.deal_id || ""
                }&customer_account_no=${
                  portfolio.accountNo
                }&value_date=${moment().format("YYYY-MM-DD")}&type_bond=vbond`
              );
            }
          }
        });
      }
    } else {
      setRegisSingleBond(true);
    }
  };

  const makeSellRequest = (portfolio) => {
    const { bonds } = props;
    const detailBond = bonds[portfolio.bondCode];
    if (detailBond && detailBond.custodyCenter == "003") {
      checkRequestOpenAccSinglebond().then((res) => {
        if (res.data) {
          const pendingAccount = res.data.find(
            (e) => e.status === "PENDING" || e.status === "CONFIRMED"
          );
          if (pendingAccount) {
            setStatusAccountRegisBond(pendingAccount);
          } else {
            handleCheckCustomerProduct(portfolio);
          }
        }
      });
    } else {
      check2AuthBeforeRedirect(
        `/danh-muc/dat-ban/${portfolio.bondCode}/${
          portfolio.productType
        }?from=danh-muc&origin_quantity=${
          portfolio.sellableQuantity
        }&quantity=${portfolio.sellableQuantity}&deal_id=${
          portfolio.deal_id || ""
        }&customer_account_no=${
          portfolio.accountNo
        }&value_date=${moment().format("YYYY-MM-DD")}&type_bond=vbond`
      );
    }
  };

  const handleSellItems = (portfolio, listSR) => {
    const data = checkListTransferLimitedv1(listSR, portfolio.product_type);
    if (
      data &&
      moment(data.start_date, "YYYY-MM-DD").diff(moment(), "days") < 30
    ) {
      props.dispatch(
        openPopup({
          type: "transfer-limitation",
          data,
          product_type: portfolio.product_type,
          funCallBack: () => {
            makeSellRequest(portfolio);
          },
        })
      );
      return;
    }
    makeSellRequest(portfolio);
  };

  return (
    <div>
      <div
        className="csroll-table"
        style={{ overflowY: "hidden", overflowX: "auto" }}
      >
        <table
          className="portfolio-data"
          style={{ width: 200, position: "absolute", right: "10px", zIndex: 2 }}
        >
          <thead>
            <tr>
              <th
                style={{ width: 100, visibility: "hidden", border: "none" }}
              ></th>
              <th style={{ padding: "17px 0", width: 100, minWidth: 100 }}>
                {lang["actions"]}
              </th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((item, i) => {
                if (portfolios) {
                  const portfolio = portfolios.find(
                    (e) => e.bondCode == item.symbol
                    // e.bondCode == item.originalSymbol
                  );
                  const listScheduleRestricted = scheduleRestrictedList
                    ? scheduleRestrictedList
                        .filter((e) => e.bond_code === item.symbol)
                        .sort((a, b) => {
                          return moment(a.start_date, "YYYY-MM-DD").isAfter(
                            moment(b.start_date, "YYYY-MM-DD")
                          )
                            ? 1
                            : -1;
                        })
                    : [];
                  const dataSR = checkTransferLimited(
                    listScheduleRestricted,
                    portfolio?.productType
                  );

                  if (!dataSR) {
                    return (
                      <tr key={i}>
                        <td
                          style={{
                            width: 100,
                            visibility: "hidden",
                            border: "none",
                          }}
                        >
                            <VbondCodeCell
                              typeBond={typeBond}
                              portfolio={portfolio}
                              data={item}
                            />
                        </td>
                        <td className="tc">
                          <button
                            className="btn btn-error btn-buy"
                            style={{ marginRight: 0 }}
                            onClick={() => {
                              handleSellItems(
                                portfolio,
                                listScheduleRestricted
                              );
                            }}
                          >
                            {lang["Bán"]}
                          </button>
                        </td>
                      </tr>
                    );
                  } else {
                    return (
                      <tr key={i}>
                        <td
                          style={{
                            width: 100,
                            visibility: "hidden",
                            border: "none",
                          }}
                        ></td>
                        <td style={{ width: 150 }}>
                          <div>
                            <i
                              style={{
                                marginRight: 5,
                              }}
                            >
                              {lang["transferLimited"]}
                            </i>
                            <span
                              data-tip
                              data-for={`tip-transferLimited_vbond_${portfolio.bondCode}_${portfolio.productType}`}
                              data-class="bottom-tooltip"
                            >
                              <i className="fa fa-info-circle cPointer" />
                            </span>
                            <ReactTooltip
                              id={`tip-transferLimited_vbond_${portfolio.bondCode}_${portfolio.productType}`}
                              effect="solid"
                              place="left"
                            >
                              <p>
                                {langLocal === "vi"
                                  ? dataSR.reason_vn
                                  : dataSR.reason_eng}
                              </p>
                            </ReactTooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                }
              })}
          </tbody>
        </table>
        <table className="portfolio-data" style={{ minWidth: "1360px" }}>
          <thead>
            <tr>
              <th style={{ width: 140 }}>
                <div className="bond-code">
                  <i
                    className="fa fa-caret-left pointer"
                    style={{ marginRight: "4px" }}
                    onClick={() => {
                      setTypeBond(genNTypeBond(typeBond - 1));
                    }}
                  />
                  <div style={{ display: "inline-block", minWidth: 84 }}>
                    {genLabelTypeBond(typeBond, lang)}
                  </div>
                  <i
                    className="fa fa-caret-right pointer"
                    style={{ marginLeft: "4px" }}
                    onClick={() => {
                      setTypeBond(genNTypeBond(typeBond + 1));
                    }}
                  />
                </div>
              </th>
              <th style={{ width: 150 }}>{lang["bondQuantity"]}</th>
              <th style={{ width: 150 }}>{lang["quantityBondAvailable"]}</th>
              <th style={{ width: 150 }}>{lang["averageBuyPrice"]}</th>
              <th style={{ width: 150 }}>{lang["totalValue"]}</th>
              <th
                style={{ width: 200 }}
              >{`${lang["interestBondCoupon"]} ${lang["percentYear"]}`}</th>
              <th style={{ width: 120 }}>{lang["MaturityDate"]}</th>
              <th style={{ width: 200 }}>
                <div>
                  <span style={{ marginRight: "4px" }}>
                    {lang["currentBondValue"]}
                  </span>
                  <Tooltip {...props} />
                </div>
              </th>
              <th style={{ width: 100, minWidth: 100 }}>{lang["actions"]}</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((item, i) => {
                if (portfolios) {
                  const portfolio = portfolios.find(
                    (e) => e.bondCode == item.symbol
                  );
                  return (
                    <tr key={i}>
                      <td>
                        <VbondCodeCell
                          data={item}
                          typeBond={typeBond}
                          portfolio={portfolio}
                        />
                      </td>
                      <td className="tr pr-10">{item.totalQuantity}</td>
                      <td className="tr pr-10">{item.tradeQuantity}</td>
                      <td className="tr pr-10">{item.avgPrice}</td>
                      <td className="tr pr-10">{item.buyValue}</td>
                      <td className="tr pr-10">{item.coupon}</td>
                      <td>{item.maturityDate}</td>
                      <td className="tr pr-10">{item.currentBondValue}</td>
                      <td></td>
                    </tr>
                  );
                }
              })
            ) : (
              <tr>
                <td colSpan="10" className="tc">
                  {lang.dataNotFound}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {statusAccountRegisBond && (
        <StatusAccountRegistration
          {...statusAccountRegisBond}
          onClose={() => setStatusAccountRegisBond(false)}
        />
      )}
      {regisSingleBond && (
        <FlowSingleBond
          {...props}
          handleClose={() => {
            setRegisSingleBond(false);
          }}
        />
      )}
      {popup.status && <PopupContainer {...props} />}
    </div>
  );
};

export default TableVbond;

export const Tooltip = (props) => {
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState({});
  const elmref = useRef(0);
  const tooltipElm = useRef();

  useEffect(() => {
    const rect = elmref.current.getBoundingClientRect();
    if (rect) {
      setOffset({
        ...rect,
        top: rect.top - 64,
        left: rect.left - 154,
        right: 80,
      });
    }
  }, []);

  useOnClickOutside(tooltipElm, () => {
    setOpen(false);
  });

  const { lang } = props;
  return (
    <div className="relative" style={{ display: "inline-block" }}>
      <span
        data-tip
        ref={elmref}
        onClick={() => {
          setOpen(!open);
        }}
      >
        <i className="fa fa-info-circle" />
      </span>
      {open && (
        <div
          ref={tooltipElm}
          className="tooltip-custom-top"
          style={{ top: offset.top, right: offset.right }}
        >
          <p>
            <span>{lang["tipCurrentBondValue"]}</span>
            <a
              style={{ color: "#fff" }}
              href="https://stockbook.vn/kenh-dau-tu/trai-phieu-doanh-nghiep"
              target={"_blank"}
            >
              {lang["here"]}
            </a>
          </p>
        </div>
      )}
    </div>
  );
};