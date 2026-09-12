import { useState } from 'react';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import useStore from '../store/useStore';
import { calculateGoalProgress, calculateRequiredMonthlyContribution } from '../utils/calculations';
import { formatCurrency } from '../utils/helpers';
import {
  Plus,
  Target,
  Calendar,
  TrendingUp,
  Trash2,
  Edit3,
  CheckCircle2,
} from 'lucide-react';

const GOAL_ICONS = ['🎯', '🏠', '✈️', '💻', '📱', '🚗', '💍', '📚', '🏖️', '🎉', '💰', '🎓'];

export default function Goals() {
  const { goals, settings, addGoal, updateGoal, deleteGoal } = useStore();

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showContribute, setShowContribute] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [icon, setIcon] = useState('🎯');

  // Contribute form state
  const [contributeAmount, setContributeAmount] = useState('');

  const handleAdd = () => {
    if (!name || !targetAmount) return;
    const goalData = {
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate: targetDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      monthlyContribution: parseFloat(monthlyContribution) || 0,
      icon,
    };

    if (editingId) {
      updateGoal(editingId, goalData);
      setEditingId(null);
    } else {
      addGoal(goalData);
    }
    resetForm();
    setShowAdd(false);
  };

  const handleContribute = (goalId: string) => {
    if (!contributeAmount) return;
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    updateGoal(goalId, {
      currentAmount: goal.currentAmount + parseFloat(contributeAmount),
    });
    setContributeAmount('');
    setShowContribute(null);
  };

  const handleEdit = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    setEditingId(id);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setTargetDate(goal.targetDate);
    setMonthlyContribution(goal.monthlyContribution.toString());
    setIcon(goal.icon);
    setShowAdd(true);
  };

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setMonthlyContribution('');
    setIcon('🎯');
  };

  return (
    <AppLayout
      header={
        <PageHeader
          title="Goals"
          action={
            <Button variant="primary" size="sm" onClick={() => { setEditingId(null); resetForm(); setShowAdd(true); }}>
              <Plus size={16} /> Add
            </Button>
          }
        />
      }
    >
      <div className="px-4 space-y-4 animate-fadeIn">
        {goals.length > 0 ? (
          <div className="space-y-3">
            {goals.map((goal) => {
              const progress = calculateGoalProgress(goal);
              const isComplete = progress >= 100;
              const requiredMonthly = calculateRequiredMonthlyContribution(goal);

              return (
                <Card key={goal.id} padding="md">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{goal.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{goal.name}</span>
                        {isComplete && (
                          <CheckCircle2 size={16} className="text-[var(--color-success)]" />
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-0.5">
                          <Calendar size={10} /> {goal.targetDate}
                        </span>
                        {!isComplete && requiredMonthly > 0 && (
                          <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-0.5">
                            <TrendingUp size={10} /> {formatCurrency(requiredMonthly, settings.currency)}/mo needed
                          </span>
                        )}
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <AmountDisplay
                            amount={goal.currentAmount}
                            currency={settings.currency}
                            size="sm"
                          />
                          <AmountDisplay
                            amount={goal.targetAmount}
                            currency={settings.currency}
                            size="sm"
                            className="text-[var(--color-text-muted)]"
                          />
                        </div>
                        <ProgressBar
                          value={progress}
                          color={isComplete ? 'success' : progress >= 60 ? 'accent' : 'warning'}
                          size="sm"
                        />
                      </div>

                      {!isComplete && (
                        <div className="mt-3">
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            onClick={() => setShowContribute(goal.id)}
                          >
                            Add Money
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-1 mt-2">
                        <button
                          onClick={() => handleEdit(goal.id)}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-dim)]"
                        >
                          <Edit3 size={14} className="text-[var(--color-text-muted)]" />
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 size={14} className="text-[var(--color-danger)]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Target size={28} />}
            title="No goals yet"
            description="Set financial goals to save for things that matter to you."
            action={
              <Button onClick={() => setShowAdd(true)}>
                <Plus size={16} /> Create Goal
              </Button>
            }
          />
        )}
      </div>

      {/* Add/Edit Goal Modal */}
      <Modal
        isOpen={showAdd}
        onClose={() => { setShowAdd(false); setEditingId(null); resetForm(); }}
        title={editingId ? 'Edit Goal' : 'Add Goal'}
        size="sm"
      >
        <div className="space-y-4">
          {/* Icon Selector */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {GOAL_ICONS.map((g) => (
                <button
                  key={g}
                  onClick={() => setIcon(g)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    icon === g
                      ? 'bg-[var(--color-accent)] scale-110'
                      : 'bg-[var(--color-surface-dim)] hover:bg-[var(--color-border)]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Goal Name"
            placeholder="e.g., Emergency Fund"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <Input
            label="Target Amount"
            type="number"
            placeholder="0"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
          />

          <Input
            label="Current Amount"
            type="number"
            placeholder="0"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
          />

          <Input
            label="Target Date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />

          <Input
            label="Monthly Contribution"
            type="number"
            placeholder="0"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
          />

          <Button fullWidth onClick={handleAdd} disabled={!name || !targetAmount}>
            {editingId ? 'Update Goal' : 'Create Goal'}
          </Button>
        </div>
      </Modal>

      {/* Contribute Modal */}
      <Modal
        isOpen={!!showContribute}
        onClose={() => { setShowContribute(null); setContributeAmount(''); }}
        title="Add Money"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Amount"
            type="number"
            placeholder="0"
            value={contributeAmount}
            onChange={(e) => setContributeAmount(e.target.value)}
            autoFocus
          />
          <Button
            fullWidth
            variant="success"
            onClick={() => showContribute && handleContribute(showContribute)}
            disabled={!contributeAmount}
          >
            <TrendingUp size={16} /> Add to Goal
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
