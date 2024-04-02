import React from "react";
import single from '../../../resource/images/singlebond.png'

function SuccessRegistration(props) {
  const goToPriboard = () => {
    window.changeURL("/thap-tai-san/bond/bang-gia?type=dbond");
    props.onClose()
  }

  return (
    <div className="single-bond popup-set">
      <div className="tr">
        <i className="fa fa-2x fa-times pointer" aria-hidden="true" onClick={()=>props.onClose()} style={{color: '#606060'}}></i>
      </div>
      <div style={{padding: '0 40px'}}>
        <h4 className="title-single tc txt-upper">Đăng ký thành công - Chờ VSD kích hoạt</h4>
        <div className="tc">
          <img src={single} />
        </div>
        <p style={{marginTop: 20, marginBottom: 5}} className="tc f-14">Chúng tôi đã gửi thông tin đăng ký giao dịch trái phiếu doanh nghiệp riêng lẻ của Quý khách lên Trung tâm Lưu ký Chứng khoán Việt Nam (VSD). Có thể mất tới 24h để kích hoạt tài khoản và giao dịch trái phiếu doanh nghiệp riêng lẻ trên các nền tảng của VNDIRECT.</p>
        <div className="center-btn" style={{marginTop: 20}} >
          <button className="btn-register" onClick={goToPriboard}>Đã hiểu</button>
        </div>
      </div>
    </div>
  )
}

export default SuccessRegistration