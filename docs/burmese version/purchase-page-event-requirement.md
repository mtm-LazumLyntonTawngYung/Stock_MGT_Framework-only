# Purchase Page တွင်လိုအပ်သည့် လုပ်ဆောင်ချက်များ

**Purpose:** ၀ယ်ထားသော stock နှင့်ပတ်သက်၍ ဝယ်စားရင်းများကို ကြည့်ရှုနိုင်ရန်၊ လစဥ်စျေးစားရင်းနှုန်းများနှင့် နှိုင်းယှဥ်မှုပြုလုပ်နိုင်ရန်၊ လုံးခြုံစိတ်ကြိုက်၊ အမျိုးအစား၊ ပв든အမျိုးအစား နှင့် လစဥ်အလိုက် ရှာဖွေနိုင်ရန် လုပ်ဆောင်ပေးနိုင်ရမည်။

---

## 1. State Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `purchases` | `Purchase[]` | `[]` | API မှ ရရှိထားသော ဝယ်ယူမှတ်တမ်းများအားလုံး သိမ်းဆည်သည်။ |
| `categories` | `Category[]` | `[]` | ကဏ္ဍ အလိုက် စိတ်ကြိုက် အဆင့် စီမံမှု တည်ဆောက်ရန် အကုန်အစိတ်အကဏိ္ဓများကို သိမ်းဆည်သည်။ |
| `selectedCategory` | `string` | `''` | Sub-Category filter အတွက် ရွေးချယ်ထားသော category ID။ |
| `selectedParentCategory` | `string` | `''` | Parent-Category filter အတွက် ရွေးချယ်ထားသော category ID။ |
| `selectedCompareMonth` | `string` | `''` | နှိုင်းယှဥ်မှုများ ပြုလုပ်မည့် လစဉ် key ကို သိမ်းဆည်သည်။ |
| `resetFilter` | `string` | `''` | Filter လုပ်ဆောင်ထားသော query များကို reset လုပ်ပေးရမည်။ |

---

## 2. Filters & Comparison

### Categories Filter
1. **Parent Category** — အားလုံး Categories ကို ဖော်ပြ၍ ရွေးချယ်နိုင်သည်။
2. **Sub Category** — Parent Category ရွေးချယ်ပြီးခြင်း မပြီးမချင်း disable ဖြစ်သည်။ Sub-categories ကိုသာ ပြသသည်။

### Comparison Mode
- Current Month နှင့် Selected Month နှစ်ခုကို နှိုင်းယှဥ်မှုပြုလုပ်သည်।
- Category အလိုက် rows အနေနဲ့ ပြသသည်။
- Columns: Category | Month | Qty | Qty/Unit | Unit Price | Discount | Total Price များပါဝင်သည်။

---

## 3. Statistics Cards

| Metric | Description |
|---------|-------------|
| Total Purchases | အစုစပ်မှတ်တမ်း အရေတွက် |
| Total Value | ဝယ်ယူမှတ်တမ်း အားလုံး၏ စုစုပေါင်း စျေး (kyats) |
| Total Quantity | ဝယ်ယူရရှိထားသော ပစ္စည်း အရေတွက် |
| Average Price | တစ်ခုတည်းကို များ ပြန်လည်ရှိသော ပုံမှန် စျေး |

---