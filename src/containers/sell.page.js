import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useStateCallback } from "../common/hook";
import { connect } from "react-redux";
import ReactTooltip from "react-tooltip";
import {
  getBondInfo,
  getTableRate,
  getBondPricing,
  getDealPricing,
  getUserByHrCode,
  getLeg2TradeDate,
  getPromotion,
  getSale,
  getSettleDate,
  getCoupon,
  getMembership,
  addDealsV2,
  getBase64Contract,
  getItemExplainBond,
  getTemporaryFee,
  getAssets,
  getTax,
  getSystemProperties,
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
  timeUnitServer,
} from "../helpers";
import { parseErrorMessage } from "../modules/error_parser/error.parser.v2";
import { trackVNDA } from "../modules/tracker";
import { numberPrecision } from "../common/utils";
import wa from "../resource/images/warm.svg";
import BondInfo from "../components/orderpage/bond.info";
import BeforeLimit from "../components/popup/beforeLimit";
import PopupContainer from "../components/popup/index";
import { openPopup } from "../actions/customer.actions";
const queryString = require("query-string");

function SellPage(props) {
  const [readContract, setReadContract] = useStateCallback(false);
  const [promotion, setPromotion] = useStateCallback({});
  const [account, setAccount] = useStateCallback({});
  const [newExpiredDate, setNewExpiredDate] = useStateCallback(
    timeUnitServer().toDate()
  );
  const [bondInfo, setBondInfo] = useStateCallback(null);

  const [processing, setProcessing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [errorCodePromotion, setErrorCodePromotion] = useState(null);
  const [errorCareby, setErrorCareby] = useState(null);

  const [tax, setTax] = useState(0);
  const [outRightAsset, setOutRightAsset] = useState(null);
  const [term, setTerm] = useState(null);
  const [terms, setTerms] = useState([]);
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
  const [bond_certificate, setBond_certificate] = useState("");
  const [acceptTerm, setAcceptTerm] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [system_property, setSystemProperty] = useState(null);

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
      setAccount(
        accounts.find((e) => e.accountNumber == parsed.customer_account_no)
      );
      setUrlParams(parsed);
      getOutRightAsset(parsed.customer_account_no);
      handlegetTax(parsed.customer_account_no);
      if (parsed.leg2_trade_date) {
        setNewExpiredDate(moment(parsed.leg2_trade_date, "YYYY-MM-DD"));
      }
      _getSale();
      if (parsed.promotion && !isNaN(parsed.promotion)) {
        setPromotion(parsed.promotion);
      }
      if (parsed.quantity) {
        setQuantity(Number(parsed.quantity));
      }
    }
  }, [props.accounts]);

  useEffect(() => {
    if (urlParams && props.params.bond_code) {
      _getBondInfo(props.params.bond_code);
      _getCoupon(props.params.bond_code);
      handleGetSystemProperty();
    }
  }, [urlParams]);

  const handlegetTax = (accountNumber) => {
    getTax(accountNumber).then((res) => {
      setTax(res.data);
    });
  };

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
            if (parsed.type_bond === "vbond" && parsed.value_date) {
              _getSettleDate(parsed.value_date, bondInfo.bond_code);
            }
            if (parsed && parsed.deal_id) {
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
            handlegetPromotion();
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
              if (urlParams.termRateId && terms) {
                term = terms.find(
                  (term) => term.termRateId == urlParams.termRateId
                );
              }
              calculateLeg2TradeDate(
                product_type,
                moment(newExpiredDate).format("DD/MM/Y"),
                term,
                (leg2date) => {
                  setTerm(term);
                  let leg2dateCustom = leg2date
                    ? moment(leg2date).format("DD/MM/Y")
                    : "";
                  setLeg2date(leg2dateCustom);
                }
              );
            }
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
        // _getTemporaryFee(bondCode)
      }
    });
  };

  const handleGetSystemProperty = () => {
    getSystemProperties().then((res) => {
      if (res.data) {
        setSystemProperty(res.data.content);
      }
    });
  };

  const checkValidData = (limit) => {
    setError(null);
    const { product_type } = props.params;
    if (errorCodePromotion) return false;
    const { lang } = props;
    let error = null;
    if (!finalSettlement && product_type === "FIX") {
      error = lang["finalSettlement"];
    }
    if (!acceptTerm) {
      error = lang["acceptTermRequired"];
    }
    if (!quantity) {
      error = lang["inputRequired"];
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
    if (bondInfo && bondInfo.product_type === "FIX") {
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
    if (processing || pending || isBusinessCustomer(props.accounts)) {
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
    let buy_fee = 0;
    let sell_fee = 0;
    let leg2_trade_date = moment(leg2date, "DD/MM/Y").format("Y-MM-DD");
    let product_type = props.params.product_type;
    let side = "NS";
    let tax = 0;
    const requestId = Math.floor(Date.now() / 1000) - new Date().getSeconds();
    if (tax && tax.isSellTax === "Y") {
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
    if (urlParams && urlParams.terms) {
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
      accountNo: account.accountNumber,
      custId: props.authInfo.customerId,
      bondCode: bond_code,
      productType: product_type,
      quantity,
      valueDate: value_date,
      price,
      tax,
      side,
      fee: side === "NB" ? buy_fee : sell_fee,
      requestId: `${requestId}-${account.accountNumber}`,
      bondPayment: bond_payment,
      tradingPayment: trading_payment,
      terms: terms,
      promotion: promotion.promotion,
      leg2SettledDate:
        side === "NS" && product_type === "FIX"
          ? urlParams.leg2_trade_date
          : product_type === "OUTRIGHT"
          ? moment().format("Y-MM-DD")
          : "",

      bondCertificate: bond_certificate,
      careBy: careby_code,
      referCode: "",
      tradeDate: timeServer(),
      fullName: account.fullName,
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

    if ((product_type === "VAR" || product_type === "FIX") && side === "NS") {
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
            accountNo: account.accountNumber,
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

  const changeCodePromotion = (e) => {
    setCodePromotion(e.target.value);
  };

  const handlegetPromotion = (q) => {
    const quantity = q ? q : quantity;
    if (props.params.product_type !== "OUTRIGHT") {
      return;
    }
    setTimeout(() => {
      setPending(true);
      const side = "NS";
      if (bondInfo) {
        getPromotion(
          bondInfo.product_type,
          account.accountNumber,
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

  const onchangeSettledate = (v, leg2date) => {
    const key = v.target.value;
    let date = timeUnitServer();
    switch (key) {
      case "early":
        const { trade_date } = urlParams;
        const deal_min =
          system_property &&
          system_property.find((e) => e.name === "deal_min_holding_period");
        const valueDay = (deal_min && parseInt(deal_min.value)) || 0;
        let tplus5 = moment(trade_date, "YYYY-MM-DD").add(valueDay, "days");
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
      if (urlParams && urlParams.deal_id) {
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
          const deal_min =
            system_property &&
            system_property.find((e) => e.name === "deal_min_holding_period");
          const valueDay = (deal_min && parseInt(deal_min.value)) || 0;
          const tplus5 = moment(trade_date, "YYYY-MM-DD").add(valueDay, "days");
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
        } else if (bondInfo.product_type === "FIX") {
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
    const side = "NS";
    const bondInfo = infoBond || bondInfo;
    if (!bondInfo) return;
    getBondPricing(bondInfo, side, valueDate, promotion?.promotion || 0).then(
      (res) => {
        setPrice(res.data.price);
        setPriceOutrightBeforePromotion(res.data.priceOutrightBeforePromotion);
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
      let term;
      if (urlParams && urlParams.deal_id) {
        getDealPricing(
          urlParams.deal_id,
          moment(newExpired).format("YYYY-MM-DD")
        ).then((res) => {
          setPrice(res.data.price);
          setDealPricing(res.data);
        });
      }
      if (params.product_type === "VAR") term = getHighestTerm(terms);
      calculateLeg2TradeDate(
        params.product_type,
        moment(newExpired).format("DD/MM/Y"),
        term,
        (leg2date) => {
          leg2date = leg2date ? moment(leg2date).format("DD/MM/Y") : "";
          const parsed = urlParams;
          const isSellVar = params.product_type === "VAR" && parsed.terms;
          if (isSellVar) {
            setLeg2date(leg2date);
            setTerm(getTermSellVar(newExpired, terms));
          } else {
            setLeg2date(leg2date);
          }
        }
      );
    });
  };

  const calculateLeg2TradeDate = (product_type, value_date, term, callback) => {
    if (product_type === "VAR" || product_type === "FIX") {
      const queryData = queryString.parse(window.location.search);
      if (queryData && queryData.leg2_trade_date) {
        callback(moment(moment(queryData.leg2_trade_date), "DD/MM/YYYY"));
      } else {
        callback("");
      }
    } else {
      let leg2date = "";
      if (product_type !== "OUTRIGHT" && term && value_date) {
        leg2date = moment(value_date, "DD/MM/YYYY").add(
          convertTermToDate(term),
          "days"
        );
        getLeg2TradeDate({
          bond_code: props.params.bond_code,
          value_date: moment(value_date, "DD/MM/YYYY").format("YYYY-MM-DD"),
          product_type,
          terms: [term],
        })
          .then((res) => {
            if (res && res.data) {
              leg2date = moment(moment(res.data), "YYYY-MM-DD");
            }
          })
          .finally(() => {
            callback(leg2date);
          });
      }
    }
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

  const handleBack = () => {
    props.router.push("/danh-muc");
  };

  const changeCarebyCode = (e) => {
    setCareby_code(e.target.value.replace(/ /g, ""));
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
  };

  const getOutRightAsset = (accountNumber) => {
    getAssets({ accountNumber }).then((res) => {
      if (res && res.data) {
        setOutRightAsset(res.data.content);
      }
    });
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

  const findBondDetail = (bonds, prams) => {
    if (!bonds) return null;
    return Object.values(bonds).find(
      (bond) => bond.bond_code === prams.bond_code
    );
  };

  const calCanBuy = ({ bondInfo, outRightAsset }) => {
    let canBuy = 0;
    if (bondInfo) {
      if (bondInfo.product_type === "OUTRIGHT" && outRightAsset) {
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

  const itax = useMemo(() => {
    let t = 0;
    if (tax && tax.isSellTax && tax.isSellTax === "Y") {
      t = parseFloat(tax.sellTaxRate);
    }
    return t;
  }, [tax]);

  const calculateFee = useCallback(
    (quantity, price) => {
      return bondInfo
        ? numeral(quantity * price * (bondInfo.fee / 100)).format("0,0")
        : 0;
    },
    [bondInfo]
  );

  const calculateTotalPayment = useCallback(
    (quantity, price) => {
      if (bondInfo) {
        return numeral(
          quantity * price * (1 - itax / 100 - bondInfo.fee / 100)
        ).format("0,0");
      }
    },
    [props.params, itax, bondInfo]
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
  const bond_detail = findBondDetail(bonds, params);
  const canBuy = calCanBuy({ bondInfo, outRightAsset, terms });
  const ifee = calculateFee(quantity, price);
  console.log("newExpiredDate:", newExpiredDate);
  console.log("finalSettlement:", finalSettlement);
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
                  <span>{urlParams.customer_account_no}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-l t-gray">{lang["Loại lệnh"]}</td>
                <td className="text-l txt-bold">
                  <span style={{ color: "#ed1c24", fontWeight: "bold" }}>
                    {lang["sell"].toUpperCase()}
                  </span>
                </td>
              </tr>

              {params.product_type === "FIX" && (
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
                  <span>{settledDate}</span>
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
                            <option value={item.hrcode} key={i + item.hrcode}>
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
                      disabled={params.product_type === "FIX"}
                    />
                    {bondInfo && bondInfo.product_type === "OUTRIGHT" ? (
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
                    {urlParams.terms && (
                      <span>{`${
                        JSON.parse(urlParams.terms)[0].term
                      } ${getTermUnit(
                        JSON.parse(urlParams.terms)[0].term_unit,
                        lang
                      )}`}</span>
                    )}
                  </td>
                </tr>
              )}
              {props.params.product_type === "FIX" && (
                <tr>
                  <td className="text-l t-gray">{lang["leg2TradeDate"]}</td>
                  <td className="text-l">
                    {urlParams.leg2_settled_date && (
                      <span>
                        {moment(
                          urlParams.leg2_settled_date,
                          "YYYY-MM-DD"
                        ).format("DD/MM/YYYY")}
                      </span>
                    )}
                  </td>
                </tr>
              )}
              {typeBond === "d-bond" && (
                <tr>
                  <td className="text-l t-gray">
                    <span className="">{lang["real_rate"]}</span>
                  </td>

                  <td className="text-l txt-bold anoffer">
                    <span>
                      {dealPricing && (
                        <span>
                          {numeral(dealPricing.rate * 100).format("0,0.[00]")}
                          %/{lang["year"]}
                        </span>
                      )}
                    </span>
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
                  <td className={"text-l t-gray"}>
                    <span>{lang["Giá thực hiện"]}</span>
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
                  <span>{lang["fee"]}</span>
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
                  <span>{lang["DealConfirm"]}</span>
                </label>
              </label>
            </div>
          </div>

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
                opacity: isBusinessCustomer(accounts) ? 0.5 : 1,
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
    portfolio: bondStore.portfolio,
  };
};

export default connect(mapStateToProps)(SellPage);