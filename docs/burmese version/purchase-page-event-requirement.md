# Purchase Page တွင်လိုအပ်သည့် လုပ်ဆောင်ချက်များ

**File:** `src/app/purchases/page.tsx`
**Type:** Client Component (`"use client"`)
**Purpose:** ၀ယ်ထားသော stock နှင့်ပတ်သက်၍ ဝယ်စားရင်းများကို ကြည့်ရှုနိုင်ရန်၊ လစဥ်စျေးစားရင်းနှုန်းများနှင့် နှိုင်းယှဥ်မှုပြုလုပ်နိုင်ရန်၊ လုံးခြုံစိတ်ကြိုက်၊ အမျိုးအစား၊ ပв든အမျိုးအစား နှင့် လစဥ်အလိုက် ရှာဖွေနိုင်ရန် လုပ်ဆောင်ပေးနိုင်ရမည်။

---

## 1. State Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `purchases` | `Purchase[]` | `[]` | API မှ ရရှိထားသော ဝယ်ယူမှတ်တမ်းများအားလုံး သိမ်းဆည်သည်။ |
| `categories` | `Category[]` | `[]` | ကဏ္ဍ အလိုက် စိတ်ကြိုက် အဆင့် စီမံမှု တည်ဆောက်ရန် အကုန်အစိတ်အကဏိ္ဓများကို သိမ်းဆည်သည်။ |
| `loading` | `boolean` | `true` | အချက်အလက် load လုပ်နေစဉ် loading spinner ပြသရန်။ |
| `error` | `string` | `''` | အချက်အလက် ယူယူမအောင်မြင်ခဲ့ပြီးဆိုရာ error message ကို banner အဖြစ် ပြသရန်။ |
| `selectedCategory` | `string` | `''` | Sub-Category filter အတွက် ရွေးချယ်ထားသော category ID။ |
| `selectedParentCategory` | `string` | `''` | Parent-Category filter အတွက် ရွေးချယ်ထားသော category ID။ |
| `selectedCompareMonth` | `string` | `''` | နှိုင်းယှဥ်မှုများ ပြုလုပ်မည့် လစဉ် key ကို သိမ်းဆည်သည်။ |
| `isModalOpen` | `boolean` | `false` | Add/Edit Purchase modal ကို ဖွင့်/ပိတ် လုပ်ဆောင်ချက်။ |
| `editingPurchase` | `Purchase \| null` | `null` | Modal ထဲမှာ ပြုပြင် လုပ်နေသော purchase record ကို သိမ်းဆည်သည်။ |
| `saving` | `boolean` | `false` | Form ကို သိမ်းဆည်နေစဉ် submit button ကို disable လုပ်ရန်။ |
| `fieldErrors` | `Record<string, string>` | `{}` | Zod validation မှတ်တမ်း မှားသွားစဉ် input field တစ်ခုချင်းစီ inline message ပြရန်။ |
| `formData` | `object` | `{ purchase_date: today, quantity: '', unit_price: '', purchase_price: '', discount_price: '', discount_amount: '', quantity_per_unit: '' }` | Purchase modal ထဲ၏ form fields အားလုံး၏ value များကို လက်ခံထားသည်။ |

---

## 2. Key Functions

### `loadData()`
- `getPurchases()` နှင့် `getCategories()` ကို အတူတကွ invocation လုပ်၍ အချက်အလက်များကို ယူလည်ကြိုးစားသည်။
- ရရှိလာသော data များကို state များသို့ သိမ်းပြီး `loading` ကို `false` လုပ်ပါသည်။

### `calculateUnitPrice(quantity, quantityPerUnit, totalPrice)`
- Unit price ကို တွက်ချက်ရန် အသုံးပြုသည်။
- Formula: `(quantity × quantityPerUnit > 0) ? totalPrice / (quantity × quantityPerUnit) : 0`

### `buildCategoryTree(flat)`
- Flat category list ကို parent-child relationship အရ tree structure အဖြစ် တည်ဆောက်သည်။
- Parent အောက်၏ Children များကို nested array အနေနဲ့ ပြန်လည်ဖန်တီးသည်။

### `flatPurchases` (useMemo)
- Current month ရှိသော purchases ကိုသာ ငြိမ်သည်။
- `selectedParentCategory` ရွေးချယ်ထားပါက parent category နှင့် သက်ဆိုင်သော sub-categories ကိုပါ စစ်ဆေးသည်။
- `selectedCategory` ရွေးချယ်ထားပါက sub-category ID ဖြင့် ပိုမို တိုက်စွစွ စစ်ဆေးသည်။
- Purchase date အရ ဆုံးချိန်နှင့် အသစ်ဆုံးအရား စီစဉ်ထားသည်။

### `comparisonData` (useMemo)
- `selectedCompareMonth` ရွေးချယ်ထားပါက လက်ရှိ လစဉ် နှင့် နှိုင်းယှဥ်မှုပြုလုပ်သည်။
- Category အလိုက် group လုပ်ကာ စုစုပေါင်း qty, unit price, discount, total price များကို တွက်ချက်သည်။

### `openModal(purchase?)` / `closeModal()`
- Modal ကို ဖွင့်/ပိတ် လုပ်သည်။
- `editingPurchase` ရှိပါက form data ကို ထပ်မံတည်းဖြတ်၍ အသုံးပြုသည်။

### `handleSubmit(e)`
- Zod schema (`purchaseFormSchema`) ဖြင့် validation လုပ်သည်။
- `editingPurchase` ရှိပါက `updatePurchase()` ကို သုံးသည်။
- မရှိပါက `createPurchase()` ကို သုံးသည်။
- Success ပြီးလျှင် modal ကို ပိတ်၍ data ကို ပြန်လည် လုပ်ဆောင်သည်။

---

## 3. Form Fields (Modal)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `purchase_date` | `date` | ✓ | ဝယ်ယူမှတ်တမ်း ရက်စွဲ |
| `quantity` | `number` | ✓ | ဝယ်ယူပြီး ရောက်ရှိသော အရေတွက် |
| `unit_price` | `number` | ✓ | တစ်ခုတည်း ရသမျှ စျေး |
| `purchase_price` | `number` | ✓ | ဝယ်ယူပြီး ပေးချေရမည့် စုစုပေါင်း စျေး |
| `discount_price` | `number` | | လ折扣 ပြန်လည် ပေးချေသည့် စျေး |
| `discount_amount` | `number` | | လ折扣 ပမာဏ |
| `quantity_per_unit` | `number` | ✓ | တစ်သုတ်တည်း ပါဝင်သည့် အရေတွက် |

---

## 4. Filters & Comparison

### Categories Filter
1. **Parent Category** — အားလုံး Categories ကို ဖော်ပြ၍ ရွေးချယ်နိုင်သည်။
2. **Sub Category** — Parent Category ရွေးချယ်ပြီးခြင်း မပြီးမချင်း disable ဖြစ်သည်။ Sub-categories ကိုသာ ပြသသည်။

### Month Filter
- Current month ကို အခြေခံ အချက်အလက် အနေနဲ့ သုံးသည်။
- `selectCompareMonth` မှ တစ်ခုသတ်မှတ်ထားသော အခြား လစဉ်ကို ရွေးချယ်နိုင်သည်။
- ရွေးချယ်ထားပါက table ကို comparison mode အဖြစ် ပြောင်းလဲသည်။

### Comparison Mode
- Current Month နှင့် Selected Month နှစ်ခုကို နှိုင်းယှဥ်မှုပြုလုပ်သည်।
- Category အလိုက် rows အနေနဲ့ ပြသသည်။
- Columns: Category | Month | Qty | Qty/Unit | Unit Price | Discount | Total Price များပါဝင်သည်။

---

## 5. Statistics Cards

| Metric | Description |
|---------|-------------|
| Total Purchases | အစုစပ်မှတ်တမ်း အရေတွက် |
| Total Value | ဝယ်ယူမှတ်တမ်း အားလုံး၏ စုစုပေါင်း စျေး (kyats) |
| Total Quantity | ဝယ်ယူရရှိထားသော ပစ္စည်း အရေတွက် |
| Average Price | တစ်ခုတည်းကို များ ပြန်လည်ရှိသော ပုံမှန် စျေး |

---

## 6. Notifications

- Save အောင်မြင် → toast success
- Save မအောင်မြင် → toast error `(err as Error).message || "Failed to save purchase"`
- Delete မအောင်မြင် → toast error