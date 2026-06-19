import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BankState } from './bank.reducer';

export const selectBankState = createFeatureSelector<BankState>('bank');

export const selectAllAccounts = createSelector(
  selectBankState,
  (state) => state.accounts
);

export const selectSelectedAccount = createSelector(
  selectBankState,
  (state) => state.selectedAccount
);

export const selectTransactions = createSelector(
  selectBankState,
  (state) => state.transactions
);

export const selectAllTransactionsForChart = createSelector(
  selectBankState,
  (state) => state.allTransactionsForChart
);

export const selectTransactionsPage = createSelector(
  selectBankState,
  (state) => state.page
);

export const selectHasMoreTransactions = createSelector(
  selectBankState,
  (state) => state.hasMore
);

export const selectLoadingAccounts = createSelector(
  selectBankState,
  (state) => state.loadingAccounts
);

export const selectLoadingTransactions = createSelector(
  selectBankState,
  (state) => state.loadingTransactions
);

export const selectLoadingOperations = createSelector(
  selectBankState,
  (state) => state.loadingOperations
);

export const selectBankError = createSelector(
  selectBankState,
  (state) => state.error
);
