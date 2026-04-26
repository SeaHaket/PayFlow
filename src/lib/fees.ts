/**
 * PayFlow Fee Structure — transparent to all users.
 *
 * PAYFLOW SERVICE FEE
 *   Current : $0.00 (free during launch)
 *   Planned : $0.20 per send session
 *
 * CELO GAS FEE
 *   ~$0.001–$0.005 per transaction. Paid in USDT via Celo fee abstraction.
 *   No CELO token needed. Charged by the blockchain per transaction, not PayFlow.
 *
 * TRANSAK OFFRAMP FEE (via MiniPay Withdraw button)
 *   Currently FREE — MiniPay x Transak partnership (Jan 2025) waived all fees.
 *   Normal Transak rate outside MiniPay: 1–2%.
 *   Source: https://coincodex.com/article/61830
 *
 * EXCHANGE FEES (Binance P2P, PDAX, Gate.io)
 *   Varies per exchange. These are third-party fees, not PayFlow fees.
 */

export const PAYFLOW_FEE_USD    = 0.00;
export const IS_FREE_PERIOD     = PAYFLOW_FEE_USD === 0;
export const PAYFLOW_FEE_LABEL  = IS_FREE_PERIOD ? "Free (launch offer)" : `$${PAYFLOW_FEE_USD.toFixed(2)}`;
export const CELO_GAS_LABEL     = "~$0.001–$0.005 per tx";
export const TRANSAK_FEE_LABEL  = "Free via MiniPay (Jan 2025 partnership)";
