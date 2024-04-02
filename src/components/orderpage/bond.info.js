import React, { useEffect, useState } from 'react';
import moment from 'moment'
import "react-datepicker/dist/react-datepicker.css";
import numeral from 'numeral';
import { nameTypebond, mapStatusProInvest, checkTypebond } from '../../helpers';
import Coupon from './coupon';
import { getBondPricing } from '../../clients/bond.api.client';


function BondInfo(props) {
  const [priceBondSell, setPriceBondSell] = useState(null)
  const [priceBondBuy, setPriceBondBuy] = useState(null)

  useEffect(() => {
    if (props.bondInfo) {
      handleGetPricing(props.bondInfo)
    }
  },[props.bondInfo])

  function handleGetPricing(bondInfo) {
    let typeBond = checkTypebond(bondInfo)
    if (typeBond === 'v-bond') { // vbond: lấy giá chào bán/mua của Vndirect
      _getBondPricing(bondInfo, 'NB')
      _getBondPricing(bondInfo, 'NS')
    }
  }

  const _getBondPricing = async (bond, side) => {
    getBondPricing(bond, side).then(res => {
      const { data } = res
      if (side === 'NB') {
        setPriceBondSell(data.price)
      } else {
        setPriceBondBuy(data.price)
      }
    })
  }
  const genOriginalBond = (coupon, bond_code) => {
    if (coupon && coupon.originalPaperCode) return coupon.originalPaperCode;
    return bond_code;
  };

  const { bond_detail, lang, bondInfo, coupon } = props;
  const typeBond = checkTypebond(bondInfo);
  return (
    <div className="right-block">
      <table className="trade-table">
        <colgroup>
          <col width="40%"></col>
          <col width="60%"></col>
        </colgroup>
        <thead>
          <tr>
            <th className="text-l t-gray">{lang["bondType"]}</th>
            <th className="text-l txt-bold">
              {bondInfo && nameTypebond(bondInfo)}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-l t-gray">{lang["Issuer"]}</td>
            <td className="text-l txt-bold">
              {bond_detail && bond_detail.issuer}
            </td>
          </tr>
          <tr>
            <td className="text-l t-gray">{lang["bondCode"]}</td>
            <td className="text-l txt-bold">
              {bondInfo && bondInfo.bond_code}
            </td>
          </tr>
          <tr>
            <td className="text-l t-gray">{lang["originalBond"]}</td>
            <td className="text-l txt-bold">
              {bondInfo && (
                <span>{genOriginalBond(coupon, bondInfo.bond_code)}</span>
              )}
            </td>
          </tr>
          <tr>
            <td className="text-l t-gray">{lang["IssueDate"]}</td>
            <td className="text-l txt-bold">
              {bond_detail &&
                moment(bond_detail.issue_date).format("DD/MM/YYYY")}
            </td>
          </tr>
          <tr>
            <td className="text-l t-gray">{lang["MaturityDate"]}</td>
            <td className="text-l txt-bold">
              {bond_detail &&
                moment(bond_detail.maturity_date).format("DD/MM/YYYY")}
            </td>
          </tr>
          <tr>
            <td className="text-l t-gray">{lang["forProInvestor"]}</td>
            <td className="text-l txt-bold">
              {bondInfo &&
                mapStatusProInvest(bondInfo.for_professional_investor, lang)}
            </td>
          </tr>
          <tr>
            <td className="text-l t-gray">{lang["ParValue"]}</td>
            <td className="text-l txt-bold">
              {bondInfo && bond_detail && (
                <span>
                  {numeral(bond_detail.par_value).format("0,0")}{" "}
                  {lang["currency"]}
                </span>
              )}
            </td>
          </tr>
          <tr>
            <td className="text-l t-gray">Coupon</td>
            <td className="text-l bold">
              {coupon && <Coupon lang={lang} data={coupon} />}
            </td>
          </tr>
          <tr>
            <td className="text-l t-gray">{lang["couponFrequency"]}</td>
            <td className="text-l txt-bold">
              {bondInfo && bond_detail && (
                <span>
                  {bond_detail.bond_paid_int_period_year} {lang["timesPerYear"]}
                </span>
              )}
            </td>
          </tr>
          {typeBond === "v-bond" && (
            <tr>
              <td className="text-l t-gray">{lang["yieldMaturity"]}</td>
              <td className="text-l txt-bold">
                {bondInfo && bondInfo.yield}%/{lang["year"]}
              </td>
            </tr>
          )}
          {typeBond === "v-bond" && (
            <tr>
              <td className="text-l t-gray">{lang["sellPrice"]}</td>
              <td className="text-l txt-bold">
                {priceBondSell && numeral(priceBondSell).format(0, 0)}{" "}
                {lang["currency"]}
              </td>
            </tr>
          )}
          {typeBond === "v-bond" && (
            <tr>
              <td className="text-l t-gray">{lang["buyPrice"]}</td>
              <td className="text-l txt-bold">
                {priceBondBuy && numeral(priceBondBuy).format(0, 0)}{" "}
                {lang["currency"]}
              </td>
            </tr>
          )}
          <tr>
            <td className="text-l t-gray">{lang["minBalance"]}</td>
            <td className="text-l txt-bold">
              {bondInfo && (
                <span>
                  {numeral(bondInfo.min_balance).format(0, 0)}{" "}
                  {lang["bondUnit"]}
                </span>
              )}
            </td>
          </tr>

          <tr>
            <td className="text-l t-gray">{lang["maxBalance"]}</td>
            <td className="text-l txt-bold">
              {bondInfo && (
                <span>
                  {bondInfo.max_balance
                    ? numeral(bondInfo.max_balance).format(0, 0)
                    : "-"}{" "}
                  {lang["bondUnit"]}
                </span>
              )}
            </td>
          </tr>

          <tr>
            <td className="text-l t-gray">{lang["brochure"]}</td>
            <td className="text-l txt-bold">
              {bondInfo && (
                <span>
                  {!bondInfo.brochure ? (
                    <span>{lang["pending"]}</span>
                  ) : (
                    <a
                      className="anoffer"
                      href={bondInfo.brochure}
                      target="_blank"
                    >
                      <u>{lang["here"]}</u>
                    </a>
                  )}
                </span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default BondInfo;