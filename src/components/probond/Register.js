import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import numeral from "numeral";
import AccountsSuggestion from "../../common/accounts.suggestion";
import { getInfoProBond } from "../../clients/bond.api.client";
import moment from "moment";
import { displayNoti } from "../../helpers";

export class Register extends Component {
  state = {
    amount: 2e9,
    accountSelected: "",
    listAccounts: [],
    error: null,
    loading: false
  };

  componentDidMount() {
    const { accounts } = this.props;
    if (accounts) {
      this.filterAccounts(this.props.accounts);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { accounts } = nextProps;
    if (accounts) {
      this.filterAccounts(accounts);
    }
  }

  filterAccounts(accounts) {
    if (accounts.length > 0) {
      let listAccounts = [];
      listAccounts = accounts.filter(
        acc => acc.type === "Owner" || acc.type === "Member"
      );
      if (listAccounts.length > 0) {
        this.setState({
          accountSelected: accounts[0],
          listAccounts: listAccounts
        });
      }
    }
  }

  delComma = str => {
    let k = str.split(",");
    return k.join("");
  };

  changeAmount = e => {
    const reg = new RegExp("^[0-9]+$");
    let str = this.delComma(e.target.value);

    if (str.length > 0 && !reg.test(str)) {
      str = str.split(/ /)[0].replace(/[^\d]/g, "");
    }

    if (parseInt(str) > 2e9) {
      str = 2e9;
    }

    this.setState({
      amount: parseInt(str),
      error: null
    });
  };

  submitForm = async e => {
    e.preventDefault();
    const { amount, accountSelected } = this.state;
    const { lang } = this.props;
    if (!accountSelected) {
      displayNoti(lang["miss_acc_number"], "error");
      return;
    }
    if (!amount) {
      displayNoti(lang["miss_value"], "error");
      return;
    }
    let date = moment().format("YYYY-MM-DD");
    this.setState({ loading: true });
    try {
      const res = await getInfoProBond(
        amount,
        date,
        accountSelected.accountNumber
      );
      this.setState({ loading: false });
      if (res.data) {
        localStorage.setItem(`probond-register-amount`, amount);
        this.props.nextStep({ s: 2, data: res.data, accountSelected });
      }
    } catch (err) {
      this.setState({ loading: false });
      const data = err.response.data;
      if (data) {
        this.setState({ error: data.description });
      }
    }
  };

  changeAccountNo = acc => {
    this.setState({
      accountSelected: acc
    });
  };

  render() {
    const { amount, accountSelected, listAccounts, error, loading } = this.state;
    const {  lang } = this.props;
   
    return (
      <div>
        <h3 className="title">{lang["register_probond"]}</h3>
        <div className="content-block">
          <h4 style={{ textTransform: "uppercase" }}>
            {lang["probondLabel_product_info"]}
          </h4>
          <ul>
            <li>{lang["probondLabel_product_info1"]}</li>
            <li>{lang["probondLabel_product_info2"]}</li>
            <li>{lang["probondLabel_product_info3"]}</li>
            <li>{lang["probondLabel_product_info4"]}</li>
            <li>{lang["probondLabel_product_info5"]}</li>
          </ul>
        </div>
        <form onSubmit={this.submitForm}>
          <div className="form-group">
            <label>{lang["CustomerAccountNo"]}</label>
            <div className="account-box accounts-suggestion">
              <AccountsSuggestion
                accounts={listAccounts}
                lang={lang}
                activeAccount={accountSelected}
                handleSelect={acc => {
                  this.changeAccountNo(acc);
                }}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="process">
              <span>{lang["value_probond"]}</span>
              <i
                data-tip
                data-for="probond-regis-trans"
                data-class="bottom-tooltip"
                className="fa fa-info-circle"
              ></i>
            </label>
            <input
              value={numeral(amount).format("0,0")}
              type="text"
              onChange={this.changeAmount}
              style={{ width: "267px", paddingLeft: "10px" }}
            />
          </div>
          {error && <div className="error">{error}</div>}
          <div className="group-btn">
            <button
              onClick={() => {
                this.props.dismiss();
              }}
              type="button"
              className="btn btn-gray"
            >
              {lang["skip"]}
            </button>
            <button type="submit" className="btn btn-primary">
              {loading ? (
                <i className="fa fa-spinner fa-spin" />
              ) : (
                <span>{lang["register_btn"]}</span>
              )}
            </button>
          </div>
        </form>
        <ReactTooltip id="probond-regis-trans" effect="solid" place="bottom">
          <div style={{ fontSize: "13px", padding: "5px" }}>
            <i>{lang["probondLabel_registrationWarning"]}</i>
          </div>
        </ReactTooltip>
      </div>
    );
  }
}
