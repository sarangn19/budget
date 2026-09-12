import type { Category, Account } from '../types';
import { generateId } from './helpers';

export const DEFAULT_CATEGORIES: Category[] = [
  // Income categories
  { id: generateId(), name: 'Salary', type: 'income', icon: 'briefcase', color: '#10b981', isDefault: true, sortOrder: 0 },
  { id: generateId(), name: 'Freelance', type: 'income', icon: 'laptop', color: '#3b82f6', isDefault: true, sortOrder: 1 },
  { id: generateId(), name: 'Other Income', type: 'income', icon: 'plus-circle', color: '#8b5cf6', isDefault: true, sortOrder: 2 },
  // Expense categories
  { id: generateId(), name: 'Food', type: 'expense', icon: 'utensils', color: '#f59e0b', isDefault: true, sortOrder: 0 },
  { id: generateId(), name: 'Transport', type: 'expense', icon: 'car', color: '#ef4444', isDefault: true, sortOrder: 1 },
  { id: generateId(), name: 'Shopping', type: 'expense', icon: 'shopping-bag', color: '#ec4899', isDefault: true, sortOrder: 2 },
  { id: generateId(), name: 'Bills', type: 'expense', icon: 'file-text', color: '#6366f1', isDefault: true, sortOrder: 3 },
  { id: generateId(), name: 'Rent', type: 'expense', icon: 'home', color: '#14b8a6', isDefault: true, sortOrder: 4 },
  { id: generateId(), name: 'Entertainment', type: 'expense', icon: 'film', color: '#f97316', isDefault: true, sortOrder: 5 },
  { id: generateId(), name: 'Subscriptions', type: 'expense', icon: 'refresh-cw', color: '#a855f7', isDefault: true, sortOrder: 6 },
  { id: generateId(), name: 'Health', type: 'expense', icon: 'heart', color: '#ef4444', isDefault: true, sortOrder: 7 },
  { id: generateId(), name: 'Education', type: 'expense', icon: 'book-open', color: '#0ea5e9', isDefault: true, sortOrder: 8 },
  { id: generateId(), name: 'Other Expense', type: 'expense', icon: 'more-horizontal', color: '#64748b', isDefault: true, sortOrder: 9 },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: generateId(),
    name: 'Main Bank Account',
    type: 'bank',
    openingBalance: 0,
    currentBalance: 0,
    currency: 'INR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_SAFETY_BUFFER = 2000;
