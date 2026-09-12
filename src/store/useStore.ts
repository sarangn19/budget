import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Account,
  Transaction,
  Category,
  Debt,
  DebtPayment,
  Budget,
  Goal,
  RecurringTransaction,
  Reminder,
  FilterOptions,
  AppSettings,
  Currency,
  TransactionType,
  RecurrenceFrequency,
  AccountType,
} from '../types';
import { generateId, getToday, getStartOfMonth, getNextRecurrenceDate } from '../utils/helpers';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_ACCOUNTS,
  DEFAULT_SAFETY_BUFFER,
} from '../utils/defaults';

interface AppState {
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Accounts
  accounts: Account[];
  addAccount: (name: string, type: AccountType, openingBalance: number) => Account;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Categories
  categories: Category[];
  addCategory: (name: string, type: TransactionType, icon: string, color: string) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (ids: string[]) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getFilteredTransactions: (filters: FilterOptions) => Transaction[];

  // Debts
  debts: Debt[];
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>) => Debt;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;

  // Debt Payments
  debtPayments: DebtPayment[];
  addDebtPayment: (payment: Omit<DebtPayment, 'id' | 'createdAt'>) => DebtPayment;
  getDebtPayments: (debtId: string) => DebtPayment[];

  // Budgets
  budgets: Budget[];
  upsertBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  getBudget: (month: string) => Budget | null;

  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  // Recurring Transactions
  recurringTransactions: RecurringTransaction[];
  addRecurringTransaction: (recurring: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  generateRecurringTransactions: () => void;

  // Reminders
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  completeReminder: (id: string) => void;
}

const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Settings
      settings: {
        currency: 'INR' as Currency,
        safetyBuffer: DEFAULT_SAFETY_BUFFER,
        dateFormat: 'dd MMM yyyy',
      },
      updateSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),

      // Accounts
      accounts: DEFAULT_ACCOUNTS,
      addAccount: (name, type, openingBalance) => {
        const account: Account = {
          id: generateId(),
          name,
          type,
          openingBalance,
          currentBalance: openingBalance,
          currency: get().settings.currency,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ accounts: [...state.accounts, account] }));
        return account;
      },
      updateAccount: (id, updates) =>
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        })),
      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
          transactions: state.transactions.filter((t) => t.accountId !== id),
        })),

      // Categories
      categories: DEFAULT_CATEGORIES,
      addCategory: (name, type, icon, color) =>
        set((state) => ({
          categories: [
            ...state.categories,
            {
              id: generateId(),
              name,
              type,
              icon,
              color,
              isDefault: false,
              sortOrder: state.categories.filter((c) => c.type === type).length,
            },
          ],
        })),
      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
      reorderCategories: (ids) =>
        set((state) => ({
          categories: state.categories.map((c, i) => ({
            ...c,
            sortOrder: ids.indexOf(c.id),
          })),
        })),

      // Transactions
      transactions: [],
      addTransaction: (transactionData) => {
        const transaction: Transaction = {
          ...transactionData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ transactions: [...state.transactions, transaction] }));
        return transaction;
      },
      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
      getFilteredTransactions: (filters) => {
        const { transactions } = get();
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
            if (!t.note.toLowerCase().includes(query) && !t.amount.toString().includes(query)) {
              return false;
            }
          }
          return true;
        });
      },

      // Debts
      debts: [],
      addDebt: (debtData) => {
        const debt: Debt = {
          ...debtData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ debts: [...state.debts, debt] }));
        return debt;
      },
      updateDebt: (id, updates) =>
        set((state) => ({
          debts: state.debts.map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
          ),
        })),
      deleteDebt: (id) =>
        set((state) => ({
          debts: state.debts.filter((d) => d.id !== id),
          debtPayments: state.debtPayments.filter((p) => p.debtId !== id),
        })),

      // Debt Payments
      debtPayments: [],
      addDebtPayment: (paymentData) => {
        const payment: DebtPayment = {
          ...paymentData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => {
          const debt = state.debts.find((d) => d.id === paymentData.debtId);
          const updatedDebts = state.debts.map((d) =>
            d.id === paymentData.debtId
              ? {
                  ...d,
                  currentAmount: Math.max(0, d.currentAmount - paymentData.amount),
                  remainingPayments: Math.max(0, d.remainingPayments - 1),
                  updatedAt: new Date().toISOString(),
                }
              : d
          );
          return {
            debtPayments: [...state.debtPayments, payment],
            debts: updatedDebts,
          };
        });
        return payment;
      },
      getDebtPayments: (debtId) => {
        return get().debtPayments.filter((p) => p.debtId === debtId);
      },

      // Budgets
      budgets: [],
      upsertBudget: (budgetData) => {
        set((state) => {
          const existing = state.budgets.find((b) => b.month === budgetData.month);
          if (existing) {
            return {
              budgets: state.budgets.map((b) =>
                b.month === budgetData.month
                  ? { ...b, ...budgetData, updatedAt: new Date().toISOString() }
                  : b
              ),
            };
          }
          return {
            budgets: [
              ...state.budgets,
              {
                ...budgetData,
                id: generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
          };
        });
      },
      getBudget: (month) => {
        return get().budgets.find((b) => b.month === month) || null;
      },

      // Goals
      goals: [],
      addGoal: (goalData) => {
        const goal: Goal = {
          ...goalData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ goals: [...state.goals, goal] }));
        return goal;
      },
      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
          ),
        })),
      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),

      // Recurring Transactions
      recurringTransactions: [],
      addRecurringTransaction: (recurringData) => {
        const recurring: RecurringTransaction = {
          ...recurringData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          recurringTransactions: [...state.recurringTransactions, recurring],
        }));
      },
      updateRecurringTransaction: (id, updates) =>
        set((state) => ({
          recurringTransactions: state.recurringTransactions.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
        })),
      deleteRecurringTransaction: (id) =>
        set((state) => ({
          recurringTransactions: state.recurringTransactions.filter((r) => r.id !== id),
        })),
      generateRecurringTransactions: () => {
        const { recurringTransactions, transactions, addTransaction } = get();
        const today = getToday();

        for (const recurring of recurringTransactions) {
          if (!recurring.isActive) continue;
          if (recurring.endDate && recurring.nextDueDate > recurring.endDate) continue;

          if (recurring.nextDueDate <= today) {
            addTransaction({
              amount: recurring.amount,
              type: recurring.type,
              categoryId: recurring.categoryId,
              accountId: recurring.accountId,
              date: recurring.nextDueDate,
              note: `Recurring: ${recurring.name}`,
              isRecurring: true,
              recurringId: recurring.id,
            });

            const newNextDate = getNextRecurrenceDate(
              recurring.nextDueDate,
              recurring.frequency
            );

            set((state) => ({
              recurringTransactions: state.recurringTransactions.map((r) =>
                r.id === recurring.id
                  ? { ...r, nextDueDate: newNextDate, updatedAt: new Date().toISOString() }
                  : r
              ),
            }));
          }
        }
      },

      // Reminders
      reminders: [],
      addReminder: (reminderData) => {
        const reminder: Reminder = {
          ...reminderData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ reminders: [...state.reminders, reminder] }));
      },
      updateReminder: (id, updates) =>
        set((state) => ({
          reminders: state.reminders.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      deleteReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        })),
      completeReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, isCompleted: true } : r
          ),
        })),
    }),
    {
      name: 'budget-planner-storage',
    }
  )
);

export default useStore;
