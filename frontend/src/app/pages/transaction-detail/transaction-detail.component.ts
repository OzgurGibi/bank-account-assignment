import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Transaction, Account, Currency } from '../../core/models/bank.models';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.css']
})
export class TransactionDetailComponent implements OnInit, OnDestroy {
  transactionId!: string;
  transaction: Transaction | null = null;
  account: Account | null = null;
  loading = true;
  error: string | null = null;

  private routeSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => {
      this.transactionId = params['id'];
      this.loadTransactionDetails();
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  loadTransactionDetails(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getTransaction(this.transactionId).subscribe({
      next: (tx) => {
        this.transaction = tx;
        // Load the related account details
        this.apiService.getAccount(tx.accountId).subscribe({
          next: (acc) => {
            this.account = acc;
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to load account details', err);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Failed to load transaction details', err);
        this.error = 'Transaction not found or could not be loaded.';
        this.loading = false;
      }
    });
  }

  downloadPdf(): void {
    if (!this.transaction) return;
    const downloadUrl = this.apiService.getPdfReceiptUrl(this.transactionId);
    window.open(downloadUrl, '_blank');
  }

  goBack(): void {
    if (this.transaction) {
      this.router.navigate(['/account', this.transaction.accountId]);
    } else {
      this.router.navigate(['/']);
    }
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

  getTransactionLabel(type: string): string {
    switch (type) {
      case 'DEPOSIT': return 'Deposit';
      case 'DEBIT': return 'Debit / Withdrawal';
      case 'EXCHANGE_OUT': return 'Transfer Out (Exchange)';
      case 'EXCHANGE_IN': return 'Transfer In (Exchange)';
      default: return 'Transaction';
    }
  }

  getTransactionIconClass(type: string): string {
    switch (type) {
      case 'DEPOSIT': return 'tx-icon-deposit';
      case 'DEBIT': return 'tx-icon-debit';
      case 'EXCHANGE_OUT': return 'tx-icon-exchange-out';
      case 'EXCHANGE_IN': return 'tx-icon-exchange-in';
      default: return 'tx-icon-generic';
    }
  }

  getTransactionAmountSign(type: string): string {
    return (type === 'DEPOSIT' || type === 'EXCHANGE_IN') ? '+' : '-';
  }
}
