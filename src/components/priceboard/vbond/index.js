import moment from "moment";
import React, { useEffect, useState } from "react";
import VBondComponent from "./item";
import VBondHeader from "./header";
import VBondFilter from "./filter";
import { getCountDownDate, isBusinessCustomer } from "../../../helpers";
import IntroduceVbond from "./introduce";
import ProInvestor from "../pro.investor";
import wa from "../../../resource/images/warm.svg";
import { stookBookUrl } from "../../../constants/config";

function VBondPriceBoard(props) {
  const [vbondProducts, setVbondProducts] = useState(null);
  const [filters, setFilters] = useState(
    localStorage.getItem("vBondFilters")
      ? JSON.parse(localStorage.getItem("vBondFilters"))
      : { issuer: "", type: "", yield: "", term: "" }
  );
  const [hideTerms, setHideTerms] = useState([]);
  const [filterIssuers, setFilterIssuers] = useState([]);

  useEffect(() => {
    if (props.products && props.bonds && !vbondProducts) {
      updateProducts(props.products, props.bonds);
    }
  }, [props]);

  function updateProducts(products, bonds) {
    let vbondProducts = products.filter((product) => {
      return (
        product.product_label &&
        product.product_label.toLowerCase() === "v-bond" &&
        product.product_status === "ACTIVE" &&
        product.display_protrade === true &&
        product.bond_code &&
        bonds &&
        bonds[product.bond_code] &&
        moment().isBefore(bonds[product.bond_code].maturity_date)
      );
    });
    setVbondProducts(vbondProducts);
    if (filterIssuers.length === 0) {
      let ifilterIssuers = [];
      vbondProducts.forEach((product) => {
        let bondInfo = bonds[product.bond_code];
        if (bondInfo && !ifilterIssuers.includes(bondInfo.issuer)) {
          ifilterIssuers.push(bondInfo.issuer);
        }
      });
      setFilterIssuers([...ifilterIssuers]);
    }
  }

  function categorize(value) {
    if (value < 1) return "<1";
    if (1 <= value && value < 3) return "1-3";
    if (3 <= value && value <= 5) return "3-5";
    if (value > 5) return ">5";
    return "";
  }

  function doFilter(filters) {
    localStorage.setItem("vBondFilters", JSON.stringify(filters));
    setFilters({ ...filters });
  }

  function showHideByIssuers(issuer) {
    let issuers = hideTerms;
    if (hideTerms.includes(issuer)) {
      issuers = hideTerms.filter((iss) => iss != issuer);
    } else {
      issuers.push(issuer);
    }
    setHideTerms([...issuers]);
  }

  const groupByTerm = (vBonds, bonds) => {
    let results = {
      "<1": [],
      "1-3": [],
      "3-5": [],
      ">5": [],
    };
    vBonds.forEach((bond) => {
      let bondInfo = bonds[bond.bond_code];
      if (bondInfo) {
        let term = categorize(getCountDownDate(bondInfo.maturity_date));
        let bonds = results[term];
        if (bonds) {
          bonds.push(bond);
        } else {
          results[term] = [bond];
        }
      }
    });
    return results;
  };

  function renderVbondByTerm(bondsByTerm) {
    const { authInfo, lang } = props;
    const isProInvestor = authInfo.isProInvestor;
    let rows = [];
    for (const [key, value] of Object.entries(bondsByTerm)) {
      if (filters.term && filters.term !== key) {
        continue;
      }
      rows.push(
        <tr key={key}>
          <td
            colSpan="9"
            className="txt-left"
            onClick={() => showHideByIssuers(key)}
          >
            {lang["remainingTerm"]} {key} {lang["year"]}{" "}
            {!hideTerms.includes(key) ? (
              <i className="fa fa-chevron-up" />
            ) : (
              <i className="fa fa-chevron-down" />
            )}
          </td>
        </tr>
      );
      if (!hideTerms.includes(key)) {
        value.map((bond, i) =>
          rows.push(
            <VBondComponent
              {...props}
              key={bond.product_id}
              bond={bond}
              isProInvestor={isProInvestor}
              filterAmount={filters.amount}
            />
          )
        );
      }
    }
    if (bondsByTerm.length % 2 === 1) {
      rows.push(
        <tr>
          <td colSpan="9"></td>
        </tr>
      );
    }
    return rows;
  }

  const buildVBondTable = () => {
    const { bonds, lang } = props;
    let products = vbondProducts;

    if (filters.type) {
      if (filters.type === "vbond-mass") {
        products = products.filter((product) => {
          return !product.for_professional_investor;
        });
      }
      if (filters.type === "vbond-pro") {
        products = products.filter((product) => {
          return product.for_professional_investor;
        });
      }
    }
    if (filters.issuer) {
      products = products.filter((product) => {
        let bondInfo = bonds[product.bond_code];
        return bondInfo.issuer === filters.issuer;
      });
    }
    if (filters.yield) {
      if (filters.yield) {
        if (filters.yield === "<8") {
          products = products.filter((product) => {
            return product.yield < 8;
          });
        }
        if (filters.yield === "8_9") {
          products = products.filter((product) => {
            return 8 <= product.yield && product.yield < 9;
          });
        }
        if (filters.yield === "9_10") {
          products = products.filter((product) => {
            return 9 <= product.yield && product.yield <= 10;
          });
        }
        if (filters.yield === ">10") {
          products = products.filter((product) => {
            return product.yield > 10;
          });
        }
      }
    }

    let bondsByTerm = groupByTerm(products, bonds);

    return (
      <table>
        <thead>
          <VBondHeader {...props} />
        </thead>
        <tbody>
          {vbondProducts.length === 0 ? (
            <tr>
              <td colSpan="9">{lang["dataNotFound"]}</td>
            </tr>
          ) : (
            renderVbondByTerm(bondsByTerm)
          )}
        </tbody>
      </table>
    );
  };

  const { lang, products, accounts } = props;
  return (
    <div>
      {isBusinessCustomer(accounts) && (
        <div className="warning65">
          <img src={wa} />
          <span style={{ marginLeft: "5px" }}>
            {lang["businessCustomerNote"]}
          </span>
        </div>
      )}
      <ProInvestor {...props} />
      <div id="vbondMarket" className="proinvestor">
        <p style={{ marginBottom: 0 }}>
          {lang["vbondMarket"]}
          <span>
            <a
              href={stookBookUrl + "co-hoi-dau-tu/trai-phieu-doanh-nghiep"}
              target="_blank"
            >
              {lang["here"]}
            </a>
            .
          </span>
        </p>
      </div>
      <IntroduceVbond lang={lang} />
      <VBondFilter
        lang={lang}
        products={products}
        doFilter={doFilter}
        filters={filters}
        terms={["<1", "1-3", "3-5", ">5"]}
        issuers={filterIssuers}
      />
      <div style={{ display: "flex", marginLeft: 16, marginBottom: 5 }}>
        <div className="warning" style={{ display: "flex" }}>
          <div>
            <div
              className="fa"
              style={{
                borderRadius: 2,
                width: 12,
                height: 12,
                background: "#f7941d",
              }}
            ></div>{" "}
            <span>{lang["privatePlacementBond"]}</span>
          </div>
          <div style={{ marginLeft: 30 }}>
            <div
              className="fa"
              style={{
                borderRadius: 2,
                width: 12,
                height: 12,
                background: "#ffffff",
              }}
            ></div>{" "}
            <span>{lang["publicOfferingBond"]}</span>
          </div>
        </div>
        <div className="warning" style={{ marginLeft: 30 }}>
          <div>
            <i className="fa fa-bookmark" style={{ marginLeft: 3 }} />{" "}
            {lang["bondForProInvest"]}
          </div>
        </div>
      </div>
      {vbondProducts ? (
        buildVBondTable()
      ) : (
        <div className="loading">
          <i className="fa fa-refresh fa-spin fa-3x fa-fw" />
        </div>
      )}
    </div>
  );
}

export default VBondPriceBoard