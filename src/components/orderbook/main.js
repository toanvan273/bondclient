import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { connect } from 'react-redux';
import OrderBookFilter from './filter';
import 'react-datepicker/dist/react-datepicker.css';
import CheckBox from '../../common/check.box';
import fil from '../../resource/images/filter.svg'
import { checkTypebond, genLabelTypeBond, genNTypeBond } from "../../helpers";
import { emitter } from "../../clients/emitter";
import { Event } from "../../constants/config";
import { format, subDays } from "date-fns";
import OrderbookContentTable from "./table";

const today = format(new Date(), "yyyy-MM-dd");
const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
const initFilter = {
  dateOption: new Set(),
  side: new Set(),
  product: new Set(),
  status: new Set(),
  symbol: "",
};

function OrderbookMain(props) {
  const [fromDate, setFromDate] = useState(props.fromDate);
  const [toDate, setToDate] = useState(props.toDate);
  const [showFilter, setShowFilter] = useState(false);
  const [isShowBondcode, setShowBondCode] = useState(true);
  const [filter, setFilter] = useState({ ...initFilter });
  const [deals, setDeals] = useState(props.deals);
  const [transactionList, setTransactionList] = useState(props.transactionList);
  const [typeBond, setTypeBond] = useState(1);

  useEffect(() => {
    props.loadByDate(props.fromDate, props.toDate);
    listenTheEmitter();
  }, []);

  useEffect(() => {
    if (props.deals && props.transactionList) {
      setDeals(props.deals);
      setTransactionList(props.transactionList);
    }
  }, [props.deals, props.transactionList]);

  const listenTheEmitter = () => {
    emitter.on(Event.RELOAD_ORDER_BOOK, () => {
      closeFilterBox();
    });
  };

  const doFilter = (filter) => {
    var dealsFiltered = Object.assign([], props.deals);
    var transactionListFiltered = Object.assign([], props.transactionList);
    if (filter.side.size > 0) {
      doFilterSide(dealsFiltered, filter);
      doFilterSide(transactionListFiltered, filter);
    }
    if (filter.product.size > 0) {
      doFilterProductDeal(dealsFiltered, filter);
      doFilterProductTransaction(transactionListFiltered, filter);
    }
    if (filter.dateOption.size > 0) {
      doFilterDate(dealsFiltered, filter);
      doFilterDate(transactionListFiltered, filter);
    }
    if (filter.symbol) {
      doFilterSymbol(dealsFiltered, filter);
      doFilterTransactionsSymbol(transactionListFiltered, filter);
    }
    if (filter.status.size > 0) {
      doFilterStatus(dealsFiltered, filter);
      doFilterStatus(transactionListFiltered, filter);
    }
    setFilter(filter);
    setDeals(dealsFiltered);
    setTransactionList(transactionListFiltered);
  };
  const doFilterDate = (deals, filter) => {
    for (var i = deals.length - 1; i >= 0; i--) {
      if (!filter.dateOption.has(deals[i].trade_date)) {
        deals.splice(i, 1);
      }
    }
  };
  const doFilterSide = (deals, filter) => {
    for (var i = deals.length - 1; i >= 0; i--) {
      if (!filter.side.has(deals[i].side)) {
        deals.splice(i, 1);
      }
    }
  };
  //sort Product
  const doFilterProductDeal = (deals, filter) => {
    for (var i = deals.length - 1; i >= 0; i--) {
      if (!filter.product.has(checkTypebond(deals[i]))) {
        deals.splice(i, 1);
      }
    }
  };
  const doFilterProductTransaction = (deals, filter) => {
    for (var i = deals.length - 1; i >= 0; i--) {
      if (!filter.product.has(checkTypebond(deals[i].deal))) {
        deals.splice(i, 1);
      }
    }
  };
  const doFilterSymbol = (deals, filter) => {
    for (var i = deals.length - 1; i >= 0; i--) {
      if (deals[i].bond_code.indexOf(filter.symbol.toUpperCase()) < 0) {
        deals.splice(i, 1);
      }
    }
  };

  const doFilterTransactionsSymbol = (deals, filter) => {
    for (var i = deals.length - 1; i >= 0; i--) {
      if (deals[i].deal.bond_code.indexOf(filter.symbol.toUpperCase()) < 0) {
        deals.splice(i, 1);
      }
    }
  };

  const doFilterStatus = (deals, filter) => {
    for (var i = deals.length - 1; i >= 0; i--) {
      if (!filter.status.has(deals[i].status.toLowerCase())) {
        deals.splice(i, 1);
      }
    }
  };

  const closeFilterBox = () => {
    resetFilter();
    setShowBondCode(false);
  };

  const showFilterBox = () => {
    resetFilter();
    setShowFilter(!showFilter);
  };

  const handleChangeFromDate = (fDate) => {
    if (fDate) {
      setFromDate(fDate);
      props.loadByDate(fDate, toDate);
    }
  };

  const handleChangeToDate = (tDate) => {
    if (tDate) {
      setToDate(tDate);
      props.loadByDate(fromDate, tDate);
    }
  };

  const handleFilterDate = (date) => {
    if (filter.dateOption.has(date)) {
      filter.dateOption.delete(date);
    } else {
      filter.dateOption.add(date);
    }
    setFilter(filter);
    doFilter(filter);
  };

  const resetFilter = () => {
    setFilter(initFilter);
  };

  const { lang, activeAccount } = props;
  return (
    <div id="order-table">
      <div className="assets-tab page-tab">
        <ul>
          <li className="active">
            <a>{props.lang["orderbook"]}</a>
          </li>
        </ul>
      </div>

      <div className="advance-filter">
        <div className="option-date">
          <CheckBox
            value={yesterday}
            getValue={(e) => handleFilterDate(e)}
            checked={filter.dateOption.has(yesterday)}
            label={lang["yesterday"]}
          />
          <span style={{ marginLeft: 20 }}>
            <CheckBox
              value={today}
              checked={filter.dateOption.has(today)}
              getValue={(e) => handleFilterDate(e)}
              label={lang["today"]}
            />
          </span>
        </div>
        <div className="date-picker" style={{ display: "inline-block" }}>
          <DatePicker
            dateFormat="dd/MM/yyyy"
            isClearable={false}
            disabled={false}
            className="textbox"
            selected={new Date(fromDate)}
            placeholderText={lang["fromDate"]}
            onChange={handleChangeFromDate}
          />
        </div>
        <div className="date-picker" style={{ display: "inline-block" }}>
          <DatePicker
            dateFormat="dd/MM/yyyy"
            isClearable={false}
            disabled={false}
            className="textbox"
            selected={toDate}
            placeholderText={lang["toDate"]}
            onChange={handleChangeToDate}
          />
        </div>

        <div className="div-search" onClick={showFilterBox}>
          <img src={fil} />
          <span>{lang["advancedFilter"]}</span>
          {showFilter ? (
            <i className="fa fa-angle-up" />
          ) : (
            <i className="fa fa-angle-down" />
          )}
        </div>
      </div>

      {showFilter && (
        <OrderBookFilter
          doFilter={doFilter}
          close={closeFilterBox}
          filter={filter}
          lang={lang}
        />
      )}

      <table style={{ width: "100%" }}>
        <colgroup>
          <col width="10%" />
          <col width="10%" />
          <col width="5%" />
          <col width="8%" />
          <col width="7%" />
          <col width="20%" />
          <col width="10%" />
          <col width="10%" />
          <col width="15%" />
          <col width="5%" />
        </colgroup>
        <thead>
          <tr key={"th"}>
            <th>{lang["TradeDate"]}</th>
            <th>{lang["settlementDate"]}</th>
            <th>{lang["Loại lệnh"]}</th>
            <th>{lang["CustomerAccountNo"]}</th>
            <th>{lang["bondType"]}</th>
            <th>
              <i
                className="fa fa-caret-left pointer"
                style={{ marginRight: "4px" }}
                onClick={() => {
                  setTypeBond(genNTypeBond(typeBond - 1));
                }}
              />
              <div style={{ display: "inline-block", minWidth: 84 }}>
                {genLabelTypeBond(typeBond, lang)}
              </div>
              <i
                className="fa fa-caret-right pointer"
                style={{ marginLeft: "4px" }}
                onClick={() => {
                  setTypeBond(genNTypeBond(typeBond + 1));
                }}
              />
            </th>
            <th>{lang["Quantity"]}</th>
            <th>
              <span>
                {lang["Giá thực hiện"]} ({lang["currency"]})
              </span>
            </th>
            <th>{lang["Trạng thái lệnh"]}</th>
            <th>{lang["Thao tác"]}</th>
          </tr>
        </thead>
        <OrderbookContentTable
          activeAccount={activeAccount}
          lang={lang}
          deals={deals}
          transactionList={transactionList}
          typeBond={typeBond}
        />
      </table>
    </div>
  );
}

const mapStateToProps = ({ bondStore }) => {
	return {
		deals: bondStore.deals,
		transactionList: bondStore.transactionList,
	};
};

export default connect(mapStateToProps)(OrderbookMain)