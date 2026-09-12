import { useState } from 'react';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import { Tabs } from '../components/ui/Tabs';
import useStore from '../store/useStore';
import {
  calculateTotalDebt,
  calculateDebtProgress,
  calculateDebtRepaid,
} from '../utils/calculations';
import { formatCurrency, getToday } from '../utils/helpers';
import {
  Plus,
  CreditCard,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';

export default function Debts() {
  const {
    debts,
    debtPayments,
    settings,
    addDebt,
    deleteDebt,
    addDebtPayment,
    getDebtPayments,
  } = useStore();

  const [showAdd, setShowAdd] = useState(false);
  const [showPayModal, setShowPayModal] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add form state
  const [name, setName] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [emiAmount, setEmiAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remainingPayments, setRemainingPayments] = useState('');
  const [notes, setNotes] = useState('');

  // Pay form state
  const [payAmount, setPayAmount] = useState('');

  const totalDebt = calculateTotalDebt(debts);
  const totalRepaid = calculateDebtRepaid(debts);
  const debtProgress = calculateDebtProgress(debts);

  const handleAdd = () => {
    if (!name || !originalAmount) return;
    addDebt({
      name,
      originalAmount: parseFloat(originalAmount),
      currentAmount: parseFloat(currentAmount) || parseFloat(originalAmount),
      interestRate: parseFloat(interestRate) || 0,
      minimumPayment: parseFloat(minimumPayment) || 0,
      emiAmount: parseFloat(emiAmount) || 0,
      dueDate: dueDate || getToday(),
      remainingPayments: parseInt(remainingPayments) || 0,
      notes,
    });
    resetForm();
    setShowAdd(false);
  };

  const handlePay = (debtId: string) => {
    if (!payAmount) return;
    addDebtPayment({
      debtId,
      amount: parseFloat(payAmount),
      date: getToday(),
      notes: '',
    });
    setPayAmount('');
    setShowPayModal(null);
  };

  const resetForm = () => {
    setName('');
    setOriginalAmount('');
    setCurrentAmount('');
    setInterestRate('');
    setMinimumPayment('');
    setEmiAmount('');
    setDueDate('');
    setRemainingPayments('');
    setNotes('');
  };

  return (
    <AppLayout
      header={
        <PageHeader
          title="Debts"
          action={
            <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
              <Plus size={16} /> Add
            </Button>
          }
        />
      }
    >
      <div className="px-4 space-y-4 animate-fadeIn">
        {/* Summary Card */}
        {debts.length > 0 && (
          <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] text-white border-0" padding="lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-white/60">Total Outstanding</span>
                <AmountDisplay amount={totalDebt} currency={settings.currency} size="lg" className="text-white block mt-1" />
              </div>
              <div>
                <span className="text-xs text-white/60">Total Repaid</span>
                <AmountDisplay amount={totalRepaid} currency={settings.currency} size="lg" className="text-emerald-400 block mt-1" />
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar
                value={debtProgress}
                color="success"
                size="lg"
                showLabel
                label={`${Math.round(debtProgress)}% paid off`}
              />
            </div>
          </Card>
        )}

        {/* Debts List */}
        {debts.length > 0 ? (
          <div className="space-y-3">
            {debts.map((debt) => {
              const paid = debt.originalAmount - debt.currentAmount;
              const progress = (paid / debt.originalAmount) * 100;
              const isExpanded = expandedId === debt.id;
              const payments = getDebtPayments(debt.id);

              return (
                <Card key={debt.id} padding="none">
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-danger)]/10 flex items-center justify-center">
                        <CreditCard size={18} className="text-[var(--color-danger)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold truncate">{debt.name}</span>
                          <AmountDisplay
                            amount={debt.currentAmount}
                            currency={settings.currency}
                            size="sm"
                          />
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {debt.emiAmount > 0 && (
                            <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-0.5">
                              <Clock size={10} /> EMI: {formatCurrency(debt.emiAmount, settings.currency)}
                            </span>
                          )}
                          {debt.dueDate && (
                            <span className="text-[11px] text-[var(--color-text-muted)]">
                              Due: {debt.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <ProgressBar
                        value={progress}
                        color={progress >= 100 ? 'success' : progress >= 50 ? 'warning' : 'accent'}
                        size="sm"
                      />
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        {formatCurrency(paid, settings.currency)} of {formatCurrency(debt.originalAmount, settings.currency)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => setShowPayModal(debt.id)}
                        >
                          Pay
                        </Button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : debt.id)}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-dim)]"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-[var(--color-border-light)] p-4 bg-[var(--color-surface-dim)]/50 space-y-2">
                      {debt.interestRate > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-text-secondary)]">Interest Rate</span>
                          <span>{debt.interestRate}%</span>
                        </div>
                      )}
                      {debt.minimumPayment > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-text-secondary)]">Minimum Payment</span>
                          <AmountDisplay amount={debt.minimumPayment} currency={settings.currency} size="sm" />
                        </div>
                      )}
                      {debt.remainingPayments > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--color-text-secondary)]">Remaining Payments</span>
                          <span>{debt.remainingPayments}</span>
                        </div>
                      )}
                      {debt.notes && (
                        <div className="text-sm">
                          <span className="text-[var(--color-text-secondary)]">Notes:</span>
                          <p className="mt-0.5">{debt.notes}</p>
                        </div>
                      )}
                      {payments.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs font-medium text-[var(--color-text-secondary)]">Payment History</span>
                          <div className="mt-1 space-y-1">
                            {payments.slice(0, 5).map((p) => (
                              <div key={p.id} className="flex justify-between text-xs">
                                <span className="text-[var(--color-text-muted)]">{p.date}</span>
                                <AmountDisplay amount={p.amount} currency={settings.currency} size="sm" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="pt-2">
                        <Button
                          variant="danger"
                          size="sm"
                          fullWidth
                          onClick={() => deleteDebt(debt.id)}
                        >
                          <Trash2 size={14} /> Delete Debt
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<CreditCard size={28} />}
            title="No debts"
            description="Add your debts to track repayment progress and stay on top of payments."
            action={
              <Button onClick={() => setShowAdd(true)}>
                <Plus size={16} /> Add Debt
              </Button>
            }
          />
        )}
      </div>

      {/* Add Debt Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Debt" size="md">
        <div className="space-y-4">
          <Input
            label="Debt Name"
            placeholder="e.g., Credit Card, Loan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <Input
            label="Original Amount"
            type="number"
            placeholder="0"
            value={originalAmount}
            onChange={(e) => {
              setOriginalAmount(e.target.value);
              if (!currentAmount) setCurrentAmount(e.target.value);
            }}
          />
          <Input
            label="Current Outstanding"
            type="number"
            placeholder="0"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Interest Rate (%)"
              type="number"
              placeholder="0"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
            <Input
              label="EMI Amount"
              type="number"
              placeholder="0"
              value={emiAmount}
              onChange={(e) => setEmiAmount(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <Input
              label="Remaining Payments"
              type="number"
              placeholder="0"
              value={remainingPayments}
              onChange={(e) => setRemainingPayments(e.target.value)}
            />
          </div>
          <Input
            label="Notes (optional)"
            placeholder="Any notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button fullWidth onClick={handleAdd} disabled={!name || !originalAmount}>
            Add Debt
          </Button>
        </div>
      </Modal>

      {/* Pay Debt Modal */}
      <Modal
        isOpen={!!showPayModal}
        onClose={() => { setShowPayModal(null); setPayAmount(''); }}
        title="Make Payment"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Amount"
            type="number"
            placeholder="0"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            autoFocus
          />
          <Button
            fullWidth
            variant="success"
            onClick={() => showPayModal && handlePay(showPayModal)}
            disabled={!payAmount}
          >
            <DollarSign size={16} /> Confirm Payment
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
