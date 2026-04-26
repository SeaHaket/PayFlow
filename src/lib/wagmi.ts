import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { celo, celoSepolia } from "wagmi/chains";

/**
 * Wagmi config — exact match to MiniPay docs.
 * Source: https://docs.minipay.xyz/getting-started/quick-start.html
 */
export const wagmiConfig = createConfig({
  chains: [celo, celoSepolia],
  connectors: [injected()],
  transports: {
    [celo.id]:        http("https://forno.celo.org"),
    [celoSepolia.id]: http("https://forno.celo-sepolia.celo-testnet.org"),
  },
});

export const CHAIN = {
  MAINNET: 42220,
  TESTNET: 11142220,
} as const;

/**
 * ─── MAINNET token addresses ──────────────────────────────────────────────
 * Source: https://docs.minipay.xyz/technical-references/retrieve-balance.html
 *
 *  USDT  0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e  6  dec
 *  USDC  0xcebA9300f2b948710d2653dD7B07f33A8B32118C  6  dec
 *  USDm  0x765DE816845861e75A25fCA122bb6898B8B1282a  18 dec
 */
export const TOKENS_MAINNET = [
  { symbol: "USDT", address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e" as `0x${string}`, decimals: 6  },
  { symbol: "USDC", address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as `0x${string}`, decimals: 6  },
  { symbol: "USDm", address: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as `0x${string}`, decimals: 18 },
] as const;

/**
 * ─── TESTNET (Celo Sepolia 11142220) token addresses ─────────────────────
 * Source: MiniPay docs + confirmed via Blockscout + user's CeloScan screenshot
 *
 *  USDC  0x01C5C0122039549AD1493B8220cABEdD739BC44E  6  dec  ← Circle native USDC
 *        Confirmed: user has 20 USDC here from Circle faucet (faucet.circle.com)
 *        Visible on: https://celo-sepolia.blockscout.com/token/0x01C5C...BC44E
 *
 *  USDm  0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1  18 dec  ← Mento Dollar (celo faucet)
 *        From: https://faucet.celo.org/celo-sepolia
 *
 *  USDC  0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B  6  dec  ← Mento USDC adapter
 *        Source: MiniPay docs official list
 *
 *  USDT  0xC4f86E9B4A588D501c1c3e25628dFd50Bc8D615e  18 dec  ← Tether testnet
 *        Source: MiniPay docs official list
 */
export const TOKENS_TESTNET = [
  // Circle native USDC — confirmed from user's screenshot (20 USDC balance)
  { symbol: "USDC", address: "0x01C5C0122039549AD1493B8220cABEdD739BC44E" as `0x${string}`, decimals: 6  },
  // Mento Dollar — from faucet.celo.org/celo-sepolia
  { symbol: "USDm", address: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1" as `0x${string}`, decimals: 18 },
  // Mento USDC adapter — from MiniPay docs
  { symbol: "mUSDC", address: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B" as `0x${string}`, decimals: 6  },
  // Tether testnet — from MiniPay docs
  { symbol: "USDT", address: "0xC4f86E9B4A588D501c1c3e25628dFd50Bc8D615e" as `0x${string}`, decimals: 18 },
] as const;

/**
 * Token used for SENDING per chain.
 * Testnet  → Circle USDC  0x01C5C...  6 dec
 * Mainnet  → USDT         0x48065...  6 dec
 */
export const SEND_TOKEN = {
  [CHAIN.MAINNET]: {
    address:  "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e" as `0x${string}`,
    decimals: 6,
    symbol:   "USDT",
  },
  [CHAIN.TESTNET]: {
    address:  "0x01C5C0122039549AD1493B8220cABEdD739BC44E" as `0x${string}`,
    decimals: 6,
    symbol:   "USDC",
  },
} as const;
