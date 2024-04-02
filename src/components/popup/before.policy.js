import React from "react";
import { browserHistory } from "react-router";

function BeforePolicy() {
  const getPathname = path => {
      if (path) return path.substring(1)
      return null
  }
  
  return (
    <div id="popup-container" style={{zIndex:10}}>
      <div className="popup-set before-policy">
        <div className="header-policy">
            <p className="txt-upper tc" style={{margin:0}}>CHÍNH SÁCH HỖ TRỢ KHÁCH HÀNG SẢN PHẨM DBOND</p>
        </div>
        <div className="content-policy">
            <p>Chính sách hỗ trợ của VNDIRECT đối với Khách hàng có Ngày Trả Lại trái phiếu theo Hợp Đồng DBOND ban đầu từ 04/10/2023 đến 31/10/2023 giúp Khách hàng có thể trả lại trái phiếu và hưởng chính sách tối ưu theo từng trường hợp.</p>
        </div>
        <div className="group-btn">
            <button className="btn-submit btn" onClick={()=>{browserHistory.push(`/thong-bao?redirect=${getPathname(window.location?.pathname)||'bang-gia'}`)}}>Xem chi tiết</button>
        </div>
      </div>
    </div>
  )
}

export default BeforePolicy;
