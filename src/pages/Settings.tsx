import { useState } from 'react';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import useStore from '../store/useStore';
import { formatCurrency } from '../utils/helpers';
import { Shield, Database, Info, Calendar, Globe } from 'lucide-react';
import type { Currency } from '../types';
import { CURRENCY_SYMBOLS } from '../utils/helpers';

export default function Settings() {
  const { settings, updateSettings } = useStore();
  const [showBufferModal, setShowBufferModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [buffer, setBuffer] = useState(settings.safetyBuffer.toString());
  const [salaryDay, setSalaryDay] = useState(settings.salaryDay.toString());

  const handleSaveBuffer = () => {
    updateSettings({ safetyBuffer: parseFloat(buffer) || 0 });
    setShowBufferModal(false);
  };

  const handleSaveSalaryDay = () => {
    const day = parseInt(salaryDay);
    if (day >= 1 && day <= 31) {
      updateSettings({ salaryDay: day });
    }
    setShowSalaryModal(false);
  };

  const handleExport = () => {
    const data = localStorage.getItem('budget-planner-storage');
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <AppLayout header={<PageHeader title="Settings" />}>
      <div className="px-4 space-y-4 animate-fadeIn">
        {/* Currency */}
        <Card padding="md" onClick={() => setShowCurrencyModal(true)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
              <Globe size={18} className="text-[var(--color-accent)]" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold block">Currency</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                Display currency for all amounts
              </span>
            </div>
            <span className="text-sm font-medium">
              {CURRENCY_SYMBOLS[settings.currency]} {settings.currency}
            </span>
          </div>
        </Card>

        {/* Salary Day */}
        <Card padding="md" onClick={() => setShowSalaryModal(true)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center">
              <Calendar size={18} className="text-[var(--color-success)]" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold block">Salary Day</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                Day of month you receive your salary
              </span>
            </div>
            <span className="text-sm font-medium">{settings.salaryDay}</span>
          </div>
        </Card>

        {/* Safety Buffer */}
        <Card padding="md" onClick={() => setShowBufferModal(true)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-warning)]/10 flex items-center justify-center">
              <Shield size={18} className="text-[var(--color-warning)]" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold block">Safety Buffer</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                Amount kept aside for emergencies in Safe to Spend calculation
              </span>
            </div>
            <span className="text-sm font-medium">
              {formatCurrency(settings.safetyBuffer, settings.currency)}
            </span>
          </div>
        </Card>

        {/* Export Data */}
        <Card padding="md" onClick={handleExport}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center">
              <Database size={18} className="text-[var(--color-success)]" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold block">Export Data</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                Download a backup of all your data
              </span>
            </div>
          </div>
        </Card>

        {/* About */}
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-dim)] flex items-center justify-center">
              <Info size={18} className="text-[var(--color-text-muted)]" />
            </div>
            <div>
              <span className="text-sm font-semibold block">Budget Planner</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                Your data stays on this device. No bank connections. No syncing.
              </span>
            </div>
          </div>
        </Card>

        <p className="text-[10px] text-[var(--color-text-muted)] text-center">
          This is a personal finance tool. It does not provide professional financial advice.
        </p>
      </div>

      {/* Currency Modal */}
      <Modal isOpen={showCurrencyModal} onClose={() => setShowCurrencyModal(false)} title="Currency" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Choose the currency used to display all amounts throughout the app.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(CURRENCY_SYMBOLS) as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => {
                  updateSettings({ currency: c });
                  setShowCurrencyModal(false);
                }}
                className={`p-4 rounded-2xl border-2 transition-all text-center ${
                  settings.currency === c
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                    : 'border-[var(--color-border-light)] bg-[var(--color-surface)]'
                }`}
              >
                <span className="text-2xl font-bold">{CURRENCY_SYMBOLS[c]}</span>
                <span className="block text-xs text-[var(--color-text-secondary)] mt-1">{c}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Salary Day Modal */}
      <Modal isOpen={showSalaryModal} onClose={() => setShowSalaryModal(false)} title="Salary Day" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Set the day of the month you receive your salary. This is used to show a countdown on the Dashboard.
          </p>
          <Input
            label="Day of month"
            type="number"
            min={1}
            max={31}
            placeholder="1"
            value={salaryDay}
            onChange={(e) => setSalaryDay(e.target.value)}
          />
          <p className="text-xs text-[var(--color-text-muted)]">
            Typically between 1 and 28.
          </p>
          <Button fullWidth onClick={handleSaveSalaryDay}>
            Save
          </Button>
        </div>
      </Modal>

      {/* Safety Buffer Modal */}
      <Modal isOpen={showBufferModal} onClose={() => setShowBufferModal(false)} title="Safety Buffer" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Set a safety buffer amount that will be deducted from your Safe to Spend calculation.
            This ensures you always have a minimum amount reserved.
          </p>
          <Input
            label="Buffer Amount"
            type="number"
            placeholder="0"
            value={buffer}
            onChange={(e) => setBuffer(e.target.value)}
          />
          <Button fullWidth onClick={handleSaveBuffer}>
            Save
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
