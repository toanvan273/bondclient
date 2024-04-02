import React from "react";
import { connect } from "react-redux";
import * as types from '../../constants/action.types';
import ConfirmBuyBond from "./confirm.buybond";
import ContractBond from "./contract.bond";
import TransferLimitation from "./transfer.limitation";
import NotiDayTransaction from "./noti.day.transaction";
class PopupContainer extends React.Component {
  onClose = () => {
    this.props.dispatch({
      type: types.CLOSE_POPUP,
    });
  };

  render() {
    const { popup } = this.props;
    let mytype = popup.type || "confirm-buy-bond";
    return (
      <div id="popup-container" style={{ zIndex: 10 }}>
        {mytype === "confirm-buy-bond" && (
          <ConfirmBuyBond {...this.props} onClose={this.onClose} />
        )}
        {mytype === "contract-bond" && (
          <ContractBond {...this.props} onClose={this.onClose} />
        )}
        {mytype === "transfer-limitation" && (
          <TransferLimitation {...this.props} onClose={this.onClose} />
        )}
        {mytype === "notiday-transaction" && (
          <NotiDayTransaction {...this.props} onClose={this.onClose} />
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ popupStore }) => {
    return {
      popup: popupStore
    };
};
export default connect(mapStateToProps)(PopupContainer);
