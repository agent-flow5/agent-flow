import { create } from 'zustand';
import { WalletState } from '@/types';

export const useWalletStore = create<WalletState>((set) => ({
  isConnected: false,
  address: '',
  balance: 0,
  connect: () => {
    // Mock wallet connection
    set({
      isConnected: true,
      address: '0x742d...4e89',
      balance: 12450,
    });
  },
  disconnect: () => {
    set({
      isConnected: false,
      address: '',
      balance: 0,
    });
  },
}));
