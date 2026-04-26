import { CURRENCY_SYMBOL, FALLBACK_RATES } from "./constants";

export const formatUSD = (n: number) => `$${n.toFixed(2)}`;

export const formatLocal = (usd: number, currency: string) => {
  const rate = FALLBACK_RATES[currency] ?? 1;
  const sym  = CURRENCY_SYMBOL[currency] ?? currency;
  const val  = usd * rate;
  return val >= 1000
    ? `${sym}${val.toLocaleString("en", { maximumFractionDigits: 0 })}`
    : `${sym}${val.toFixed(2)}`;
};

export const shortenAddress = (addr: string) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

/**
 * Builds the Viber/WhatsApp message the seafarer copies to family.
 *
 * For on-chain exchange offramps (Binance, PDAX, Gate.io, Coins.ph):
 *   - The message explains that the USDT is in the MiniPay wallet
 *   - Steps walk through sending to the exchange and converting to PHP
 *
 * For MiniPay built-in offramps (GCash, Maya, Bank):
 *   - Simpler steps directly from the MiniPay app
 *
 * Filipino for PH region, English for all others.
 */
export const buildFamilyMessage = (
  senderName: string,
  recipientName: string,
  usdAmount: number,
  localAmount: string,
  methodName: string,
  steps: string[],
  note: string,
  isPH: boolean
): string => {

  // Detect on-chain exchange methods by their IDs in the method name
  const isExchange = ["Binance", "PDAX", "Gate.io", "Coins.ph"].some(
    (ex) => methodName.includes(ex)
  );

  if (isPH) {
    const intro = isExchange
      ? `Nagpadala na ako ng ${formatUSD(usdAmount)} (≈ ${localAmount}) sa iyong MiniPay wallet.\n\nPara ma-convert ito sa pesos gamit ang ${methodName}:`
      : `Nagpadala na ako ng ${formatUSD(usdAmount)} (≈ ${localAmount}) sa iyong MiniPay wallet.\n\nPara makuha ang pera sa ${methodName}:`;

    return [
      `Kumusta! Si ${senderName || "Ako"} ito. 💸`,
      ``,
      intro,
      ``,
      ...steps.map((s, i) => `${i + 1}. ${s}`),
      note ? `` : "",
      note ? `💡 ${note}` : "",
      ``,
      `Kung may tanong ka, i-message mo ako dito. Mahal ko kayo! 🙏`,
    ]
      .filter((l) => l !== undefined)
      .join("\n")
      .trim();
  }

  const introEn = isExchange
    ? `I sent ${formatUSD(usdAmount)} (≈ ${localAmount}) to your MiniPay wallet.\n\nTo convert to local currency via ${methodName}:`
    : `I sent ${formatUSD(usdAmount)} (≈ ${localAmount}) to your MiniPay wallet.\n\nTo withdraw via ${methodName}:`;

  return [
    `Hi ${recipientName}! 💸`,
    ``,
    introEn,
    ``,
    ...steps.map((s, i) => `${i + 1}. ${s}`),
    note ? `` : "",
    note ? `💡 ${note}` : "",
    ``,
    `Message me if you need help!`,
  ]
    .filter((l) => l !== undefined)
    .join("\n")
    .trim();
};
