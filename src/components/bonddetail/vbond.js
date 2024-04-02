import numeral from "numeral";
import { covertDatebyString, isBusinessCustomer, mapStatusProInvest } from "../../helpers";
import Coupon from "../orderpage/coupon";


function VBondDetail({bond_ex, coupon, accounts, authInfo, lang }) {
    
  const getRequestOpenAccSinglebond = () => {
    checkRequestOpenAccSinglebond().then(res => {
      if (res.data) {
        const pendingAccount = res.data.find(e => e.status === 'PENDING' || e.status === 'CONFIRMED')
        if (pendingAccount) {
          setStatusAccountRegisBond({...pendingAccount})
        } else {
          fetchAccountforProInvestor()
        }
      }
    }).catch(err=>console.log({err}))
  }
  
  const handleCheckBuyForProInvestor = (bond) => {
    const { bonds } = props
    const detailBond = bonds[bond.bond_code];
    if (detailBond && detailBond.custodyCenter == '003') {
      getRequestOpenAccSinglebond()
    } else {
      check2AuthBeforeRedirect(`/dat-mua/${bond.bond_code}/${bond.product_type}`)
    }
  }
  

  return (
    <div className="info-block">
      <div className="header-block">
        <h1 className="info-header txt-upper">
          {lang["bondCodeShort"]} {coupon && " - " + coupon.otherName}
        </h1>
      </div>
      {isBusinessCustomer(accounts) && (
        <div
          className="warning65"
          style={{ marginTop: 0, marginLeft: 85, marginRight: 85 }}
        >
          <img src={wa} />
          <span style={{ marginLeft: "5px" }}>
            {lang["businessCustomerNote"]}
          </span>
        </div>
      )}
      {bond_ex.for_professional_investor && !authInfo.isProInvestor && (
        <div className="proinvest-status">
          <div className="bound">
            <img src={wa} />
            <span className="detail">
              {lang["normalInvestor"]}
            </span>
          </div>
        </div>
      )}
      <section className="info-trade">
        <table className="trade-table">
          <colgroup>
            <col width="40%" />
            <col width="60%" />
          </colgroup>
          <thead>
            <tr>
              <th className="text-l t-gray">{lang["bondType"]}</th>
              <th className="text-l txt-bold">VBond</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-l t-gray">{lang["bondCode"]}</td>
              <td className="text-l txt-bold">{bond.bond_code}</td>
            </tr>
            <tr>
              <td className="text-l t-gray">{lang["Issuer"]}</td>
              <td className="text-l txt-bold">{bond.issuer}</td>
            </tr>
            <tr>
              <td className="text-l t-gray">{lang["IssueDate"]}</td>
              <td className="text-l txt-bold">
                {covertDatebyString(
                  bond.issue_date,
                  "YYYY-MM-DD",
                  "DD/MM/YYYY"
                )}
              </td>
            </tr>
            <tr>
              <td className="text-l t-gray">{lang["MaturityDate"]}</td>
              <td className="text-l txt-bold">
                {covertDatebyString(
                  bond.maturity_date,
                  "YYYY-MM-DD",
                  "DD/MM/YYYY"
                )}
              </td>
            </tr>
            <tr>
              <td className="text-l t-gray">{lang["forProInvestor"]}</td>
              <td className="text-l txt-bold">
                {mapStatusProInvest(
                  bond_ex.for_professional_investor,
                  lang
                )}
              </td>
            </tr>
            <tr>
              <td className="text-l t-gray">{lang["Mệnh giá"]}</td>
              <td className="text-l txt-bold">
                {numeral(bond.par_value).format(0, 0)} {lang["currency"]}
              </td>
            </tr>
            <tr>
              <td className="text-l t-gray">Coupon</td>
              <td className="text-l txt-bold">
                {coupon && <Coupon data={coupon} lang={lang} />}
              </td>
            </tr>
            <tr>
              <td className="text-l t-gray">{lang["couponFrequency"]}</td>
              <td className="text-l txt-bold">
                {bond.bond_paid_int_period_year} {lang["timesPerYear"]}
              </td>
            </tr>
            <tr>
              <td className="text-l t-gray">{lang["yieldMaturity"]}</td>
              <td className="text-l txt-bold">
                {bond_ex.yield}%/{lang["year"]}
              </td>
            </tr>
            <tr>
              <td className="text-l t-gray">{lang["sellPrice"]}</td>
              <td className="text-l txt-bold">
                {vbondPriceSell &&
                  numeral(vbondPriceSell).format(0, 0)}{" "}
                {lang["currency"]}
              </td>
            </tr>
            <tr>
              <td className="text-l t-gray">{lang["buyPrice"]}</td>

              <td className="text-l txt-bold">
                {vbondPriceBuy && numeral(vbondPriceBuy).format(0, 0)}{" "}
                {lang["currency"]}
              </td>
            </tr>
            <tr>
              <td className="text-l t-gray">{lang["minBalance"]}</td>
              <td className="text-l txt-bold">
                {bond_ex.min_balance &&
                  numeral(bond_ex.min_balance).format(0, 0)}{" "}
                {lang["bondUnit"]}
              </td>
            </tr>
            <tr>
              <td className="text-l t-gray">{lang["maxBalance"]}</td>
              <td className="text-l txt-bold">
                {bond_ex.max_balance &&
                  numeral(bond_ex.max_balance).format(0, 0)}{" "}
                {lang["bondUnit"]}
              </td>
            </tr>
            <tr>
              <td className="text-l t-gray">{lang["brochure"]}</td>
              <td className="text-l txt-bold">
                {!bond_ex.brochure ? (
                  <span>{lang["pending"]}</span>
                ) : (
                  <a
                    className="anoffer"
                    href={bond_ex.brochure}
                    target="_blank"
                  >
                    <u>{lang["here"]}</u>
                  </a>
                )}
              </td>
            </tr>
          </tbody>
        </table>
        {bond_ex.display_protrade &&
        <div>
        {bond_ex.for_professional_investor ? (
          <div>
            <div className="btn-group">
              {authInfo.isProInvestor && 
                <button
                  style={{marginRight:10}}
                    onClick={() => handleCheckBuyForProInvestor(bond)}
                      className="btn-buy txt-upper">
                      {lang['buy']}
                </button>}

              <button
                onClick={() =>
                  check2AuthBeforeRedirect(
                    `/dat-ban/${bond.bond_code}/${product_type}`
                  )
                }
                className="btn-sell txt-upper"
              >
                {lang["sell"]}
              </button>
            </div>
          </div>
        ) : (
          <div className="btn-group">
            <button
              onClick={() =>
                check2AuthBeforeRedirect(
                  `/dat-mua/${bond.bond_code}/${product_type}`
                )
              }
              className="btn-buy txt-upper"
            >
              {lang["buy"]}
            </button>
            <button
              style={{ marginLeft: 10 }}
              onClick={() =>
                check2AuthBeforeRedirect(
                  `/dat-ban/${bond.bond_code}/${product_type}`
                )
              }
              className="btn-sell txt-upper"
            >
              {lang["sell"]}
            </button>
          </div>
        )} </div>}
        <p className="tc">
          <u className="pointer" onClick={handleBack}>
            {lang["Back"]}
          </u>
        </p>
      </section>
    </div>
  )
}

export default VBondDetail;