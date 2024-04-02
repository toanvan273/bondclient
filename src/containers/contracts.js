import React, { Component } from "react";
import { Document, Page, setOptions } from "react-pdf"; // ver: 7.0.1
import {
  downloadContract,
  confirmBondContract,
  rejectBondContract,
  confirmProBond,
  confirmDealFromEmail,
  getContracts,
  confirmTransFromEmail
} from "../clients/bond.api.client";
import { getOtp, reportSendOtpSmsError } from "../clients/auth.api.client";
import { displayNoti } from "../helpers";
import { parseErrorMessage } from "../modules/error_parser/error.parser.v2";
import * as Tracker from "../modules/tracker";
import * as AuthService from "../services/auth.service";
const queryString = require('query-string');
// setOptions({ workerSrc: "/pdf.worker.min.js" });
// pdfjs.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
export default class Contracts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewedContract: [],
      contractData: null,
      requestData: null,
      numPages: null,
      pageNumber: 1,
      fileContent: null,
      error: null,
      agreeContracts: false,
      otpAvailable: true,
      isProcessingSendOtpError: false,
      loadingContract: false,
      loadContractError: null,
      loadingBtn: false,
      urlParams: null
    };

    this.processing = false;

    this.downloadContract = this.downloadContract.bind(this);
    this.viewContract = this.viewContract.bind(this);
    this.cancel = this.cancel.bind(this);
    this.comfirmContract = this.comfirmContract.bind(this);
    this.sendOTP = this.sendOTP.bind(this);
    this.toggleAgreeContracts = this.toggleAgreeContracts.bind(this);
    this.reportOtpSmsError = this.reportOtpSmsError.bind(this);
  }

  componentDidMount() {
    if (this.props.router.location.search.indexOf("source=email") > 0) {
      this.setState({ loadingContract: true });
      this.loadContracts(this.props.params.id);
    } else {
      const urlParams = queryString.parse(window.location.search);
      this.setState({
        loadingContract: true,
        urlParams
      });
      this.loadContracts(this.props.params.id);
      const contractData = localStorage.getItem(
        `contracts-${this.props.params.id}`
      );
      if (contractData) {
        this.setState(
          {
            contractData: JSON.parse(contractData)
          },
          () => {
            const requestData = localStorage.getItem(
              `request-${this.state.contractData.requestId}`
            );
            if (requestData) {
              let requestObj = JSON.parse(requestData);
              requestObj.referCode = requestObj.referral;
              delete requestObj.referral;
              this.setState({ requestData: requestObj });
            }
            if (this.state.contractData.contracts && this.state.contractData.contracts.length > 0) {
              let firstContract = this.state.contractData.contracts[0];
              this.viewContract(
                this.state.contractData.id,
                firstContract.code,
                firstContract.name
              )
            }
          }
        );
      }
    }
  }

  async loadContracts(docId) {
    try {
      const res = await getContracts(docId);
      if (res.data) {
        let contractData = {};
        contractData.id = docId;
        contractData.contracts = res.data.contracts;
        this.setState({ contractData });
        if (contractData.contracts && contractData.contracts.length > 0) {
          let firstContract = contractData.contracts[0];
          this.viewContract(
            contractData.id,
            firstContract.code,
            firstContract.name
          )
        }
      }
    } catch (err) {
      if (err.response.data) {
        this.setState({
          loadingContract: false,
          loadContractError: parseErrorMessage(err.response.data)
        });
      }
    }
  }

  reportOtpSmsError() {
    this.setState({
      isProcessingSendOtpError: true
    });
    reportSendOtpSmsError().then(res => {
      this.setState({
        reportMessage: this.props.lang["report_success"]
      });
    });
  }

  toggleAgreeContracts() {
    this.setState({
      agreeContracts: !this.state.agreeContracts
    });
  }

  sendOTP(e) {
    e.preventDefault();
    getOtp("sms", "vi");
    this.setState({
      sentOTP: true,
      otpAvailable: false,
      secondsLeft: 15
    });
    let otpAvailCountdown = setInterval(() => {
      this.setState({
        secondsLeft: --this.state.secondsLeft
      });

      if (this.state.secondsLeft === 0) {
        this.setState({
          otpAvailable: true
        });
        clearInterval(otpAvailCountdown);
      }
    }, 1000);
  }

  async confirmBondProContract(status) {
    const otp = this.refs.otp.value;
    let accountNo;
    let requestID;
    let side;
    let params = this.props.router.location.search.split("&");
    params.forEach(param => {
      if (param.indexOf("accountNo") >= 0) {
        accountNo = param.split("=")[1];
      }
      if (param.indexOf("requestId") >= 0) {
        requestID = param.split("=")[1];
      }
      if (param.indexOf("side") >= 0) {
        side = param.split("=")[1];
      }
    });
    let res;
    try {
      this.setState({ loadingBtn: true });
      if (side === "NB") {
        res = await confirmDealFromEmail(otp, requestID, accountNo, status);
      } else {
        res = await confirmTransFromEmail(otp, requestID, accountNo, status);
      }

      if (res.error) {
        displayNoti(parseErrorMessage(res.error), "error");
        this.setState({
          error: parseErrorMessage(parseErrorMessage(res.error))
        });
        this.setState({ loadingBtn: false });
      } else {
        if (status === 'REJECTED') {
          displayNoti(this.props.lang["rejectProbondSuccess"]);
        } else {
          displayNoti(this.props.lang["confirmProbondSuccess"]);
        }
        window.changeURL("/bond/so-lenh");
      }
    } catch (e) {
      const errorCode = e.response.data.error || e.response.data.code || "";
      this.setState({ loadingBtn: false });
      if (errorCode) {
        displayNoti(parseErrorMessage(e.response.data), "error");
        this.setState({
          error: parseErrorMessage(e.response.data)
        });
        if (errorCode.startsWith("OTP")) {
          this.processing = false;
        }
      } else {
        window.changeURL("/bond/so-lenh");
      }
    }
  }

  comfirmContract(e) {
    e.preventDefault();
    if (this.processing) return;

    this.setState({
      error: null
    });
    const {
      requestData,
      contractData,
      urlParams,
      agreeContracts
    } = this.state;
    const { lang } = this.props;
    const otp = this.refs.otp.value;
    let error = null;
    if (!agreeContracts) {
      error = lang["agree_all_contracts"];
    } else if (!otp) {
      error = lang["enter_otp"];
    }
    if (error) {
      this.setState({ error });
      return;
    }

    if (otp) {
      if (this.props.router.location.search.indexOf("source=email") > 0) {
        this.confirmBondProContract("CONFIRMED");
        return;
      }
      const type = localStorage.getItem("contract-type");
      let confirm;
      let data;
      if (type === "probond") {
        confirm = confirmProBond;
        let orderinfo = localStorage.getItem("orderinfo");
        data = {
          requestId: requestData.requestId,
          docIdBuy: contractData.id,
          side: requestData.side,
          bondCode: requestData.bondCode,
          quantity: requestData.quantity,
          price: requestData.price,
          customerAccountNo: requestData.accountNo,
          customerId: requestData.customerId,
          custodyCode: requestData.custodyCode,
          productType: requestData.productType,
          tradeDate: requestData.tradeDate,
          valueDate: requestData.valueDate,
          transValueDate: orderinfo
            ? JSON.parse(orderinfo).trans_value_date
            : null,
          value: localStorage.getItem("probond-register-amount")
        };
      } else {
        confirm = confirmBondContract;

        data = {
          accountNo: urlParams.accountNo,
          procInstId: urlParams.procInstId
        };
      }
      this.processing = true;
      this.setState({ loadingBtn: true });
      confirm(otp, data)
        .then(res => {
          if (res.status === 200) {
            displayNoti(this.props.lang["placeOrderSuccess"]);
            window.changeURL("/bond/so-lenh");
          }
        })
        .catch(e => {
          Tracker.track({
            vnda: {
              category: "Bond-Order",
              action: "Order error",
              props: {
                error: JSON.stringify(e.response),
                ...requestData,
                documentId: contractData.id
              }
            }
          });
          if (e && e.response && e.response.data) {
            const errorCode =
              e.response.data.error || e.response.data.code || "";

            if (errorCode) {
              if (e.response.data.error === 'DPM-2801') {
                const { error, errorMessage, id } = e.response.data
                this.setState({
                  error: `${errorMessage} (${error}) (${id})`
                })
                return;
              }
              displayNoti(parseErrorMessage(e.response.data), "error");
              this.setState({
                error: parseErrorMessage(e.response.data)
              });
              if (errorCode.startsWith("OTP")) {
                this.processing = false;
              }
            } else {
              window.changeURL("/bond/so-lenh");
            }
          } else {
            window.changeURL("/bond/so-lenh");
          }
        })
        .finally(() => {
          this.setState({ loadingBtn: false });
        });

      Tracker.track({
        vnda: {
          category: "Bond-Order",
          action: "Confirm OTP",
          props: {
            ...requestData,
            documentId: contractData.id,
          },
        },
      });
    }
  }

  async cancel(e) {
    e.preventDefault();
    if (this.props.router.location.search.indexOf("source=email") > 0) {
      const otp = this.refs.otp.value;
      if (otp) {
        this.confirmBondProContract("REJECTED");
      }
    } else {
      const { urlParams } = this.state;
      try {
        const res = rejectBondContract(
          urlParams.accountNo,
          urlParams.procInstId
        );
        if (res) this.props.router.push(`/bang-gia`);
      } catch (err) {
        if (err.response.data.error === "DPM-2801") {
          const { error, errorMessage, id } = err.response.data;
          this.setState({
            error: `${errorMessage} (${error}) (${id})`,
          });
          return;
        }
        this.setState({ error: parseErrorMessage(err.response.data) });
      }

    }
  }

  getFileContract(id, code, callback) {
    downloadContract(id, code)
      .then(res => {
        callback(res.data.data);
      })
      .catch(e => {
        if (e && e.response && e.response.data) {
          displayNoti(parseErrorMessage(e.response.data), "error");
        }
        callback(null);
      });
  }

  downloadContract(id, code, name) {
    this.getFileContract(id, code, fileContent => {
      if (fileContent) {
        this.downloadFile(`${name}.pdf`, fileContent);
      }
    });
  }

  viewContract(id, code, name) {
    if (!AuthService.isStep2Authenticated()) {
      window.parent.postMessage(["required2Authenticated"], "*");
      return;
    }
    let { viewedContract } = this.state;
    if (!viewedContract.includes(code)) {
      viewedContract.push(code);
      this.setState({ viewedContract });
    }
    this.getFileContract(id, code, fileContent => {
      if (fileContent) {
        this.setState({ fileContent });
      }
    });
  }

  downloadFile(filename, data) {
    var element = document.createElement("a");
    element.setAttribute("href", "data:application/pdf;base64," + data);
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages, pageNumber: 1 });
    setTimeout(() => {
      window.resize();
    }, 500);
  };

  changePage = offset =>
    this.setState(prevState => ({
      pageNumber: prevState.pageNumber + offset
    }));

  previousPage = () => this.changePage(-1);

  nextPage = () => this.changePage(1);

  render() {
    const {
      pageNumber,
      numPages,
      fileContent,
      contractData,
      error,
      agreeContracts,
      otpAvailable,
      secondsLeft,
      sentOTP,
      viewedContract,
      isProcessingSendOtpError,
      reportMessage,
      loadingContract,
      loadContractError,
      loadingBtn
    } = this.state;

    const { lang } = this.props;

    if (!contractData && !loadingContract)
      return (
        <div className="form-chuyen-tien">
          <h2 style={{ textAlign: "center" }}>{lang["contracts_not_found"]}</h2>
          {loadContractError && (
            <p style={{ textAlign: "center", color: "red" }}>
              {loadContractError}
            </p>
          )}
        </div>
      );

    if (!contractData && loadingContract)
      return (
        <div className="form-chuyen-tien">
          <h3 style={{ textAlign: "center", color: "#777" }}>Loading</h3>
        </div>
      );

    return (
      <div className="form-chuyen-tien" id="contract">

        <div className="flex-container">
          <div className="block-left">
            <h2 style={{ textAlign: "center", marginTop: 0 }} className='txt-upper'>{lang['titleContract']}</h2>
            <p>{lang['contractOpen']}</p>
            <div className="list">
              <div className="title">
                <h4>{lang["view_contracts"]}</h4>
              </div>
              {contractData.contracts.map((contract, i) => (
                <div key={contract.code} className="item">
                  <span
                    className="contract-name"
                    onClick={() =>
                      this.viewContract(
                        contractData.id,
                        contract.code,
                        contract.name
                      )
                    }
                  >
                    {`${i + 1}. ${contract.name}`}
                  </span>
                  <span style={{ float: "right", marginLeft: 15 }}>
                    {viewedContract.includes(contract.code) ? (
                      <i className="fa fa-check" style={{ color: "green" }} />
                    ) : null}
                    <a
                      onClick={() =>
                        this.viewContract(
                          contractData.id,
                          contract.code,
                          contract.name
                        )
                      }
                      title="View"
                      style={{ padding: "0 10px" }}
                    >
                      <i className="fa fa-eye orange" />
                    </a>
                    <a
                      onClick={() =>
                        this.downloadContract(
                          contractData.id,
                          contract.code,
                          contract.name
                        )
                      }
                      title="Download"
                    >
                      <i className="fa fa-download orange" />
                    </a>
                  </span>
                </div>
              ))}
            </div>

            <div className="form">
              <div className="form-group">
                <input
                  type="checkbox"
                  id="agree_contracts"
                  checked={agreeContracts}
                  onChange={this.toggleAgreeContracts}
                  style={{ height: 13, width: "auto" }}
                />
                <label
                  htmlFor="agree_contracts"
                  className="orange"
                // style={{ width: "90%" }}
                >
                  {lang["contractCheck"]}
                </label>

              </div>
              <div className="form-group" style={{ display: "block" }}>
                <p style={{ marginTop: 0, lineHeight: 1.5, width: '90%' }}>
                  {lang["enter_OTP1"]}
                  {otpAvailable && (
                    <a style={{ color: "orange" }} onClick={this.sendOTP}>
                      {lang["enter_OTP2"]}
                    </a>
                  )}
                  {!otpAvailable && (
                    <a style={{ color: "gray" }}>
                      {lang["enter_OTP2"]} ({secondsLeft})
                    </a>
                  )}{" "}
                  {lang["enter_OTP3"]}
                </p>
                {sentOTP ? lang["OTP_has_been_sent"] : null}
                <p style={{ marginBottom: 0 }}>
                  {lang["confirm"]} OTP{" "}
                  <input
                    ref="otp"
                    type="text"
                    style={{ marginLeft: 20, width: 120 }}
                  />
                </p>
              </div>
              {error ? (
                <div className="form-group">
                  <p style={{ color: "red", textAlign: "center", margin: 0 }}>
                    {error}
                  </p>
                </div>
              ) : null}
              <div
                className="form-group"
                style={{ marginTop: 10, display: "block", textAlign: "center" }}
              >
                <button
                  className="btn btn-success"
                  style={{ width: "120px" }}
                  onClick={!loadingBtn && (e => this.comfirmContract(e))}
                >
                  {loadingBtn ? (
                    <i className="fa fa-spinner fa-spin" />
                  ) : (
                      <span style={{ color: "#fff" }}>{lang["confirm"]}</span>
                    )}
                </button>
                <button
                  className="btn btn-gray"
                  style={{ marginRight: 0 }}
                  onClick={e => this.cancel(e)}
                >
                  {this.props.router.location.search.indexOf("source=email") > 0
                    ? lang["reject_contracts"]
                    : lang["cancel_contracts"]}
                </button>
              </div>

              {sentOTP && (
                <div
                  className="form-group"
                  style={{
                    marginTop: 10,
                    display: "block",
                    textAlign: "center"
                  }}
                >
                  <p style={{ marginTop: 0, lineHeight: 1.5, color: "orange" }}>
                    {reportMessage}
                    {isProcessingSendOtpError && !reportMessage && (
                      <i className="fa fa-spin fa-spinner" />
                    )}
                    {!isProcessingSendOtpError && !reportMessage && (
                      <a onClick={this.reportOtpSmsError}>
                        {lang["report_cannot_find_sms"]}
                      </a>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div style={{ paddingLeft: 30 }}>
            {fileContent ? (
              <div>
                <div>
                  <p style={{ marginTop: 0 }}>
                    {lang["page"]} {pageNumber || (numPages ? 1 : "--")} /{" "}
                    {numPages || "--"}
                    <span style={{ float: "right" }}>
                      <button
                        type="button"
                        className="btn btn-gray"
                        disabled={pageNumber <= 1}
                        onClick={this.previousPage}
                      >
                        {lang["previous"]}
                      </button>
                      <button
                        type="button"
                        className="btn btn-gray"
                        disabled={pageNumber >= numPages}
                        onClick={this.nextPage}
                        style={{ marginRight: 0 }}
                      >
                        {lang["next"]}
                      </button>
                    </span>
                  </p>
                </div>
                <Document
                  file={`data:application/pdf;base64,${fileContent}`}
                  onLoadSuccess={this.onDocumentLoadSuccess}
                >
                  <Page pageNumber={pageNumber} />
                </Document>
                <div>
                  <p style={{ marginBottom: 50 }}>
                    {lang["page"]} {pageNumber || (numPages ? 1 : "--")} /{" "}
                    {numPages || "--"}
                    <span style={{ float: "right" }}>
                      <button
                        type="button"
                        className="btn btn-gray"
                        disabled={pageNumber <= 1}
                        onClick={this.previousPage}
                      >
                        {lang["previous"]}
                      </button>
                      <button
                        type="button"
                        className="btn btn-gray"
                        disabled={pageNumber >= numPages}
                        onClick={this.nextPage}
                        style={{ marginRight: 0 }}
                      >
                        {lang["next"]}
                      </button>
                    </span>
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
