import ReactTooltip from "react-tooltip";
import {
  getTermUnit,
  renderStringRates,
  showTableVipRate,
} from "../../../../helpers";
import numeral from "numeral";
import { useState } from "react";

function IntroduceDbondFi(props) {
  const [showInfo, setShowInfo] = useState(
    localStorage.getItem("showInfo")
      ? localStorage.getItem("showInfo") === "true"
      : true
  );
  const { lang, promotions, tableRates } = props;
  const toggleInfo = () => {
    localStorage.setItem("showInfo", !showInfo);
    setShowInfo(!showInfo);
  };

  return (
    <div id="bondinfo">
      <div
        className="heading"
        style={{ cursor: "pointer" }}
        onClick={() => toggleInfo()}
      >
        <i className="fa fa-info" /> {lang["productInfo"]}{" "}
        {showInfo ? (
          <i className="fa fa-chevron-up" />
        ) : (
          <i className="fa fa-chevron-down" />
        )}
      </div>

      {showInfo && (
        <div>
          <p>
            <b>DBond</b> {lang["dBondChannel1"]} {renderStringRates(tableRates)}{" "}
            {lang["dBondChannel2"]}
          </p>
          <p>
            Trái phiếu <b>DBond FI</b> là nhóm trái phiếu có tổ chức phát hành
            là các định chế tài chính (bao gồm các ngân hàng lớn, có uy tín trên
            thị trường).
          </p>
          <p>
            {lang["dBondLearnMore"]}{" "}
            <a
              href="https://dautu.vndirect.com.vn/trai-phieu-d-bond/"
              target="_blank"
            >
              {lang["here"]}
            </a>
          </p>
          <div className="info">
            <div className="tables">
              <div style={{ marginRight: "50px" }}>
                <div style={{ lineHeight: "40px" }}>
                  {lang["dBondFiRatebyTerm"]}
                </div>
                <div
                  className="csroll-table"
                  style={{
                    height: "174px",
                    overflowY: "auto",
                    overflowX: "hidden",
                  }}
                >
                  <table
                    style={{
                      width: "410px",
                      height: "33px",
                      position: "absolute",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ width: "120px" }}>{lang["term"]}</th>
                        <th>
                          {lang["rate"]} (%/{lang["year"]})
                        </th>
                        <th style={{ width: "100px" }}>
                          <span>{lang["rate_vip"]}</span>
                          <span
                            data-tip
                            data-for="tip-rate-vip"
                            data-class="bottom-tooltip"
                          >
                            <i
                              className="fa fa-info-circle cPointer"
                              style={{ marginLeft: "5px" }}
                            />
                          </span>
                          <ReactTooltip
                            id="tip-rate-vip"
                            effect="solid"
                            place="bottom"
                          >
                            <p>{lang["tooltip_rate_vip"]}</p>
                          </ReactTooltip>
                        </th>
                      </tr>
                    </thead>
                  </table>
                  <table style={{ width: "410px" }}>
                    <thead>
                      <tr>
                        <th style={{ width: "120px" }}>{lang["term"]}</th>
                        <th>
                          {lang["rate"]} (%/{lang["year"]})
                        </th>
                        <th style={{ width: "100px" }}>
                          <span>{lang["rate_vip"]}</span>
                          <span>
                            <i
                              className="fa fa-info-circle cPointer"
                              style={{ marginLeft: "5px" }}
                            />
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRates &&
                        tableRates.map((term) => {
                          return (
                            <tr key={term.termRateId}>
                              <td>
                                {term.term}{" "}
                                {getTermUnit(term.term_unit, lang, term.term)}
                              </td>
                              <td>{term.rate}</td>
                              <td>{term.rate2}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {showTableVipRate(promotions) && (
                <div>
                  <div style={{ lineHeight: "40px" }}>
                    <span>{lang["promotionByNav"]}</span>
                    <span
                      data-tip
                      data-for="tip-promote"
                      data-class="bottom-tooltip"
                    >
                      <i
                        className="fa fa-info-circle cPointer"
                        style={{ marginLeft: "5px" }}
                      />
                    </span>
                    <ReactTooltip
                      id="tip-promote"
                      effect="solid"
                      place="bottom"
                    >
                      <p>{lang["bondNavTooltip"]}</p>
                    </ReactTooltip>
                  </div>

                  <div
                    className="csroll-table"
                    style={{
                      height: "174px",
                      overflowY: "auto",
                      overflowX: "hidden",
                    }}
                  >
                    <table
                      style={{
                        width: "400px",
                        height: "33px",
                        position: "absolute",
                      }}
                    >
                      <thead>
                        <tr>
                          <th>
                            {lang["levelNav"]} ({lang["currency"]})
                          </th>
                          <th>
                            {lang["promotion_by_nav"]} (%/{lang["year"]})
                          </th>
                        </tr>
                      </thead>
                    </table>
                    <table style={{ width: "400px" }}>
                      <thead>
                        <tr>
                          <th>
                            {lang["levelNav"]} ({lang["currency"]})
                          </th>
                          <th>
                            {lang["promotion_by_nav"]} (%/{lang["year"]})
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {promotions &&
                          promotions.map((promotion) => {
                            if (
                              promotion.promotion &&
                              promotion.promotion > 0
                            ) {
                              return (
                                <tr key={promotion.promotion_id}>
                                  <td>
                                    {numeral(promotion.nav_promotion).format(
                                      "0,0"
                                    )}
                                  </td>
                                  <td>{promotion.promotion}</td>
                                </tr>
                              );
                            }
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IntroduceDbondFi;
