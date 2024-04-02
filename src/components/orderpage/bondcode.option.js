import React, { Component } from 'react';
import { getCoupon } from '../../clients/bond.api.client';
import { checkNamebond } from '../../helpers';


class OptionBond extends Component {
  state = {
    coupon: null
  }
  componentDidMount() {
    const { product } = this.props
    if (product && product.bond_code) {
      this._getCoupon(product.bond_code)
    }
  }
  _getCoupon = async (bondCode) => {
    getCoupon(bondCode).then(res => {
      if (res.data) {
        this.setState({ coupon: res.data })
      }
    })
  }
  shortName = (name, product) => {
    if (!name) return product.bond_code;
    return name
  }
  render() {
    const { product } = this.props
    const { coupon } = this.state
    let langLocal = localStorage.getItem('lang') ? localStorage.getItem('lang') : 'vi'

    return (
      <option value={product.product_id} name={product.bond_code}>{checkNamebond(product.product_type)} - {coupon ? `${langLocal === 'vi' ?
        this.shortName(coupon.otherName, product) : this.shortName(coupon.otherNameEn, product)}`
        : product.bond_code}</option>
    )
  }
}

export default OptionBond