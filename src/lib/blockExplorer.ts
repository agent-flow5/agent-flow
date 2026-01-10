/**
 * 区块链浏览器工具函数
 */

// 支持的链ID和对应的浏览器
export const CHAIN_CONFIG: Record<number, { name: string; explorerUrl: string }> = {
  1: {
    name: 'Ethereum 主网',
    explorerUrl: 'https://etherscan.io',
  },
  11155111: {
    name: 'Sepolia 测试网',
    explorerUrl: 'https://sepolia.etherscan.io',
  },
  5: {
    name: 'Goerli 测试网',
    explorerUrl: 'https://goerli.etherscan.io',
  },
};

/**
 * 获取交易在区块链浏览器的URL
 * @param txHash 交易哈希
 * @param chainId 链ID
 * @returns 浏览器URL
 */
export function getExplorerTxUrl(txHash: string, chainId: number = 1): string {
  const config = CHAIN_CONFIG[chainId];
  if (!config) {
    // 默认使用以太坊主网
    return `https://etherscan.io/tx/${txHash}`;
  }
  return `${config.explorerUrl}/tx/${txHash}`;
}

/**
 * 获取地址在区块链浏览器的URL
 * @param address 地址
 * @param chainId 链ID
 * @returns 浏览器URL
 */
export function getExplorerAddressUrl(address: string, chainId: number = 1): string {
  const config = CHAIN_CONFIG[chainId];
  if (!config) {
    return `https://etherscan.io/address/${address}`;
  }
  return `${config.explorerUrl}/address/${address}`;
}

/**
 * 获取链名称
 * @param chainId 链ID
 * @returns 链名称
 */
export function getChainName(chainId: number): string {
  return CHAIN_CONFIG[chainId]?.name || `链 ID: ${chainId}`;
}

/**
 * 缩短交易哈希显示
 * @param hash 完整哈希
 * @param startLength 开始显示长度
 * @param endLength 结尾显示长度
 * @returns 缩短的哈希
 */
export function shortenHash(hash: string, startLength: number = 6, endLength: number = 4): string {
  if (!hash) return '';
  if (hash.length <= startLength + endLength) return hash;
  return `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`;
}
