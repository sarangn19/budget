import { useState, useMemo } from 'react';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { EmptyState } from '../components/ui/EmptyState';
import { Tabs } from '../components/ui/Tabs';
import useStore from '../store/useStore';
import { formatDate, formatCurrency, getToday, getStartOfMonth, getEndOfMonth } from '../utils/helpers';
import type { TransactionType, FilterOptions } from '../types';
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  X,
  List,
} from 'lucide-react';

export default function Transactions() {
  const {
    transactions,
    categories,
    accounts,
    settings,
    addTransaction,
    deleteTransaction,
  } = useStore();

  const [showAdd, setShowAdd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add form state
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(getToday());
  const [note, setNote] = useState('');

  // Filter state
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (activeTab === 'income') {
      filtered = filtered.filter((t) => t.type === 'income');
    } else if (activeTab === 'expense') {
      filtered = filtered.filter((t) => t.type === 'expense');
    } else if (activeTab === 'transfer') {
      filtered = filtered.filter((t) => t.type === 'transfer');
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.note.toLowerCase().includes(query) ||
          t.amount.toString().includes(query)
      );
    }

    if (filterCategory) {
      filtered = filtered.filter((t) => t.categoryId === filterCategory);
    }
    if (filterAccount) {
      filtered = filtered.filter((t) => t.accountId === filterAccount);
    }

    return filtered;
  }, [transactions, activeTab, searchQuery, filterCategory, filterAccount]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, typeof filteredTransactions> = {};
    for (const t of filteredTransactions) {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    }
    return groups;
  }, [filteredTransactions]);

  const handleAdd = () => {
    if (!amount || !categoryId || !accountId) return;
    addTransaction({
      amount: parseFloat(amount),
      type,
      categoryId,
      accountId,
      date,
      note,
      isRecurring: false,
    });
    setAmount('');
    setNote('');
    setDate(getToday());
    setShowAdd(false);
  };

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || 'Unknown';
  const getAccountName = (id: string) => accounts.find((a) => a.id === id)?.name || 'Unknown';

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'income', label: 'Income' },
    { id: 'expense', label: 'Expenses' },
    { id: 'transfer', label: 'Transfers' },
  ];

  return (
    <AppLayout
      header={
        <PageHeader
          title="Transactions"
          action={
            <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
              <Plus size={16} /> Add
            </Button>
          }
        />
      }
    >
      <div className="px-4 space-y-4 animate-fadeIn">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Filters */}
        {(filterCategory || filterAccount) && (
          <div className="flex items-center gap-2 flex-wrap">
            {filterCategory && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs">
                {getCategoryName(filterCategory)}
                <button onClick={() => setFilterCategory('')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {filterAccount && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs">
                {getAccountName(filterAccount)}
                <button onClick={() => setFilterAccount('')}>
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterAccount('');
              }}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Transactions List */}
        {Object.keys(groupedTransactions).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
              <div key={date}>
                <div className="text-xs font-medium text-[var(--color-text-muted)] mb-2 sticky top-0 bg-[var(--color-surface-dim)] py-1">
                  {formatDate(date)}
                </div>
                <div className="space-y-1">
                  {dateTransactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 bg-[var(--color-surface)] rounded-xl p-3 border border-[var(--color-border-light)]"
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor:
                            t.type === 'income'
                              ? 'rgba(16, 185, 129, 0.1)'
                              : t.type === 'transfer'
                              ? 'rgba(99, 102, 241, 0.1)'
                              : 'rgba(239, 68, 68, 0.1)',
                        }}
                      >
                        {t.type === 'income' ? (
                          <ArrowUpRight size={16} className="text-[var(--color-success)]" />
                        ) : t.type === 'transfer' ? (
                          <ArrowLeftRight size={16} className="text-[var(--color-accent)]" />
                        ) : (
                          <ArrowDownRight size={16} className="text-[var(--color-danger)]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">
                            {getCategoryName(t.categoryId)}
                          </span>
                          <AmountDisplay
                            amount={t.type === 'income' ? t.amount : -t.amount}
                            currency={settings.currency}
                            size="sm"
                            colorize
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-[var(--color-text-muted)]">
                            {getAccountName(t.accountId)}
                          </span>
                          {t.note && (
                            <>
                              <span className="text-[var(--color-text-muted)]">·</span>
                              <span className="text-[11px] text-[var(--color-text-muted)] truncate">
                                {t.note}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<List size={28} />}
            title="No transactions"
            description="Start tracking your spending and income by adding transactions."
            action={
              <Button onClick={() => setShowAdd(true)}>
                <Plus size={16} /> Add Transaction
              </Button>
            }
          />
        )}
      </div>

      {/* Add Transaction Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Transaction" size="sm">
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => (
              <Button
                key={t}
                variant={
                  type === t
                    ? t === 'expense'
                      ? 'danger'
                      : t === 'income'
                      ? 'success'
                      : 'primary'
                    : 'secondary'
                }
                size="sm"
                fullWidth
                onClick={() => setType(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>

          <Input
            label="Amount"
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />

          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={
              type === 'income'
                ? incomeCategories.map((c) => ({ value: c.id, label: c.name }))
                : expenseCategories.map((c) => ({ value: c.id, label: c.name }))
            }
            placeholder="Select category"
          />

          <Select
            label="Account"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            placeholder="Select account"
          />

          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Input
            label="Note (optional)"
            placeholder="What was this for?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <Button fullWidth onClick={handleAdd} disabled={!amount || !categoryId || !accountId}>
            Save Transaction
          </Button>
        </div>
      </Modal>

      {/* Filter Modal */}
      <Modal isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filter Transactions" size="sm">
        <div className="space-y-4">
          <Select
            label="Category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="All categories"
          />
          <Select
            label="Account"
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            placeholder="All accounts"
          />
          <Button fullWidth onClick={() => setShowFilters(false)}>
            Apply Filters
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
