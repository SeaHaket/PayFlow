import { useReadContracts, useChainId } from "wagmi";
import { erc20Abi, formatUnits } from "viem";
import { TOKENS_MAINNET, TOKENS_TESTNET, CHAIN } from "../lib/wagmi";

/**
 * Reads ALL stablecoin balances on the current chain and sums them.
 * Matches exactly what MiniPay shows as "Dollars".
 *
 * Testnet (11142220 = Celo Sepolia) reads 4 tokens:
 *   1. Circle USDC  0x01C5C0122...  6 dec  ← user has 20 USDC here
 *   2. USDm         0x874069Fa1...  18 dec ← from celo faucet
 *   3. Mento USDC   0x2F25deB38...  6 dec
 *   4. USDT         0xC4f86E9B4...  18 dec
 *
 * Mainnet (42220) reads:
 *   1. USDT  0x48065fbBE...  6 dec
 *   2. USDC  0xcebA9300f...  6 dec
 *   3. USDm  0x765DE816...  18 dec
 */
export function useUSDTBalance(address?: `0x${string}`) {
  const chainId   = useChainId();
  const isTestnet = chainId === CHAIN.TESTNET;
  const tokens    = isTestnet ? [...TOKENS_TESTNET] : [...TOKENS_MAINNET];

  const contracts = tokens.flatMap((t) => [
    {
      address:      t.address,
      abi:          erc20Abi,
      functionName: "balanceOf" as const,
      args:         [address as `0x${string}`],
    },
    {
      address:      t.address,
      abi:          erc20Abi,
      functionName: "decimals"  as const,
    },
  ]);

  const { data, isLoading, error, refetch } = useReadContracts({
    allowFailure: true,
    contracts,
    query: {
      enabled:         !!address,
      refetchInterval: 15_000,
      staleTime:        8_000,
    },
  });

  let balance: number | null = null;

  if (data) {
    balance = 0;
    tokens.forEach((token, i) => {
      const rawBal = data[i * 2]?.result     as bigint | undefined;
      const rawDec = data[i * 2 + 1]?.result as number | undefined;
      const dec    = rawDec ?? token.decimals;

      if (rawBal !== undefined && rawBal > 0n) {
        const parsed = parseFloat(formatUnits(rawBal, dec));
        balance! += parsed;
        console.log(`[PayFlow] ${token.symbol} = ${parsed.toFixed(4)} (chain ${chainId})`);
      }
    });

    console.log(`[PayFlow] Total balance = ${balance.toFixed(4)} on chain ${chainId}`);
  }

  return { balance, isLoading, error, refetch, isTestnet, chainId };
}
