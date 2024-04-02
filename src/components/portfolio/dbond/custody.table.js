import React, { useState } from "react";
import DbondCodeCell from "./cell";
import { genLabelTypeBond, genNTypeBond } from "../../../helpers";
import ReactTooltip from "react-tooltip";

const CustodyTableDbond = (props) => {
  const { lang, custodyDeals, deals } = props;
  const [typeBond, setTypeBond] = useState(1);

  const mapStatus = (key) => {
    switch (key) {
      case "COMPLETED_LEG1":
        return lang["complete"];
      case "SETTLED":
        return lang["incomplete"];
      default:
        return lang["incomplete"];
    }
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h4 style={{ marginBottom: 0 }}>
        <span>{lang["poLabelCustodyDbond"]}</span>
        <span data-tip data-for="tip-custody-dbond" data-class="bottom-tooltip">
          <i className="fa fa-info-circle" style={{ marginLeft: "5px" }} />
        </span>
      </h4>
      <ReactTooltip id="tip-custody-dbond" effect="solid" place="bottom">
        <p>{lang["tipCustodyBond"]}</p>
      </ReactTooltip>
      <div
        className="csroll-table"
        style={{ overflowY: "hidden", overflowX: "auto" }}
      >
        <table className="portfolio-data" style={{ minWidth: "2070px" }}>
          <thead>
            <tr>
              <th style={{ width: 140, minWidth: 140 }}>
                <div className="bond-code">
                  <i
                    className="fa fa-caret-left pointer"
                    style={{ marginRight: "4px" }}
                    onClick={() => {
                      setTypeBond(genNTypeBond(typeBond - 1));
                    }}
                  />
                  <div style={{ display: "inline-block", minWidth: 84 }}>
                    {genLabelTypeBond(typeBond, lang)}
                  </div>
                  <i
                    className="fa fa-caret-right pointer"
                    style={{ marginLeft: "4px" }}
                    onClick={() => {
                      setTypeBond(genNTypeBond(typeBond + 1));
                    }}
                  />
                </div>
              </th>
              <th style={{ width: 100 }}>{lang["buyDate"]}</th>
              <th style={{ width: 150 }}>{lang["bondQuantity"]}</th>
              <th style={{ width: 150 }}>{lang["quantityBondAvailable"]}</th>
              <th style={{ width: 150 }}>{lang["totalValue"]}</th>
              <th
                style={{ width: 150 }}
              >{`${lang["interestRateEarn"]} ${lang["percentYear"]}`}</th>
              <th
                style={{ width: 100 }}
              >{`${lang["term"]} (${lang["day"]})`}</th>
              <th style={{ width: 150 }}>{lang["MaturityDate"]}</th>
              <th style={{ width: 180 }}>{lang["dividendExpected"]}</th>
              <th style={{ width: 180 }}>{lang["dividendToExpire"]}</th>
              <th style={{ width: 220 }}>{lang["cashPaybackToExpire"]}</th>
              <th style={{ width: 150 }}>{lang["profitCouponReceived"]}</th>
              <th style={{ width: 150 }}>{lang["statusCompleteFile"]}</th>
            </tr>
          </thead>
          <tbody>
            {custodyDeals &&
              custodyDeals.map((item, i) => {
                if (deals) {
                  const deal = deals.find((e) => e.deal_id == item.dealId);
                  return (
                    <tr key={i} id={`code_${deal?.bond_code}_${i}`}>
                      <td>
                        <DbondCodeCell
                          data={item}
                          deal={deal}
                          typeBond={typeBond}
                        />
                      </td>
                      <td>{item.tradingDate}</td>
                      <td className="tr pr-10">{item.quantity}</td>
                      <td className="tr pr-10">{item.tradeQuantity}</td>
                      <td className="tr pr-10">{item.buyValue}</td>
                      <td className="tr pr-10">{item.dealRate}</td>
                      <td className="tr pr-10">{item.term}</td>
                      <td className="tr pr-10">{item.maturityDate}</td>
                      <td className="tr pr-10">{item.currentInterest}</td>
                      <td className="tr pr-10">{item.maturityInterest}</td>
                      <td className="tr pr-10">{item.maturityValue}</td>
                      <td className="tr pr-10">{item.couponValue}</td>
                      <td>{mapStatus(item.status)}</td>
                    </tr>
                  );
                }
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustodyTableDbond;
