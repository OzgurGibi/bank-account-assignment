import { createReducer, on } from '@ngrx/store';
import { Account, Transaction } from '../models/bank.models';
import * as BankActions from './bank.actions';

export interface BankState {
  accounts: Account[];
  selectedAccount: Account | null;
  transactions: Transaction[];
  allTransactionsForChart: Transaction[];
  page: number;
  totalPages: number;
  hasMore: boolean;
  loadingAccounts: boolean;
  loadingTransactions: boolean;
  loadingOperations: boolean;
  error: string | null;
}

export const initialBankState: BankState = {
  accounts: [],
  selectedAccount: null,
  transactions: [],
  allTransactionsForChart: [],
  page: 0,
  totalPages: 0,
  hasMore: false,
  loadingAccounts: false,
  loadingTransactions: false,
  loadingOperations: false,
  error: null
};

export const bankReducer = createReducer(
  initialBankState,

  // Load Accounts
  on(BankActions.loadAccounts, (state) => ({
    ...state,
    loadingAccounts: true,
    error: null
  })),
  on(BankActions.loadAccountsSuccess, (state, { accounts }) => ({
    ...state,
    accounts,
    loadingAccounts: false
  })),
  on(BankActions.loadAccountsFailure, (state, { error }) => ({
    ...state,
    loadingAccounts: false,
    error
  })),

  // Create Account
  on(BankActions.createAccount, (state) => ({
    ...state,
    loadingOperations: true,
    error: null
  })),
  on(BankActions.createAccountSuccess, (state, { account }) => ({
    ...state,
    accounts: [...state.accounts, account],
    loadingOperations: false
  })),
  on(BankActions.createAccountFailure, (state, { error }) => ({
    ...state,
    loadingOperations: false,
    error
  })),

  // Deposit & Debit Operations
  on(BankActions.deposit, BankActions.debit, (state) => ({
    ...state,
    loadingOperations: true,
    error: null
  })),
  on(BankActions.depositSuccess, BankActions.debitSuccess, (state, { account }) => {
    const updatedAccounts = state.accounts.map(acc => acc.id === account.id ? account : acc);
    const updatedSelectedAccount = state.selectedAccount && state.selectedAccount.id === account.id ? account : state.selectedAccount;
    return {
      ...state,
      accounts: updatedAccounts,
      selectedAccount: updatedSelectedAccount,
      loadingOperations: false
    };
  }),
  on(BankActions.depositFailure, BankActions.debitFailure, (state, { error }) => ({
    ...state,
    loadingOperations: false,
    error
  })),

  // Exchange Operation
  on(BankActions.exchange, (state) => ({
    ...state,
    loadingOperations: true,
    error: null
  })),
  on(BankActions.exchangeSuccess, (state, { response }) => {
    const updatedAccounts = state.accounts.map(acc => {
      if (acc.id === response.sourceAccount.id) return response.sourceAccount;
      if (acc.id === response.destAccount.id) return response.destAccount;
      return acc;
    });

    let updatedSelectedAccount = state.selectedAccount;
    if (state.selectedAccount) {
      if (state.selectedAccount.id === response.sourceAccount.id) {
        updatedSelectedAccount = response.sourceAccount;
      } else if (state.selectedAccount.id === response.destAccount.id) {
        updatedSelectedAccount = response.destAccount;
      }
    }

    return {
      ...state,
      accounts: updatedAccounts,
      selectedAccount: updatedSelectedAccount,
      loadingOperations: false
    };
  }),
  on(BankActions.exchangeFailure, (state, { error }) => ({
    ...state,
    loadingOperations: false,
    error
  })),

  // Select Account
  on(BankActions.selectAccount, (state, { accountId }) => {
    const foundAccount = state.accounts.find(a => a.id === accountId) || null;
    return {
      ...state,
      selectedAccount: foundAccount,
      transactions: [],
      allTransactionsForChart: [],
      page: 0,
      totalPages: 0,
      hasMore: false,
      error: null
    };
  }),

  // Load Account Details
  on(BankActions.loadAccountDetails, (state) => ({
    ...state,
    loadingOperations: true,
    error: null
  })),
  on(BankActions.loadAccountDetailsSuccess, (state, { account }) => ({
    ...state,
    selectedAccount: account,
    loadingOperations: false
  })),
  on(BankActions.loadAccountDetailsFailure, (state, { error }) => ({
    ...state,
    loadingOperations: false,
    error
  })),

  // Load Transactions
  on(BankActions.loadTransactions, (state) => ({
    ...state,
    loadingTransactions: true,
    error: null
  })),
  on(BankActions.loadTransactionsSuccess, (state, { pageData, append }) => {
    const newTransactions = pageData.content;
    const existingTransactions = append ? state.transactions : [];
    
    // De-duplicate transactions to prevent issue if page index shifts
    const combined = [...existingTransactions, ...newTransactions];
    const uniqueMap = new Map<string, Transaction>();
    combined.forEach(tx => uniqueMap.set(tx.id, tx));
    const finalTransactions = Array.from(uniqueMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      ...state,
      transactions: finalTransactions,
      page: pageData.number,
      totalPages: pageData.totalPages,
      hasMore: !pageData.last,
      loadingTransactions: false
    };
  }),
  on(BankActions.loadTransactionsFailure, (state, { error }) => ({
    ...state,
    loadingTransactions: false,
    error
  })),

  // Load All Transactions (Chart)
  on(BankActions.loadAllTransactions, (state) => ({
    ...state,
    error: null
  })),
  on(BankActions.loadAllTransactionsSuccess, (state, { transactions }) => ({
    ...state,
    allTransactionsForChart: transactions
  })),
  on(BankActions.loadAllTransactionsFailure, (state, { error }) => ({
    ...state,
    error
  }))
);
