import { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import useStore from '../store/useStore';
import type { Currency, AccountType } from '../types';
import { CURRENCY_SYMBOLS } from '../utils/helpers';
import {
  Wallet,
  Calendar,
  Landmark,
  Shield,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';

const steps = [
  { id: 'currency', title: 'Choose Currency', subtitle: 'Select your preferred currency' },
  { id: 'salary', title: 'Salary Day', subtitle: 'When do you receive your salary?' },
  { id: 'account', title: 'First Account', subtitle: 'Add your primary bank account' },
  { id: 'buffer', title: 'Safety Buffer', subtitle: 'Set aside an emergency reserve' },
];

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { updateSettings, addAccount, settings } = useStore();
  const [step, setStep] = useState(0);

  const [currency, setCurrency] = useState<Currency>(settings.currency);
  const [salaryDay, setSalaryDay] = useState(settings.salaryDay.toString());
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('bank');
  const [accountBalance, setAccountBalance] = useState('');
  const [buffer, setBuffer] = useState(settings.safetyBuffer.toString());

  const handleComplete = () => {
    updateSettings({
      currency,
      salaryDay: parseInt(salaryDay) || 1,
      safetyBuffer: parseFloat(buffer) || 2000,
      hasOnboarded: true,
    });

    if (accountName) {
      addAccount(accountName, accountType, parseFloat(accountBalance) || 0);
    }

    onComplete();
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else handleComplete();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[var(--color-surface-dim)] flex flex-col">
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8 flex flex-col">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-8 bg-[var(--color-accent)]'
                  : i < step
                  ? 'w-4 bg-[var(--color-accent)]/40'
                  : 'w-4 bg-[var(--color-border)]'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 flex flex-col animate-fadeIn" key={step}>
          {step === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text)]">{steps[0].title}</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">{steps[0].subtitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(CURRENCY_SYMBOLS) as Currency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`p-4 rounded-2xl border-2 transition-all text-center ${
                      currency === c
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
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text)]">{steps[1].title}</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">{steps[1].subtitle}</p>
              </div>
              <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border-light)]">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar size={20} className="text-[var(--color-accent)]" />
                  <span className="text-sm font-semibold">Day of the month</span>
                </div>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={salaryDay}
                  onChange={(e) => setSalaryDay(e.target.value)}
                  className="w-full text-center text-3xl font-bold py-4 bg-[var(--color-surface-dim)] rounded-xl border border-[var(--color-border-light)] focus:border-[var(--color-accent)] outline-none transition-colors"
                  style={{ fontSize: '16px' }}
                />
                <p className="text-xs text-[var(--color-text-muted)] text-center mt-3">
                  Typically between 1 and 28
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text)]">{steps[2].title}</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">{steps[2].subtitle}</p>
              </div>
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
                  onChange={(e) => setAccountType(e.target.value as AccountType)}
                  options={[
                    { value: 'bank', label: 'Bank Account' },
                    { value: 'savings', label: 'Savings Account' },
                    { value: 'cash', label: 'Cash' },
                    { value: 'wallet', label: 'Wallet' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
                <Input
                  label="Current Balance"
                  type="number"
                  placeholder="0"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-[var(--color-text)]">{steps[3].title}</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">{steps[3].subtitle}</p>
              </div>
              <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border-light)]">
                <div className="flex items-center gap-3 mb-4">
                  <Shield size={20} className="text-[var(--color-accent)]" />
                  <span className="text-sm font-semibold">Emergency reserve</span>
                </div>
                <Input
                  label="Buffer Amount"
                  type="number"
                  placeholder="0"
                  value={buffer}
                  onChange={(e) => setBuffer(e.target.value)}
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                  This amount is excluded from your Safe to Spend calculation, ensuring you always have funds reserved.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button variant="secondary" onClick={prev} className="flex items-center gap-1">
              <ChevronLeft size={16} /> Back
            </Button>
          )}
          <Button fullWidth onClick={next} className="flex items-center justify-center gap-1">
            {step === steps.length - 1 ? (
              <>
                <Check size={16} /> Get Started
              </>
            ) : (
              <>
                Next <ChevronRight size={16} />
              </>
            )}
          </Button>
        </div>

        {/* Skip */}
        {step < steps.length - 1 && (
          <button
            onClick={handleComplete}
            className="mt-4 text-xs text-[var(--color-text-muted)] text-center hover:text-[var(--color-text-secondary)]"
          >
            Skip setup
          </button>
        )}
      </div>
    </div>
  );
}
