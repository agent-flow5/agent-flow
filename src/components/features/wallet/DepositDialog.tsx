'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Info, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usdtBalance: number;
}

export function DepositDialog({ open, onOpenChange, usdtBalance }: DepositDialogProps) {
  const [amount, setAmount] = useState('100');
  const exchangeRate = 1; // 1 USDT = 1 APT

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleMaxAmount = () => {
    setAmount(usdtBalance.toString());
  };

  const handleDeposit = () => {
    // TODO: Implement deposit logic
    console.log('Depositing:', amount);
    onOpenChange(false);
  };

  const aptAmount = parseFloat(amount || '0') * exchangeRate;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-purple-100 p-6 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          {/* Header */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <ArrowDownLeft className="w-5 h-5 text-purple-600" />
              </div>
              <Dialog.Title className="text-xl font-semibold text-gray-800">
                充值
              </Dialog.Title>
            </div>
            <Dialog.Description className="text-sm text-gray-600">
              将您的 USDT 兑换为平台币 APT
            </Dialog.Description>
          </div>

          {/* Exchange Rate Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  当前汇率：1 USDT = 1 APT
                </p>
                <p className="text-sm text-blue-700">
                  您的 USDT 余额：{usdtBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2 mb-4">
            <label htmlFor="deposit-amount" className="block text-sm font-medium text-gray-800">
              充值金额 (USDT)
            </label>
            <div className="relative">
              <input
                id="deposit-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 pr-20 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white"
                placeholder="100"
              />
              <button
                onClick={handleMaxAmount}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
              >
                最大
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-600 mb-1">您将获得</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {aptAmount.toFixed(2)} APT
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-medium text-gray-800">快捷金额</label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 50, 100, 500].map((value) => (
                <button
                  key={value}
                  onClick={() => handleQuickAmount(value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    amount === value.toString()
                      ? 'bg-purple-100 border-purple-300 text-purple-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-200'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleDeposit}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > usdtBalance}
              className="flex-1"
            >
              确认充值
            </Button>
          </div>

          {/* Close Button */}
          <Dialog.Close className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
