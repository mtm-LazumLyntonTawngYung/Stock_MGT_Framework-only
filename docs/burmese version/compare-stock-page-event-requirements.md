```markdown
# Compare Stock Page တွင်လိုအပ်သည့် လုပ်ဆောင်ချက်များ

**Purpose:** နှစ်ခုနှင့် အချက်အလက် အများအပြားလစဉ်များ အားလုံးကို နှိုင်းယှဥ်ကြည့်ရှုရန်အတွက် အသုံးပြုသည်။ ပစ္စည်း အမျိုးအစား အလိုက် ဝယ်ယူမှတ်တမ်း၊ အသုံးစွဲမှတ်တမ်း နှင့် စျေး တွက်ချက်မှုများကို တန်းရား အဖြစ် ပြသသည်။

---

## 1. State Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `years` | `number[]` | `[]` | API မှ ရရှိထားသော နှစ်များ စာရင်း |
| `startYear` | `string` | `${defaultPrevYear}` | နှိုင်းယှဥ်မှု စတော့ အချိန်၏ နှစ် |
| `startMonth` | `string` | `${defaultPrevMonth}` | နှိုင်းယှဥ်မှု စတော့ အချိန်၏ လ အမှတ် |
| `endYear` | `string` | `${currentYear}` | နှိုင်းယှဥ်မှု အဆုံး အချိန်၏ နှစ် |
| `endMonth` | `string` | `${currentMonth}` | နှိုင်းယှဥ်မှု အဆုံး အချိန်၏ လ အမှတ် |
| `comparisonData` | `ComparisonData[]` | `[]` | နှိုင်းယှဥ်မှု ရလဒ် အချက်အလက် များ |
| `selectedMonths` | `MonthData[]` | `[]` | ရွေးချယ်ထားသော လစဉ် အချက်အလက် များ |
| `isLoading` | `boolean` | `false` | နှိုင်းယှဥ်မှု လုပ်ဆောင်နေစဉ် loading အချိန် |
| `expandedCategories` | `Set<string>` | `new Set()` | Tree view တွင် ဖွင့်ထားသော parent category အမည်များ |

---

## 2. Helper Functions

### `getMonthsInRange()`
- `startYear`, `startMonth`, `endYear`, `endMonth` များအပေါ် တွဲအပ်မှုများ အရ ရွေးချယ်ထားသော လစဉ် အများအပြားကို ရယူလည်ကြိုးစားသည်။
- Start date သည် End date ထက် ကြီးပါက အလျား လစဉ်စာရင်းကိို ပြန်လည်ပေးသည်။
- ပြန်လည်ပေးသော အချက်အလက်: `[{ year, monthId, monthName }, ...]`

### `calculateTotalPurchase(p: Product)`
- ပစ္စည်း တစ်ခု၏ ၃ကြိမ် ဝယ်ယူမှတ်တမ်း အရေတွက် စုစုပေါင်းကိို တွက်ချက်သည်။
- Formula: `purchaseQty1st + purchaseQty2nd + purchaseQty3rd`

### `calculateTotalUsed(p: Product)`
- ပစ္စည်း တစ်ခု၏ ၅ အပတ်အားလုံး၏ အသုံးစွဲ အရေတွက် စုစုပေါင်းကိို တွက်ချက်သည်။
- Formula: `usedQty1stWeek + usedQty2ndWeek + usedQty3rdWeek + usedQty4thWeek + usedQty5thWeek`

### `toggleCategory(categoryName)`
- `expandedCategories` Set ထဲမှာ category အမည် ရှိပါက ဖယ်ထုတ်သည်။
- မရှိပါက အသစ်ထည့်သည်။
- Category row ကိို click လုပ်ပြီး expand/collapse လုပ်သည်။

---

## 3. Key Functions / Events

### `useEffect` — Load Available Years Event
1. Component mount လုပတဲ့အခါ `getMonths()` API ကိို invocation လုပ်သည်။
2. API မှ ရရှိလာသော month များနှင့် year များကိို `Set` အသုံးပြု၍ unique year များကိို ရယူလည်ကြိုးစားသည်။
3. `years` state ကိို အသစ်ဆုံးမှစ၍ အဟောင်းဆုံး အရား စီစဉ်ထားသည်။

### `useEffect` — Auto-load Comparison Event
1. Component mount လုပတဲ့အခါ အလိုအလျောက် စတော့ အချိန် နှစ်ခု (previous month + current month) အတွက် နှိုင်းယှဥ်မှု ပြုလုပ်သည်။
2. `getMonthsInRange()` ကိို အသုံးပြု၍ ရွေးချယ်ထားသော လစဉ် နှစ်ခုကိို ရယူလည်ကြိုးစားသည်။
3. ရွေးချယ်ထားသော လစဉ် နှစ်ခု မရှိပါက အလိုအလျောက် နှိုင်းယှဥ်မှု မပြုလုပ်ပါ။

### `handleCompare()` — Compare Button Click Event
1. `startYear`, `startMonth`, `endYear`, `endMonth` များအပေါ်မူတည်၍ ရွေးချယ်ထားသော လစဉ် အများအပြားကိို ရယူလည်ကြိုးစားသည်။
2. Invalid date range ဖြစ်ပါက toast error `"Invalid date range. End date must be after or equal to start date."` ပြပြီး လုပ်ဆောင်ခြင်း ရပ်တန့်သည်။
3. ရွေးချယ်ထားသော လစဉ် အများအပြားအတွက် `getProducts(year, month)` API ကိို invocation လုပ်သည်။
4. `Promise.all` ဖြင့် အားလုံး product data များကိို ပျမ်းမျှ ရယူလည်ကြိုးစားသည်။
5. ရရှိလာသော data များကိို `mapProductFromAPI()` ဖြင့် ပြောင်းလဲ၍ `selectedMonths` state သို့ သိမ်းသည်။
6. Product များကိို `parentCategory` နှင့် `itemDescription` အပေါ် အခြေခံ၍ group လုပ်သည်။
7. ထို group အားလုံးကိို `comparisonData` state သို့ သိမ်းသည်။
8. အားလုံး category များကိို expanded အဖြစ် `expandedCategories` state ကိို သတ်မှတ်သည်။

---

## 4. Form Fields

| Field | Type | Description |
|-------|------|-------------|
| `startYear` | `select` | နှိုင်းယှဥ်မှု စတော့ အချိန်၏ နှစ် |
| `startMonth` | `select` | နှိုင်းယှဥ်မှု စတော့ အချိန်၏ လ အမှတ် (January - December) |
| `endYear` | `select` | နှိုင်းယှဥ်မှု အဆုံး အချိန်၏ နှစ် |
| `endMonth` | `select` | နှိုင်းယှဥ်မှု အဆုံး အချိန်၏ လ အမှတ် (January - December) |
| `Compare` button | `button` | ရွေးချယ်ထားသော လစဉ် အများအပြားကိို နှိုင်းယှဥ်ပြီး အချက်အလက် ပြသရန် |

---

## 5. Business Rules

1. **Minimum One Month Range:** နှိုင်းယှဥ်မှု ပြုလုပ်ရန် လစဉ် အများအပြား တစ်ခု ရွေးချယ်ရမည်။ Start date သည် End date ထက် ကြီးပါက error toast ပြသည်။
2. **Default Comparison:** Page load ချိန်တွင် အလိုအလျောက် နောက်ဆုံး လစဉ် နှစ်ခု (previous month + current month) အတွက် နှိုင်းယှဥ်မှု ပြုလုပ်သည်။
3. **Category Grouping:** နှိုင်းယှဥ်မှု ရလဒ်များကိို parent category အလိုက် group လုပ်ထားသည်။
4. **Expand/Collapse:** Parent category များကိို expand/collapse လုပ်နိုင်သည်။ Default အဖြစ် အားလုံး expanded ဖြစ်သည်။
5. **Zero-value Display:** အရေတွက် သို့မဟုတ် စျေး ၀ ဖြစ်ပါက "-" အဖြစ် ပြသသည်။
6. **Month Range Generation:** `getMonthsInRange()` သည် start month မှစ၍ end month သို့ မတိုင်မီ အားလုံး လစဉ်များကိို စာရင်းပြုလုပ်သည်။

---

