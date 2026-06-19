export type Currency = 'EUR' | 'USD' | 'SEK' | 'GBP' | 'VND';

export type TransactionType = 'DEPOSIT' | 'DEBIT' | 'EXCHANGE_OUT' | 'EXCHANGE_IN';

export interface Account {
  id: string;
  name: string;
  currency: Currency;
  balance: number;
  owner: string;
  cardNumber: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  balanceAfter: number;
  description: string;
  timestamp: string; // ISO string
}

export interface ExchangeResponse {
  sourceAccount: Account;
  destAccount: Account;
  sourceAmount: number;
  destAmount: number;
  rate: number;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}
