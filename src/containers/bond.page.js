import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  check2AuthBeforeRedirect,
  covertDatebyString,
  checkTypebond,
  mapStatusProInvest,
  nameTypebond,
} from "../helpers";
import {
  getCoupon,
  getBondPricing,
  checkRequestOpenAccSinglebond,
  getInfoSingleAccount,
  getBondInfo,
} from "../clients/bond.api.client";
import numeral from "numeral";
import Coupon from "../components/orderpage/coupon";
import wa from "../resource/images/warm.svg";
import { isBusinessCustomer } from "../helpers";
import StatusAccountRegistration from "../components/priceboard/popup/status.account";
import FlowSingleBond from "../components/priceboard/popup/flow.singlebond";
import moment from "moment";
import ReactTooltip from "react-tooltip";
import { openPopup } from "../actions/customer.actions";
import PopupContainer from "../components/popup/index";

function BondDetail(props) {
  const [bond, setBond] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [vbondPriceSell, setvbondPriceSell] = useState(null);
  const [vbondPriceBuy, setvbondPriceBuy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bondInfo, setBondInfo] = useState(null);

  const [regisSingleBond, setRegisSingleBond] = useState(false);
  const [statusAccountRegisBond, setStatusAccountRegisBond] = useState(false);

  useEffect(() => {
    const { params, bonds } = props;
    console.log(params);
    const typeBond = checkTypebond(params);
    if (typeBond === "v-bond") {
      // vbond: lấy giá chào bán+mua của Vndirect
      _getBondPricing(params, "NB");
      _getBondPricing(params, "NS");
    }
    _getCoupon(params.bond_code);
    _getBondInfo(params.bond_code, params.product_type);
    if (params.bond_code && bonds) {
      if (bonds[params.bond_code]) {
        setBond(bonds[params.bond_code]);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (props.bonds) {
      const { bond_code } = props.params;
      setBond(props.bonds[bond_code]);
      setLoading(false);
    }
  }, [props.bonds]);

  const _getBondPricing = async (bond, side) => {
    try {
      const res = await getBondPricing(bond, side);
      if (res.data) {
        const { data } = res;
        if (side === "NB") {
          setvbondPriceSell(data.price);
        } else {
          setvbondPriceBuy(data.price);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const _getBondInfo = (bond_code, product_type) => {
    getBondInfo(product_type, bond_code).then((res) => {
      if (res && res.data) {
        setBondInfo(res.data);
      }
    });
  };

  const _getCoupon = async (bondCode) => {
    try {
      const res = await getCoupon(bondCode);
      if (res.data) {
        setCoupon(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  function handleBack() {
    if (window.location.href.toString().indexOf("danh-muc") > 0) {
      props.router.push("/danh-muc");
    } else {
      props.router.push("/bang-gia");
    }
  }

  const fetchInfoSingleAccount = () => {
    const { accountInfo, params } = props;
    if (accountInfo?.custodyId) {
      getInfoSingleAccount(accountInfo.custodyId).then((res) => {
        if (res.data) {
          const { data } = res;
          const today = moment();
          if (
            data.investorType === "PINV" &&
            data.vsdStatus === "A" &&
            moment(data.effectivePinvDate, "YYYY-MM-DD").isAfter(today)
          ) {
            props.dispatch(
              openPopup({
                type: "notiday-transaction",
                data,
              })
            );
            return;
          }
          if (
            data.investorType === "NORM" &&
            data.vsdStatus === "A" &&
            moment(data.effectiveTradeDate, "YYYY-MM-DD").isAfter(today)
          ) {
            props.dispatch(
              openPopup({
                type: "notiday-transaction",
                data,
              })
            );
            return;
          }
          check2AuthBeforeRedirect(
            `/dat-mua/${params.bond_code}/${params.product_type}`
          );
        }
      });
    }
  };

  const handleCheckCustomerProduct = () => {
    const { ownerAccount } = props;
    const customerProduct = ownerAccount.customerProduct;
    const statusRegisted = ["IN_PROGRESS", "CONTRACTIVE", "COMPLETED"];
    const codeExit =
      customerProduct && customerProduct.find((e) => e.code === "03003001");
    if (codeExit && statusRegisted.includes(codeExit.status)) {
      fetchInfoSingleAccount();
    } else {
      setRegisSingleBond(true);
    }
  };

  const getRequestOpenAccSinglebond = () => {
    checkRequestOpenAccSinglebond().then((res) => {
      if (res.data) {
        const pendingAccount = res.data.find(
          (e) => e.status === "PENDING" || e.status === "CONFIRMED"
        );
        if (pendingAccount) {
          setStatusAccountRegisBond({ ...pendingAccount });
        } else {
          handleCheckCustomerProduct();
        }
      }
    });
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

  const handleCheckBuyDbond = (listSR, bond) => {
    const data = checkListTransferLimitedv1(listSR, bond.bond_code);
    if (
      data &&
      moment(data.start_date, "YYYY-MM-DD").diff(moment(), "days") < 30
    ) {
      props.dispatch(
        openPopup({
          type: "transfer-limitation",
          data: data,
          product_type: product_type,
          funCallBack: () => {
            handleCheckBuyForProInvestor(bond);
          },
        })
      );
      return;
    }
    handleCheckBuyForProInvestor(bond);
  };

  const handleCheckBuyForProInvestor = (bond) => {
    const { bonds } = props;
    const detailBond = bonds[bond.bond_code];
    if (detailBond && detailBond.custodyCenter == "003") {
      getRequestOpenAccSinglebond();
    } else {
      check2AuthBeforeRedirect(`/dat-mua/${bond.bond_code}/${product_type}`);
    }
  };

  const checkTransferLimitedVbond = (list, bond_ex) => {
    const { authInfo, lang } = props;
    if (list.length === 0)
      return (
        <div>
          {bond_ex.for_professional_investor ? (
            <div>
              <div className="btn-group">
                {authInfo.isProInvestor && (
                  <button
                    style={{ marginRight: 10 }}
                    onClick={() => handleCheckBuyForProInvestor(bond)}
                    className="btn-buy txt-upper"
                  >
                    {lang["buy"]}
                  </button>
                )}
                {/* <button
                  onClick={() =>
                    check2AuthBeforeRedirect(
                      `/dat-ban/${bond.bond_code}/${product_type}`
                    )
                  }
                  className="btn-sell txt-upper"
                >
                  {lang["sell"]}
                </button> */}
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
              {/* <button
                style={{ marginLeft: 10 }}
                onClick={() =>
                  check2AuthBeforeRedirect(
                    `/dat-ban/${bond.bond_code}/${product_type}`
                  )
                }
                className="btn-sell txt-upper"
              >
                {lang["sell"]}
              </button> */}
            </div>
          )}
        </div>
      );
    const langLocal = localStorage.getItem("lang")
      ? localStorage.getItem("lang")
      : "vi";
    const today = moment();
    const data = list.find(
      (e) =>
        today.isSameOrAfter(moment(e.start_date, "YYYY-MM-DD")) &&
        today.isSameOrBefore(moment(e.end_date, "YYYY-MM-DD"))
    );

    if (
      data &&
      (data.product_type === "ALL" || data.product_type === "OUTRIGHT")
    ) {
      switch (data.side) {
        case "ALL":
          return (
            <div className="warning65">
              <i style={{ display: "inline-block", marginRight: 5 }}>
                {lang["transferLimited"]}
              </i>
              <span
                data-tip
                data-for={`tip-transferLimited`}
                data-class="bottom-tooltip"
              >
                <i className="fa fa-info-circle cPointer" />
              </span>
              <ReactTooltip
                id={`tip-transferLimited`}
                effect="solid"
                place="bottom"
              >
                <p>{langLocal === "vi" ? data.reason_vn : data.reason_eng}</p>
              </ReactTooltip>
            </div>
          );
        case "NS":
          return (
            <div>
              {bond_ex.for_professional_investor ? (
                <div>
                  <div className="btn-group">
                    {authInfo.isProInvestor && (
                      <button
                        style={{ marginRight: 10 }}
                        onClick={() => handleCheckBuyForProInvestor(bond)}
                        className="btn-buy txt-upper"
                      >
                        {lang["buy"]}
                      </button>
                    )}
                  </div>
                  <div className="warning65">
                    <i style={{ display: "inline-block", marginRight: 5 }}>
                      {lang["transferLimited"]}
                    </i>
                    <span
                      data-tip
                      data-for={`tip-transferLimited_${bond.bond_code}_${bond.product_type}`}
                      data-class="bottom-tooltip"
                    >
                      <i className="fa fa-info-circle cPointer" />
                    </span>
                    <ReactTooltip
                      id={`tip-transferLimited_${bond.bond_code}_${bond.product_type}`}
                      effect="solid"
                      place="left"
                    >
                      <p>
                        {langLocal === "vi" ? data.reason_vn : data.reason_eng}
                      </p>
                    </ReactTooltip>
                  </div>
                </div>
              ) : (
                <div>
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
                  </div>
                  <div className="warning65">
                    <i style={{ display: "inline-block", marginRight: 5 }}>
                      {lang["transferLimited"]}
                    </i>
                    <span
                      data-tip
                      data-for={`tip-transferLimited_${bond.bond_code}_${bond.product_type}`}
                      data-class="bottom-tooltip"
                    >
                      <i className="fa fa-info-circle cPointer" />
                    </span>
                    <ReactTooltip
                      id={`tip-transferLimited_${bond.bond_code}_${bond.product_type}`}
                      effect="solid"
                      place="left"
                    >
                      <p>
                        {langLocal === "vi" ? data.reason_vn : data.reason_eng}
                      </p>
                    </ReactTooltip>
                  </div>
                </div>
              )}
            </div>
          );
        case "NB":
          return (
            <div>
              {bond_ex.for_professional_investor ? (
                <div>
                  {authInfo.isProInvestor && (
                    <div className="warning65">
                      <i style={{ display: "inline-block", marginRight: 5 }}>
                        {lang["transferLimited"]}
                      </i>
                      <span
                        data-tip
                        data-for={`tip-transferLimited_${bond.bond_code}_${bond.product_type}`}
                        data-class="bottom-tooltip"
                      >
                        <i className="fa fa-info-circle cPointer" />
                      </span>
                      <ReactTooltip
                        id={`tip-transferLimited_${bond.bond_code}_${bond.product_type}`}
                        effect="solid"
                        place="left"
                      >
                        <p>
                          {langLocal === "vi"
                            ? data.reason_vn
                            : data.reason_eng}
                        </p>
                      </ReactTooltip>
                    </div>
                  )}
                  {/* <div className="btn-group">
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
                  </div> */}
                </div>
              ) : (
                <div>
                  <div className="warning65">
                    <i style={{ display: "inline-block", marginRight: 5 }}>
                      {lang["transferLimited"]}
                    </i>
                    <span
                      data-tip
                      data-for={`tip-transferLimited_${bond.bond_code}_${bond.product_type}`}
                      data-class="bottom-tooltip"
                    >
                      <i className="fa fa-info-circle cPointer" />
                    </span>
                    <ReactTooltip
                      id={`tip-transferLimited_${bond.bond_code}_${bond.product_type}`}
                      effect="solid"
                      place="left"
                    >
                      <p>
                        {langLocal === "vi" ? data.reason_vn : data.reason_eng}
                      </p>
                    </ReactTooltip>
                  </div>
                  {/* <div className="btn-group">
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
                  </div> */}
                </div>
              )}
            </div>
          );
        default:
          break;
      }
    }
    return (
      <div>
        {bond_ex.for_professional_investor ? (
          <div>
            <div className="btn-group">
              {authInfo.isProInvestor && (
                <button
                  style={{ marginRight: 10 }}
                  onClick={() => handleCheckBuyForProInvestor(bond)}
                  className="btn-buy txt-upper"
                >
                  {lang["buy"]}
                </button>
              )}
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
        )}
      </div>
    );
  };

  const checkListTransferLimitedDbond = (list) => {
    if (list.length === 0) return null;
    const today = moment();
    const data = list.find(
      (e) =>
        today.isSameOrAfter(moment(e.start_date, "YYYY-MM-DD")) &&
        today.isSameOrBefore(moment(e.end_date, "YYYY-MM-DD"))
    );
    if (
      data &&
      (data.product_type === "ALL" || data.product_type === "FIX") &&
      (data.side === "ALL" || data.side === "NB")
    ) {
      return data;
    }
    return null;
  };

  const { bond_code, product_type } = props.params;
  const { products, authInfo, lang, accounts, scheduleRestrictedList, popup } =
    props;
  const bond_ex =
    products &&
    products.find(
      (e) => e.bond_code === bond_code && e.product_type === product_type
    );
  const typeBond = bond_ex && checkTypebond(bond_ex);
  const langLocal = localStorage.getItem("lang")
    ? localStorage.getItem("lang")
    : "vi";
  const listScheduleRestricted = scheduleRestrictedList
    ? scheduleRestrictedList
        .filter((e) => e.bond_code === bond_code)
        .sort((a, b) => {
          return moment(a.start_date, "YYYY-MM-DD").isAfter(
            moment(b.start_date, "YYYY-MM-DD")
          )
            ? 1
            : -1;
        })
    : [];

  if (loading) {
    return (
      <div id="bonddetail">
        <i>{lang["DBondDetail"]}</i>
        <h2>{bond_code}</h2>
        <h2>
          <i className="fa fa-spinner fa-spin" />
        </h2>
      </div>
    );
  } else if (!bond) {
    return (
      <div id="bonddetail">
        <i>{lang["VBondDetail"]}</i>
        <h2>{bond_code}</h2>
        <strong>{lang["BondCodeNotFound"]}</strong>
      </div>
    );
  }

  return (
    <div className="customer-info">
      {typeBond === "v-bond" && (
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
                <span className="detail">{lang["normalInvestor"]}</span>
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
                  <th className="text-l txt-bold">
                    {bondInfo && nameTypebond(bondInfo)}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-l t-gray">{lang["bondCode"]}</td>
                  <td className="text-l txt-bold">{bond.bond_code}</td>
                </tr>
                <tr>
                  <td className="text-l t-gray">{lang["originalBond"]}</td>
                  <td className="text-l txt-bold">
                    {coupon ? coupon.originalPaperCode : "-"}
                  </td>
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
                    {vbondPriceSell && numeral(vbondPriceSell).format(0, 0)}{" "}
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
              checkTransferLimitedVbond(listScheduleRestricted, bond_ex)}
            <p className="tc">
              <u className="pointer" onClick={handleBack}>
                {lang["Back"]}
              </u>
            </p>
          </section>
        </div>
      )}

      {typeBond === "d-bond" && (
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
                <span className="detail">{lang["normalInvestor"]}</span>
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
                  <th className="text-l txt-bold">
                    {bondInfo && nameTypebond(bondInfo)}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-l t-gray">{lang["Issuer"]}</td>
                  <td className="text-l txt-bold">{bond.issuer}</td>
                </tr>
                <tr>
                  <td className="text-l t-gray">{lang["bondCode"]}</td>
                  <td className="text-l txt-bold">{bond.bond_code}</td>
                </tr>
                <tr>
                  <td className="text-l t-gray">{lang["originalBond"]}</td>
                  <td className="text-l txt-bold">
                    {coupon ? coupon.originalPaperCode : "-"}
                  </td>
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

            {checkListTransferLimitedDbond(listScheduleRestricted) ? (
              <div className="warning65">
                <i style={{ display: "inline-block", marginRight: 5 }}>
                  {lang["transferLimited"]}
                </i>
                <span
                  data-tip
                  data-for={`tip-transferLimited`}
                  data-class="bottom-tooltip"
                >
                  <i className="fa fa-info-circle cPointer" />
                </span>
                <ReactTooltip
                  id={`tip-transferLimited`}
                  effect="solid"
                  place="bottom"
                >
                  <p>
                    {langLocal === "vi"
                      ? checkListTransferLimitedDbond(listScheduleRestricted)
                          .reason_vn
                      : checkListTransferLimitedDbond(listScheduleRestricted)
                          .reason_eng}
                  </p>
                </ReactTooltip>
              </div>
            ) : (
              <div>
                {bond_ex.for_professional_investor ? (
                  <div>
                    {authInfo.isProInvestor && (
                      <div className="btn-group">
                        <button
                          onClick={() => {
                            handleCheckBuyDbond(listScheduleRestricted, bond);
                          }}
                          className="btn-buy txt-upper"
                        >
                          {lang["buy"]}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
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
                    </div>
                  </div>
                )}
              </div>
            )}
            <p className="tc">
              <u className="pointer" onClick={handleBack}>
                {lang["Back"]}
              </u>
            </p>
          </section>
        </div>
      )}
      {statusAccountRegisBond && (
        <StatusAccountRegistration
          {...statusAccountRegisBond}
          onClose={() => setStatusAccountRegisBond(false)}
        />
      )}
      {regisSingleBond && (
        <FlowSingleBond
          {...props}
          handleClose={() => setRegisSingleBond(false)}
        />
      )}
      {popup.status && <PopupContainer {...props} />}
    </div>
  );
}

const mapStateToProps = ({ bondStore, customerStore, popupStore }) => {
  return {
    bonds: bondStore.bonds,
    products: bondStore.fullProducts,
    scheduleRestrictedList: bondStore.scheduleRestrictedList,
    ownerAccount: customerStore.ownerAccount,
    popup: popupStore,
  };
};

export default connect(mapStateToProps)(BondDetail)