import { useState } from 'react';
import { AppLayout, PageHeader } from '../components/layout/AppLayout';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import useStore from '../store/useStore';
import { Settings as SettingsIcon, Shield, Database, Info } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings } = useStore();
  const [showBufferModal, setShowBufferModal] = useState(false);
  const [buffer, setBuffer] = useState(settings.safetyBuffer.toString());

  const handleSaveBuffer = () => {
    updateSettings({ safetyBuffer: parseFloat(buffer) || 0 });
    setShowBufferModal(false);
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
        {/* Safety Buffer */}
        <Card padding="md" onClick={() => setShowBufferModal(true)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
              <Shield size={18} className="text-[var(--color-accent)]" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-semibold block">Safety Buffer</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                Amount kept aside for emergencies in Safe to Spend calculation
              </span>
            </div>
            <span className="text-sm font-medium">
              ₹{settings.safetyBuffer.toLocaleString('en-IN')}
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
