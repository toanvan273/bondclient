import React, { useMemo } from "react";
import trans from '../../resource/images/trans.png'
import moment from "moment";

function TransferLimitation(props) {
  const { data, funCallBack, typeDoc, product_type = 'FIX' } = props.popup;
  const langLocal = localStorage.getItem("lang")
    ? localStorage.getItem("lang")
    : "vi";
  const content = useMemo(() => {
    if (data && product_type) {
      const reason = langLocal === "vi" ? data.reason_vn : data.reason_eng;
      switch (product_type) {
        case "OUTRIGHT":
          return `Từ ngày ${moment(data?.start_date, "YYYY-MM-DD").format(
            "DD/MM/YYYY"
          )} trái phiếu ${reason}. VNDIRECT sẽ thông báo thời điểm trái phiếu giao dịch trở lại để Quý khách chủ động đặt lệnh bán trái phiếu. Quý khách muốn tiếp tục giao dịch?`;
        case "FIX":
          return `Từ ngày ${moment(data?.start_date, "YYYY-MM-DD").format(
            "DD/MM/YYYY"
          )} trái phiếu sẽ ${reason}. VNDIRECT sẽ thông báo thời điểm trái phiếu giao dịch trở lại để Quý khách chủ động đặt lệnh bán trái phiếu. Quý khách hưởng lãi suất theo hợp đồng DBOND đến ngày đầu tiên trái phiếu giao dịch trở lại hoặc áp dụng thêm chính sách hỗ trợ của VNDIRECT theo từng thời kỳ. Quý khách muốn tiếp tục giao dịch?`;
        default:
          return "";
      }
    }
  }, [data, product_type]);

  return (
    <div className="popup-set transfer-limitation">
      <div className="logo">
        <img src={trans} />
      </div>
      <div className="title">
        <h4>THÔNG BÁO HẠN CHẾ CHUYỂN NHƯỢNG</h4>
      </div>
      <div className="content" style={{minHeight: 100}}>
        <p>{content}</p>
      </div>
      {typeDoc ?
        <div className="group-btn" style={{marginTop: 25}}>
          <button className="btn-back" onClick={()=>{props.onClose()}}>ĐÓNG</button>
        </div>
        :
      <div className="group-btn">
        <button className="btn-back" onClick={()=>{props.onClose()}}>HỦY BỎ</button>
        <button className="btn-submit"
          onClick={() => {
            funCallBack && funCallBack()
            props.onClose()
        }}>TIẾP TỤC</button>
      </div>
    }
    </div>
  )
}

export default TransferLimitation