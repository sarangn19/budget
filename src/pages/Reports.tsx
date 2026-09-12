import { useState, useMemo } from 'react';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Card, CardHeader } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { EmptyState } from '../components/ui/EmptyState';
import { CashFlowTimeline } from '../components/charts/CashFlowTimeline';
import useStore from '../store/useStore';
import {
  getSpendingByCategory,
  getMonthlySpendingHistory,
  getCashFlowTimeline,
  getSpendingInsights,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateNetCashFlow,
} from '../utils/calculations';
import { getMonthKey, getMonthLabel, getStartOfMonth } from '../utils/helpers';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  Activity,
  Lightbulb,
  TrendingUp as TrendingUpIcon,
  PiggyBank,
  Target,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

const insightIcons: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUpIcon size={16} className="text-[var(--color-warning)]" />,
  TrendingDown: <TrendingDown size={16} className="text-[var(--color-success)]" />,
  PiggyBank: <PiggyBank size={16} className="text-[var(--color-accent)]" />,
  Target: <Target size={16} className="text-[var(--color-success)]" />,
  AlertTriangle: <AlertTriangle size={16} className="text-[var(--color-danger)]" />,
  CheckCircle: <CheckCircle size={16} className="text-[var(--color-success)]" />,
};

export default function Reports() {
  const { transactions, categories, settings, debts, goals, accounts } = useStore();
  const [activeTab, setActiveTab] = useState('spending');

  const monthKey = getMonthKey();
  const monthLabel = getMonthLabel(monthKey);

  const spendingByCategory = useMemo(() => getSpendingByCategory(transactions, getStartOfMonth()), [transactions]);
  const monthlyHistory = useMemo(() => getMonthlySpendingHistory(transactions, 6), [transactions]);
  const cashFlowTimeline = useMemo(() => getCashFlowTimeline(transactions, accounts, 6), [transactions, accounts]);
  const insights = useMemo(
    () => getSpendingInsights(transactions, debts, goals, accounts, settings.safetyBuffer),
    [transactions, debts, goals, accounts, settings.safetyBuffer]
  );

  const monthlyIncome = calculateMonthlyIncome(transactions, getStartOfMonth());
  const monthlyExpenses = calculateMonthlyExpenses(transactions, getStartOfMonth());
  const cashFlow = calculateNetCashFlow(transactions, getStartOfMonth());

  const maxCategoryAmount = spendingByCategory.length > 0 ? spendingByCategory[0].amount : 0;

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || 'Unknown';
  const getCategoryColor = (id: string) => categories.find((c) => c.id === id)?.color || '#64748b';

  const tabs = [
    { id: 'spending', label: 'Spending', icon: <PieChart size={14} /> },
    { id: 'trend', label: 'Trend', icon: <TrendingUp size={14} /> },
    { id: 'timeline', label: 'Timeline', icon: <Activity size={14} /> },
    { id: 'insights', label: 'Insights', icon: <Lightbulb size={14} /> },
  ];

  return (
    <AppLayout
      header={<PageHeader title="Reports" subtitle={monthLabel} />}
    >
      <div className="px-4 space-y-4 animate-fadeIn">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Spending by Category */}
        {activeTab === 'spending' && (
          <>
            {spendingByCategory.length > 0 ? (
              <Card padding="md">
                <CardHeader title="Spending by Category" subtitle={`${monthLabel}`} />
                <div className="space-y-3">
                  {spendingByCategory.map((item) => (
                    <div key={item.categoryId}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getCategoryColor(item.categoryId) }}
                          />
                          <span className="text-sm font-medium">{getCategoryName(item.categoryId)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AmountDisplay amount={item.amount} currency={settings.currency} size="sm" />
                          <span className="text-[10px] text-[var(--color-text-muted)] w-10 text-right">
                            {Math.round(item.percentage)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-[var(--color-surface-dim)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.amount / maxCategoryAmount) * 100}%`,
                            backgroundColor: getCategoryColor(item.categoryId),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <EmptyState
                icon={<PieChart size={28} />}
                title="No spending data"
                description="Add expense transactions to see your spending breakdown."
              />
            )}
          </>
        )}

        {/* Monthly Trend */}
        {activeTab === 'trend' && (
          <>
            {monthlyHistory.some((m) => m.income > 0 || m.expenses > 0) ? (
              <Card padding="md">
                <CardHeader title="Monthly Trend" subtitle="Last 6 months" />
                <div className="space-y-3">
                  {monthlyHistory.map((month) => {
                    const maxValue = Math.max(month.income, month.expenses, 1);
                    return (
                      <div key={month.month}>
                        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                          {month.month}
                        </span>
                        <div className="space-y-1 mt-1">
                          <div className="flex items-center gap-2">
                            <div className="w-16 text-[10px] text-[var(--color-text-muted)]">Income</div>
                            <div className="flex-1 h-4 bg-[var(--color-surface-dim)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[var(--color-success)] rounded-full"
                                style={{ width: `${(month.income / maxValue) * 100}%` }}
                              />
                            </div>
                            <AmountDisplay amount={month.income} currency={settings.currency} size="sm" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 text-[10px] text-[var(--color-text-muted)]">Expenses</div>
                            <div className="flex-1 h-4 bg-[var(--color-surface-dim)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[var(--color-danger)] rounded-full"
                                style={{ width: `${(month.expenses / maxValue) * 100}%` }}
                              />
                            </div>
                            <AmountDisplay amount={month.expenses} currency={settings.currency} size="sm" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ) : (
              <EmptyState
                icon={<BarChart3 size={28} />}
                title="No trend data"
                description="Add transactions over multiple months to see trends."
              />
            )}
          </>
        )}

        {/* Cash Flow Timeline */}
        {activeTab === 'timeline' && (
          <>
            {cashFlowTimeline.some((m) => m.income > 0 || m.expenses > 0) ? (
              <CashFlowTimeline data={cashFlowTimeline} currency={settings.currency} />
            ) : (
              <EmptyState
                icon={<Activity size={28} />}
                title="No timeline data"
                description="Add transactions to see your cash flow timeline."
              />
            )}
          </>
        )}

        {/* Insights */}
        {activeTab === 'insights' && (
          <>
            {insights.length > 0 ? (
              <div className="space-y-3">
                <Card padding="md">
                  <CardHeader title="Financial Insights" subtitle="Based on your recent activity" />
                </Card>
                {insights.map((insight) => (
                  <Card key={insight.id} padding="md">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-dim)] flex items-center justify-center mt-0.5 shrink-0">
                        {insightIcons[insight.icon] || <Lightbulb size={16} className="text-[var(--color-text-muted)]" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-semibold block">{insight.title}</span>
                        <span className="text-xs text-[var(--color-text-muted)] leading-relaxed block mt-0.5">
                          {insight.description}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Lightbulb size={28} />}
                title="No insights yet"
                description="Add more transactions to get personalized financial insights."
              />
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
