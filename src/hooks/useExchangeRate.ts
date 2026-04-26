import { useState, useEffect } from "react";
import { useChainId } from "wagmi";
import { getMiniPayClient } from "../lib/minipayClient";
import { FALLBACK_RATES } from "../lib/constants";

/**
 * Live exchange rate via minipay_getExchangeRate.
 * Falls back to static rates when not in MiniPay.
 */
export function useExchangeRate(toCurrency: string) {
  const chainId = useChainId();
  const [rate,    setRate]    = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!toCurrency) return;
    let cancelled = false;

    const fetchRate = async () => {
      setLoading(true);
      try {
        const isMiniPay = typeof window !== "undefined" &&
          !!(window as any).ethereum?.isMiniPay;

        if (isMiniPay) {
          const client = getMiniPayClient(chainId);
          if (client) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await (client as any).request({
              method: "minipay_getExchangeRate",
              params: ["USDT", toCurrency],
            });
            if (!cancelled) setRate(Number(result));
            return;
          }
        }
        // Dev fallback
        await new Promise((r) => setTimeout(r, 150));
        if (!cancelled) setRate(FALLBACK_RATES[toCurrency] ?? 1);
      } catch (err) {
        console.warn("[PayFlow] getExchangeRate fallback:", err);
        if (!cancelled) setRate(FALLBACK_RATES[toCurrency] ?? 1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRate();
    const interval = setInterval(fetchRate, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [toCurrency, chainId]);

  return { rate, loading };
}
