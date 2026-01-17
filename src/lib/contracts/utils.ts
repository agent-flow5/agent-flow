/**
 * 合约交互工具函数
 */

import { BrowserProvider, Contract, JsonRpcProvider } from 'ethers';
import {
  CONTRACT_ADDRESSES,
  TOKEN_DECIMALS,
  SEPOLIA_CHAIN_ID,
  SEPOLIA_NETWORK,
} from './config';
import { PlatformTreasury } from '@/types/typechain-types/contracts/PlatformTreasury.sol/PlatformTreasury';
import { PlatformToken } from '@/types/typechain-types/contracts/PlatformToken';
import { PlatformTreasury__factory } from '@/types/typechain-types/factories/contracts/PlatformTreasury.sol/PlatformTreasury__factory';
import { PlatformToken__factory } from '@/types/typechain-types/factories/contracts/PlatformToken__factory';

// ERC20 标准 ABI（用于 USDT）
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
] as const;

/**
 * 检查当前网络是否为 Sepolia 测试网
 */
export async function checkNetwork(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false;
  }

  try {
    const chainId = (await window.ethereum.request({
      method: 'eth_chainId',
    })) as string;

    // 转换为数字比较
    const currentChainId = parseInt(chainId, 16);
    return currentChainId === SEPOLIA_CHAIN_ID;
  } catch (error) {
    console.error('检查网络失败:', error);
    return false;
  }
}

/**
 * 切换到 Sepolia 测试网
 */
export async function switchToSepolia(): Promise<void> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('请先安装并连接 MetaMask 钱包');
  }

  try {
    // 尝试切换到 Sepolia 网络
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_NETWORK.chainId }],
    });
  } catch (switchError: any) {
    // 如果网络不存在，尝试添加网络
    if (switchError.code === 4902 || switchError.code === -32603) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SEPOLIA_NETWORK],
        });
      } catch (addError) {
        console.error('添加网络失败:', addError);
        throw new Error('无法添加 Sepolia 测试网，请手动在 MetaMask 中添加');
      }
    } else {
      throw switchError;
    }
  }
}

/**
 * 确保连接到 Sepolia 测试网
 */
export async function ensureSepoliaNetwork(): Promise<void> {
  const isSepolia = await checkNetwork();
  if (!isSepolia) {
    await switchToSepolia();
  }
}

/**
 * 获取 ethers provider（从 window.ethereum）
 */
export function getProvider(): BrowserProvider {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('请先安装并连接 MetaMask 钱包');
  }
  return new BrowserProvider(window.ethereum);
}

/**
 * 获取 signer（当前连接的账户）
 */
export async function getSigner() {
  const provider = getProvider();
  return await provider.getSigner();
}

/**
 * 获取 PlatformTreasury 合约实例
 */
export async function getTreasuryContract(): Promise<PlatformTreasury> {
  const signer = await getSigner();
  return PlatformTreasury__factory.connect(CONTRACT_ADDRESSES.TREASURY, signer);
}

/**
 * 获取 PlatformToken 合约实例
 */
export async function getPlatformTokenContract(): Promise<PlatformToken> {
  const signer = await getSigner();
  return PlatformToken__factory.connect(
    CONTRACT_ADDRESSES.PLATFORM_TOKEN,
    signer
  );
}

/**
 * 获取 USDT 合约实例（ERC20）
 */
export async function getUSDTContract(): Promise<Contract> {
  const signer = await getSigner();
  return new Contract(CONTRACT_ADDRESSES.USDT, ERC20_ABI, signer);
}

/**
 * 将金额转换为链上格式（乘以 10^decimals）
 */
export function parseTokenAmount(
  amount: string | number,
  decimals: number = TOKEN_DECIMALS
): bigint {
  const amountStr = typeof amount === 'number' ? amount.toString() : amount;
  const [integer, decimal = ''] = amountStr.split('.');
  const paddedDecimal = decimal.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(integer + paddedDecimal);
}

/**
 * 将链上金额转换为可读格式（除以 10^decimals）
 */
export function formatTokenAmount(
  amount: bigint,
  decimals: number = TOKEN_DECIMALS
): string {
  const divisor = BigInt(10 ** decimals);
  const integer = amount / divisor;
  const remainder = amount % divisor;

  if (remainder === 0n) {
    return integer.toString();
  }

  const decimalStr = remainder.toString().padStart(decimals, '0');
  // 移除尾部的零
  const trimmedDecimal = decimalStr.replace(/0+$/, '');
  return trimmedDecimal ? `${integer}.${trimmedDecimal}` : integer.toString();
}

/**
 * 检查并授权 USDT 给 Treasury 合约
 * @param amount 授权金额（字符串，如 "100"）
 * @returns 交易哈希
 */
export async function approveUSDT(amount: string): Promise<string> {
  const usdt = await getUSDTContract();
  const amountWei = parseTokenAmount(amount);

  // 检查当前授权额度
  const signer = await getSigner();
  const address = await signer.getAddress();
  const currentAllowance = await usdt.allowance(
    address,
    CONTRACT_ADDRESSES.TREASURY
  );

  // 如果授权额度足够，直接返回
  if (currentAllowance >= amountWei) {
    return 'already_approved';
  }

  // 执行授权
  const tx = await usdt.approve(CONTRACT_ADDRESSES.TREASURY, amountWei);
  await tx.wait();
  return tx.hash;
}

/**
 * 检查并授权 PlatformToken 给 Treasury 合约（用于提现时的 burnFrom）
 * @param amount 授权金额（字符串，如 "100"）
 * @returns 交易哈希
 */
export async function approvePlatformToken(amount: string): Promise<string> {
  const platformToken = await getPlatformTokenContract();
  const amountWei = parseTokenAmount(amount);

  // 检查当前授权额度
  const signer = await getSigner();
  const address = await signer.getAddress();
  const currentAllowance = await platformToken.allowance(
    address,
    CONTRACT_ADDRESSES.TREASURY
  );

  // 如果授权额度足够，直接返回
  if (currentAllowance >= amountWei) {
    return 'already_approved';
  }

  // 执行授权
  const tx = await platformToken.approve(
    CONTRACT_ADDRESSES.TREASURY,
    amountWei
  );
  await tx.wait();
  return tx.hash;
}

/**
 * 充值 USDT 到 Treasury，获得 PlatformToken
 * @param usdtAmount USDT 金额（字符串，如 "100"）
 * @param to 接收 PlatformToken 的地址（默认当前账户）
 * @returns 交易哈希
 */
export async function depositUSDT(
  usdtAmount: string,
  to?: string
): Promise<string> {
  const treasury = await getTreasuryContract();
  const signer = await getSigner();
  const recipient = to || (await signer.getAddress());
  const amountWei = parseTokenAmount(usdtAmount);

  // 先授权 USDT
  await approveUSDT(usdtAmount);

  // 执行充值
  const tx = await treasury.deposit(amountWei, recipient);
  const receipt = await tx.wait();
  return receipt!.hash;
}

/**
 * 提现 PlatformToken，换回 USDT
 * @param ptAmount PlatformToken 金额（字符串，如 "100"）
 * @param to 接收 USDT 的地址（默认当前账户）
 * @returns 交易哈希
 */
export async function withdrawPlatformToken(
  ptAmount: string,
  to?: string
): Promise<string> {
  const treasury = await getTreasuryContract();
  const signer = await getSigner();
  const recipient = to || (await signer.getAddress());
  const amountWei = parseTokenAmount(ptAmount);

  // 先授权 PlatformToken（用于 burnFrom）
  await approvePlatformToken(ptAmount);

  // 执行提现
  const tx = await treasury.withdraw(amountWei, recipient);
  const receipt = await tx.wait();
  return receipt!.hash;
}

/**
 * 获取用户的 USDT 余额
 */
export async function getUSDTBalance(address?: string): Promise<string> {
  const usdt = await getUSDTContract();
  const signer = await getSigner();
  const userAddress = address || (await signer.getAddress());
  const balance = await usdt.balanceOf(userAddress);
  return formatTokenAmount(balance);
}

/**
 * 获取用户的 PlatformToken 余额
 */
export async function getPlatformTokenBalance(
  address?: string
): Promise<string> {
  const platformToken = await getPlatformTokenContract();
  const signer = await getSigner();
  const userAddress = address || (await signer.getAddress());
  const balance = await platformToken.balanceOf(userAddress);
  return formatTokenAmount(balance);
}
