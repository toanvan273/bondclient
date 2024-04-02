import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import AccountBox from "../common/account.box";
import VBondTable from "./portfolio/vbond";
import OtherBond from "./portfolio/other.bond/index";
import DBondTable from "./portfolio/dbond";
import {
  loadPortfolio,
  loadOrderBook,
  loadTransactionList,
} from "../actions/bond.actions";

function Portfolio(props) {
  const [load, setReload] = useState(0);
  useEffect(() => {
    if (props.activeAccount) {
      getOrderBook(props.activeAccount);
      getPortfolio(props.activeAccount);
      loadTransactions(props.activeAccount);
    }
  }, [props.activeAccount]);

  const getOrderBook = (account) => {
    props.dispatch(
      loadOrderBook({
        accountNumber: account.accountNumber,
      })
    );
  };

  const getPortfolio = (account) => {
    props.dispatch(
      loadPortfolio({
        accountNumber: account.accountNumber,
      })
    );
  };

  const loadTransactions = (account) => {
    props.dispatch(
      loadTransactionList({
        accountNumber: account.accountNumber,
      })
    );
  };

  function reload() {
    if (props.activeAccount) {
      setReload(load + 1);
      // getOrderBook(props.activeAccount);
      // getPortfolio(props.activeAccount);
      // loadTransactions(props.activeAccount);
    }
  }

  let { accounts, activeAccount, setActiveAccount, portfolio, deals } = props;
  activeAccount = accounts
    ? accounts.find((acc) => acc.accountNumber === activeAccount?.accountNumber)
    : null;

  return (
    <div id="portfolio">
      <AccountBox
        {...props}
        accounts={accounts}
        activeAccount={activeAccount}
        setActiveAccount={setActiveAccount}
        reload={() => {
          reload();
        }}
      />
      <DBondTable
        {...props}
        deals={
          deals &&
          deals.filter(
            (p) =>
              p.product_type !== "OUTRIGHT" &&
              p.side === "NB" &&
              ["COMPLETED_LEG1", "SETTLED"].includes(p.status)
          )
        }
        activeAccount={activeAccount}
        load={load}
      />
      <VBondTable
        {...props}
        portfolios={
          portfolio && portfolio.filter((p) => p.productType === "OUTRIGHT")
        }
        activeAccount={activeAccount}
        load={load}
      />
      <OtherBond {...props} load={load} />
    </div>
  );
}

const mapStateToProps = ({ bondStore, popupStore, customerStore }) => {
  return {
    portfolio: bondStore.portfolio,
    bonds: bondStore.bonds,
    deals: bondStore.deals,
    transactionList: bondStore.transactionList,
    popup: popupStore,
    scheduleRestrictedList: bondStore.scheduleRestrictedList,
    ownerAccount: customerStore.ownerAccount,
  };
};

export default connect(mapStateToProps)(Portfolio);
