import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

type Page = "terms" | "privacy" | null;

const TERMS = `
PayFlow — Terms of Service
Last updated: April 2026

1. WHAT PAYFLOW IS
PayFlow is a mini app that runs inside MiniPay. It helps you organize and send USDT stablecoins to multiple recipients on the Celo blockchain. PayFlow does not hold, custody, or escrow any funds at any time.

PayFlow is currently free to use during its launch period. A service fee of $0.20 per send session may be introduced in a future update. Users will be notified of any fee changes before they take effect.

2. NO FINANCIAL ADVICE
PayFlow does not provide financial, investment, or legal advice. Cryptocurrency transactions carry risk. Never send more than you can afford to lose.

3. IRREVERSIBLE TRANSACTIONS
All blockchain transactions are final and irreversible. Always verify recipient details before confirming a send. PayFlow cannot reverse or refund any transaction.

4. THIRD-PARTY SERVICES
PayFlow uses MiniPay (by Opera/Blueboard Limited) for wallet management, and Celo's SocialConnect for contact resolution. These are governed by their own terms and privacy policies.

5. NO WARRANTY
PayFlow is provided "as is" without warranty of any kind. We are not responsible for any loss of funds, failed transactions, or errors in exchange rate display.

6. CONTACT
Questions? Message us on Telegram: @payflowsupport
`.trim();

const PRIVACY = `
PayFlow — Privacy Policy
Last updated: April 2026

1. DATA WE DO NOT COLLECT
PayFlow does not collect, store, or transmit any personal data to any server. There is no PayFlow backend. There are no analytics. There is no tracking.

2. DATA STORED ON YOUR DEVICE ONLY
The following is stored in your browser's localStorage — on your device, never sent anywhere:
• Your sender name (used in Viber messages)
• Saved templates (recipient names, regions, methods, amounts)
• Transaction history (amounts, dates, recipient names)
• Wallet address cache (resolved from contacts)

This data never leaves your device. Clearing your browser data removes it permanently.

3. PHONE NUMBERS & CONTACTS
When you use the contact picker, MiniPay resolves contacts internally. PayFlow only stores the resulting wallet address. Phone numbers are not stored by PayFlow.

4. BLOCKCHAIN TRANSACTIONS
When you send USDT, the transaction is recorded publicly on the Celo blockchain. This is inherent to how blockchain works and is not controlled by PayFlow.

5. THIRD-PARTY SERVICES
• MiniPay (Blueboard Limited) — provides the wallet.
• Celo SocialConnect — resolves contacts to wallet addresses.
• Google Fonts — loads the Inter font.

6. CONTACT
Questions? Message us on Telegram: @payflowsupport
`.trim();

export default function SettingsScreen() {
  const [name, setName]   = useLocalStorage<string>("pf_name", "");
  const [input, setInput] = useState(name);
  const [saved, setSaved] = useState(false);
  const [page,  setPage]  = useState<Page>(null);

  const save = () => {
    setName(input.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page">

      {/* ── Your name ── */}
      <div className="card">
        <div className="card-body">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
            Your name
          </div>
          <div style={{ fontSize: 13, color: "var(--sub)", marginBottom: 12, lineHeight: 1.5 }}>
            Used in Viber messages so your family knows the money is from you.
          </div>
          <div className="field">
            <label className="lbl">Name</label>
            <input
              className="inp"
              placeholder='e.g. "Kuya Mark" or "Papa"'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
          </div>
          <button className="btn" style={{ marginTop: 10 }} onClick={save} type="button">
            {saved ? "✓ Saved" : "Save name"}
          </button>
        </div>
      </div>

      {/* ── About ── */}
      <div className="card">
        <div className="card-body">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>About PayFlow</div>
          <div style={{ fontSize: 13, color: "var(--sub)", lineHeight: 1.6, marginBottom: 12 }}>
            PayFlow helps OFWs and seafarers split and send USDT to family on payday.
            Runs inside MiniPay. Never holds or escrows your funds.
          </div>
          {[
            { label: "Version",  value: "1.0.0" },
            { label: "Built on", value: "Celo blockchain" },
            { label: "Wallet",   value: "MiniPay by Opera" },
            { label: "PayFlow fee", value: "Free (launch offer)" },
            { label: "Future fee",  value: "$0.20 per send session" },
            { label: "Celo gas",    value: "~$0.001–$0.005 per tx" },
            { label: "Offramp fee (Transak)", value: "Free (MiniPay partnership)" },
          ].map((r) => (
            <div key={r.label} style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 13, padding: "7px 0", borderBottom: "1px solid var(--bdr)",
            }}>
              <span style={{ color: "var(--sub)" }}>{r.label}</span>
              <span style={{ fontWeight: 500 }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Support ── */}
      <div className="card">
        <div className="card-body">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Support</div>
          <div style={{ fontSize: 13, color: "var(--sub)", marginBottom: 12, lineHeight: 1.5 }}>
            Having a problem? Message us directly on Telegram.
          </div>
          {/* Use window.open so it works inside MiniPay WebView */}
          <button
            type="button"
            onClick={() => window.open("https://t.me/payflowsupport", "_blank")}
            style={{
              width: "100%", background: "rgba(96,165,250,.1)",
              border: "1px solid rgba(96,165,250,.25)", borderRadius: 10,
              padding: "12px 14px", fontSize: 14, fontWeight: 600,
              color: "#60A5FA", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            💬 Message on Telegram
          </button>
        </div>
      </div>

      {/* ── Fee transparency ── */}
      <div className="card">
        <div className="card-body">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Fees & Costs</div>
          {[
            {
              label: "PayFlow fee",
              value: "Free (launch offer)",
              valueColor: "var(--g)",
              note: "Currently $0.00. A $0.20 service fee per send session will be introduced in a future update. You will be notified before any fee is charged.",
            },
            {
              label: "Celo network gas",
              value: "~$0.001–$0.005",
              valueColor: "var(--txt)",
              note: "Paid in USDT — no CELO token needed. Charged by the blockchain per transaction, not by PayFlow. With 3 recipients = 3 transactions.",
            },
            {
              label: "Offramp fee (Transak)",
              value: "Free (MiniPay x Transak)",
              valueColor: "var(--g)",
              note: "MiniPay and Transak partnered in January 2025 to waive all withdrawal fees. Recipient pays $0 when withdrawing to GCash, Maya, or Bank via the MiniPay Withdraw button. Normal Transak rate outside MiniPay is 1–2%.",
            },
            {
              label: "Exchange fees (PDAX / Gate.io)",
              value: "Varies by exchange",
              valueColor: "var(--txt)",
              note: "If recipient uses PDAX or Gate.io to convert USDT to PHP, the exchange's own trading and withdrawal fees apply. Check each exchange's fee page.",
            },
          ].map((f, i, a) => (
            <div key={f.label} style={{ paddingBottom: 12, marginBottom: 12, borderBottom: i < a.length - 1 ? "1px solid var(--bdr)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--txt)" }}>{f.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: f.valueColor }}>{f.value}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--sub)", lineHeight: 1.55 }}>{f.note}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Legal</div>
          {[
            { label: "Terms of Service", page: "terms"   as Page },
            { label: "Privacy Policy",   page: "privacy" as Page },
          ].map((l) => (
            <button
              key={l.label}
              type="button"
              onClick={() => setPage(l.page)}
              style={{
                width: "100%", display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "13px 0",
                borderBottom: "1px solid var(--bdr)",
                background: "none", border: "none",
                borderBottomWidth: 1, borderBottomStyle: "solid" as const,
                borderBottomColor: "var(--bdr)",
                fontSize: 14, color: "var(--txt)", cursor: "pointer",
                fontFamily: "inherit", textAlign: "left" as const,
              }}
            >
              <span>{l.label}</span>
              <span style={{ color: "var(--sub)", fontSize: 18 }}>›</span>
            </button>
          ))}
          <div style={{ fontSize: 12, color: "var(--sub)", marginTop: 12, lineHeight: 1.55 }}>
            PayFlow does not provide financial advice. Crypto transactions are irreversible.
          </div>
        </div>
      </div>

      {/* ── Inline Terms / Privacy sheet ── */}
      {page && (
        <div className="ov" onClick={() => setPage(null)}>
          <div className="sheet" style={{ maxHeight: "92dvh" }} onClick={(e) => e.stopPropagation()}>
            <div className="hdl" />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div className="sht">
                {page === "terms" ? "Terms of Service" : "Privacy Policy"}
              </div>
              <button
                type="button"
                onClick={() => setPage(null)}
                style={{ background: "none", border: "none", color: "var(--sub)", fontSize: 22, cursor: "pointer", lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <div style={{
              fontSize: 13, color: "var(--sub)", lineHeight: 1.8,
              whiteSpace: "pre-wrap", overflowY: "auto",
              maxHeight: "calc(92dvh - 120px)", paddingBottom: 16,
            }}>
              {page === "terms" ? TERMS : PRIVACY}
            </div>
            <button className="btn-ghost" style={{ marginTop: 12 }} onClick={() => setPage(null)} type="button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
