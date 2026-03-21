# Shine Thit — Personal Finance Management v3

React + Supabase + Vercel · Multi-user · Free

---

## v3 တွင် ပါဝင်တာ

**1. Unified Transactions** — Vehicle expenses တွေ `transactions` table ထဲသာ သိမ်း (`sub_type='vehicle'`)။ Double entry မဖြစ်တော့ဘူး။

**2. Debt Auto-Transaction** — Debt ဖန်တီးတဲ့အခါ transaction auto-create ဖြစ်တယ်။ Payment လုပ်တဲ့အခါလည်း transaction auto-create ဖြစ်တယ်။

**3. Budget % of Income** — Budget ကို Fixed Amount ဒါမှမဟုတ် Income ရဲ့ % နဲ့ သတ်မှတ်နိုင်တယ်။ ဥပမာ Food = 30%, Donation = 3%။

**4. App Name** — Shine Thit Personal Finance Management

---

## Quick Start

```bash
cp .env.example .env.local
# .env.local မှာ Supabase URL + anon key ထည့်
npm install
npm run dev
```

---

## Supabase Setup

### Fresh project (ပထမဆုံး)
```
SQL Editor → schema.sql paste → Run
```

### Existing v2 project (migrate လုပ်ချင်ရင်)
```
SQL Editor → migrate_v2_to_v3.sql paste → Run
```
Data တွေ ကျန်ခဲ့မယ်၊ vehicle expenses တွေ transactions ထဲ migrate ဖြစ်သွားမယ်။

---

## GitHub + Vercel Deploy

```bash
git init && git add . && git commit -m "shine thit v3"
git remote add origin https://github.com/you/shine-thit.git
git push -u origin main
```

Vercel: New Project → Import → env vars ထည့် → Deploy
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```
