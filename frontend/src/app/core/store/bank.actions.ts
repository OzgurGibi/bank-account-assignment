import { createAction, props } from '@ngrx/store';
import { Account, Transaction, ExchangeResponse, Page } from '../models/bank.models';

// Load Accounts
export const loadAccounts = createAction('[Bank] Load Accounts', props<{ owner?: string }>());
export const loadAccountsSuccess = createAction('[Bank] Load Accounts Success', props<{ accounts: Account[] }>());
export const loadAccountsFailure = createAction('[Bank] Load Accounts Failure', props<{ error: string }>());

// Create Account
export const createAccount = createAction(
  '[Bank] Create Account',
  props<{ name: string; currency: string; owner?: string }>()
);
export const createAccountSuccess = createAction('[Bank] Create Account Success', props<{ account: Account }>());
export const createAccountFailure = createAction('[Bank] Create Account Failure', props<{ error: string }>());

// Deposit
export const deposit = createAction(
  '[Bank] Deposit',
  props<{ accountId: string; currency: string; amount: number }>()
);
export const depositSuccess = createAction('[Bank] Deposit Success', props<{ account: Account }>());
export const depositFailure = createAction('[Bank] Deposit Failure', props<{ error: string }>());

// Debit
export const debit = createAction(
  '[Bank] Debit',
  props<{ accountId: string; currency: string; amount: number }>()
);
export const debitSuccess = createAction('[Bank] Debit Success', props<{ account: Account }>());
export const debitFailure = createAction('[Bank] Debit Failure', props<{ error: string }>());

// Exchange
export const exchange = createAction(
  '[Bank] Exchange',
  props<{ sourceAccountId: string; destAccountId: string; amount: number }>()
);
export const exchangeSuccess = createAction('[Bank] Exchange Success', props<{ response: ExchangeResponse }>());
export const exchangeFailure = createAction('[Bank] Exchange Failure', props<{ error: string }>());

// Select Account / Load details
export const selectAccount = createAction('[Bank] Select Account', props<{ accountId: string }>());
export const loadAccountDetails = createAction('[Bank] Load Account Details', props<{ accountId: string }>());
export const loadAccountDetailsSuccess = createAction('[Bank] Load Account Details Success', props<{ account: Account }>());
export const loadAccountDetailsFailure = createAction('[Bank] Load Account Details Failure', props<{ error: string }>());

// Load Transactions (Paginated)
export const loadTransactions = createAction(
  '[Bank] Load Transactions',
  props<{ accountId: string; page: number; size?: number; append?: boolean }>()
);
export const loadTransactionsSuccess = createAction(
  '[Bank] Load Transactions Success',
  props<{ pageData: Page<Transaction>; append: boolean }>()
);
export const loadTransactionsFailure = createAction('[Bank] Load Transactions Failure', props<{ error: string }>());

// Load All Transactions (for Chart)
export const loadAllTransactions = createAction('[Bank] Load All Transactions', props<{ accountId: string }>());
export const loadAllTransactionsSuccess = createAction(
  '[Bank] Load All Transactions Success',
  props<{ transactions: Transaction[] }>()
);
export const loadAllTransactionsFailure = createAction('[Bank] Load All Transactions Failure', props<{ error: string }>());
