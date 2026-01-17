# 钱包认证登录对接方案

## 概述

本文档描述前端钱包认证登录流程，以及后端需要实现的接口规范。

## 认证流程

### 流程图

```
用户点击"连接钱包"
    ↓
检查 MetaMask 是否安装
    ↓
切换到 Sepolia 测试网（如需要）
    ↓
请求连接钱包 (eth_requestAccounts)
    ↓
获取钱包地址
    ↓
调用后端 GET /auth/nonce?address=0x...
    ↓
后端返回 nonce 和待签名消息
    ↓
用户使用 MetaMask 签名 (personal_sign)
    ↓
调用后端 POST /auth/verify
    ↓
后端验证签名，返回 JWT Token
    ↓
前端保存 Token，完成登录
    ↓
获取用户余额等信息
```

## 后端接口规范

### 1. 获取 Nonce

**接口**: `GET /auth/nonce`

**请求参数**:

```typescript
{
  address: string; // 钱包地址（小写），例如: "0x1234...abcd"
}
```

**响应**:

```typescript
{
  address: string; // 钱包地址（小写）
  nonce: string; // 一次性随机字符串，用于防重放攻击
  message: string; // 待签名的消息原文
  expiresAt: string; // 过期时间（ISO 8601 格式），建议 5 分钟
}
```

**消息格式建议**:

```
Agent Market Web3 Login
Address: 0x1234...abcd
Nonce: abc123xyz
```

**实现要点**:

1. 生成随机 nonce（建议使用 UUID 或随机字符串）
2. 构造待签名消息（包含地址和 nonce）
3. 将 nonce 保存到数据库/缓存，设置过期时间（建议 5 分钟）
4. 如果用户不存在，可以自动创建用户记录

**示例实现**:

```typescript
// 伪代码
async function getNonce(address: string) {
  const nonce = generateRandomString(); // 生成随机 nonce
  const message = `Agent Market Web3 Login\nAddress: ${address}\nNonce: ${nonce}`;

  // 保存 nonce 到数据库/Redis，设置 5 分钟过期
  await saveNonce(address, nonce, 5 * 60);

  return {
    address: address.toLowerCase(),
    nonce,
    message,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };
}
```

---

### 2. 验证签名并登录

**接口**: `POST /auth/verify`

**请求体**:

```typescript
{
  message: string; // 签名原文（与 getNonce 返回的 message 一致）
  signature: string; // 钱包签名结果（hex 字符串，0x 开头）
}
```

**响应**:

```typescript
{
  token: string; // JWT Token，用于后续 API 认证
}
```

**实现要点**:

1. **验证 nonce 有效性**:

   - 从 message 中解析出 address 和 nonce
   - 检查 nonce 是否存在于数据库/缓存中
   - 检查 nonce 是否已过期
   - 验证后删除或标记 nonce 为已使用（防止重放攻击）

2. **验证签名**:

   - 使用以太坊签名验证算法（ecrecover）
   - 验证签名是否由对应地址签出
   - 验证签名的消息是否匹配

3. **生成 JWT Token**:

   - 包含用户地址（address）
   - 包含用户 ID（如果有）
   - 设置合理的过期时间（建议 7-30 天）
   - 签名密钥要安全保存

4. **用户管理**:
   - 如果用户不存在，自动创建用户记录
   - 记录登录时间、IP 等信息（可选）

**签名验证示例**（使用 ethers.js）:

```typescript
import { ethers } from 'ethers';

async function verifySignature(
  message: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> {
  // 从 message 中解析地址
  const addressMatch = message.match(/Address: (0x[a-fA-F0-9]+)/);
  if (!addressMatch) {
    return false;
  }

  const addressInMessage = addressMatch[1].toLowerCase();

  // 验证消息中的地址与期望地址一致
  if (addressInMessage !== expectedAddress.toLowerCase()) {
    return false;
  }

  // 验证签名
  const recoveredAddress = ethers.verifyMessage(message, signature);
  return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
}
```

**完整实现示例**:

```typescript
async function verify(data: { message: string; signature: string }) {
  // 1. 解析 message 获取 address 和 nonce
  const addressMatch = data.message.match(/Address: (0x[a-fA-F0-9]+)/);
  const nonceMatch = data.message.match(/Nonce: (.+)/);

  if (!addressMatch || !nonceMatch) {
    throw new Error('Invalid message format');
  }

  const address = addressMatch[1].toLowerCase();
  const nonce = nonceMatch[1];

  // 2. 验证 nonce
  const isValidNonce = await validateNonce(address, nonce);
  if (!isValidNonce) {
    throw new Error('Invalid or expired nonce');
  }

  // 3. 验证签名
  const isValidSignature = await verifySignature(
    data.message,
    data.signature,
    address
  );
  if (!isValidSignature) {
    throw new Error('Invalid signature');
  }

  // 4. 标记 nonce 为已使用
  await markNonceAsUsed(address, nonce);

  // 5. 获取或创建用户
  let user = await getUserByAddress(address);
  if (!user) {
    user = await createUser(address);
  }

  // 6. 生成 JWT Token
  const token = generateJWT({
    userId: user.id,
    address: user.address,
    // 其他需要的信息
  });

  return { token };
}
```

---

### 3. 登出（可选）

**接口**: `POST /auth/logout`

**请求**: 无参数（使用 JWT Token 认证）

**响应**:

```typescript
{
  success: boolean;
}
```

**实现要点**:

- 可以将 token 加入黑名单（如果使用 Redis）
- 或者仅依赖前端的 token 删除
- 记录登出时间（可选）

---

## 安全注意事项

### 1. Nonce 管理

- ✅ **必须设置过期时间**（建议 5 分钟）
- ✅ **使用后立即删除或标记为已使用**
- ✅ **使用随机字符串**，避免可预测
- ✅ **每个地址独立 nonce**，不能复用

### 2. 签名验证

- ✅ **验证消息格式**，确保包含地址和 nonce
- ✅ **验证签名者地址**，确保与消息中的地址一致
- ✅ **使用标准的 ecrecover 算法**

### 3. Token 管理

- ✅ **JWT 签名密钥要安全保存**
- ✅ **设置合理的过期时间**
- ✅ **在 token 中包含必要信息**（用户 ID、地址等）
- ✅ **考虑实现 token 刷新机制**（可选）

### 4. 防重放攻击

- ✅ **Nonce 只能使用一次**
- ✅ **Nonce 有时效性**
- ✅ **验证签名时检查 nonce 状态**

---

## 前端调用示例

### 连接钱包流程

```typescript
// 1. 检查 MetaMask
if (!window.ethereum) {
  throw new Error('请先安装 MetaMask 钱包');
}

// 2. 切换到 Sepolia 测试网（如需要）
const chainId = await window.ethereum.request({ method: 'eth_chainId' });
if (parseInt(chainId, 16) !== 11155111) {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
  });
}

// 3. 请求连接钱包
const accounts = (await window.ethereum.request({
  method: 'eth_requestAccounts',
})) as string[];

const address = accounts[0].toLowerCase();

// 4. 获取 nonce
const nonceResponse = await fetch(`/auth/nonce?address=${address}`);
const { message } = await nonceResponse.json();

// 5. 请求用户签名
const signature = (await window.ethereum.request({
  method: 'personal_sign',
  params: [message, address],
})) as string;

// 6. 验证签名并获取 token
const verifyResponse = await fetch('/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, signature }),
});

const { token } = await verifyResponse.json();

// 7. 保存 token
localStorage.setItem('token', token);
```

---

## 数据库设计建议

### users 表

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  address VARCHAR(42) UNIQUE NOT NULL,  -- 钱包地址（小写）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  INDEX idx_address (address)
);
```

### nonces 表（或使用 Redis）

```sql
CREATE TABLE nonces (
  address VARCHAR(42) NOT NULL,
  nonce VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (address, nonce),
  INDEX idx_expires_at (expires_at)
);
```

**或者使用 Redis**:

```typescript
// 保存 nonce
await redis.setex(`nonce:${address}:${nonce}`, 300, '1'); // 5 分钟过期

// 验证 nonce
const exists = await redis.exists(`nonce:${address}:${nonce}`);
if (!exists) {
  throw new Error('Invalid or expired nonce');
}

// 标记为已使用（删除）
await redis.del(`nonce:${address}:${nonce}`);
```

---

## 错误处理

### 常见错误及处理

| 错误场景             | HTTP 状态码 | 错误信息                   |
| -------------------- | ----------- | -------------------------- |
| Nonce 不存在或已过期 | 400         | "Invalid or expired nonce" |
| 签名验证失败         | 401         | "Invalid signature"        |
| 消息格式错误         | 400         | "Invalid message format"   |
| 地址不匹配           | 401         | "Address mismatch"         |
| 服务器错误           | 500         | "Internal server error"    |

---

## 测试建议

### 1. 单元测试

- 测试 nonce 生成和验证
- 测试签名验证逻辑
- 测试 JWT 生成和解析

### 2. 集成测试

- 测试完整登录流程
- 测试 nonce 过期场景
- 测试签名错误场景
- 测试重放攻击防护

### 3. 前端测试

- 测试 MetaMask 连接
- 测试网络切换
- 测试签名流程
- 测试错误处理

---

## 后续优化建议

1. **Token 刷新机制**: 实现 refresh token，延长登录有效期
2. **多链支持**: 支持其他 EVM 兼容链（如 Polygon、BSC 等）
3. **会话管理**: 记录登录设备、IP 等信息
4. **安全增强**: 添加登录频率限制、异常检测等
5. **用户体验**: 添加"记住我"功能，延长 token 有效期

---

## 消息格式规范

### 标准消息格式

```
Agent Market Web3 Login
Address: 0x1234567890123456789012345678901234567890
Nonce: abc123xyz456
```

**格式说明**:

- 第一行：固定文本 "Agent Market Web3 Login"
- 第二行：`Address: ` + 钱包地址（小写）
- 第三行：`Nonce: ` + 随机字符串

**为什么使用这种格式？**

- 符合 EIP-191 标准
- 用户可以看到明确的消息内容
- 便于解析和验证

### 签名验证代码示例

**Node.js (使用 ethers.js)**:

```typescript
import { ethers } from 'ethers';

function verifySignature(
  message: string,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    return false;
  }
}
```

**Python (使用 eth_account)**:

```python
from eth_account import Account
from eth_account.messages import encode_defunct

def verify_signature(message: str, signature: str, expected_address: str) -> bool:
    try:
        message_hash = encode_defunct(text=message)
        recovered_address = Account.recover_message(message_hash, signature=signature)
        return recovered_address.lower() == expected_address.lower()
    except:
        return False
```

---

## 完整后端实现示例

### Express.js + TypeScript 示例

```typescript
import express from 'express';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Redis from 'ioredis';

const app = express();
const redis = new Redis(process.env.REDIS_URL);

// 生成 nonce
function generateNonce(): string {
  return crypto.randomBytes(32).toString('hex');
}

// 生成消息
function generateMessage(address: string, nonce: string): string {
  return `Agent Market Web3 Login\nAddress: ${address}\nNonce: ${nonce}`;
}

// 验证签名
function verifySignature(
  message: string,
  signature: string,
  expectedAddress: string
): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch {
    return false;
  }
}

// GET /auth/nonce
app.get('/auth/nonce', async (req, res) => {
  const address = req.query.address as string;

  if (!address || !ethers.isAddress(address)) {
    return res.status(400).json({ error: 'Invalid address' });
  }

  const normalizedAddress = address.toLowerCase();
  const nonce = generateNonce();
  const message = generateMessage(normalizedAddress, nonce);

  // 保存 nonce 到 Redis，5 分钟过期
  await redis.setex(`nonce:${normalizedAddress}:${nonce}`, 300, '1');

  res.json({
    address: normalizedAddress,
    nonce,
    message,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });
});

// POST /auth/verify
app.post('/auth/verify', async (req, res) => {
  const { message, signature } = req.body;

  if (!message || !signature) {
    return res.status(400).json({ error: 'Missing message or signature' });
  }

  // 解析消息
  const addressMatch = message.match(/Address: (0x[a-fA-F0-9]+)/);
  const nonceMatch = message.match(/Nonce: (.+)/);

  if (!addressMatch || !nonceMatch) {
    return res.status(400).json({ error: 'Invalid message format' });
  }

  const address = addressMatch[1].toLowerCase();
  const nonce = nonceMatch[1];

  // 验证 nonce
  const nonceKey = `nonce:${address}:${nonce}`;
  const nonceExists = await redis.exists(nonceKey);

  if (!nonceExists) {
    return res.status(400).json({ error: 'Invalid or expired nonce' });
  }

  // 验证签名
  if (!verifySignature(message, signature, address)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 删除 nonce（防止重放攻击）
  await redis.del(nonceKey);

  // 获取或创建用户
  let user = await getUserByAddress(address);
  if (!user) {
    user = await createUser(address);
  }

  // 生成 JWT Token
  const token = jwt.sign(
    {
      userId: user.id,
      address: user.address,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.json({ token });
});
```

---

## 相关文件

- 前端认证服务: `src/lib/api/services/auth.ts`
- 前端钱包 Store: `src/store/walletStore.ts`
- Mock 实现: `src/lib/api/mock.ts`
- API 客户端: `src/lib/api/client.ts`
