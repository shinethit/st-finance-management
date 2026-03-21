// src/pages/InfoPages.jsx — About Us, Privacy Policy, Terms of Service, User Guide
import { useState } from 'react';
import { useLang } from '../lib/LangContext';
import Logo from '../lib/Logo';

// ── Reusable section block ─────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontSize: 15, fontWeight: 700, color: 'var(--accent)',
        marginBottom: 10, paddingBottom: 8,
        borderBottom: '1px solid var(--border)',
      }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.9 }}>
        {children}
      </div>
    </div>
  );
}

function P({ children }) {
  return <p style={{ margin: '0 0 10px' }}>{children}</p>;
}

function Li({ children }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
      <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>✦</span>
      <span>{children}</span>
    </div>
  );
}

// ── About Us ──────────────────────────────────────────────────
export function AboutPage() {
  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <div>
          <div className="page-title">About Us</div>
          <div className="page-subtitle">Shine Thit အကြောင်း</div>
        </div>
      </div>

      {/* Hero */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 20, padding: '28px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <Logo size={80} />
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>
          Shine Thit
        </div>
        <div style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 4 }}>
          Personal Finance Management
        </div>
        <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 99,
          background: 'rgba(255,107,53,0.12)', color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>
          Version 3.0
        </div>
      </div>

      <Section title="ကျွန်ုပ်တို့ အကြောင်း">
        <P>
          Shine Thit သည် မြန်မာနိုင်ငံသားများအတွက် အထူးဒီဇိုင်းဆွဲထားသော ကိုယ်ရေးကိုယ်တာ
          ဘဏ္ဍာရေး စီမံခန့်ခွဲမှု application တစ်ခုဖြစ်သည်။
        </P>
        <P>
          ဝင်ငွေ၊ ထွက်ငွေ၊ အကြွေး၊ စုဆောင်းငွေ နှင့် ယာဉ်ကုန်ကျစရိတ်များကို
          တစ်နေရာတည်းတွင် ရိုးရှင်းစွာ မှတ်တမ်းတင်နိုင်သော ဖြေရှင်းချက်တစ်ခုဖြစ်ပေသည်။
        </P>
      </Section>

      <Section title="ဘာကြောင့် Shine Thit ကို ရွေးချယ်ရမလဲ">
        <Li>မြန်မာ၊ အင်္ဂလိပ်၊ တရုတ် နှင့် ထိုင်း ဘာသာ ၄ မျိုး ပံ့ပိုးမှု</Li>
        <Li>MMK၊ USD၊ THB နှင့် ငွေကြေးများ ထောက်ပံ့မှု</Li>
        <Li>Category / Sub-Category စနစ်ဖြင့် ကုန်ကျစရိတ်ခွဲခြားမှု</Li>
        <Li>Budget တိုက်ဆိုင်မှုနှင့် သတိပေးချက်</Li>
        <Li>ယာဉ်ကုန်ကျစရိတ် ခြေရာခံမှု</Li>
        <Li>Report နှင့် Analysis (ရက်/လ/နှစ်)</Li>
        <Li>ကိုယ်ပိုင် Custom Tracker (Custom Analytics)</Li>
        <Li>PWA — Phone Home Screen တွင် Install လုပ်နိုင်</Li>
        <Li>Data များကို Supabase Cloud တွင် လုံခြုံစွာ သိမ်းဆည်း</Li>
        <Li>လုံးဝ အခမဲ့ — ကြော်ငြာမရှိ</Li>
      </Section>

      <Section title="နည်းပညာ">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            ['Frontend', 'React + Vite'],
            ['Database', 'Supabase (PostgreSQL)'],
            ['Hosting', 'Vercel'],
            ['Auth', 'Supabase Auth'],
          ].map(([k, v]) => (
            <div key={k} style={{ background: 'var(--bg3)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, marginBottom: 4 }}>{k}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="ဆက်သွယ်ရန်">
        <P>ပြဿနာများ ဖြစ်ပေါ်ပါက သို့မဟုတ် အကြံပြုချင်ပါက GitHub Issues မှတဆင့် ဆက်သွယ်နိုင်ပါသည်။</P>
      </Section>
    </div>
  );
}

// ── Privacy Policy ────────────────────────────────────────────
export function PrivacyPage() {
  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Privacy Policy</div>
          <div className="page-subtitle">ကိုယ်ရေးကိုယ်တာ မူဝါဒ</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, padding: '14px 16px' }}>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
          နောက်ဆုံး ပြင်ဆင်သည့်နေ့: မတ်လ ၂၀၂၆
        </div>
      </div>

      <Section title="ကျွန်ုပ်တို့ ဘာ Data ကို ရယူသလဲ">
        <Li>Email လိပ်စာ (Account ဖန်တီးရန်နှင့် ဝင်ရောက်ရန်)</Li>
        <Li>သင်ထည့်သွင်းသော ငွေကြေးမှတ်တမ်းများ (Transactions, Budgets, Debts)</Li>
        <Li>ကိုယ်ပိုင် Profile အချက်အလက် (Display Name, Currency)</Li>
        <Li>ယာဉ်မှတ်တမ်း နှင့် ကုန်ကျစရိတ်များ</Li>
      </Section>

      <Section title="Data ကို ဘယ်လို သုံးသလဲ">
        <Li>App ၏ Features များ ပံ့ပိုးပေးရန်</Li>
        <Li>သင်၏ Account ကို စစ်မှန်ကြောင်း အတည်ပြုရန်</Li>
        <Li>App ၏ Security ကို ထိန်းသိမ်းရန်</Li>
        <P style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(52,211,153,0.08)',
          borderRadius: 10, border: '1px solid rgba(52,211,153,0.2)', color: 'var(--green)',
          fontSize: 13 }}>
          🔒 သင်၏ Data ကို တတိယပုဂ္ဂိုလ်များထံ မည်သည့်အကြောင်းကြောင့်မျှ မရောင်းချ၊ မမျှဝေပါ။
        </P>
      </Section>

      <Section title="Data လုံခြုံရေး">
        <Li>Data အားလုံးကို Supabase ၏ PostgreSQL Database တွင် သိမ်းဆည်းသည်</Li>
        <Li>Row Level Security (RLS) ကြောင့် သင်၏ Data ကို သင်ကိုယ်တိုင်သာ ကြည့်ရှုနိုင်သည်</Li>
        <Li>Connection များကို HTTPS/TLS ဖြင့် encrypt ထားသည်</Li>
        <Li>Password များကို bcrypt ဖြင့် hash လုပ်ထားသည်</Li>
      </Section>

      <Section title="Cookies နှင့် Local Storage">
        <Li>Language preference သိမ်းဆည်းရန် localStorage ကို သုံးသည်</Li>
        <Li>Authentication session ကို secure cookie ဖြင့် သိမ်းသည်</Li>
        <Li>Tracking cookie၊ Analytics cookie များ မသုံးပါ</Li>
      </Section>

      <Section title="သင်၏ Rights">
        <Li>သင်၏ Data ကို ကြည့်ရှုနိုင်၊ ပြင်ဆင်နိုင်၊ ဖျက်နိုင်သည်</Li>
        <Li>Account ဖျက်ရန် Settings → Account → Sign Out ပြီး Support ကို ဆက်သွယ်ပါ</Li>
        <Li>Data export ဆိုင်ရာ မေးမြန်းလိုပါက GitHub မှတဆင့် ဆက်သွယ်ပါ</Li>
      </Section>
    </div>
  );
}

// ── Terms of Service ──────────────────────────────────────────
export function TermsPage() {
  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Terms of Service</div>
          <div className="page-subtitle">ဝန်ဆောင်မှု သတ်မှတ်ချက်များ</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, padding: '14px 16px' }}>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
          Shine Thit ကို သုံးစွဲသောအခါ ဤ Terms များကို သဘောတူပြီး သိမ်းဆည်းသည်ဟု မှတ်ယူပါမည်။
        </div>
      </div>

      <Section title="Acceptable Use">
        <Li>App ကို ကိုယ်ရေးကိုယ်တာ ဘဏ္ဍာရေး မှတ်တမ်းတင်ရန်သာ သုံးပါ</Li>
        <Li>တစ်ဦးတည်း အသုံးပြုရန် ရည်ရွယ်ပြီး Account ကို မျှဝေမပါနဲ့</Li>
        <Li>System ကို ထိခိုက်နိုင်သော မည်သည့် Action မျှ မဆောင်ရွက်ပါနဲ့</Li>
      </Section>

      <Section title="Account တာဝန်ယူမှု">
        <Li>Account Security ကို သင်ကိုယ်တိုင် တာဝန်ယူပါ</Li>
        <Li>Password ကို ပြင်ပတွင် မမျှဝေပါနဲ့</Li>
        <Li>Account ကို မတော်တဆ ဝင်ရောက်ခံရပါက ချက်ချင်း Password ပြောင်းပြီး အကြောင်းကြားပါ</Li>
      </Section>

      <Section title="Data တာဝန်ယူမှု">
        <Li>သင်ထည့်သည့် Data တစ်ခုလုံး၏ တာဝန်ယူမှုသည် သင်ဆီတွင် ရှိသည်</Li>
        <Li>App တွင် ပြသသော Financial Calculations များသည် reference သာဖြစ်ပြီး Professional Financial Advice မဟုတ်ပါ</Li>
        <Li>Data backup ကို ကိုယ်တိုင် လုပ်ထားရန် တိုက်တွန်းသည်</Li>
      </Section>

      <Section title="ဝန်ဆောင်မှု ရပ်ဆိုင်းမှု">
        <Li>Terms ချိုးဖောက်ပါက Account ကို ရပ်ဆိုင်းနိုင်သည်</Li>
        <Li>Spam၊ Abuse သို့မဟုတ် Malicious activity စစ်ဆေးတွေ့ပါက ချက်ချင်း ပိတ်ပင်မည်</Li>
      </Section>

      <Section title="Terms ပြောင်းလဲမှု">
        <P>Terms of Service ကို ကြိုတင်အကြောင်းကြားမှုနှင့်အတူ ပြောင်းလဲနိုင်သည်။ ဆက်လက်သုံးစွဲပါက ပြောင်းလဲသည့် Terms ကို သဘောတူပြီးဟု မှတ်ယူမည်။</P>
      </Section>
    </div>
  );
}

// ── User Guide ────────────────────────────────────────────────
export function GuidePage() {
  const [open, setOpen] = useState(null);

  const sections = [
    {
      icon: '🚀', title: 'စတင်သုံးနည်း',
      content: [
        ['Account ဖြင့် ဝင်ရောက်ရန်', 'Email + Password ဖြင့် Sign Up လုပ်ပါ။ Email ကို Confirm လုပ်ပြီး Log In ဝင်ပါ။'],
        ['Wallet ထည့်ရန်', 'Settings → Wallets → + Add ကိုနှိပ်ပြီး Wallet name, icon, initial balance ထည့်ပါ။'],
        ['Language ပြောင်းရန်', 'Settings → Language မှာ EN / မြန်မာ / 中文 / ภาษาไทย ကို ရွေးနိုင်သည်။'],
      ]
    },
    {
      icon: '💸', title: 'Transaction မှတ်တမ်းတင်နည်း',
      content: [
        ['Transaction တစ်ခုထည့်ရန်', 'Bottom nav ရှိ [＋] ကိုနှိပ်ပါ သို့မဟုတ် Transactions → + Add ကိုနှိပ်ပါ။'],
        ['Bulk Entry (အမြောက်အမြားထည့်ရန်)', 'More → Bulk Entry မှာ ပစ္စည်းအများအပြားကို တစ်ကြိမ်တည်း ထည့်နိုင်သည်။ Unit Price × Qty = Total အလိုအလျောက် တွက်ပေးသည်။'],
        ['Category ရွေးနည်း', 'Transaction ထည့်တဲ့အခါ Category field ကိုနှိပ်ရင် Money Lover ပုံစံ picker ပေါ်မည်။ Sub-category ပါ ရွေးနိုင်သည်။'],
        ['Auto-suggest', 'Bulk Entry မှာ item name ရိုက်တဲ့အခါ ယခင်ဝင်ဖူးသော items တွေ suggest ပေးမည်။ ယခင်ဈေးနှင့် ယှဉ်ပြမည်။'],
      ]
    },
    {
      icon: '📂', title: 'Category စီမံနည်း',
      content: [
        ['Category ထည့်ရန်', 'More → Categories → + Add ကိုနှိပ်ပါ။ Expense သို့မဟုတ် Income type ရွေးပါ။'],
        ['Sub-Category ထည့်ရန်', 'Categories list မှာ Parent category ဘေးက [＋] ကိုနှိပ်ပါ။ Parent ကြိုရွေးပြီး modal ဖွင့်မည်။ Name, Icon, Color ထည့်ပြီး Save ပါ။'],
        ['Category picker မှာ', 'Transaction form တွင် Category tap လုပ်ရင် Parent → Sub ကို tree ပုံစံ ပြမည်။ Search bar မှ ရှာနိုင်သည်။'],
      ]
    },
    {
      icon: '📊', title: 'Budget သတ်မှတ်နည်း',
      content: [
        ['Fixed Budget', 'Budget → + Budget → Fixed Amount ရွေးပြီး ငွေပမာဏ ထည့်ပါ။'],
        ['% of Income Budget', 'Budget type မှ "% of Income" ရွေးပြီး ရာနှုန်း ထည့်ပါ (ဥပမာ — Food = 30%)။ ဝင်ငွေပေါ်မူတည်ပြီး အလိုအလျောက် တွက်ပေးမည်။'],
        ['Budget tracking', 'Dashboard ပေါ်မှာ Budget progress bar ကြည့်နိုင်သည်။ 90% ကျော်ရင် ⚠ notification ပေါ်မည်။'],
      ]
    },
    {
      icon: '🎯', title: 'Savings Goal',
      content: [
        ['Goal ဖန်တီးရန်', 'Savings → + Goal → Name, Target Amount, Deadline ထည့်ပါ။'],
        ['ငွေဖြည့်ရန်', 'Goal card ထဲ Add Money ကိုနှိပ်ပြီး ထည့်ပါ။'],
        ['Progress', 'Goal card တွင် progress bar နှင့် target ကျန်ပမာဏ ပြမည်။'],
      ]
    },
    {
      icon: '💳', title: 'Debt & Loan မှတ်တမ်း',
      content: [
        ['ချေးငွေ မှတ်တမ်းတင်ရန်', 'Debts → + Add → "I Borrowed" (ငွေချေးယူ) သို့မဟုတ် "I Lent" (ငွေချေးထား) ရွေးပါ။'],
        ['ပေးချေမှု မှတ်တမ်း', 'Debt card ထဲ Record Payment ကိုနှိပ်ပါ။ Remaining balance အလိုအလျောက် ပြောင်းမည်။'],
        ['Due date reminder', 'Due date ၇ ရက်အတွင်း ရောက်လာပါက 🔔 Notification ထဲ ပေါ်မည်။'],
      ]
    },
    {
      icon: '🚗', title: 'ယာဉ်ကုန်ကျစရိတ်',
      content: [
        ['ယာဉ်ထည့်ရန်', 'Vehicles → + Add → Brand, Model, Year, Plate ထည့်ပါ။'],
        ['ဆီဖြည့် မှတ်တမ်း', 'Vehicle detail → + Expense → Type "Fuel" ရွေးပြီး Liters, Price/Liter ထည့်ပါ။'],
        ['Reminder', 'Oil change, Insurance, Road tax ကဲ့သို့ maintenance reminder ထည့်နိုင်သည်။'],
      ]
    },
    {
      icon: '📈', title: 'Reports & Analysis',
      content: [
        ['Date filter', 'Reports → ရက် / လ / နှစ် tab ရွေးပြီး date ညှိပါ။'],
        ['Category analysis', 'Category တစ်ခုချင်းစီ၏ ပမာဏ နှင့် ကြိမ်ရေ ကြည့်နိုင်သည်။'],
        ['Top expenses', 'ပမာဏ Top 5 နှင့် ကြိမ်ရေ Top 5 သပ်သပ် ပြမည်။'],
        ['Month comparison', 'ယခင်လထက် ၃၀% ကျော် ပြောင်းလဲသော category များ highlight ပြမည်။'],
      ]
    },
    {
      icon: '📊', title: 'Custom Analytics (My Analytics)',
      content: [
        ['Tracker ဖန်တီးရန်', 'More → My Analytics → + Tracker ကိုနှိပ်ပါ။'],
        ['Keyword tracker', 'ဥပမာ — "မီတာ" keyword ထည့်ရင် note ထဲ "မီတာ" ပါသော transaction အားလုံး ပေါင်းပြမည်။'],
        ['Category tracker', 'Category တစ်ခု ရွေးရင် ထို category ၏ monthly trend ပြမည်။'],
        ['ယခင်လနှင့် ယှဉ်ကြည့်', 'Tracker card တွင် ဒီလ vs အရင်လ vs ပြောင်းလဲ % နှင့် 6 လ bar chart ပြမည်။'],
      ]
    },
    {
      icon: '📱', title: 'App Install (PWA)',
      content: [
        ['iOS (iPhone/iPad)', 'Safari မှ ဖွင့်ပြီး Share → Add to Home Screen ကိုနှိပ်ပါ။'],
        ['Android', 'Chrome မှ ဖွင့်ပြီး Menu → Add to Home Screen ကိုနှိပ်ပါ။'],
        ['Desktop', 'Chrome/Edge ၏ address bar ညာဘက်ရှိ Install icon ကိုနှိပ်ပါ။'],
      ]
    },
  ];

  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <div>
          <div className="page-title">User Guide</div>
          <div className="page-subtitle">Shine Thit သုံးစွဲနည်း</div>
        </div>
      </div>

      {sections.map((s, i) => (
        <div key={i} className="card" style={{ marginBottom: 10, padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', background: 'none', border: 'none',
              cursor: 'pointer', fontFamily: 'var(--font)', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 22 }}>{s.icon}</span>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
              {s.title}
            </span>
            <span style={{
              fontSize: 18, color: 'var(--text3)',
              transform: open === i ? 'rotate(180deg)' : 'none',
              transition: 'transform .2s',
            }}>⌄</span>
          </button>

          {/* Content */}
          {open === i && (
            <div style={{ borderTop: '1px solid var(--border)', padding: '6px 0 12px' }}>
              {s.content.map(([title, desc], j) => (
                <div key={j} style={{ padding: '10px 16px 10px 52px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: 'var(--accent)' }}>
                    {title}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
                    {desc}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Info Hub (links to all info pages) ───────────────────────
export default function InfoHub({ onNavigate }) {
  const { t } = useLang();

  const pages = [
    { id: 'guide',   icon: '📖', title: 'User Guide',       sub: 'Shine Thit သုံးစွဲနည်း' },
    { id: 'about',   icon: '✦',  title: 'About Us',         sub: 'Shine Thit အကြောင်း' },
    { id: 'privacy', icon: '🔒', title: 'Privacy Policy',   sub: 'Data လုံခြုံရေး မူဝါဒ' },
    { id: 'terms',   icon: '📋', title: 'Terms of Service', sub: 'ဝန်ဆောင်မှု သတ်မှတ်ချက်' },
  ];

  return (
    <div className="page" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Info</div>
          <div className="page-subtitle">အကူအညီ & စာရွက်စာတမ်းများ</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pages.map(p => (
          <button key={p.id} onClick={() => onNavigate(p.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 18px', borderRadius: 14,
              background: 'var(--bg2)', border: '1px solid var(--border)',
              cursor: 'pointer', fontFamily: 'var(--font)', textAlign: 'left',
              width: '100%', transition: 'all .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: 'rgba(255,107,53,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>{p.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{p.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{p.sub}</div>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>

      {/* App version footer */}
      <div style={{ textAlign: 'center', marginTop: 32, color: 'var(--text3)', fontSize: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <Logo size={36} />
        </div>
        <div>Shine Thit v3 · Supabase + React + Vercel</div>
        <div style={{ marginTop: 4, opacity: 0.6 }}>© 2026 · Made with ♥ for Myanmar</div>
      </div>
    </div>
  );
}
