import moment from "moment";
import React, { useEffect, useState } from "react";
import DBondFilter from "./filter";
import DbondTable from "./table";
import numeral from "numeral";
import IntroduceDbond from "./introduce";
import { getTableRate } from "../../../../clients/bond.api.client";

function DbondPriceBoardCorp(props) {
  const [fixProducts, setFixProducts] = useState(null);
  const [filters, setFilters] = useState(
    localStorage.getItem("dBondFilters")
      ? JSON.parse(localStorage.getItem("dBondFilters"))
      : { issuer: "", term: "", type: "" }
  );
  const [filterTerms, setFilterTerms] = useState([]);
  const [tableRates, setTableRates] = useState([]);

  useEffect(() => {
    if (props.products && props.bonds) {
      updateProducts(props.products, props.bonds);
      getTableRateInfo(47);
    }
  }, [props.products, props.bonds]);

  const getTableRateInfo = (rate) => {
    getTableRate(rate)
      .then((res) => {
        setTableRates([...res.data.terms]);
        const rates = res.data.terms.map(
          (e) =>
            `${e.term}_${e.term_unit}_${e.termRateId}_${numeral(e.rate).format(
              "0.0"
            )}`
        );
        setFilterTerms([...rates]);
      })
      .catch((err) => {
        setTableRates([]);
      });
  };

  const updateProducts = (products, bonds) => {
    let fixProducts = products.filter((product) => {
      return (
        product.product_label &&
        product.product_label.toLowerCase() === "d-bond" &&
        product.product_status === "ACTIVE" &&
        product.product_type === "FIX" &&
        product.display_protrade === true &&
        product.bond_code &&
        bonds &&
        bonds[product.bond_code] &&
        moment().isBefore(bonds[product.bond_code].maturity_date)
      );
    });
    setFixProducts(fixProducts);
  };

  const doFilter = (filters) => {
    localStorage.setItem("dBondFilters", JSON.stringify(filters));
    setFilters({ ...filters });
  };

  const { lang } = props;

  return (
    <div>
      <IntroduceDbond {...props} tableRates={tableRates} />
      <DBondFilter
        {...props}
        lang={lang}
        bonds={props.bonds}
        terms={filterTerms}
        doFilter={doFilter}
        filters={filters}
        fixProducts={fixProducts}
        tableRates={tableRates}
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
      {fixProducts ? (
        <DbondTable
          {...props}
          filters={filters}
          filterTerms={filterTerms}
          fixProducts={fixProducts}
          tableRates={tableRates}
        />
      ) : (
        <div className="loading">
          <i className="fa fa-refresh fa-spin fa-3x fa-fw" />
        </div>
      )}
    </div>
  );
}

export default DbondPriceBoardCorp;
