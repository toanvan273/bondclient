import React from "react";
import warning from '../../../resource/images/warning1.png'

function RegisterCid(props) {
  
  const handleRouteToRegisterCid = () => {
    window.changeURL("/quan-ly-tai-khoan/xac-thuc-CMND");
    props.onClose()
  }

  return (
    <div className="confirm-identify popup-set">
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '-50px',
        transform: 'translate(-50%,0)'
      }}>
        <img src={warning} />
      </div>
      <div className="tr">
        <i className="fa fa-2x fa-times pointer" aria-hidden="true" onClick={()=>props.onClose()} style={{color: '#606060'}}></i>
      </div>
      <div className="content-modal">
        <h4 className="title-single tc" style={{ fontWeight: 500,fontSize: 18, color: '#fff' }}>XÁC THỰC CMND/CCCD</h4>
        <div className="tc">
          <p style={{fontSize: 14}}>Trước khi tạo tài khoản giao dịch trái phiếu phát hành phát hành riêng lẻ, Quý khách cần xác thực CMND/CCCD.</p>
        </div>
        <div className="center-btn" style={{ marginTop: 40 }} >
            <button className="btn-close" style={{marginRight: 14}} onClick={()=>props.onClose()}>Để sau</button>                  
            <button className="btn-register" onClick={()=>handleRouteToRegisterCid()}>Xác thực ngay</button>
        </div>
      </div>
    </div>
  )
}

export default RegisterCid