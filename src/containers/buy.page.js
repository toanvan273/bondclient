import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useStateCallback } from "../common/hook";
import { connect } from "react-redux";
import ReactTooltip from "react-tooltip";
import cl from "classnames";
import {
  getBondInfo,
  getTableRate,
  getBondPricing,
  getDealPricing,
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
  addDealsV2,
  getBase64Contract,
  getItemExplainBond,
  getNavParvalue,
  getTemporaryFee,
  getDomainUser,
} from "../clients/bond.api.client";
import { _getBankReceiveAccounts } from "../clients/transaction.api.client";
import * as AuthService from "../services/auth.service";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import numeral from "numeral";
import {
  displayNoti,
  getTermUnit,
  checkTypebond,
  isBusinessCustomer,
  timeServer,
  timeUnitServer
} from "../helpers";
import { parseErrorMessage } from "../modules/error_parser/error.parser.v2";
import { trackVNDA } from "../modules/tracker";
import { numberPrecision, addDecimals } from "../common/utils";
import AccountsSuggestion from "../common/accounts.suggestion";
import wa from "../resource/images/warm.svg";
import BondInfo from "../components/orderpage/bond.info";
import BeforeLimit from "../components/popup/beforeLimit";
import PopupContainer from "../components/popup/index";
import { openPopup } from "../actions/customer.actions";
const queryString = require("query-string");


function BuyPage(props) {
  const [readContract, setReadContract] = useStateCallback(false);
  const [promotion, setPromotion] = useStateCallback({});
  const [account, setAccount] = useStateCallback({});
  const [navParvalue, setNavParvalue] = useStateCallback(null);
  const [newExpiredDate, setNewExpiredDate] = useStateCallback(
    timeUnitServer().toDate()
  );
  const [bondInfo, setBondInfo] = useStateCallback(null);

  const [processing, setProcessing] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorAccount, setErrorAccount] = useState(null);
  const [error, setError] = useState(null);
  const [errorCodePromotion, setErrorCodePromotion] = useState(null);
  const [errorCareby, setErrorCareby] = useState(null);
  const [errorBankAccount, setErrBankAccount] = useState(null);

  const [tax, setTax] = useState(0);
  const [availableWithdraw, setAvailableWithdraw] = useState(0);
  const [outRightAsset, setOutRightAsset] = useState(null);
  const [term, setTerm] = useState(null);
  const [terms, setTerms] = useState([]);
  const [dayBackBond, setDayBackBond] = useState(null);
  const [leg2date, setLeg2date] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [urlParams, setUrlParams] = useState({});
  const [listSale, setListSale] = useState([]);
  const [selectedSale, setSelectedSale] = useState("");
  const [careby_code, setCareby_code] = useState("");
  const [careby_full_name, setCareby_full_name] = useState("");
  const [priceOutrightBeforePromotion, setPriceOutrightBeforePromotion] =
    useState("");

  const [price, setPrice] = useState(0);
  const [settledDate, setSettledDate] = useState("");
  const [dealPricing, setDealPricing] = useState(null);
  const [finalSettlement, setFinalSettlement] = useState("");
  const [refer, setRefer] = useState("");
  const [refer_full_name, setRefer_full_name] = useState("");
  const [bond_certificate, setBond_certificate] = useState("");
  const [acceptTerm, setAcceptTerm] = useState(false);
  const [term_name, setTerm_name] = useState();
  const [coupon, setCoupon] = useState(null);
  const [bondDocument, setBondDocument] = useState(null);
  const [leg2SettledDate, setLeg2SettleDate] = useState("");
  const [temporary_fee_rate, setTemporaryFee] = useState(null); // dat-mua && public_bond

  const [isShowRefer, setIsShowRefer] = useState(false);
  const [showMoreInterest, setShowMoreInterest] = useState(false);
  const [codePromotion, setCodePromotion] = useState("");
  const [showMorePrice, setShowMorePrice] = useState(false);
  const parsed = queryString.parse(window.location.search);
  useEffect(() => {
    const accounts =
      props.accounts &&
      props.accounts.filter(
        (acc) => acc.type === "Owner" || acc.type === "Member"
      );
    if (accounts && accounts.length > 0) {
      setAccount({
        account_no: accounts[0].accountNumber,
        account_name: accounts[0].fullName,
        custodyID: accounts[0].custodyID,
      });

      setUrlParams(parsed);
      if (parsed.leg2_trade_date) {
        setNewExpiredDate(moment(parsed.leg2_trade_date, "YYYY-MM-DD"));
      }
      _getSale();
      if (parsed.from && parsed.from === "danh-muc") {
        const { accounts } = props;
        if (accounts) {
          let accountTrade = accounts.filter(
            (e) => e.accountNumber == parsed.customer_account_no
          );
          if (accountTrade.length > 0) changeAccountNo(accountTrade[0]);
        }

        if (parsed.promotion && !isNaN(parsed.promotion)) {
          setPromotion(parsed.promotion);
        }
        if (parsed.quantity) {
          setQuantity(Number(parsed.quantity));
        }
      }
    }
  }, [props.accounts]);

  useEffect(() => {
    if (account.account_no) {
      _getMembership(account.account_no);
      getTax(account.account_no);
      _getAvailableWithdraw(account.account_no);
      getOutRightAsset(account.account_no);
      getValidRefer(account.account_no).then((res) =>
        setIsShowRefer(res.data.value)
      );
    }
  }, [account]);

  useEffect(() => {
    if (props.params.bond_code) {
      _getBondInfo(props.params.bond_code);
      _getCoupon(props.params.bond_code);
      fetchExplainBond(props.params.bond_code);
    }
  }, [props.params]);

  useEffect(() => {
    const { bonds, params } = props;
    if (bonds && params) {
      const detailBond = bonds[params.bond_code];
      if (detailBond) {
        checkPayment(detailBond);
      }
    }
  }, [props.bonds]);

  const _getSale = () => {
    getSale().then((res) => {
      if (res && res.data && res.data.content) {
        setListSale(res.data.content);
      }
    });
  };

  const _getBondInfo = (bond_code) => {
    const product_type = props.params.product_type;
    if (product_type && bond_code) {
      getBondInfo(product_type, bond_code).then((res) => {
        if (res && res.data) {
          setBondInfo(res.data, (bondInfo) => {
            const { leg2_trade_date } = parsed;
            if (props.location.search.length > 0 && leg2_trade_date) {
              _getSettleDate(leg2_trade_date, bondInfo.bond_code);
            }

            if (props.location.search.length == 0 && newExpiredDate) {
              _getSettleDate(
                moment(newExpiredDate).format("YYYY-MM-DD"),
                bondInfo.bond_code
              );
            }

            if (props.params.side === "dat-mua") {
              _getSettleDate(timeServer("YYYY-MM-DD"), bondInfo.bond_code);
            }
            if (props.params.side === "dat-ban" && parsed && parsed.deal_id) {
              let date = moment(newExpiredDate).format("YYYY-MM-DD");

              if (props.params.product_type === "FIX") {
                date = parsed.leg2_trade_date;
              }
              getDealPricing(parsed.deal_id, date).then((res) => {
                setPrice(res.data.price);
                setDealPricing(res.data);
              });
            } else {
              loadPricing(moment().format("YYYY-MM-DD"), bondInfo, 0);
            }

            getTableRate(bondInfo.table_rate_id).then((res) => {
              if (props.fullProducts) {
                const { fullProducts } = props;
                const findTerms = fullProducts.find(
                  (e) =>
                    e.bond_code == bond_code &&
                    e.product_type == props.params.product_type
                );
                const terms = findTerms?.terms;
                setTerms(terms);
                let term = terms ? terms[0] : "";
                if (parsed.termRateId && terms) {
                  term = terms.find(
                    (term) => term.termRateId == parsed.termRateId
                  );
                }
                setTerm_name(res.data.name);
                calculateLeg2TradeDate(
                  product_type,
                  moment(newExpiredDate).format("DD/MM/Y"),
                  term,
                  (leg2date) => {
                    let leg2dateCustom = leg2date
                      ? moment(leg2date).format("DD/MM/YYYY")
                      : "";
                    setLeg2date(leg2dateCustom);
                    setTerm(term);
                  }
                );
              }
            });
            handlegetPromotion();
          });
        }
      });
    }
  };

  const _getCoupon = async (bondCode) => {
    getCoupon(bondCode).then((res) => {
      if (res.data) {
        const { data } = res;
        setCoupon(data);
        _getTemporaryFee(bondCode);
      }
    });
  };

  const _getTemporaryFee = (bondCode) => {
    getTemporaryFee(bondCode).then((res) => {
      if (res.data) {
        setTemporaryFee(res.data.temporary_fee_rate);
      }
    });
  };

  const fetchExplainBond = (bondCode) => {
    getItemExplainBond(bondCode).then((res) => {
      if (res.data) {
        const { data } = res.data;
        const mydata = data.find((e) => e.code === bondCode);
        if (mydata) {
          setBondDocument(mydata);
        }
      }
    });
  };

  const checkValidData = (limit) => {
    setError(null);
    const { side, product_type } = props.params;
    if (errorCodePromotion) return false;
    const { lang } = props;
    let error = null;
    if (!finalSettlement && side === "dat-ban" && product_type === "FIX") {
      error = lang["finalSettlement"];
    }
    if (!acceptTerm) {
      error = lang["acceptTermRequired"];
    }
    if (!quantity) {
      error = lang["inputRequired"];
    }
    if (!account.account_no) {
      error = lang["requiredAccountNo"];
    }
    // Check sale selected
    if (!selectedSale) {
      error = lang["select_careby"];
    } else if (selectedSale === "enter" && !careby_code) {
      error = lang["require_careby"];
    }

    if (error) {
      setError(error);
      return false;
    }
    if (bondInfo && side === "dat-ban" && bondInfo.product_type === "FIX") {
      if (moment(newExpiredDate) < moment(leg2date, "DD/MM/YYYY")) {
        if (limit) return true;
        document.getElementById("before-limit").style.top = "50%";
        return false;
      }
    }
    return true;
  };

  const handleChangeSale = (e) => {
    const sale = e.target.value;
    if (["no", "enter"].includes(sale)) {
      setCareby_code("");
      setCareby_full_name("");
    } else {
      const selected = listSale.find((item) => item.hrcode === sale);
      setCareby_code(sale);
      setCareby_full_name(selected.saleFullName);
    }
    setSelectedSale(sale);
    handlegetPromotion();
  };

  useEffect(() => {
    if (readContract === "done") {
      makeDeal();
    }
  }, [readContract]);

  const callApibase64 = (data) => {
    getBase64Contract(data)
      .then((res) => {
        if (res.data) {
          props.dispatch(
            openPopup({
              type: "confirm-buy-bond",
              data: res.data,
              funCallBack: () => {
                setReadContract("done");
              },
            })
          );
        }
      })
      .catch((e) => {
        if (e && e.response && e.response.data) {
          if (e.response.data.error === "DPM-2801") {
            const { error, errorMessage, id } = e.response.data;
            setError(`${errorMessage} (${error}) (${id})`);
            return;
          }
          displayNoti(parseErrorMessage(e.response.data), "error");
          setError(parseErrorMessage(e.response.data));
        }
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  const handleMakeDeal = (e, limit) => {
    if (e) e.preventDefault();
    if (
      processing ||
      pending ||
      errorAccount ||
      errorBankAccount ||
      isBusinessCustomer(props.accounts)
    ) {
      return;
    }
    setTimeout(() => {
      if (!processing) {
        const isValid = checkValidData(limit);
        if (isValid) {
          if (!AuthService.isStep2Authenticated()) {
            window.parent.postMessage(["required2Authenticated"], "*");
            return;
          }
          makeDeal();
        }
      }
    }, 500);
  };

  const checkPayment = (bond) => {
    const { lang } = props;
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
            setErrBankAccount(null);
          } else {
            setErrBankAccount(lang["errorBankAccount"]);
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
            setErrBankAccount(null);
          } else {
            setErrBankAccount(lang["errorBankAccount"]);
          }
        }
      }
    });
  };
  const makeDeal = () => {
    let bond_code = props.params.bond_code;
    let bond_payment = {
      account_name_recv: null,
      account_receive: null,
      bank_code: null,
      bank_name_recv: null,
      branch_code: null,
      branch_name: null,
      payment_method: "VND",
    };
    const gen_leg2_setled_date = (daybackbond, leg2SettledDate, leg2date) => {
      if (daybackbond) return moment(daybackbond).format("YYYY-MM-DD");
      if (leg2SettledDate) return leg2SettledDate;
      return leg2date;
    };
    let buy_fee = 0;
    let sell_fee = 0;
    let leg2_trade_date = moment(leg2date, "DD/MM/YYYY").format("YYYY-MM-DD");
    let product_type = props.params.product_type;
    let side = props.params.side === "dat-mua" ? "NB" : "NS";
    let tax = 0;
    const leg2_settled_date = gen_leg2_setled_date(
      dayBackBond,
      leg2SettledDate,
      leg2_trade_date
    );
    const requestId = Math.floor(Date.now() / 1000) - new Date().getSeconds();
    if (props.params.side !== "dat-mua" && tax && tax.isSellTax === "Y") {
      tax = Math.round((tax.sellTaxRate * price * quantity) / 100);
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
    let terms =
      props.params.product_type !== "VAR" ? (term ? [term] : []) : terms;
    if (props.params.side === "dat-ban" && urlParams && urlParams.terms) {
      terms = JSON.parse(urlParams.terms);
    }
    let value_date;

    if (side === "NS" && product_type === "FIX") {
      if (moment() < moment(leg2_trade_date, "Y-MM-DD")) {
        value_date = moment(newExpiredDate).format("Y-MM-DD");
      } else value_date = timeServer();
    } else {
      value_date = moment(newExpiredDate).format("Y-MM-DD");
    }
    let data = {
      channel: "PRT",
      accountNo: account.account_no,
      custId: props.authInfo.customerId,
      bondCode: bond_code,
      productType: product_type,
      quantity,
      valueDate: value_date,
      price,
      tax,
      side,
      fee: side === "NB" ? buy_fee : sell_fee,
      requestId: `${requestId}-${account.account_no}`,
      bondPayment: bond_payment,
      tradingPayment: trading_payment,
      terms: terms,
      promotion: promotion.promotion,
      leg2SettledDate:
        product_type === "OUTRIGHT"
          ? moment().format("YYYY-MM-DD")
          : leg2_settled_date,

      bondCertificate: bond_certificate,
      careBy: careby_code,
      referCode: refer,
      tradeDate: timeServer(),
      fullName: account.account_name,
    };
    setProcessing(true);
    if (
      bondInfo &&
      side === "NB" &&
      bondInfo.for_professional_investor &&
      !readContract
    ) {
      callApibase64(data);
      return;
    }

    if (
      urlParams.from &&
      urlParams.from === "danh-muc" &&
      (product_type === "VAR" || product_type === "FIX") &&
      side === "NS"
    ) {
      data.bondId = urlParams.deal_id;
    }
    if (product_type === "OUTRIGHT") delete data.leg2SettledDate;
    data.codePromotion = codePromotion;
    if (product_type === "OUTRIGHT")
      data.priceOutrightBeforePromotion = priceOutrightBeforePromotion;
    trackVNDA("Bond", "Place bond order", data);
    addDealsV2(data)
      .then((res) => {
        if (res.status === 200) {
          const { urlPageSign, procInstId } = res.data;
          handleOpenContract({
            urlPageSign,
            procInstId,
            accountNo: account.account_no,
          });
        }
      })
      .catch((e) => {
        if (e && e.response && e.response.data) {
          if (e.response.data.error === "DPM-2801") {
            const { error, errorMessage, id } = e.response.data;
            setError(`${errorMessage} (${error}) (${id})`);
            return;
          }
          displayNoti(parseErrorMessage(e.response.data), "error");
          setError(parseErrorMessage(e.response.data));
        }
      })
      .finally(() => {
        setProcessing(false);
        setReadContract(false);
      });
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
        },
      })
    );
  };

  const changeRefer = (e) => {
    setRefer(e.target.value);
  };

  const _getMembership = async (accountNo) => {
    const { lang } = props;
    try {
      const res = await getMembership(accountNo);
      if (
        res.data.pageItems?.[0]?.domain === "CUSTOMER_ACCOUNT" &&
        res.data.pageItems?.[0]?.membershipType === "ACTIVE"
      ) {
        setErrorAccount(null);
      } else {
        setErrorAccount(lang["errorAccount"]);
      }
    } catch (err) {
      setErrorAccount(null);
    }
  };

  const handlegetTax = (accountNumber) => {
    getTax(accountNumber).then((res) => {
      setTax(res.data);
    });
  };

  const changeCodePromotion = (e) => {
    setCodePromotion(e.target.value);
  };

  const handlegetPromotion = (q) => {
    const quantity = q ? q : quantity;
    if (
      props.params.side === "dat-ban" &&
      props.params.product_type !== "OUTRIGHT"
    ) {
      return;
    }
    setTimeout(() => {
      setPending(true);
      const side = props.params.side === "dat-ban" ? "NS" : "NB";
      if (bondInfo) {
        getPromotion(
          bondInfo.product_type,
          account.account_no,
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
              setErrorCodePromotion("");
              setPromotion(res.data, (promotion) => {
                loadPricing(
                  moment(newExpiredDate).format("YYYY-MM-DD"),
                  bondInfo,
                  promotion
                );
              });
            }
          })
          .catch((e) => {
            setPromotion({}, () => {
              loadPricing(
                moment(newExpiredDate).format("YYYY-MM-DD"),
                bondInfo,
                promotion
              );
            });
            if (e && e.response && e.response.data) {
              setErrorCodePromotion(parseErrorMessage(e.response.data));
            }
          })
          .finally(() => {
            setPending(false);
          });
      }
    }, 500);
  };

  const _getAvailableWithdraw = (accountNumber) => {
    getAvailableWithdraw(accountNumber).then((res) => {
      if (res && res.data) {
        setAvailableWithdraw(res.data.availableWithdraw);
      }
    });
  };

  const getOutRightAsset = (accountNumber) => {
    getAssets({ accountNumber }).then((res) => {
      if (res && res.data) {
        setOutRightAsset(res.data.content);
      }
    });
  };

  const changeDayBackBond = (day, bondInfo, navPar) => {
    if (bondInfo) {
      getDayBackBond(
        bondInfo.bond_code,
        bondInfo.product_type,
        moment(day).format("YYYY-MM-DD"),
        navPar
      )
        .then((res) => {
          const { data } = res;
          if (data && data[0]) {
            setTerm(data[0]);
            setDayBackBond(day);
            setLeg2date(moment(day).format("DD/MM/YYYY"));
            setError(null);
          }
        })
        .catch((err) => {
          const { data } = err.response;
          if (data && data.error) {
            setError(parseErrorMessage(data));
          }
        });
    }
  };
  const loadNavParvalue = (quantity) => {
    const { side, product_type } = props.params;
    if (side === "dat-mua" && product_type === "FIX") {
      const payload = {
        accountNo: account.account_no,
        bondCode: props.params.bond_code,
        quantity,
      };
      getNavParvalue(payload)
        .then((res) => {
          if (res.data) {
            const { navParvalue } = res.data;
            setNavParvalue(navParvalue, (nav) => {
              const day = dayBackBond
                ? dayBackBond
                : toLeg2Settledate(leg2SettledDate);
              changeDayBackBond(day, bondInfo, nav);
            });
          }
        })
        .catch((err) => console.log({ err }));
    }
  };

  const toLeg2Settledate = (date) =>
    date ? moment(date, "YYYY-MM-DD").toDate() : null;

  const changeAccountNo = (acc) => {
    if (acc) {
      setAccount(
        {
          account_no: acc.accountNumber,
          account_name: acc.fullName,
          custodyID: acc.custodyID,
        },
        () => {
          _getMembership(acc.accountNumber);
          handlegetTax(acc.accountNumber);
          handlegetPromotion();
          _getAvailableWithdraw(acc.accountNumber);
          getOutRightAsset(acc.accountNumber);
          getValidRefer(acc.accountNumber).then((res) =>
            setIsShowRefer(res.data.value)
          );
          if (quantity) {
            loadNavParvalue(quantity);
          }
        }
      );
    }
  };

  const onchangeSettledate = (v, leg2date) => {
    const key = v.target.value;
    let date = timeUnitServer();
    switch (key) {
      case "early":
        const { trade_date } = urlParams;
        let tplus5 = moment(trade_date, "YYYY-MM-DD").add(5, "days");
        if (tplus5 > timeUnitServer()) {
          date = tplus5;
        } else date = timeUnitServer();
        break;
      case "late":
        date = timeUnitServer();
        break;
      case "in_time":
        date = moment(leg2date, "DD/MM/YYYY");
        break;
      default:
        break;
    }
    setFinalSettlement(v.target.value);
    setNewExpiredDate(date, (newExpired) => {
      if (props.params.side === "dat-ban" && urlParams && urlParams.deal_id) {
        getDealPricing(
          urlParams.deal_id,
          moment(newExpired).format("YYYY-MM-DD")
        ).then((res) => {
          setDealPricing(res.data);
          setPrice(res.data.price);
        });
        _getSettleDate(
          moment(newExpired).format("YYYY-MM-DD"),
          props.params.bond_code
        );
      }
    });
  };

  const renderOptionType = (leg2) => {
    let elm = [
      <option value="" disabled>
        Chọn tất toán
      </option>,
    ];
    if (leg2) {
      const today = timeUnitServer().format("YYYY-MM-DD");
      const leg2day = moment(leg2, "DD/MM/YYYY").format("YYYY-MM-DD");
      if (moment(today).isSame(leg2day, "day")) {
        elm.push(<option value="in_time">Tất toán đúng hạn</option>);
      }
      if (moment(today).isAfter(leg2day)) {
        elm.push(<option value="late">Tất toán muộn</option>);
      }
      if (moment(today).isBefore(leg2day)) {
        elm.push(<option value="early">Tất toán sớm</option>);
        elm.push(<option value="in_time">Tất toán đúng hạn</option>);
      }
    }
    return elm;
  };

  const compareTodaytoLeg2trade = (leg2) => {
    return moment(leg2, "DD/MM/YYYY") > timeUnitServer();
  };

  const minTradeDate = (urlParams, finalSettlement) => {
    const today = timeUnitServer();
    let min = timeUnitServer();
    if (!finalSettlement) {
      if (urlParams && urlParams.trade_date) {
        let k = moment(urlParams.trade_date, "YYYY-MM-DD").add(5, "days");
        if (today > k) {
          min = today;
        } else {
          min = k;
        }
      }
    } else {
      switch (finalSettlement) {
        case "early":
          const { trade_date } = urlParams;
          let tplus5 = moment(trade_date, "YYYY-MM-DD").add(5, "days");
          if (tplus5 > timeUnitServer()) {
            min = tplus5;
          }
          break;
        case "in_time":
          if (urlParams && urlParams.leg2_trade_date) {
            min = moment(urlParams.leg2_trade_date, "YYYY-MM-DD");
          }
          break;
        case "late":
        default:
          break;
      }
    }
    return min.toDate();
  };

  const maxTradeDate = (bondInfo, urlParams, finalSettlement) => {
    let maxDate = timeUnitServer();
    if (!finalSettlement) {
      let min = moment(minTradeDate(urlParams));
      if (bondInfo && bondInfo.product_type) {
        if (bondInfo.product_type === "OUTRIGHT") {
          maxDate = timeUnitServer().add(1, "days");
        } else if (
          props.params.side === "dat-mua" &&
          (bondInfo.product_type === "FIX" || bondInfo.product_type === "VAR")
        ) {
          maxDate = timeUnitServer().add(3, "days");
        } else if (
          props.params.side === "dat-ban" &&
          bondInfo.product_type === "FIX"
        ) {
          const parsed = urlParams;
          if (parsed && parsed.leg2_trade_date) {
            maxDate = moment(parsed.leg2_trade_date);
          }
        }
      }
      if (maxDate && min > maxDate) {
        maxDate = min;
      }
    } else {
      switch (finalSettlement) {
        case "early":
          if (urlParams && urlParams.leg2_trade_date) {
            maxDate = moment(urlParams.leg2_trade_date, "YYYY-MM-DD").subtract(
              1,
              "days"
            );
          }
          break;
        case "in_time":
          if (urlParams && urlParams.leg2_trade_date) {
            maxDate = moment(urlParams.leg2_trade_date, "YYYY-MM-DD");
          }
          break;
        case "late":
        default:
          break;
      }
    }
    return maxDate.toDate();
  };

  const _getSettleDate = (setleDate, bondCode) => {
    getSettleDate(setleDate, bondCode).then((res) => {
      if (res && res.data) {
        setSettledDate(moment(res.data.settledDate).format("DD/MM/YYYY"));
      }
    });
  };

  const loadPricing = (
    valueDate = moment().format("YYYY-MM-DD"),
    infoBond,
    promotion
  ) => {
    const side = props.params.side === "dat-ban" ? "NS" : "NB";
    const bondInfo = infoBond || bondInfo;
    if (!bondInfo) return;
    getBondPricing(bondInfo, side, valueDate, promotion?.promotion || 0).then(
      (res) => {
        setPrice(res.data.price);
        setPriceOutrightBeforePromotion(res.data.priceOutrightBeforePromotion);
      }
    );
  };

  const changeTerm = (e) => {
    let term = terms.filter(
      (term) => term.termRateId.toString() === e.target.value.toString()
    )[0];
    if (props.params.product_type === "VAR") {
      term = getHighestTerm(terms);
    }
    calculateLeg2TradeDate(
      props.params.product_type,
      moment(newExpiredDate).format("DD/MM/Y"),
      term,
      (leg2date) => {
        leg2date = leg2date ? moment(leg2date).format("DD/MM/Y") : "";
        setLeg2date(leg2date);
        setDayBackBond(null);
      }
    );
  };

  const handleChangeExpireDate = (date) => {
    setNewExpiredDate(moment(date), (newExpired) => {
      _getSettleDate(
        moment(newExpired).format("YYYY-MM-DD"),
        props.params.bond_code
      );
      handlegetPromotion();
      const { params } = props;
      if (props.params.side === "dat-ban" && urlParams && urlParams.deal_id) {
        getDealPricing(
          urlParams.deal_id,
          moment(newExpired).format("YYYY-MM-DD")
        ).then((res) => {
          setPrice(res.data.price);
          setDealPricing(res.data);
        });
      }
      let term = null;
      if (params.product_type === "VAR") term = getHighestTerm(terms);
      calculateLeg2TradeDate(
        params.product_type,
        moment(newExpired).format("DD/MM/Y"),
        term,
        (leg2date) => {
          const newleg2date = leg2date
            ? moment(leg2date).format("DD/MM/Y")
            : "";
          const isSellVar =
            params.product_type === "VAR" &&
            params.side === "dat-ban" &&
            parsed.terms;
          if (isSellVar) {
            setLeg2date(newleg2date);
            setTerm(getTermSellVar(newExpired, terms));
          } else {
            setLeg2date(newleg2date);
          }
        }
      );
    });
  };

  const calculateLeg2TradeDate = (product_type, value_date, term, callback) => {
    if (
      (product_type === "VAR" || product_type === "FIX") &&
      props.params.side === "dat-ban"
    ) {
      if (urlParams && urlParams.leg2_trade_date) {
        callback(moment(moment(urlParams.leg2_trade_date), "DD/MM/Y"));
      } else {
        callback("");
      }
    } else {
      let leg2date = "";
      if (product_type !== "OUTRIGHT" && term && value_date) {
        leg2date = moment(value_date, "DD/MM/Y").add(
          convertTermToDate(term),
          "days"
        );
        getLeg2TradeDate({
          bond_code: props.params.bond_code,
          value_date: moment(value_date, "DD/MM/Y").format("Y-MM-DD"),
          product_type,
          terms: [term],
        })
          .then((res) => {
            if (res && res.data) {
              leg2date = moment(moment(res.data), "YYYY-MM-DD");
              if (props.params.side == "dat-mua") {
                fetchLeg2SettleDate(res.data, term);
              }
            }
          })
          .finally(() => {
            callback(leg2date);
          });
      }
    }
  };

  const fetchLeg2SettleDate = (leg2_tradeDate, termSelected) => {
    getSettleDate(leg2_tradeDate, props.params.bond_code).then((res) => {
      if (res.data) {
        const { settledDate } = res.data;
        setLeg2SettleDate(settledDate);
        if (navParvalue) {
          const { params } = props;
          getDayBackBond(
            params.bond_code,
            params.product_type,
            settledDate,
            navParvalue
          ).then((res) => {
            const { data } = res;
            if (data && data[0]) {
              setTerm(data[0]);
            }
          });
        } else {
          setTerm(termSelected);
        }
      }
    });
  };

  const convertTermToDate = (term) => {
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
  };

  const getHighestTerm = (terms) => {
    let hightest_term = 0;
    let max = 0;
    terms.map((term) => {
      if (max < convertTermToDate(term)) {
        max = convertTermToDate(term);
        hightest_term = term;
      }
      return false;
    });
    return hightest_term;
  };

  const getTermSellVar = (date, terms) => {
    let result = { rate: 0 };
    let sellDate = date
      ? moment(date).format("YYYY-MM-DD")
      : moment().format("YYYY-MM-DD");
    terms.forEach((term) => {
      if (term.maturityDate <= sellDate) {
        result = term;
      }
    });
    return result;
  };

  const otherTermUnit = (unit) => {
    if (unit.year && unit.year > 0) return unit.year + " năm";
    if (unit.month && unit.month > 0) return unit.month + " tháng";
    if (unit.week && unit.week > 0) return unit.week + " tuần";
    return null;
  };

  const dayOfTermbyleg2date = (leg2date, leg2_settled_date) => {
    if (props.params.side === "dat-mua" && leg2_settled_date) {
      return moment(leg2_settled_date, "YYYY-MM-DD").toDate();
    }
    if (!leg2date) return null;
    return moment(leg2date, "DD/MM/YYYY").toDate();
  };

  const realInterestRate = (term, promotion) => {
    let rate = 0;
    if (term && term.rate) rate = term.rate;
    if (promotion && promotion.promotion_code)
      rate = addDecimals(rate, promotion.promotion_code);
    if (promotion && promotion.promotion_nav)
      rate = addDecimals(rate, promotion.promotion_nav);
    return rate;
  };

  const handleBack = () => {
    if (window.location.href.toString().indexOf("danh-muc") > 0) {
      props.router.push("/danh-muc");
    } else {
      props.router.push("/bang-gia");
    }
  };

  const changeCarebyCode = (e) => {
    setCareby_code(e.target.value.replace(/ /g, ""));
  };

  const handeBlurRefer = (e) => {
    if (e.target.value) {
      getReferFullName(e.target.value)
        .then((res) => {
          if (res && res.data) {
            setRefer_full_name(res.data);
          }
        })
        .catch((e) => {
          if (e && e.response && e.response.data) {
            displayNoti(parseErrorMessage(e.response.data), "error");
          }
        });
    } else {
      setRefer_full_name("");
    }
  };

  const changeQuantity = (e) => {
    let quantity = numeral(e.target.value).value();
    if (urlParams && urlParams.quantity) {
      const originQuantity = Number(urlParams.quantity);
      if (quantity < 0 || quantity > originQuantity) {
        quantity = numeral(originQuantity).value();
      }
      setQuantity(quantity);
      if (numeral(e.target.value).value() >= originQuantity) {
        setBond_certificate(false);
      }
    } else {
      setQuantity(quantity);
    }
    handlegetPromotion(quantity);
    loadNavParvalue(quantity);
  };

  const handeBlurCarebyCode = (e) => {
    getUserByHrCode(e.target.value)
      .then((res) => {
        if (res && res.data) {
          setCareby_full_name(res.data.userFullName);
          setErrorCareby(null);
          handlegetPromotion(quantity);
        } else {
          setCareby_full_name("");
          handlegetPromotion(quantity);
        }
      })
      .catch((err) => {
        if (err && err.response && err.response.data) {
          displayNoti(parseErrorMessage(err.response.data), "error");
          setErrorCareby(parseErrorMessage(err.response.data));
          setCareby_full_name("");
          handlegetPromotion(quantity);
        }
      });
  };

  const findUserInfo = ({ accounts, urlParams }) => {
    let userAcc;
    if (accounts && accounts.length > 0) {
      accounts = accounts.filter(
        (acc) => acc.type === "Owner" || acc.type === "Member"
      );
      if (urlParams && urlParams.customer_account_no) {
        userAcc = accounts.find(
          (a) => a.accountNumber === urlParams.customer_account_no
        );
      }
    }
    return userAcc;
  };

  const findBondDetail = (bonds, prams) => {
    if (!bonds) return null;
    return Object.values(bonds).find(
      (bond) => bond.bond_code === prams.bond_code
    );
  };

  const calCanBuy = ({
    bondInfo,
    params,
    outRightAsset,
    availableWithdraw,
    price,
    isPublicBond,
    temporary_fee_rate,
  }) => {
    let canBuy = 0;
    const qMax =
      price > 0
        ? Math.floor(availableWithdraw / (price * (1 + bondInfo.fee / 100)))
        : 0;
    if (bondInfo) {
      if (params.side === "dat-mua") {
        if (isPublicBond) {
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
        params.side === "dat-ban" &&
        outRightAsset
      ) {
        const asset = outRightAsset.find(
          (asset) =>
            asset.bondCode === bondInfo.bond_code &&
            asset.productType === bondInfo.product_type
        );
        if (asset) canBuy = asset.sellableQuantity;
      }
    }
    if (canBuy < 0) canBuy = 0;
    return canBuy;
  };

  const renderBondCertificate = ({
    lang,
    bond_certificate,
    params,
    urlParams,
    quantity,
    bond_detail,
  }) => {
    const { custodyCenter } = bond_detail;
    if (
      (params.side === "dat-ban" &&
        urlParams.quantity &&
        quantity >= Number(urlParams.quantity)) ||
      custodyCenter === "001" ||
      custodyCenter === "003"
    ) {
      return null;
    }
    return (
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
          <ReactTooltip id="tip-bond_certificate" effect="solid" place="bottom">
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
              onClick={() => setBond_certificate(true)}
              onChange={() => {}}
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
              onChange={() => {}}
              checked={!bond_certificate}
              onClick={() => setBond_certificate(false)}
            />
            <span className={cl({ "t-gray": bond_certificate })}>
              {lang["no"]}
            </span>
            <span className="checkmark" />
          </label>
        </div>
      </div>
    );
  };

  const itax = useMemo(() => {
    let t = 0;
    if (
      props.params.side !== "dat-mua" &&
      tax &&
      tax.isSellTax &&
      tax.isSellTax === "Y"
    ) {
      t = parseFloat(tax.sellTaxRate);
    }
    return t;
  }, [tax]);

  const isPublicBond = useMemo(() => {
    const { bonds, params } = props;
    const bondDetail = bonds ? bonds[params?.bond_code] : null;
    if (bondDetail) return bondDetail.custodyCenter === "001";
  }, [props.bonds, props.params]);

  const calculateFee = useCallback(
    (quantity, price) => {
      if (isPublicBond) {
        return temporary_fee_rate
          ? numeral(quantity * price * temporary_fee_rate).format("0,0")
          : 0;
      } else {
        return bondInfo
          ? numeral(quantity * price * (bondInfo.fee / 100)).format("0,0")
          : 0;
      }
    },
    [bondInfo, isPublicBond, temporary_fee_rate]
  );

  const calculateTotalPayment = useCallback(
    (quantity, price) => {
      const { side } = props.params;
      if (isPublicBond) {
        const tfee = temporary_fee_rate
          ? quantity * price * temporary_fee_rate
          : 0;
        if (side === "dat-mua") {
          return numeral(quantity * price + tfee + itax).format("0,0");
        } else {
          return numeral(quantity * price - tfee - itax).format("0,0");
        }
      } else {
        if (bondInfo) {
          if (side === "dat-mua") {
            return numeral(
              quantity * price * (1 + itax / 100 + bondInfo.fee / 100)
            ).format("0,0");
          } else {
            return numeral(
              quantity * price * (1 - itax / 100 - bondInfo.fee / 100)
            ).format("0,0");
          }
        }
      }
    },
    [isPublicBond, props.params, itax, temporary_fee_rate]
  );

  const { lang, params, accounts, popup, bonds } = props;
  if (!bondInfo || !bonds) {
    return (
      <div id="bonddetail">
        <h2>{params.bond_code}</h2>
        <h2>
          <i className="fa fa-spinner fa-spin" />
        </h2>
      </div>
    );
  }
  const typeBond = checkTypebond(params);
  const userInfo = findUserInfo({ accounts, urlParams });
  const bond_detail = findBondDetail(bonds, params);
  const canBuy = calCanBuy({
    bondInfo,
    params,
    outRightAsset,
    availableWithdraw,
    price,
    isPublicBond,
    temporary_fee_rate,
  });
  const ifee = calculateFee(quantity, price);

  return (
    <div className="set-order-page">
      <BeforeLimit
        lang={lang}
        handleGo={() => {
          handleMakeDeal(null, true);
        }}
      />
      <div className="header-block">
        <h1 className="txt-upper">
          {lang["TradingInformation"]} {coupon && `- ${coupon.otherName}`}
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
      <form className="info-order" onSubmit={handleMakeDeal}>
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
                  {urlParams && urlParams.from === "danh-muc" ? (
                    <span>{urlParams.customer_account_no}</span>
                  ) : (
                    <div
                      className="account-box accounts-suggestion"
                      style={{ padding: 0 }}
                    >
                      <AccountsSuggestion
                        accounts={accounts}
                        lang={lang}
                        activeAccount={
                          account.account_name
                            ? {
                                accountNumber: account.account_no,
                                fullName: account.account_name,
                              }
                            : userInfo
                        }
                        handleSelect={(acc) => {
                          changeAccountNo(acc);
                        }}
                      />
                    </div>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-l t-gray">{lang["Loại lệnh"]}</td>
                <td className="text-l txt-bold">
                  <span
                    style={
                      props.params.side === "dat-mua"
                        ? { color: "#53b314", fontWeight: "bold" }
                        : { color: "#ed1c24", fontWeight: "bold" }
                    }
                  >
                    {props.params.side === "dat-mua"
                      ? lang["buy"].toUpperCase()
                      : lang["sell"].toUpperCase()}
                  </span>
                </td>
              </tr>

              {params.side === "dat-ban" && params.product_type === "FIX" && (
                <tr>
                  <td className="text-l t-gray">Lựa chọn</td>
                  <td className="text-l txt-bold">
                    <select
                      className="bgtrans select-tag"
                      value={finalSettlement}
                      onChange={(v) => onchangeSettledate(v, leg2date)}
                    >
                      {renderOptionType(leg2date)}
                    </select>
                  </td>
                </tr>
              )}

              <tr>
                <td className="text-l t-gray">{lang["TradeDate"]}</td>
                <td className="text-l txt-bold">
                  {!finalSettlement &&
                    (props.params.side === "dat-mua" ? (
                      <span>{timeServer("DD/MM/YYYY")}</span>
                    ) : compareTodaytoLeg2trade(leg2date) ? (
                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        minDate={minTradeDate(urlParams)}
                        maxDate={maxTradeDate(bondInfo, urlParams)}
                        disabled={false}
                        tabIndex="5"
                        className="ep-date"
                        placeholderText=""
                        selected={
                          newExpiredDate ? newExpiredDate.toDate() : null
                        }
                        onChange={handleChangeExpireDate}
                      />
                    ) : (
                      <span>{timeServer("DD/MM/YYYY")}</span>
                    ))}
                  {finalSettlement &&
                    (compareTodaytoLeg2trade(leg2date) ? (
                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        minDate={minTradeDate(urlParams, finalSettlement)}
                        maxDate={maxTradeDate(
                          bondInfo,
                          urlParams,
                          finalSettlement
                        )}
                        disabled={false}
                        tabIndex="5"
                        className="ep-date"
                        placeholderText=""
                        selected={
                          newExpiredDate ? newExpiredDate.toDate() : null
                        }
                        onChange={handleChangeExpireDate}
                      />
                    ) : (
                      <span>{timeServer("DD/MM/YYYY")}</span>
                    ))}
                </td>
              </tr>

              <tr>
                <td className="text-l t-gray">{lang["settlementDate"]}</td>
                <td className="text-l txt-bold">
                  {props.params.side === "dat-mua" ? (
                    <span>{settledDate}</span>
                  ) : compareTodaytoLeg2trade(leg2date) ? (
                    <span>{settledDate}</span>
                  ) : (
                    <span>{timeServer("DD/MM/YYYY")}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-l t-gray">{lang["select_careby"]}</td>
                <td className="text-l txt-bold">
                  <select
                    className="bgtrans select-tag"
                    value={selectedSale}
                    onChange={handleChangeSale}
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
                      onChange={changeCarebyCode}
                      onBlur={handeBlurCarebyCode}
                    />
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
              {isShowRefer && params.side === "dat-mua" && (
                <tr>
                  <td className="text-l t-gray">{lang["refer"]}</td>
                  <td className="text-l txt-bold">
                    <input
                      className="bggray"
                      type="text"
                      value={refer}
                      onChange={changeRefer}
                      onBlur={handeBlurRefer}
                    />
                  </td>
                </tr>
              )}

              {isShowRefer && params.side === "dat-mua" && (
                <tr>
                  <td className="text-l t-gray">{lang["referFullName"]}</td>
                  <td className="text-l txt-bold">
                    <span>{refer_full_name}</span>
                  </td>
                </tr>
              )}

              <tr>
                <td className="text-l t-gray">{lang["Quantity"]}</td>
                <td className="text-l txt-bold">
                  <div
                    style={{
                      position: "relative",
                      width: "90%",
                      minWidth: 180,
                    }}
                  >
                    <input
                      style={{ width: "100%" }}
                      className="bggray"
                      type="text"
                      value={numeral(quantity).format("0,0")}
                      onChange={changeQuantity}
                      disabled={
                        params.side === "dat-ban" &&
                        params.product_type === "FIX"
                      }
                    />
                    {(params.side === "dat-mua" &&
                      bondInfo &&
                      bondInfo.max_quantity) ||
                    (params.side === "dat-ban" &&
                      bondInfo &&
                      bondInfo.product_type === "OUTRIGHT") ? (
                      <div
                        style={{
                          position: "absolute",
                          top: 2,
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
              {props.params.product_type !== "OUTRIGHT" && (
                <tr>
                  <td className="text-l t-gray">{lang["minimumTerm"]}</td>
                  <td className="text-l txt-bold">
                    {props.params.side === "dat-ban" &&
                    props.params.product_type === "FIX" ? (
                      <span>{`${
                        JSON.parse(urlParams.terms)[0].term
                      } ${getTermUnit(
                        JSON.parse(urlParams.terms)[0].term_unit,
                        lang
                      )}`}</span>
                    ) : props.params.product_type === "VAR" ? (
                      <input
                        className="bgtrans"
                        type="text"
                        value={term_name}
                        disabled
                      />
                    ) : (
                      <select
                        className="bgtrans select-tag"
                        onChange={changeTerm}
                        value={term ? term.termRateId : ""}
                      >
                        {terms.map((term) => (
                          <option value={term.termRateId} key={term.termRateId}>
                            {`${term.term} ${getTermUnit(
                              term.term_unit,
                              lang
                            )} ${
                              otherTermUnit(term.standard_term_unit)
                                ? " - " + otherTermUnit(term.standard_term_unit)
                                : ""
                            }`}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              )}
              {props.params.product_type === "FIX" && (
                <tr>
                  <td className="text-l t-gray">{lang["leg2TradeDate"]}</td>
                  <td className="text-l">
                    {props.params.side === "dat-ban" ? (
                      <span>{leg2date ? leg2date : ""}</span>
                    ) : (
                      <DatePicker
                        dateFormat="dd/MM/yyyy"
                        minDate={new Date()}
                        tabIndex="5"
                        className="ep-date"
                        placeholderText=""
                        selected={
                          dayBackBond
                            ? dayBackBond
                            : dayOfTermbyleg2date(leg2date, leg2SettledDate)
                        }
                        onChange={(d) =>
                          changeDayBackBond(d, bondInfo, navParvalue)
                        }
                      />
                    )}
                  </td>
                </tr>
              )}

              {typeBond === "d-bond" && (
                <tr>
                  <td
                    className={cl("text-l ", {
                      "pointer anoffer": params.side === "dat-mua",
                      "t-gray": params.side === "dat-ban",
                    })}
                    onClick={() => {
                      if (params.side === "dat-mua") {
                        setShowMoreInterest(!showMoreInterest);
                      }
                    }}
                  >
                    <span className="">{lang["real_rate"]}</span>
                    {params.side === "dat-mua" && (
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
                    {params.side === "dat-mua" ? (
                      <span>
                        {numeral(realInterestRate(term, promotion)).format(
                          "0,0.[00]"
                        )}
                        %/{lang["year"]}
                      </span>
                    ) : (
                      <span>
                        {dealPricing && (
                          <span>
                            {numeral(dealPricing.rate * 100).format("0,0.[00]")}
                            %/{lang["year"]}
                          </span>
                        )}
                      </span>
                    )}
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
              {params.side === "dat-mua" && showMoreInterest && (
                <tr>
                  <td className="text-l pl42 t-gray">
                    {lang["codePromotion"]}
                  </td>
                  <td className="text-l txt-bold">
                    <input
                      className="bggray"
                      id="code_promotion"
                      type="text"
                      value={codePromotion}
                      onChange={changeCodePromotion}
                      onBlur={() => handlegetPromotion(quantity)}
                    />
                  </td>
                </tr>
              )}
              {showMoreInterest && (
                <tr>
                  <td className="text-l pl42 t-gray">
                    {lang["promotion_by_bond_code"]}
                  </td>
                  <td className="text-l txt-bold">
                    {promotion.promotion_code}%
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
                      "pointer anoffer": params.side === "dat-mua",
                      "t-gray": params.side === "dat-ban",
                    })}
                    onClick={() => {
                      if (params.side === "dat-mua") {
                        setShowMorePrice(!showMorePrice);
                      }
                    }}
                  >
                    <span>{lang["Giá thực hiện"]}</span>
                    {params.side === "dat-mua" && (
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
                      numeral(priceOutrightBeforePromotion).format("0,0")}{" "}
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
                      onChange={changeCodePromotion}
                      onBlur={() => handlegetPromotion(quantity)}
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
                    <span>
                      {typeBond === "d-bond" ? `%/${lang["year"]}` : "%"}
                    </span>
                  </td>
                </tr>
              )}
              {typeBond === "v-bond" && params.side === "dat-mua" && (
                <tr>
                  <td className="text-l t-gray">{lang["total_promotion"]}</td>
                  <td className="text-l txt-bold">
                    <span>
                      {numeral(
                        quantity * (priceOutrightBeforePromotion - price)
                      ).format("0,0")}{" "}
                      {lang["currency"]}
                    </span>
                  </td>
                </tr>
              )}
              {typeBond === "d-bond" && (
                <tr>
                  <td className="text-l t-gray">{lang["Volume"]}</td>
                  <td className="text-l txt-bold">
                    <span>
                      {numeral(quantity * price).format("0,0")}{" "}
                      {lang["currency"]}
                    </span>
                  </td>
                </tr>
              )}

              {typeBond === "v-bond" && (
                <tr>
                  <td className="text-l t-gray">{lang["Volume"]}</td>
                  <td className="text-l txt-bold">
                    <span>
                      {numeral(quantity * price).format("0,0")}{" "}
                      {lang["currency"]}
                    </span>
                  </td>
                </tr>
              )}
              {typeBond === "d-bond" && (
                <tr>
                  <td className="text-l t-gray">{lang["Tax"]}</td>
                  <td className="text-l txt-bold">
                    {numeral((quantity * price * itax) / 100).format("0,0")}{" "}
                    {lang["currency"]}
                  </td>
                </tr>
              )}
              {typeBond === "v-bond" && (
                <tr>
                  <td className="text-l t-gray">{lang["Tax"]}</td>
                  <td className="text-l txt-bold">
                    {numeral((itax * quantity * price) / 100).format("0,0")}{" "}
                    {lang["currency"]}
                  </td>
                </tr>
              )}

              <tr>
                <td className="text-l t-gray">
                  <span>
                    {isPublicBond ? lang["temporaryFee"] : lang["fee"]}
                  </span>
                  {isPublicBond && (
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
                        ).format("0.[0000]")}% ${lang["tipTempoaryFee2"]}`}</p>
                      </ReactTooltip>
                    </span>
                  )}
                </td>
                <td className="text-l txt-bold">
                  {ifee} {lang["currency"]}
                </td>
              </tr>
              <tr>
                <td className="text-l t-gray">{lang["totalPayment"]}</td>
                <td className="text-l txt-bold">
                  {calculateTotalPayment(quantity, price)} {lang["currency"]}
                </td>
              </tr>
            </tbody>
          </table>

          {renderBondCertificate({
            lang,
            bond_certificate,
            params,
            urlParams,
            quantity,
            bond_detail,
          })}

          <div className="registry-extract">
            <label />
            <div className="my-checkbox">
              <label className="contain">
                <input
                  type="checkbox"
                  style={{ height: 13, width: "auto" }}
                  onChange={() => {
                    setAcceptTerm(!acceptTerm);
                  }}
                />
                <span className="checkmark" />
                <label style={{ marginLeft: "23px" }}>
                  {bondInfo &&
                  params.side === "dat-mua" &&
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
          {error && (
            <div className="form-group">
              <p
                className="txt-note"
                style={{ color: "red" }}
                dangerouslySetInnerHTML={{ __html: error }}
              />
            </div>
          )}

          {errorCodePromotion && (
            <div className="form-group">
              <p
                className="txt-note"
                style={{ color: "red" }}
                dangerouslySetInnerHTML={{ __html: errorCodePromotion }}
              />
              <label />
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
          <div className="btn-group">
            <button
              className="btn btn-primary"
              style={{
                marginRight: 0,
                textTransform: "uppercase",
                opacity:
                  errorAccount ||
                  errorBankAccount ||
                  isBusinessCustomer(accounts)
                    ? 0.5
                    : 1,
              }}
            >
              {processing ? (
                <i className="fa fa-spin fa-spinner" />
              ) : (
                lang["perform"]
              )}
            </button>
          </div>
          <p className="tc">
            <u className="pointer" onClick={handleBack}>
              {lang["Back"]}
            </u>
          </p>
        </div>

        <BondInfo
          lang={lang}
          bond_detail={bond_detail}
          coupon={coupon}
          bondInfo={bondInfo}
          {...props}
        />
      </form>
      {popup.status && <PopupContainer {...props} {...popup} />}
    </div>
  );
}

const mapStateToProps = ({ bondStore, popupStore }) => {
  return {
    bonds: bondStore.bonds,
    mapProducts: bondStore.mapProducts,
    rates: bondStore.rates,
    products: bondStore.products,
    popup: popupStore,
    fullProducts: bondStore.fullProducts,
    scheduleRestrictedList: bondStore.scheduleRestrictedList,
  };
};

export default connect(mapStateToProps)(BuyPage);