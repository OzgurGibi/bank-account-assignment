import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Account, Currency, Transaction } from '../../core/models/bank.models';
import * as BankActions from '../../core/store/bank.actions';
import * as BankSelectors from '../../core/store/bank.selectors';
import { ApiService } from '../../core/services/api.service';
import { Chart } from 'chart.js/auto';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.css']
})
export class AccountDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  account$: Observable<Account | null>;
  transactions$: Observable<Transaction[]>;
  allAccounts$: Observable<Account[]>;
  loadingTransactions$: Observable<boolean>;
  loadingOperations$: Observable<boolean>;
  error$: Observable<string | null>;
  hasMore$: Observable<boolean>;
  currentPage$: Observable<number>;

  accountId!: string;
  chart: Chart | null = null;

  private actions$ = inject(Actions);

  // Subscriptions
  private routeSub!: Subscription;
  private chartSub!: Subscription;
  private operationsSub!: Subscription;

  // Modal controls & forms
  showDepositModal = false;
  showDebitModal = false;
  showTransferModal = false;

  depositAmount = 0;
  debitAmount = 0;
  transferAmount = 0;
  transferTargetAccountId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private apiService: ApiService
  ) {
    this.account$ = this.store.select(BankSelectors.selectSelectedAccount);
    this.transactions$ = this.store.select(BankSelectors.selectTransactions);
    this.allAccounts$ = this.store.select(BankSelectors.selectAllAccounts);
    this.loadingTransactions$ = this.store.select(BankSelectors.selectLoadingTransactions);
    this.loadingOperations$ = this.store.select(BankSelectors.selectLoadingOperations);
    this.error$ = this.store.select(BankSelectors.selectBankError);
    this.hasMore$ = this.store.select(BankSelectors.selectHasMoreTransactions);
    this.currentPage$ = this.store.select(BankSelectors.selectTransactionsPage);
  }

  ngOnInit(): void {
    // Load accounts list in background if not already loaded (needed for transfer target list)
    this.store.dispatch(BankActions.loadAccounts({}));

    this.routeSub = this.route.params.subscribe(params => {
      this.accountId = params['id'];
      this.store.dispatch(BankActions.selectAccount({ accountId: this.accountId }));
      this.store.dispatch(BankActions.loadAccountDetails({ accountId: this.accountId }));
      this.store.dispatch(BankActions.loadTransactions({ accountId: this.accountId, page: 0 }));
      this.store.dispatch(BankActions.loadAllTransactions({ accountId: this.accountId }));
    });

    // Automatically refresh transactions & chart on operation success, and close modals
    this.operationsSub = this.actions$.pipe(
      ofType(BankActions.depositSuccess, BankActions.debitSuccess, BankActions.exchangeSuccess)
    ).subscribe(() => {
      this.store.dispatch(BankActions.loadTransactions({ accountId: this.accountId, page: 0 }));
      this.store.dispatch(BankActions.loadAllTransactions({ accountId: this.accountId }));
      this.closeDepositModal();
      this.closeDebitModal();
      this.closeTransferModal();
    });
  }

  ngAfterViewInit(): void {
    // Listen to all transactions and selected account to draw/update chart
    this.chartSub = combineLatest([
      this.store.select(BankSelectors.selectAllTransactionsForChart),
      this.account$.pipe(filter(acc => acc !== null))
    ]).subscribe(([transactions, account]) => {
      this.updateChart(transactions, account!);
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.chartSub) this.chartSub.unsubscribe();
    if (this.operationsSub) this.operationsSub.unsubscribe();
    if (this.chart) this.chart.destroy();
  }

  // Infinite Scroll Event Handler
  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const scrollPercent = (element.scrollTop + element.clientHeight) / element.scrollHeight;

    // Trigger load when scrolled to 90% of list
    if (scrollPercent >= 0.9) {
      combineLatest([
        this.hasMore$,
        this.loadingTransactions$,
        this.currentPage$
      ]).subscribe(([hasMore, loading, page]) => {
        if (hasMore && !loading) {
          this.store.dispatch(
            BankActions.loadTransactions({
              accountId: this.accountId,
              page: page + 1,
              append: true
            })
          );
        }
      }).unsubscribe();
    }
  }

  // Operation Actions
  openDepositModal(): void {
    this.showDepositModal = true;
    this.depositAmount = 0;
  }

  closeDepositModal(): void {
    this.showDepositModal = false;
  }

  submitDeposit(currency: Currency): void {
    if (this.depositAmount <= 0) return;
    this.store.dispatch(BankActions.deposit({
      accountId: this.accountId,
      currency,
      amount: this.depositAmount
    }));
  }

  openDebitModal(): void {
    this.showDebitModal = true;
    this.debitAmount = 0;
  }

  closeDebitModal(): void {
    this.showDebitModal = false;
  }

  submitDebit(currency: Currency): void {
    if (this.debitAmount <= 0) return;
    this.store.dispatch(BankActions.debit({
      accountId: this.accountId,
      currency,
      amount: this.debitAmount
    }));
  }

  openTransferModal(): void {
    this.showTransferModal = true;
    this.transferAmount = 0;
    this.transferTargetAccountId = '';
  }

  closeTransferModal(): void {
    this.showTransferModal = false;
  }

  submitTransfer(): void {
    if (this.transferAmount <= 0 || !this.transferTargetAccountId) return;
    this.store.dispatch(BankActions.exchange({
      sourceAccountId: this.accountId,
      destAccountId: this.transferTargetAccountId,
      amount: this.transferAmount
    }));
  }

  // Chart Rendering
  private updateChart(transactions: Transaction[], account: Account): void {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    // Prepare data points
    // Sort transactions chronologically for the chart
    let dataPoints: { x: string; y: number }[] = [];
    
    // Add starting point (0 balance or prior balance)
    if (transactions.length === 0) {
      dataPoints.push({ x: 'Start', y: account.balance });
    } else {
      // Calculate historical sequence
      transactions.forEach((tx) => {
        const date = new Date(tx.timestamp);
        const formattedDate = date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        dataPoints.push({ x: formattedDate, y: tx.balanceAfter });
      });
    }

    // Limit to last 15 points to keep chart readable
    if (dataPoints.length > 15) {
      dataPoints = dataPoints.slice(dataPoints.length - 15);
    }

    const labels = dataPoints.map(p => p.x);
    const data = dataPoints.map(p => p.y);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Account Balance',
          data: data,
          borderColor: '#ff7300', // Swedbank Orange
          backgroundColor: 'rgba(255, 115, 0, 0.05)',
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointBackgroundColor: '#ff7300',
          pointBorderColor: '#ffffff',
          pointHoverRadius: 6,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#100d20',
            titleColor: '#f3f4f6',
            bodyColor: '#f3f4f6',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y !== null && context.parsed.y !== undefined 
                  ? context.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                  : '0.00';
                return `Balance: ${this.getCurrencySymbol(account.currency)}${value}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9ca3af', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9ca3af', font: { size: 10 } }
          }
        }
      }
    });
  }

  // Helper selectors
  getFilteredAccounts(currentAccountId: string): Observable<Account[]> {
    return this.allAccounts$.pipe(
      map(accounts => accounts.filter(acc => acc.id !== currentAccountId))
    );
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

  getTransactionIconClass(type: string): string {
    switch (type) {
      case 'DEPOSIT': return 'tx-icon-deposit';
      case 'DEBIT': return 'tx-icon-debit';
      case 'EXCHANGE_OUT': return 'tx-icon-exchange-out';
      case 'EXCHANGE_IN': return 'tx-icon-exchange-in';
      default: return 'tx-icon-generic';
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

  getTransactionAmountSign(type: string): string {
    return (type === 'DEPOSIT' || type === 'EXCHANGE_IN') ? '+' : '-';
  }

  navigateToDashboard(): void {
    this.router.navigate(['/']);
  }

  viewTransactionDetails(txId: string): void {
    this.router.navigate(['/transaction', txId]);
  }
}
