import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Card, CardHeader } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import useStore from '../store/useStore';
import {
  calculateTotalBalance,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateTotalDebt,
  calculateDebtProgress,
  calculateSafeToSpend,
  calculateSavingsProgress,
  getUpcomingDebts,
  getMonthlyCashFlow,
} from '../utils/calculations';
import { formatCurrency, getMonthKey, getMonthLabel, getToday } from '../utils/helpers';
import { getStartOfMonth } from '../utils/helpers';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Shield,
  Landmark,
  Banknote,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    accounts,
    transactions,
    debts,
    goals,
    settings,
    categories,
    addTransaction,
    addAccount,
  } = useStore();

  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);

  // Quick add form state
  const [quickAmount, setQuickAmount] = useState('');
  const [quickType, setQuickType] = useState<'expense' | 'income'>('expense');
  const [quickCategoryId, setQuickCategoryId] = useState('');
  const [quickAccountId, setQuickAccountId] = useState('');
  const [quickNote, setQuickNote] = useState('');

  // Add account form state
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<'bank' | 'cash' | 'wallet' | 'savings' | 'other'>('bank');
  const [accountBalance, setAccountBalance] = useState('');

  const monthKey = getMonthKey();
  const totalBalance = calculateTotalBalance(accounts, transactions);
  const monthlyIncome = calculateMonthlyIncome(transactions, getStartOfMonth());
  const monthlyExpenses = calculateMonthlyExpenses(transactions, getStartOfMonth());
  const totalDebt = calculateTotalDebt(debts);
  const debtProgress = calculateDebtProgress(debts);
  const safeToSpend = calculateSafeToSpend(accounts, transactions, debts, null, settings.safetyBuffer);
  const savingsProgress = calculateSavingsProgress(goals);
  const upcomingDebts = getUpcomingDebts(debts, 7);
  const cashFlow = getMonthlyCashFlow(transactions, getStartOfMonth());

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleQuickAdd = () => {
    if (!quickAmount || !quickCategoryId || !quickAccountId) return;
    addTransaction({
      amount: parseFloat(quickAmount),
      type: quickType,
      categoryId: quickCategoryId,
      accountId: quickAccountId,
      date: getToday(),
      note: quickNote,
      isRecurring: false,
    });
    setQuickAmount('');
    setQuickNote('');
    setShowQuickAdd(false);
  };

  const handleAddAccount = () => {
    if (!accountName) return;
    addAccount(accountName, accountType, parseFloat(accountBalance) || 0);
    setAccountName('');
    setAccountBalance('');
    setShowAddAccount(false);
  };

  return (
    <AppLayout
      header={
        <PageHeader
          title="Budget Planner"
          subtitle={getMonthLabel(monthKey)}
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowQuickAdd(true)}
            >
              <Plus size={16} /> Add
            </Button>
          }
        />
      }
    >
      <div className="px-4 space-y-4 animate-fadeIn">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] text-white border-0" padding="lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-white/70 font-medium">Total Balance</span>
            <Wallet size={18} className="text-white/50" />
          </div>
          <AmountDisplay amount={totalBalance} currency={settings.currency} size="xl" className="text-white" />
          <div className="flex items-center gap-1 mt-1">
            {cashFlow >= 0 ? (
              <span className="text-xs text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight size={12} /> +{formatCurrency(cashFlow, settings.currency)} this month
              </span>
            ) : (
              <span className="text-xs text-red-400 flex items-center gap-0.5">
                <ArrowDownRight size={12} /> {formatCurrency(cashFlow, settings.currency)} this month
              </span>
            )}
          </div>
        </Card>

        {/* Safe to Spend */}
        <Card className="border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5" padding="lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={18} className="text-[var(--color-accent)]" />
            <span className="text-sm font-semibold text-[var(--color-text)]">Safe to Spend</span>
          </div>
          <AmountDisplay amount={safeToSpend} currency={settings.currency} size="lg" colorize />
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            After upcoming commitments and safety buffer
          </p>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Income"
            value={<AmountDisplay amount={monthlyIncome} currency={settings.currency} size="md" />}
            icon={<TrendingUp size={16} className="text-[var(--color-success)]" />}
          />
          <StatCard
            label="Expenses"
            value={<AmountDisplay amount={monthlyExpenses} currency={settings.currency} size="md" />}
            icon={<TrendingDown size={16} className="text-[var(--color-danger)]" />}
          />
          <StatCard
            label="Total Debt"
            value={<AmountDisplay amount={totalDebt} currency={settings.currency} size="md" />}
            icon={<CreditCard size={16} className="text-[var(--color-warning)]" />}
          />
          <StatCard
            label="Savings"
            value={<span className="text-xl font-bold">{Math.round(savingsProgress)}%</span>}
            icon={<Target size={16} className="text-[var(--color-accent)]" />}
          />
        </div>

        {/* Debt Progress */}
        {debts.length > 0 && (
          <Card padding="md">
            <CardHeader
              title="Debt Progress"
              action={
                <Button variant="ghost" size="sm" onClick={() => navigate('/debts')}>
                  View All
                </Button>
              }
            />
            <ProgressBar
              value={debtProgress}
              color="success"
              size="lg"
              showLabel
              label={`${formatCurrency(calculateTotalDebt(debts) - debts.reduce((s, d) => s + (d.originalAmount - d.currentAmount), 0), settings.currency)} remaining`}
            />
          </Card>
        )}

        {/* Upcoming Debts */}
        {upcomingDebts.length > 0 && (
          <Card padding="md">
            <CardHeader title="Upcoming Payments" subtitle="Due in next 7 days" />
            <div className="space-y-2">
              {upcomingDebts.map((debt) => (
                <div key={debt.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border-light)] last:border-0">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[var(--color-warning)]" />
                    <span className="text-sm font-medium">{debt.name}</span>
                  </div>
                  <div className="text-right">
                    <AmountDisplay amount={debt.emiAmount} currency={settings.currency} size="sm" />
                    <p className="text-[10px] text-[var(--color-text-muted)]">due {debt.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Goals Progress */}
        {goals.length > 0 && (
          <Card padding="md">
            <CardHeader
              title="Goals"
              action={
                <Button variant="ghost" size="sm" onClick={() => navigate('/goals')}>
                  View All
                </Button>
              }
            />
            <div className="space-y-3">
              {goals.slice(0, 3).map((goal) => (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{goal.icon} {goal.name}</span>
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {formatCurrency(goal.currentAmount, settings.currency)} / {formatCurrency(goal.targetAmount, settings.currency)}
                    </span>
                  </div>
                  <ProgressBar
                    value={(goal.currentAmount / goal.targetAmount) * 100}
                    color="accent"
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty States */}
        {accounts.length === 0 && (
          <EmptyState
            icon={<Landmark size={28} />}
            title="No accounts yet"
            description="Add your first account to start tracking your finances."
            action={
              <Button onClick={() => setShowAddAccount(true)}>
                <Plus size={16} /> Add Account
              </Button>
            }
          />
        )}

        {accounts.length > 0 && transactions.length === 0 && (
          <EmptyState
            icon={<Banknote size={28} />}
            title="No transactions yet"
            description="Start adding transactions to see your financial overview."
            action={
              <Button onClick={() => setShowQuickAdd(true)}>
                <Plus size={16} /> Add Transaction
              </Button>
            }
          />
        )}
      </div>

      {/* Quick Add Transaction Modal */}
      <Modal isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} title="Quick Add Transaction" size="sm">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={quickType === 'expense' ? 'danger' : 'secondary'}
              size="sm"
              fullWidth
              onClick={() => setQuickType('expense')}
            >
              Expense
            </Button>
            <Button
              variant={quickType === 'income' ? 'success' : 'secondary'}
              size="sm"
              fullWidth
              onClick={() => setQuickType('income')}
            >
              Income
            </Button>
          </div>

          <Input
            label="Amount"
            type="number"
            placeholder="0"
            value={quickAmount}
            onChange={(e) => setQuickAmount(e.target.value)}
            autoFocus
          />

          <Select
            label="Category"
            value={quickCategoryId}
            onChange={(e) => setQuickCategoryId(e.target.value)}
            options={expenseCategories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Select category"
          />

          <Select
            label="Account"
            value={quickAccountId}
            onChange={(e) => setQuickAccountId(e.target.value)}
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            placeholder="Select account"
          />

          <Input
            label="Note (optional)"
            placeholder="What was this for?"
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
          />

          <Button
            fullWidth
            onClick={handleQuickAdd}
            disabled={!quickAmount || !quickCategoryId || !quickAccountId}
          >
            Save Transaction
          </Button>
        </div>
      </Modal>

      {/* Add Account Modal */}
      <Modal isOpen={showAddAccount} onClose={() => setShowAddAccount(false)} title="Add Account" size="sm">
        <div className="space-y-4">
          <Input
            label="Account Name"
            placeholder="e.g., SBI Savings"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            autoFocus
          />
          <Select
            label="Account Type"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as typeof accountType)}
            options={[
              { value: 'bank', label: 'Bank Account' },
              { value: 'savings', label: 'Savings Account' },
              { value: 'cash', label: 'Cash' },
              { value: 'wallet', label: 'Wallet' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Input
            label="Opening Balance"
            type="number"
            placeholder="0"
            value={accountBalance}
            onChange={(e) => setAccountBalance(e.target.value)}
          />
          <Button fullWidth onClick={handleAddAccount} disabled={!accountName}>
            Add Account
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
