
import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { getCoupon } from "../../../clients/bond.api.client";

const DbondCodeCell = props => {
  const [coupon, setCoupon] = useState(null);
  const { deal, typeBond, data } = props;

  useEffect(() => {
    if (data && data.symbol) {
      _getCoupon(data.symbol);
    }
  }, [data]);

  const _getCoupon = (bondcode) => {
    getCoupon(bondcode).then((res) => {
      if (res.data) {
        setCoupon(res.data);
      }
    });
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

  return (
    <div>
      {deal ? (
        <Link
          to={`/trai-phieu/${deal.bond_code}/${deal.product_type}?from=danh-muc`}
          className="bondcode-detail"
        >
          {genLabelBond(typeBond, coupon, data?.symbol)}
        </Link>
      ) : (
        <span>{genLabelBond(typeBond, coupon, data?.symbol)}</span>
      )}
    </div>
  ); 
}

export default DbondCodeCell;