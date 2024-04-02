import React, { useEffect, useState } from "react";
import Autosuggest from "react-autosuggest";
import { emitter } from "../clients/emitter";
import { Event } from "../constants/config";
import * as AuthService from "../services/auth.service";

function AccountsSuggestion(props) {
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showPrivateInfo, setShowPrivateInfo] = useState(false)

  useEffect(() => {
    listenToTheEmitter();
    if (props.activeAccount) {
      const { activeAccount, accounts } = props;
      const selectedAccount = findActiveAccount(accounts, activeAccount.accountNumber)
      const value = selectedAccount ?
        `${selectedAccount.accountNumber} - ${selectedAccount.subName ? selectedAccount.subName : selectedAccount.fullName}` : '';
      setValue(showPrivateInfo ? value : props.activeAccount.accountNumber) 
    }
  }, [props.activeAccount])

  const findActiveAccount = (accounts, accountNumber) => {
    if (accounts && accountNumber) {
      return accounts.find(a=>a.accountNumber==accountNumber)
    }
  }

  function listenToTheEmitter() {
    emitter.on(Event.TOOGLE_SHOW_PRIVATE_INFO, newshowPrivateInfo => {
      if (props.activeAccount) {
        const { activeAccount } = props;
        const currentValue = `${activeAccount.accountNumber} - ${activeAccount.subName ? activeAccount.subName : activeAccount.fullName}`
        setValue(newshowPrivateInfo ? currentValue : props.activeAccount.accountNumber)
      }
      setShowPrivateInfo(newshowPrivateInfo)
    });
  }

  const getSuggestions = value => {
    const inputValue = value ? value.trim().toLowerCase() : "";
    return inputValue.length === 0
      ? props.accounts
      : props.accounts.filter(
        acc =>
          acc.accountNumber.toLowerCase().indexOf(inputValue) > -1 ||
          acc.fullName.toLowerCase().indexOf(inputValue) > -1 ||
          (acc.asciiName &&
            acc.asciiName.toLowerCase().indexOf(inputValue) > -1) ||
          (acc.tradeCode &&
            acc.tradeCode.toLowerCase().indexOf(inputValue) > -1)
      );
  };

  const shouldRenderSuggestions = value => {
    return true;
  };

  const getSuggestionValue = suggestion => suggestion.accountNumber;
  const renderSuggestion = suggestion => {
    return (
      <div className="suggestion-item">
        {suggestion.accountNumber} - {suggestion.subName ? suggestion.subName : suggestion.fullName}
      </div>
    );
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value))
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([])
  };

  const onSuggestionSelected = (event, suggestion) => {
    props.handleSelect(suggestion.suggestion);
  };

  const handleChangeInput = (event, { newValue }) => {
    setValue(newValue)
  };

  function reset() {
    setValue("")
    onSuggestionsFetchRequested({ value: "" });
  }

  function handleBlurInput() {
    if (props.activeAccount) {
      const { activeAccount } = props;
      const currentValue = `${activeAccount.accountNumber} - ${activeAccount.subName ? activeAccount.subName : activeAccount.fullName}`
      setValue(showPrivateInfo ? currentValue : props.activeAccount.accountNumber)
    }
  }

  const { lang } = props;
  const inputProps = {
    type: "text",
    tabIndex: "100",
    placeholder: lang["search_acc"],
    value,
    onChange: handleChangeInput,
    onClick: () => {reset()},
    onBlur: () => {handleBlurInput()}
  };

  return (
    <div className="container-suggestion">
      {props.accounts && props.accounts.length > 0 ? (
        <Autosuggest
          className="w200"
          suggestions={suggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          onSuggestionSelected={onSuggestionSelected}
          shouldRenderSuggestions={shouldRenderSuggestions}
          highlightFirstSuggestion={true}
          inputProps={inputProps}
        />
      ) : AuthService.isLoggedIn() ? (
        <input disabled />
      ) : null}
    </div>
  );
}

export default AccountsSuggestion