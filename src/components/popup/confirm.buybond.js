import React from "react";
import { logUserbond } from "../../clients/bond.api.client";


function ConfirmBuyBond(props) {
  const handleSubmit = () => {
    logUserbond().then(res => {
      if (res.data) {
        props.funCallBack('ok')
        props.onClose()
      }
    })
  }

  const handleClose = () => {
    props.onClose()
  }

  const { data } = props;

  return (
    <div className="confirm-buy-bond popup-set">
    <div className="header-title">
        <h1>XÁC NHẬN ĐỦ ĐIỀU KIỆN MUA TRÁI PHIẾU</h1>
    </div>
    <div className="contract-zone">
      <embed style={{width: '98%', margin: '0 auto'}} src={`data:application/pdf;base64,${data}`} />
    </div>
    <div className="btn-group">
        <button className="btn btn-backall txt-upper" onClick={handleClose} >QUAY LẠI</button>
    <button className="btn btn-primary" onClick={handleSubmit}>XÁC NHẬN</button>
      </div>
  </div>
  )
}

export default ConfirmBuyBond;
