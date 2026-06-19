import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AccountDetailComponent } from './pages/account-detail/account-detail.component';
import { TransactionDetailComponent } from './pages/transaction-detail/transaction-detail.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'account/:id', component: AccountDetailComponent },
  { path: 'transaction/:id', component: TransactionDetailComponent },
  { path: '**', redirectTo: '' }
];
