import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import * as BankActions from './bank.actions';

@Injectable()
export class BankEffects {
  private actions$ = inject(Actions);
  private apiService = inject(ApiService);

  constructor() {}

  loadAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BankActions.loadAccounts),
      switchMap(({ owner }) =>
        this.apiService.getAccounts(owner).pipe(
          map(accounts => BankActions.loadAccountsSuccess({ accounts })),
          catchError(err => of(BankActions.loadAccountsFailure({ error: this.getErrorMessage(err) })))
        )
      )
    )
  );

  createAccount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BankActions.createAccount),
      mergeMap(({ name, currency, owner }) =>
        this.apiService.createAccount(name, currency, owner).pipe(
          map(account => BankActions.createAccountSuccess({ account })),
          catchError(err => of(BankActions.createAccountFailure({ error: this.getErrorMessage(err) })))
        )
      )
    )
  );

  deposit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BankActions.deposit),
      mergeMap(({ accountId, currency, amount }) =>
        this.apiService.deposit(accountId, currency, amount).pipe(
          map(account => BankActions.depositSuccess({ account })),
          catchError(err => of(BankActions.depositFailure({ error: this.getErrorMessage(err) })))
        )
      )
    )
  );

  debit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BankActions.debit),
      mergeMap(({ accountId, currency, amount }) =>
        this.apiService.debit(accountId, currency, amount).pipe(
          map(account => BankActions.debitSuccess({ account })),
          catchError(err => of(BankActions.debitFailure({ error: this.getErrorMessage(err) })))
        )
      )
    )
  );

  exchange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BankActions.exchange),
      mergeMap(({ sourceAccountId, destAccountId, amount }) =>
        this.apiService.exchange(sourceAccountId, destAccountId, amount).pipe(
          map(response => BankActions.exchangeSuccess({ response })),
          catchError(err => of(BankActions.exchangeFailure({ error: this.getErrorMessage(err) })))
        )
      )
    )
  );

  loadAccountDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BankActions.loadAccountDetails),
      switchMap(({ accountId }) =>
        this.apiService.getAccount(accountId).pipe(
          map(account => BankActions.loadAccountDetailsSuccess({ account })),
          catchError(err => of(BankActions.loadAccountDetailsFailure({ error: this.getErrorMessage(err) })))
        )
      )
    )
  );

  loadTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BankActions.loadTransactions),
      switchMap(({ accountId, page, size, append }) =>
        this.apiService.getTransactions(accountId, page, size || 10).pipe(
          map(pageData => BankActions.loadTransactionsSuccess({ pageData, append: !!append })),
          catchError(err => of(BankActions.loadTransactionsFailure({ error: this.getErrorMessage(err) })))
        )
      )
    )
  );

  loadAllTransactions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BankActions.loadAllTransactions),
      switchMap(({ accountId }) =>
        this.apiService.getAllTransactions(accountId).pipe(
          map(transactions => BankActions.loadAllTransactionsSuccess({ transactions })),
          catchError(err => of(BankActions.loadAllTransactionsFailure({ error: this.getErrorMessage(err) })))
        )
      )
    )
  );

  private getErrorMessage(error: any): string {
    if (error && error.error && error.error.message) {
      return error.error.message;
    }
    return error?.message || 'An error occurred during the request.';
  }
}
