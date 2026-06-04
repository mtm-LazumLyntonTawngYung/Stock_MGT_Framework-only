# Login Page တွင်လိုအပ်သည့် လုပ်ဆောင်ချက်များ

**File:** `src/app/login/page.tsx`
**Type:** Client Component (`'use client'`)
**Purpose:** အသုံးပြုသူ၏ အထောက်အထား အတည်ပြုမှုကို စစ်ဆေး၊ JWT token ဖန်တီးပြီး ဝင်ရောက်မှုမှတ်တမ်းကို ဆက်လက်လုပ်ဆောင်ပြီး အောင်မြင်မှုအကြောင်းကို `/stock` သို့ လှော်လျာပြောင်းပေးပြီး ပြီးပြီဆိုရင် အောင်မြင်ခြင်းအကြောင်းကို ကြည့်ရှုစWilayah နိုင်ရသည်။

---

## 1. State Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `email` | `string` | `''` | Email input နှင့် ချိန်ဆက်လုပ်ကိုင်ဆောင်ရွက်နိုင်ရမည်။ |
| `password` | `string` | `''` | Password input နှင့် ချိန်ဆက်လုပ်ကိုင်ဆောင်ရွက်နိုင်ရမည်။ |
| `showPassword` | `boolean` | `false` | Toggle ပေါ်မူတည်ပြီး password ကို ပြသခြင်း/ဝှက်ခြင်း ပြုလုပ်နိုင်ရန်။ |
| `isLoading` | `boolean` | `false` | Login လုပ်ဆောင်နေစဉ် `true` ဖြစ်ပြီး loading အချိန်တွင် input နှင့် submit button များကို disable ဖြစ်နေရမည်။ |
| `error` | `string` | `''` | အထောက်အထား မှားနေခြင်း၊ database ထဲမှာ အသုံးပြုသူမရှိခြင်း စတဲ့ အခြေအနေများတွင် form ပေါ်မှာ banner အဖြစ် အမှားကိစ္စ ပြသရန်။ |
| `fieldErrors` | `Record<string, string>` | `{}` | Zod validation မှတ်တမ်း မှားနေစဉ် input field တစ်ခုချင်းစီ အလိုက် inline error message ပြရန်။ |

---

## 2. Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `email` | ✓ | အသုံးပြုသူ၏ အီးမေလ် လိပ်စာ |
| `password` | `password` | ✓ | အသုံးပြုသူ၏ လျှို့ဝှက်အက္ခရာ |
| `showPassword` toggle | `button` | | Eye/EyeOff icon ဖြင့် password ကို ပြမရှိ/မပြဘဲ ပြောင်းလဲနိုင်သည်။ |

---

## 3. Validation Logic

1. `loginSchema.safeParse({ email, password })` ဖြင့် Zod validation လုပ်သည်။
2. Validation မအောင်မြင်ပါက `formatZodErrors()` ဖြင့် အမှားများကို ပြင် `fieldErrors` state သို့ သိမ်းပြီး inline message အနေနဲ့ ပြသသည်။
3. Validation အောင်မြင်ပါက API request ဆင်းသက်သည်။

---

## 4. API Interaction (`handleSubmit`)

| Step | Description |
|------|-------------|
| `POST /api/auth/login` | email နှင့် password ကို JSON body အနေနဲ့ ပို့သည်။ |
| Success (`response.ok`) | User အချက်အလက် ရရှိပြီးလျှင် `router.push('/stock')` ဖြင့် stock page သို့ သွားသည်။ |
| Error (401) | Server မှ `{ error: 'Invalid credentials' }` ပြန်လည်ပေးပြီး banner အဖြစ် ပြသသည်။ |
| Network Error | catch block တွင် `'Login failed. Please check your credentials.'` ဟု အမှားတစ်ခု ပြသသည်။ |

---

## 5. Authentication Flow Summary

1. User login form ကို ဖြည့်သည်။
2. Client-side Zod validation လုပ်၍ အချက်အလက် ပုံစံ အမှန် စစ်ဆေးသည်။
3. `POST /api/auth/login` API route သို့ လျှို့ဝှက်စွာ request လုပ်သည်။
4. Server-side မှ bcrypt ဖြင့် password နှင့် မှန်ကန်မှု စစ်ဆေးသည်။
5. မှန်ကန်ပါက JWT token ဖန်တီးပြီး HttpOnly cookie (`auth-token`) အဖြစ် သိမ်းသည်။
6. Client သည် အသစ်ရောက်ရှိသော token ကို မသိပါ၊ cookie သည် browser ထဲတိုက်ရိုက်သိမ်းဆည်းသည်။
7. Success ပြီးလျှဉ် `/stock` သို့ ရွှေ page ကို ပြောင်းလဲသည်။

---

## 6. Security Notes

- Password သည် plain text အဖြစ် server သို့ မပို့ပါ၊ HTTPS connection ဖြင့်သာ ပို့သင့်သည်။
- JWT token သည် `httpOnly` cookie ထဲတွင် သိမ်းဆည်းထားပြီး JavaScript မှ မရနိုင်ပါ။
- `sameSite: 'strict'` ဖြင့် CSRF ပစ်မှတ်များကို တားဆီးထားသည်။
- `secure: process.env.NODE_ENV === 'production'` ဖြင့် production မှာသာ HTTPS အပေါ် အချိန်ဖြစ်သည်။
- JWT expiration သည် 7 ရက် ဖြစ်သည်။

---

## 7. UI Elements

- **Loading State**: Submit button ထဲမှာ spinner animation ပြသသည်။ ခဏစောင်းပြီးနောက် `Logging in...` ဟု ပြသသည်။
- **Error Banner**: အထောက်အထား မှားနေခြင်း/Server error ကြောင့် အနီရောင် banner အဖြစ် ပြသသည်။
- **Password Toggle**: Input ကို Eye/EyeOff icon ဖြင့် toggle လုပ်နိုင်သည်။
- **Disabled State**: Loading အခါ input များနှင့် button များကို disable လုပ်သည်။