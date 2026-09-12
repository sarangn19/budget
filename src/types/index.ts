export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export type AccountType = 'bank' | 'cash' | 'wallet' | 'savings' | 'other';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: number;
  currentBalance: number;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault: boolean;
  sortOrder: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  date: string;
  note: string;
  isRecurring: boolean;
  recurringId?: string;
  debtId?: string;
  goalId?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  name: string;
  originalAmount: number;
  currentAmount: number;
  interestRate: number;
  minimumPayment: number;
  emiAmount: number;
  dueDate: string;
  remainingPayments: number;
  accountId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  date: string;
  notes: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  month: string;
  expectedIncome: number;
  essentialExpenses: number;
  variableExpenses: number;
  debtPayments: number;
  savings: number;
  personalSpending: number;
  emergencyBuffer: number;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  frequency: RecurrenceFrequency;
  startDate: string;
  nextDueDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  type: 'debt' | 'bill' | 'savings' | 'recurring' | 'review';
  relatedId?: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface FinancialPlan {
  month: string;
  expectedIncome: number;
  essentialExpenses: number;
  variableExpenses: number;
  debtPayments: number;
  savings: number;
  personalSpending: number;
  emergencyBuffer: number;
}

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

export interface AppSettings {
  currency: Currency;
  safetyBuffer: number;
  dateFormat: string;
  salaryDay: number;
  hasOnboarded: boolean;
}
