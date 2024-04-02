import React, { Component } from "react";
import numeral from "numeral";
import { getTermFromUnit } from "../../../helpers";

export class VBondFilter extends Component {
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
      isShowFilter: !isShowFilter
    });
  }

  changeAmount = e => {
    const { filter } = this.state;
    this.setState({
      filter: { ...filter, ...{ amount: e.target.value } }
    });
  }

  changeFilterType = e => {
    const { filter } = this.state;
    this.setState({
      filter: { ...filter, ...{ type: e.target.value } }
    });
  }

  changeFilterYield = e => {
    const { filter } = this.state;
    this.setState({
      filter: { ...filter, ...{ yield: e.target.value } }
    });
  }

  doFilter() {
    const { filter } = this.state;
    this.props.doFilter(filter);
  }

  resetFilter() {
    let filter = {
      type: '',
      yield: ''
    };
    this.props.doFilter(filter);
    this.setState({
      filter
    })
  }

  changeFilterIssuer = e => {
    const { filter } = this.state;
    this.setState({
      filter: { ...filter, ...{ issuer: e.target.value } }
    });
  }

  changeFilterTerm = e => {
    const { filter } = this.state;
    this.setState({
      filter: { ...filter, ...{ term: e.target.value } }
    });
  }

  renderIssuerFilter() {
    const { issuers } = this.props;
    let options = [];
    issuers.forEach(issuer => {
      options.push(
        <option key={'issuer_option' + issuer} value={issuer}>
          {issuer}
        </option>
      );
    });
    return options;
  }

  renderTermsFilter() {
    const { terms, lang } = this.props;
    let options = [];
    terms.forEach(term => {
      options.push(
        <option key={'term_option' + term} value={term}>
          {term + ' ' + getTermFromUnit('Y', lang)}
        </option>
      );
    });
    return options;
  }

  render() {
    const { isShowFilter } = this.state;
    const { lang } = this.props
    return (
      <div className="filter">
        <div className="heading" style={{ cursor: 'pointer' }}>
          <span onClick={() => this.toggleFilter()}>
            <i className="fa fa-filter" /> {lang['advancedFilter']} {isShowFilter ? <i className="fa fa-chevron-up" /> : <i className="fa fa-chevron-down" />}
          </span>
        </div>
        {isShowFilter &&
          <ul>
            <li>
              <label>{lang['investmentAmount']}</label>
              <input
                placeholder={lang['inputMoney']}
                value={this.state.filter.amount ? numeral(this.state.filter.amount).format("0,0") : ''}
                type="text"
                onChange={this.changeAmount}
                className='input-money'
              />
            </li>
            <li>
              <label>{lang['remainingTerm']}</label>
              <select value={this.state.filter.term} onChange={this.changeFilterTerm}>
                <option value={''} key={'filter_term'}>
                  {lang['anyTerm']}
                </option>
                {this.renderTermsFilter()}
              </select>
            </li>
            <li>
              <label>{lang['Issuer']}</label>
              <select value={this.state.filter.issuer} onChange={this.changeFilterIssuer} style={{ maxWidth: '200px' }}>
                <option value={''} key={'filter_issuer'}>
                  {lang['anyIssuer']}
                </option>
                {this.renderIssuerFilter()}
              </select>
            </li>
            <li>
              <label>{lang['yieldMaturity']}</label>
              <select onChange={this.changeFilterYield} value={this.state.filter.yield}>
                <option value={''} key={'filter_yield'}>
                  {lang['selectYield']}
                </option>
                <option value={'<8'} key={'yield8'}>{'<8%'}</option>
                <option value={'8_9'} key={'yield8_9'}>{'8-9%'}</option>
                <option value={'9_10'} key={'yield9_10'}>{'9-10%'}</option>
                <option value={'>10'} key={'yield10'}>{'>10%'}</option>
              </select>
            </li>
            <li>
              <label>{lang['productBondType']}</label>
              <select onChange={this.changeFilterType} value={this.state.filter.type}>
                <option value={''} key={'vbond'}>
                  {lang['allBonds']}
                </option>
                <option value={'vbond-mass'} key={'vbond-mass'}>
                  {lang['forAllInvestor']}
                </option>
                <option value={'vbond-pro'} key={'vbond-pro'}>
                  {lang['forProInvestor']}
                </option>
              </select>
            </li>
            <li>
              <button
                className="btn btn-primary"
                onClick={() => this.doFilter()}
              >
                {lang['filter']}
              </button>
              <span className="btn" onClick={() => this.resetFilter()}>
                <i className="fa fa-undo"></i>
              </span>
            </li>
          </ul>
        }
      </div>
    );
  }
}

export default VBondFilter;
