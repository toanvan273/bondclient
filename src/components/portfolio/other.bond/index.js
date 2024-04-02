import React, { useEffect, useState } from 'react';
import { getPorfolioOtherbond } from '../../../clients/bond.api.client';
import TableOther from './table';

function OtherBond(props) {
  const [portfolios, setPortfolios] = useState(null)

  useEffect(() => {
    if (props.activeAccount) {
      const { accountNumber } = props.activeAccount;
      loadPorfolio(accountNumber);
    }
  }, [props.activeAccount, props.load]);

  const loadPorfolio = (account, p) => {
    const page = p ? p : 1;
    getPorfolioOtherbond(account, page).then(res => {
      if (res.data) {
        const { pageItems } = res.data;
        const arr = page === 1 ? pageItems : portfolios.concat(pageItems);
        const newArr = arr.map((e,i) => ({...e,key: `${i}`}))
        setPortfolios(newArr)
      }
    }).catch(err => { console.log({err}) })
  }

  const { lang } = props
  return (
    <div className="vbond-table category-block">
      <b>{lang.otherBond}</b>
      <TableOther {...props} data={portfolios}/>
    </div>
  );
}

export default OtherBond