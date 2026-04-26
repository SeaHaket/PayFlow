import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSendUSDT, type SendRow } from "../hooks/useSendUSDT";
import { REGIONS } from "../lib/constants";
import { formatUSD, formatLocal, buildFamilyMessage } from "../lib/utils";
import { isValidAddress } from "../lib/socialconnect";
import OfframpChooser from "../components/OfframpChooser";

const ZERO = "0x0000000000000000000000000000000000000000";

type RecipRow = {
  name: string; region: string; method: string;
  amount: string; pct: string; toAddress: `0x${string}`;
};
type Template = {
  id: number | string; name: string;
  rows: RecipRow[]; splitBy: "amount" | "percent";
};
type HistEntry = {
  id: number; date: string;
  rows: { name: string; region: string; method: string; amt: number }[];
  txHashes: string[];
};

const getR  = (c: string) => REGIONS.find((r) => r.code === c);
const getM  = (c: string, m: string) => getR(c)?.methods.find((x) => x.id === m);
const isRes = (r: RecipRow) => isValidAddress(r.toAddress) && r.toAddress !== ZERO;

// Default plan — addresses filled from saved templates
// Users set up recipients in the Send tab first, save as template, then use Payday
const DEFAULT_PLAN: Template = {
  id: "default",
  name: "Pamilya Plan (setup needed)",
  splitBy: "amount",
  rows: [],
};

type Props = { balance: number; senderName: string; onDone: () => void; };

export default function PaydayScreen({ balance, senderName, onDone }: Props) {
  const [tpls]            = useLocalStorage<Template[]>("pf_t", []);
  const [hist, setHist]   = useLocalStorage<HistEntry[]>("pf_h", []);
  const [selId, setSelId] = useState<string | number>(tpls.length > 0 ? tpls[0].id : "default");
  const [done, setDone]   = useState(false);

  const { sendAll, status, error: sendError } = useSendUSDT();

  const plans = tpls.length > 0 ? tpls : [DEFAULT_PLAN];
  const plan  = plans.find((p) => p.id === selId) ?? plans[0];

  const calcAmt = (r: RecipRow) =>
    plan.splitBy === "percent"
      ? ((parseFloat(r.pct) || 0) / 100) * balance
      : parseFloat(r.amount) || 0;

  const total        = plan.rows.reduce((s, r) => s + calcAmt(r), 0);
  const isBusy       = status === "sending" || status === "confirming";
  const hasRows      = plan.rows.length > 0;
  const allResolved  = hasRows && plan.rows.every(isRes);
  const canSend      = allResolved && total > 0 && total <= balance;

  const execute = async () => {
    const sendRows: SendRow[] = plan.rows.map((r) => ({
      name: r.name, toAddress: r.toAddress,
      amountUSDT: calcAmt(r), region: r.region, method: r.method,
    }));
    try {
      const hashes = await sendAll(sendRows);
      setHist([{
        id: Date.now(), date: new Date().toLocaleDateString("en-PH"),
        rows: plan.rows.map((r) => ({ name: r.name, region: r.region, method: r.method, amt: calcAmt(r) })),
        txHashes: hashes ?? [],
      }, ...hist].slice(0, 50));
      setDone(true);
    } catch { /* error shown via sendError */ }
  };

  // Done screen
  if (done) return (
    <div className="page">
      <div className="done">
        <div className="done-icon">⚡</div>
        <div className="done-title">Payday done!</div>
        <div className="done-sub">{formatUSD(total)} sent · {plan.rows.length} recipients</div>
      </div>
      <div className="recv">
        {plan.rows.map((r, i) => { const rr = getR(r.region); const amt = calcAmt(r); return (
          <div className="recv-row" key={i}>
            <div><div className="recv-name">{r.name}</div><div className="recv-via">{rr?.flag} {getM(r.region, r.method)?.name}</div></div>
            <div><div className="recv-local">{formatLocal(amt, rr?.cur ?? "PHP")}</div><div className="recv-usd">{formatUSD(amt)}</div></div>
          </div>
        ); })}
      </div>
      <div className="sec" style={{ marginTop: 16 }}>Send instructions to family</div>
      <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 6 }}>Copy and send each message on Viber or WhatsApp.</p>
      {plan.rows.map((r, i) => {
        const rr  = getR(r.region);
        const m   = getM(r.region, r.method);
        const amt = calcAmt(r);
        const lc  = formatLocal(amt, rr?.cur ?? "PHP");
        const msg = buildFamilyMessage(senderName, r.name, amt, lc, m?.name ?? "", m?.steps ?? [], m?.note ?? "", r.region === "PH");
        const copy = () => navigator.clipboard?.writeText(msg);
        return (
          <div key={i}>
            <div className="viber-card" style={{ marginBottom: 4 }}>
              <div className="viber-header">
                <span style={{ fontSize: 20 }}>💬</span>
                <div><div className="viber-label">Para kay {r.name}</div><div className="viber-sublabel">{rr?.flag} {m?.name} · {lc}</div></div>
              </div>
              <div className="viber-msg">{msg}</div>
              <div className="viber-btns">
                <button className="viber-btn primary" onClick={() => navigator.share?.({ text: msg }) ?? copy()} type="button">📤 Share</button>
                <button className="viber-btn" onClick={copy} type="button">📋 Copy</button>
              </div>
            </div>
            <OfframpChooser
              recipientName={r.name}
              regionCode={r.region}
              amountUSDT={amt}
              methodId={r.method}
            />
          </div>
        );
      })}
      <button className="btn-ghost" style={{ marginTop: 4 }} onClick={() => { setDone(false); onDone(); }} type="button">Done</button>
    </div>
  );

  // No templates yet
  if (!hasRows) return (
    <div className="page">
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>⚡ Payday Mode</div>
      <div style={{ fontSize: 13, color: "var(--sub)", marginBottom: 16, lineHeight: 1.6 }}>
        One tap sends everything to your family. First, set up your recipients in the Send tab.
      </div>
      <div className="card">
        <div className="card-body">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>How to set up Payday Mode</div>
          {[
            { n: 1, t: 'Go to the Send tab.' },
            { n: 2, t: 'Add each recipient — name, wallet address, region, method, amount.' },
            { n: 3, t: 'Tap "Save template" and name it (e.g. "Pamilya Plan").' },
            { n: 4, t: 'Come back here — your plan appears automatically.' },
          ].map((s) => (
            <div key={s.n} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(252,255,82,.12)", color: "var(--y)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.n}</div>
              <div style={{ fontSize: 14, lineHeight: 1.5, paddingTop: 3 }}>{s.t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Plan selection
  return (
    <div className="page">
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>⚡ Payday Mode</div>
      <div style={{ fontSize: 13, color: "var(--sub)", marginBottom: 12 }}>One tap. Sends everything per your plan.</div>

      <div className="sec">Choose plan</div>
      {plans.map((p) => (
        <button key={String(p.id)} type="button"
          style={{
            width: "100%", display: "block", textAlign: "left", padding: "13px",
            borderRadius: "var(--rad)", marginBottom: 6, cursor: "pointer",
            fontFamily: "inherit", color: "var(--txt)",
            border: `1px solid ${selId === p.id ? "var(--y)" : "var(--bdr)"}`,
            background: selId === p.id ? "rgba(252,255,82,.06)" : "var(--srf)",
          }}
          onClick={() => setSelId(p.id)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontWeight: 500, fontSize: 15 }}>{p.name}</span>
            {selId === p.id && <span style={{ color: "var(--y)" }}>✓</span>}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {p.rows.map((r, i) => {
              const rr = getR(r.region);
              const amt = p.splitBy === "percent" ? ((parseFloat(r.pct) || 0) / 100) * balance : parseFloat(r.amount) || 0;
              return (
                <span key={i} style={{ background: "rgba(255,255,255,.06)", border: "1px solid var(--bdr)", borderRadius: 6, padding: "2px 7px", fontSize: 11, color: "var(--sub)" }}>
                  {rr?.flag} {r.name} · {formatLocal(amt, rr?.cur ?? "PHP")} {isRes(r) ? "✓" : "⚠️"}
                </span>
              );
            })}
          </div>
        </button>
      ))}

      <div className="summ">
        <div className="summ-row">
          <span style={{ color: "var(--sub)" }}>Total</span>
          <span style={{ fontWeight: 600, color: "var(--y)" }}>{formatUSD(total)}</span>
        </div>
        <div className="summ-row">
          <span style={{ color: "var(--sub)" }}>PayFlow fee</span>
          <span style={{ color: "var(--g)", fontWeight: 600 }}>Free (launch offer)</span>
        </div>
        <div className="summ-row">
          <span style={{ color: "var(--sub)" }}>Celo gas</span>
          <span style={{ color: "var(--sub)", fontSize: 12 }}>~$0.001–$0.005 per recipient</span>
        </div>
        <div className="summ-row" style={{ alignItems: "flex-start" }}>
          <span style={{ color: "var(--sub)" }}>Offramp fee</span>
          <span style={{ color: "var(--sub)", fontSize: 12, textAlign: "right", maxWidth: "55%" }}>
            Free via MiniPay x Transak (0% until further notice)
          </span>
        </div>
      </div>

      {!allResolved && hasRows && (
        <div style={{ background: "rgba(255,179,71,.08)", border: "1px solid rgba(255,179,71,.25)", borderRadius: 10, padding: "10px 13px", fontSize: 13, color: "#FFB347", lineHeight: 1.5 }}>
          ⚠️ Some recipients are missing a wallet address. Edit the template in the Send tab to add them.
        </div>
      )}

      {sendError && (
        <div style={{ background: "rgba(255,107,107,.08)", border: "1px solid rgba(255,107,107,.25)", borderRadius: 10, padding: "10px 13px", fontSize: 13, color: "var(--r)" }}>{sendError}</div>
      )}

      <button className="btn" style={{ marginTop: 4 }} disabled={isBusy || !canSend} onClick={execute} type="button">
        {isBusy ? <><div className="spin" />Sending…</>
          : !canSend && !allResolved ? "Add wallet addresses first"
          : total > balance ? "Insufficient balance"
          : `Send ${formatUSD(total)} now`}
      </button>
    </div>
  );
}
