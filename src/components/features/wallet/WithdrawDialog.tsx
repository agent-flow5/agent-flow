'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Info, ArrowUpRight, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { walletService } from '@/lib/api/services/wallet';
import { useToast } from '@/contexts/ToastContext';
import { withdrawPlatformToken } from '@/lib/contracts/utils';
import { useWalletStore } from '@/store/walletStore';

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aptBalance: number;
  onSuccess?: () => void;
}

export function WithdrawDialog({ open, onOpenChange, aptBalance, onSuccess }: WithdrawDialogProps) {
  const [amount, setAmount] = useState('100');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'approving' | 'withdrawing' | 'notifying'>('input');
  const toast = useToast();
  const { address, isConnected } = useWalletStore();

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleMaxAmount = () => {
    setAmount(aptBalance.toString());
  };

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      toast.error('请输入有效金额');
      return;
    }

    if (numAmount > aptBalance) {
      toast.error('余额不足');
      return;
    }

    if (!isConnected || !address) {
      toast.error('请先连接钱包');
      return;
    }

    setIsLoading(true);
    try {
      // 步骤 1: 授权 PlatformToken（在 withdrawPlatformToken 内部处理）
      setStep('approving');
      
      // 步骤 2: 执行链上提现
      setStep('withdrawing');
      const txHash = await withdrawPlatformToken(amount);
      
      // 步骤 3: 通知后端
      setStep('notifying');
      await walletService.withdraw({ amount });
      
      toast.success(`成功提现 ${amount} APT，已换回 ${amount} USDT`);
      onOpenChange(false);
      onSuccess?.();
      setAmount('100');
      setStep('input');
    } catch (error: any) {
      console.error('提现失败:', error);
      
      // 处理用户拒绝交易的情况
      if (error?.code === 4001 || error?.message?.includes('User rejected')) {
        toast.error('用户取消了交易');
      } else if (error?.message?.includes('insufficient balance')) {
        toast.error('APT 余额不足');
      } else if (error?.message?.includes('allowance')) {
        toast.error('授权失败，请重试');
      } else {
        toast.error(error?.message || '提现失败，请检查网络连接');
      }
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepText = () => {
    switch (step) {
      case 'approving':
        return '正在授权 APT...';
      case 'withdrawing':
        return '正在执行提现交易...';
      case 'notifying':
        return '正在同步到后端...';
      default:
        return '处理中...';
    }
  };

  const withdrawAmount = parseFloat(amount || '0');

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
              将平台币 APT 提现换回 USDT（1:1 比例）
            </Dialog.Description>
          </div>

          {/* Balance Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  您的 APT 余额：{aptBalance.toFixed(2)}
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
                disabled={isLoading}
              />
              <button
                onClick={handleMaxAmount}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                最大
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 rounded-xl p-4 mb-4 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">提现 APT</p>
              <p className="text-lg font-semibold text-gray-800">{withdrawAmount.toFixed(2)} APT</p>
            </div>
            <div className="flex justify-between items-center border-t border-orange-200 pt-2">
              <p className="text-sm text-gray-600">将获得 USDT</p>
              <p className="text-xl font-bold text-orange-600">{withdrawAmount.toFixed(2)} USDT</p>
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
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    amount === value.toString()
                      ? 'bg-orange-100 border-orange-300 text-orange-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-200'
                  } disabled:opacity-50`}
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
              <div className="space-y-1">
                <p className="text-sm text-yellow-800">
                  提现将转账至您连接的钱包地址，请确认钱包地址正确
                </p>
                <p className="text-xs text-yellow-700">
                  提现需要授权 APT 给 Treasury 合约，并支付 Gas 费用
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
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
                isLoading
              }
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {getStepText()}
                </>
              ) : (
                '确认提现'
              )}
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
