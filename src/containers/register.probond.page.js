import React, { Component } from "react";
import { connect } from "react-redux";
import { Register } from "../components/probond/Register";
import { ConfirmOrder } from "../components/probond/ConfirmOrder";

class RegisterProBond extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      data: {}
    };
  }

  nextStep = ({ s, data, accountSelected }) => {
    this.setState({
      step: s,
      data,
      accountSelected
    });
  };

  dismiss = () => {
    this.props.router.push("/bang-gia");
  };

  render() {
    const { step } = this.state;
    const { accounts, lang, bonds, authInfo } = this.props;

    return (
      <div id="register-probond">
        {step === 1 && (
          <Register
            accounts={accounts}
            lang={lang}
            dismiss={this.dismiss}
            nextStep={this.nextStep}
          />
        )}
        {step === 2 && (
          <ConfirmOrder
            lang={lang}
            dismiss={this.dismiss}
            data={this.state.data}
            nextStep={this.nextStep}
            bonds={bonds}
            accountSelected={this.state.accountSelected}
            authInfo={authInfo}
            router={this.props.router}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ customerStore, bondStore }) => {
  // { bondStore, customerStore }
  return {
    accounts: customerStore.accounts,
    bonds: bondStore.bonds
  };
};
export default connect(mapStateToProps)(RegisterProBond);
