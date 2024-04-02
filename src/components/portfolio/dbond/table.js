import React, { useState } from 'react';
import {
  check2AuthBeforeRedirect,
  genLabelTypeBond,
  genNTypeBond,
} from "../../../helpers";
import DbondCodeCell from "./cell";
import PopupContainer from "../../../components/popup/index";
import moment from "moment";
import { openPopup } from "../../../actions/customer.actions";
import {
  checkRequestOpenAccSinglebond,
  getInfoSingleAccount,
} from "../../../clients/bond.api.client";
import StatusAccountRegistration from "../../priceboard/popup/status.account";
import FlowSingleBond from "../../priceboard/popup/flow.singlebond";
import ReactTooltip from "react-tooltip";
import { Api } from "../../../constants/config";

const TableDbond = (props) => {
  const [typeBond, setTypeBond] = useState(1);
  const [statusAccountRegisBond, setStatusAccountRegisBond] = useState(false);
  const [regisSingleBond, setRegisSingleBond] = useState(false);
  const {
    lang,
    filterDeals,
    deals,
    scheduleRestrictedList,
    popup,
    transactionList,
  } = props;
  const langLocal = localStorage.getItem("lang")
    ? localStorage.getItem("lang")
    : "vi";
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

  const checkListTransferLimited = (list) => {
    if (!list || list.length === 0) return null;
    const today = moment();
    const data = list.find(
      (e) =>
        (today.isSameOrAfter(moment(e.start_date, "YYYY-MM-DD")) &&
          today.isSameOrBefore(moment(e.end_date, "YYYY-MM-DD"))) ||
        (e.start_date === e.end_date &&
          today.format("YYYY-MM-DD") === e.end_date)
    );
    if (
      data &&
      (data.product_type === "ALL" || data.product_type === "FIX") &&
      (data.side === "ALL" || data.side === "NS")
    ) {
      return data;
    }
    return null;
  };

  const checkListTransferLimitedv1 = (list, product_type) => {
    if (list.length === 0) return null;
    const today = moment();
    const data = list.find((e) =>
      today.isBefore(moment(e.start_date, "YYYY-MM-DD"))
    );
    if (
      data &&
      (data.product_type === "ALL" || data.product_type === product_type)
    ) {
      return data;
    }
    return null;
  };

  const handleCheckCustomerProduct = (deal) => {
    const { ownerAccount, accountInfo } = props;
    const customerProduct = ownerAccount.customerProduct;
    const statusRegisted = ["IN_PROGRESS", "CONTRACTIVE", "COMPLETED"];
    const codeExit =
      customerProduct && customerProduct.find((e) => e.code === "03003001");
    if (codeExit && statusRegisted.includes(codeExit.status)) {
      if (accountInfo?.custodyId) {
        getInfoSingleAccount(accountInfo.custodyId).then((res) => {
          if (res.data) {
            const { data } = res;
            const today = moment();
            if (moment(data.effectiveTradeDate, "YYYY-MM-DD").isAfter(today)) {
              props.dispatch(
                openPopup({
                  type: "notiday-transaction",
                  data,
                })
              );
            } else {
              check2AuthBeforeRedirect(
                `/danh-muc/dat-ban/${deal.bond_code}/${
                  deal.product_type
                }?from=danh-muc&origin_quantity=${
                  deal.remain_sellable_quantity
                }&quantity=${deal.remain_sellable_quantity}&deal_id=${
                  deal.deal_id || ""
                }&customer_account_no=${deal.customer_account_no}&trade_date=${
                  deal.trade_date
                }&value_date=${deal.value_date}&leg2_trade_date=${
                  deal.leg2_trade_date
                }&terms=${JSON.stringify(deal.terms)}&promotion=${
                  deal.promotion
                }&leg2_settled_date=${deal.leg2_settled_date}`
              );
            }
          }
        });
      }
    } else {
      setRegisSingleBond(true);
    }
  };

  const makeSellRequest = (deal) => {
    const { bonds } = props;
    const detailBond = bonds[deal.bond_code];
    if (detailBond && detailBond.custodyCenter == "003") {
      checkRequestOpenAccSinglebond().then((res) => {
        if (res.data) {
          const pendingAccount = res.data.find(
            (e) => e.status === "PENDING" || e.status === "CONFIRMED"
          );
          if (pendingAccount) {
            setStatusAccountRegisBond(pendingAccount);
          } else {
            handleCheckCustomerProduct(deal);
          }
        }
      });
    } else {
      check2AuthBeforeRedirect(
        `/danh-muc/dat-ban/${deal.bond_code}/${
          deal.product_type
        }?from=danh-muc&origin_quantity=${
          deal.remain_sellable_quantity
        }&quantity=${deal.remain_sellable_quantity}&deal_id=${
          deal.deal_id || ""
        }&customer_account_no=${deal.customer_account_no}&trade_date=${
          deal.trade_date
        }&value_date=${deal.value_date}&leg2_trade_date=${
          deal.leg2_trade_date
        }&terms=${JSON.stringify(deal.terms)}&promotion=${
          deal.promotion
        }&leg2_settled_date=${deal.leg2_settled_date}`
      );
    }
  };

  const handleSellItems = (deal, listSR) => {
    const data = checkListTransferLimitedv1(listSR, deal.product_type);
    if (
      data &&
      moment(data.start_date, "YYYY-MM-DD").diff(moment(), "days") < 30
    ) {
      props.dispatch(
        openPopup({
          type: "transfer-limitation",
          data,
          product_type: deal.product_type,
          funCallBack: () => {
            makeSellRequest(deal);
          },
        })
      );
      return;
    }
    makeSellRequest(deal);
  };

  const renderActionbtn = ({ lang, deal, listScheduleRestricted }) => {
    if (deal && deal.remain_sellable_quantity > 0) {
      return (
        <button
          className="btn btn-error btn-buy"
          style={{ marginRight: 0 }}
          onClick={() => {
            handleSellItems(deal, listScheduleRestricted);
          }}
        >
          {lang["Bán"]}
        </button>
      );
    }
    const bondItem = transactionList?.find(
      (item) =>
        item.deal?.bond_code == deal.bond_code &&
        item.deal.deal_id === deal.deal_id
    );
    if (
      bondItem &&
      bondItem.status === "MATCHED" &&
      bondItem.deal.custody_center === "001"
    ) {
      return (
        <div>
          <button
            className="btn btn-error btn-buy"
            data-tip
            data-for="tip-uttb-label"
            data-class="bottom-tooltip"
            style={{
              marginRight: 0,
              background: "green",
              padding: "0 15px",
              fontSize: 13,
            }}
            onClick={() => {
              window.open(`${Api.DBOARD}giao-dich-tien/ung-truoc-tien-ban`);
            }}
          >
            UTTB
          </button>
          <ReactTooltip id="tip-uttb-label" effect="solid" place="left">
            <p>
              Quý khách có thể ứng trước tiền bán trái phiếu về tài khoản chứng
              khoán ngay
            </p>
          </ReactTooltip>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="">
      <div
        className="csroll-table"
        style={{ overflowY: "hidden", overflowX: "auto" }}
      >
        <table
          className="portfolio-data"
          style={{ width: 200, position: "absolute", right: "10px", zIndex: 2 }}
        >
          <thead>
            <tr>
              <th style={{ visibility: "hidden", border: "none" }}></th>
              <th style={{ padding: "17px 0", width: 100, minWidth: 100 }}>
                {lang["actions"]}
              </th>
            </tr>
          </thead>
          <tbody>
            {filterDeals &&
              filterDeals.map((item, i) => {
                if (deals) {
                  const deal = deals.find((e) => e.deal_id == item.dealId);
                  const listScheduleRestricted = scheduleRestrictedList
                    ? scheduleRestrictedList
                        .filter((e) => e.bond_code === item.symbol)
                        .sort((a, b) => {
                          return moment(a.start_date, "YYYY-MM-DD").isAfter(
                            moment(b.start_date, "YYYY-MM-DD")
                          )
                            ? 1
                            : -1;
                        })
                    : [];
                  const dataSR = checkListTransferLimited(
                    listScheduleRestricted
                  );
                  if (!dataSR) {
                    return (
                      <tr key={i} style={{ height: 35 }}>
                        <td
                          style={{
                            width: 100,
                            visibility: "hidden",
                            border: "none",
                          }}
                        >
                          <DbondCodeCell
                            typeBond={typeBond}
                            deal={deal}
                            data={item}
                          />
                        </td>
                        <td className="tc">
                          <div>
                            {renderActionbtn({
                              lang,
                              deal,
                              listScheduleRestricted,
                            })}
                            {/* {deal && deal.remain_sellable_quantity > 0 && (
                              <button
                                className="btn btn-error btn-buy"
                                style={{ marginRight: 0 }}
                                onClick={() => {
                                  handleSellItems(deal, listScheduleRestricted);
                                }}
                              >
                                {lang["Bán"]}
                              </button>
                            )} */}
                          </div>
                        </td>
                      </tr>
                    );
                  } else {
                    return (
                      <tr key={i}>
                        <td
                          style={{
                            width: 100,
                            visibility: "hidden",
                            border: "none",
                          }}
                        ></td>
                        <td style={{ width: 150 }}>
                          <div>
                            <i
                              style={{
                                marginRight: 5,
                              }}
                            >
                              {lang["transferLimited"]}
                            </i>
                            <span
                              data-tip
                              data-for={`tip-transferLimited_dbond_${item.symbol}`}
                              data-class="bottom-tooltip"
                            >
                              <i className="fa fa-info-circle cPointer" />
                            </span>
                            <ReactTooltip
                              id={`tip-transferLimited_dbond_${item.symbol}`}
                              effect="solid"
                              place="left"
                            >
                              <p>
                                {langLocal === "vi"
                                  ? dataSR.reason_vn
                                  : dataSR.reason_eng}
                              </p>
                            </ReactTooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                }
              })}
          </tbody>
        </table>
        <table className="portfolio-data" style={{ minWidth: "2070px" }}>
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
              <th style={{ width: 100 }}></th>
            </tr>
          </thead>
          <tbody>
            {!filterDeals ? (
              <tr>
                <td colSpan="14">
                  <div className="tc" style={{ width: "100vw" }}>
                    <i className="fa fa-refresh fa-spin fa-fw" />
                  </div>
                </td>
              </tr>
            ) : filterDeals.length > 0 ? (
              filterDeals.map((item, i) => {
                if (deals) {
                  const deal = deals.find((e) => e.deal_id == item.dealId);
                  return (
                    <tr key={i} id={`code_${deal?.bond_code}_${i}`}>
                      <td>
                        <DbondCodeCell
                          deal={deal}
                          typeBond={typeBond}
                          data={item}
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
                      <td></td>
                    </tr>
                  );
                }
              })
            ) : (
              <tr>
                <td colSpan="13" className="tc">
                  {lang.dataNotFound}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {statusAccountRegisBond && (
        <StatusAccountRegistration
          {...statusAccountRegisBond}
          onClose={() => setStatusAccountRegisBond(false)}
        />
      )}
      {regisSingleBond && (
        <FlowSingleBond
          {...props}
          handleClose={() => {
            setRegisSingleBond(false);
          }}
        />
      )}
      {popup.status && <PopupContainer {...props} />}
    </div>
  );
};

export default TableDbond;