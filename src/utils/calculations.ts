import type {
  Account,
  Transaction,
  Debt,
  DebtPayment,
  Budget,
  Goal,
  FilterOptions,
} from '../types';
import { getStartOfMonth, getEndOfMonth, isDateInRange, getToday } from './helpers';

export const calculateAccountBalance = (
  account: Account,
  transactions: Transaction[]
): number => {
  let balance = account.openingBalance;
  const relevantTransactions = transactions.filter((t) => t.accountId === account.id);

  for (const t of relevantTransactions) {
    if (t.type === 'income') {
      balance += t.amount;
    } else if (t.type === 'expense') {
      balance -= t.amount;
    }
  }

  // Also check transfers TO this account
  const transfersIn = transactions.filter(
    (t) => t.type === 'transfer' && t.toAccountId === account.id
  );
  for (const t of transfersIn) {
    balance += t.amount;
  }

  // And transfers FROM this account
  const transfersOut = transactions.filter(
    (t) => t.type === 'transfer' && t.accountId === account.id && t.toAccountId
  );
  for (const t of transfersOut) {
    balance -= t.amount;
  }

  return balance;
};

export const calculateTotalBalance = (
  accounts: Account[],
  transactions: Transaction[]
): number => {
  return accounts.reduce((total, account) => {
    return total + calculateAccountBalance(account, transactions);
  }, 0);
};

export const calculateMonthlyIncome = (
  transactions: Transaction[],
  month?: string
): number => {
  const monthKey = month || getStartOfMonth();
  const start = getStartOfMonth(new Date(monthKey));
  const end = getEndOfMonth(new Date(monthKey));

  return transactions
    .filter((t) => t.type === 'income' && isDateInRange(t.date, start, end))
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateMonthlyExpenses = (
  transactions: Transaction[],
  month?: string
): number => {
  const monthKey = month || getStartOfMonth();
  const start = getStartOfMonth(new Date(monthKey));
  const end = getEndOfMonth(new Date(monthKey));

  return transactions
    .filter((t) => t.type === 'expense' && isDateInRange(t.date, start, end))
    .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateNetCashFlow = (
  transactions: Transaction[],
  month?: string
): number => {
  return (
    calculateMonthlyIncome(transactions, month) -
    calculateMonthlyExpenses(transactions, month)
  );
};

export const calculateTotalDebt = (debts: Debt[]): number => {
  return debts.reduce((total, debt) => total + debt.currentAmount, 0);
};

export const calculateDebtRepaid = (debts: Debt[]): number => {
  return debts.reduce((total, debt) => total + (debt.originalAmount - debt.currentAmount), 0);
};

export const calculateDebtProgress = (debts: Debt[]): number => {
  const totalOriginal = debts.reduce((sum, d) => sum + d.originalAmount, 0);
  const totalRepaid = calculateDebtRepaid(debts);
  if (totalOriginal === 0) return 100;
  return Math.min(100, (totalRepaid / totalOriginal) * 100);
};

export const calculateSafeToSpend = (
  accounts: Account[],
  transactions: Transaction[],
  debts: Debt[],
  _budget: Partial<Budget> | null,
  safetyBuffer: number
): number => {
  const totalBalance = calculateTotalBalance(accounts, transactions);
  const upcomingCommitments = calculateUpcomingCommitments(transactions, debts);

  return Math.max(0, totalBalance - upcomingCommitments - safetyBuffer);
};

export const calculateUpcomingCommitments = (
  transactions: Transaction[],
  debts: Debt[]
): number => {
  const today = getToday();
  const todayDate = new Date(today + 'T00:00:00');
  const nextWeekDate = new Date(todayDate);
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekStr = nextWeekDate.getFullYear() + '-' +
    String(nextWeekDate.getMonth() + 1).padStart(2, '0') + '-' +
    String(nextWeekDate.getDate()).padStart(2, '0');

  let commitments = 0;

  // Upcoming debt payments
  for (const debt of debts) {
    if (debt.dueDate >= today && debt.dueDate <= nextWeekStr) {
      commitments += debt.emiAmount;
    }
  }

  // Upcoming recurring expenses in next 7 days
  commitments += transactions
    .filter((t) => t.isRecurring && t.type === 'expense' && t.date >= today && t.date <= nextWeekStr)
    .reduce((sum, t) => sum + t.amount, 0);

  return commitments;
};

export const calculateSavingsProgress = (goals: Goal[]): number => {
  if (goals.length === 0) return 0;
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  if (totalTarget === 0) return 100;
  return Math.min(100, (totalSaved / totalTarget) * 100);
};

export const calculateGoalProgress = (goal: Goal): number => {
  if (goal.targetAmount === 0) return 100;
  return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
};

export const calculateRequiredMonthlyContribution = (goal: Goal): number => {
  const remaining = goal.targetAmount - goal.currentAmount;
  if (remaining <= 0) return 0;
  const today = getToday();
  const todayDate = new Date(today + 'T00:00:00');
  const targetDate = new Date(goal.targetDate + 'T00:00:00');
  const monthsLeft = Math.max(1,
    (targetDate.getFullYear() - todayDate.getFullYear()) * 12 +
    (targetDate.getMonth() - todayDate.getMonth())
  );
  return Math.ceil(remaining / monthsLeft);
};

export const getSpendingByCategory = (
  transactions: Transaction[],
  month?: string
): { categoryId: string; amount: number; percentage: number }[] => {
  const monthKey = month || getStartOfMonth();
  const start = getStartOfMonth(new Date(monthKey));
  const end = getEndOfMonth(new Date(monthKey));

  const expenses = transactions.filter(
    (t) => t.type === 'expense' && isDateInRange(t.date, start, end)
  );

  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  if (totalExpenses === 0) return [];

  const categoryMap = new Map<string, number>();
  for (const t of expenses) {
    categoryMap.set(t.categoryId, (categoryMap.get(t.categoryId) || 0) + t.amount);
  }

  return Array.from(categoryMap.entries())
    .map(([categoryId, amount]) => ({
      categoryId,
      amount,
      percentage: (amount / totalExpenses) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);
};

export const getMonthlySpendingHistory = (
  transactions: Transaction[],
  months: number = 6
): { month: string; income: number; expenses: number }[] => {
  const result: { month: string; income: number; expenses: number }[] = [];
  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const start = getStartOfMonth(date);
    const end = getEndOfMonth(date);

    const monthIncome = transactions
      .filter((t) => t.type === 'income' && isDateInRange(t.date, start, end))
      .reduce((sum, t) => sum + t.amount, 0);

    const monthExpenses = transactions
      .filter((t) => t.type === 'expense' && isDateInRange(t.date, start, end))
      .reduce((sum, t) => sum + t.amount, 0);

    result.push({
      month: date.toLocaleDateString('en-IN', { month: 'short' }),
      income: monthIncome,
      expenses: monthExpenses,
    });
  }

  return result;
};

export const filterTransactions = (
  transactions: Transaction[],
  filters: FilterOptions
): Transaction[] => {
  return transactions.filter((t) => {
    if (filters.startDate && t.date < filters.startDate) return false;
    if (filters.endDate && t.date > filters.endDate) return false;
    if (filters.accountId && t.accountId !== filters.accountId) return false;
    if (filters.categoryId && t.categoryId !== filters.categoryId) return false;
    if (filters.type && t.type !== filters.type) return false;
    if (filters.minAmount && t.amount < filters.minAmount) return false;
    if (filters.maxAmount && t.amount > filters.maxAmount) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesNote = t.note.toLowerCase().includes(query);
      const matchesAmount = t.amount.toString().includes(query);
      if (!matchesNote && !matchesAmount) return false;
    }
    return true;
  });
};

export const getBudgetStatus = (
  budget: Partial<Budget>
): { status: 'healthy' | 'tight' | 'overspending'; message: string } => {
  const totalPlanned =
    (budget.essentialExpenses || 0) +
    (budget.variableExpenses || 0) +
    (budget.debtPayments || 0) +
    (budget.savings || 0) +
    (budget.personalSpending || 0) +
    (budget.emergencyBuffer || 0);
  const income = budget.expectedIncome || 0;
  const remaining = income - totalPlanned;

  if (remaining > income * 0.1) {
    return { status: 'healthy', message: 'Your plan has a comfortable margin.' };
  } else if (remaining >= 0) {
    return { status: 'tight', message: 'Your plan is tight. Consider reducing variable expenses.' };
  } else {
    return {
      status: 'overspending',
      message: 'Your planned expenses exceed income. Adjust your budget.',
    };
  }
};

export const getUpcomingDebts = (debts: Debt[], days: number = 7): Debt[] => {
  const today = getToday();
  const todayDate = new Date(today + 'T00:00:00');
  const futureDate = new Date(todayDate);
  futureDate.setDate(futureDate.getDate() + days);
  const futureStr = futureDate.getFullYear() + '-' +
    String(futureDate.getMonth() + 1).padStart(2, '0') + '-' +
    String(futureDate.getDate()).padStart(2, '0');

  return debts.filter((d) => d.currentAmount > 0 && d.dueDate >= today && d.dueDate <= futureStr);
};

export const getMonthlyCashFlow = (
  transactions: Transaction[],
  month?: string
): number => {
  const monthKey = month || getStartOfMonth();
  const start = getStartOfMonth(new Date(monthKey));
  const end = getEndOfMonth(new Date(monthKey));

  const monthTransactions = transactions.filter((t) => isDateInRange(t.date, start, end));
  const income = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return income - expenses;
};

export const getCashFlowTimeline = (
  transactions: Transaction[],
  accounts: Account[],
  months: number = 6
): { month: string; label: string; balance: number; income: number; expenses: number }[] => {
  const result: { month: string; label: string; balance: number; income: number; expenses: number }[] = [];
  const today = new Date();

  let openingBalance = accounts.reduce((sum, a) => sum + a.openingBalance, 0);

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const start = getStartOfMonth(date);
    const end = getEndOfMonth(date);

    const monthIncome = transactions
      .filter((t) => t.type === 'income' && isDateInRange(t.date, start, end))
      .reduce((sum, t) => sum + t.amount, 0);

    const monthExpenses = transactions
      .filter((t) => t.type === 'expense' && isDateInRange(t.date, start, end))
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = openingBalance + monthIncome - monthExpenses;

    result.push({
      month: monthKey,
      label: date.toLocaleDateString('en-IN', { month: 'short' }),
      balance,
      income: monthIncome,
      expenses: monthExpenses,
    });

    openingBalance = balance;
  }

  return result;
};

export interface SpendingInsight {
  id: string;
  type: 'warning' | 'tip' | 'positive';
  title: string;
  description: string;
  icon: string;
}

export const getSpendingInsights = (
  transactions: Transaction[],
  debts: Debt[],
  goals: Goal[],
  accounts: Account[],
  safetyBuffer: number
): SpendingInsight[] => {
  const insights: SpendingInsight[] = [];
  const today = getToday();
  const todayDate = new Date(today + 'T00:00:00');

  // Current month spending
  const currentMonthStart = getStartOfMonth();
  const currentMonthExpenses = calculateMonthlyExpenses(transactions, currentMonthStart);
  const currentMonthIncome = calculateMonthlyIncome(transactions, currentMonthStart);

  // Previous month spending
  const prevMonthDate = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
  const prevMonthStart = getStartOfMonth(prevMonthDate);
  const prevMonthExpenses = calculateMonthlyExpenses(transactions, prevMonthStart);

  // Spending trend
  if (prevMonthExpenses > 0) {
    const change = ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100;
    if (change > 10) {
      insights.push({
        id: 'spending-up',
        type: 'warning',
        title: 'Spending is up',
        description: `You're spending ${Math.round(change)}% more than last month. Review your expenses to stay on track.`,
        icon: 'TrendingUp',
      });
    } else if (change < -10) {
      insights.push({
        id: 'spending-down',
        type: 'positive',
        title: 'Great job cutting costs!',
        description: `Your spending dropped ${Math.round(Math.abs(change))}% from last month. Keep it up.`,
        icon: 'TrendingDown',
      });
    }
  }

  // Savings rate
  if (currentMonthIncome > 0) {
    const savingsRate = ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100;
    if (savingsRate < 20) {
      insights.push({
        id: 'low-savings',
        type: 'tip',
        title: 'Boost your savings',
        description: `Your savings rate is ${Math.round(savingsRate)}%. Aim for at least 20% of income.`,
        icon: 'PiggyBank',
      });
    } else if (savingsRate >= 30) {
      insights.push({
        id: 'good-savings',
        type: 'positive',
        title: 'Strong savings rate',
        description: `You're saving ${Math.round(savingsRate)}% of income. Excellent discipline.`,
        icon: 'Target',
      });
    }
  }

  // Safe to spend check
  const safeToSpend = calculateSafeToSpend(accounts, transactions, debts, null, safetyBuffer);
  if (safeToSpend === 0 && currentMonthIncome > 0) {
    insights.push({
      id: 'tight-budget',
      type: 'warning',
      title: 'Tight on funds',
      description: 'Your safe-to-spend is zero after commitments. Consider delaying non-essential purchases.',
      icon: 'AlertTriangle',
    });
  }

  // Goal progress
  const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount);
  if (activeGoals.length > 0) {
    const bestGoal = activeGoals.reduce((best, g) =>
      (g.currentAmount / g.targetAmount) > (best.currentAmount / best.targetAmount) ? g : best
    );
    const progress = Math.round((bestGoal.currentAmount / bestGoal.targetAmount) * 100);
    if (progress >= 50) {
      insights.push({
        id: 'goal-almost',
        type: 'positive',
        title: `${bestGoal.name} is ${progress}% done`,
        description: `You're more than halfway to your ${bestGoal.name} goal. Keep going!`,
        icon: 'CheckCircle',
      });
    }
  }

  // Debt freedom
  const totalDebt = calculateTotalDebt(debts);
  if (totalDebt > 0) {
    const debtProgress = calculateDebtProgress(debts);
    if (debtProgress >= 75) {
      insights.push({
        id: 'debt-almost',
        type: 'positive',
        title: 'Almost debt-free',
        description: `You've paid off ${Math.round(debtProgress)}% of your total debt. The finish line is close.`,
        icon: 'CheckCircle',
      });
    }
  }

  return insights.slice(0, 4);
};

export const getDaysUntilSalary = (salaryDay: number): number => {
  const today = new Date();
  const currentDay = today.getDate();

  if (currentDay === salaryDay) return 0;

  if (currentDay < salaryDay) {
    return salaryDay - currentDay;
  }

  // Salary day has passed this month, calculate days until next month's salary day
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, salaryDay);
  const diffMs = nextMonth.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};
