import { browserHistory } from "react-router";
import moment from "moment";
import * as AuthService from "./services/auth.service";
import { timer } from "./services/time.service";
import { useEffect} from 'react';

const tzOffset = '+07:00';

export const convertUnitTerm = unit => {
  if (unit === "Y") {
    return 365;
  }
  if (unit === "M") {
    return 30;
  }
  if (unit === "D") {
    return 1;
  }
};

export const getTermUnit = (unit, lang, term = 0) => {
  switch (unit) {
    case "D":
      return term === 1 ? lang["day"] : lang["days"];
    case "M":
      return term === 1 ? lang["month"] : lang["months"];
    case "Y":
      return term === 1 ? lang["year"] : lang["years"];
    default:
      return "";
  }
};

export const getCountDownDate = value => {
  const date = new Date(value);
  return (moment(date).diff(moment(new Date()), "days") / 365).toFixed(1);
};

export const fromArrayToMap = (arr, field) => {
  const result = {};
  arr.forEach(item => {
    if (item) {
      result[item[field]] = item;
    }
  });
  return result;
};

export const getCurrentDateString = () => {
  return moment().format("DD/MM/YYYY");
};

export const displayNoti = (message, type = "success") => {
  if (typeof window !== "undefined")
    window.parent.postMessage(["noti", message, type], "*");
};

export const check2AuthBeforeRedirect = url => {
  AuthService.isStep2Authenticated()
    ? browserHistory.push(url)
    : window.parent.postMessage(["required2Authenticated"], "*");
};

export const removeAccents = str => {
  var AccentsMap = [
    "aàảãáạăằẳẵắặâầẩẫấậ",
    "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
    "dđ",
    "DĐ",
    "eèẻẽéẹêềểễếệ",
    "EÈẺẼÉẸÊỀỂỄẾỆ",
    "iìỉĩíị",
    "IÌỈĨÍỊ",
    "oòỏõóọôồổỗốộơờởỡớợ",
    "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
    "uùủũúụưừửữứự",
    "UÙỦŨÚỤƯỪỬỮỨỰ",
    "yỳỷỹýỵ",
    "YỲỶỸÝỴ"
  ];
  for (var i = 0; i < AccentsMap.length; i++) {
    var re = new RegExp("[" + AccentsMap[i].substr(1) + "]", "g");
    var char = AccentsMap[i][0];
    str = str.replace(re, char);
  }
  return str;
};

export const covertDatebyString = (value, typeInput, typeOutput) => {
  if (!value) return ''
  // ex: 2020-02-17 , YYYY-MM-DD , DD/MM/YYYY
  let mydate = moment(value, typeInput)
  return moment(mydate).format(typeOutput)
}

export const checkTypebond = bond => { // -> d-bond | v-bond
  if (!bond) return null
  if (bond.product_type === "OUTRIGHT") return 'v-bond'
  if (bond.product_type === "VAR" || bond.product_type === "FIX") return 'd-bond'
}
export const nameTypebond = bond => { // -> d-bond | v-bond
  if (!bond) return null
  if (bond.product_type === "OUTRIGHT") return 'VBond'
  if (bond.product_type === "VAR" || bond.product_type === "FIX") return 'DBond'
}


export const checkNamebond = product_type => { // -> d-bond | v-bond | pro-bond
  if (!product_type) return null
  if (product_type === "OUTRIGHT") return 'VBond'
  if (product_type === "PROBOND") return 'PROBOND'
  if (product_type === "VAR" || product_type === "FIX") return 'DBond'
}
export const mapStatusProInvest = (key, lang) => {
  switch (key) {
    case true:
      return lang && lang['yes']
    case false:
      return lang && lang['no']
    default:
      return ''
  }
}

export const getTermFromUnit = (term_unit, lang) => {
  switch (term_unit) {
    case "D":
      return lang && lang['days'];

    case "M":
      return lang && lang['months'];
    case "Y":
      return lang && lang['year'];

  }
}

export const isBusinessCustomer = (accounts) => {
  if (accounts && accounts.length > 0) {
    return accounts.find(e=> e.customerType === 'B')
  }
  return null
}

export const timeServer = (formatType = 'Y-MM-DD') => {
  const objTime = moment(timer.getTime()).utcOffset(tzOffset);
  return objTime.format(formatType)
}

export const timeUnitServer = () => {
  return moment(timer.getTime()).utcOffset(tzOffset);
}

export const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

export const genNTypeBond = (n) => {
  if (n > 3) return 1;
  if (n < 1) return 3;
  return n;
};

export const genLabelTypeBond = (n, lang) => {
  switch (n) {
    case 1:
      return lang["shortName"];
    case 2:
      return lang["bondCode"];
    case 3:
      return lang["originalBond"];
    default:
      return;
  }
};

export const showTableVipRate = (promotions) => {
  if (!promotions) return null;
  const promotion = promotions.filter((e) => e.promotion > 0);
  if (promotion.length === 0) return null;
  return true;
};

export const renderStringRates = (tableRates) => {
  if (tableRates.length > 0) {
    const data = tableRates
      .map((e) => e.standard_term_unit)
      .sort((a, b) => a - b);
    return `${data[0].day} - ${data[data.length - 1].day}`;
  }
  return "";
};

export const getDays = (term, term_unit) => {
  term = parseInt(term);
  let days;
  switch (term_unit) {
    case "D":
      days = term;
      break;
    case "M":
      days = term * 30;
      break;
    case "Y":
      days = term * 365;
      break;
    default:
      days = term;
  }
  return days;
};