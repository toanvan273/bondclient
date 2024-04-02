import React, { useState } from "react";
import DbondPriceBoardCorp from "./dbond-corp";
import DbondFiPriceBoard from "./dbond-fi";
import { isBusinessCustomer } from "../../../helpers";
import ProInvestor from "../pro.investor";
import wa from "../../../resource/images/warm.svg";
function DbondTabControl(props) {
  const [tab, setTab] = useState(
    props.params && props.params.type
      ? props.params.type
      : localStorage.getItem("selectedBondType")
      ? localStorage.getItem("selectedBondType")
      : "dbond-corp"
  );

  const changeTab = (tab) => {
    localStorage.setItem("selectedBondType", tab);
    props.router.push(`/bang-gia/${tab}`);
    setTab(tab);
  };
  const { lang, accounts } = props;

  return (
    <div id="dbond-tab">
      <div className="navigation-tab-dbond">
        <ul className="have-sub-menu">
          <li
            onClick={() => changeTab("dbond-corp")}
            className={`tab ${
              (tab === "dbond-corp" || tab === "dbond") && "active"
            }`}
            key={"dbond-corp"}
          >
            <span>DBond Doanh nghiệp</span>
          </li>
          <li
            onClick={() => changeTab("dbond-fi")}
            className={`tab ${tab === "dbond-fi" && "active"}`}
            key={"dbond-fi"}
          >
            <span>DBond Định chế tài chính</span>
          </li>
        </ul>
      </div>
      {isBusinessCustomer(accounts) && (
        <div className="warning65">
          <img src={wa} />
          <span style={{ marginLeft: "5px" }}>
            {lang["businessCustomerNote"]}
          </span>
        </div>
      )}
      <ProInvestor {...props} />
      {(tab === "dbond-corp" || tab === "dbond") && (
        <DbondPriceBoardCorp {...props} />
      )}

      {tab === "dbond-fi" && <DbondFiPriceBoard {...props} />}
    </div>
  );
}

export default DbondTabControl;
