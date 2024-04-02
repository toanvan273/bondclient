import React, { useState } from "react";
import single from '../../../resource/images/singlebond2.png'
import ContractRegisSingleBond from "./contract.regisbond";
import { cancelRequestOpenAccSingleBond } from "../../../clients/bond.api.client";
import { displayNoti } from "../../../helpers";

function StatusAccountRegistration(props) {
  const [type, setType] = useState('ask')

  const handleCancel = () => {
    cancelRequestOpenAccSingleBond(props.id).then(res => {
      displayNoti('Hủy yêu câu thành công')
      props.onClose()
    }).catch(e => {
      if (e && e.response && e.response.data) {
        const { error, status } = e.response.data;
        displayNoti(`${error} (${status})`, "error");
      }
    })
  }

  return (
    <div id="popup-container" style={{ zIndex: 10 }}>
      {type === 'ask' && 
        <div className="single-bond popup-set">
          <div className="tr">
              <i className="fa fa-2x fa-times pointer" aria-hidden="true" onClick={()=>props.onClose()} style={{color: '#606060'}}></i>
          </div>
          <div>
            <h2 className="txt-upper anoffer" style={{fontWeight:600, textAlign:'center'}}>Chưa hoàn tất đăng ký giao dịch</h2>
            <div className="tc">
              <img src={single} />
            </div>
            <p style={{fontSize: 14, textAlign:'center'}}>Quý khách vui lòng hoàn tất đăng ký giao dịch trái phiếu doanh nghiệp riêng lẻ để tiếp tục</p>
            <div className="center-btn" style={{ marginTop: 40 }} >
              <button className="btn-close" onClick={handleCancel} style={{marginRight: 10, cursor: 'pointer'}} >Hủy</button>
              <button className="btn-register" style={{cursor: 'pointer'}} onClick={()=>setType('contract')}>Hoàn tất ngay</button>
            </div>
          </div>
        </div>
      }
      {type === 'contract' && 
        <ContractRegisSingleBond {...props} onClose={()=>props.onClose()}  />
      } 
    </div>
  )
}

export default StatusAccountRegistration