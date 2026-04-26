/**
 * MiniPay contact resolution via minipay_requestContact.
 *
 * Uses viem WalletClient with MiniPay's injected provider.
 * Source: https://docs.minipay.xyz/technical-references/custom-methods/request-contact.html
 */
import { getMiniPayClient } from "./minipayClient";

export type MiniPayContact = {
  name:    string;
  address: `0x${string}`;
};

export async function requestContact(chainId: number): Promise<MiniPayContact | null> {
  const client = getMiniPayClient(chainId);
  if (!client) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (client as any).request({
      method: "minipay_requestContact",
      params: [],
    });
    if (!result?.address) return null;
    return {
      name:    result.name ?? "Contact",
      address: result.address as `0x${string}`,
    };
  } catch (err) {
    console.error("[PayFlow] minipay_requestContact failed:", err);
    return null;
  }
}

export function isValidAddress(addr: string): addr is `0x${string}` {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}
