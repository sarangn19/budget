import { useState } from 'react';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { EmptyState } from '../components/ui/EmptyState';
import useStore from '../store/useStore';
import { getToday } from '../utils/helpers';
import type { TransactionType, RecurrenceFrequency } from '../types';
import {
  Plus,
  RefreshCw,
  Trash2,
  Pause,
  Play,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const frequencyLabels: Record<RecurrenceFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export default function Recurring() {
  const {
    recurringTransactions,
    categories,
    accounts,
    settings,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
  } = useStore();

  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [startDate, setStartDate] = useState(getToday());

  const handleAdd = () => {
    if (!name || !amount || !categoryId || !accountId) return;
    addRecurringTransaction({
      name,
      amount: parseFloat(amount),
      type,
      categoryId,
      accountId,
      frequency,
      startDate,
      nextDueDate: startDate,
      isActive: true,
    });
    resetForm();
    setShowAdd(false);
  };

  const toggleActive = (id: string, isActive: boolean) => {
    updateRecurringTransaction(id, { isActive: !isActive });
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setCategoryId('');
    setAccountId('');
    setFrequency('monthly');
    setStartDate(getToday());
  };

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <AppLayout
      header={
        <PageHeader
          title="Recurring"
          action={
            <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
              <Plus size={16} /> Add
            </Button>
          }
        />
      }
    >
      <div className="px-5 space-y-5 animate-fadeIn">
        {recurringTransactions.length > 0 ? (
          <div className="space-y-3">
            {recurringTransactions.map((recurring) => {
              const category = categories.find((c) => c.id === recurring.categoryId);

              return (
                <Card key={recurring.id} padding="md">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: recurring.type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      }}
                    >
                      {recurring.type === 'income' ? (
                        <ArrowUpRight size={16} className="text-[var(--color-success)]" />
                      ) : (
                        <ArrowDownRight size={16} className="text-[var(--color-danger)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold truncate">{recurring.name}</span>
                        <AmountDisplay
                          amount={recurring.amount}
                          currency={settings.currency}
                          size="sm"
                          colorize
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          {frequencyLabels[recurring.frequency]}
                        </span>
                        <span className="text-[var(--color-text-muted)]">·</span>
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          {category?.name}
                        </span>
                        <span className="text-[var(--color-text-muted)]">·</span>
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          Next: {recurring.nextDueDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-3">
                    <Button
                      variant={recurring.isActive ? 'secondary' : 'success'}
                      size="sm"
                      onClick={() => toggleActive(recurring.id, recurring.isActive)}
                    >
                      {recurring.isActive ? <Pause size={12} /> : <Play size={12} />}
                      {recurring.isActive ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteRecurringTransaction(recurring.id)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<RefreshCw size={28} />}
            title="No recurring transactions"
            description="Set up recurring items like salary, rent, subscriptions, and bills."
            action={
              <Button onClick={() => setShowAdd(true)}>
                <Plus size={16} /> Add Recurring
              </Button>
            }
          />
        )}
      </div>

      {/* Add Recurring Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Recurring Transaction" size="sm">
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g., Netflix, Rent, Salary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <div className="flex gap-2">
            <Button
              variant={type === 'expense' ? 'danger' : 'secondary'}
              size="sm"
              fullWidth
              onClick={() => setType('expense')}
            >
              Expense
            </Button>
            <Button
              variant={type === 'income' ? 'success' : 'secondary'}
              size="sm"
              fullWidth
              onClick={() => setType('income')}
            >
              Income
            </Button>
          </div>

          <Input
            label="Amount"
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
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

          <Select
            label="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
          />

          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Button fullWidth onClick={handleAdd} disabled={!name || !amount || !categoryId || !accountId}>
            Add Recurring
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
