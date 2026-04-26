// ─── REGIONS & PAYOUT METHODS ────────────────────────────────────
// Verified against actual MiniPay offramp options per country.
// Partners: Transak, Yellow Card, Cashramp, Partna, Fonbnk, Onramper

export type PayoutMethod = {
  id: string;
  name: string;
  steps: string[];
  note: string;
};

export type Region = {
  code: string;
  name: string;
  cur: string;
  flag: string;
  partners: string[];
  methods: PayoutMethod[];
};

export const REGIONS: Region[] = [
  {
    code: "PH", name: "Pilipinas", cur: "PHP", flag: "🇵🇭",
    partners: ["Transak", "Fonbnk", "Binance", "PDAX", "Gate.io"],
    methods: [

      // ─── GROUP 1: MiniPay built-in offramp via Transak ───────────────────
      // Official MiniPay partner. Simplest — no other app needed.
      // Works directly inside MiniPay → Withdraw button.
      {
        id: "gcash",
        name: "GCash",
        note: "Libre ang withdrawal via MiniPay x Transak partnership (simula Jan 2025). Kung hindi gumagana ang Transak, subukan ang Fonbnk sa MiniPay Apps tab bilang pinakamadaling backup.",
        steps: [
          "Buksan ang MiniPay app.",
          "I-tap ang 'Withdraw' o 'Cash Out'.",
          "Piliin ang 'GCash' bilang paraan.",
          "I-enter ang iyong GCash number (+639XXXXXXXXX).",
          "I-confirm. Hintayin ang SMS mula sa GCash.",
          "Karaniwang dumadating sa loob ng 1–5 minuto.",
        ],
      },
      {
        id: "maya",
        name: "Maya",
        note: "Libre ang withdrawal via MiniPay x Transak. Ang natanggap na PHP sa Maya ay pwedeng gamitin para sa bills, online shopping, at bank transfer.",
        steps: [
          "Buksan ang MiniPay app.",
          "I-tap ang 'Withdraw'.",
          "Piliin ang 'Maya'.",
          "I-enter ang iyong Maya number.",
          "I-confirm. Karaniwang 1–5 minuto lang.",
        ],
      },
      {
        id: "bank",
        name: "Bank Transfer",
        note: "Libre ang withdrawal via MiniPay x Transak. Para sa malalaking halaga. Mas mataas ang limit kaysa GCash o Maya. Sinusuportahan ang BDO, BPI, Metrobank, UnionBank, at iba pa.",
        steps: [
          "Buksan ang MiniPay app.",
          "I-tap ang 'Withdraw'.",
          "Piliin ang 'Bank Transfer'.",
          "Piliin ang iyong bangko (BDO, BPI, Metrobank, UnionBank, atbp.).",
          "I-enter ang iyong account number.",
          "I-confirm. Karaniwang ilang minuto hanggang 1 oras.",
        ],
      },

      // ─── GROUP 2: On-chain exchange offramps ─────────────────────────────
      // Send USDT from MiniPay wallet → exchange → convert to PHP → GCash/Bank.
      // All confirmed to support Celo network for USDT deposits.

      // ─── Fonbnk — VERIFIED working in Philippines ────────────────────────────
      // Confirmed from live screenshot: runs as "Pay Bills & Buy Goods" in MiniPay.
      // Accepts +63 phone numbers. Converts USDT → PHP bank transfer directly.
      // No separate app download needed. Best backup when Transak is down.
      {
        id: "fonbnk",
        name: "Fonbnk",
        note: "Available bilang 'Pay Bills & Buy Goods' mini app sa loob ng MiniPay. Pinakamadaling backup kapag hindi available ang Transak — hindi na kailangang mag-download ng ibang app. Direktang nagpapadala ng PHP sa bank account.",
        steps: [
          "Buksan ang MiniPay app.",
          "I-tap ang 'Apps' sa ibaba ng screen.",
          "Hanapin at i-tap ang 'Fonbnk' o 'Pay Bills & Buy Goods'.",
          "I-enter ang PHP amount na gusto mong matanggap (hal. 300).",
          "I-enter ang iyong Philippine phone number (+63XXXXXXXXX).",
          "I-enter ang Bank Account Holder Name — dapat eksaktong kapareho ng pangalan sa bank.",
          "Piliin ang Bank Name mula sa dropdown list.",
          "I-enter ang Bank Account Number.",
          "I-review ang USDT amount na ibabawas — makikita bago mag-confirm.",
          "I-tap ang 'Pay [amount] PHP' para i-confirm ang transaction.",
          "Matatanggap ang PHP sa iyong bank account — karaniwang ilang minuto.",
        ],
      },

      {
        id: "binance",
        name: "Binance P2P",
        note: "Kadalasang mas magandang rate kaysa MiniPay Withdraw. Binance Connect ay opisyal na naka-integrate sa MiniPay. Ang P2P ay hiwalay na hakbang. Kailangan ng Binance account. Binance ay hindi BSP-lisensyado sa Pilipinas — gamitin nang may pag-iingat.",
        steps: [
          "Buksan ang Binance app. Pumunta sa [Wallets] → [Deposit] → USDT.",
          "Piliin ang CELO bilang network. Kopyahin ang iyong Binance USDT deposit address.",
          "Sa MiniPay, i-tap ang Send. I-paste ang Binance address. Piliin ang Celo network. I-confirm.",
          "Hintayin ang USDT sa Binance — karaniwang 1–3 minuto sa Celo.",
          "Sa Binance app, pumunta sa [Trade] → [P2P] → [Sell] tab.",
          "Piliin ang USDT at PHP bilang currency. Maghanap ng buyer na may GCash o Maya.",
          "Piliin ang buyer na may 80%+ completion rate at maraming completed trades.",
          "I-tap ang [Sell]. Ang USDT ay ipo-place sa Binance escrow — ligtas ito.",
          "Hintayin ang GCash o Maya payment mula sa buyer.",
          "Kapag natanggap na ang PHP, i-tap ang [Confirm Receipt] sa Binance. Tapos!",
        ],
      },
      {
        id: "pdax",
        name: "PDAX",
        // Verified: PDAX supports USDTCELO ticker on Celo network.
        // Source: support.pdax.ph/support/solutions/articles/1060000097292
        // IMPORTANT: Search for "USDTCELO" specifically — plain "USDT" is ERC20 (Ethereum), not Celo.
        note: "BSP at SEC-lisensyado sa Pilipinas — opisyal at pinaka-ligtas. Sa PDAX deposit screen, hanapin ang 'USDTCELO' — hindi ang plain 'USDT' (ERC20 iyon). Kailangan ng PDAX account at KYC.",
        steps: [
          "I-download ang PDAX app. Mag-sign up at kumpletuhin ang KYC (valid ID + selfie).",
          "Sa PDAX, pumunta sa [Portfolio] → [Deposit Crypto].",
          "Sa search bar, i-type ang 'USDTCELO' — piliin ito (hindi ang plain USDT na ERC20).",
          "Kopyahin ang iyong PDAX deposit address para sa USDTCELO.",
          "Sa MiniPay, i-send ang USDT sa na-copy na address. Celo ang network — tama ito.",
          "Hintayin ang USDT sa PDAX — karaniwang 1–3 minuto lang sa Celo.",
          "Kapag na-credit, i-tap ang [Trade] → [Sell] → piliin ang USDTCELO/PHP pair.",
          "I-enter ang halaga at i-confirm ang sale.",
          "Pumunta sa [Portfolio] → [Cash Out].",
          "Piliin ang GCash, Maya, o bangko. I-enter ang account details at i-confirm.",
          "Matatanggap ang PHP sa loob ng ilang minuto hanggang 1 araw na trabaho.",
        ],
      },
      {
        id: "gateio",
        name: "Gate.io",
        // Verified: Gate.io officially supports USDT on Celo network.
        // Source: gate.com/announcements/article/36431
        // NOTE: Gate.io labels the Celo network as "CGLD" (legacy name for CeloGold).
        // CGLD = Celo — exact same blockchain, they just haven't updated their label.
        // Gate.io rebranded to Gate.com in 2025 — same platform, same account.
        note: "Malaking international exchange. Sumusuporta ng USDT sa Celo network. Sa Gate.io, ang Celo network ay nakalabel bilang 'CGLD' (CeloGold) — ito ang lumang pangalan ng Celo, iisa lang ang blockchain. Piliin ang CGLD para sa deposit. May withdrawal fee.",
        steps: [
          "Mag-log in sa Gate.io (o gate.com) app o website.",
          "Pumunta sa [Assets] → [Deposit] → i-search ang 'USDT'.",
          "Sa network list, hanapin at piliin ang 'CGLD' o 'CELO' — ito ang Celo blockchain.",
          "Kopyahin ang iyong Gate.io USDT deposit address para sa CGLD/Celo network.",
          "Sa MiniPay, i-send ang USDT sa na-copy na address gamit ang Celo network.",
          "Hintayin ang USDT sa Gate.io — karaniwang 1–3 minuto.",
          "Kapag na-credit, pumunta sa [Trade] → [Spot] → i-sell ang USDT para sa PHP o iba pang stablecoin.",
          "Pumunta sa [Withdraw] → [Fiat Withdrawal] → piliin ang PHP.",
          "Piliin ang preferred channel (GCash o bank). I-enter ang account details.",
          "I-confirm at kumpletuhin ang security verification (email + SMS + Google Auth).",
          "Matatanggap ang PHP sa loob ng ilang minuto hanggang 1 araw na trabaho.",
        ],
      },
    ],
  },
  {
    code: "ID", name: "Indonesia", cur: "IDR", flag: "🇮🇩",
    partners: ["Transak", "Onramper"],
    methods: [
      { id: "gopay",    name: "GoPay",    note: "Make sure your GoPay account is verified for higher limits.", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'GoPay'.", "Enter your GoPay number.", "Confirm. Usually 1–5 minutes."] },
      { id: "ovo",      name: "OVO",      note: "", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'OVO'.", "Enter your OVO number.", "Confirm."] },
      { id: "dana",     name: "DANA",     note: "", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'DANA'.", "Enter your DANA account.", "Confirm."] },
      { id: "shopeepay",name: "ShopeePay",note: "", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'ShopeePay'.", "Enter your account.", "Confirm."] },
      { id: "bank",     name: "Bank",     note: "Typically takes 1 business day.", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'Bank Transfer'.", "Choose your bank.", "Enter account number and confirm."] },
    ],
  },
  {
    code: "MY", name: "Malaysia", cur: "MYR", flag: "🇲🇾",
    partners: ["Transak", "Onramper"],
    methods: [
      { id: "tng",     name: "Touch 'n Go", note: "", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'Touch n Go eWallet'.", "Enter your TNG account.", "Confirm."] },
      { id: "grabpay", name: "GrabPay",     note: "", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'GrabPay'.", "Enter your account.", "Confirm."] },
      { id: "boost",   name: "Boost",       note: "", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'Boost'.", "Enter your account.", "Confirm."] },
      { id: "bank",    name: "FPX Bank",    note: "", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'Bank Transfer'.", "Choose your Malaysian bank.", "Enter details and confirm."] },
    ],
  },
  {
    code: "TH", name: "Thailand",    cur: "THB", flag: "🇹🇭", partners: ["Transak"],
    methods: [
      { id: "truemoney", name: "TrueMoney", note: "", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'TrueMoney'.", "Enter your account.", "Confirm."] },
      { id: "promptpay", name: "PromptPay", note: "", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'PromptPay'.", "Enter your PromptPay ID.", "Confirm."] },
      { id: "bank",      name: "Bank",      note: "", steps: ["Open MiniPay.", "Withdraw.", "Bank Transfer.", "Enter account.", "Confirm."] },
    ],
  },
  {
    code: "VN", name: "Vietnam",     cur: "VND", flag: "🇻🇳", partners: ["Transak"],
    methods: [
      { id: "momo",    name: "MoMo",    note: "", steps: ["Mở MiniPay.", "Nhấn 'Rút tiền'.", "Chọn 'MoMo'.", "Nhập số điện thoại MoMo.", "Xác nhận."] },
      { id: "zalopay", name: "ZaloPay", note: "", steps: ["Mở MiniPay.", "Rút tiền.", "Chọn ZaloPay.", "Nhập tài khoản.", "Xác nhận."] },
      { id: "bank",    name: "Bank",    note: "", steps: ["Mở MiniPay.", "Rút tiền.", "Chuyển khoản ngân hàng.", "Nhập thông tin.", "Xác nhận."] },
    ],
  },
  {
    code: "IN", name: "India",       cur: "INR", flag: "🇮🇳", partners: ["Transak", "Onramper"],
    methods: [
      { id: "upi",  name: "UPI",  note: "", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'UPI'.", "Enter UPI ID.", "Confirm."] },
      { id: "bank", name: "Bank", note: "", steps: ["Open MiniPay.", "Withdraw.", "Bank Transfer (IMPS).", "Enter IFSC and account.", "Confirm."] },
    ],
  },
  {
    code: "SG", name: "Singapore",    cur: "SGD", flag: "🇸🇬", partners: ["Transak"],
    methods: [
      { id: "paynow", name: "PayNow",        note: "", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'PayNow'.", "Enter PayNow ID.", "Confirm."] },
      { id: "bank",   name: "Bank Transfer", note: "", steps: ["Open MiniPay.", "Withdraw.", "Bank Transfer.", "Enter details.", "Confirm."] },
    ],
  },
  {
    code: "NG", name: "Nigeria",      cur: "NGN", flag: "🇳🇬", partners: ["Yellow Card", "Cashramp", "Partna"],
    methods: [
      { id: "bank",    name: "Bank Transfer", note: "", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'Bank Transfer'.", "Enter account number.", "Confirm."] },
      { id: "opay",    name: "OPay",          note: "", steps: ["Open MiniPay.", "Withdraw.", "Select OPay.", "Enter number.", "Confirm."] },
      { id: "palmpay", name: "PalmPay",       note: "", steps: ["Open MiniPay.", "Withdraw.", "Select PalmPay.", "Enter number.", "Confirm."] },
    ],
  },
  {
    code: "GH", name: "Ghana",        cur: "GHS", flag: "🇬🇭", partners: ["Yellow Card", "Cashramp", "Fonbnk"],
    methods: [
      { id: "mtn_momo",  name: "MTN MoMo",     note: "", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'MTN MoMo'.", "Enter your number.", "Confirm."] },
      { id: "vodacash",  name: "Vodafone Cash", note: "", steps: ["Open MiniPay.", "Withdraw.", "Vodafone Cash.", "Enter number.", "Confirm."] },
      { id: "airteltigo",name: "AirtelTigo",   note: "", steps: ["Open MiniPay.", "Withdraw.", "AirtelTigo.", "Enter number.", "Confirm."] },
    ],
  },
  {
    code: "KE", name: "Kenya",        cur: "KES", flag: "🇰🇪", partners: ["Yellow Card", "Cashramp"],
    methods: [
      { id: "mpesa",  name: "M-Pesa",      note: "", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'M-Pesa'.", "Enter your M-Pesa number.", "Confirm."] },
      { id: "airtel", name: "Airtel Money", note: "", steps: ["Open MiniPay.", "Withdraw.", "Airtel Money.", "Enter number.", "Confirm."] },
    ],
  },
  {
    code: "US", name: "United States", cur: "USD", flag: "🇺🇸", partners: ["Transak", "Onramper", "Binance"],
    methods: [
      { id: "ach",      name: "ACH Transfer", note: "Takes 1–3 business days.", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Select 'Bank Transfer'.", "Enter routing and account numbers.", "Confirm."] },
      { id: "applepay", name: "Apple Pay",    note: "", steps: ["Open MiniPay.", "Withdraw.", "Apple Pay.", "Confirm with Face ID.", "Done."] },
    ],
  },
  {
    code: "GB", name: "United Kingdom", cur: "GBP", flag: "🇬🇧", partners: ["Transak", "Onramper"],
    methods: [
      { id: "faster", name: "Faster Payments", note: "", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Bank Transfer.", "Sort code + account number.", "Confirm."] },
    ],
  },
  {
    code: "DE", name: "Germany / EU",  cur: "EUR", flag: "🇩🇪", partners: ["Transak", "Onramper"],
    methods: [
      { id: "sepa", name: "SEPA Transfer", note: "", steps: ["Open MiniPay.", "Tap 'Withdraw'.", "Bank Transfer (SEPA).", "Enter IBAN.", "Confirm."] },
    ],
  },
];

// ─── EXCHANGE RATES ───────────────────────────────────────────────
// In production these come from: minipay_getExchangeRate RPC
// window.ethereum.request({ method: "minipay_getExchangeRate", params: ["USDT", cur] })
export const FALLBACK_RATES: Record<string, number> = {
  PHP: 57.50, IDR: 16420, MYR: 4.71,  THB: 35.80,
  VND: 25300, INR: 83.90, SGD: 1.34,  NGN: 1620,
  GHS: 15.40, KES: 129.5, EUR: 0.92,  GBP: 0.79,
  USD: 1.00,  BRL: 5.05,  AED: 3.67,
};

export const CURRENCY_SYMBOL: Record<string, string> = {
  PHP: "₱", IDR: "Rp", MYR: "RM",  THB: "฿", VND: "₫",
  INR: "₹", SGD: "S$", NGN: "₦",  GHS: "₵", KES: "KSh",
  EUR: "€", GBP: "£",  USD: "$",   BRL: "R$", AED: "د.إ",
};

export const SEND_LABELS = [
  "Pamilya", "Bahay", "Tuition", "Gamot",
  "Ipon",    "Kuryente", "Tubig", "Pagkain",
];

export const MAX_RECIPIENTS = 5;
