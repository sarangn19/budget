import { v4 as uuidv4 } from 'uuid';
import type { Currency as CurrencyType } from '../types';

export type Currency = CurrencyType;

export const generateId = (): string => uuidv4();

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const formatCurrency = (amount: number, currency: Currency = 'INR'): string => {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return amount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
};

export const getMonthKey = (date: Date = new Date()): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const getMonthLabel = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

export const getStartOfMonth = (date: Date = new Date()): string => {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
};

export const getEndOfMonth = (date: Date = new Date()): string => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
};

export const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const addMonths = (dateStr: string, months: number): string => {
  const date = new Date(dateStr);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};

export const daysBetween = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const isSameMonth = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
};

export const isDateInRange = (date: string, start: string, end: string): boolean => {
  const d = new Date(date);
  return d >= new Date(start) && d <= new Date(end);
};

export const getNextRecurrenceDate = (
  currentDate: string,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
): string => {
  const date = new Date(currentDate);
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date.toISOString().split('T')[0];
};
