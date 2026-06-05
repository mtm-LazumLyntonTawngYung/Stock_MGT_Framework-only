# Compare Stock Page

Compare Stock Page သည် ပစ္စည်းအရေအတွက်ကို လအလိုက် နှိုင်းယှဉ်ကြည့်နိုင်တဲ့ feature ဖြစ်ပါတယ်။
user က start date & end date ရွေးပီး compare လိုက်ရင် အဲဒီကာလအတွင်းမှာ ပစ္စည်းတစ်ခုချင်းစီရဲ့ quantity, price ပြောင်းလဲမှုကို ယှဉ်တွဲကြည့်နိုင်ပါတယ်။

---

## အဓိကလုပ်ဆောင်ချက်များ (Key Features)

### 1. Date Range Selection

- **Start Date:** year and month ကို dropdown များဖြင့် ရွေးချယ်နိုင်သည်
- **End Date:** year and month ကို dropdown များဖြင့် ရွေးချယ်နိုင်သည်
- **Default:** ပထမဆုံးအကြိမ် page ဖွင့်တဲ့အခါ ယခင်လမှ လက်ရှိလထိ အလိုအလျောက်သတ်မှတ်ပေးထားသည်

### 2. Comparison Logic

| တန်ဖိုး | ရင်းမြစ် | ဖော်ပြပုံ |
|---|---|---|
| **Used Qty** (အသုံးပြုအရေအတွက်) | ၅ပတ် စုစုပေါင်း အသုံးပြုအရေအတွက် | `usedQty1stWeek` မှ `usedQty5thWeek` အထိ ပေါင်းခြင်း |
| **Purchase Qty** (ဝယ်ယူအရေအတွက်) | ၃ကြိမ် စုစုပေါင်း ဝယ်ယူအရေအတွက် | `purchaseQty1st`, `purchaseQty2nd`, `purchaseQty3rd` ပေါင်းခြင်း |
| **Purchase Price** (ဝယ်ယူစျေးနှုန်း) | ပစ္စည်းတစ်ခုချင်းစီရဲ့ ဈေးနှုန်း | `price` field |

---

## Error Handling

| အခြေအနေ | တုံ့ပြန်ချက် |
|---|---|
| ရက်စွဲအပိုင်းအခြား မမှန်ကန်ပါ | "Invalid date range" toast error |
| နှစ်များ ရယူမရပါ | toast error ဖော်ပြသည် |
| ဒေတာ မရှိပါ | "No data available" မက်ဆေ့ချ် ပြသည် |
| နှိုင်းယှဉ်မှု မရှိသေးပါ | "No Comparison Yet" empty state ပြသည် |

---
