import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { getPorfolioDbond } from '../../../clients/bond.api.client';
import FilterDbond from './filter';
import TableDbondDetail from './table';
import CustodyTableDbond from "./custody.table";

function DBondTable(props) {
  const [filterDeals, setFilterDeals] = useState(null);
  const [filter, setFilter] = useState({
    trade_date: "",
    maturity_date: "",
    status_file: false,
    received_coupon: false,
  });
  const [initDeals, setInitDeals] = useState([]);
  const [custodyDeals, setCustodyDeals] = useState([]);
  useEffect(() => {
    if (props.activeAccount) {
      const { accountNumber } = props.activeAccount;
      loadPorfolio(accountNumber);
    }
  }, [props.activeAccount, props.load]);

  const handleSetFilter = (f) => {
    setFilter(f);
    doFilter(f);
  };

  const doFilter = (filter) => {
    var deals = Object.assign([], initDeals);
    if (filter.maturity_date) {
      let m_date = moment(filter.maturity_date).format("DD/MM/YYYY");
      for (var i = deals.length - 1; i >= 0; i--) {
        if (deals[i].maturityDate !== m_date) {
          deals.splice(i, 1);
        }
      }
    }
    if (filter.trade_date) {
      let t_date = moment(filter.trade_date).format("DD/MM/YYYY");
      for (var i = deals.length - 1; i >= 0; i--) {
        if (deals[i].tradingDate !== t_date) {
          deals.splice(i, 1);
        }
      }
    }
    if (filter.status_file) {
      for (var i = deals.length - 1; i >= 0; i--) {
        if (deals[i].status !== "SETTLED") {
          deals.splice(i, 1);
        }
      }
    }
    if (filter.received_coupon) {
      for (var i = deals.length - 1; i >= 0; i--) {
        if (deals[i].couponValue == 0) {
          deals.splice(i, 1);
        }
      }
    }
    setFilterDeals(deals);
  };

  const loadPorfolio = (account, p) => {
    const page = p ? p : 1;
    getPorfolioDbond(account, page).then((res) => {
      if (res.data) {
        const { pageItems } = res.data;
        const dbondDeals = pageItems.filter((e) => e.vsdFlag === "1");
        const custodyDeals = pageItems.filter((e) => e.vsdFlag === "0");
        setInitDeals(dbondDeals);
        setFilterDeals(dbondDeals);
        setCustodyDeals(custodyDeals);
      }
    });
  };

  const { lang } = props;
  return (
    <div className="dbond-table category-block">
      <b>{lang["poLabelDbond"]}</b>
      <FilterDbond
        filter={filter}
        setFilter={handleSetFilter}
        deals={initDeals}
        lang={lang}
      />
      <TableDbondDetail filterDeals={filterDeals} {...props} />
      {custodyDeals.length > 0 && (
        <CustodyTableDbond custodyDeals={custodyDeals} {...props} />
      )}
    </div>
  );
}

export default DBondTable