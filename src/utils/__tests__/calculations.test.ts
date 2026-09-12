import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateAccountBalance,
  calculateTotalBalance,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateNetCashFlow,
  calculateTotalDebt,
  calculateDebtRepaid,
  calculateDebtProgress,
  calculateSafeToSpend,
  calculateUpcomingCommitments,
  calculateSavingsProgress,
  calculateGoalProgress,
  calculateRequiredMonthlyContribution,
  getSpendingByCategory,
  getMonthlySpendingHistory,
  getBudgetStatus,
  getUpcomingDebts,
  getMonthlyCashFlow,
  filterTransactions,
} from '../calculations';
import { getStartOfMonth, getEndOfMonth, getToday } from '../helpers';
import type { Account, Transaction, Debt, Goal, Budget } from '../../types';

// Helper to create dates relative to today
const today = new Date();
const todayStr = getToday();
const monthStart = getStartOfMonth();
const monthEnd = getEndOfMonth();

const makeDate = (daysOffset: number): string => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const makeMonthDate = (monthOffset: number, day: number = 15): string => {
  const d = new Date(today.getFullYear(), today.getMonth() + monthOffset, day);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dayStr}`;
};

// Fixtures
const account1: Account = {
  id: 'acc-1',
  name: 'Bank Account',
  type: 'bank',
  openingBalance: 10000,
  currentBalance: 10000,
  currency: 'INR',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const account2: Account = {
  id: 'acc-2',
  name: 'Cash',
  type: 'cash',
  openingBalance: 2000,
  currentBalance: 2000,
  currency: 'INR',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const incomeTx: Transaction = {
  id: 'tx-1',
  amount: 50000,
  type: 'income',
  categoryId: 'cat-salary',
  accountId: 'acc-1',
  date: todayStr,
  note: 'Salary',
  isRecurring: false,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const expenseTx: Transaction = {
  id: 'tx-2',
  amount: 500,
  type: 'expense',
  categoryId: 'cat-food',
  accountId: 'acc-1',
  date: todayStr,
  note: 'Lunch',
  isRecurring: false,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const transferTx: Transaction = {
  id: 'tx-3',
  amount: 3000,
  type: 'transfer',
  categoryId: 'cat-transfer',
  accountId: 'acc-1',
  toAccountId: 'acc-2',
  date: todayStr,
  note: 'Transfer to cash',
  isRecurring: false,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const debt1: Debt = {
  id: 'debt-1',
  name: 'Credit Card',
  originalAmount: 50000,
  currentAmount: 30000,
  interestRate: 18,
  minimumPayment: 2000,
  emiAmount: 5000,
  dueDate: makeDate(3),
  remainingPayments: 6,
  notes: '',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const debt2: Debt = {
  id: 'debt-2',
  name: 'Personal Loan',
  originalAmount: 100000,
  currentAmount: 60000,
  interestRate: 12,
  minimumPayment: 5000,
  emiAmount: 10000,
  dueDate: makeDate(10),
  remainingPayments: 6,
  notes: '',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('calculateAccountBalance', () => {
  it('returns opening balance with no transactions', () => {
    expect(calculateAccountBalance(account1, [])).toBe(10000);
  });

  it('adds income to balance', () => {
    expect(calculateAccountBalance(account1, [incomeTx])).toBe(60000);
  });

  it('subtracts expense from balance', () => {
    expect(calculateAccountBalance(account1, [expenseTx])).toBe(9500);
  });

  it('subtracts transfer out', () => {
    expect(calculateAccountBalance(account1, [transferTx])).toBe(7000);
  });

  it('adds transfer in', () => {
    expect(calculateAccountBalance(account2, [transferTx])).toBe(5000);
  });

  it('handles combined transactions correctly', () => {
    const txs = [incomeTx, expenseTx, transferTx];
    // 10000 + 50000 - 500 - 3000 = 56500
    expect(calculateAccountBalance(account1, txs)).toBe(56500);
  });

  it('handles zero balance', () => {
    const zeroAccount = { ...account1, openingBalance: 0 };
    expect(calculateAccountBalance(zeroAccount, [])).toBe(0);
  });

  it('handles negative balance', () => {
    const bigExpense = { ...expenseTx, amount: 15000 };
    // 10000 - 15000 = -5000
    expect(calculateAccountBalance(account1, [bigExpense])).toBe(-5000);
  });

  it('ignores transactions for other accounts', () => {
    const otherTx = { ...incomeTx, accountId: 'acc-other' };
    expect(calculateAccountBalance(account1, [otherTx])).toBe(10000);
  });
});

describe('calculateTotalBalance', () => {
  it('returns 0 with no accounts', () => {
    expect(calculateTotalBalance([], [])).toBe(0);
  });

  it('sums balances across multiple accounts', () => {
    expect(calculateTotalBalance([account1, account2], [])).toBe(12000);
  });

  it('correctly handles transfers between accounts in total', () => {
    // Transfer 3000 from acc1 to acc2
    // acc1: 10000 - 3000 = 7000
    // acc2: 2000 + 3000 = 5000
    // Total: 12000 (unchanged)
    expect(calculateTotalBalance([account1, account2], [transferTx])).toBe(12000);
  });
});

describe('calculateMonthlyIncome', () => {
  it('returns 0 with no transactions', () => {
    expect(calculateMonthlyIncome([])).toBe(0);
  });

  it('sums income in current month', () => {
    expect(calculateMonthlyIncome([incomeTx])).toBe(50000);
  });

  it('excludes expenses from income', () => {
    expect(calculateMonthlyIncome([expenseTx])).toBe(0);
  });

  it('excludes transfers from income', () => {
    expect(calculateMonthlyIncome([transferTx])).toBe(0);
  });

  it('excludes income from other months', () => {
    const oldTx = { ...incomeTx, date: '2025-01-15' };
    expect(calculateMonthlyIncome([oldTx])).toBe(0);
  });
});

describe('calculateMonthlyExpenses', () => {
  it('returns 0 with no transactions', () => {
    expect(calculateMonthlyExpenses([])).toBe(0);
  });

  it('sums expenses in current month', () => {
    expect(calculateMonthlyExpenses([expenseTx])).toBe(500);
  });

  it('excludes income from expenses', () => {
    expect(calculateMonthlyExpenses([incomeTx])).toBe(0);
  });

  it('excludes transfers from expenses', () => {
    expect(calculateMonthlyExpenses([transferTx])).toBe(0);
  });
});

describe('calculateNetCashFlow', () => {
  it('returns 0 with no transactions', () => {
    expect(calculateNetCashFlow([])).toBe(0);
  });

  it('calculates income minus expenses', () => {
    expect(calculateNetCashFlow([incomeTx, expenseTx])).toBe(49500);
  });

  it('returns negative when expenses exceed income', () => {
    const bigExpense = { ...expenseTx, amount: 60000 };
    expect(calculateNetCashFlow([incomeTx, bigExpense])).toBe(-10000);
  });
});

describe('calculateTotalDebt', () => {
  it('returns 0 with no debts', () => {
    expect(calculateTotalDebt([])).toBe(0);
  });

  it('sums current amounts', () => {
    expect(calculateTotalDebt([debt1, debt2])).toBe(90000);
  });
});

describe('calculateDebtRepaid', () => {
  it('returns 0 with no debts', () => {
    expect(calculateDebtRepaid([])).toBe(0);
  });

  it('calculates total repaid across debts', () => {
    // debt1: 50000 - 30000 = 20000 repaid
    // debt2: 100000 - 60000 = 40000 repaid
    expect(calculateDebtRepaid([debt1, debt2])).toBe(60000);
  });
});

describe('calculateDebtProgress', () => {
  it('returns 100 with no debts', () => {
    expect(calculateDebtProgress([])).toBe(100);
  });

  it('calculates percentage repaid', () => {
    // total original: 150000, total repaid: 60000
    // progress: 60000/150000 * 100 = 40%
    expect(calculateDebtProgress([debt1, debt2])).toBe(40);
  });

  it('returns 100 when fully paid', () => {
    const paidDebt = { ...debt1, currentAmount: 0 };
    expect(calculateDebtProgress([paidDebt])).toBe(100);
  });

  it('caps at 100', () => {
    const overpaid = { ...debt1, currentAmount: -5000 };
    expect(calculateDebtProgress([overpaid])).toBe(100);
  });
});

describe('calculateSafeToSpend', () => {
  it('returns 0 with no accounts', () => {
    expect(calculateSafeToSpend([], [], [], null, 2000)).toBe(0);
  });

  it('subtracts safety buffer from balance', () => {
    // balance: 10000, buffer: 2000 => 8000
    expect(calculateSafeToSpend([account1], [], [], null, 2000)).toBe(8000);
  });

  it('subtracts upcoming commitments', () => {
    // debt due in 3 days with emi 5000
    // balance: 10000, commitments: 5000, buffer: 2000 => 3000
    expect(calculateSafeToSpend([account1], [], [debt1], null, 2000)).toBe(3000);
  });

  it('never returns negative', () => {
    // account1 balance: 10000, buffer: 5000 => 10000 - 5000 = 5000
    expect(calculateSafeToSpend([account1], [], [], null, 5000)).toBe(5000);
    // With huge buffer exceeding balance
    expect(calculateSafeToSpend([account1], [], [], null, 20000)).toBe(0);
  });

  it('does NOT subtract planned expenses (budget)', () => {
    // The simplified formula ignores budget
    const budget: Partial<Budget> = {
      essentialExpenses: 10000,
      variableExpenses: 5000,
      personalSpending: 3000,
    };
    // balance: 10000, buffer: 2000 => 8000 (budget ignored)
    expect(calculateSafeToSpend([account1], [], [], budget, 2000)).toBe(8000);
  });
});

describe('calculateUpcomingCommitments', () => {
  it('returns 0 with no debts or recurring', () => {
    expect(calculateUpcomingCommitments([], [])).toBe(0);
  });

  it('includes debt payments due within 7 days', () => {
    expect(calculateUpcomingCommitments([], [debt1])).toBe(5000);
  });

  it('excludes debt payments due after 7 days', () => {
    expect(calculateUpcomingCommitments([], [debt2])).toBe(0);
  });

  it('includes recurring expenses due within 7 days', () => {
    const recurringTx = {
      ...expenseTx,
      isRecurring: true,
      date: makeDate(2),
    };
    expect(calculateUpcomingCommitments([recurringTx], [])).toBe(500);
  });
});

describe('calculateSavingsProgress', () => {
  it('returns 0 with no goals', () => {
    expect(calculateSavingsProgress([])).toBe(0);
  });

  it('calculates overall progress', () => {
    const goals: Goal[] = [
      { id: '1', name: 'A', targetAmount: 100000, currentAmount: 50000, targetDate: '2027-01-01', monthlyContribution: 0, icon: '🎯', createdAt: '', updatedAt: '' },
      { id: '2', name: 'B', targetAmount: 50000, currentAmount: 25000, targetDate: '2027-01-01', monthlyContribution: 0, icon: '🏠', createdAt: '', updatedAt: '' },
    ];
    // total target: 150000, total saved: 75000 => 50%
    expect(calculateSavingsProgress(goals)).toBe(50);
  });
});

describe('calculateGoalProgress', () => {
  it('returns 100 with zero target', () => {
    const goal: Goal = { id: '1', name: 'A', targetAmount: 0, currentAmount: 0, targetDate: '2027-01-01', monthlyContribution: 0, icon: '🎯', createdAt: '', updatedAt: '' };
    expect(calculateGoalProgress(goal)).toBe(100);
  });

  it('calculates progress correctly', () => {
    const goal: Goal = { id: '1', name: 'A', targetAmount: 100000, currentAmount: 75000, targetDate: '2027-01-01', monthlyContribution: 0, icon: '🎯', createdAt: '', updatedAt: '' };
    expect(calculateGoalProgress(goal)).toBe(75);
  });

  it('caps at 100', () => {
    const goal: Goal = { id: '1', name: 'A', targetAmount: 50000, currentAmount: 60000, targetDate: '2027-01-01', monthlyContribution: 0, icon: '🎯', createdAt: '', updatedAt: '' };
    expect(calculateGoalProgress(goal)).toBe(100);
  });
});

describe('calculateRequiredMonthlyContribution', () => {
  it('returns 0 when goal is already met', () => {
    const goal: Goal = { id: '1', name: 'A', targetAmount: 50000, currentAmount: 50000, targetDate: makeDate(30), monthlyContribution: 0, icon: '🎯', createdAt: '', updatedAt: '' };
    expect(calculateRequiredMonthlyContribution(goal)).toBe(0);
  });

  it('calculates required monthly for future goal', () => {
    const goal: Goal = { id: '1', name: 'A', targetAmount: 120000, currentAmount: 0, targetDate: makeDate(365), monthlyContribution: 0, icon: '🎯', createdAt: '', updatedAt: '' };
    const result = calculateRequiredMonthlyContribution(goal);
    expect(result).toBeGreaterThan(0);
  });
});

describe('getBudgetStatus', () => {
  it('returns healthy when significant margin', () => {
    const budget: Partial<Budget> = { expectedIncome: 50000, essentialExpenses: 20000, variableExpenses: 5000, debtPayments: 5000, savings: 5000, personalSpending: 2000, emergencyBuffer: 2000 };
    const result = getBudgetStatus(budget);
    expect(result.status).toBe('healthy');
  });

  it('returns tight when marginal', () => {
    const budget: Partial<Budget> = { expectedIncome: 50000, essentialExpenses: 25000, variableExpenses: 10000, debtPayments: 5000, savings: 5000, personalSpending: 3000, emergencyBuffer: 2000 };
    const result = getBudgetStatus(budget);
    expect(result.status).toBe('tight');
  });

  it('returns overspending when over budget', () => {
    const budget: Partial<Budget> = { expectedIncome: 30000, essentialExpenses: 20000, variableExpenses: 10000, debtPayments: 5000, savings: 0, personalSpending: 0, emergencyBuffer: 0 };
    const result = getBudgetStatus(budget);
    expect(result.status).toBe('overspending');
  });

  it('handles zero income with zero expenses (tight)', () => {
    const budget: Partial<Budget> = { expectedIncome: 0, essentialExpenses: 0 };
    const result = getBudgetStatus(budget);
    expect(result.status).toBe('tight');
  });

  it('handles zero income with expenses (overspending)', () => {
    const budget: Partial<Budget> = { expectedIncome: 0, essentialExpenses: 5000 };
    const result = getBudgetStatus(budget);
    expect(result.status).toBe('overspending');
  });
});

describe('getUpcomingDebts', () => {
  it('returns empty with no debts', () => {
    expect(getUpcomingDebts([])).toEqual([]);
  });

  it('returns debts due within days', () => {
    expect(getUpcomingDebts([debt1], 7)).toHaveLength(1);
  });

  it('excludes debts due after range', () => {
    expect(getUpcomingDebts([debt2], 7)).toHaveLength(0);
  });

  it('excludes fully paid debts', () => {
    const paidDebt = { ...debt1, currentAmount: 0 };
    expect(getUpcomingDebts([paidDebt], 7)).toHaveLength(0);
  });
});

describe('getMonthlyCashFlow', () => {
  it('returns 0 with no transactions', () => {
    expect(getMonthlyCashFlow([])).toBe(0);
  });

  it('calculates cash flow correctly', () => {
    expect(getMonthlyCashFlow([incomeTx, expenseTx])).toBe(49500);
  });
});

describe('getSpendingByCategory', () => {
  it('returns empty with no expenses', () => {
    expect(getSpendingByCategory([])).toEqual([]);
  });

  it('groups expenses by category', () => {
    const result = getSpendingByCategory([expenseTx]);
    expect(result).toHaveLength(1);
    expect(result[0].categoryId).toBe('cat-food');
    expect(result[0].amount).toBe(500);
    expect(result[0].percentage).toBe(100);
  });

  it('excludes income transactions', () => {
    expect(getSpendingByCategory([incomeTx])).toEqual([]);
  });
});

describe('filterTransactions', () => {
  const txs: Transaction[] = [
    { ...incomeTx, date: '2026-09-01', amount: 50000 },
    { ...expenseTx, date: '2026-09-05', amount: 500 },
    { ...expenseTx, id: 'tx-4', date: '2026-09-10', amount: 1000, categoryId: 'cat-transport' },
  ];

  it('returns all with empty filters', () => {
    expect(filterTransactions(txs, {})).toHaveLength(3);
  });

  it('filters by type', () => {
    expect(filterTransactions(txs, { type: 'income' })).toHaveLength(1);
    expect(filterTransactions(txs, { type: 'expense' })).toHaveLength(2);
  });

  it('filters by date range', () => {
    expect(filterTransactions(txs, { startDate: '2026-09-05', endDate: '2026-09-05' })).toHaveLength(1);
  });

  it('filters by category', () => {
    expect(filterTransactions(txs, { categoryId: 'cat-food' })).toHaveLength(1);
  });

  it('filters by account', () => {
    expect(filterTransactions(txs, { accountId: 'acc-1' })).toHaveLength(3);
    expect(filterTransactions(txs, { accountId: 'acc-other' })).toHaveLength(0);
  });

  it('filters by min amount', () => {
    expect(filterTransactions(txs, { minAmount: 1000 })).toHaveLength(2);
  });

  it('filters by max amount', () => {
    expect(filterTransactions(txs, { maxAmount: 1000 })).toHaveLength(2);
  });

  it('filters by search query', () => {
    expect(filterTransactions(txs, { searchQuery: 'Salary' })).toHaveLength(1);
    expect(filterTransactions(txs, { searchQuery: 'Lunch' })).toHaveLength(2);
    expect(filterTransactions(txs, { searchQuery: 'lunch' })).toHaveLength(2);
    expect(filterTransactions(txs, { searchQuery: 'xyz' })).toHaveLength(0);
  });
});

describe('Edge cases', () => {
  it('handles ₹0 transactions', () => {
    const zeroTx = { ...expenseTx, amount: 0 };
    expect(calculateAccountBalance(account1, [zeroTx])).toBe(10000);
  });

  it('handles multiple same-day transactions', () => {
    const tx1 = { ...expenseTx, amount: 100 };
    const tx2 = { ...expenseTx, id: 'tx-5', amount: 200 };
    const tx3 = { ...expenseTx, id: 'tx-6', amount: 300 };
    expect(calculateAccountBalance(account1, [tx1, tx2, tx3])).toBe(9400);
  });

  it('handles future-dated transactions', () => {
    const futureTx = { ...expenseTx, date: makeDate(30) };
    expect(calculateMonthlyExpenses([futureTx])).toBe(0); // different month possible
  });

  it('handles transfers as non-income non-expense', () => {
    expect(calculateMonthlyIncome([transferTx])).toBe(0);
    expect(calculateMonthlyExpenses([transferTx])).toBe(0);
    expect(calculateNetCashFlow([transferTx])).toBe(0);
  });

  it('handles debt with zero outstanding', () => {
    const zeroDebt = { ...debt1, currentAmount: 0 };
    expect(calculateTotalDebt([zeroDebt])).toBe(0);
    expect(calculateDebtProgress([zeroDebt])).toBe(100);
  });

  it('handles partial debt payment', () => {
    const partialDebt = { ...debt1, currentAmount: 25000 };
    expect(calculateTotalDebt([partialDebt])).toBe(25000);
    // original: 50000, repaid: 25000 => 50%
    expect(calculateDebtProgress([partialDebt])).toBe(50);
  });
});
