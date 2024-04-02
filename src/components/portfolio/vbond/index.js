import React, { useEffect, useState } from 'react';
import { getPorfolioVbond } from '../../../clients/bond.api.client';
import FilterVbond from './filter';
import TableVbond from "./table";
import CustodyTableVbond from "./custody.table";

function VBondTable(props) {
  const [portfolios, setPortfolios] = useState(null);
  const [filter, setFilter] = useState({
    bond_code: "",
    status_file: false,
  });
  const [initPortfolios, setInitPortfolios] = useState([]);
  const [custodyPortfolios, setCustodyPortfolios] = useState([]);

  useEffect(() => {
    if (props.activeAccount) {
      const { accountNumber } = props.activeAccount;
      loadPorfolio(accountNumber);
    }
  }, [props.activeAccount, props.load]);

  const handleFilter = (f) => {
    setFilter(f);
    doFilter(f);
  };

  const doFilter = (filter) => {
    var portfolised = Object.assign([], initPortfolios);
    if (filter.status_file) {
      for (var i = portfolised.length - 1; i >= 0; i--) {
        if (portfolised[i].quantity === portfolised[i].sellableQuantity) {
          portfolised.splice(i, 1);
        }
      }
    }
    if (filter.bond_code) {
      for (var i = portfolised.length - 1; i >= 0; i--) {
        if (portfolised[i].symbol.indexOf(filter.bond_code.toUpperCase()) < 0) {
          portfolised.splice(i, 1);
        }
      }
    }
    setPortfolios(portfolised);
  };

  const loadPorfolio = (account, p) => {
    const page = p ? p : 1;
    getPorfolioVbond(account, page).then((res) => {
      if (res.data) {
        const { pageItems } = res.data;
        const arr = page === 1 ? pageItems : portfolios.concat(pageItems);
        const newArr = arr.map((e, i) => ({ ...e, key: `${i}` }));
        const portfolios = newArr.filter((e) => e.vsdFlag === "1");
        setInitPortfolios(portfolios);
        setPortfolios(portfolios);
        setCustodyPortfolios(newArr.filter((e) => e.vsdFlag === "0"));
      }
    });
  };

  const { lang } = props;
  return (
    <div className="vbond-table category-block">
      <b>{lang["poLabelVbond"]}</b>
      <FilterVbond
        lang={lang}
        filter={filter}
        setFilter={handleFilter}
        portfolios={initPortfolios}
      />
      <TableVbond lang={lang} data={portfolios} {...props} />
      {custodyPortfolios && custodyPortfolios.length > 0 && (
        <CustodyTableVbond {...props} data={custodyPortfolios} />
      )}
    </div>
  );
}

export default VBondTable