import React from "react";
import trans from "../../resource/images/trans.png";
import moment from "moment";

function NotiDayTransaction(props) {
  const { data } = props.popup;

  return (
    <div
      className="popup-set transfer-limitation"
      style={{ height: 250, width: 460 }}
    >
      <div className="logo">
        <img src={trans} />
      </div>
      <div className="title">
        <h4>THÔNG BÁO</h4>
      </div>
      <div className="content" style={{ textAlign: "center" }}>
        <p>
          Quý khách đã đăng ký mở tài khoản giao dịch Trái phiếu riêng lẻ thành
          công. Quý khách có thể bắt đầu giao dịch từ ngày{" "}
          {data.effectivePinvDate
            ? moment(data.effectivePinvDate, "YYYY-MM-DD").format("DD/MM/YYYY")
            : ""}
        </p>
      </div>
      <div className="group-btn" style={{ marginTop: 25 }}>
        <button
          className="btn-back"
          onClick={() => {
            props.onClose();
          }}
        >
          ĐÓNG
        </button>
      </div>
    </div>
  );
}

export default NotiDayTransaction;
