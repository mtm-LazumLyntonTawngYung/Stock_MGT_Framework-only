# Purchase Page တွင်လိုအပ်သည့် လုပ်ဆောင်ချက်များ

**File:** `src/app/purchases/page.tsx`
**Type:** Client Component (`"use client"`)

---

## 1. State Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `purchases` | `Purchase[]` | `[]` | API မှ ရရှိထားသော ဝယ်ယူမှတ်တမ်း အားလုံး သိမ်းဆည်သည်။ |
| `categories` | `Category[]` | `[]` | Parent/Sub Category တစ် Classification တည်ဆောက်ရန် အကဏိ္ဓများစာရင်ကို သိမ်းဆည်သည်။ |
| `loading` | `boolean` | `true` | အချက်အလက် load လုပ်နေစဉ် Loading spinner ပြသရန် အတည်ပြုသည်။ |
| `error` | `string` | `''` | Data fetch မအောင်မြင်ခဲ့ပြီးဆိုရာ Error message ကို form ပေါ်တွင် banner အဖြစ် ပြသရန်။ |
| `selectedCategory` | `string` | `''` | Sub-Category filtering အတွက် ရွေးချယ်ထားသော category ID။ |
| `selectedParentCategory` | `string` | `''` | Parent Category filtering အတွက် ရွေးချယ်ထားသော category ID။ |
| `selectedCompareMonth` | `string` | `''` | နှိုင်းယှဥ်မှုများ ပြုလုပ်မည့် လစဉ် key ကို သိမ်းဆည်သည်။ |
| `isModalOpen` | `boolean` | `false` | Add/Edit Purchase modal ကို ဖွင့်/ပိတ် လုပ်ဆောင်ချက်။ |
| `editingPurchase` | `Purchase \| null` | `null` | Modal ထဲမှာ ပြုပြင် လုပ်နေသော purchase record ကို သိမ်းဆည်သည်။ |
| `saving` | `boolean` | `false` | Form ကို သိမ်းဆည်နေစဉ် submit button ကို disable လုပ်ရန်။ |
| `fieldErrors` | `Record<string, string>` | `{}` | Zod validation မှတ်တမ်း မှားသွားစဉ် input field တစ်ခုချင်းစီ inline message ပြရန်။ |
| `formData` | `object` | `{ purchase_date: today, quantity: '', unit_price: '', purchase_price: '', discount_price: '', discount_amount: '', quantity_per_unit: '' }` | Purchase modal ထဲ၏ form fields အားလုံး၏ value များကို လက်ခံထားသည်။ |

---