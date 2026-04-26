import { useState } from "react";
import { FALLBACK_RATES } from "../lib/constants";

type Props = {
  recipientName: string;
  regionCode:    string;
  amountUSDT:    number;
  methodId:      string;
};

const PHP_RATE = FALLBACK_RATES["PHP"] ?? 57.5;

function buildFonbnkUrl(amountUSDT: number): string {
  const phpAmount = Math.floor(amountUSDT * PHP_RATE);
  const params = new URLSearchParams({
    network:         "CELO",
    asset:           "USDT",
    countryIsoCode:  "PH",
    currencyIsoCode: "PHP",
    paymentChannel:  "bank",
    amount:          phpAmount.toString(),
    currency:        "local",
    hideSwitch:      "1",
  });
  return `https://pay.fonbnk.com/offramp?${params.toString()}`;
}

function Step({ num, text, color }: { num: number; text: string; color: string }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        background: color === "green" ? "rgba(53,208,127,.12)" : "rgba(96,165,250,.1)",
        color: color === "green" ? "var(--g)" : "#60A5FA",
        fontSize: 10, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {num}
      </div>
      <div style={{ fontSize: 12, color: "var(--sub)", lineHeight: 1.5, paddingTop: 2 }}>
        {text}
      </div>
    </div>
  );
}

export default function OfframpChooser({ recipientName, regionCode, amountUSDT, methodId }: Props) {
  const [open, setOpen] = useState(false);

  if (regionCode !== "PH") return null;
  if (["binance", "pdax", "gateio"].includes(methodId)) return null;

  const phpAmount  = Math.floor(amountUSDT * PHP_RATE);
  const fonbnkUrl  = buildFonbnkUrl(amountUSDT);
  const methodName = methodId === "gcash" ? "GCash" : methodId === "maya" ? "Maya" : "Bank Transfer";

  const stepsA = [
    "Buksan ang MiniPay app.",
    `I-tap ang "Withdraw" o "Cash Out".`,
    `Piliin ang ${methodName}.`,
    "I-enter ang account details at i-confirm.",
    "Libre. Matatanggap sa loob ng 1–5 minuto.",
  ];

  const stepsB = [
    "I-tap ang button sa ibaba para buksan ang Fonbnk.",
    "I-enter ang iyong phone number (+63XXXXXXXXX).",
    "I-enter ang Bank Account Holder Name.",
    "Piliin ang iyong bank — BDO, BPI, Metrobank, UnionBank + 30 more.",
    "I-enter ang Bank Account Number at i-tap ang Pay.",
  ];

  return (
    <div style={{
      background: "var(--srf)",
      border: "1px solid var(--bdr)",
      borderRadius: "var(--rad)",
      overflow: "hidden",
      marginTop: 8,
    }}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          color: "var(--txt)",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>💸</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              Paano mag-withdraw si {recipientName || "recipient"}?
            </div>
            <div style={{ fontSize: 11, color: "var(--sub)", marginTop: 1 }}>
              2 options: MiniPay Withdraw o Fonbnk
            </div>
          </div>
        </div>
        <span style={{ color: "var(--sub)", fontSize: 18 }}>{open ? "∨" : "›"}</span>
      </button>

      {open && (
        <div style={{ borderTop: "1px solid var(--bdr)" }}>

          {/* Option A — Transak via MiniPay */}
          <div style={{ padding: 14, borderBottom: "1px solid var(--bdr)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>📱</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Option A — MiniPay Withdraw</div>
                <div style={{ fontSize: 11, color: "var(--g)", fontWeight: 600 }}>
                  Free · Via Transak · {methodName}
                </div>
              </div>
              <span style={{
                marginLeft: "auto",
                background: "rgba(53,208,127,.12)",
                color: "var(--g)",
                border: "1px solid rgba(53,208,127,.25)",
                borderRadius: 6,
                padding: "2px 7px",
                fontSize: 10,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}>
                Pinakamadali
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--sub)", lineHeight: 1.6, marginBottom: 10 }}>
              Direkta sa loob ng MiniPay. Walang ibang app na kailangan.
            </div>
            {stepsA.map((s, i) => <Step key={i} num={i + 1} text={s} color="green" />)}
          </div>

          {/* Option B — Fonbnk */}
          <div style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>🏦</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Option B — Fonbnk Bank Transfer</div>
                <div style={{ fontSize: 11, color: "#60A5FA", fontWeight: 600 }}>
                  BDO · BPI · Metrobank · UnionBank + 30 more
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--sub)", lineHeight: 1.6, marginBottom: 10 }}>
              Direktang nagpapadala ng PHP sa kahit anong Philippine bank account.
            </div>

            {/* Amount preview */}
            <div style={{
              background: "rgba(96,165,250,.06)",
              border: "1px solid rgba(96,165,250,.2)",
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ fontSize: 12, color: "var(--sub)" }}>Matatanggap (est.)</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#60A5FA" }}>
                ₱{phpAmount.toLocaleString("en")}
              </span>
            </div>

            {stepsB.map((s, i) => <Step key={i} num={i + 1} text={s} color="blue" />)}

            {/* Deep-link button */}
            <button
              type="button"
              onClick={() => window.open(fonbnkUrl, "_blank")}
              style={{
                width: "100%",
                marginTop: 12,
                minHeight: 48,
                background: "rgba(96,165,250,.1)",
                border: "1px solid rgba(96,165,250,.3)",
                borderRadius: 10,
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 600,
                color: "#60A5FA",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              🏦 Buksan ang Fonbnk — ₱{phpAmount.toLocaleString("en")}
            </button>

            <div style={{ fontSize: 11, color: "var(--mut)", textAlign: "center", marginTop: 5 }}>
              Magbubukas ng Fonbnk secure website sa iyong browser
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
