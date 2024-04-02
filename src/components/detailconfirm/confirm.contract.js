import React, { useEffect, useState } from "react";
import cl from "classnames";
import numeral from "numeral";
import moment from "moment";
import ReactTooltip from "react-tooltip";
import {
  getBondInfo,
  getDetailOrder,
  getUserByHrCode,
  getReferFullName,
  confirmOrdernoDocId,
  rejectBondContract,
  getBase64Contract,
  getItemExplainBond,
} from "../../clients/bond.api.client";
import {
  checkTypebond,
  getTermUnit,
  displayNoti,
} from "../../helpers";
import { addDecimals } from "../../common/utils";
import { parseErrorMessage } from "../../modules/error_parser/error.parser.v2";
import * as AuthService from "../../services/auth.service";
import { openPopup } from "../../actions/customer.actions";

function ConfirmContract(props) {
  const [carebyInfo, setCarebyInfo] = useState(null)
  const [referInfo, setReferInfo] = useState(null)
  const [bondDocument, setBondDocument] = useState(null)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [pendingcancel, setPendingcancel] = useState(false)
  const [acceptTrade, setAcceptTrade] = useState(false)
  const [showMorePrice, setShowMorePrice] = useState(false)
  const [showMoreInterest, setshowMoreInterest] = useState(false)

  useEffect(() => {
    if (props.orderInfo) {
      const {careby,referCode} = props.orderInfo;
      if (careby) {
        _getUserByHrCode(careby); 
      }
      if (referCode) {
        _getReferFullName(referCode);
      }
    }
  },[props.orderInfo])

  
  const _getDetailOrder = (accountNo, procInstId) => {
    getDetailOrder(accountNo, procInstId).then((res) => {
      if (res.data && res.data.length > 0) {
        const state = res.data[0]
        props.setOrderInfo(res.data[0])
        const {productType,bondCode,careby,referCode} = state;
        if (productType && bondCode) {
          _getBondInfo(productType, bondCode); 
        }
        if (careby) {
          _getUserByHrCode(careby); 
        }
        if (referCode) {
          _getReferFullName(referCode);
        }
      }
    });
  };

  const _getUserByHrCode = (hrCode) => {
    getUserByHrCode(hrCode).then((res) => {
      if (res.data) {
        setCarebyInfo(res.data)
      }
    });
  };

  const _getReferFullName = (cusId) => {
    getReferFullName(cusId).then((res) => {
      if (res.data) {
        setReferInfo(res.data)
      }
    });
  };

  const _getBondInfo = (product_type, bond_code) => {
    getBondInfo(product_type, bond_code).then((res) => {
      if (res && res.data) {
        props.setBondInfo(res.data)
        const { for_professional_investor } = res.data
        if (
          orderInfo.side === "NB" &&
          for_professional_investor &&
          !orderInfo.urlPageSign
        ) {
          fetchExplainBond(orderInfo.bondCode);
        }
      }
    });
  };

  const fetchExplainBond = (bondCode) => {
    getItemExplainBond(bondCode).then((res) => {
      if (res.data) {
        const { data } = res.data;
        const mydata = data.find((e) => e.code === bondCode);
        if (mydata) setBondDocument(mydata);
      }
    });
  };

  const handleBack = () => {
    props.router.push("/xac-nhan-lenh");
  };

  const renderTerm = (term) => {
    const { lang } = props;
    if (!term) return null;
    return `${term.term} ${getTermUnit(term.termUnit, lang, term.term)}`;
  };

  const realInterestRate = (term, promotionNav, promotionCode) => {
    let rate = 0;
    if (term && term.rate) rate = term.rate;
    if (promotionNav) rate = addDecimals(rate, parseFloat(promotionNav));
    if (promotionCode) rate = addDecimals(rate, parseFloat(promotionCode));
    return rate;
  };

  const handleOpenContract = (data) => {
    props.dispatch(
      openPopup({
        type: "contract-bond",
        data: data,
        funCallBack: (value) => {
          if (value === "reopen") {
            handleOpenContract(data);
          }
          if (value === "recall") {
            const { params } = props;
            if (params && params.accountNo)
              _getDetailOrder(params.accountNo, params.procInstId);
          }
        },
      })
    );
  };

  const handleConfirm = (dataReq) => {
    if (!AuthService.isStep2Authenticated()) {
      window.parent.postMessage(["required2Authenticated"], "*");
      return;
    }
    if (dataReq.urlPageSign) {
      handleOpenContract(dataReq);
    } else {
      //Read contract
      const { lang , bondInfo} = props;
      if (
        bondInfo &&
        dataReq.side === "NB" &&
        bondInfo.for_professional_investor
      ) {
        if (!acceptTrade) {
          setError(lang["acceptTermRequired"])
          return;
        }
        callApibase64(dataReq);
        return;
      }
      handleConfirmnoUrlPagesign(dataReq);
    }
  };


  const callApibase64 = (dataReq) => {
    setPending(true)
    getBase64Contract(dataReq)
      .then((res) => {
        if (res.data) {
          props.dispatch(
            openPopup({
              type: "confirm-buy-bond",
              data: res.data,
              funCallBack: () => {
                handleConfirmnoUrlPagesign(dataReq);
              },
            })
          );
        }
      })
      .catch((e) => {
        if (e && e.response && e.response.data) {
          if (e.response.data.error === "DPM-2801") {
            const { error, errorMessage, id } = e.response.data;
            setError(`${errorMessage} (${error}) (${id})`)
            return;
          }
          displayNoti(parseErrorMessage(e.response.data), "error");
          setError(parseErrorMessage(e.response.data))
        }
      })
      .finally(() => {
        setPending(false)
        setError(null)
      });
  };

  const handleConfirmnoUrlPagesign = (dataReq) => {
    setPending(true)
    confirmOrdernoDocId(dataReq.accountNo, dataReq.procInstId)
      .then((res) => {
        if (res.data) {
          const { url } = res.data;
          handleOpenContract({ urlPageSign: url, ...dataReq });
        }
      })
      .catch((err) => {
        const errorCode =
          err.response.data.error || err.response.data.code || "";
        if (errorCode) {
          const { error, errorMessage, id } = err.response.data;
          if (err.response.data.error === "DPM-2801") {
            setError(`${errorMessage} (${error}) (${id})`)
            return;
          }
          displayNoti(
            parseErrorMessage(err.response.data) || errorMessage,
            "error"
          );
        }
      })
      .finally(() => {
        setPending(false)
      });
  };

  const changeAcceptTrade = () => {
    setAcceptTrade(!acceptTrade)
  };

  const cancel = (data) => {
    setPendingcancel(true)
    confirmOrdernoDocId(data.accountNo, data.procInstId, "REJECTED")
      .then((res) => {
        if (res.status === 200) {
          window.changeURL("/thap-tai-san/bond/xac-nhan-lenh");
        }
      })
      .catch((err) => {
        if (err.response) displayNoti(err.response.data.errorMessage);
      })
      .finally(() => {
        setPendingcancel(false)
      });
  };

  const cancelContract = (data) => {
    setPendingcancel(true)
    rejectBondContract(data.accountNo, data.procInstId)
      .then((res) => {
        if (res) {
          displayNoti('Hủy yêu cầu thành công')
          props.router.push("/bang-gia");
        }
      })
      .catch((err) => {
        setPendingcancel(false)
        if (err.response.data.error === "DPM-2801") {
          const { error, errorMessage, id } = err.response.data;
          setError(`${errorMessage} (${error}) (${id})`)
          return;
        }
        setError(parseErrorMessage(err.response.data))
      });
  };


  const { lang, orderInfo, bondInfo } = props;
  let typeBond;
  let side = orderInfo.side;
  let term = orderInfo.terms ? orderInfo.terms[0] : null;
  let tax = orderInfo.tax;

  if (bondInfo) {
    typeBond = checkTypebond(bondInfo);
  }
  return (
    <div className="left-block">
      <table className="trade-table">
        <colgroup>
          <col width="45%" />
          <col width="55%" />
        </colgroup>
        <tbody>
          <tr>
            <td className="text-l t-gray">{lang["CustomerAccountNo"]}</td>
            <td className="text-l txt-bold">{orderInfo.accountNo}</td>
          </tr>
          <tr>
            <td className="text-l t-gray">{lang["Loại lệnh"]}</td>
            <td className="text-l txt-bold">
              <span
                style={
                  side === "NB"
                    ? { color: "#53b314", fontWeight: "bold" }
                    : { color: "#ed1c24", fontWeight: "bold" }
                }
              >
                {side === "NB"
                  ? lang["buy"].toUpperCase()
                  : lang["sell"].toUpperCase()}
              </span>
            </td>
          </tr>

          <tr>
            <td className="text-l t-gray">{lang["TradeDate"]}</td>
            <td className="text-l txt-bold">
              {moment(orderInfo.tradeDate).format("DD/MM/YYYY")}
            </td>
          </tr>
          <tr>
            <td className="text-l t-gray">{lang["settlementDate"]}</td>
            <td className="text-l t-bold">
              {moment(orderInfo.settledDate).format("DD/MM/YYYY")}
            </td>
          </tr>
          {side === "NB" && (
            <tr>
              <td className="text-l t-gray">
                <span>{lang["dateReturnOrder"]}</span>
                <span
                  data-tip
                  data-for="tip-datereturn-order"
                  data-class="bottom-tooltip"
                >
                  <i
                    className="fa fa-info-circle cPointer"
                    style={{ marginLeft: "5px" }}
                  />
                </span>
                <ReactTooltip
                  id="tip-datereturn-order"
                  effect="solid"
                  place="bottom"
                >
                  <p>{lang["tip_datereturn_order"]}</p>
                </ReactTooltip>
              </td>
              <td className="text-l t-bold">
                <span>
                  {moment(orderInfo.leg2TradeDate).format("DD/MM/YYYY")}
                </span>
              </td>
            </tr>
          )}
          {carebyInfo && (
            <tr>
              <td className="text-l t-gray">{lang["CarebyFullName"]}</td>
              <td className="text-l t-bold">{carebyInfo.userFullName}</td>
            </tr>
          )}
          <tr>
            <td className="text-l t-gray">{lang["Quantity"]}</td>
            <td className="text-l txt-bold">
              {numeral(orderInfo.quantity).format("0,0")}
            </td>
          </tr>

          {typeBond === "d-bond" && (
            <tr>
              <td className="text-l t-gray">
                <span>{lang["Giá thực hiện"]}</span>
              </td>
              <td className="text-l txt-bold">
                {numeral(orderInfo.price).format("0,0")} {lang["currency"]}
              </td>
            </tr>
          )}
          {typeBond === "v-bond" && (
            <tr>
              <td
                className={cl("text-l ", {
                  "pointer anoffer": side === "NB",
                  "t-gray": side === "NS",
                })}
                onClick={() => {
                  if (side === "NB") {
                    setShowMorePrice(!showMorePrice);
                  }
                }}
              >
                <span>{lang["Giá thực hiện"]}</span>
                {side === "NB" && (
                  <i
                    style={{ marginLeft: "5px" }}
                    className={`fa fa-caret-${showMorePrice ? "up" : "down"}`}
                    aria-hidden="true"
                  />
                )}
              </td>
              <td className="text-l txt-bold anoffer">
                {numeral(
                  parseFloat(orderInfo.price) *
                    (1 -
                      (orderInfo.promotionCode
                        ? parseFloat(orderInfo.promotionCode) / 100
                        : 0))
                ).format("0,0")}{" "}
                {lang["currency"]}
              </td>
            </tr>
          )}
          {showMorePrice && (
            <>
              <tr>
                <td className="text-l pl42 t-gray">
                  {lang["price_before_promotion"]}
                </td>
                <td className="text-l txt-bold">
                  {numeral(orderInfo.price).format("0,0")} {lang["currency"]}
                </td>
              </tr>
              <tr>
                <td className="text-l pl42 t-gray">
                  {lang["promotion_by_bond_code"]}
                </td>
                <td className="text-l txt-bold">
                  {orderInfo.promotionCode}
                  <span>{typeBond === "d-bond" ? "%/năm" : "%"}</span>
                </td>
              </tr>
            </>
          )}

          {typeBond === "d-bond" && (
            <>
              <tr>
                <td className="text-l t-gray">{lang["term"]}</td>
                <td className="text-l txt-bold">{term && renderTerm(term)}</td>
              </tr>
              <tr>
                <td className="text-l t-gray">{lang["leg2TradeDate"]}</td>
                <td className="text-l txt-bold">
                  {moment(orderInfo.leg2SettledDate).format("DD/MM/YYYY")}
                </td>
              </tr>
              <tr>
                <td
                  className={cl("text-l ", {
                    "pointer anoffer": side === "NB",
                    "t-gray": side === "NS",
                  })}
                  onClick={() => {
                    if (side === "NB") {
                      setshowMoreInterest(!showMoreInterest);
                    }
                  }}
                >
                  <span className="">{lang["real_rate"]}</span>
                  {side === "NB" && (
                    <i
                      style={{ marginLeft: "5px" }}
                      className={`fa fa-caret-${
                        showMoreInterest ? "up" : "down"
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </td>
                <td className="text-l txt-bold anoffer">
                  {term &&
                    numeral(
                      realInterestRate(
                        term,
                        orderInfo.promotionNav,
                        orderInfo.promotionCode
                      )
                    ).format("0,0.[00]")}
                  %/{lang["year"]}
                </td>
              </tr>
            </>
          )}

          {showMoreInterest && (
            <>
              <tr>
                <td className="text-l pl42 t-gray">
                  {lang["rateBeforePromotion"]}
                </td>
                <td className="text-l txt-bold">
                  {term ? `${numeral(term.rate).format("0,0.[00]")}%` : "0%"}
                </td>
              </tr>
              <tr>
                <td className="text-l pl42 t-gray">
                  {lang["promotion_by_bond_code"]}
                </td>
                <td className="text-l txt-bold">{orderInfo.promotionCode}</td>
              </tr>
              <tr>
                <td className="text-l pl42 t-gray">
                  {lang["promotion_by_nav"]}
                </td>
                <td className="text-l txt-bold">
                  {orderInfo.promotionNav &&
                    numeral(orderInfo.promotionNav).format("0.[00]")}
                  %
                </td>
              </tr>
            </>
          )}

          {typeBond === "v-bond" && side === "NB" && (
            <tr>
              <td className="text-l t-gray">{lang["total_promotion"]}</td>
              <td className="text-l txt-bold">
                <span>
                  {orderInfo.promotionCode &&
                    numeral(
                      (parseFloat(orderInfo.quantity) *
                        parseFloat(orderInfo.price) *
                        parseFloat(orderInfo.promotionCode)) /
                        100
                    ).format("0,0")}{" "}
                  {lang["currency"]}
                </span>
              </td>
            </tr>
          )}

          <tr>
            <td className="text-l t-gray">{lang["Volume"]}</td>
            <td className="text-l txt-bold">
              <span>
                {numeral(parseFloat(orderInfo.volume)).format("0,0")}{" "}
                {lang["currency"]}
              </span>
            </td>
          </tr>
          <tr>
            <td className="text-l t-gray">{lang["Tax"]}</td>
            <td className="text-l txt-bold">
              <span>
                {tax && numeral(tax).format(0, 0)} {lang["currency"]}
              </span>
            </td>
          </tr>

          <tr>
            <td className="text-l t-gray">{lang["fee"]}</td>
            <td className="text-l txt-bold">
              {side === "NB" ? (
                <span>{numeral(orderInfo.buyFee).format(0, 0)}</span>
              ) : (
                <span>{numeral(orderInfo.sellFee).format(0, 0)}</span>
              )}{" "}
              {lang["currency"]}
            </td>
          </tr>

          {typeBond === "d-bond" && (
            <tr>
              <td className="text-l t-gray">{lang["totalPayment"]}</td>
              {side === "NB" ? (
                <td className="text-l txt-bold">
                  {numeral(
                    parseFloat(orderInfo.volume) +
                      parseFloat(tax) +
                      parseFloat(orderInfo.buyFee)
                  ).format("0,0")}{" "}
                  {lang["currency"]}
                </td>
              ) : (
                <td className="text-l txt-bold">
                  {numeral(
                    parseFloat(orderInfo.volume) -
                      parseFloat(tax) -
                      parseFloat(orderInfo.sellFee)
                  ).format(0, 0)}{" "}
                  {lang["currency"]}
                </td>
              )}
            </tr>
          )}
          {typeBond === "v-bond" && (
            <tr>
              <td className="text-l t-gray">{lang["totalPayment"]}</td>
              {side === "NB" ? (
                <td className="text-l txt-bold">
                  {numeral(
                    parseFloat(orderInfo.volume) +
                      parseFloat(tax) +
                      parseFloat(orderInfo.buyFee)
                  ).format("0,0")}{" "}
                  {lang["currency"]}
                </td>
              ) : (
                <td className="text-l txt-bold">
                  {numeral(
                    parseFloat(orderInfo.volume) -
                      parseFloat(tax) -
                      parseFloat(orderInfo.sellFee)
                  ).format(0, 0)}{" "}
                  {lang["currency"]}
                </td>
              )}
            </tr>
          )}

          {referInfo && (
            <tr>
              <td className="text-l t-gray">{lang["referFullName"]}</td>
              <td className="text-l txt-bold">
                <span>{referInfo}</span>
              </td>
            </tr>
          )}

          <tr>
            <td className="text-l t-gray">
              {lang["bond_certificate_comfirm"]}
            </td>
            <td className="text-l txt-bold">
              <span>
                {orderInfo.bondCertificate ? lang["yes"] : lang["no"]}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {orderInfo &&
        bondInfo &&
        orderInfo.side === "NB" &&
        !orderInfo.urlPageSign &&
        bondInfo.for_professional_investor && (
          <div className="my-checkbox" style={{ marginTop: 20 }}>
            <label className="contain">
              <input
                type="checkbox"
                style={{ height: 13, width: "auto" }}
                onChange={changeAcceptTrade}
              />
              <span className="checkmark" />
              <label style={{ marginLeft: "23px" }}>
                <span>
                  {lang["bondIssuanceDocument1"]}{" "}
                  {bondDocument &&
                    bondDocument.documents &&
                    bondDocument.documents[0] && (
                      <a
                        className="anoffer"
                        href={bondDocument.documents[0].docUrl}
                        target="_blank"
                      >
                        <u>{lang["here"]}</u>
                      </a>
                    )}{" "}
                  {lang["bondIssuanceDocument2"]}
                </span>
              </label>
            </label>
          </div>
        )}

      {error && (
        <div className="form-group">
          <p
            className="txt-note"
            style={{ color: "red" }}
            dangerouslySetInnerHTML={{ __html: error }}
          />
        </div>
      )}

      <div className="btn-group">
        <button
          onClick={() => !pending && handleConfirm(orderInfo)}
          className="btn-primary btn txt-upper"
          style={{ marginRight: 0, opacity: !pendingcancel ? 1 : 0.5 }}
        >
          {pending ? (
            <i className="fa fa-spinner fa-spin" />
          ) : (
            <span>
              {orderInfo.urlPageSign ? lang["signContract"] : lang["Confirm"]}
            </span>
          )}
        </button>
        {!orderInfo.urlPageSign ? (
          <button
            className="btn btn-gray txt-upper"
            style={{ marginLeft: 10, opacity: !pending ? 1 : 0.5 }}
            onClick={() => !pendingcancel && cancel(orderInfo)}
          >
            {pendingcancel ? (
              <i className="fa fa-spinner fa-spin" />
            ) : (
              <span>{lang["cancelOrder"]}</span>
            )}
          </button>
        ) : (
          <button
            className="btn btn-gray txt-upper"
            style={{ marginLeft: 10, opacity: !pending ? 1 : 0.5 }}
            onClick={() => !pendingcancel && cancelContract(orderInfo)}
          >
            {pendingcancel ? (
              <i className="fa fa-spinner fa-spin" />
            ) : (
              <span>{lang["cancel_contracts"]}</span>
            )}
          </button>
        )}
      </div>
      <p className="tc">
        <u className="pointer" onClick={handleBack}>
          {lang["Back"]}
        </u>
      </p>
    </div>
  );
}

export default ConfirmContract