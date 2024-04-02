import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { trackVNDA } from "../modules/tracker";
import { BondClientVersion } from "../constants/config";
import VBondPriceBoard from "../components/priceboard/vbond";
import PopupContainer from "../components/popup/index";
import { getPromotions } from "../clients/bond.api.client";
import DbondTabControl from "../components/priceboard/dbond";

function PriceBoardPage(props) {
  const [typeBond, setTypeBond] = useState(1);
  const [tab, setTab] = useState(
    props.params && props.params.type
      ? props.params.type
      : localStorage.getItem("selectedBondType")
      ? localStorage.getItem("selectedBondType")
      : "dbond-corp"
  );

  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    trackVNDA("Bond", "View Bond Priceboard", null);
    getPromotionsInfo();
  }, []);

  const getPromotionsInfo = () => {
    getPromotions()
      .then((res) => {
        let sortedData = res.data.content.sort((d1, d2) => {
          if (d1.nav_promotion > d2.nav_promotion) return 1;
          if (d1.nav_promotion < d2.nav_promotion) return -1;
          return 0;
        });
        setPromotions(sortedData);
      })
      .catch(() => {
        setPromotions([]);
      });
  };

  const changeTab = (tab) => {
    localStorage.setItem("selectedBondType", tab);
    props.router.push(`/bang-gia/${tab}`);
    setTab(tab);
  };

  const { lang, popup } = props;
  return (
    <div id="priceboard">
      <div className="navigation-tab">
        <ul className="have-sub-menu">
          <li
            className={`tab ${
              (tab === "dbond-corp" || tab.includes("dbond")) && "active"
            }`}
            key={"dbond"}
          >
            <a onClick={() => changeTab("dbond")}>
              <span>DBond</span>
            </a>
          </li>
          <li className={`tab ${tab === "vbond" && "active"}`} key={"vbond"}>
            <a onClick={() => changeTab("vbond")}>
              <span>VBond</span>
            </a>
          </li>
        </ul>
      </div>

      {(tab === "dbond" || tab.includes("dbond")) && (
        <DbondTabControl
          {...props}
          typeBond={typeBond}
          setTypeBond={setTypeBond}
          promotions={promotions}
        />
      )}
      {tab === "vbond" && (
        <VBondPriceBoard
          {...props}
          typeBond={typeBond}
          setTypeBond={setTypeBond}
        />
      )}
      {popup.status && <PopupContainer {...props} {...popup} />}
      <div id="footer">{lang["version"] + BondClientVersion}</div>
    </div>
  );
}

const mapStateToProps = ({ bondStore, customerStore, popupStore }) => {
  return {
    bonds: bondStore.bonds,
    products: bondStore.products,
    rates: bondStore.rates,
    accounts: customerStore.accounts,
    scheduleRestrictedList: bondStore.scheduleRestrictedList,
    popup: popupStore,
    ownerAccount: customerStore.ownerAccount,
  };
};

export default connect(mapStateToProps)(PriceBoardPage);