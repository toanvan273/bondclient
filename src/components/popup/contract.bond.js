import React, { useEffect, useState } from "react";
import { getResultDeal } from "../../clients/bond.api.client";
import { displayNoti } from "../../helpers";
import { parseErrorMessage } from "../../modules/error_parser/error.parser.v2";
import { getRawToken } from "../../services/auth.service";

function ContractBondPopup(props) {
  const [pending, setPending] = useState(false)

  useEffect(() => {
    window.addEventListener('message', listendMessage)
    return () => {
      window.removeEventListener('message',listendMessage)
    }
  },[])
  const listendMessage = e => {
    const { status } = e.data;
    switch (status) {
      case 'Success':
      setPending(true)
      setTimeout(() => {
          const { data } = props
          _getResultDeal(data.accountNo, data.procInstId)
      },2000)
      break;
      case 'Fail':
          props.onClose()
      break;
      case 'Unauthorized':
          displayNoti('Hết phiên đăng nhập, vui lòng đăng nhập lại')
      break;
      case 'Renew':
          props.onClose()
          props.funCallBack('reopen')
      break;
      case 'Cancel':
          props.funCallBack('recall')
          props.onClose()
      break;
      default:
      break;
    }
  }

  const  _getResultDeal = (accountNo, procInstId) => {
    getResultDeal(accountNo, procInstId).then(res => {
      if (res.data) {
        const { status, description } = res.data;
        const { lang } = props;
        switch (status) {
          case 'WAITING_E_CONTRACT_RESPONSE':
          case 'CREATING_DEAL':
            displayNoti('Hệ thống đang xử lý. Vui lòng kiểm tra Sổ lệnh sau ít phút.')
            props.onClose()
            break
          case 'CREATE_DEAL_SUCCESS':
            props.router.push({
              pathname: '/so-lenh',
              search: `?accountNo=${accountNo}`
            });
            break
          case 'CREATE_DEAL_ERROR':
            const nerr = parseErrorMessage(description) || description.message
            displayNoti(`${lang['error1']} ${nerr}`, "error");
            props.router.push('/xac-nhan-lenh');
            props.onClose();
            break
          case 'UNDEFINED':
            displayNoti('Có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại hoặc gọi tới số 1900_54_54_09 để được hỗ trợ.', 'error')
            props.onClose()
            break
          case 'EXPIRED':
            displayNoti('Yêu cầu đã hết hạn. Quý khách vui lòng thử lại.')
            props.onClose()
            break
          default:
            break;
        }
      }
    }).catch(e => {
      if (e && e.response && e.response.data) {
          displayNoti(parseErrorMessage(e.response.data), 'error')
      }
    })
  }


  const { data } = props;
  const theme = localStorage.getItem('bond_theme') ? `&mode=${localStorage.getItem('bond_theme')}`:''
  const url = data.urlPageSign + theme + '&tokenId=' + getRawToken();
  
  return (
    <div className="popup-read-contract popup-set">
      {pending ?
          <div className="tc">
              <h3>Yêu cầu đang được thực hiện.</h3>
              <i className="fa fa-spin fa-spinner" />
          </div>
          :
      <div style={{height: '100%'}}
          dangerouslySetInnerHTML={{
              __html: `<iframe src=${url} allow='clipboard-read; clipboard-write' />`,
          }}
      ></div>}
    </div>
  )
}

export default ContractBondPopup