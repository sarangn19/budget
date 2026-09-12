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
import { calculateAccountBalance } from '../utils/calculations';
import { getToday } from '../utils/helpers';
import type { AccountType } from '../types';
import {
  Plus,
  Landmark,
  Wallet,
  CreditCard,
  PiggyBank,
  Banknote,
  MoreVertical,
  Pencil,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';

const accountTypeIcons: Record<AccountType, React.ReactNode> = {
  bank: <Landmark size={20} />,
  cash: <Banknote size={20} />,
  wallet: <Wallet size={20} />,
  savings: <PiggyBank size={20} />,
  other: <CreditCard size={20} />,
};

const accountTypeLabels: Record<AccountType, string> = {
  bank: 'Bank Account',
  cash: 'Cash',
  wallet: 'Wallet',
  savings: 'Savings',
  other: 'Other',
};

export default function Accounts() {
  const { accounts, transactions, settings, addAccount, updateAccount, deleteAccount, addTransaction, categories } = useStore();

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [adjustAccountId, setAdjustAccountId] = useState<string | null>(null);
  const [adjustNewBalance, setAdjustNewBalance] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [openingBalance, setOpeningBalance] = useState('');

  const handleAdd = () => {
    if (!name) return;
    addAccount(name, type, parseFloat(openingBalance) || 0);
    setName('');
    setOpeningBalance('');
    setShowAdd(false);
  };

  const handleEdit = (id: string) => {
    const account = accounts.find((a) => a.id === id);
    if (!account) return;
    setEditingId(id);
    setName(account.name);
    setType(account.type);
    setOpeningBalance(account.openingBalance.toString());
    setShowAdd(true);
    setShowMenu(null);
  };

  const handleUpdate = () => {
    if (!editingId || !name) return;
    updateAccount(editingId, {
      name,
      type,
      openingBalance: parseFloat(openingBalance) || 0,
    });
    setEditingId(null);
    setName('');
    setOpeningBalance('');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    deleteAccount(id);
    setShowMenu(null);
  };

  const handleAdjustBalance = () => {
    if (!adjustAccountId) return;
    const account = accounts.find((a) => a.id === adjustAccountId);
    if (!account) return;

    const currentBalance = calculateAccountBalance(account, transactions);
    const newBalance = parseFloat(adjustNewBalance) || 0;
    const diff = newBalance - currentBalance;

    if (diff === 0) {
      setAdjustAccountId(null);
      setAdjustNewBalance('');
      return;
    }

    // Find or create an adjustment category
    const adjustmentCategory = categories.find((c) => c.name === 'Adjustment' && c.type === (diff > 0 ? 'income' : 'expense'));

    if (adjustmentCategory) {
      addTransaction({
        amount: Math.abs(diff),
        type: diff > 0 ? 'income' : 'expense',
        categoryId: adjustmentCategory.id,
        accountId: adjustAccountId,
        date: getToday(),
        note: 'Balance adjustment',
        isRecurring: false,
      });
    }

    setAdjustAccountId(null);
    setAdjustNewBalance('');
  };

  const totalBalance = accounts.reduce(
    (sum, a) => sum + calculateAccountBalance(a, transactions),
    0
  );

  return (
    <AppLayout
      header={
        <PageHeader
          title="Accounts"
          action={
            <Button variant="primary" size="sm" onClick={() => { setEditingId(null); setShowAdd(true); }}>
              <Plus size={16} /> Add
            </Button>
          }
        />
      }
    >
      <div className="px-5 space-y-5 animate-fadeIn">
        {/* Total Balance */}
        <Card className="bg-gradient-to-br from-[#1e293b] to-[#334155] text-white border-0" padding="lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-white/70 font-medium">Total Balance</span>
          </div>
          <AmountDisplay amount={totalBalance} currency={settings.currency} size="xl" className="text-white" />
        </Card>

        {/* Accounts List */}
        {accounts.length > 0 ? (
          <div className="space-y-3">
            {accounts.map((account) => {
              const balance = calculateAccountBalance(account, transactions);
              return (
                <Card key={account.id} padding="md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-dim)] flex items-center justify-center text-[var(--color-text-secondary)]">
                      {accountTypeIcons[account.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold truncate">{account.name}</span>
                        <div className="relative">
                          <button
                            onClick={() => setShowMenu(showMenu === account.id ? null : account.id)}
                            className="p-1 rounded-lg hover:bg-[var(--color-surface-dim)]"
                          >
                            <MoreVertical size={14} className="text-[var(--color-text-muted)]" />
                          </button>
                          {showMenu === account.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(null)} />
                              <div className="absolute right-0 top-8 z-50 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-lg min-w-[140px] animate-scaleIn">
                                <button
                                  onClick={() => handleEdit(account.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-surface-dim)] first:rounded-t-xl"
                                >
                                  <Pencil size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setAdjustAccountId(account.id);
                                    setAdjustNewBalance(balance.toString());
                                    setShowMenu(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--color-surface-dim)]"
                                >
                                  <SlidersHorizontal size={14} /> Adjust Balance
                                </button>
                                <button
                                  onClick={() => handleDelete(account.id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-red-50 last:rounded-b-xl"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {accountTypeLabels[account.type]}
                        </span>
                        <AmountDisplay
                          amount={balance}
                          currency={settings.currency}
                          size="sm"
                          colorize
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Landmark size={28} />}
            title="No accounts"
            description="Add your bank accounts, cash, and wallets to track your balances."
            action={
              <Button onClick={() => setShowAdd(true)}>
                <Plus size={16} /> Add Account
              </Button>
            }
          />
        )}
      </div>

      {/* Add/Edit Account Modal */}
      <Modal
        isOpen={showAdd}
        onClose={() => { setShowAdd(false); setEditingId(null); }}
        title={editingId ? 'Edit Account' : 'Add Account'}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Account Name"
            placeholder="e.g., SBI Savings"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <Select
            label="Account Type"
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
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
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
          />
          <Button fullWidth onClick={editingId ? handleUpdate : handleAdd} disabled={!name}>
            {editingId ? 'Update Account' : 'Add Account'}
          </Button>
        </div>
      </Modal>

      {/* Adjust Balance Modal */}
      <Modal
        isOpen={!!adjustAccountId}
        onClose={() => { setAdjustAccountId(null); setAdjustNewBalance(''); }}
        title="Adjust Balance"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Set the correct balance for this account. A correction transaction will be created.
          </p>
          <Input
            label="New Balance"
            type="number"
            placeholder="0"
            value={adjustNewBalance}
            onChange={(e) => setAdjustNewBalance(e.target.value)}
            autoFocus
          />
          <Button fullWidth onClick={handleAdjustBalance}>
            Update Balance
          </Button>
        </div>
      </Modal>
    </AppLayout>
  );
}
