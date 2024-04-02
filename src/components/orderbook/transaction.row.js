import React, { useEffect, useState } from "react";
import numeral from "numeral";
import moment from "moment";
import ReactTooltip from "react-tooltip";
import OrderStatus from "./orderStatus";
import {
  updateTransaction,
  cancelTransactionDealDsb,
  cancelBuyProBond,
  cancelSellProBond,
  getCoupon
} from "../../clients/bond.api.client";
import { displayNoti } from "../../helpers";
import { parseErrorMessage } from "../../modules/error_parser/error.parser.v2";
import { emitter } from "../../clients/emitter";
import { Event } from "../../constants/config";
import * as AuthService from "../../services/auth.service";

function TransactionRow(props) {
  const [editMode, setEditMode] = useState(false);
  const [coupon, setCoupon] = useState(null)

  useEffect(() => {
    const { order } = props
    if (order.deal.bond_code) {
      _getCoupon(order.deal.bond_code)
    }
  }, [])
  
  const _getCoupon = (bondcode) => {
    getCoupon(bondcode).then(res => {
      if (res.data) {
        setCoupon(res.data)
      }
    })
  }

  const handleCancel = (order) => {
    if (AuthService.isStep2Authenticated()) {
      const confirm = window.confirm(props.lang["wantToCancel"]);
      if (confirm) {
        let cancel;
        if (order.deal.product_type === "PROBOND") {
          if (order.side === "NB") {
            cancel = cancelBuyProBond;
          } else {
            cancel = cancelSellProBond;
          }
        } else {
          cancel = cancelTransactionDealDsb;
        }

        cancel(order)
          .then(res => {
            if (res.status === 204 || res.status === 200) {
              displayNoti(props.lang["removeSuccess"], "success");
              emitter.emit(Event.RELOAD_TRANSACTIONS);
            }
          })
          .catch(e => {
            displayNoti(parseErrorMessage(e.response.data), "error");
          });
      }
    } else {
      window.parent.postMessage(["required2Authenticated"], "*");
    }
  }

  const toggleMode = () => {
    setEditMode(!editMode)
  }

  const updateQuantity = () => {
    const { order } = props;
    let quantity = 0;
    if (!quantity) {
      toggleMode();
      return;
    } else {
      order.quantity = quantity;
      updateTransaction(order)
        .then(() => {})
        .finally(() => {
          toggleMode();
        });
    }
  };

  const genLabelBond = (typeBond, coupon, bond_code) => {
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

  const { order, lang, typeBond, activeAccount } = props;

  return (
    <tr>
      <td>{moment(order.trade_date).format("DD/MM/Y")}</td>
      <td>{moment(order.settled_date).format("DD/MM/Y")}</td>
      <td className={order.side === "NB" ? "txt-lime" : "txt-red"}>
        {order.side === "NB" ? lang["Mua"] : lang["Bán"]}
      </td>
      <td>{order.deal.customer_account_no}</td>

      <td>{order.deal.product_type === "OUTRIGHT" ? "VBond" : "DBond"}</td>
      <td>{genLabelBond(typeBond, coupon, order.deal.bond_code)}</td>
      <td className="right">
        {editMode ? (
          <div>
            <input
              type="number"
              defaultValue={order.quantity}
              ref="txtQuantity"
            />
            <button
              className="btn btn-success"
              style={{ height: 20, lineHeight: "20px" }}
              onClick={updateQuantity}
            >
              <i className="fa fa-check"></i>
            </button>
            <button
              className="btn btn-error"
              style={{ height: 20, lineHeight: "20px", margin: 0 }}
              onClick={toggleMode}
            >
              <i className="fa fa-remove"></i>
            </button>
          </div>
        ) : (
          numeral(order.quantity).format(0, 0)
        )}
      </td>
      <td className="right pr-20">{numeral(order.price).format(0, 0)}</td>
      <td className="left status pl-20">
        {order.status === "REJECTED" && order.reason ? (
          <div>
            <span
              data-tip
              data-for={`tt-${order.transaction_id}`}
              data-class="bottom-tooltip"
            >
              {OrderStatus[order.status] ? (
                <i className={"fa " + OrderStatus[order.status].icon} />
              ) : null}
              {lang[order.status] || order.status}
            </span>
            <ReactTooltip
              id={`tt-${order.transaction_id}`}
              effect="solid"
              place="bottom"
            >
              <p>{order.reason}</p>
            </ReactTooltip>
          </div>
        ) : (
          <span>
            <i className={"fa " + OrderStatus[order.status].icon} />
            {lang[order.status] || order.status}
          </span>
        )}
      </td>
      <td>
        {["Owner", "Member"].includes(activeAccount.type) &&
        order.status === "PENDING" ? (
          <i
            className="fa fa-times orderbook-action-btn"
            onClick={() => handleCancel(order)}
          ></i>
        ) : null}
      </td>
    </tr>
  );
}

export default TransactionRow