# PayFlow

> **Payday allocator for OFWs and seafarers — built on MiniPay + Celo**

PayFlow is a MiniPay mini app that helps overseas Filipino workers and seafarers split and send USDT to multiple family members in one tap. After every send, it generates a Viber or WhatsApp message in Filipino so each recipient knows exactly how to withdraw their money locally — no crypto knowledge needed.

---

## Features

- **Smart Allocator** — Split USDT across up to 5 recipients by amount or percentage in one session
- **Live Exchange Rates** — Shows exact local currency equivalent per recipient (₱, Rp, RM, ฿, and 10 more)
- **Viber Message Generator** — Auto-generates a Filipino-language message per recipient with step-by-step withdrawal instructions for GCash, Maya, Bank, M-Pesa, GoPay, etc.
- **Family Guide** — Withdrawal steps per payout method shown inline in the app — no external links
- **Payday Mode** — Save your allocation as a template and execute in one tap every payday
- **History** — Total sent per recipient in local currency across all sessions
- **MiniPay Rewards Info** — Explains Boost, Daily Reward, and Opera Rewards accurately
- **14 regions supported** — PH, ID, MY, TH, VN, IN, SG, NG, GH, KE, US, GB, DE, AE

---

## How It Works

```
Salary arrives in MiniPay wallet
        ↓
Open PayFlow → see live USDT balance + live PHP rate
        ↓
Load "Pamilya Plan" template (set up once, reused every payday)
        ↓
Review: Mama ₱17,250 · Tatay ₱5,750 · Tuition ₱8,625
        ↓
Tap Confirm → USDT sent on-chain to each MiniPay wallet
        ↓
PayFlow generates a Viber message per recipient in Filipino:
"Nagpadala na ako ng $300 (≈₱17,250). Para makuha sa GCash:
 1. Buksan ang MiniPay  2. I-tap Withdraw  3. Piliin GCash…"
        ↓
Copy → paste to Viber → family withdraws ✅
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Blockchain | Celo Mainnet (42220) + Celo Sepolia (11142220) |
| Wallet | wagmi v2.12 + viem v2.17 |
| Connector | MiniPay injected provider |
| Custom RPC | viem WalletClient + typed rpcSchema |
| Deployment | Vercel |

---

## Project Structure

```
payflow/
├── public/
│   ├── favicon.svg
│   ├── terms.html              ← Terms of Service (MiniPay submission required)
│   └── privacy.html            ← Privacy Policy (MiniPay submission required)
├── src/
│   ├── hooks/
│   │   ├── useAutoConnect.ts   ← MiniPay required: auto-connect on load
│   │   ├── useUSDTBalance.ts   ← Live balance, all stablecoins, polls 15s
│   │   ├── useExchangeRate.ts  ← minipay_getExchangeRate via viem client
│   │   ├── useSendUSDT.ts      ← Chain-aware ERC20 transfers per recipient
│   │   └── useLocalStorage.ts  ← Templates + history persistence
│   ├── lib/
│   │   ├── wagmi.ts            ← Config, chains, all token addresses
│   │   ├── minipayClient.ts    ← viem WalletClient with MiniPay RPC schema
│   │   ├── socialconnect.ts    ← minipay_requestContact contact picker
│   │   ├── constants.ts        ← 14 regions, payout methods, fallback rates
│   │   └── utils.ts            ← Formatting + Filipino Viber message builder
│   ├── pages/
│   │   ├── HomeScreen.tsx      ← Balance, rewards, recent sends
│   │   ├── SendScreen.tsx      ← Allocator + contact picker + Viber gen
│   │   ├── HistoryScreen.tsx   ← Sends history, per-recipient totals
│   │   ├── PaydayScreen.tsx    ← One-tap Payday Mode with templates
│   │   └── SettingsScreen.tsx  ← Sender name + inline Terms/Privacy
│   ├── App.tsx                 ← isMiniPay guard + auto-connect + 5-tab nav
│   ├── main.tsx                ← WagmiProvider + QueryClientProvider
│   └── index.css               ← All styles, MiniPay UI compliant
├── index.html
├── package.json
├── vite.config.ts              ← ngrok allowedHosts for MiniPay testing
├── vercel.json                 ← CORS headers + SPA routing
└── tsconfig.json
```

---

## Token Addresses

### Celo Mainnet (chain 42220)

| Token | Address | Decimals |
|---|---|---|
| USDT | `0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e` | 6 |
| USDC | `0xcebA9300f2b948710d2653dD7B07f33A8B32118C` | 6 |
| USDm | `0x765DE816845861e75A25fCA122bb6898B8B1282a` | 18 |

### Celo Sepolia Testnet (chain 11142220)

| Token | Address | Decimals | Source |
|---|---|---|---|
| USDC | `0x01C5C0122039549AD1493B8220cABEdD739BC44E` | 6 | Circle faucet |
| USDm | `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1` | 18 | Celo faucet |
| USDT | `0xC4f86E9B4A588D501c1c3e25628dFd50Bc8D615e` | 18 | MiniPay docs |

---

## Local Development

### Prerequisites

- Node.js 20+ — [nodejs.org](https://nodejs.org)
- MiniPay on Android — [Play Store](https://play.google.com/store/apps/details?id=com.opera.minipay)
- ngrok — [ngrok.com](https://ngrok.com)

### Install and run

```bash
git clone https://github.com/yourusername/payflow.git
cd payflow
npm install
npm run dev
# → http://localhost:5173
```

### Test inside MiniPay

```bash
# Terminal 2 — while npm run dev is running in Terminal 1
ngrok http 5173
# Copy the https://xxxx.ngrok-free.app URL
```

Then in MiniPay:
1. Settings → About → tap version number **7 times** → Developer Mode enabled
2. Settings → Developer Settings → **Developer Mode ON** → **Use Testnet ON**
3. Tap **Open URL** → paste your ngrok URL → Go

Get testnet tokens:
- USDC → [faucet.circle.com](https://faucet.circle.com) (select Celo Sepolia)
- USDm/CELO → [faucet.celo.org/celo-sepolia](https://faucet.celo.org/celo-sepolia)

### Build

```bash
npm run build
# Output in /dist
```

---

## Deploy to Vercel

1. Push to GitHub
2. [vercel.com](https://vercel.com) → Add New Project → Import repo
3. Leave all settings default — Vercel detects Vite automatically
4. Deploy → live at `https://your-project.vercel.app`

Every push to `main` auto-deploys.

---

## Submit to MiniPay Discover

**Submission form:**
https://docs.google.com/forms/d/e/1FAIpQLSdLy4HNe7ZMYeh951CboDHdhAfapPh5rJDI3SYGAvob63goSw/viewform

| Field | Value |
|---|---|
| App name | PayFlow |
| Tagline | Payday allocator for OFWs and seafarers |
| Category | Finance |
| App URL | `https://your-project.vercel.app` |
| Support | Your Telegram / email |
| Terms | `https://your-project.vercel.app/terms.html` |
| Privacy | `https://your-project.vercel.app/privacy.html` |
| Icon | 512×512 PNG — make at [canva.com](https://canva.com) |

---

## MiniPay Compliance Checklist

| Requirement | Status |
|---|---|
| Auto-connect on load — no connect button | ✅ |
| `injected()` connector first | ✅ |
| Chains: Celo Mainnet + Celo Sepolia only | ✅ |
| Official Forno RPC endpoints | ✅ |
| No EIP-1559 (legacy transactions only) | ✅ |
| `window.ethereum.isMiniPay` guard | ✅ |
| viem WalletClient + rpcSchema for custom methods | ✅ |
| Error codes `-32604`, `-32000` handled | ✅ |
| Loading states on all async operations | ✅ |
| Touch targets 44px minimum | ✅ |
| Body text 16px minimum | ✅ |
| Single column, max 390px width | ✅ |
| Terms of Service accessible | ✅ |
| Privacy Policy accessible | ✅ |
| No private keys hardcoded | ✅ |

---

## MiniPay Custom Methods

All custom methods use viem `WalletClient` with typed `rpcSchema` per MiniPay docs.

| Method | Used for |
|---|---|
| `minipay_getExchangeRate` | Live USD → local currency rate |
| `minipay_requestContact` | Native contact picker → wallet address |

---

## Supported Regions

| Flag | Country | Payout Methods |
|---|---|---|
| 🇵🇭 | Philippines | GCash · Maya · Bank · Card |
| 🇮🇩 | Indonesia | GoPay · OVO · DANA · ShopeePay · Bank |
| 🇲🇾 | Malaysia | Touch 'n Go · GrabPay · Boost · FPX |
| 🇹🇭 | Thailand | TrueMoney · PromptPay · Bank |
| 🇻🇳 | Vietnam | MoMo · ZaloPay · Bank |
| 🇮🇳 | India | UPI · Bank (IMPS) |
| 🇸🇬 | Singapore | PayNow · Bank |
| 🇳🇬 | Nigeria | Bank · OPay · PalmPay |
| 🇬🇭 | Ghana | MTN MoMo · Vodafone Cash · AirtelTigo |
| 🇰🇪 | Kenya | M-Pesa · Airtel Money |
| 🇺🇸 | United States | ACH · Apple Pay |
| 🇬🇧 | United Kingdom | Faster Payments |
| 🇩🇪 | Germany / EU | SEPA |
| 🇦🇪 | UAE | Bank Transfer |

---

## What PayFlow Does NOT Do

- Does not hold, escrow, or custody any funds
- Does not charge any fees
- Does not require a backend or database
- Does not collect any personal data
- Does not work outside MiniPay (shows a clear message if opened in a browser)

---

## License

MIT

---

## Support

Telegram: [@payflowsupport](https://t.me/payflowsupport)

---

*Built for the 10 million OFWs and seafarers who send money home every payday.*
