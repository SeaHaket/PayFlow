import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSendUSDT, type SendRow } from "../hooks/useSendUSDT";
import { REGIONS, MAX_RECIPIENTS } from "../lib/constants";
import { formatUSD, formatLocal, buildFamilyMessage } from "../lib/utils";
import { isValidAddress } from "../lib/socialconnect";
import OfframpChooser from "../components/OfframpChooser";

const ZERO = "0x0000000000000000000000000000000000000000" as `0x${string}`;

type RecipRow = {
  name:      string;
  toAddress: `0x${string}`;
  region:    string;
  method:    string;
  amount:    string;
  pct:       string;
};

type Template = {
  id: number; name: string;
  rows: RecipRow[]; splitBy: "amount" | "percent"; date: string;
};

type HistEntry = {
  id: number; date: string;
  rows: { name: string; region: string; method: string; amt: number }[];
  txHashes: string[];
};

type Props = { balance: number; senderName: string; onDone: () => void; };

const getR = (c: string) => REGIONS.find((r) => r.code === c);
const getM = (c: string, m: string) => getR(c)?.methods.find((x) => x.id === m);
const mkRow = (): RecipRow => ({
  name: "", toAddress: ZERO, region: "PH", method: "gcash", amount: "", pct: "",
});
const isResolved = (r: RecipRow) => isValidAddress(r.toAddress) && r.toAddress !== ZERO;

// ─── Region Picker ────────────────────────────────────────────────
function RegionPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const sel = getR(value);
  return (
    <>
      <button className="rgi" onClick={() => setOpen(true)} type="button">
        <span className="rgi-flag">{sel?.flag}</span>
        <span className="rgi-info">
          <span className="rgi-name">{sel?.name} ({sel?.cur})</span>
          <span className="rgi-methods" style={{ display: "block" }}>
            {sel?.methods.map((m) => m.name).slice(0, 3).join(" · ")}
            {(sel?.methods.length ?? 0) > 3 ? " …" : ""}
          </span>
        </span>
        <span style={{ color: "var(--sub)", fontSize: 16 }}>›</span>
      </button>
      {open && (
        <div className="ov" onClick={() => setOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="hdl" />
            <div className="sht" style={{ marginBottom: 10 }}>Region</div>
            {REGIONS.map((r) => (
              <button key={r.code} className={`rgi ${value === r.code ? "on" : ""}`}
                onClick={() => { onChange(r.code); setOpen(false); }} type="button">
                <span className="rgi-flag">{r.flag}</span>
                <span className="rgi-info">
                  <span className="rgi-name">{r.name}</span>
                  <span className="rgi-methods" style={{ display: "block" }}>
                    {r.methods.map((m) => m.name).join(" · ")}
                  </span>
                </span>
                {value === r.code && <span style={{ color: "var(--y)" }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function MethodPills({ regionCode, value, onChange }: { regionCode: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mpills">
      {getR(regionCode)?.methods.map((m) => (
        <button key={m.id} className={`mpill ${value === m.id ? "on" : ""}`}
          onClick={() => onChange(m.id)} type="button">{m.name}</button>
      ))}
    </div>
  );
}

function ViberCard({ senderName, row, amt }: { senderName: string; row: RecipRow; amt: number }) {
  const [copied, setCopied] = useState(false);
  const rr  = getR(row.region);
  const m   = getM(row.region, row.method);
  const lc  = formatLocal(amt, rr?.cur ?? "PHP");
  const msg = buildFamilyMessage(
    senderName, row.name, amt, lc,
    m?.name ?? "", m?.steps ?? [], m?.note ?? "", row.region === "PH"
  );
  const copy  = () => navigator.clipboard?.writeText(msg).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  const share = () => (navigator.share ? navigator.share({ text: msg }) : copy());
  return (
    <div className="viber-card">
      <div className="viber-header">
        <span style={{ fontSize: 20 }}>💬</span>
        <div>
          <div className="viber-label">Para kay {row.name || "recipient"}</div>
          <div className="viber-sublabel">{rr?.flag} {rr?.name} · {m?.name} · {lc}</div>
        </div>
      </div>
      <div className="viber-msg">{msg}</div>
      <div className="viber-btns">
        <button className="viber-btn primary" onClick={share} type="button">📤 Share</button>
        <button className="viber-btn" onClick={copy} type="button">{copied ? "✓ Copied" : "📋 Copy"}</button>
      </div>
    </div>
  );
}

function FamilyGuide({ region, method, onBack }: { region: string; method: string; onBack: () => void }) {
  const r = getR(region); const m = getM(region, method);
  if (!r || !m) return null;
  return (
    <div className="page">
      <button className="btn-back" onClick={onBack} type="button">← Bumalik</button>
      <div className="card">
        <div className="card-body">
          <div style={{ fontSize: 32, marginBottom: 8 }}>{r.flag}</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Paano mag-withdraw sa {m.name}</div>
          <div style={{ fontSize: 13, color: "var(--sub)" }}>Sundan ang mga hakbang na ito para makuha ang pera.</div>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--sub)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 12 }}>Mga Hakbang</div>
          {m.steps.map((step, i) => (
            <div className="guide-step" key={i} style={{ marginBottom: i < m.steps.length - 1 ? 12 : 0 }}>
              <div className="guide-num">{i + 1}</div>
              <div className="guide-text">{step}</div>
            </div>
          ))}
        </div>
      </div>
      {m.note && <div className="guide-note"><strong>💡 Tandaan:</strong> {m.note}</div>}
      <button className="btn-ghost" onClick={onBack} type="button">Tapos na</button>
    </div>
  );
}

// ─── How to find your MiniPay address helper ──────────────────────
function AddressHelp() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        style={{ background: "none", border: "none", color: "var(--sub)", fontSize: 12, cursor: "pointer", textAlign: "left", padding: "2px 0", textDecoration: "underline" }}>
        How to find a MiniPay wallet address?
      </button>
      {open && (
        <div className="ov" onClick={() => setOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="hdl" />
            <div className="sht" style={{ marginBottom: 12 }}>How to get a MiniPay address</div>
            {[
              { n: 1, t: "Ask the recipient to open their MiniPay app." },
              { n: 2, t: 'Tap the QR code icon in the top-right corner of MiniPay.' },
              { n: 3, t: 'Tap "Copy address" or share the QR code with you.' },
              { n: 4, t: 'Paste the address (starts with 0x...) in the field above.' },
            ].map((s) => (
              <div key={s.n} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(252,255,82,.12)", color: "var(--y)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.n}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, paddingTop: 3 }}>{s.t}</div>
              </div>
            ))}
            <div style={{ background: "rgba(53,208,127,.07)", border: "1px solid rgba(53,208,127,.18)", borderRadius: 10, padding: "10px 13px", fontSize: 13, color: "var(--sub)", lineHeight: 1.5 }}>
              💡 The recipient only needs to share their address once. Save it as a template after the first send so you never have to ask again.
            </div>
            <button className="btn-ghost" style={{ marginTop: 8 }} onClick={() => setOpen(false)} type="button">Got it</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function SendScreen({ balance, senderName, onDone }: Props) {
  const [step, setStep]     = useState<"build" | "review" | "done">("build");
  const [splitBy, setSplit] = useState<"amount" | "percent">("amount");
  const [rows, setRows]     = useState<RecipRow[]>([mkRow()]);
  const [tpls, setTpls]     = useLocalStorage<Template[]>("pf_t", []);
  const [hist, setHist]     = useLocalStorage<HistEntry[]>("pf_h", []);
  const [showLoad, setLoad] = useState(false);
  const [showSave, setSave] = useState(false);
  const [saveName, setSN]   = useState("");
  const [guide, setGuide]   = useState<{ region: string; method: string } | null>(null);
  const [toast, setToast]   = useState<string | null>(null);

  const { sendAll, status, error: sendError } = useSendUSDT();
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2600); };

  const upd = (i: number, k: keyof RecipRow, v: any) =>
    setRows((p) => { const u = [...p]; (u[i] as any)[k] = v; return u; });

  const updRegion = (i: number, code: string) => {
    const r = getR(code);
    setRows((p) => { const u = [...p]; u[i] = { ...u[i], region: code, method: r?.methods[0]?.id ?? "" }; return u; });
  };

  const calcAmt = (r: RecipRow) =>
    splitBy === "percent" ? ((parseFloat(r.pct) || 0) / 100) * balance : parseFloat(r.amount) || 0;

  const total   = rows.reduce((s, r) => s + calcAmt(r), 0);
  const isBusy  = status === "sending" || status === "confirming";
  const canSend = total > 0 && total <= balance && rows.every(isResolved);

  const executeSend = async () => {
    const sendRows: SendRow[] = rows.map((r) => ({
      name: r.name || "Recipient", toAddress: r.toAddress,
      amountUSDT: calcAmt(r), region: r.region, method: r.method,
    }));
    try {
      const txHashes = await sendAll(sendRows);
      setHist([{
        id: Date.now(), date: new Date().toLocaleDateString("en-PH"),
        rows: rows.map((r) => ({ name: r.name || "Recipient", region: r.region, method: r.method, amt: calcAmt(r) })),
        txHashes: txHashes ?? [],
      }, ...hist].slice(0, 50));
      setStep("done");
    } catch { /* sendError shown below */ }
  };

  if (guide) return <FamilyGuide region={guide.region} method={guide.method} onBack={() => setGuide(null)} />;

  // ── Done ──────────────────────────────────────────────────────
  if (step === "done") return (
    <div className="page">
      <div className="done">
        <div className="done-icon">✅</div>
        <div className="done-title">Sent!</div>
        <div className="done-sub">{formatUSD(total)} · {rows.length} recipient{rows.length > 1 ? "s" : ""}</div>
      </div>
      <div className="recv">
        {rows.map((r, i) => { const rr = getR(r.region); const amt = calcAmt(r); return (
          <div className="recv-row" key={i}>
            <div><div className="recv-name">{r.name || `Recipient ${i + 1}`}</div><div className="recv-via">{rr?.flag} via {getM(r.region, r.method)?.name}</div></div>
            <div><div className="recv-local">{formatLocal(amt, rr?.cur ?? "PHP")}</div><div className="recv-usd">{formatUSD(amt)}</div></div>
          </div>
        ); })}
      </div>
      <div className="sec" style={{ marginTop: 16 }}>Send instructions to family</div>
      <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 4 }}>Copy each message and send on Viber or WhatsApp.</p>
      {rows.map((r, i) => (
        <div key={i}>
          <ViberCard senderName={senderName} row={r} amt={calcAmt(r)} />
          <OfframpChooser
            recipientName={r.name}
            regionCode={r.region}
            amountUSDT={calcAmt(r)}
            methodId={r.method}
          />
        </div>
      ))}
      <button className="btn-ghost" style={{ marginTop: 4 }} onClick={() => { setStep("build"); setRows([mkRow()]); }} type="button">Send again</button>
    </div>
  );

  // ── Review ────────────────────────────────────────────────────
  if (step === "review") return (
    <div className="page">
      <button className="btn-back" onClick={() => setStep("build")} type="button">← Back</button>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Review & confirm</div>
      <div className="sec">What family receives</div>
      <div className="recv">
        {rows.map((r, i) => { const rr = getR(r.region); const amt = calcAmt(r); return (
          <div className="recv-row" key={i}>
            <div><div className="recv-name">{r.name || `Recipient ${i + 1}`}</div><div className="recv-via">{rr?.flag} {rr?.name} · {getM(r.region, r.method)?.name}</div></div>
            <div><div className="recv-local">{formatLocal(amt, rr?.cur ?? "PHP")}</div><div className="recv-usd">{formatUSD(amt)}</div></div>
          </div>
        ); })}
      </div>
      <div className="summ">
        <div className="summ-row">
          <span style={{ color: "var(--sub)" }}>You send</span>
          <span style={{ fontWeight: 600, color: "var(--y)" }}>{formatUSD(total)}</span>
        </div>
        <div className="summ-row">
          <span style={{ color: "var(--sub)" }}>PayFlow fee</span>
          <span style={{ color: "var(--g)", fontWeight: 600 }}>Free (launch offer)</span>
        </div>
        <div className="summ-row">
          <span style={{ color: "var(--sub)" }}>Celo gas fee</span>
          <span style={{ color: "var(--sub)", fontSize: 12 }}>~$0.001–$0.005 per recipient</span>
        </div>
        <div className="summ-row" style={{ alignItems: "flex-start" }}>
          <span style={{ color: "var(--sub)" }}>Offramp fee</span>
          <span style={{ color: "var(--sub)", fontSize: 12, textAlign: "right", maxWidth: "55%" }}>
            Free via MiniPay x Transak (0% until further notice)
          </span>
        </div>
        <hr className="summ-div" />
        <div className="summ-total">
          <span>Balance after</span>
          <span>{formatUSD(Math.max(0, balance - total))}</span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: "var(--sub)", lineHeight: 1.5 }}>
        USDT moves to each recipient's MiniPay wallet on-chain. They open MiniPay and withdraw to GCash, Maya, or their local method.
      </p>
      {sendError && (
        <div style={{ background: "rgba(255,107,107,.08)", border: "1px solid rgba(255,107,107,.25)", borderRadius: 10, padding: "10px 13px", fontSize: 13, color: "var(--r)" }}>{sendError}</div>
      )}
      <button className="btn" onClick={executeSend} disabled={isBusy} style={{ marginTop: 4 }} type="button">
        {isBusy ? <><div className="spin" />Sending…</> : `Confirm Send ${formatUSD(total)}`}
      </button>
    </div>
  );

  // ── Build ─────────────────────────────────────────────────────
  return (
    <div className="page">
      {toast && <div className="toast">{toast}</div>}

      <div style={{ display: "flex", gap: 7 }}>
        <button className="btn-ghost" style={{ flex: 1, minHeight: 42, fontSize: 13 }} onClick={() => setLoad(true)} type="button">Load template</button>
        <button className="btn-ghost" style={{ flex: 1, minHeight: 42, fontSize: 13 }} onClick={() => setSave(true)} type="button">Save template</button>
      </div>

      <div className="seg">
        <button className={`sb ${splitBy === "amount" ? "on" : ""}`} onClick={() => setSplit("amount")} type="button">$ Amount</button>
        <button className={`sb ${splitBy === "percent" ? "on" : ""}`} onClick={() => setSplit("percent")} type="button">% Share</button>
      </div>

      {rows.map((r, i) => (
        <div className="rblk" key={i}>
          <div className="rblk-hdr">
            <div className="rnum">{i + 1}</div>
            {rows.length > 1 && (
              <button style={{ background: "none", border: "none", color: "var(--r)", cursor: "pointer", fontSize: 18 }}
                onClick={() => setRows(rows.filter((_, x) => x !== i))} type="button">✕</button>
            )}
          </div>

          {/* Name */}
          <div className="field">
            <label className="lbl">Name</label>
            <input className="inp" placeholder="e.g. Mama" value={r.name}
              onChange={(e) => upd(i, "name", e.target.value)} />
          </div>

          {/* Wallet address — clean direct input, no failed API calls */}
          <div className="field">
            <label className="lbl">
              MiniPay Wallet Address
              {isResolved(r) && (
                <span style={{ color: "var(--g)", marginLeft: 6, fontWeight: 400, textTransform: "none", fontSize: 11 }}>
                  ✓ {r.toAddress.slice(0, 8)}…{r.toAddress.slice(-4)}
                </span>
              )}
            </label>
            <input
              className="inp"
              placeholder="0x..."
              value={r.toAddress === ZERO ? "" : r.toAddress}
              onChange={(e) => {
                const v = e.target.value.trim();
                upd(i, "toAddress", v || ZERO);
              }}
              style={{
                fontSize: 13,
                borderColor: r.toAddress !== ZERO && !isResolved(r) ? "rgba(255,107,107,.5)" : "var(--bdr)",
              }}
            />
            {r.toAddress !== ZERO && !isResolved(r) && (
              <div style={{ fontSize: 12, color: "var(--r)" }}>
                Enter a valid 0x address (42 characters).
              </div>
            )}
            <AddressHelp />
          </div>

          {/* Region */}
          <div className="field">
            <label className="lbl">Region</label>
            <RegionPicker value={r.region} onChange={(v) => updRegion(i, v)} />
          </div>

          {/* Withdraw method */}
          <div className="field">
            <label className="lbl">Withdraw method</label>
            <MethodPills regionCode={r.region} value={r.method} onChange={(v) => upd(i, "method", v)} />
          </div>

          {/* Amount */}
          <div className="field">
            <label className="lbl">{splitBy === "percent" ? "Share (%)" : "Amount (USDT)"}</label>
            <input className="inp" type="number" inputMode="decimal"
              placeholder={splitBy === "percent" ? "e.g. 50" : "e.g. 5"}
              value={splitBy === "percent" ? r.pct : r.amount}
              onChange={(e) => upd(i, splitBy === "percent" ? "pct" : "amount", e.target.value)} />
            {calcAmt(r) > 0 && (
              <div className="hint">≈ {formatLocal(calcAmt(r), getR(r.region)?.cur ?? "PHP")}</div>
            )}
          </div>
        </div>
      ))}

      {rows.length < MAX_RECIPIENTS && (
        <button className="btn-ghost" style={{ borderStyle: "dashed", minHeight: 44 }}
          onClick={() => setRows([...rows, mkRow()])} type="button">
          + Add recipient ({rows.length}/{MAX_RECIPIENTS})
        </button>
      )}

      {total > 0 && (
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
        </div>
      )}

      <button className="btn" disabled={!canSend} onClick={() => setStep("review")} type="button">
        {total > balance ? "Insufficient balance"
          : !canSend ? "Enter recipient wallet address"
          : `Review ${formatUSD(total)}`}
      </button>

      {/* Load templates */}
      {showLoad && (
        <div className="ov" onClick={() => setLoad(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="hdl" /><div className="sht">Templates</div>
            {tpls.length === 0
              ? <div style={{ fontSize: 13, color: "var(--sub)", padding: "16px 0", textAlign: "center" }}>No saved templates yet.</div>
              : tpls.map((t) => (
                <div key={t.id} className="card" style={{ cursor: "pointer", padding: 0 }}
                  onClick={() => { setRows(t.rows); setSplit(t.splitBy); setLoad(false); showToast(`Loaded "${t.name}"`); }}>
                  <div className="card-body">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                      <span style={{ fontWeight: 500 }}>{t.name}</span>
                      <button style={{ background: "none", border: "none", color: "var(--r)", cursor: "pointer" }}
                        onClick={(e) => { e.stopPropagation(); setTpls(tpls.filter((x) => x.id !== t.id)); }} type="button">✕</button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {t.rows.map((r, i) => (
                        <span key={i} style={{ background: "rgba(255,255,255,.06)", border: "1px solid var(--bdr)", borderRadius: 6, padding: "2px 7px", fontSize: 11, color: "var(--sub)" }}>
                          {r.name || `R${i + 1}`} · {getR(r.region)?.flag} {getM(r.region, r.method)?.name} {isResolved(r) ? "✓" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Save template */}
      {showSave && (
        <div className="ov" onClick={() => setSave(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="hdl" /><div className="sht">Save template</div>
            <div className="field">
              <label className="lbl">Name</label>
              <input className="inp" placeholder='"Pamilya Plan"' value={saveName} onChange={(e) => setSN(e.target.value)} />
            </div>
            <button className="btn" type="button" onClick={() => {
              if (!saveName.trim()) return showToast("Enter a name");
              setTpls([{ id: Date.now(), name: saveName, rows: [...rows], splitBy, date: new Date().toLocaleDateString("en-PH") }, ...tpls]);
              setSN(""); setSave(false); showToast("Template saved ✓");
            }}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
