import { useState } from "react";
import { useAccount } from "wagmi";
import { useAutoConnect }  from "./hooks/useAutoConnect";
import { useUSDTBalance }  from "./hooks/useUSDTBalance";
import { useLocalStorage } from "./hooks/useLocalStorage";
import HomeScreen     from "./pages/HomeScreen";
import SendScreen     from "./pages/SendScreen";
import HistoryScreen  from "./pages/HistoryScreen";
import PaydayScreen   from "./pages/PaydayScreen";
import SettingsScreen from "./pages/SettingsScreen";

export type Tab = "home" | "send" | "history" | "payday" | "settings";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "home",     label: "Home",     icon: "🏠" },
  { id: "send",     label: "Send",     icon: "📤" },
  { id: "history",  label: "History",  icon: "🕐" },
  { id: "payday",   label: "Payday",   icon: "⚡" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function App() {
  // MiniPay REQUIRED: auto-connect on load, no connect button ever shown
  useAutoConnect();

  // useAccount — wagmi v2 hook for address + connection state
  const { address, isConnected, status } = useAccount();
  const isConnecting = status === "connecting" || status === "reconnecting";

  const [tab,  setTab]   = useState<Tab>("home");
  const [nf,   setNF]    = useState(false);
  const [senderName]     = useLocalStorage<string>("pf_name", "");
  const [lastBal, setLB] = useLocalStorage<number>("pf_last_bal", 0);

  // Live balance — auto-selects correct token addresses for testnet vs mainnet
  const { balance, isLoading: balLoading, isTestnet } =
    useUSDTBalance(address as `0x${string}` | undefined);

  // Detect incoming funds (e.g. Brightwell salary deposit)
  if (balance !== null && balance > lastBal + 0.50) {
    setLB(balance);
    if (lastBal > 0) setNF(true);
  }

  // ── MiniPay guard ─────────────────────────────────────────────
  // Docs: check window.ethereum?.isMiniPay
  const isMiniPay =
    typeof window !== "undefined" &&
    !!(window as any).ethereum?.isMiniPay;

  // Dev bypass: localhost, ngrok, vercel.app
  const isDev =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
     window.location.hostname.includes("ngrok") ||
     window.location.hostname.includes("vercel.app"));

  if (!isMiniPay && !isDev) {
    return (
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", minHeight:"100dvh", padding:"32px 24px",
        textAlign:"center", gap:16, background:"#0D0D14", color:"#F0F0F8",
        fontFamily:"system-ui,sans-serif",
      }}>
        <div style={{ fontSize:56 }}>📱</div>
        <div style={{ fontSize:20, fontWeight:600 }}>Open in MiniPay</div>
        <div style={{ fontSize:14, color:"#8080A0", lineHeight:1.7, maxWidth:280 }}>
          PayFlow is a mini app for OFWs and seafarers.
          Open it from the MiniPay app's Discover tab or paste the URL in
          MiniPay Developer Settings.
        </div>
      </div>
    );
  }

  // ── Connecting ────────────────────────────────────────────────
  if (isConnecting || (!isConnected && !isDev)) {
    return (
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", minHeight:"100dvh", gap:16,
        background:"#0D0D14", color:"#F0F0F8", fontFamily:"system-ui,sans-serif",
      }}>
        <div style={{ fontSize:48 }}>⏳</div>
        <div style={{ fontSize:18, fontWeight:600 }}>Connecting to MiniPay…</div>
        <div style={{ fontSize:14, color:"#8080A0" }}>Please wait a moment</div>
      </div>
    );
  }

  const displayBal = balance ?? 0;
  const curTab     = TABS.find((t) => t.id === tab);

  return (
    <div className="app">
      {/* Top bar */}
      <div className="bar">
        <div className="bar-title">
          {tab === "home" ? "PayFlow" : curTab?.label}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {isTestnet && (
            <span style={{
              background:"rgba(255,179,71,.15)", border:"1px solid rgba(255,179,71,.4)",
              borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700,
              color:"#FFB347", letterSpacing:".04em",
            }}>TESTNET</span>
          )}
          <div className="dot-live">{balLoading ? "Syncing…" : "Live"}</div>
        </div>
      </div>

      {/* Screens */}
      {tab === "home"     && (
        <HomeScreen
          balance={displayBal}
          address={address ?? ""}
          navigate={setTab}
          newFunds={nf}
          isTestnet={isTestnet ?? false}
          onAllocate={() => { setNF(false); setTab("send"); }}
        />
      )}
      {tab === "send"     && <SendScreen    balance={displayBal} senderName={senderName} onDone={() => setTab("home")} />}
      {tab === "history"  && <HistoryScreen />}
      {tab === "payday"   && <PaydayScreen  balance={displayBal} senderName={senderName} onDone={() => { setNF(false); setTab("home"); }} />}
      {tab === "settings" && <SettingsScreen />}

      {/* Tab bar */}
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? "on" : ""}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            <span className="tab-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
