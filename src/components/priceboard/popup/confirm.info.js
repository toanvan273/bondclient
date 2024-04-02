import React, { useEffect, useState } from "react";
import {
  getAccountInfo,
  registerOpenAccountSinglebond,
} from "../../../clients/bond.api.client";
import { getCustomerId } from "../../../services/auth.service";
import { displayNoti } from "../../../helpers";
import moment from "moment";

function ConfirmInfo(props) {
  const [info, setInfo] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetchAccountInfo();
  }, []);

  const fetchAccountInfo = () => {
    getAccountInfo().then((res) => {
      if (res.data) {
        setInfo(res.data);
      }
    });
  };

  const typeCustomer = (cusId) => {
    if (cusId.startsWith("021C")) return "Cá nhân trong nước";
    if (cusId.startsWith("021F")) return "Cá nhân nước ngoài";
    return "";
  };

  const handleConfirm = () => {
    const payload = {
      packageCode: "SER000002",
      productCode: "03003001",
      openSource: "MA",
      customerId: info?.customerId || getCustomerId(),
    };
    setPending(true);
    registerOpenAccountSinglebond(payload)
      .then((res) => {
        const { data } = res;
        if (data && Object.keys(data).length > 0) {
          props.setData({ ...data });
        } else {
          displayNoti("Không lấy được thông tin hợp đồng", "error");
        }
      })
      .catch((e) => {
        if (e && e.response && e.response.data) {
          const { error, status, message } = e.response.data;
          displayNoti(`${message || status} (${error})`, "error");
        }
      })
      .finally(() => {
        setPending(false);
      });
  };

  return (
    <div className="single-bond popup-set">
      <div className="tr">
        <i
          className="fa fa-2x fa-times pointer"
          aria-hidden="true"
          onClick={() => props.onClose()}
          style={{ color: "#606060" }}
        ></i>
      </div>

      <div>
        <h4 className="title-single txt-upper tc">
          Xác nhận thông tin đăng ký
        </h4>
        {info ? (
          <div>
            <table className="trade-table">
              <colgroup>
                <col width="50%" />
                <col width="50%" />
              </colgroup>
              <tbody>
                <tr>
                  <td className="tl ps-10">Số TK lưu KÝ</td>
                  <td className="tl ps-10 fw-600">{info.custodyId}</td>
                </tr>
                <tr>
                  <td className="tl ps-10">Họ và tên</td>
                  <td className="tl ps-10 fw-600">{info.fullName}</td>
                </tr>
                <tr>
                  <td className="tl ps-10">CMND/CCCD</td>
                  <td className="tl ps-10 fw-600">{info.identityNo}</td>
                </tr>
                <tr>
                  <td className="tl ps-10">Ngày cấp</td>
                  <td className="tl ps-10 fw-600">
                    {moment(moment(info.issueDate, "YYYY-MM-DD")).format(
                      "DD-MM-YYYY"
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="tl ps-10">Nơi cấp</td>
                  <td className="tl ps-10 fw-600">{info.issuePlace}</td>
                </tr>
                <tr>
                  <td className="tl ps-10">Loại hình khách hàng</td>
                  <td className="tl ps-10 fw-600">
                    {typeCustomer(info.custodyId)}
                  </td>
                </tr>
                {props.authInfo?.isProInvestor ? (
                  <tr>
                    <td className="tl ps-10">Loại hình nhà đầu tư</td>
                    <td className="tl ps-10 fw-600">
                      Nhà đầu tư Chuyên nghiệp
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td className="tl ps-10">Loại hình nhà đầu tư</td>
                    <td className="tl ps-10 fw-600">Nhà đầu tư thường</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="center-btn" style={{ marginTop: 30 }}>
              <div>
                <button
                  className="btn-register"
                  onClick={() => handleConfirm()}
                >
                  {pending ? (
                    <i className="fa fa-spin fa-spinner" />
                  ) : (
                    <span>Xác nhận</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>Không có dữ liệu</div>
        )}
        <div style={{ marginTop: 10 }} className="center-btn">
          <u onClick={() => props.nextStep("start")} className="pointer">
            Quay lại
          </u>
        </div>
      </div>
    </div>
  );
}

export default ConfirmInfo;
