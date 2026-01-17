'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Info, ArrowDownLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { walletService } from '@/lib/api/services/wallet';
import { useToast } from '@/contexts/ToastContext';
import { depositUSDT, getUSDTBalance } from '@/lib/contracts/utils';
import { useWalletStore } from '@/store/walletStore';

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DepositDialog({ open, onOpenChange, onSuccess }: DepositDialogProps) {
  const [amount, setAmount] = useState('100');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'approving' | 'depositing' | 'notifying'>('input');
  const [usdtBalance, setUsdtBalance] = useState<string | null>(null);
  const toast = useToast();
  const { address, isConnected } = useWalletStore();

  // 获取 USDT 余额
  const fetchUSDTBalance = async () => {
    if (!isConnected || !address) return;
    try {
      const balance = await getUSDTBalance();
      setUsdtBalance(balance);
    } catch (error) {
      console.error('获取 USDT 余额失败:', error);
    }
  };

  // 当对话框打开时获取余额
  useEffect(() => {
    if (open && isConnected) {
      fetchUSDTBalance();
    }
  }, [open, isConnected]);

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleDeposit = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      toast.error('请输入有效金额');
      return;
    }

    if (!isConnected || !address) {
      toast.error('请先连接钱包');
      return;
    }

    setIsLoading(true);
    try {
      // 步骤 1: 授权 USDT（在 depositUSDT 内部处理）
      setStep('approving');
      
      // 步骤 2: 执行链上充值
      setStep('depositing');
      const txHash = await depositUSDT(amount);
      
      // 步骤 3: 通知后端
      setStep('notifying');
      await walletService.deposit({ amount, txHash });
      
      toast.success(`成功充值 ${amount} USDT，获得 ${amount} APT`);
      onOpenChange(false);
      onSuccess?.();
      setAmount('100');
      setStep('input');
    } catch (error: any) {
      console.error('充值失败:', error);
      
      // 处理用户拒绝交易的情况
      if (error?.code === 4001 || error?.message?.includes('User rejected')) {
        toast.error('用户取消了交易');
      } else if (error?.message?.includes('insufficient funds')) {
        toast.error('USDT 余额不足');
      } else if (error?.message?.includes('allowance')) {
        toast.error('授权失败，请重试');
      } else {
        toast.error(error?.message || '充值失败，请检查网络连接');
      }
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepText = () => {
    switch (step) {
      case 'approving':
        return '正在授权 USDT...';
      case 'depositing':
        return '正在执行充值交易...';
      case 'notifying':
        return '正在同步到后端...';
      default:
        return '处理中...';
    }
  };

  const aptAmount = parseFloat(amount || '0');

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
              使用 USDT 充值获得平台代币 APT（1:1 比例）
            </Dialog.Description>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  链上充值
                </p>
                <p className="text-sm text-blue-700">
                  {usdtBalance !== null ? `您的 USDT 余额: ${usdtBalance} USDT` : '正在获取余额...'}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  充值需要授权 USDT 给 Treasury 合约，并支付 Gas 费用
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
                className="w-full px-4 py-2 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white"
                placeholder="100"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-4 mb-4 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">充值 USDT</p>
              <p className="text-lg font-semibold text-gray-800">{aptAmount.toFixed(2)} USDT</p>
            </div>
            <div className="flex justify-between items-center border-t border-purple-200 pt-2">
              <p className="text-sm text-gray-600">将获得 APT</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {aptAmount.toFixed(2)} APT
              </p>
            </div>
          </div>

          {/* Warning */}
          {usdtBalance !== null && parseFloat(amount) > parseFloat(usdtBalance) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  USDT 余额不足，当前余额: {usdtBalance} USDT
                </p>
              </div>
            </div>
          )}

          {/* Quick Amount Buttons */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-medium text-gray-800">快捷金额</label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 50, 100, 500].map((value) => (
                <button
                  key={value}
                  onClick={() => handleQuickAmount(value)}
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    amount === value.toString()
                      ? 'bg-purple-100 border-purple-300 text-purple-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-purple-50 hover:border-purple-200'
                  } disabled:opacity-50`}
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
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleDeposit}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {getStepText()}
                </>
              ) : (
                '确认充值'
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
