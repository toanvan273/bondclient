import React from "react";
import { connect } from "react-redux";
import NotificationSystem from "react-notification-system";

import {
  loadAccountInfo,
  loadAllAccounts,
  loadOwnerAccount,
} from "../actions/customer.actions";
import { Event } from "../constants/config";
import * as ActiveAccountService from "../services/active.account.service";
import * as AuthService from "../services/auth.service";
import { getParsedToken, parseToken, setToken } from "../services/auth.service";
import { emitter } from "../clients/emitter";
import { getLanguageDataByLang } from "../clients/i18n.api.client";
import {
  getBondAll,
  getBondProducts,
  getBondRates,
  loadScheduleRestricted,
} from "../actions/bond.actions";
import BondLabel from "../resource/labels/BondLabel";

import "../resource/styles/main.scss";
import ExternalLibs from "../modules/external";

const initialState = {
  authInfo: {
    customerId: "",
    isLogined: AuthService.isLoggedIn(),
    isSecondFa: AuthService.isStep2Authenticated(),
    username: "",
    customerName: "",
  },
  activeAccount: null,
  isShowingLoginPopup: false,
  isShowNpsPopup: false,
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.initState();
    this.listenTheEmitter(); // register listenning to the emitter
    this.setActiveAccount = this.setActiveAccount.bind(this);

    if (props.location.query.lang) {
      emitter.emit(Event.CHANGE_LANGUAGE, props.location.query.lang);
    }
  }

  initState() {
    let tokenObj = getParsedToken();
    if (tokenObj) {
      // eslint-disable-next-line
      this.state = {
        authInfo: {
          customerId: tokenObj.customerId,
          username: tokenObj.username,
          isLogined: true,
          isSecondFa: AuthService.isStep2Authenticated(),
          accountType: tokenObj.accountType,
          customerName: tokenObj.customerName,
          accounts: [],
          isProInvestor: null,
        },
      };
    } else {
      const token = this.props.location.query.token;
      if (token) {
        this.initStateFromTokenParam(token);
      } else {
        // eslint-disable-next-line
        this.state = initialState;
      }
    }
  }

  initStateFromTokenParam(token) {
    const tokenObj = parseToken(token);
    if (tokenObj) {
      setToken(token);
      // eslint-disable-next-line
      this.state = {
        authInfo: {
          customerId: tokenObj.customerId,
          username: tokenObj.username,
          isLogined: true,
          isSecondFa: AuthService.isStep2Authenticated(tokenObj),
          accountType: tokenObj.accountType,
          customerName: tokenObj.customerName,
          accounts: [],
          isProInvestor: null,
        },
      };
    }
  }

  loadTheme = () => {
    const theme = this.props.location.query.theme === "light";
    if (theme) {
      document.body.classList.add("theme-light");
      localStorage.setItem("bond_theme", "light");
    } else {
      localStorage.removeItem("bond_theme");
    }
  };

  componentWillMount() {
    this.loadI18n();
    this.loadTheme();
  }

  componentDidMount() {
    this.noti = this.refs.notificationSystem;
    document.body.classList.add(`lang-vi`);

    const loginClass =
      this.state.authInfo && this.state.authInfo.isLogined
        ? "logged-in"
        : "not-logged-in";
    document.body.classList.add(loginClass);

    this.props.dispatch(getBondAll());
    this.props.dispatch(getBondProducts());
    this.props.dispatch(getBondRates());
    this.props.dispatch(loadScheduleRestricted());

    if (this.state.authInfo.isLogined && this.state.authInfo.customerId) {
      this.props.dispatch(loadAccountInfo());
      this.props.dispatch(loadOwnerAccount());
      this.props.dispatch(loadAllAccounts());
    }

    window.scrollToTop = function () {
      window.parent.postMessage(["scrollToTop"], "*");
    };
    window.changeURL = function (url) {
      window.parent.postMessage(["changeURL", url], "*");
    };

    window.resize = function () {
      var height = document.getElementsByClassName("main-content")[0];
      if (height && height.scrollHeight) {
        window.parent.postMessage(["setHeightBond", height.scrollHeight], "*");
      }
    };
    setTimeout(() => {
      window.resize();
    }, 300);
  }

  componentWillReceiveProps(nextProps) {
    if (
      JSON.stringify(nextProps.accounts) !==
        JSON.stringify(this.props.accounts) ||
      !!nextProps.location.query.accountNo
    ) {
      this.findActiveAccount(nextProps);
    }
  }

  findActiveAccount = (nextProps) => {
    let lastActiveAccount = ActiveAccountService.getLastActiveAccount();
    const { accountNo } = nextProps.location.query;
    if (accountNo) {
      lastActiveAccount = nextProps.accounts.find(
        (acc) => acc.accountNumber === accountNo
      );
    }
    if (lastActiveAccount) {
      this.setActiveAccount(lastActiveAccount);
    } else {
      this.setActiveAccount(nextProps.accounts[0]);
    }
  };

  loadI18n() {
    let lang = this.props.location.query.lang;
    if (lang) {
      localStorage.setItem("lang", lang);
    } else {
      localStorage.setItem("lang", "vi");
    }
    lang = BondLabel[localStorage.getItem("lang")]
      ? BondLabel[localStorage.getItem("lang")]
      : BondLabel["en"];
    lang = {
      ...localStorage.getItem("langAllBond"),
      ...lang,
    };
    this.setState(
      {
        lang,
      },
      () => {
        getLanguageDataByLang(localStorage.getItem("lang")).then((res) => {
          if (res && res.data) {
            res.data.map((item) => {
              lang[`${item.resource}_${item.key}`] =
                item[localStorage.getItem("lang")];
            });
            localStorage.setItem("langAllBond", lang);
            this.setState({
              lang: lang,
            });
          }
        });
      }
    );
  }

  listenTheEmitter() {
    emitter.on(Event.FIRE_NOTIFICATION, (noti) => {
      this.fireNotification(noti);
    });
  }

  verifyToken() {
    let tokenObj = getParsedToken();
    if (tokenObj) {
      if (
        this.state.authInfo.username &&
        tokenObj.username !== this.state.authInfo.username
      ) {
        // user's change!
        window.location.reload(true);
        return;
      }

      this.setState({
        authInfo: {
          accountType: tokenObj.accountType,
          customerId: tokenObj.customerId,
          isLogined: true,
          isSecondFa: AuthService.isStep2Authenticated(),
          username: tokenObj.username,
          customerName: tokenObj.customerName,
        },
      });
    } else {
      this.setState({
        authInfo: {
          accountType: "",
          customerId: "",
          isLogined: false,
          isSecondFa: false,
          username: "",
          customerName: "",
        },
      });
    }
    return tokenObj;
  }

  setActiveAccount(account) {
    if (account) {
      this.setState({
        activeAccount: account,
      });
      emitter.emit(Event.CHANGE_ACTIVE_ACCOUNT, account);
      ActiveAccountService.storeActiveAccount(account);
      account.tradingMode = "UNDERLYING";
      window.parent.postMessage(["setActiveAccountBond", account], "*");
    }
  }

  fireNotification(noti) {
    if (!this.noti) {
      this.noti = this.refs.notificationSystem;
    }
    if (this.noti) {
      this.noti.addNotification(noti);
    }
  }

  _removeNotification(uid) {
    if (!this.noti) {
      this.noti = this.refs.notificationSystem;
    }
    if (this.noti) {
      this.noti.removeNotification(uid);
    }
  }

  render() {
    const { authInfo, lang, activeAccount } = this.state;
    const { accounts, ownerAccount } = this.props;
    const iproInvestor =
      ownerAccount &&
      ownerAccount.segmentations.find(
        (e) => e.code === "SEG000024" && e.status === "BELONG"
      );
    const childrenWithProps = React.Children.map(
      this.props.children,
      (child) => {
        return React.cloneElement(child, {
          authInfo: { ...authInfo, isProInvestor: !!iproInvestor },
          accountInfo: this.props.accountInfo,
          lang,
          accounts: accounts,
          activeAccount: activeAccount,
          setActiveAccount: this.setActiveAccount.bind(this),
        });
      }
    );
    return (
      <div id="main" className={`pullable`}>
        <div className="main-content">{childrenWithProps}</div>
        <NotificationSystem ref="notificationSystem" />
        <ExternalLibs />
      </div>
    );
  }
}

/* Subscribe component to redux store and merge the state into component\s props */
const mapStateToProps = ({ customerStore }) => {
  return {
    accounts: customerStore.accounts,
    accountInfo: customerStore.accountInfo,
    ownerAccount: customerStore.ownerAccount,
  };
};

/* connect method from react-router connects the component with redux store */
export default connect(mapStateToProps)(App);
