import React, { Component } from "react";
import numeral from "numeral";
import { addDeals } from "../../clients/bond.api.client";
import moment from "moment";
import { check2AuthBeforeRedirect, displayNoti } from "../../helpers";
import { parseErrorMessage } from "../../modules/error_parser/error.parser.v2";
export class ConfirmOrder extends Component {
  state = {
    error: null,
    loading: false
  };

  confirmInfo = async () => {
    const { data, accountSelected, authInfo } = this.props;
    let trading_payment = {
      account_name_recv: null,
      account_receive: null,
      bank_code: null,
      bank_name_recv: null,
      branch_code: null,
      branch_name: null,
      payment_method: "VND",
    };
    let bond_payment = {
      account_name_recv: null,
      account_receive: null,
      bank_code: null,
      bank_name_recv: null,
      branch_code: null,
      branch_name: null,
      payment_method: "VND",
    };
    let reqData = {
      accountNo: accountSelected.accountNumber,
      custodyCode: accountSelected.custodyID,
      customerId: authInfo.customerId,
      bondCode: data.bond_code,
      productType: data.product_type,
      quantity: data.quantity,
      valueDate: moment().format("YYYY-MM-DD"),
      price: data.leg1_price,
      tax: 0,
      side: "NB",
      fee: data.leg1_fee,
      requestId: `${moment().unix()}-${accountSelected.accountNumber}`,
      bondPayment: bond_payment,
      tradingPayment: trading_payment,
      promotion: null,
      leg2TradeDate: data.trans_value_date,
      bondCertificate: false,
      careBy: "",
      referral: "",
      tradeDate: moment().format("YYYY-MM-DD"),
    };

    this.setState({ loading: true });
    try {
      const res = await addDeals(reqData);
      this.setState({ loading: false });
      if (res.data) {
        localStorage.setItem(`contract-type`, "probond");
        localStorage.setItem(`orderinfo`, JSON.stringify(data));
        localStorage.setItem(
          `contracts-${res.data.id}`,
          JSON.stringify(res.data)
        );
        localStorage.setItem(
          `request-${res.data.requestId}`,
          JSON.stringify(reqData)
        );
        check2AuthBeforeRedirect(`/hop-dong/${res.data.id}`);
      }
    } catch (err) {
      this.setState({ loading: false });
      const data = err.response.data;
      if (data) {
        displayNoti(parseErrorMessage(data), "error");
      }
    }
  };

  render() {
    const { loading, error } = this.state;
    const { data, bonds, lang } = this.props;
    let bondInfo = bonds[data.bond_code];

    return (
      <div className="confirm-info-bond">
        <h2 className="title">{lang["registration_confirm"]}</h2>
        <div className="order-form">
          <div className="order-info">
            <table>
              <colgroup>
                <col width="40%" />
                <col width="30%" />
                <col width="30%" />
              </colgroup>
              <thead>
                <tr>
                  <th></th>
                  <th className="order-title">{lang["order_buy"]}</th>
                  <th className="order-title">{lang["order_sell"]}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{lang["Mã trái phiếu"]}</td>
                  <td>{data.bond_code}</td>
                  <td>{data.bond_code}</td>
                </tr>
                <tr>
                  <td>{lang["Số lượng"]}</td>
                  <td>{numeral(data.quantity).format("0,0")}</td>
                  <td>{numeral(data.quantity).format("0,0")}</td>
                </tr>
                <tr>
                  <td>{lang["Giá thực hiện"]}</td>
                  <td>{numeral(data.leg1_price).format("0,0")}</td>
                  <td>{numeral(data.leg2_price).format("0,0")}</td>
                </tr>
                <tr>
                  <td>{lang["Tổng giá trị"]}</td>
                  <td>{numeral(data.leg1_volume).format("0,0")}</td>
                  <td>{numeral(data.leg2_volume).format("0,0")}</td>
                </tr>
                <tr>
                  <td>{lang["TradeDate"]}</td>
                  <td>{moment().format("DD-MM-YYYY")}</td>
                  <td>{moment(data.trans_value_date).format("DD-MM-YYYY")}</td>
                </tr>
                <tr>
                  <td>{lang["settled_date"]}</td>
                  <td>{moment(data.settled_date).format("DD-MM-YYYY")}</td>
                  <td>
                    {moment(data.trans_settled_date).format("DD-MM-YYYY")}
                  </td>
                </tr>

                <tr>
                  <td>{lang["temporary_fee_probond"]}</td>
                  <td>{numeral(data.temporary_leg1_fee).format("0,0")}</td>
                  <td></td>
                </tr>
                <tr>
                  <td>{lang["fee_probond"]}</td>
                  <td>{numeral(data.leg1_fee).format("0,0")}</td>
                  <td>{numeral(data.leg2_fee).format("0,0")}</td>
                </tr>
                <tr>
                  <td>{lang["Tax"]}</td>
                  <td></td>
                  <td>{numeral(data.tax_value).format("0,0")}</td>
                </tr>
                <tr>
                  <td>{lang["day_return_fee"]}</td>
                  <td>{numeral(data.end_day_return_fee).format("0,0")}</td>
                  <td></td>
                </tr>
                <tr>
                  <td>{lang["required_amount"]}</td>
                  <td>{numeral(data.required_amount).format("0,0")}</td>
                  <td></td>
                </tr>
                <tr>
                  <td>{lang["received_amount"]}</td>
                  <td></td>
                  <td>{numeral(data.receive_amount).format("0,0")}</td>
                </tr>

                <tr>
                  <td className="bold-active">{lang["total_cost"]}</td>
                  <td colSpan="2" className="bold-active ">
                    {numeral(data.total_expenses).format("0,0")}
                  </td>
                </tr>
              </tbody>
            </table>
            {error && <div className="error">{error}</div>}
            <div className="group-btn">
              <button
                className="btn btn-gray"
                onClick={() => {
                  this.props.dismiss();
                }}
              >
                {lang["skip"]}
              </button>
              <button onClick={this.confirmInfo} className="btn btn-orange">
                {loading ? (
                  <i className="fa fa-spinner fa-spin" />
                ) : (
                  <span>{lang["confirm"]}</span>
                )}
              </button>
            </div>
          </div>
          <div className="bond-info">
            <h4 className="title">{lang["bond_information"]}</h4>
            <div className="detail">
              <div className="form-group">
                <label>{lang["Mã trái phiếu"]}:</label>
                <span>{bondInfo.bond_code}</span>
              </div>
              <div className="form-group">
                <label>{lang["Issuer"]}:</label>
                <span style={{ width: "200px" }}>{bondInfo.issuer}</span>
              </div>
              <div className="form-group">
                <label>{lang["IssueDate"]}:</label>
                <span>{bondInfo.issue_date}</span>
              </div>
              <div className="form-group">
                <label>{lang["MaturityDate"]}:</label>
                <span>{bondInfo.maturity_date}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
