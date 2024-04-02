import React from "react";
import single from '../../../resource/images/singlebond2.png'
import { getIdentityStatus } from "../../../clients/bond.api.client";
import { displayNoti } from "../../../helpers";


function StartSingleBond(props) {
    
  const identityStatus = () => {
    getIdentityStatus().then(res => {
      const { data, status } = res;
      if (status == 204 || status == 400) {
        props.nextStep('info')
        return;
      }
      if (data && data[0]) {
        if (data[0].identityStatus == 'Đã phê duyệt') {
          props.nextStep('info')
        } else {
          props.nextStep('cid')
        }
      }
    }).catch(err => {
      displayNoti("Vui lòng thử lại")
    })
  }

  return (
    <div className="single-bond popup-set">
      <div className="tr">
        <i className="fa fa-2x fa-times pointer" aria-hidden="true" onClick={()=>props.onClose()} style={{color: '#606060'}}></i>
      </div>
      <div>
        <h4 className="title-single tc txt-upper">chưa đăng ký trái phiếu doanh nghiệp riêng lẻ</h4>
        <div className="tc" style={{marginBottom: 20}}>
          <img src={single} />
        </div>
        <p className="tc f-14">Đăng ký giao dịch trái phiếu doanh nghiệp riêng lẻ ngay với thủ tục nhanh chóng, hoàn toàn trực tuyến.</p>
        <div className="center-btn" style={{marginTop: 20}} >
          <button className="btn-register" onClick={()=>identityStatus()}>Đăng ký ngay</button>
        </div>
      </div> 
    </div>
  )
}

export default StartSingleBond