import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import BondInfo from "../orderpage/bond.info";
import {
  getBondInfo,
  getDetailOrder,
  getCoupon,
} from "../../clients/bond.api.client";
import * as types from '../../constants/action.types';
import ContractBondPopup from "../popup/contract.bond";
import ConfirmBuyBond from "../popup/confirm.buybond";
import { useStateCallback } from "../../common/hook";
import ConfirmContract from "./confirm.contract";

function OrderDetailPagev2(props) {
  const [orderInfo, setOrderInfo] = useStateCallback({})
  const [bondInfo, setBondInfo] = useState(null)
  const [coupon, setCoupon] = useState(null)

  useEffect(() => {
    const { params } = props;
    if (params && params.accountNo) {
      _getDetailOrder(params.accountNo, params.procInstId);
    }
  },[props])

  const _getDetailOrder = (accountNo, procInstId) => {
    getDetailOrder(accountNo, procInstId).then((res) => {
      if (res.data && res.data.length > 0) {
        setOrderInfo(res.data[0], state => {
          const {productType,bondCode} = state;
          if (productType && bondCode) {
            _getBondInfo(productType, bondCode);
            _getCoupon(bondCode);
          }
        })
      }
    });
  };

  const _getBondInfo = (product_type, bond_code) => {
    getBondInfo(product_type, bond_code).then((res) => {
      if (res && res.data) {
        setBondInfo(res.data)
      }
    });
  };

  const _getCoupon = (bondcode) => {
    getCoupon(bondcode).then((res) => {
      if (res.data) {
        setCoupon(res.data)
      }
    });
  };

  const onClosePopup = () => {
    props.dispatch({
        type: types.CLOSE_POPUP
    })
  }
  
  const { lang, bonds, popup } = props;
  let langLocal = localStorage.getItem("lang")
      ? localStorage.getItem("lang")
    : "vi";
  let bond_detail;
  if (bonds) {
    bond_detail = bonds[orderInfo.bondCode];
  }
  
  return (
    <div className="set-order-page">
      <div className="header-block txt-upper">
        <h1>
          {lang["confirmOrder"]}
          {` - ${orderInfo.bondCode}`}
          {` - ${orderInfo.procInstNumber}`}
        </h1>
      </div>
      <div className="info-order">
        <ConfirmContract
          {...props}
          orderInfo={orderInfo}
          setOrderInfo={setOrderInfo}
          bondInfo={bondInfo}
          setBondInfo={setBondInfo}
        />
        {/* right */}
        <BondInfo
          lang={lang}
          bond_detail={bond_detail}
          coupon={coupon}
          bondInfo={bondInfo}
        />
      </div>
      {popup.status && (
        <div id="popup-container">
          {popup.type === "confirm-buy-bond" && (
            <ConfirmBuyBond {...popup} {...props} onClose={onClosePopup} />
          )}
          {popup.type === "contract-bond" && (
            <ContractBondPopup {...popup} {...props} onClose={onClosePopup} />
          )}
        </div>
      )}
    </div>
  );
}

const mapStateToProps = ({ bondStore, popupStore }) => {
  return {
    bonds: bondStore.bonds,
    products: bondStore.products,
    mapProducts: bondStore.mapProducts,
    rates: bondStore.rates,
    popup: popupStore,
  };
};


export default connect(mapStateToProps)(OrderDetailPagev2)