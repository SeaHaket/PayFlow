import { useState } from "react";
import { useExchangeRate } from "../hooks/useExchangeRate";
import { useLocalStorage  } from "../hooks/useLocalStorage";
import { REGIONS } from "../lib/constants";
import { formatUSD, formatLocal, shortenAddress } from "../lib/utils";
import type { Tab } from "../App";

type HistRow   = { name: string; region: string; method: string; amt: number };
type HistEntry = { id: number; date: string; rows: HistRow[] };

type Props = {
  balance:    number;
  address:    string;
  navigate:   (t: Tab) => void;
  newFunds:   boolean;
  isTestnet:  boolean;
  onAllocate: () => void;
};

export default function HomeScreen({ balance, address, navigate, newFunds, isTestnet, onAllocate }: Props) {
  const { rate: phpRate }    = useExchangeRate("PHP");
  const [hist]               = useLocalStorage<HistEntry[]>("pf_h", []);
  const [showRewards, setSR] = useState(false);

  const totalSent = hist.reduce((s, h) => s + h.rows.reduce((a, r) => a + r.amt, 0), 0);
  const allNames  = [...new Set(hist.flatMap((h) => h.rows.map((r) => r.name)))];
  const newAmt    = 350; // In prod: balance delta detected by polling

  return (
    <div className="page">
      {/* Balance card */}
      <div className="bal">
        <div className="bal-lbl">
          {isTestnet ? "USDT Balance (Testnet)" : "USDT Balance"}
        </div>
        <div className="bal-amt">{formatUSD(balance)}</div>
        {phpRate && (
          <div className="bal-rate">1 USDT = ₱{phpRate.toFixed(2)} · Live rate</div>
        )}
        {address && (
          <div style={{ fontSize:11, color:"var(--sub)", marginTop:3 }}>
            {shortenAddress(address)}
          </div>
        )}
        <div className="bal-stats">
          <div>
            <div className="stat-lbl">Sent total</div>
            <div className="stat-val" style={{ color:"var(--g)" }}>{formatUSD(totalSent)}</div>
          </div>
          <div>
            <div className="stat-lbl">Sends</div>
            <div className="stat-val">{hist.length}</div>
          </div>
          <div>
            <div className="stat-lbl">Recipients</div>
            <div className="stat-val">{allNames.length}</div>
          </div>
        </div>
      </div>

      {/* Testnet info banner */}
      {isTestnet && (
        <div style={{
          background:"rgba(255,179,71,.08)", border:"1px solid rgba(255,179,71,.25)",
          borderRadius:"var(--rad)", padding:"11px 14px",
          fontSize:13, color:"#FFB347", lineHeight:1.5,
        }}>
          🧪 <strong>Testnet mode.</strong> Balances and sends use fake tokens.
          Switch off "Use Testnet" in MiniPay Developer Settings to use real funds.
        </div>
      )}

      {/* New funds alert */}
      {newFunds && (
        <div className="alert">
          <span className="alert-icon">💰</span>
          <div className="alert-body">
            <div className="alert-title">+{formatUSD(newAmt)} received</div>
            <div className="alert-sub">
              {phpRate
                ? `≈ ₱${(newAmt * phpRate).toLocaleString("en",{maximumFractionDigits:0})} · `
                : ""}
              Ready to allocate
            </div>
          </div>
          <button className="btn-sm" onClick={onAllocate} type="button">Allocate</button>
        </div>
      )}

      {/* Rewards info */}
      <button className="boost-box" onClick={() => setSR(true)} type="button"
        style={{ width:"100%", textAlign:"left", cursor:"pointer" }}>
        <span className="boost-icon">🎁</span>
        <div className="boost-text" style={{ flex:1 }}>
          <strong style={{ color:"var(--txt)", fontWeight:600 }}>MiniPay Rewards active</strong><br/>
          Boost · Daily Reward · Opera Points. Tap to see details.
        </div>
        <span style={{ color:"var(--sub)", fontSize:16 }}>›</span>
      </button>

      {/* Actions */}
      <div className="sec">Actions</div>
      <div className="acts">
        <button className="act" onClick={() => navigate("send")} type="button">
          <span className="act-icon">📤</span>Send & Allocate
        </button>
        <button className="act" onClick={() => navigate("payday")} type="button">
          <span className="act-icon">⚡</span>Payday Mode
        </button>
      </div>

      {/* Recent sends */}
      {hist.length > 0 && (
        <>
          <div className="sec">Recent sends</div>
          <div className="card">
            {hist.slice(0, 3).map((h, i) => {
              const tot   = h.rows.reduce((s, r) => s + r.amt, 0);
              const flags = [...new Set(h.rows.map((r) =>
                REGIONS.find((x) => x.code === r.region)?.flag ?? ""))].join("");
              return (
                <div className="row-item" key={i}>
                  <div>
                    <div className="row-lbl">{h.rows.map((r) => r.name).join(", ")}</div>
                    <div className="row-sub">{h.date} {flags}</div>
                  </div>
                  <div className="row-val">{formatUSD(tot)}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Rewards modal */}
      {showRewards && (
        <div className="ov" onClick={() => setSR(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="hdl"/>
            <div className="sht" style={{ marginBottom:4 }}>MiniPay Rewards</div>
            <div style={{ fontSize:13, color:"var(--sub)", marginBottom:12, lineHeight:1.5 }}>
              Three programs run automatically. Using PayFlow counts as Mini App activity — it can increase your Boost tier.
            </div>

            {[
              {
                icon:"⚡", title:"Boost", badge:"Active", badgeColor:"var(--g)", badgeBg:"rgba(53,208,127,.12)", badgeBdr:"rgba(53,208,127,.25)",
                body:"Hold USDT in MiniPay. Tiered system — more balance + more activity = higher tier. Cap: $10/week. Paid daily in USDT. No lock-up.",
                note:"Every time you use PayFlow it counts as Mini App activity and may increase your Boost tier.",
              },
              {
                icon:"📅", title:"Daily Reward", badge:"New 2026", badgeColor:"#60A5FA", badgeBg:"rgba(96,165,250,.1)", badgeBdr:"rgba(96,165,250,.2)",
                body:"All MiniPay rewards in one place. Daily check-in → streak → base reward. Quests in mini apps → bonus. Weekly jackpot: $250.",
                note:"Open MiniPay → tap Daily Reward to check in.",
              },
              {
                icon:"🌐", title:"Opera Rewards → USDT", badge:"Apr 2026", badgeColor:"#A78BFA", badgeBg:"rgba(167,139,250,.1)", badgeBdr:"rgba(167,139,250,.2)",
                body:"Browse with Opera Mini → earn points → redeem as USDT. 300 points = $1. Weekly jackpot: $250.",
                note:"",
              },
            ].map((r) => (
              <div className="card" key={r.title} style={{ marginBottom:8 }}>
                <div className="card-body">
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <span style={{ fontSize:18 }}>{r.icon}</span>
                    <span style={{ fontWeight:600, fontSize:14 }}>{r.title}</span>
                    <span style={{ marginLeft:"auto", background:r.badgeBg, color:r.badgeColor, border:`1px solid ${r.badgeBdr}`, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{r.badge}</span>
                  </div>
                  <div style={{ fontSize:13, color:"var(--sub)", lineHeight:1.55 }}>{r.body}</div>
                  {r.note && (
                    <div style={{ marginTop:8, fontSize:12, color:"var(--sub)", background:"rgba(252,255,82,.06)", border:"1px solid rgba(252,255,82,.15)", borderRadius:8, padding:"8px 10px" }}>
                      💡 {r.note}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button className="btn-ghost" onClick={() => setSR(false)} type="button">Got it</button>
          </div>
        </div>
      )}
    </div>
  );
}
