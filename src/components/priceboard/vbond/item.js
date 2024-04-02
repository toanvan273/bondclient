import React, { Component } from "react";
import { Link } from "react-router";
import ReactTooltip from "react-tooltip";
import moment from "moment";
import numeral from "numeral";
import { check2AuthBeforeRedirect } from "../../../helpers";
import {
  checkRequestOpenAccSinglebond,
  getBondPricing,
  getCoupon,
  getInfoSingleAccount,
} from "../../../clients/bond.api.client";
import FlowSingleBond from "../popup/flow.singlebond";
import StatusAccountRegistration from "../popup/status.account";
import { openPopup } from "../../../actions/customer.actions";

export default class VBond extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buyPrice: "",
      sellPrice: "",
      regisSingleBond: false,
      statusAccountRegisBond: false,
    };
  }
  langLocal = localStorage.getItem("lang")
    ? localStorage.getItem("lang")
    : "vi";
  componentDidMount() {
    getBondPricing(this.props.bond, "NB", null, 0).then((res) => {
      if (res.data.price) this.setState({ buyPrice: res.data.price });
    });
    getBondPricing(this.props.bond, "NS", null, 0).then((res) => {
      if (res.data.price) this.setState({ sellPrice: res.data.price });
    });
    this.getProductName(this.props.bond.bond_code);
  }

  componentWillReceiveProps(n) {
    if (this.props.bond !== n.bond) {
      this.setState({
        buyPrice: "",
        sellPrice: "",
      });
      getBondPricing(n.bond, "NB", null, 0)
        .then((res) => {
          if (res.data.price) this.setState({ buyPrice: res.data.price });
        })
        .catch((e) => {
          this.setState({ buyPrice: "" });
        });
      getBondPricing(n.bond, "NS", null, 0)
        .then((res) => {
          if (res.data.price) this.setState({ sellPrice: res.data.price });
        })
        .catch((e) => {
          this.setState({ sellPrice: "" });
        });
    }
  }

  getProductName(bond_code) {
    getCoupon(bond_code)
      .then((res) => {
        if (res.data) {
          this.setState({
            coupon: res.data,
          });
        }
      })
      .catch(() => {
        this.setState({ productName: bond_code });
      });
  }

  fetchInfoSingleAccount = () => {
    const { bond, accountInfo } = this.props;
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
            `/dat-mua/${bond.bond_code}/${bond.product_type}`
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
    checkRequestOpenAccSinglebond().then((res) => {
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
    });
  };

  handleCheckBuy = (bond) => {
    const { bonds } = this.props;
    const detailBond = bonds[bond.bond_code];
    if (detailBond && detailBond.custodyCenter == "003") {
      this.getRequestOpenAccSinglebond();
    } else {
      check2AuthBeforeRedirect(
        `/dat-mua/${bond.bond_code}/${bond.product_type}`
      );
    }
  };

  renderIconListed = (bondDetail) => {
    const { lang, bond } = this.props;
    if (bondDetail && bondDetail.custodyCenter === "001") return null;
    if (bond.for_professional_investor) {
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

  handleCheckBuy = (listSR, bond) => {
    const data = this.checkTimeBeforeTransferLimited(listSR, bond.product_type);
    if (data) {
      this.props.dispatch(
        openPopup({
          type: "transfer-limitation",
          data: data,
          product_type: bond.product_type,
          funCallBack: () => {
            this.makeRequestBuy(bond);
          },
        })
      );
      return;
    }
    this.makeRequestBuy(bond);
  };

  makeRequestBuy = (bond) => {
    const { bonds } = this.props;
    const detailBond = bonds && bonds[bond.bond_code];
    if (detailBond && detailBond.custodyCenter == "003") {
      this.getRequestOpenAccSinglebond();
    } else {
      check2AuthBeforeRedirect(
        `/dat-mua/${bond.bond_code}/${bond.product_type}`
      );
    }
  };

  handleCheckSell = (listSR, bond) => {
    const data = this.checkTimeBeforeTransferLimited(listSR, bond.product_type);
    if (data) {
      this.props.dispatch(
        openPopup({
          type: "transfer-limitation",
          data: data,
          product_type: bond.product_type,
          funCallBack: () => {
            check2AuthBeforeRedirect(
              `/dat-ban/${bond.bond_code}/${bond.product_type}`
            );
          },
        })
      );
      return;
    }
    check2AuthBeforeRedirect(`/dat-ban/${bond.bond_code}/${bond.product_type}`);
  };

  checkTimeBeforeTransferLimited = (list, product_type) => {
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

  checkTransferLimited = (list, bond) => {
    const { isProInvestor, lang } = this.props;
    const langLocal = localStorage.getItem("lang")
      ? localStorage.getItem("lang")
      : "vi";
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
      (data.product_type === "ALL" || data.product_type === bond.product_type)
    ) {
      switch (data.side) {
        case "ALL":
          return (
            <div>
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
                <p>{langLocal === "vi" ? data.reason_vn : data.reason_eng}</p>
              </ReactTooltip>
            </div>
          );
        case "NS":
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                {(!bond.for_professional_investor || isProInvestor) && (
                  <button
                    className="btn btn-success btn-buy"
                    onClick={() => this.handleCheckBuy(list, bond)}
                  >
                    {lang["buy"]}
                  </button>
                )}
              </div>
              <div style={{ minWidth: 54 }}>
                <div>
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
            </div>
          );
        case "NB":
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ marginRight: 10 }}>
                <div>
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
              {/* <div style={{ minWidth: 54 }}>
                <button
                  className="btn btn-error btn-buy"
                  style={{ marginRight: 0 }}
                  onClick={() => this.handleCheckSell(list, bond)}
                >
                  {lang["sell"]}
                </button>
              </div> */}
            </div>
          );
        default:
          break;
      }
    }

    if (!data || (data && data.product_type !== bond.product_type)) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
          }}
        >
          <div style={{ minWidth: 54 }}>
            {(!bond.for_professional_investor || isProInvestor) && (
              <button
                className="btn btn-success btn-buy"
                onClick={() => this.handleCheckBuy(list, bond)}
              >
                {lang["buy"]}
              </button>
            )}
          </div>
          {/* <div style={{ minWidth: 54 }}>
            <button
              className="btn btn-error btn-buy"
              style={{ marginRight: 0 }}
              onClick={() => this.handleCheckSell(list, bond)}
            >
              {lang["sell"]}
            </button>
          </div> */}
        </div>
      );
    }
  };

  render() {
    const {
      buyPrice,
      sellPrice,
      regisSingleBond,
      statusAccountRegisBond,
      coupon,
    } = this.state;
    const {
      bond,
      bonds,
      lang,
      filterAmount,
      typeBond,
      scheduleRestrictedList,
    } = this.props;

    let remain =
      bonds && bonds[bond.bond_code]
        ? (bonds[bond.bond_code].par_value * bond.remain_limit) / 1000000000
        : 0;
    if (remain < 0) remain = 0;

    if (filterAmount) {
      let amount = parseInt(filterAmount.replace(/,/g, ""));
      let x = amount / buyPrice;
      if (x < bond.min_balance || x > bond.remain_limit) {
        return null;
      }
    }
    const bondDetail = bonds[bond.bond_code];
    const listScheduleRestricted = scheduleRestrictedList
      ? scheduleRestrictedList
          .filter((e) => e.bond_code === bond.bond_code)
          .sort((a, b) => {
            return moment(a.start_date, "YYYY-MM-DD").isAfter(
              moment(b.start_date, "YYYY-MM-DD")
            )
              ? 1
              : -1;
          })
      : [];

    return (
      <tr>
        <td className="txt-left" style={{ minWidth: "150px" }}>
          <Link
            to={`/trai-phieu/${bond.bond_code}/${bond.product_type}`}
            className="btn btn-primary btn-detail"
          >
            <span
              className={
                bondDetail && bondDetail.custodyCenter === "001"
                  ? "public-bond"
                  : ""
              }
            >
              {this.genLabelBond(typeBond, coupon, bond.bond_code)}
            </span>
            {this.renderIconListed(bondDetail)}
          </Link>
        </td>
        <td>
          {bondDetail && moment(bondDetail.maturity_date).format("DD/MM/YYYY")}
        </td>
        <td style={{ minWidth: "120px" }}>
          {bond.yield}%/{lang["year"]}
        </td>
        <td style={{ minWidth: "120px" }}>
          {buyPrice
            ? buyPrice <= 0
              ? "-"
              : numeral(buyPrice).format(0, 0)
            : "-"}
        </td>
        <td style={{ minWidth: "120px" }}>
          {sellPrice
            ? sellPrice <= 0
              ? "-"
              : numeral(sellPrice).format(0, 0)
            : "-"}
        </td>
        <td>
          {bond.min_balance
            ? bond.min_balance < 0
              ? "-"
              : numeral(bond.min_balance).format(0, 0)
            : bond.min_balance === 0
            ? 0
            : "-"}
        </td>
        <td>
          {bond.max_balance ? numeral(bond.max_balance).format(0, 0) : "-"}
        </td>
        <td>
          {bond.remain_limit
            ? bond.remain_limit < 0
              ? "-"
              : numeral(bond.remain_limit).format(0, 0)
            : bond.remain_limit === 0
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
          <div
            style={{
              minWidth: "130px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {this.checkTransferLimited(listScheduleRestricted, bond)}
          </div>
        </td>
      </tr>
    );
  }
}
