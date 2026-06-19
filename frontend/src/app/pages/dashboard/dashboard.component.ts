import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Account, Currency } from '../../core/models/bank.models';
import * as BankActions from '../../core/store/bank.actions';
import * as BankSelectors from '../../core/store/bank.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  accounts$: Observable<Account[]>;
  loadingAccounts$: Observable<boolean>;
  loadingOperations$: Observable<boolean>;
  error$: Observable<string | null>;

  // Form Fields
  showCreateModal = false;
  newAccountName = '';
  newAccountCurrency: Currency = 'EUR';
  currencies: Currency[] = ['EUR', 'USD', 'SEK', 'GBP', 'VND'];

  constructor(
    private store: Store,
    private router: Router
  ) {
    this.accounts$ = this.store.select(BankSelectors.selectAllAccounts);
    this.loadingAccounts$ = this.store.select(BankSelectors.selectLoadingAccounts);
    this.loadingOperations$ = this.store.select(BankSelectors.selectLoadingOperations);
    this.error$ = this.store.select(BankSelectors.selectBankError);
  }

  ngOnInit(): void {
    this.store.dispatch(BankActions.loadAccounts({}));
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.newAccountName = '';
    this.newAccountCurrency = 'EUR';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  onSubmitCreate(): void {
    if (!this.newAccountName.trim()) return;

    this.store.dispatch(
      BankActions.createAccount({
        name: this.newAccountName,
        currency: this.newAccountCurrency
      })
    );
    this.closeCreateModal();
  }

  navigateToAccount(accountId: string): void {
    this.store.dispatch(BankActions.selectAccount({ accountId }));
    this.router.navigate(['/account', accountId]);
  }

  getCurrencySymbol(currency: Currency): string {
    switch (currency) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'SEK': return 'kr';
      case 'VND': return '₫';
      default: return '';
    }
  }

  formatCardNumber(cardNumber: string): string {
    if (!cardNumber) return '•••• •••• •••• ••••';
    const last4 = cardNumber.substring(cardNumber.length - 4);
    return `•••• •••• •••• ${last4}`;
  }
}
