import { useState } from "react";
import FiHeader from "./header.table";
import { getDays, getTermFromUnit } from "../../../../helpers";
import FiItem from "./item";
import numeral from "numeral";

function FiTable(props) {
  const [hideTerms, setHideTerms] = useState([]);
  const [showAllTerms, setShowAllTerms] = useState([]);
  const {
    bonds,
    lang,
    typeBond,
    setTypeBond,
    fiProducts,
    filters,
    tableRates,
    filterTerms,
  } = props;

  const showHideByTerms = (term) => {
    let terms = hideTerms;
    if (hideTerms.includes(term)) {
      terms = hideTerms.filter((iss) => iss != term);
    } else {
      terms.push(term);
    }
    setHideTerms([...terms]);
  };

  const toggleShowAll = (term) => {
    let terms = showAllTerms;
    if (showAllTerms.includes(term)) {
      terms = showAllTerms.filter((iss) => iss != term);
    } else {
      terms.push(term);
    }
    setShowAllTerms([...terms]);
  };

  const groupByTerms = (products, rates, filterTerms) => {
    let results = filterTerms.reduce((pre, cur) => ({ ...pre, [cur]: [] }), {});
    const findProduct = (p, rates) => {
      let arr = {};
      if (p.terms) {
        rates.forEach((rate) => {
          p.terms.forEach((item) => {
            if (rate.termRateId == item.termRateId) {
              let key =
                rate.term +
                "_" +
                rate.term_unit +
                "_" +
                rate.termRateId +
                "_" +
                numeral(rate.rate).format("0,0.0");
              arr[key] = p;
            }
          });
        });
      }
      return arr;
    };
    products.forEach((product) => {
      const ps = findProduct(product, rates);
      if (Object.keys(ps).length > 0) {
        for (const [key, value] of Object.entries(ps)) {
          let currData = results[key];
          if (currData) {
            currData.push(value);
          }
        }
      }
    });
    return results;
  };

  const hasFilter = (filters) => {
    return (
      filters.issuer.length > 0 ||
      filters.term.length > 0 ||
      filters.type.length > 0
    );
  };

  const renderDbondByTerms = (bondsByTerms) => {
    const { authInfo, lang, filters } = props;
    const isProInvestor = authInfo.isProInvestor;
    let rows = [];
    // Sort
    const sortedBonds = Object.keys(bondsByTerms)
      .sort((a, b) => {
        const ad = getDays(a.split("_")[0], a.split("_")[1]);
        const bd = getDays(b.split("_")[0], b.split("_")[1]);
        if (ad > bd) return 1;
        if (ad < bd) return -1;
        return 0;
      })
      .reduce((obj, key) => {
        obj[key] = bondsByTerms[key];
        return obj;
      }, {});

    for (const [key, value] of Object.entries(sortedBonds)) {
      if (filters.term && filters.term !== key) {
        continue;
      }
      let avaiableProducts;
      if (hasFilter(filters) || showAllTerms.includes(key)) {
        avaiableProducts = value;
      } else {
        avaiableProducts = value.filter((v) => {
          return (
            v.term_display &&
            v.term_display.includes(parseInt(key.split("_")[0]))
          );
        });
      }
      rows.push(
        <tr key={key}>
          <td
            colSpan="6"
            className="txt-left"
            onClick={() => showHideByTerms(key)}
          >
            {lang["minimumTerm"]} {key.split("_")[0]}{" "}
            {getTermFromUnit(key.split("_")[1], lang)} - {key.split("_")[3]}%/
            {lang["year"]}{" "}
            {!hideTerms.includes(key) ? (
              <i className="fa fa-chevron-up" />
            ) : (
              <i className="fa fa-chevron-down" />
            )}
          </td>
        </tr>
      );
      if (!hideTerms.includes(key)) {
        avaiableProducts.map((product, i) => {
          return rows.push(
            <FiItem
              key={key + "fix" + i}
              {...props}
              product={product}
              isProInvestor={isProInvestor}
              termRateId={key.split("_")[2]}
              filterAmount={filters.amount}
            />
          );
        });
      }
      {
        !hasFilter(filters) &&
          !hideTerms.includes(key) &&
          rows.push(
            <tr key={"more" + key}>
              <td colSpan="6" onClick={() => toggleShowAll(key)}>
                <div key={"more" + key} className="show-all">
                  {showAllTerms.includes(key) ? (
                    <span>
                      Thu gọn <i className="fa fa-chevron-up" />
                    </span>
                  ) : (
                    <span>
                      Xem tất cả <i className="fa fa-chevron-down" />
                    </span>
                  )}
                </div>
              </td>
            </tr>
          );
      }
    }
    if (bondsByTerms.length % 2 === 1) {
      rows.push(
        <tr>
          <td colSpan="6" />
        </tr>
      );
    }
    return rows;
  };

  const filterProduct = (listProduct, filters) => {
    let list = [...listProduct];
    if (filters.type) {
      if (filters.type === "mass") {
        list = list.filter((product) => {
          return !product.for_professional_investor;
        });
      }
      if (filters.type === "pro") {
        list = list.filter((product) => {
          return product.for_professional_investor;
        });
      }
    }
    if (filters.issuer) {
      list = list.filter((product) => {
        let bondInfo = bonds[product.bond_code];
        return bondInfo.issuer === filters.issuer;
      });
    }
    return list;
  };

  const myproducts = filterProduct(fiProducts, filters);
  const bondsByTerms =
    tableRates.length === 0
      ? []
      : groupByTerms(myproducts, tableRates, filterTerms);

  return (
    <div>
      <table>
        <colgroup>
          <col width="25%" />
          <col width="15%" />
          <col width="15%" />
          <col width="15%" />
          <col width="15%" />
          <col width="15%" />
        </colgroup>
        <thead>
          <FiHeader {...props} typeBond={typeBond} setTypeBond={setTypeBond} />
        </thead>
        {!props.products || !bonds || !tableRates ? (
          <tbody>
            <tr>
              <td colSpan="6">Loading</td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {myproducts.length === 0 ? (
              <tr>
                <td colSpan="6">{lang["dataNotFound"]}</td>
              </tr>
            ) : (
              renderDbondByTerms(bondsByTerms)
            )}
          </tbody>
        )}
      </table>
    </div>
  );
}
export default FiTable;
