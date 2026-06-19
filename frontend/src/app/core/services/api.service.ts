import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, Transaction, ExchangeResponse, Page } from '../models/bank.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getAccounts(owner: string = 'Özgür'): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/accounts?owner=${owner}`);
  }

  getAccount(id: string): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/accounts/${id}`);
  }

  createAccount(name: string, currency: string, owner: string = 'Özgür'): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/accounts`, { name, currency, owner });
  }

  deposit(id: string, currency: string, amount: number): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/accounts/${id}/deposit`, { currency, amount });
  }

  debit(id: string, currency: string, amount: number): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/accounts/${id}/debit`, { currency, amount });
  }

  exchange(sourceAccountId: string, destAccountId: string, amount: number): Observable<ExchangeResponse> {
    return this.http.post<ExchangeResponse>(`${this.baseUrl}/accounts/exchange`, {
      sourceAccountId,
      destAccountId,
      amount
    });
  }

  getTransactions(accountId: string, page: number = 0, size: number = 10): Observable<Page<Transaction>> {
    return this.http.get<Page<Transaction>>(`${this.baseUrl}/accounts/${accountId}/transactions?page=${page}&size=${size}`);
  }

  getAllTransactions(accountId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/accounts/${accountId}/transactions/all`);
  }

  getTransaction(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.baseUrl}/transactions/${id}`);
  }

  getPdfReceiptUrl(id: string): string {
    return `${this.baseUrl}/transactions/${id}/pdf`;
  }
}
