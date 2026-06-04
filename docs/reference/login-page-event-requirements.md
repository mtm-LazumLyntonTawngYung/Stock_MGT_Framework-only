# Login Page တွင်လိုအပ်သည့် လုပ်ဆောင်ချက်များ

**File:** `src/app/login/page.tsx`
**Type:** Client Component (`'use client'`)
**Purpose:** user ကို authenticate လုပ်ဆောင်ပြီး၊ JWT token ပြုလုပ်ပြီး login session သတ်မှတ်ပေးနိုင်ရမယ်။

---

## 1. State Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `email` | `string` | `''` | Email input နှင့်ချိန်ဆက်လုပ်ကိုင်ဆောင်ရွက်နိုင်ရမည်။ |
| `password` | `string` | `''` | Password input နှင့်ချိန်ဆက်လုပ်ကိုင်ဆောင်ရွက်နိုင်ရမည်။ |
| `showPassword` | `boolean` | `false` | Toggle ပေါ်မူတည်ပြီး password visible/hide ပြုလုပ်နိုင်ရန် |
| `isLoading` | `boolean` | `false` | Loading ပြုလုပ်နေတဲ့အခါ true ဖြစ်ပြီး loading ပြုလုပ်နေတဲ့အခါ input နှင့် submit button များကို disable ဖြစ်နေရမည်။ |
| `error` | `string` | `''` | user credential မှားတဲ့အခါ database ထဲမှာ မရှိနေတဲ့အခါမှာ form ပေါ်မှာ banner အဖြစ် message ပြရန် |
| `fieldErrors` | `Record<string, string>` | `{}` | input field များတွင် မှားသော အခါ inline message ပြရန် |

---