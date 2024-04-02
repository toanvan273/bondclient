import React from 'react';
const TableOther = props => {
  const { lang, data } = props;
  const createBondtype = (lang,type) => (lang[type])

  return (
    <div style={{marginBottom: 20}}>
      <div className="csroll-table" style={{ overflowY: 'hidden', overflowX: 'auto' }}>
        <table className="portfolio-data" style={{ minWidth: '1410px' }}>
          <thead>
            <tr>
              <th>{lang['bondCode']}</th>
              <th>{lang['productBondType']}</th>
              <th>{lang['quantityBondAvailable']}</th>
              <th>{lang['costPrice']}</th>
              <th>{lang['costValue']}</th>
              <th>{lang['priceMarket']}</th>
              <th>{lang['valueMarket']}</th>
              <th>{lang['quantityBondWait']}</th>
              <th>{lang['quantityBondWaitMatch']}</th>
              <th>{lang['quantityBondLockdown']}</th>
            </tr>
          </thead>
          <tbody>
            {!data ?
              <tr>
                <td colSpan="10">
                  <div className="tc" style={{width: '100vw'}}>
                    <i className="fa fa-refresh fa-spin" />
                  </div>
                </td>
              </tr> :
              data.length > 0 ?
              data.map((item, i) => (
              <tr key={i}>
                <td>{item.symbol}</td>  
                <td>{createBondtype(lang,item.bondType)}</td>  
                <td className='tr pr-10'>{item.tradeQuantity}</td>  
                <td className='tr pr-10'>{item.costPrice}</td>  
                <td className='tr pr-10'>{item.costValue}</td>  
                <td className='tr pr-10'>{item.marketPrice}</td>  
                <td className='tr pr-10'>{item.marketValue}</td>  
                <td className='tr pr-10'>{item.receivingQuantity}</td>  
                <td className='tr pr-10'>{item.unfillSellQuantity}</td>  
                <td className='tr pr-10'>{item.blockedQuantity}</td>  
              </tr>
              )) :
              <tr>
                <td colSpan="10" className='tc'>
                  {lang.dataNotFound}
                </td>
              </tr>
              }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableOther;