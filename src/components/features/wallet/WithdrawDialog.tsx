'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Info, ArrowUpRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aptBalance: number;
}

export function WithdrawDialog({ open, onOpenChange, aptBalance }: WithdrawDialogProps) {
  const [amount, setAmount] = useState('100');
  const [walletAddress, setWalletAddress] = useState('');
  const exchangeRate = 1; // 1 APT = 1 USDT
  const withdrawalFee = 0.5; // 提现手续费百分比

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleMaxAmount = () => {
    setAmount(aptBalance.toString());
  };

  const handleWithdraw = () => {
    // TODO: Implement withdraw logic
    console.log('Withdrawing:', amount, 'to', walletAddress);
    onOpenChange(false);
  };

  const usdtAmount = parseFloat(amount || '0') * exchangeRate;
  const fee = usdtAmount * (withdrawalFee / 100);
  const actualAmount = usdtAmount - fee;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-purple-100 p-6 max-h-[90vh] overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          {/* Header */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <ArrowUpRight className="w-5 h-5 text-orange-600" />
              </div>
              <Dialog.Title className="text-xl font-semibold text-gray-800">
                提现
              </Dialog.Title>
            </div>
            <Dialog.Description className="text-sm text-gray-600">
              将您的平台币 APT 兑换为 USDT
            </Dialog.Description>
          </div>

          {/* Exchange Rate Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  当前汇率：1 APT = 1 USDT
                </p>
                <p className="text-sm text-blue-700">
                  您的 APT 余额：{aptBalance.toFixed(2)}
                </p>
                <p className="text-sm text-blue-700">
                  提现手续费：{withdrawalFee}%
                </p>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2 mb-4">
            <label htmlFor="withdraw-amount" className="block text-sm font-medium text-gray-800">
              提现金额 (APT)
            </label>
            <div className="relative">
              <input
                id="withdraw-amount"
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

          {/* Wallet Address Input */}
          <div className="space-y-2 mb-4">
            <label htmlFor="wallet-address" className="block text-sm font-medium text-gray-800">
              提现地址 (ETHEREUM)
            </label>
            <input
              id="wallet-address"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white"
              placeholder="0x..."
            />
            <p className="text-xs text-gray-500">请输入 ETHEREUM 网络的钱包地址</p>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-xl p-4 mb-4 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">兑换金额</p>
              <p className="text-sm font-medium text-gray-800">{usdtAmount.toFixed(2)} USDT</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">手续费</p>
              <p className="text-sm font-medium text-orange-600">-{fee.toFixed(2)} USDT</p>
            </div>
            <div className="border-t border-orange-200 pt-2">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">实际到账</p>
                <p className="text-xl font-bold text-orange-600">{actualAmount.toFixed(2)} USDT</p>
              </div>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2 mb-4">
            <label className="block text-sm font-medium text-gray-800">快捷金额</label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 50, 100, 500].map((value) => (
                <button
                  key={value}
                  onClick={() => handleQuickAmount(value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    amount === value.toString()
                      ? 'bg-orange-100 border-orange-300 text-orange-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-200'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                请仔细核对提现地址，转账一旦发起将无法撤销
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleWithdraw}
              disabled={
                !amount ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > aptBalance ||
                !walletAddress ||
                walletAddress.length < 10
              }
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg disabled:opacity-50"
            >
              确认提现
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
