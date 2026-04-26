import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { REGIONS, FALLBACK_RATES, CURRENCY_SYMBOL } from "../lib/constants";
import { formatUSD, formatLocal, buildFamilyMessage } from "../lib/utils";
import OfframpChooser from "../components/OfframpChooser";

type HistRow  = { name: string; region: string; method: string; amt: number };
type HistEntry = { id: number; date: string; rows: HistRow[]; txHashes?: string[] };

const SAMPLE: HistEntry[] = [
  { id: 1, date: "Apr 15, 2026", rows: [{ name: "Mama",    region: "PH", method: "gcash", amt: 300 }], txHashes: ["0xabc1"] },
  { id: 2, date: "Apr 1, 2026",  rows: [{ name: "Mama",    region: "PH", method: "gcash", amt: 200 }, { name: "Tatay", region: "PH", method: "maya", amt: 100 }], txHashes: ["0xabc2", "0xabc3"] },
  { id: 3, date: "Mar 15, 2026", rows: [{ name: "Jun (Crew)", region: "ID", method: "gopay", amt: 50 }], txHashes: ["0xabc4"] },
];

const getR = (c: string) => REGIONS.find((r) => r.code === c);
const getM = (c: string, m: string) => getR(c)?.methods.find((x) => x.id === m);

export default function HistoryScreen() {
  const [hist]       = useLocalStorage<HistEntry[]>("pf_h", SAMPLE);
  const [sel, setSel] = useState<HistEntry | null>(null);

  const total = hist.reduce((s, h) => s + h.rows.reduce((a, r) => a + r.amt, 0), 0);

  // Per-recipient totals
  const byPerson: Record<string, { total: number; region: string; method: string }> = {};
  hist.forEach((h) =>
    h.rows.forEach((r) => {
      if (!byPerson[r.name]) byPerson[r.name] = { total: 0, region: r.region, method: r.method };
      byPerson[r.name].total += r.amt;
    })
  );

  return (
    <div className="page">
      {/* Year total */}
      <div className="yr-box">
        <div className="yr-lbl">Total sent — 2026</div>
        <div className="yr-amt">{formatUSD(total)}</div>
        <div className="yr-sub">
          ≈ ₱{(total * (FALLBACK_RATES.PHP ?? 57.5)).toLocaleString("en", { maximumFractionDigits: 0 })} · {hist.length} sends · PayFlow fee: Free (launch)
        </div>
      </div>

      {/* Per-recipient */}
      <div className="sec">By recipient</div>
      <div className="card">
        {Object.entries(byPerson).map(([name, d], i, a) => {
          const r = getR(d.region);
          return (
            <div className="row-item" key={name}>
              <div>
                <div className="row-lbl">{r?.flag} {name}</div>
                <div className="row-sub">{getM(d.region, d.method)?.name}</div>
              </div>
              <div>
                <div className="row-val">{formatLocal(d.total, r?.cur ?? "PHP")}</div>
                <div className="row-usd">{formatUSD(d.total)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* All transactions */}
      <div className="sec">Transactions</div>
      <div className="card">
        {hist.map((h) => {
          const tot   = h.rows.reduce((s, r) => s + r.amt, 0);
          const flags = [...new Set(h.rows.map((r) => getR(r.region)?.flag))].join("");
          return (
            <div className="row-item" key={h.id} style={{ cursor: "pointer" }} onClick={() => setSel(h)}>
              <div>
                <div className="row-lbl">{h.rows.map((r) => r.name).join(", ")}</div>
                <div className="row-sub">{h.date} · {flags}</div>
              </div>
              <div className="row-val">{formatUSD(tot)}</div>
            </div>
          );
        })}
      </div>

      {/* Detail modal with Viber resend */}
      {sel && (
        <div className="ov" onClick={() => setSel(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="hdl" />
            <div className="sht" style={{ marginBottom: 10 }}>
              {sel.date}
            </div>
            <div className="recv">
              {sel.rows.map((r, i) => {
                const rr = getR(r.region);
                return (
                  <div className="recv-row" key={i}>
                    <div>
                      <div className="recv-name">{r.name}</div>
                      <div className="recv-via">{rr?.flag} {getM(r.region, r.method)?.name}</div>
                    </div>
                    <div>
                      <div className="recv-local">{formatLocal(r.amt, rr?.cur ?? "PHP")}</div>
                      <div className="recv-usd">{formatUSD(r.amt)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tx hashes */}
            {sel.txHashes && sel.txHashes.length > 0 && (
              <div style={{ fontSize: 11, color: "var(--mut)", marginTop: 8 }}>
                TX: {sel.txHashes[0]}…
              </div>
            )}

            {/* Resend Viber messages */}
            <div className="sec" style={{ marginTop: 14 }}>Resend instructions</div>
            {sel.rows.map((r, i) => {
              const rr  = getR(r.region);
              const m   = getM(r.region, r.method);
              const lc  = formatLocal(r.amt, rr?.cur ?? "PHP");
              const msg = buildFamilyMessage("", r.name, r.amt, lc, m?.name ?? "", m?.steps ?? [], m?.note ?? "", r.region === "PH");
              const copy = () => navigator.clipboard?.writeText(msg);
              return (
                <div key={i}>
                  <div className="viber-card" style={{ marginBottom: 4 }}>
                    <div className="viber-header">
                      <span style={{ fontSize: 18 }}>💬</span>
                      <div>
                        <div className="viber-label">{r.name}</div>
                        <div className="viber-sublabel">{rr?.flag} {m?.name} · {lc}</div>
                      </div>
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
                    amountUSDT={r.amt}
                    methodId={r.method}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
