import React, { Component } from "react";
import numeral from "numeral";
import { getTermFromUnit } from "../../../../helpers";

export class DBondCorpFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowFilter: true,
      filter: props.filters,
    };
  }

  toggleFilter = () => {
    const { isShowFilter } = this.state;
    this.setState({
      isShowFilter: !isShowFilter,
    });
  };

  changeAmount = (e) => {
    const { filter } = this.state;
    this.setState({
      filter: { ...filter, ...{ amount: e.target.value } },
    });
  };

  changeFilterType = (e) => {
    const { filter } = this.state;
    this.setState({
      filter: { ...filter, ...{ type: e.target.value } },
    });
  };

  changeFilterIssuer = (e) => {
    const { filter } = this.state;
    this.setState({
      filter: { ...filter, ...{ issuer: e.target.value } },
    });
  };

  changeFilterTerm = (e) => {
    const { filter } = this.state;
    this.setState({
      filter: { ...filter, ...{ term: e.target.value } },
    });
  };

  groupByTerms = (products, rates, filterTerms) => {
    let results = filterTerms.reduce((pre, cur) => ({ ...pre, [cur]: [] }), {});
    const findProduct = (p, rates) => {
      let obj = {};
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
            obj[key] = p;
          }
        });
      });
      return obj;
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

  findProduct = (p, rates) => {
    let obj = {};
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
            obj[key] = p;
          }
        });
      });
    }
    return obj;
  };

  findListBond() {
    const { fixProducts, terms, tableRates } = this.props;
    let results = terms.reduce((pre, cur) => ({ ...pre, [cur]: [] }), {});
    fixProducts &&
      fixProducts.forEach((product) => {
        const ps = this.findProduct(product, tableRates);
        if (Object.keys(ps).length > 0) {
          for (const [key, value] of Object.entries(ps)) {
            let currData = results[key];
            if (currData) {
              currData.push(value);
            }
          }
        }
      });
    return Object.values(results).reduce((pre, cur) => [...pre, ...cur], []);
  }

  renderIssuerFilter() {
    const { bonds } = this.props;
    let ifilterIssuers = [];
    const arrayBond = this.findListBond();
    arrayBond.forEach((product) => {
      let bondInfo = bonds[product.bond_code];
      if (!ifilterIssuers.includes(bondInfo.issuer)) {
        ifilterIssuers.push(bondInfo.issuer);
      }
    });
    let options = [];
    ifilterIssuers.forEach((issuer) => {
      options.push(
        <option key={"issuer_option" + issuer} value={issuer}>
          {issuer}
        </option>
      );
    });
    return options;
  }

  renderTermsFilter() {
    const { terms, lang } = this.props;
    let options = [];
    terms.forEach((term) => {
      options.push(
        <option key={"term_option" + term} value={term}>
          {term.split("_")[0] + " " + getTermFromUnit(term.split("_")[1], lang)}
        </option>
      );
    });
    return options;
  }

  doFilter() {
    const { filter } = this.state;
    this.props.doFilter(filter);
  }

  resetFilter() {
    let filter = {
      issuer: "",
      term: "",
      type: "",
    };
    this.props.doFilter(filter);
    this.setState({
      filter,
    });
  }

  render() {
    const { isShowFilter } = this.state;
    const { lang } = this.props;
    return (
      <div className="filter">
        <div className="heading" style={{ cursor: "pointer" }}>
          <span onClick={() => this.toggleFilter()}>
            <i className="fa fa-filter" /> {lang["advancedFilter"]}{" "}
            {isShowFilter ? (
              <i className="fa fa-chevron-up" />
            ) : (
              <i className="fa fa-chevron-down" />
            )}
          </span>
        </div>
        {isShowFilter && (
          <ul>
            <li>
              <label>{lang["investmentAmount"]}</label>
              <input
                placeholder={lang["inputMoney"]}
                value={
                  this.state.filter.amount
                    ? numeral(this.state.filter.amount).format("0,0")
                    : ""
                }
                type="text"
                onChange={this.changeAmount}
                className="input-money"
              />
            </li>
            <li>
              <label>{lang["minimumTerm"]}</label>
              <select
                value={this.state.filter.term}
                onChange={this.changeFilterTerm}
              >
                <option value={""} key={"filter_term"}>
                  {lang["anyTerm"]}
                </option>
                {this.renderTermsFilter()}
              </select>
            </li>
            <li>
              <label>{lang["Issuer"]}</label>
              <select
                value={this.state.filter.issuer}
                onChange={this.changeFilterIssuer}
                style={{ width: "200px" }}
              >
                <option value={""} key={"filter_issuer"}>
                  {lang["anyIssuer"]}
                </option>
                {this.renderIssuerFilter()}
              </select>
            </li>
            <li>
              <label>{lang["productBondType"]}</label>
              <select
                value={this.state.filter.type}
                onChange={this.changeFilterType}
              >
                <option value={""} key={"vbond"}>
                  {lang["allBonds"]}
                </option>
                <option value={"mass"} key={"mass"}>
                  {lang["forAllInvestor"]}
                </option>
                <option value={"pro"} key={"pro"}>
                  {lang["forProInvestor"]}
                </option>
              </select>
            </li>
            <li>
              <button
                className="btn btn-primary"
                onClick={() => this.doFilter()}
              >
                {lang["filter"]}
              </button>
              <span className="btn" onClick={() => this.resetFilter()}>
                <i className="fa fa-undo"></i>
              </span>
            </li>
          </ul>
        )}
      </div>
    );
  }
}

export default DBondCorpFilter;
