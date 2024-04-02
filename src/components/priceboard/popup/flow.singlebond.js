import React, { useState } from "react";
import StartSingleBond from "./start.singlebond";
import ConfirmInfo from "./confirm.info";
import ContractConfirm from "./contract.confirm";
import SuccessRegistration from "./success.registration";
import RegisterCid from "./register.cid";

function FlowSingleBond(props) {
  const [flow, setFlow] = useState(props.step||'start')  
  const [dataContract, setDataContract] = useState(null);

  const handleClose = () => {
    props.handleClose && props.handleClose()
  }

  const reCallApi = () => {
    props.reCall && props.reCall()
  }

  const closeContract = () => {
    handleClose()
    window.location.reload()
  }
  return (
    <div id="popup-container" style={{zIndex:10}}>
      {flow === 'start' && <StartSingleBond onClose={() =>handleClose()} nextStep={(t)=>setFlow(t)} />}
      {flow === 'cid' && <RegisterCid onClose={() =>handleClose()}/>}
      {flow === 'info' &&
        <ConfirmInfo
          {...props}
          onClose={() => handleClose()}
          setData={setDataContract}
          nextStep={(t) => setFlow(t)}/>}
      {dataContract &&
        <ContractConfirm
          onClose={closeContract}
          data={dataContract}
          nextStep={() => {
            setFlow('success')
            setDataContract(null)
          }}
        />}
      {flow === 'success' &&
        <SuccessRegistration
        onClose={() => {
          handleClose()
          reCallApi()
        }} />}
    </div>
  )
}

export default FlowSingleBond