import React from 'react';
import AccountsSuggestion from './accounts.suggestion';


function AccountBox(props) {
  const { reload, lang, setActiveAccount, activeAccount, accounts } = props;
  
  return (
    <div className="account-box accounts-suggestion">
      <AccountsSuggestion
        accounts={accounts}
        lang={lang}
        activeAccount={activeAccount}
        handleSelect={setActiveAccount}
      />

      {reload && (
        <span onClick={reload} className="refresh">
          <i className="fa fa-refresh" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}

export default AccountBox;
