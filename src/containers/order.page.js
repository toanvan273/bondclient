import React, { Component } from "react";
import { connect } from "react-redux";
import ReactTooltip from "react-tooltip";
import cl from "classnames";
import {
  getBondInfo,
  getTableRate,
  getBondPricing,
  getMarketMaker,
  addDealsV2,
  getUserByHrCode,
  getTax,
  getLeg2TradeDate,
  getPromotion,
  getValidRefer,
  getAvailableWithdraw,
  getAssets,
  getReferFullName,
  getSale,
  getSettleDate,
  getCoupon,
  getDayBackBond,
  getMembership,
  getDomainUser,
  getBase64Contract,
  getItemExplainBond,
  getNavParvalue,
  checkRequestOpenAccSinglebond,
  getTemporaryFee,
  getLeg2SettleDate,
  getInfoSingleAccount,
} from "../clients/bond.api.client";
import { _getBankReceiveAccounts } from "../clients/transaction.api.client";
import * as AuthService from "../services/auth.service";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  displayNoti,
  removeAccents,
  checkTypebond,
  getTermUnit,
  isBusinessCustomer,
  timeServer,
  timeUnitServer,
} from "../helpers";
import { parseErrorMessage } from "../modules/error_parser/error.parser.v2";
import { trackVNDA } from "../modules/tracker";
import numeral from "numeral";
import { numberPrecision, addDecimals } from "../common/utils";
import AccountsSuggestion from "../common/accounts.suggestion";
import PopupContainer from "../components/popup/index";
import BondInfo from "../components/orderpage/bond.info";
import OptionBond from "../components/orderpage/bondcode.option";
import { openPopup } from "../actions/customer.actions";
import wa from "../resource/images/warm.svg";
import StatusAccountRegistration from "../components/priceboard/popup/status.account";
import FlowSingleBond from "../components/priceboard/popup/flow.singlebond";

class OrderPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      availableWithdraw: 0,
      side: "NB",
      optionSide: [],
      bondInfo: null,
      terms: [],
      price: "",
      priceOutrightBeforePromotion: "",
      quantity: 0,
      term_name: "",
      market_makers: [],
      account_no: "",
      account_name: "",
      custodyID: "",
      newExpiredDate: timeUnitServer(),
      leg2date: "",
      term: null,
      bankAccounts: [],
      bankSelected: null,
      bond_payment_type: "VND",
      careby_code: "",
      careby_full_name: "",
      refer: "",
      refer_full_name: "",
      isShowRefer: false,
      error: null,
      acceptTerm: false,
      processing: false,
      tax: null,
      bond_certificate: false,
      promotion: {
        promotion: 0,
        promotion_code: 0,
        promotion_nav: 0,
      },
      codePromotion: "",
      requestId: Math.floor(Date.now() / 1000) - new Date().getSeconds(),
      listSale: [],
      selectedSale: "",
      settledDate: "",
      statusAccountRegisBond: false,
      regisSingleBond: false,
      temporary_fee_rate: 0,
      leg2SettledDate: "",
    };
    this.changeTerm = this.changeTerm.bind(this);
    this.changeQuantity = this.changeQuantity.bind(this);
    this.changeAccountNo = this.changeAccountNo.bind(this);
    this.handleChangeExpireDate = this.handleChangeExpireDate.bind(this);
    this.changeBondPayment = this.changeBondPayment.bind(this);
    this.changeCarebyCode = this.changeCarebyCode.bind(this);
    this.handeBlurCarebyCode = this.handeBlurCarebyCode.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.changeSide = this.changeSide.bind(this);
    this.changeBondCode = this.changeBondCode.bind(this);
    this.changeAcceptTerm = this.changeAcceptTerm.bind(this);
    this.changeBank = this.changeBank.bind(this);
    this.changeRefer = this.changeRefer.bind(this);
    this.getPromotion = this.getPromotion.bind(this);
    this.handleChangeSale = this.handleChangeSale.bind(this);
    this.pending = false;
    this.processing = false;
  }

  handleChangeSale(e) {
    const sale = e.target.value;
    const state = { selectedSale: e.target.value };
    if (["no", "enter"].includes(sale)) {
      state.careby_code = "";
      state.careby_full_name = "";
    } else {
      const selected = this.state.listSale.find((item) => item.hrcode === sale);
      state.careby_code = sale;
      state.careby_full_name = selected.saleFullName;
    }
    this.setState(state, () => {
      this.getPromotion();
      window.resize();
    });
  }

  getPromotion(event) {
    this.pending = true;
    const changeCodePromotion = event !== undefined;
    if (changeCodePromotion) this.setState({ errorCodePromotion: "" });
    setTimeout(() => {
      const {
        bondInfo,
        account_no,
        quantity,
        side,
        codePromotion,
        newExpiredDate,
        careby_code,
      } = this.state;
      if (bondInfo) {
        getPromotion(
          bondInfo.product_type,
          account_no,
          bondInfo.bond_code,
          quantity || 0,
          side,
          codePromotion,
          moment(newExpiredDate).format("YYYY-MM-DD"),
          careby_code,
          numberPrecision(bondInfo.yield)
        )
          .then((res) => {
            if (res && res.data) {
              this.setState(
                {
                  promotion: res.data,
                  errorCodePromotion: "",
                },
                () => {
                  this.loadPricing(moment(newExpiredDate).format("YYYY-MM-DD"));
                }
              );
            }
          })
          .catch((e) => {
            this.setState({ promotion: {} }, () => {
              this.loadPricing(moment(newExpiredDate).format("YYYY-MM-DD"));
            });
            if (e && e.response && e.response.data) {
              this.setState({
                errorCodePromotion: parseErrorMessage(e.response.data),
              });
            }
          })
          .finally(() => {
            this.pending = false;
          });
      } else {
        this.setState({ promotion: {} }, () => {
          this.loadPricing(moment(newExpiredDate).format("YYYY-MM-DD"));
          this.pending = false;
        });
      }
    }, 500);
  }

  loadPricing = (valueDate = moment().format("YYYY-MM-DD")) => {
    const { bondInfo, side, promotion } = this.state;
    if (!bondInfo) return;
    getBondPricing(bondInfo, side, valueDate, promotion.promotion).then((res) =>
      this.setState({
        price: res.data.price,
        priceOutrightBeforePromotion: res.data.priceOutrightBeforePromotion,
      })
    );
  };

  changeSide(e) {
    this.setState(
      {
        side: e.target.value,
        newExpiredDate: moment(),
      },
      () => {
        this.getPromotion();
      }
    );
  }
  exportBondCode = (str) => {
    return str ? str.substring(str.indexOf("-") + 1) : "";
  };
  changeBondCode(e) {
    const bondCode = e.target.value;
    const { bonds } = this.props;
    this.setState(
      {
        // side: 'NB',
        newExpiredDate: timeUnitServer(),
      },
      () => {
        let bond_code = this.exportBondCode(bondCode);
        if (bonds && bonds[bond_code]) {
          this.checkPayment(bonds[bond_code]);
        }
        this.getBondInfo(bondCode);
        this._getCoupon(bond_code);
        this.fetchExplainBond(bond_code);
        getSettleDate(
          moment(this.state.newExpiredDate).format("YYYY-MM-DD"),
          bond_code
        ).then((res) => {
          if (res && res.data) {
            this.setState({
              settledDate: moment(res.data.settledDate).format("DD/MM/YYYY"),
            });
          }
        });
      }
    );
  }

  checkPayment = (bond) => {
    const { lang } = this.props;
    getDomainUser().then((res) => {
      if (res.data) {
        const { data } = res;
        let count = 0;
        if (bond.payment_in_vnd === "Y") {
          // qua VND
          for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (
              item.domain === "CUSTOMER_TYPE" &&
              (item.membershipType === "ACTIVE" ||
                item.membershipType === "VERIFIED_ID")
            ) {
              count++;
              break;
            }
          }
          if (count > 0) {
            this.setState({ errorBankAccount: null });
          } else {
            this.setState({ errorBankAccount: lang["errorBankAccount"] });
          }
        } else {
          // qua Bank
          for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (
              item.domain === "CUSTOMER_TYPE" &&
              (item.membershipType === "ACTIVE" ||
                item.membershipType === "VERIFIED_SIGNATURE")
            ) {
              count++;
              break;
            }
          }
          if (count > 0) {
            this.setState({ errorBankAccount: null });
          } else {
            this.setState({ errorBankAccount: lang["errorBankAccount"] });
          }
        }
      }
    });
  };

  handeBlurCarebyCode(e) {
    getUserByHrCode(e.target.value)
      .then((res) => {
        if (res && res.data) {
          this.setState(
            { careby_full_name: res.data.userFullName, errorCareby: null },
            () => {
              this.getPromotion(e);
            }
          );
        } else {
          this.setState({ careby_full_name: "" });
          this.getPromotion(e);
        }
      })
      .catch((err) => {
        if (err && err.response && err.response.data) {
          displayNoti(parseErrorMessage(err.response.data), "error");
          this.setState({
            careby_full_name: "",
            errorCareby: parseErrorMessage(err.response.data),
          });
          this.getPromotion(e);
        }
      });
  }

  changeCarebyCode(e) {
    this.setState({ careby_code: e.target.value.replace(/ /g, "") });
  }

  changeBondPayment(e) {
    this.setState({ bond_payment_type: e.target.value });
  }

  changeAccountNo(acc) {
    if (acc) {
      this.setState(
        {
          account_no: acc.accountNumber,
          account_name: acc.fullName,
          custodyID: acc.custodyID,
        },
        () => {
          this._getMembership(acc.accountNumber);
          // this.getBankReceiveAccounts(acc.accountNumber);
          this.getTax(acc.accountNumber);
          this.getPromotion();
          this.getAvailableWithdraw(acc.accountNumber);
          this.getOutRightAsset(acc.accountNumber);
          const { quantity, bondInfo } = this.state;
          if (quantity && bondInfo) {
            this.loadNavParvalue(quantity);
          }
        }
      );
    }
  }

  getAvailableWithdraw(accountNumber) {
    getAvailableWithdraw(accountNumber).then((res) => {
      res &&
        res.data &&
        this.setState({
          availableWithdraw: res.data.availableWithdraw,
        });
    });
  }

  getOutRightAsset(accountNumber) {
    getAssets({
      accountNumber,
      productType: "OUTRIGHT",
    }).then((res) => {
      res &&
        res.data &&
        this.setState({
          outRightAsset: res.data.content,
        });
    });
  }

  getBankReceiveAccounts(accountNumber) {
    const { account_name } = this.state;
    _getBankReceiveAccounts(accountNumber).then((res) => {
      if (account_name && res && res.data && res.data.length > 0) {
        const bankAccounts = res.data.filter(
          (bankAccount) =>
            bankAccount.fullName &&
            removeAccents(bankAccount.fullName.normalize())
              .toLowerCase()
              .replace(/\s+/g, "") ===
              removeAccents(account_name.normalize())
                .toLowerCase()
                .replace(/\s+/g, "")
        );
        this.setState({
          bankAccounts: bankAccounts || [],
          bankSelected: bankAccounts ? bankAccounts[0] : null,
        });
      } else {
        this.setState({
          bankAccounts: [],
          bankSelected: null,
        });
      }
    });
  }

  _getMembership = (accountNo) => {
    const { lang } = this.props;
    getMembership(accountNo)
      .then((res) => {
        const { data } = res;
        if (data.pageItems && data.pageItems.length > 0) {
          const dataCheck = data.pageItems[0];
          if (
            dataCheck.domain !== "CUSTOMER_ACCOUNT" ||
            dataCheck.membershipType !== "ACTIVE"
          ) {
            this.setState({ errorAccount: lang["errorAccount"] });
          } else {
            this.setState({ errorAccount: null });
          }
        } else {
          this.setState({ errorAccount: null });
        }
      })
      .catch((err) => {
        this.setState({ errorAccount: null });
      });
  };

  getTax(accountNumber) {
    getTax(accountNumber).then((res) => {
      this.setState({
        tax: res.data,
      });
    });
  }

  changeBank(e) {
    this.setState({
      bankSelected: JSON.parse(e.target.value),
    });
  }

  changeAcceptTerm() {
    this.setState({
      acceptTerm: !this.state.acceptTerm,
    });
  }

  getHighestTerm(terms) {
    let hightest_term = 0;
    let max = 0;
    terms.map((term) => {
      if (max < this.convertTermToDate(term)) {
        max = this.convertTermToDate(term);
        hightest_term = term;
      }
      return false;
    });
    return hightest_term;
  }

  changeTerm(e) {
    let { terms, newExpiredDate, bondInfo } = this.state;
    if (!bondInfo) return;
    let term = terms.filter(
      (term) => term.termRateId.toString() === e.target.value.toString()
    )[0];
    if (bondInfo.product_type === "VAR") term = this.getHighestTerm(terms);
    this.calculateLeg2TradeDate(
      bondInfo.product_type,
      moment(newExpiredDate).format("DD/MM/Y"),
      term,
      (leg2date) => {
        leg2date = leg2date ? moment(leg2date).format("DD/MM/Y") : "";
        this.setState({ leg2date, dayBackBond: null });
      }
    );
  }

  getMarketMaker() {
    getMarketMaker().then((res) => {
      this.setState({ market_makers: res.data.content });
    });
  }

  getBondInfo(product_id) {
    const [product_type, bond_code] = product_id.split("-");
    let { bonds, authInfo } = this.props;
    const isProInvestor = authInfo.isProInvestor;
    let optionSide = [];
    if (product_type && bond_code) {
      getBondInfo(product_type, bond_code).then((res) => {
        if (isProInvestor) {
          optionSide.push({
            value: "NB",
            type: "buy",
          });
        } else {
          if (
            res.data.product_type !== "OUTRIGHT" ||
            (res.data.product_type == "OUTRIGHT" &&
              !res.data.for_professional_investor)
          ) {
            optionSide.push({
              value: "NB",
              type: "buy",
            });
          }
        }

        if (res.data.product_type == "OUTRIGHT") {
          optionSide.push({
            value: "NS",
            type: "sell",
          });
        }
        this.setState(
          {
            bondInfo: res.data,
            optionSide,
            side: optionSide[0] && optionSide[0].value,
          },
          () => {
            let bond_detail = null;
            try {
              bond_detail = Object.values(this.props.bonds).filter(
                (bond) => bond.bond_code === bond_code
              );
              bond_detail = bond_detail[0];
            } catch (err) {}
            const { quantity, account_no } = this.state;
            if (quantity && account_no) {
              this.loadNavParvalue(quantity);
            }
            if (bond_detail)
              this.setState({
                bond_payment_type:
                  bond_detail.payment_in_vnd &&
                  bond_detail.payment_in_vnd === "Y"
                    ? "VND"
                    : "BANK",
              });
            this.loadPricing(
              moment(this.state.newExpiredDate).format("YYYY-MM-DD")
            );

            getTableRate(this.state.bondInfo.table_rate_id)
              .then((res) => {
                this.setState(
                  { terms: res.data.terms, term_name: res.data.name },
                  () => {
                    let { terms, newExpiredDate } = this.state;
                    let term = terms[0];
                    if (res.data.product_type === "VAR")
                      term = this.getHighestTerm(terms);
                    this.calculateLeg2TradeDate(
                      res.data.product_type,
                      moment(newExpiredDate).format("DD/MM/Y"),
                      term,
                      (leg2date) => {
                        leg2date = leg2date
                          ? moment(leg2date).format("DD/MM/Y")
                          : "";
                        this.setState({ leg2date, term });
                        this.changeTerm({
                          target: {
                            value: terms[0].termRateId,
                          },
                        });
                      }
                    );
                    this.changeTerm({ target: { value: term.termRateId } });
                  }
                );
              })
              .catch(() => {
                this.setState({ term: null, terms: [] });
              });
            this.getPromotion();
          }
        );
      });
    }
  }

  componentDidMount() {
    this.getMarketMaker();
    getSale().then((res) => {
      if (res && res.data && res.data.content) {
        this.setState({
          listSale: res.data.content,
        });
      }
    });

    setTimeout(() => {
      if (this.refs.txtQuantity) this.refs.txtQuantity.select();
      window.resize();
    }, 100);
  }

  componentWillReceiveProps(nextProps) {
    if (
      !this.props.accounts &&
      nextProps.accounts &&
      nextProps.accounts.length > 0
    ) {
      const accounts = nextProps.accounts.filter(
        (acc) => acc.type === "Owner" || acc.type === "Member"
      );
      if (accounts && accounts.length > 0) {
        this.setState(
          {
            account_no: accounts[0].accountNumber,
            account_name: accounts[0].fullName,
            custodyID: accounts[0].custodyID,
          },
          () => {
            this._getMembership(accounts[0].accountNumber);
            // this.getBankReceiveAccounts(accounts[0].accountNumber);
            this.getTax(accounts[0].accountNumber);
            this.getAvailableWithdraw(accounts[0].accountNumber);
            this.getOutRightAsset(accounts[0].accountNumber);
            getValidRefer(accounts[0].accountNumber).then((res) =>
              this.setState({ isShowRefer: res.data.value })
            );
          }
        );
      }
    }
  }

  _getCoupon = async (bondCode) => {
    getCoupon(bondCode).then((res) => {
      if (res.data) {
        this.setState({ coupon: res.data });
        this._getTemporaryFee(bondCode);
      }
    });
  };
  _getTemporaryFee = (bondCode) => {
    getTemporaryFee(bondCode).then((res) => {
      if (res.data) {
        this.setState({ temporary_fee_rate: res.data.temporary_fee_rate });
      }
    });
  };
  changeQuantity(e) {
    this.setState({ quantity: numeral(e.target.value).value() }, () => {
      const { quantity } = this.state;
      this.loadNavParvalue(quantity);
    });
    this.getPromotion();
  }

  loadNavParvalue = (quantity) => {
    const { bondInfo, account_no, side } = this.state;
    if (!bondInfo || !account_no) return;
    if (side === "NB" && bondInfo.product_type === "FIX") {
      const payload = {
        accountNo: this.state.account_no,
        bondCode: bondInfo.bond_code,
        quantity,
      };
      getNavParvalue(payload).then((res) => {
        if (res.data) {
          const { navParvalue } = res.data;
          this.setState(
            {
              navParvalue,
            },
            () => {
              const { bondInfo, leg2date, dayBackBond, leg2SettledDate } =
                this.state;
              // const day = dayBackBond ? dayBackBond : this.dayOfTermbyleg2date(leg2date)
              const day = dayBackBond
                ? dayBackBond
                : this.toLeg2Settledate(leg2SettledDate);
              this.changeDayBackBond(day, bondInfo);
            }
          );
        }
      });
    }
  };

  toLeg2Settledate = (date) =>
    date ? moment(date, "YYYY-MM-DD").toDate() : null;

  handleChangeExpireDate(date) {
    const { bondInfo } = this.state;
    if (bondInfo)
      this.setState({ newExpiredDate: date }, () => {
        this.getPromotion();
        let { term, terms, newExpiredDate } = this.state;
        this.loadPricing(moment(newExpiredDate).format("YYYY-MM-DD"));
        if (bondInfo.product_type === "VAR") term = this.getHighestTerm(terms);
        this.calculateLeg2TradeDate(
          bondInfo.product_type,
          moment(newExpiredDate).format("DD/MM/Y"),
          term,
          (leg2date) => {
            leg2date = leg2date ? moment(leg2date).format("DD/MM/Y") : "";
            this.setState({ leg2date });
          }
        );
        getSettleDate(
          moment(this.state.newExpiredDate).format("YYYY-MM-DD"),
          bondInfo.bond_code
        ).then((res) => {
          if (res && res.data) {
            this.setState({
              settledDate: moment(res.data.settledDate).format("DD/MM/YYYY"),
            });
          }
        });
      });
  }

  changeCodePromotion = (e) => {
    this.setState({ codePromotion: e.target.value });
  };

  changeRefer = (e) => {
    this.setState({ refer: e.target.value });
  };

  handeBlurRefer = (e) => {
    if (e.target.value) {
      getReferFullName(e.target.value)
        .then((res) => {
          if (res && res.data) this.setState({ refer_full_name: res.data });
        })
        .catch((e) => {
          if (e && e.response && e.response.data) {
            displayNoti(parseErrorMessage(e.response.data), "error");
          }
        });
    } else {
      this.setState({ refer_full_name: "" });
    }
  };

  calculateLeg2TradeDate(product_type, value_date, term, callback) {
    if (!product_type) return callback("");
    const { bondInfo } = this.state;
    let leg2date = "";
    if (bondInfo && product_type !== "OUTRIGHT" && term && value_date) {
      leg2date = moment(value_date, "DD/MM/Y").add(
        this.convertTermToDate(term),
        "days"
      );
      // getLeg2TradeDate
      getLeg2TradeDate({
        bond_code: bondInfo.bond_code,
        value_date: moment(value_date, "DD/MM/Y").format("Y-MM-DD"),
        product_type,
        terms: [term],
      }).then((res) => {
        if (res && res.data) {
          leg2date = moment(moment(res.data), "DD/MM/Y");
          if (this.state.side === "NB") {
            this.fetchLeg2SettleDate(res.data, term);
          }
        }
        callback(leg2date ? leg2date : "");
      });
    } else {
      callback(leg2date ? leg2date : "");
    }
  }

  fetchLeg2SettleDate = (leg2_tradeDate, termSelected) => {
    const { bondInfo, navParvalue } = this.state;
    getLeg2SettleDate(leg2_tradeDate, bondInfo.bond_code).then((res) => {
      if (res.data) {
        const { settledDate } = res.data;
        const let2Date = moment(moment(settledDate), "YYYY-MM-DD");
        this.setState({
          leg2date: let2Date.format("DD/MM/YYYY"),
          leg2SettledDate: settledDate,
        });
        if (navParvalue) {
          getDayBackBond(
            bondInfo.bond_code,
            bondInfo.product_type,
            settledDate,
            navParvalue
          ).then((res) => {
            const { data } = res;
            if (data && data[0]) {
              this.setState({ term: data[0] });
            }
          });
        } else {
          this.setState({term: termSelected})
        }
      }
    });
  };

  convertTermToDate(term) {
    if (!term) return 0;
    let term_unit = term.term_unit;
    let days = term.term;
    let days_amount = 0;
    if (term_unit === "D") {
      days_amount = days;
    }
    if (term_unit === "M") {
      days_amount = days * 30;
    }
    if (term_unit === "Y") {
      days_amount = days * 365;
    }
    return days_amount;
  }

  fetchExplainBond = (bondCode) => {
    getItemExplainBond(bondCode).then((res) => {
      if (res.data) {
        const { data } = res.data;
        const mydata = data.find((e) => e.code === bondCode);
        if (mydata) this.setState({ bondDocument: mydata });
      }
    });
  };

  checkValidData() {
    this.setState({ error: null });
    const { bonds, lang } = this.props;
    const {
      side,
      bondInfo,
      acceptTerm,
      bond_payment_type,
      bankSelected,
      quantity,
      bankAccounts,
      account_no,
      errorCodePromotion,
      selectedSale,
      careby_code,
    } = this.state;
    if (errorCodePromotion) return false;

    let error = null;
    if (!acceptTerm) {
      error = lang["acceptTermRequired"];
    }

    if (!quantity) {
      error = lang["inputRequired"];
    }
    if (!bondInfo) {
      error = lang["inputRequired"];
    }
    if (!account_no) {
      error = lang["requiredAccountNo"];
    }
    // Check sale selected
    if (!selectedSale) {
      error = lang["select_careby"];
    } else if (selectedSale === "enter" && !careby_code) {
      error = lang["require_careby"];
    }
    //
    if (error) {
      this.setState({ error });
      return false;
    }
    return true;
  }

  handleMakeDeal = (e) => {
    e.preventDefault();
    if (
      this.processing ||
      this.pending ||
      this.state.errorAccount ||
      this.state.errorBankAccount
    )
      return;

    this.processing = true;

    setTimeout(() => {
      if (!this.pending) {
        this.processing = false;
        const isValid = this.checkValidData();
        if (isValid) {
          const { bondInfo } = this.state;
          const { scheduleRestrictedList } = this.props;
          if (!AuthService.isStep2Authenticated()) {
            window.parent.postMessage(["required2Authenticated"], "*");
            return;
          }
          const listScheduleRestricted = scheduleRestrictedList
            ? scheduleRestrictedList
                .filter((e) => e.bond_code === bondInfo.bond_code)
                .sort((a, b) => {
                  return moment(a.start_date, "YYYY-MM-DD").isAfter(
                    moment(b.start_date, "YYYY-MM-DD")
                  )
                    ? 1
                    : -1;
                })
            : [];
          const data = this.checkTransferLimitedSubmit(
            listScheduleRestricted,
            bondInfo.product_type
          );
          if (
            data &&
            moment(data.start_date, "YYYY-MM-DD").diff(moment(), "days") < 30
          ) {
            this.props.dispatch(
              openPopup({
                type: "transfer-limitation",
                data: data,
                product_type: bondInfo.product_type,
                funCallBack: () => {
                  this.handleCheckBuyForProInvestor();
                },
              })
            );
            return;
          }
          this.handleCheckBuyForProInvestor();
        }
      }
    }, 500);
  };

  callApibase64 = (data) => {
    getBase64Contract(data)
      .then((res) => {
        if (res.data) {
          this.props.dispatch(
            openPopup({
              type: "confirm-buy-bond",
              data: res.data,
              funCallBack: (value) => {
                this.setState({ readContract: true }, () => {
                  this.makeDeal();
                });
              },
            })
          );
        }
      })
      .catch((e) => {
        if (e && e.response && e.response.data) {
          if (e.response.data.error === "DPM-2801") {
            const { error, errorMessage, id } = e.response.data;
            this.setState({
              error: `${errorMessage} (${error}) (${id})`,
            });
            return;
          }
          displayNoti(parseErrorMessage(e.response.data), "error");
          this.setState({
            error: parseErrorMessage(e.response.data),
          });
        }
      })
      .finally(() => {
        this.setState({
          processing: false,
        });
        this.processing = false;
      });
  };

  makeDeal() {
    let {
      account_no,
      custodyID,
      quantity,
      newExpiredDate,
      bondInfo,
      bond_payment_type,
      bankSelected,
      careby_code,
      term,
      terms,
      side,
      bond_certificate,
      leg2date,
      price,
      promotion,
      requestId,
      codePromotion,
      refer,
      account_name,
    } = this.state;

    if (!bondInfo) return;

    let bond_code = bondInfo.bond_code;
    // let bond_payment = {
    //   account_name_recv:
    //   bond_payment_type === "BANK" ? bankSelected.fullName : null,
    //   account_receive:
    //     bond_payment_type === "BANK" ? bankSelected.accountNo : null,
    //   bank_code: bond_payment_type === "BANK" ? bankSelected.bankCode : null,
    //   bank_name_recv:
    //     bond_payment_type === "BANK" ? bankSelected.bankName : null,
    //   branch_code:
    //     bond_payment_type === "BANK" ? bankSelected.branchCode : null,
    //   branch_name:
    //     bond_payment_type === "BANK" ? bankSelected.branchName : null,
    //   payment_method: "VND", // truyen voi moi ma bond
    // };
    let bond_payment = {
      account_name_recv: null,
      account_receive: null,
      bank_code: null,
      bank_name_recv: null,
      branch_code: null,
      branch_name: null,
      payment_method: "VND", // truyen voi moi ma bond
    };
    let buy_fee = 0;
    let sell_fee = 0;
    let leg2_settled_date = moment(leg2date, "DD/MM/Y").format("Y-MM-DD");
    let product_type = bondInfo.product_type;
    let tax = 0;
    if (side === "NS" && this.state.tax && this.state.tax.isSellTax === "Y") {
      tax = Math.round((this.state.tax.sellTaxRate * price * quantity) / 100);
    }
    let trading_payment = {
      account_name_recv: null,
      account_receive: null,
      bank_code: null,
      bank_name_recv: null,
      branch_code: null,
      branch_name: null,
      payment_method: "VND",
    };
    terms = bondInfo.product_type !== "VAR" ? (term ? [term] : []) : terms;

    let data = {
      channel: "PRT",
      accountNo: account_no,
      custId: this.props.authInfo.customerId,
      bondCode: bond_code,
      productType: product_type,
      quantity,
      valueDate:
        side === "NS" && product_type === "FIX"
          ? leg2_settled_date
          : moment(newExpiredDate).format("Y-MM-DD"),
      price,
      tax,
      side,
      fee: side === "NB" ? buy_fee : sell_fee,
      requestId: `${requestId}-${account_no}`,
      bondPayment: bond_payment,
      tradingPayment: trading_payment,
      terms: terms,
      promotion: promotion.promotion,
      codePromotion: codePromotion,
      leg2SettledDate:
        product_type === "OUTRIGHT"
          ? timeUnitServer().format("Y-MM-DD")
          : leg2_settled_date,
      bondCertificate: bond_certificate,
      careBy: careby_code,
      referCode: refer,
      // tradeDate: moment().format("Y-MM-DD"),
      tradeDate: timeServer(),
      fullName: account_name,
    };

    this.setState({
      processing: true,
    });
    this.processing = true;

    if (product_type === "OUTRIGHT") delete data.leg2TradeDate;

    if (
      bondInfo &&
      side === "NB" &&
      bondInfo.for_professional_investor &&
      !this.state.readContract
    ) {
      this.callApibase64(data);
      return;
    }

    trackVNDA("Bond", "Place bond order", data);
    addDealsV2(data)
      .then((res) => {
        if (res.status === 200) {
          const { urlPageSign, procInstId } = res.data;
          this.handleOpenContract({
            urlPageSign,
            procInstId,
            accountNo: account_no,
          });
        }
      })
      .catch((e) => {
        if (e && e.response && e.response.data) {
          if (e.response.data.error === "DPM-2801") {
            const { error, errorMessage, id } = e.response.data;
            this.setState({
              error: `${errorMessage} (${error}) (${id})`,
            });
            return;
          }
          displayNoti(parseErrorMessage(e.response.data), "error");
          this.setState({
            error: parseErrorMessage(e.response.data),
          });
        }
      })
      .finally(() => {
        this.setState({
          processing: false,
        });
        this.processing = false;
      });
  }

  handleOpenContract = (data) => {
    this.props.dispatch(
      openPopup({
        type: "contract-bond",
        data: data,
        funCallBack: (value) => {
          if (value === "reopen") {
            this.handleOpenContract(data);
          }
        },
      })
    );
  };

  handleBack() {
    if (window.location.href.toString().indexOf("danh-muc") > 0) {
      this.props.router.push("/danh-muc");
    } else {
      this.props.router.push("/bang-gia");
    }
  }
  realInterestRate = (term, promotion) => {
    let rate = 0;
    if (term && term.rate) rate = term.rate;
    if (promotion && promotion.promotion_code)
      rate = addDecimals(rate, promotion.promotion_code);
    if (promotion && promotion.promotion_nav)
      rate = addDecimals(rate, promotion.promotion_nav);
    return rate;
  };
  dayOfTerm = (term) => {
    if (!term) return null;
    if (term.term_unit === "M") {
      return timeUnitServer().add(term.term, "months");
    }
    if (term.term_unit === "D") {
      return timeUnitServer().add(term.term, "days");
    }
  };
  dayOfTermbyleg2date = (date) => {
    if (!date) return null;
    return moment(date, "DD/MM/YYYY").toDate();
  };
  changeDayBackBond = async (day, bondInfo) => {
    if (bondInfo) {
      try {
        const res = await getDayBackBond(
          bondInfo.bond_code,
          bondInfo.product_type,
          moment(day).format("YYYY-MM-DD"),
          this.state.navParvalue
        );
        const { data } = res;
        if (data && data[0]) {
          this.setState({
            term: data[0],
            dayBackBond: day,
            leg2date: moment(day).format("DD/MM/YYYY"),
            error: null,
          });
        }
      } catch (err) {
        const { data } = err.response;
        if (data && data.error) {
          this.setState({ error: parseErrorMessage(data) });
        }
      }
    }
  };
  otherTermUnit = (unit, lang) => {
    if (unit.year && unit.year > 0)
      return unit.year === 1
        ? ` - ${unit.year} ${lang["year"]}`
        : ` - ${unit.year} ${lang["years"]}`;
    if (unit.month && unit.month > 0)
      return unit.month === 1
        ? ` - ${unit.month} ${lang["month"]}`
        : ` - ${unit.month} ${lang["months"]}`;
    if (unit.week && unit.week > 0)
      return unit.week === 1
        ? ` - ${unit.week} ${lang["week"]}`
        : ` - ${unit.week} ${lang["weeks"]}`;
    return "";
  };

  fetchInfoSingleAccount = () => {
    const { accountInfo } = this.props;
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
          this.makeDeal();
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

  handleCheckBuyForProInvestor = () => {
    const { bondInfo, side } = this.state;
    if (side == "NB") {
      const { bonds } = this.props;
      const detailBond = bonds[bondInfo.bond_code];
      if (detailBond && detailBond.custodyCenter == "003") {
        this.getRequestOpenAccSinglebond();
      } else {
        this.makeDeal();
      }
    } else {
      this.makeDeal();
    }
  };

  calculateFee = (quantity, price, fee, bond_detail) => {
    if (bond_detail && bond_detail.custodyCenter === "001") {
      const { temporary_fee_rate } = this.state;
      return numeral(quantity * price * temporary_fee_rate).format("0,0");
    } else {
      return numeral(quantity * price * (fee / 100)).format("0,0");
    }
  };

  calculateTotalPayment = (quantity, price, tax, fee, bond_detail) => {
    const { side, temporary_fee_rate } = this.state;
    if (bond_detail && bond_detail.custodyCenter === "001") {
      const tfee = temporary_fee_rate
        ? quantity * price * temporary_fee_rate
        : 0;
      if (side === "NB") {
        return numeral(quantity * price + tfee + tax).format("0,0");
      } else {
        return numeral(quantity * price - tfee - tax).format("0,0");
      }
    } else {
      if (side === "NB") {
        return numeral(quantity * price * (1 + tax / 100 + fee / 100)).format(
          "0,0"
        );
      } else {
        return numeral(quantity * price * (1 - tax / 100 - fee / 100)).format(
          "0,0"
        );
      }
    }
  };

  checkTransferLimited = (data, product_type) => {
    if (!data) return null;
    const today = moment();
    if (
      product_type &&
      (data.product_type === "ALL" || data.product_type === product_type) &&
      today.isSameOrAfter(moment(data.start_date, "YYYY-MM-DD")) &&
      today.isSameOrBefore(moment(data.end_date, "YYYY-MM-DD"))
    ) {
      return true;
    }
    return null;
  };

  checkTransferLimitedv2 = (data) => {
    if (!data) return null;
    const today = moment();
    if (today.isBefore(moment(data.start_date, "YYYY-MM-DD"))) {
      return true;
    }
    return null;
  };

  checkTransferLimitedShow = (list, product_type) => {
    if (list.length === 0) return null;
    const today = moment();
    const data = list.find(
      (e) =>
        today.isSameOrAfter(moment(e.start_date, "YYYY-MM-DD")) &&
        today.isSameOrBefore(moment(e.end_date, "YYYY-MM-DD"))
    );
    if (
      data &&
      (data.product_type === "ALL" || data.product_type === product_type)
    )
      return data;
    return null;
  };

  checkTransferLimitedSubmit = (list, product_type) => {
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

  showBondCertificate = (bond_detail) => {
    if (!bond_detail) return true;
    const { custodyCenter } = bond_detail;
    if (custodyCenter === "001" || custodyCenter === "003") return false;
    return true;
  };

  render() {
    let {
      side,
      bondInfo,
      terms,
      term,
      price,
      quantity,
      term_name,
      account_no,
      account_name,
      leg2date,
      errorAccount,
      newExpiredDate,
      errorBankAccount,
      processing,
      dayBackBond,
      careby_code,
      careby_full_name,
      error,
      bond_certificate,
      promotion,
      availableWithdraw,
      codePromotion,
      refer,
      refer_full_name,
      isShowRefer,
      priceOutrightBeforePromotion,
      outRightAsset,
      errorCodePromotion,
      listSale,
      selectedSale,
      optionSide,
      showMoreInterest,
      showMorePrice,
      coupon,
      bondDocument,
      errorCareby,
      statusAccountRegisBond,
      regisSingleBond,
      temporary_fee_rate,
    } = this.state;
    const bond_code = bondInfo ? bondInfo.bond_code : "";
    let {
      bonds,
      accounts,
      products,
      lang,
      authInfo,
      popup,
      scheduleRestrictedList,
    } = this.props;
    const isProInvestor = authInfo.isProInvestor;
    if (accounts && accounts.length > 0) {
      accounts = accounts.filter(
        (acc) => acc.type === "Owner" || acc.type === "Member"
      );
    }
    let bond_detail = null;
    let typeBond = null;
    try {
      bond_detail = Object.values(bonds).filter(
        (bond) => bond.bond_code === bond_code
      );
      bond_detail = bond_detail[0];
    } catch (err) {}

    let tax = 0;
    let fee = 0;
    if (side === "NS" && this.state.tax && this.state.tax.isSellTax === "Y") {
      tax = this.state.tax.sellTaxRate;
    }

    let maxDate = null;
    if (bondInfo && bondInfo.product_type) {
      if (bondInfo.product_type === "OUTRIGHT") {
        maxDate = timeUnitServer().add(1, "days");
      } else if (
        side === "NB" &&
        (bondInfo.product_type === "FIX" || bondInfo.product_type === "VAR")
      ) {
        maxDate = timeUnitServer().add(3, "days");
      }
    }

    let canBuy = 0;

    if (bondInfo) {
      typeBond = checkTypebond(bondInfo);
      const qMax = Math.floor(
        availableWithdraw / (price * (1 + bondInfo.fee / 100))
      );
      if (side === "NB") {
        if (bond_detail && bond_detail.custodyCenter === "001") {
          const listedQmax =
            price > 0
              ? Math.floor(
                  availableWithdraw / (price * (1 + temporary_fee_rate))
                )
              : 0;
          canBuy = Math.min(
            bondInfo.max_balance,
            bondInfo.remain_limit,
            listedQmax
          );
        } else {
          if (bondInfo.max_balance !== null && bondInfo.max_balance > 0) {
            canBuy = Math.min(
              qMax,
              bondInfo.max_balance,
              bondInfo.remain_limit
            );
          } else {
            canBuy = Math.min(qMax, bondInfo.remain_limit);
          }
        }
      }
      if (
        bondInfo.product_type === "OUTRIGHT" &&
        side === "NS" &&
        outRightAsset
      ) {
        const asset = outRightAsset.find(
          (asset) => asset.bondCode === bondInfo.bond_code
        );
        if (asset) canBuy = asset.sellableQuantity;
      }
      if (terms.length > 0 && bondInfo.maximum_term) {
        terms = terms.filter((t) => t.term <= bondInfo.maximum_term);
      }
      if (bondInfo.fee) {
        fee = bondInfo.fee;
      }
    }
    if (canBuy < 0) canBuy = 0;
    let langLocal = localStorage.getItem("lang")
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
    const dataSR = this.checkTransferLimitedShow(
      listScheduleRestricted,
      bondInfo?.product_type
    );

    return (
      <div className="set-order-page">
        <div className="header-block">
          <h1 className="txt-upper">
            {lang["TradingInformation"]}
            {coupon
              ? ` - ${
                  langLocal === "vi" ? coupon.otherName : coupon.otherNameEn
                }`
              : ""}
          </h1>
        </div>

        {isBusinessCustomer(accounts) && (
          <div
            className="warning65"
            style={{ marginTop: 0, marginLeft: 50, marginRight: 50 }}
          >
            <img src={wa} />
            <span style={{ marginLeft: "5px" }}>
              {lang["businessCustomerNote"]}
            </span>
          </div>
        )}

        <form className="info-order" onSubmit={this.handleMakeDeal}>
          <div className="left-block">
            <table className="trade-table">
              <colgroup>
                <col width="45%" />
                <col width="55%" />
              </colgroup>
              <thead>
                <tr>
                  <th className="text-l t-gray">{lang["CustomerAccountNo"]}</th>
                  <th className="text-l txt-bold">
                    <div
                      className="account-box accounts-suggestion"
                      style={{ padding: 0 }}
                    >
                      <AccountsSuggestion
                        accounts={accounts}
                        lang={lang}
                        activeAccount={{
                          accountNumber: account_no,
                          fullName: account_name,
                        }}
                        handleSelect={(acc) => {
                          this.changeAccountNo(acc);
                        }}
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {side === "NS" &&
                  bondInfo &&
                  bondInfo.product_type === "FIX" && (
                    <tr>
                      <td colSpan="2">
                        <span
                          style={{
                            maxWidth: 450,
                            color: "#f7941d",
                            fontStyle: "italic",
                          }}
                        >
                          {lang["noteSellFix"]}
                        </span>
                      </td>
                    </tr>
                  )}
                <tr>
                  <td className="text-l t-gray">{lang["bondCode"]}</td>
                  <td className="text-l txt-bold">
                    <select
                      className="bgtrans select-tag"
                      onChange={this.changeBondCode}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        {lang["pleaseSelectBondCode"]}
                      </option>
                      {products &&
                        products.map((product, i) => {
                          if (
                            product.bond_code &&
                            bonds &&
                            bonds[product.bond_code] &&
                            moment().isBefore(
                              bonds[product.bond_code].maturity_date
                            )
                          ) {
                            if (
                              product.product_type !== "VAR" &&
                              product.product_type !== "PROBOND" &&
                              product.product_status === "ACTIVE" &&
                              product.display_protrade
                            ) {
                              if (isProInvestor) {
                                if (
                                  product.product_type === "FIX" &&
                                  product.terms &&
                                  product.terms.length !== 0
                                )
                                  return (
                                    <OptionBond key={i} product={product} />
                                  );
                                return <OptionBond key={i} product={product} />;
                              } else {
                                if (product.for_professional_investor)
                                  return null;
                                if (
                                  product.product_type === "FIX" &&
                                  product.terms &&
                                  product.terms.length !== 0
                                )
                                  return (
                                    <OptionBond key={i} product={product} />
                                  );
                                return <OptionBond key={i} product={product} />;
                              }
                            }
                          }
                        })}
                    </select>
                  </td>
                </tr>
                <tr>
                  <td className="text-l t-gray">{lang["Side"]}</td>
                  <td className="text-l txt-bold">
                    <select
                      className="bgtrans select-tag"
                      onChange={this.changeSide}
                      value={side}
                    >
                      {optionSide.length > 0 &&
                        optionSide.map((option, i) => {
                          return (
                            <option key={option.type} value={option.value}>
                              {lang[option.type]}
                            </option>
                          );
                        })}
                    </select>
                  </td>
                </tr>

                <tr>
                  <td className="text-l t-gray">{lang["TradeDate"]}</td>
                  <td className="text-l txt-bold">
                    {side === "NB" ? (
                      <span>{timeServer("DD/MM/YYYY")}</span>
                    ) : (
                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        minDate={new Date()}
                        maxDate={maxDate ? maxDate.toDate() : null}
                        disabled={false}
                        tabIndex="5"
                        className="ep-date"
                        placeholderText=""
                        selected={
                          newExpiredDate ? newExpiredDate.toDate() : null
                        }
                        onChange={this.handleChangeExpireDate}
                      />
                    )}
                  </td>
                </tr>
                {/* ************************* */}
                <tr>
                  <td className="text-l t-gray">{lang["settlementDate"]}</td>
                  <td className="text-l t-bold">{this.state.settledDate}</td>
                </tr>

                <tr>
                  <td className="text-l t-gray">{lang["select_careby"]}</td>
                  <td className="text-l txt-bold">
                    <select
                      className="bgtrans select-tag"
                      value={selectedSale}
                      onChange={this.handleChangeSale}
                    >
                      <option value="" disabled>
                        {lang["select_careby"]}
                      </option>
                      {listSale &&
                        listSale.map(
                          (item, i) =>
                            item.hrcode && (
                              <option value={item.hrcode} key={i}>
                                {item.hrcode} {item.saleFullName}
                              </option>
                            )
                        )}
                      <option value="no">{lang["no_careby"]}</option>
                      <option value="enter">{lang["enter_careby"]}</option>
                    </select>
                  </td>
                </tr>
                {selectedSale && selectedSale === "enter" && (
                  <tr>
                    <td className="text-l t-gray">{lang["CarebyCode"]}</td>
                    <td className="text-l txt-bold">
                      <input
                        className="bggray"
                        type="text"
                        value={careby_code}
                        onChange={this.changeCarebyCode}
                        onBlur={this.handeBlurCarebyCode}
                      />
                      &nbsp;
                      <span
                        data-tip
                        data-for="tip-carebyCode"
                        data-class="bottom-tooltip"
                      >
                        <i className="fa fa-info-circle cPointer" />
                      </span>
                      <ReactTooltip
                        id="tip-carebyCode"
                        effect="solid"
                        place="bottom"
                      >
                        <p>{lang["tooltipMaMoiGioi"]}</p>
                      </ReactTooltip>
                    </td>
                  </tr>
                )}

                {selectedSale && selectedSale === "enter" && (
                  <tr>
                    <td className="text-l t-gray">{lang["CarebyFullName"]}</td>
                    <td className="text-l txt-bold">{careby_full_name}</td>
                  </tr>
                )}
                {isShowRefer && side === "NB" && (
                  <tr>
                    <td className="text-l t-gray">{lang["refer"]}</td>
                    <td className="text-l txt-bold">
                      <input
                        className="bggray"
                        type="text"
                        value={refer}
                        onChange={this.changeRefer}
                        onBlur={this.handeBlurRefer}
                      />
                      &nbsp;
                    </td>
                  </tr>
                )}

                {isShowRefer && side === "NB" && (
                  <tr>
                    <td className="text-l t-gray">{lang["referFullName"]}</td>
                    <td className="text-l txt-bold">{refer_full_name}</td>
                  </tr>
                )}
                <tr>
                  <td className="text-l t-gray">{lang["Quantity"]}</td>
                  <td className="text-l txt-bold">
                    <div
                      style={{
                        position: "relative",
                        width: "90%",
                        minWidth: "180px",
                      }}
                    >
                      <input
                        style={{ width: "100%" }}
                        className="bggray"
                        ref="txtQuantity"
                        type="text"
                        value={numeral(quantity).format("0,0")}
                        onChange={this.changeQuantity}
                      />
                      {(side === "NB" && bondInfo && bondInfo.max_quantity) ||
                      (side === "NS" &&
                        bondInfo &&
                        bondInfo.product_type === "OUTRIGHT") ? (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            right: 10,
                            color: "#8b8a92",
                            opacity: 0.7,
                          }}
                        >
                          / {canBuy}
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
                {typeBond === "d-bond" && (
                  <tr>
                    <td className="text-l t-gray">
                      <span>{lang["Giá thực hiện"]}</span>
                    </td>
                    <td className="text-l txt-bold">
                      {numeral(price).format("0,0")} {lang["currency"]}
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
                          this.setState({ showMorePrice: !showMorePrice });
                        }
                      }}
                    >
                      <span>{lang["Giá thực hiện"]}</span>
                      {side === "NB" && (
                        <i
                          style={{ marginLeft: "5px" }}
                          className={`fa fa-caret-${
                            showMorePrice ? "up" : "down"
                          }`}
                          aria-hidden="true"
                        />
                      )}
                    </td>
                    <td className="text-l txt-bold anoffer">
                      {numeral(price).format("0,0")} {lang["currency"]}
                    </td>
                  </tr>
                )}
                {showMorePrice && (
                  <tr>
                    <td className="text-l pl42 t-gray">
                      {lang["price_before_promotion"]}
                    </td>
                    <td className="text-l txt-bold">
                      {priceOutrightBeforePromotion &&
                        numeral(priceOutrightBeforePromotion).format(
                          "0,0"
                        )}{" "}
                      {lang["currency"]}
                    </td>
                  </tr>
                )}
                {showMorePrice && (
                  <tr>
                    <td className="text-l pl42 t-gray">
                      {lang["codePromotion"]}
                    </td>
                    <td className="text-l txt-bold">
                      <input
                        className="bggray"
                        type="text"
                        value={codePromotion}
                        onChange={this.changeCodePromotion}
                        onBlur={this.getPromotion}
                      />
                    </td>
                  </tr>
                )}
                {showMorePrice && (
                  <tr>
                    <td className="text-l pl42 t-gray">
                      {lang["promotion_by_bond_code"]}
                    </td>
                    <td className="text-l txt-bold">
                      {promotion.promotion_code}
                      <span>{typeBond === "d-bond" ? "%/năm" : "%"}</span>
                    </td>
                  </tr>
                )}

                {bondInfo && bondInfo.product_type !== "OUTRIGHT" && (
                  <tr>
                    <td className="text-l t-gray">{lang["minimumTerm"]}</td>
                    <td className="text-l txt-bold">
                      {bondInfo.product_type === "VAR" ? (
                        <input
                          className="bggray"
                          type="text"
                          value={term_name}
                          disabled
                        />
                      ) : (
                        <select
                          className="bgtrans select-tag"
                          value={term ? term.termRateId : ""}
                          onChange={this.changeTerm}
                        >
                          {terms.map((term) => (
                            <option
                              value={term.termRateId}
                              key={term.termRateId}
                            >
                              {" "}
                              {term.term +
                                " " +
                                getTermUnit(term.term_unit, lang) +
                                this.otherTermUnit(
                                  term.standard_term_unit,
                                  lang
                                )}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                )}
                {typeBond === "d-bond" && side === "NB" && (
                  <tr>
                    <td className="text-l t-gray">{lang["leg2TradeDate"]}</td>
                    <td className="text-l txt-bold">
                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        minDate={new Date()}
                        tabIndex="5"
                        className="ep-date"
                        placeholderText=""
                        selected={
                          dayBackBond
                            ? dayBackBond
                            : this.dayOfTermbyleg2date(leg2date)
                        }
                        onChange={(d) => this.changeDayBackBond(d, bondInfo)}
                      />
                    </td>
                  </tr>
                )}
                {typeBond === "d-bond" && (
                  <tr>
                    <td
                      className={cl("text-l ", {
                        "pointer anoffer": side === "NB",
                        "t-gray": side === "NS",
                      })}
                      onClick={() => {
                        if (side === "NB") {
                          this.setState({
                            showMoreInterest: !showMoreInterest,
                          });
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
                      {numeral(this.realInterestRate(term, promotion)).format(
                        "0,0.[00]"
                      )}
                      %/{lang["year"]}
                    </td>
                  </tr>
                )}
                {showMoreInterest && (
                  <tr>
                    <td className="text-l pl42 t-gray">
                      {lang["rateBeforePromotion"]}
                    </td>
                    <td className="text-l txt-bold">
                      {term ? `${numeral(term.rate).format("0,0.[0]")}%` : "0%"}
                    </td>
                  </tr>
                )}
                {side === "NB" && showMoreInterest && (
                  <tr>
                    <td className="text-l pl42 t-gray">
                      {lang["codePromotion"]}
                    </td>
                    <td className="text-l txt-bold">
                      <input
                        className="bggray"
                        type="text"
                        value={codePromotion}
                        onChange={this.changeCodePromotion}
                        onBlur={this.getPromotion}
                      />
                      &nbsp;
                    </td>
                  </tr>
                )}
                {showMoreInterest && (
                  <tr>
                    <td className="text-l pl42 t-gray">
                      {lang["promotion_by_bond_code"]}
                    </td>
                    <td className="text-l txt-bold">
                      <span>{promotion.promotion_code}%</span>
                    </td>
                  </tr>
                )}
                {showMoreInterest && (
                  <tr>
                    <td className="text-l pl42 t-gray">
                      {lang["promotion_by_nav"]}
                    </td>
                    <td className="text-l txt-bold">
                      {promotion.promotion_nav}%
                    </td>
                  </tr>
                )}

                {typeBond && typeBond === "v-bond" && (
                  <tr>
                    <td className="text-l t-gray">{lang["total_promotion"]}</td>
                    <td className="text-l txt-bold">
                      <span>
                        {priceOutrightBeforePromotion &&
                          numeral(
                            quantity * (priceOutrightBeforePromotion - price)
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
                      {numeral(quantity * price).format("0,0")}{" "}
                      {lang["currency"]}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="text-l t-gray">{lang["Tax"]}</td>
                  <td className="text-l txt-bold">
                    <span>
                      {numeral((quantity * price * tax) / 100).format("0,0")}{" "}
                      {lang["currency"]}
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="text-l t-gray">
                    <span>
                      {bond_detail && bond_detail.custodyCenter === "001"
                        ? lang["temporaryFee"]
                        : lang["fee"]}
                    </span>
                    {bond_detail && bond_detail.custodyCenter === "001" && (
                      <span style={{ marginLeft: 5 }}>
                        <span
                          data-tip
                          data-for="tip-temporary-fee"
                          data-class="bottom-tooltip"
                        >
                          <i className="fa fa-info-circle cPointer" />
                        </span>
                        <ReactTooltip
                          id="tip-temporary-fee"
                          effect="solid"
                          place="bottom"
                        >
                          <p>{`${lang["tipTempoaryFee1"]} ${numeral(
                            temporary_fee_rate * 100
                          ).format("0.[0000]")}% ${
                            lang["tipTempoaryFee2"]
                          }`}</p>
                        </ReactTooltip>
                      </span>
                    )}
                  </td>
                  <td className="text-l txt-bold">
                    <span>
                      {this.calculateFee(quantity, price, fee, bond_detail)}{" "}
                      {lang["currency"]}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="text-l t-gray">{lang["totalPayment"]}</td>
                  <td className="text-l txt-bold">
                    {this.calculateTotalPayment(
                      quantity,
                      price,
                      tax,
                      fee,
                      bond_detail
                    )}{" "}
                    {lang["currency"]}
                  </td>
                </tr>
              </tbody>
            </table>

            {(side === "NB" || (side === "NS" && quantity < canBuy)) &&
              this.showBondCertificate(bond_detail) && (
                <div className="registry-extract">
                  <label>
                    {lang["bond_certificate"]}:&nbsp;
                    <span
                      data-tip
                      data-for="tip-bond_certificate"
                      data-class="bottom-tooltip"
                    >
                      <i className="fa fa-info-circle cPointer" />
                    </span>
                    <ReactTooltip
                      id="tip-bond_certificate"
                      effect="solid"
                      place="bottom"
                    >
                      <p>{lang["bond_certificate_tooltip"]}</p>
                    </ReactTooltip>
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginLeft: "20px",
                    }}
                  >
                    <label className="radio-lock">
                      <input
                        type="radio"
                        name="cert"
                        value="true"
                        checked={bond_certificate}
                        onClick={() =>
                          this.setState({ bond_certificate: true })
                        }
                      />
                      <span className={cl({ "t-gray": !bond_certificate })}>
                        {lang["yes"]}
                      </span>
                      <span className="checkmark" />
                    </label>
                    &nbsp;&nbsp;&nbsp;
                    <label className="radio-lock">
                      <input
                        type="radio"
                        name="cert"
                        value="false"
                        checked={!bond_certificate}
                        onClick={() =>
                          this.setState({ bond_certificate: false })
                        }
                      />
                      <span className={cl({ "t-gray": bond_certificate })}>
                        {lang["no"]}
                      </span>
                      <span className="checkmark" />
                    </label>
                  </div>
                </div>
              )}

            <div className="registry-extract">
              <label />
              <div className="my-checkbox">
                <label className="contain">
                  <input
                    type="checkbox"
                    style={{ height: 13, width: "auto" }}
                    onChange={this.changeAcceptTerm}
                  />
                  <span className="checkmark" />
                  <label style={{ marginLeft: "23px" }}>
                    {bondInfo &&
                    side === "NB" &&
                    bondInfo.for_professional_investor ? (
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
                    ) : (
                      <span>{lang["DealConfirm"]}</span>
                    )}
                  </label>
                </label>
              </div>
            </div>

            {quantity > canBuy && (
              <div className="form-group">
                <p
                  className="txt-note"
                  style={{ color: "red" }}
                  dangerouslySetInnerHTML={{
                    __html:
                      "Số lượng Quý khách vừa nhập vượt số lượng tối đa có thể mua",
                  }}
                />
              </div>
            )}

            {error ? (
              <div className="form-group">
                <p
                  className="txt-note"
                  style={{ color: "red" }}
                  dangerouslySetInnerHTML={{ __html: error }}
                />
              </div>
            ) : null}

            {errorCodePromotion && (
              <div className="form-group">
                <p
                  className="txt-note"
                  style={{ color: "red" }}
                  dangerouslySetInnerHTML={{ __html: errorCodePromotion }}
                />
              </div>
            )}
            {errorAccount && (
              <div className="form-group">
                <p
                  className="txt-note"
                  style={{ color: "red" }}
                  dangerouslySetInnerHTML={{ __html: errorAccount }}
                />
              </div>
            )}
            {errorBankAccount && (
              <div className="form-group">
                <p
                  className="txt-note"
                  style={{ color: "red" }}
                  dangerouslySetInnerHTML={{ __html: errorBankAccount }}
                />
              </div>
            )}
            {errorCareby && (
              <div className="form-group">
                <p
                  className="txt-note"
                  style={{ color: "red" }}
                  dangerouslySetInnerHTML={{ __html: errorCareby }}
                />
              </div>
            )}
            {dataSR ? (
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
                    {langLocal === "vi" ? dataSR.reason_vn : dataSR.reason_eng}
                  </p>
                </ReactTooltip>
              </div>
            ) : (
              <div className="btn-group">
                {!isBusinessCustomer(accounts) && (
                  <button
                    className="btn btn-primary"
                    style={{
                      marginRight: 0,
                      textTransform: "uppercase",
                      opacity: errorAccount || errorBankAccount ? 0.5 : 1,
                    }}
                  >
                    {processing ? (
                      <i className="fa fa-spin fa-spinner" />
                    ) : (
                      lang["perform"]
                    )}
                  </button>
                )}
              </div>
            )}
            <p className="tc">
              <u className="pointer" onClick={this.handleBack}>
                {lang["Back"]}
              </u>
            </p>
          </div>

          {/* right */}
          <BondInfo
            lang={lang}
            bond_detail={bond_detail}
            coupon={coupon}
            bondInfo={bondInfo}
          />
        </form>
        {popup.status && <PopupContainer {...this.props} {...popup} />}
        {statusAccountRegisBond && (
          <StatusAccountRegistration
            {...statusAccountRegisBond}
            onClose={() => this.setState({ statusAccountRegisBond: false })}
          />
        )}
        {regisSingleBond && (
          <FlowSingleBond
            {...this.props}
            handleClose={() => this.setState({ regisSingleBond: false })}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ bondStore, popupStore, customerStore }) => {
  return {
    bonds: bondStore.bonds,
    products: bondStore.products,
    mapProducts: bondStore.mapProducts,
    rates: bondStore.rates,
    popup: popupStore,
    scheduleRestrictedList: bondStore.scheduleRestrictedList,
    ownerAccount: customerStore.ownerAccount,
  };
};

export default connect(mapStateToProps)(OrderPage);
