import React, { useState } from "react";
import { genLabelTypeBond, genNTypeBond } from "../../../helpers";
import VbondCodeCell from "./cell";
import { Tooltip } from "./table";
import ReactTooltip from "react-tooltip";

function CustodyTableVbond(props) {
  const [typeBond, setTypeBond] = useState(1);

  const { lang, data, portfolios } = props;

  return (
    <div style={{ marginTop: 30 }}>
      <h4 style={{ marginBottom: 0 }}>
        <span>{lang["poLabelCustodyVbond"]}</span>
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
        <table className="portfolio-data" style={{ minWidth: "1260px" }}>
          <thead>
            <tr>
              <th style={{ width: 140 }}>
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
              <th style={{ width: 150 }}>{lang["bondQuantity"]}</th>
              <th style={{ width: 150 }}>{lang["quantityBondAvailable"]}</th>
              <th style={{ width: 150 }}>{lang["averageBuyPrice"]}</th>
              <th style={{ width: 150 }}>{lang["totalValue"]}</th>
              <th
                style={{ width: 200 }}
              >{`${lang["interestBondCoupon"]} ${lang["percentYear"]}`}</th>
              <th style={{ width: 120 }}>{lang["MaturityDate"]}</th>
              <th style={{ width: 200 }}>
                <div>
                  <span style={{ marginRight: "4px" }}>
                    {lang["currentBondValue"]}
                  </span>
                  <Tooltip {...props} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((item, i) => {
                const portfolio =
                  portfolios &&
                  portfolios.find((e) => e.bondCode == item.symbol);
                return (
                  <tr key={i}>
                    <td>
                      <VbondCodeCell
                        data={item}
                        typeBond={typeBond}
                        portfolio={portfolio}
                      />
                    </td>
                    <td className="tr pr-10">{item.totalQuantity}</td>
                    <td className="tr pr-10">{item.tradeQuantity}</td>
                    <td className="tr pr-10">{item.avgPrice}</td>
                    <td className="tr pr-10">{item.buyValue}</td>
                    <td className="tr pr-10">{item.coupon}</td>
                    <td>{item.maturityDate}</td>
                    <td className="tr pr-10">{item.currentBondValue}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="tc">
                  {lang.dataNotFound}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustodyTableVbond;
