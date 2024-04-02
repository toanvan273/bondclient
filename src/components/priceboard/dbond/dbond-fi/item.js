import React, { Component } from "react";
import { Link } from "react-router";
import ReactTooltip from "react-tooltip";
import { check2AuthBeforeRedirect } from "../../../../helpers";
import {
  checkRequestOpenAccSinglebond,
  getBondPricing,
  getCoupon,
  getInfoSingleAccount,
} from "../../../../clients/bond.api.client";
import numeral from "numeral";
import FlowSingleBond from "../../popup/flow.singlebond";
import StatusAccountRegistration from "../../popup/status.account";
import moment from "moment";
import { openPopup } from "../../../../actions/customer.actions";

export default class FiItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buyPrice: "",
      productName: "",
      regisSingleBond: false,
      statusAccountRegisBond: false,
    };
  }

  componentDidMount() {
    getBondPricing(this.props.product, "NB", null, 0).then((res) => {
      if (res.data.price) this.setState({ buyPrice: res.data.price });
    });
    this.getProductName(this.props.product.bond_code);
  }

  componentWillReceiveProps(n) {
    if (this.props.product !== n.product) {
      this.setState({
        buyPrice: "",
      });
      getBondPricing(n.product, "NB", null, 0)
        .then((res) => {
          if (res.data.price) this.setState({ buyPrice: res.data.price });
        })
        .catch((e) => {
          this.setState({ buyPrice: "" });
        });
      this.getProductName(n.product.bond_code);
    }
  }

  getProductName(bond_code) {
    let langLocal = localStorage.getItem("lang")
      ? localStorage.getItem("lang")
      : "vi";
    getCoupon(bond_code)
      .then((res) => {
        if (res.data) {
          this.setState({
            coupon: res.data,
            productName:
              res.data &&
              (langLocal === "vi" ? res.data.otherName : res.data.otherNameEn),
          });
        }
      })
      .catch(() => {
        this.setState({ productName: bond_code });
      });
  }

  getDayFromTerm(term) {
    switch (term.term_unit) {
      case "D":
        return term.term;
      case "M":
        return term.term * 30;
      case "Y":
        return term.term * 365;
      default:
        return term.term;
    }
  }

  getRangeRate(rate) {
    if (rate && rate.terms && rate.terms.length > 0) {
      let min = rate.terms[0].rate,
        max = rate.terms[0].rate;
      rate.terms.map((term) => {
        if (term.rate > max) max = term.rate;
        if (term.rate < min) min = term.rate;
        return true;
      });
      if (min === max) return `${this.props.lang["to"]} ${min}%`;
      return `${this.props.lang["from"]} ${min} ${this.props.lang["to"]} ${max}`;
    }
  }

  fetchInfoSingleAccount = () => {
    const { accountInfo, product, termRateId } = this.props;
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
            this.props.dispatch(
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
            this.props.dispatch(
              openPopup({
                type: "notiday-transaction",
                data,
              })
            );
            return;
          }
          check2AuthBeforeRedirect(
            `/dat-mua/${product.bond_code}/${product.product_type}?termRateId=${termRateId}`
          );
        }
      });
    }
  };

  handleCheckCustomerProduct = () => {
    const { ownerAccount } = this.props;
    const customerProduct = ownerAccount.customerProduct;
    const statusRegisted = ["IN_PROGRESS", "CONTRACTIVE", "COMPLETED"];
    const codeExit =
      customerProduct && customerProduct.find((e) => e.code === "03003001");
    if (codeExit && statusRegisted.includes(codeExit.status)) {
      this.fetchInfoSingleAccount();
    } else {
      this.setState({ regisSingleBond: true });
    }
  };

  getRequestOpenAccSinglebond = () => {
    checkRequestOpenAccSinglebond()
      .then((res) => {
        if (res.data) {
          const pendingAccount = res.data.find(
            (e) => e.status === "PENDING" || e.status === "CONFIRMED"
          );
          if (pendingAccount) {
            this.setState({ statusAccountRegisBond: pendingAccount });
          } else {
            this.handleCheckCustomerProduct();
          }
        }
      })
      .catch((err) => console.log({ err }));
  };

  renderIconListed = () => {
    const { lang, bonds, product } = this.props;
    const bondDetail = bonds[product.bond_code];
    if (bondDetail && bondDetail.custodyCenter === "001") return null;
    if (product.for_professional_investor) {
      return (
        <span data-tip data-for="tip-professional" data-class="right-tooltip">
          <i className="fa fa-bookmark" style={{ marginLeft: "5px" }} />
          <ReactTooltip id="tip-professional" effect="solid" place="right">
            <p>{lang["bondForProInvest"]}</p>
          </ReactTooltip>
        </span>
      );
    }
  };

  genLabelBond = (typeBond, coupon, bond_code) => {
    const langLocal = localStorage.getItem("lang")
      ? localStorage.getItem("lang")
      : "vi";
    const shortName =
      coupon && (langLocal === "vi" ? coupon.otherName : coupon.otherNameEn);
    switch (typeBond) {
      case 1:
        return shortName || bond_code;
      case 2:
        return bond_code;
      case 3:
        return coupon && coupon.originalPaperCode
          ? coupon.originalPaperCode
          : bond_code;
      default:
        return;
    }
  };

  checkListTransferLimited = (list) => {
    if (list.length === 0) return null;
    const today = moment();
    const data = list.find((e) => {
      return (
        (today.isSameOrAfter(moment(e.start_date, "YYYY-MM-DD")) &&
          today.isSameOrBefore(moment(e.end_date, "YYYY-MM-DD"))) ||
        (e.start_date === e.end_date &&
          today.format("YYYY-MM-DD") === e.end_date)
      );
    });
    if (
      data &&
      (data.product_type === "ALL" || data.product_type === "FIX") &&
      (data.side === "ALL" || data.side === "NB")
    ) {
      return data;
    }
    return null;
  };

  checkListTransferLimitedv1 = (list, product_type) => {
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

  handleCheckBuy = (listSR) => {
    const { product } = this.props;
    const data = this.checkListTransferLimitedv1(listSR, product.product_type);
    if (
      data &&
      moment(data.start_date, "YYYY-MM-DD").diff(moment(), "days") < 30
    ) {
      this.props.dispatch(
        openPopup({
          type: "transfer-limitation",
          data: data,
          product_type: product.product_type,
          funCallBack: () => {
            this.makeRequest();
          },
        })
      );
      return;
    }
    this.makeRequest();
  };

  makeRequest = () => {
    const { bonds, product, termRateId, ownerAccount } = this.props;
    const detailBond = bonds[product.bond_code];
    if (detailBond && detailBond.custodyCenter == "003") {
      const statusRegisted = ["IN_PROGRESS", "CONTRACTIVE", "COMPLETED"];
      const codeExit = ownerAccount?.customerProduct.find(
        (e) => e.code === "03003001"
      );
      if (codeExit && statusRegisted.includes(codeExit.status)) {
        check2AuthBeforeRedirect(
          `/dat-mua/${product.bond_code}/${product.product_type}?termRateId=${termRateId}`
        );
      } else {
        this.getRequestOpenAccSinglebond();
      }
    } else {
      check2AuthBeforeRedirect(
        `/dat-mua/${product.bond_code}/${product.product_type}?termRateId=${termRateId}`
      );
    }
  };

  render() {
    const {
      bonds,
      product,
      lang,
      isProInvestor,
      filterAmount,
      typeBond,
      scheduleRestrictedList,
    } = this.props;
    // console.log("Item--props", this.props);
    const { buyPrice, regisSingleBond, statusAccountRegisBond, coupon } =
      this.state;
    const langLocal = localStorage.getItem("lang")
      ? localStorage.getItem("lang")
      : "vi";

    if (filterAmount) {
      let amount = parseInt(filterAmount.replace(/,/g, ""));
      let x = amount / buyPrice;
      if (x < product.min_balance || x > product.remain_limit) {
        return null;
      }
    }
    const bondDetail = bonds[product.bond_code];
    const listScheduleRestricted = scheduleRestrictedList
      ? scheduleRestrictedList
          .filter((e) => e.bond_code === product.bond_code)
          .sort((a, b) => {
            return moment(a.start_date, "YYYY-MM-DD").isAfter(
              moment(b.start_date, "YYYY-MM-DD")
            )
              ? 1
              : -1;
          })
      : [];
    const dataSR = this.checkListTransferLimited(listScheduleRestricted);
    return (
      <tr>
        <td className="txt-left" style={{ minWidth: "150px" }}>
          <Link
            to={`/trai-phieu/${product.bond_code}/${product.product_type}`}
            className="btn btn-primary btn-detail"
          >
            <span
              className={
                bondDetail && bondDetail.custodyCenter === "001"
                  ? "public-bond"
                  : ""
              }
            >
              {this.genLabelBond(typeBond, coupon, product.bond_code)}
            </span>
            {this.renderIconListed()}
          </Link>
        </td>
        <td>
          {buyPrice
            ? buyPrice <= 0
              ? "-"
              : numeral(buyPrice).format(0, 0)
            : "-"}
        </td>
        <td>
          {product.min_balance
            ? product.min_balance < 0
              ? "-"
              : numeral(product.min_balance).format(0, 0)
            : product.min_balance === 0
            ? 0
            : "-"}
        </td>
        <td>
          {product.max_balance
            ? numeral(product.max_balance).format(0, 0)
            : "-"}
        </td>
        <td>
          {product.remain_limit
            ? product.remain_limit < 0
              ? "-"
              : numeral(product.remain_limit).format(0, 0)
            : product.remain_limit === 0
            ? 0
            : "-"}
        </td>
        <td>
          {statusAccountRegisBond && (
            <StatusAccountRegistration
              {...statusAccountRegisBond}
              onClose={() => this.setState({ statusAccountRegisBond: false })}
            />
          )}
          {regisSingleBond && (
            <FlowSingleBond
              {...this.props}
              handleClose={() => {
                this.setState({ regisSingleBond: false });
              }}
            />
          )}

          {dataSR ? (
            <div>
              <i style={{ display: "inline-block", marginRight: 5 }}>
                {lang["transferLimited"]}
              </i>
              <span
                data-tip
                data-for={`tip-transferLimited_${product.bond_code}_${product.product_type}`}
                data-class="bottom-tooltip"
              >
                <i className="fa fa-info-circle cPointer" />
              </span>
              <ReactTooltip
                id={`tip-transferLimited_${product.bond_code}_${product.product_type}`}
                effect="solid"
                place="left"
              >
                <p>
                  {langLocal === "vi" ? dataSR.reason_vn : dataSR.reason_eng}
                </p>
              </ReactTooltip>
            </div>
          ) : (
            <div>
              {(!product.for_professional_investor || isProInvestor) && (
                <button
                  className="btn btn-success btn-buy"
                  onClick={() => {
                    this.handleCheckBuy(listScheduleRestricted);
                  }}
                >
                  {lang["buy"]}
                </button>
              )}
            </div>
          )}
        </td>
      </tr>
    );
  }
}
