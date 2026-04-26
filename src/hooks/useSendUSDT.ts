import { useState } from "react";
import { useSendTransaction, useChainId } from "wagmi";
import { encodeFunctionData, erc20Abi, parseUnits } from "viem";
import { SEND_TOKEN, CHAIN } from "../lib/wagmi";

export type SendRow = {
  name:       string;
  toAddress:  `0x${string}`;
  amountUSDT: number;
  region:     string;
  method:     string;
};

export type SendStatus = "idle" | "sending" | "confirming" | "success" | "error";

/**
 * Sends stablecoin to multiple recipients sequentially on Celo.
 *
 * Source: https://docs.minipay.xyz/technical-references/send-transaction.html
 *
 *   Testnet  → USDm at 0x874069... (18 decimals)
 *   Mainnet  → USDT at 0x48065f... (6 decimals)
 *
 * MiniPay handles gas via fee abstraction.
 * Only legacy transactions — wagmi handles this automatically via injected provider.
 */
export function useSendUSDT() {
  const { sendTransactionAsync } = useSendTransaction();
  const chainId = useChainId();

  const [status,   setStatus]   = useState<SendStatus>("idle");
  const [hashes,   setHashes]   = useState<string[]>([]);
  const [error,    setError]    = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const sendAll = async (rows: SendRow[]): Promise<string[]> => {
    setStatus("sending");
    setError(null);
    setHashes([]);
    const collected: string[] = [];

    const token =
      SEND_TOKEN[chainId as keyof typeof SEND_TOKEN] ?? SEND_TOKEN[CHAIN.MAINNET];

    try {
      for (let i = 0; i < rows.length; i++) {
        setProgress(i);
        const row = rows[i];

        const data = encodeFunctionData({
          abi:          erc20Abi,
          functionName: "transfer",
          args: [
            row.toAddress,
            parseUnits(
              row.amountUSDT.toFixed(token.decimals),
              token.decimals
            ),
          ],
        });

        const hash = await sendTransactionAsync({ to: token.address, data });
        collected.push(hash);
      }

      setHashes(collected);
      setStatus("success");

      // Production — show MiniPay receipt after last send:
      // if (collected.length > 0) {
      //   window.location.href =
      //     `https://link.minipay.xyz/receipt?tx=${collected[collected.length-1]}&celebrate`;
      // }

      return collected;
    } catch (err: any) {
      let msg = "Send failed. Please try again.";
      if (err?.code === -32604 || err?.name === "UserRejectedRequestError") {
        msg = "Transaction was cancelled.";
      } else if (err?.code === -32000) {
        msg = "Insufficient balance.";
      } else if (err?.message?.toLowerCase().includes("network")) {
        msg = "Network error. Check your connection.";
      }
      setError(msg);
      setStatus("error");
      throw err;
    }
  };

  const reset = () => {
    setStatus("idle");
    setHashes([]);
    setError(null);
    setProgress(0);
  };

  return { sendAll, status, hashes, error, progress, reset };
}
