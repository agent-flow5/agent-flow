/**
 * 合约配置
 * Sepolia 测试网合约地址
 */

// Sepolia 测试网 Chain ID
export const SEPOLIA_CHAIN_ID = 11155111;

// Sepolia 测试网 RPC 配置（用于自动添加网络）
export const SEPOLIA_NETWORK = {
  chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`, // 0xaa36a7
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

// Sepolia 测试网合约地址
export const CONTRACT_ADDRESSES = {
  // USDT 合约地址 (MockUSDT)
  USDT: '0xbac7d7AAE206282201E83b31005fF2651565fc2C',
  // PlatformToken (APT) 合约地址
  PLATFORM_TOKEN: '0xdea48b60cc5bCC6170d6CD81964dE443a8015456',
  // PlatformTreasury 合约地址
  TREASURY: '0x44b5dd766B90156A08e449CD3049B2267A7bDD65',
} as const;

// USDT 和 PlatformToken 都是 6 位小数
export const TOKEN_DECIMALS = 6;
