import { useState, useMemo } from 'react';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Card, CardHeader } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { AmountDisplay } from '../components/ui/AmountDisplay';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/EmptyState';
import useStore from '../store/useStore';
import {
  getSpendingByCategory,
  getMonthlySpendingHistory,
  calculateMonthlyIncome,
  calculateMonthlyExpenses,
  calculateNetCashFlow,
} from '../utils/calculations';
import { getMonthKey, getMonthLabel, getStartOfMonth } from '../utils/helpers';
import { BarChart3, TrendingUp, TrendingDown, PieChart } from 'lucide-react';

export default function Reports() {
  const { transactions, categories, settings } = useStore();
  const [activeTab, setActiveTab] = useState('spending');

  const monthKey = getMonthKey();
  const monthLabel = getMonthLabel(monthKey);

  const spendingByCategory = useMemo(() => getSpendingByCategory(transactions, getStartOfMonth()), [transactions]);
  const monthlyHistory = useMemo(() => getMonthlySpendingHistory(transactions, 6), [transactions]);

  const monthlyIncome = calculateMonthlyIncome(transactions, getStartOfMonth());
  const monthlyExpenses = calculateMonthlyExpenses(transactions, getStartOfMonth());
  const cashFlow = calculateNetCashFlow(transactions, getStartOfMonth());

  const maxCategoryAmount = spendingByCategory.length > 0 ? spendingByCategory[0].amount : 0;

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || 'Unknown';
  const getCategoryColor = (id: string) => categories.find((c) => c.id === id)?.color || '#64748b';

  const tabs = [
    { id: 'spending', label: 'Spending', icon: <PieChart size={14} /> },
    { id: 'trend', label: 'Trend', icon: <TrendingUp size={14} /> },
    { id: 'income', label: 'Income', icon: <TrendingDown size={14} /> },
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

        {/* Income Summary */}
        {activeTab === 'income' && (
          <Card padding="md">
            <CardHeader title="Income Summary" subtitle={`${monthLabel}`} />
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[var(--color-border-light)]">
                <span className="text-sm text-[var(--color-text-secondary)]">Monthly Income</span>
                <AmountDisplay amount={monthlyIncome} currency={settings.currency} size="md" colorize />
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[var(--color-border-light)]">
                <span className="text-sm text-[var(--color-text-secondary)]">Monthly Expenses</span>
                <AmountDisplay amount={monthlyExpenses} currency={settings.currency} size="md" colorize />
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium">Net Cash Flow</span>
                <AmountDisplay amount={cashFlow} currency={settings.currency} size="md" colorize />
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
