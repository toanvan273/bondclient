import React from "react";
import { Route, IndexRedirect } from "react-router";

import PriceBoardPage from "./containers/priceboard.page";
import OrderBookPage from "./containers/orderbook.page";
import OrderPage from "./containers/order.page";
import PortfolioPage from "./containers/portfolio.page";
import DetailBond from "./containers/bond.page";
import BuyPage from "./containers/buy.page";
import App from "./containers/App";
import OrderComfirmPage from "./containers/order.comfirm.page";
import OrderDetailPage from './components/detailconfirm'
import SellPage from "./containers/sell.page";

export default (
  <Route path="/" component={App}>
    <IndexRedirect to="/bang-gia" />
    <Route path="/bang-gia/:type" component={PriceBoardPage} />
    <Route path="/bang-gia" component={PriceBoardPage} />
    <Route path="/so-lenh" component={OrderBookPage} />
    <Route path="/danh-muc" component={PortfolioPage} />
    <Route path="/dat-lenh" component={OrderPage} />
    <Route path="/xac-nhan-lenh" component={OrderComfirmPage} />
    <Route path="/xac-nhan/:accountNo/:procInstId" component={OrderDetailPage} />
    <Route path="/trai-phieu/:bond_code/:product_type" component={DetailBond} />
    <Route path="/:side/:bond_code/:product_type" component={BuyPage} />
    <Route path="/danh-muc/:side/:bond_code/:product_type" component={SellPage} />
    {/* <Route path="/dang-ky-probond" component={RegisterProBondPage} /> */}
    {/* <Route path="/hop-dong/:id" component={Contracts} /> */}
  </Route>
);
