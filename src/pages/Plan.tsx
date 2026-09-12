import { useState } from 'react';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { ProgressBar } from '../components/ui/ProgressBar';
import useStore from '../store/useStore';
import {
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateTotalDebt,
  calculateSafeToSpend,
  getBudgetStatus,
} from '../utils/calculations';
import { formatCurrency, getMonthKey, getMonthLabel, getStartOfMonth } from '../utils/helpers';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';

export default function Plan() {
  const {
    accounts,
    transactions,
    debts,
    goals,
    budgets,
    settings,
    upsertBudget,
    getBudget,
  } = useStore();

  const monthKey = getMonthKey();
  const monthLabel = getMonthLabel(monthKey);
  const existingBudget = getBudget(monthKey);

  const [expectedIncome, setExpectedIncome] = useState(
    existingBudget?.expectedIncome.toString() || ''
  );
  const [essentialExpenses, setEssentialExpenses] = useState(
    existingBudget?.essentialExpenses.toString() || ''
  );
  const [variableExpenses, setVariableExpenses] = useState(
    existingBudget?.variableExpenses.toString() || ''
  );
  const [debtPayments, setDebtPayments] = useState(
    existingBudget?.debtPayments.toString() || ''
  );
  const [savings, setSavings] = useState(
    existingBudget?.savings.toString() || ''
  );
  const [personalSpending, setPersonalSpending] = useState(
    existingBudget?.personalSpending.toString() || ''
  );
  const [emergencyBuffer, setEmergencyBuffer] = useState(
    existingBudget?.emergencyBuffer.toString() || ''
  );

  const totalPlanned =
    (parseFloat(essentialExpenses) || 0) +
    (parseFloat(variableExpenses) || 0) +
    (parseFloat(debtPayments) || 0) +
    (parseFloat(savings) || 0) +
    (parseFloat(personalSpending) || 0) +
    (parseFloat(emergencyBuffer) || 0);

  const income = parseFloat(expectedIncome) || 0;
  const remaining = income - totalPlanned;
  const remainingPercentage = income > 0 ? (remaining / income) * 100 : 0;

  const budget = {
    month: monthKey,
    expectedIncome: income,
    essentialExpenses: parseFloat(essentialExpenses) || 0,
    variableExpenses: parseFloat(variableExpenses) || 0,
    debtPayments: parseFloat(debtPayments) || 0,
    savings: parseFloat(savings) || 0,
    personalSpending: parseFloat(personalSpending) || 0,
    emergencyBuffer: parseFloat(emergencyBuffer) || 0,
  };

  const budgetStatus = getBudgetStatus(budget);

  const handleSave = () => {
    upsertBudget(budget);
  };

  const actualIncome = calculateMonthlyIncome(transactions, getStartOfMonth());
  const actualExpenses = calculateMonthlyExpenses(transactions, getStartOfMonth());
  const totalDebt = calculateTotalDebt(debts);

  return (
    <AppLayout
      header={
        <PageHeader
          title="Monthly Plan"
          subtitle={monthLabel}
        />
      }
    >
      <div className="px-4 space-y-4 animate-fadeIn">
        {/* Status Banner */}
        <Card
          className={
            budgetStatus.status === 'healthy'
              ? 'bg-emerald-50 border-emerald-200'
              : budgetStatus.status === 'tight'
              ? 'bg-amber-50 border-amber-200'
              : 'bg-red-50 border-red-200'
          }
          padding="md"
        >
          <div className="flex items-center gap-2">
            {budgetStatus.status === 'healthy' ? (
              <CheckCircle2 size={18} className="text-emerald-600" />
            ) : budgetStatus.status === 'tight' ? (
              <AlertTriangle size={18} className="text-amber-600" />
            ) : (
              <AlertTriangle size={18} className="text-red-600" />
            )}
            <span className="text-sm font-medium">{budgetStatus.message}</span>
          </div>
        </Card>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] text-white border-0" padding="lg">
          <div className="text-center">
            <span className="text-xs text-white/60 uppercase tracking-wide">Remaining</span>
            <AmountDisplay
              amount={remaining}
              currency={settings.currency}
              size="xl"
              className={`text-white block mt-1 ${remaining < 0 ? 'text-red-400' : ''}`}
            />
            <span className="text-xs text-white/50 mt-1">
              {income > 0 ? `${Math.round(Math.max(0, remainingPercentage))}% of income left` : 'Enter expected income'}
            </span>
          </div>
          <div className="mt-4">
            <ProgressBar
              value={Math.max(0, remainingPercentage)}
              color={remaining >= 0 ? 'success' : 'danger'}
              size="lg"
            />
          </div>
        </Card>

        {/* Planning Inputs */}
        <Card padding="md">
          <CardHeader title="Expected Income" subtitle="Your expected income this month" />
          <Input
            type="number"
            placeholder="0"
            value={expectedIncome}
            onChange={(e) => setExpectedIncome(e.target.value)}
          />
        </Card>

        <Card padding="md">
          <CardHeader title="Planned Expenses" subtitle="How you plan to spend" />
          <div className="space-y-3">
            <Input
              label="Essential Expenses"
              type="number"
              placeholder="Rent, bills, groceries..."
              value={essentialExpenses}
              onChange={(e) => setEssentialExpenses(e.target.value)}
            />
            <Input
              label="Variable Expenses"
              type="number"
              placeholder="Shopping, entertainment..."
              value={variableExpenses}
              onChange={(e) => setVariableExpenses(e.target.value)}
            />
            <Input
              label="Debt Payments"
              type="number"
              placeholder="EMIs, loan repayments..."
              value={debtPayments}
              onChange={(e) => setDebtPayments(e.target.value)}
            />
            <Input
              label="Savings"
              type="number"
              placeholder="Emergency fund, investments..."
              value={savings}
              onChange={(e) => setSavings(e.target.value)}
            />
            <Input
              label="Personal Spending"
              type="number"
              placeholder="Personal treats, gifts..."
              value={personalSpending}
              onChange={(e) => setPersonalSpending(e.target.value)}
            />
            <Input
              label="Emergency Buffer"
              type="number"
              placeholder="Keep aside for emergencies..."
              value={emergencyBuffer}
              onChange={(e) => setEmergencyBuffer(e.target.value)}
            />
          </div>
        </Card>

        {/* Breakdown */}
        {income > 0 && (
          <Card padding="md">
            <CardHeader title="Breakdown" />
            <div className="space-y-2">
              {[
                { label: 'Essential', amount: parseFloat(essentialExpenses) || 0, color: 'bg-red-500' },
                { label: 'Variable', amount: parseFloat(variableExpenses) || 0, color: 'bg-amber-500' },
                { label: 'Debt', amount: parseFloat(debtPayments) || 0, color: 'bg-orange-500' },
                { label: 'Savings', amount: parseFloat(savings) || 0, color: 'bg-emerald-500' },
                { label: 'Personal', amount: parseFloat(personalSpending) || 0, color: 'bg-purple-500' },
                { label: 'Buffer', amount: parseFloat(emergencyBuffer) || 0, color: 'bg-blue-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-xs text-[var(--color-text-secondary)] flex-1">{item.label}</span>
                  <AmountDisplay amount={item.amount} currency={settings.currency} size="sm" />
                  <span className="text-[10px] text-[var(--color-text-muted)] w-10 text-right">
                    {income > 0 ? Math.round((item.amount / income) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Safe to Spend Info */}
        <Card padding="md" className="bg-[var(--color-accent)]/5 border-[var(--color-accent)]/20">
          <div className="flex items-start gap-2">
            <Shield size={16} className="text-[var(--color-accent)] mt-0.5" />
            <div>
              <span className="text-sm font-medium">Safe to Spend: </span>
              <AmountDisplay
                amount={calculateSafeToSpend(accounts, transactions, debts, budget, settings.safetyBuffer)}
                currency={settings.currency}
                size="sm"
                colorize
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                This is calculated dynamically based on your balance, commitments, and safety buffer.
              </p>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <Button fullWidth size="lg" onClick={handleSave}>
          Save Plan
        </Button>

        {/* Disclaimer */}
        <p className="text-[10px] text-[var(--color-text-muted)] text-center pb-4">
          <Info size={10} className="inline mr-1" />
          This is a planning tool, not financial advice. Calculations are suggestions based on your inputs.
        </p>
      </div>
    </AppLayout>
  );
}
