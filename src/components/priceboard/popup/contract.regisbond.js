import React, { useEffect } from "react";
import { displayNoti } from "../../../helpers";
import { getRawToken } from "../../../services/auth.service";

function ContractRegisSingleBond(props) {
    
  useEffect(() => {
    window.addEventListener('message', listendMessage)
    return () => {
      window.removeEventListener('message',listendMessage)
    }
  }, [])

  const listendMessage = e => {
    const { status } = e.data;
    switch (status) {
      case 'Success':
        props.onClose()
      break;
      case 'Fail':
          props.onClose()
      break;
      case 'Unauthorized':
        displayNoti("Hết phiên làm việc", "error");
      break;
      case 'Renew':
      break;
      case 'Cancel':
        props.onClose()
      break;
      default:
      break;
    }
  }

  return (
    <div id="popup-container" style={{zIndex:10}}>
      <div className="confirm-buy-bond popup-set">
        {props.linkToSign? 
        <div style={{height: '100%'}}
          dangerouslySetInnerHTML={{
            __html: `<iframe src=${props.linkToSign+'&tokenId='+getRawToken()} allow='clipboard-read; clipboard-write' />`,
          }}></div>
          :
          <div className="tr">
            <i className="fa fa-2x fa-times pointer" aria-hidden="true" onClick={()=>props.onClose()} style={{color: '#606060'}}></i>
          </div>
          }
      </div>
    </div>
  )
}

export default ContractRegisSingleBond