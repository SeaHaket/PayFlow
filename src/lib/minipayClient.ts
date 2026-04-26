/**
 * MiniPay viem WalletClient for custom RPC methods.
 *
 * Uses viem's createWalletClient with custom transport.
 * Required for minipay_requestContact and minipay_getExchangeRate.
 *
 * Source: https://docs.minipay.xyz/technical-references/custom-methods/custom-methods.html
 */
import { createWalletClient, custom } from "viem";
import { celo, celoSepolia } from "wagmi/chains";

export function getMiniPayClient(chainId: number) {
  if (typeof window === "undefined" || !(window as any).ethereum) return null;

  const chain = chainId === celoSepolia.id ? celoSepolia : celo;

  return createWalletClient({
    chain,
    transport: custom((window as any).ethereum),
  });
}
