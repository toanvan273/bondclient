import React, { useEffect, useState } from "react";
import { getCustomerId, getRawToken } from "../../../services/auth.service";
import { registerOpenAccountSinglebond } from "../../../clients/bond.api.client";
import { displayNoti } from "../../../helpers";


function ContractConfirm(props) {
  const [data, setData] = useState(props.data)
 
  useEffect(() => {
    window.addEventListener('message', listendMessage)
    return () => {
      window.removeEventListener('message',listendMessage)
    }
  }, [])
  
  const handleCallEC = () => {
    const payload = {
      packageCode: 'SER000002',
      productCode: '03003001',
      openSource: 'MA',
      customerId:  getCustomerId()
    }
    registerOpenAccountSinglebond(payload).then(res => {
      const { data } = res;
      if (data && Object.keys(data).length > 0) {
        setData({...data})
      }else {
        displayNoti('Không lấy được thông tin hợp đồng','error')
      }
    }).catch(e => {
      if (e && e.response && e.response.data) {
        const { error, status } = e.response.data;
        displayNoti(`${error} (${status})`, "error");
      }
    })
  }

  const listendMessage = e => {
    const { status } = e.data;
    switch (status) {
      case 'Success':
        props.nextStep()
      break;
      case 'Fail':
          props.onClose()
      break;
      case 'Unauthorized':
        displayNoti("Hết phiên làm việc", "error");
      break;
      case 'Renew':
        handleCallEC()
      break;
      case 'Cancel':
        props.onClose()
      break;
      default:
      break;
    }
  }

  const token = '&tokenId='+getRawToken()
  return (
      <div className="confirm-buy-bond popup-set">
          <div style={{height: '100%'}}
          dangerouslySetInnerHTML={{
              __html: `<iframe src=${data?.linkToSign+token} allow='clipboard-read; clipboard-write' />`,
          }}
      ></div>
    </div>
  )
}

export default ContractConfirm