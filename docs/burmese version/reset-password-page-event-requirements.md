# Reset Password Page တွင်လိုအပ်သည့် လုပ်ဆောင်ချက်များ

**Purpose:** လက်ရှိဝင်ရောက်နေသော အသုံးပြုသူ user လျှို့ဝှက်အက္ခရာ (current password) ကို အတည်ပြု၍ အသစ်လျှို့ဝှက်အက္ခရာ သတ်မှတ်ပေးနိုင်ရန်။

---

## 1. State Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `currentPassword` | `string` | `''` | လက်ရှိအသုံးပြုနေသော လျှို့ဝှက်အက္ခရာ input နှင့်ချိန်ဆက်လုပ်ကိုင်ဆောင်ရွက်နိုင်ရမည်။ |
| `newPassword` | `string` | `''` | အသစ်သတ်မှတ်မည့် လျှို့ဝှက်အက္ခရာ input နှင့်ချိန်ဆက်လုပ်ကိုင်ဆောင်ရွက်နိုင်ရမည်။ |
| `confirmPassword` | `string` | `''` | အသစ်သတ်မှတ်မည့် လျှို့ဝှက်အက္ခရာ အတည်ပြုရန် input နှင့်ချိန်ဆက်လုပ်ကိုင်ဆောင်ရွက်နိုင်ရမည်။ |
| `showCurrent` | `boolean` | `false` | Current Password input ကို ပြသခြင်း/ဝှက်ခြင်း toggle လုပ်နိုင်ရန်။ |
| `showNew` | `boolean` | `false` | New Password input ကို ပြသခြင်း/ဝှက်ခြင်း toggle လုပ်နိုင်ရန်။ |
| `showConfirm` | `boolean` | `false` | Confirm New Password input ကို ပြသခြင်း/ဝှက်ခြင်း toggle လုပ်နိုင်ရန်။ |
| `isLoading` | `boolean` | `false` | Password ချေး change လုပ်နေစဉ် `true` ဖြစ်ပြီး loading အချိန်တွင် input များနှင့် submit button ကို disable ဖြစ်နေရမည်။ |
| `fieldErrors` | `Record<string, string>` | `{}` | Zod validation မှတ်တမ်း မှားသွားစဉ် input field တစ်ခုချင်းစီ inline error message ပြရန်။ |

---

## 2. Form Fields (Modal)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `currentPassword` | `password` | ✓ | လက်ရှိ အသုံးပြုနေသော လျှို့ဝှက်အက္ခရာ |
| `newPassword` | `password` | ✓ | အသစ်သတ်မှတ်မည့် လျှို့ဝှက်အက္ခရာ |
| `confirmPassword` | `password` | ✓ | New Password ကို အတည်ပြုရန် ထပ်မံစာရင်း |
| `showCurrent` toggle | `button` | | Current Password ကို Eye/EyeOff icon ဖြင့် toggle |
| `showNew` toggle | `button` | | New Password ကို Eye/EyeOff icon ဖြင့် toggle |
| `showConfirm` toggle | `button` | | Confirm Password ကို Eye/EyeOff icon ဖြင့် toggle |

---

## 3. Validation Logic

1. `changePasswordSchema.safeParse({ currentPassword, newPassword, confirmPassword })` ဖြင့် Zod validation လုပ်သည်။
2. Validation မအောင်မြင်ပါက `formatZodErrors()` ဖြင့် အမှားများကို `fieldErrors` state သို့ သိမ်းပြီး inline message အနေနဲ့ ပြသသည်။
3. Validation အောင်မြင်ပါက API request ဆင်းသက်သည်။

---
## 4. Authentication Flow Summary

1. User သည် လက်ရှိ password၊ အသစ် password နှင့် confirm password ကို ဖြည့်သည်။
2. Client-side Zod validation လုပ်၍ အချက်အလက် ပုံစံ အမှန် စစ်ဆေးသည်။
3. `POST /api/auth/change-password` API route သို့ request လုပ်သည်။
4. Server-side မှ JWT token ဖြင့် အသုံးပြုသူ၏ အခြေအနေကို စစ်ဆေးသည်။
5. Current password ကို bcrypt ဖြင့် database ထဲမှာ မှန်ကန်မှု စစ်ဆေးသည်။
6. New password ကို bcrypt (salt rounds: 10) ဖြင့် hash လုပ်သည်။
7. Hash လုပ်ထားသော password ကို database ထဲသို့ အပ်ဒိတ်လုပ်သည်။
8. Client သည် success response ရရှိပြီးလျှင် form field များကို ရှင်းလင်းပေးသည်။

---

## 5. Security Notes

- Password သည် plain text အဖြစ် server သို့ မပို့ပါ၊ HTTPS connection ဖြင့်သာ ပို့သင့်သည်။
- Current password ကို အတည်ပြုရန် bcrypt comparison ပြုလုပ်သည်။
- New password ကို bcrypt hash (10 rounds) ဖြင့် လက်ခံထားသည်။
- JWT token သည် `httpOnly` cookie ထဲတွင် သိမ်းဆည်းထားပြီး JavaScript မှ မရနိုင်ပါ။
- Change password API သည် login session လိုအပ်ပြီး `getCurrentUserId()` ဖြင့် authenticated user ကိုသာ လက်ခံသည်။

---

## 6. UI Elements

- **Loading State**: Submit button ထဲမှာ `Loader2` spinner animation ပြသသည်။ ခဏစောင်းပြီးနောက် `Changing password...` ဟု ပြသသည်။
- **Password Visibility Toggle**: တစ်ခုစီ၏ input ကို Eye/EyeOff icon ဖြင့် toggle လုပ်နိုင်သည်။
- **Disabled State**: Loading အခါ input များနှင့် button ကို disable လုပ်သည်။
- **Success Toast**: Password အောင်မြင်စွ ပြောင်းလဲပြီးလျှင် `Password changed successfully` toast ပြသည်။
- **Error Toast**: API error ဖြစ်ပါက error message toast ပြသည်။

---

## 7. Business Rules

1. **Current Password Verification**: အသစ် password သတ်မှတ်မှုမတိုင်မီ လက်ရှိ password ကို အတည်ပြုရမည်။
2. **Password Confirmation**: New Password နှင့် Confirm Password နှစ်ခု မကိုက်ညီပါက error ပြန်လည်ပေးသည်။
3. **Form Reset**: Password အောင်မြင်စွ ပြောင်းလဲပြီးလျှင် form field အားလုံး ရှင်းလင်းပေးသည်။