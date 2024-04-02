import React, { useEffect, useState } from "react";
import { getPorfolioDbondbyCustid, getCustIdAgreementTerms } from "../../clients/bond.api.client";
import { connect } from "react-redux";
import BeforePolicy from "../popup/before.policy";

function CheckPolicyNoti(props) {
  const [policy, setPolicy] = useState(false);

  const mapBond = products => {
    return products.reduce((pre, cur) => ({...pre, [cur.bond_code]: cur}),{})
  }
  useEffect(() => {
    if (props.fullProducts) {
      checkCustIdAgreementTerms()
    }
  }, [props.fullProducts]);
  
  const checkCustIdAgreementTerms = () => {
    getCustIdAgreementTerms().then(res => {
      const { data, status } = res;
      if (status === 200 && data && data.agreementBondTermFlag === '1') {
        return
      }
      checkPorfolioDbondbyCustid(props.fullProducts)
    })
  }

  const checkPorfolioDbondbyCustid = (fullProducts) => {
    getPorfolioDbondbyCustid().then(res => {
      if (res.data) {
        const objBond = mapBond(fullProducts);
        const { pageItems } = res.data;
        if (pageItems && pageItems.length > 0) {
          const count = pageItems.reduce((pre, cur) => {
            const detail = objBond[cur.symbol];
            return detail && detail.for_professional_investor ? pre+1 : pre
          }, 0)

          if (count > 0) {
            setPolicy(true)
          }
        }
      }
    })
  }
  return (
    <div>
      {policy && <BeforePolicy />}
    </div>
  )
}

const mapStateToProps = ({ bondStore }) => {
  return {
    bonds: bondStore.bonds,
    fullProducts: bondStore.fullProducts
  };
};

export default connect(mapStateToProps)(CheckPolicyNoti)