import React, { useEffect, useState } from "react";
import numeral from "numeral";
import moment from "moment";
import { getCoupon } from "../../clients/bond.api.client";
import { checkNamebond, check2AuthBeforeRedirect } from "../../helpers";

function DealRow(props) {
    const [coupon, setCoupon] = useState(null)

    useEffect(() => {
        if (props.order.bondCode) {
            _getCoupon(props.order.bondCode)
        }
    }, [props.order])
    
    const _getCoupon = (bondcode) => {
        getCoupon(bondcode).then(res => {
            if (res.data) {
                setCoupon(res.data)
            }
        })
    }

    const handleToConfirmPage = (order) => {
      check2AuthBeforeRedirect(
        `/xac-nhan/${order.accountNo}/${order.procInstId}`
      );
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

    const { order, lang, typeBond } = props;

    return (
      <tr>
        <td>{order.procInstNumber}</td>
        <td>{moment(order.tradeDate).format("DD/MM/Y")}</td>
        <td>{moment(order.settledDate).format("DD/MM/Y")}</td>
        <td className={order.side === "NB" ? "txt-lime" : "txt-red"}>
          {order.side === "NB" ? lang["Mua"] : lang["Bán"]}
        </td>
        <td>{order.accountNo}</td>
        <td>{checkNamebond(order.productType)}</td>
        <td>
          <span className={order.side === "NB" ? "txt-lime" : "txt-red"}>
            {genLabelBond(typeBond, coupon, order.bondCode)}
          </span>
        </td>
        <td className="right pr-20">{numeral(order.quantity).format(0, 0)}</td>
        <td className="right pr-20">{numeral(order.price).format(0, 0)}</td>
        <td>
          <button
            onClick={() => handleToConfirmPage(order)}
            className="btn btn-orange txt-upper"
          >
            {lang["confirm"]}
          </button>
        </td>
      </tr>
    );

}

export default DealRow;
