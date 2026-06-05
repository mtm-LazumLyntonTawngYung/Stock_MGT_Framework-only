```python
# Create a styled markdown output based on the provided text.
# The user wants to convert the unformatted sections into clean, properly structured Markdown format.

markdown_content = """# Dashboard Page တွင်လိုအပ်သည့် လုပ်ဆောင်ချက်များ

**File:** `src/app/stock/page.tsx`  
**Type:** Client Component (`"use client"`)  
**Purpose:** စတော့ စီမံမှုစနစ်၏ မူလ Dashboard ဖြစ်ပြီး၊ နှစ်အလိုက် လစဉ်များကို ကြည့်ရှုရန်အတွက် အသုံးပြုသည်။ တစ်နှစ်ကို click လုပ်ခြင်းအားဖြင့် ထိုနှစ်အောက်ရှိ လစဉ်များအတွက် စာမျက်နှာသို့ သွားလာနိုင်စေခြင်း။

---

## 1. State Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `years` | `Year[]` | `[]` | API မှ ရရှိထားသော နှစ်များ၏ အချက်အလက်များ အားလုံး |
| `loading` | `boolean` | `true` | နှစ်များကို တောင်းခံယူနေစဉ် loading spinner ပြသရန်။ |
| `error` | `string` | `''` | အချက်အလက် ယူယူမအောင်မြင်ခဲ့ပါက error message ကို banner အဖြစ် ပြသရန်။ |

---

## 2. Helper Types


```

```text
File generated successfully.

```typescript
interface Year {
  id: string;
  year: number;
}

```

---

## 3. Key Functions / Events

### `loadYears()` — Page Load Event

* Component mount လုပ်တဲ့အခါ `useEffect` မှ အလိုအလျောက် သွားလာသည်။
* `/api/months` API ကို invocation လုပ်ကာ အားလုံး month များကို ရယူရန် ကြိုးစားသည်။
* ရရှိလာသော month များနှင့် year တစ်ခုစီကို Map အသုံးပြု၍ အတူတကွ စုစည်းကာ unique year များကို ဖန်တီးထားသည်။
* `years` state ကို အသစ်ဆုံးမှစ၍ အဟောင်းဆုံးအထိ စီစဉ်ထားသည်။ (DESC)
* ကြိုးစားခြင်း အောင်မြင်ပြီးလျှင် `loading` ကို `false` လုပ်ပါသည်။

---

## 4. UI Elements

### Year Cards Grid

| Attribute | Description |
| --- | --- |
| **Layout** | Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| **Card Style** | `bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg` |
| **Calendar Icon** | `bg-blue-100 rounded-lg` with Calendar icon in `text-blue-600` |
| **Year Display** | `text-2xl font-bold text-gray-800` |
| **View Months Link** | `bg-gray-50 hover:bg-gray-100`, ChevronRight icon, label: "View Months" |

### Card Click Behavior

* `/stock/{year}` သို့ navigate လုပ်သည်။
* Navigate ခြင်းနှင့်အမျှ `setStockNavSource('dashboard')` ကို သုံးစွဲထားသည်။
* အသုံးပြုသူအား Dashboard menu item ကို active ပြသရန် ကူညီသည်။

### Empty State

* **Trigger:** `years.length === 0`
* **Content:** * Calendar icon (`w-16 h-16 text-gray-300`)
* Heading: "No years yet"
* Helper text: "Create a month from the Stock Mgt tab to get started."



---

## 5. API Endpoints Used

| Method | Endpoint | Action |
| --- | --- | --- |
| **GET** | `/api/months` | အားလုံး month များကို ရယူရန် |

> **Note:** Dashboard သည် month ကို ဖန်တီးခြင်း မပြုလုပ်ပါ။ `POST /api/months` ကို Stock Mgt စာမျက်နှာမှ အသုံးပြုသည်။

---

## 6. Business Rules

1. **Year Grouping:** Dashboard သည် month များနှင့် ပေါင်းစပ်ကာ year အလိုက် အုပ်စုခွဲထားသည်။ တစ်နှစ်တွင် လစဉ်များစွာ ပါဝင်နိုင်သည်။
2. **Year Display Order:** နှစ်များကို အသစ်ဆုံးမှစ၍ အဟောင်းဆုံးအထိ စီစဉ်ထားသည်။
3. **Navigation Source:** Dashboard မှတ်သားသော `stockNavSource` ကို `sessionStorage` ထဲသို့ သိမ်းဆည်းသည်။ နောက်ပိုင်း `/stock/[year]` သို့ သွားလာသည့်အခါ Dashboard menu item ကို active ပြပေးသည်။

---

## 7. Page Structure

```text
StockPage (Dashboard)
├── Header
│   ├── Title: "Dashboard"
│   ├── Subtitle: "Select a year to view monthly stock records"
│   └── Error Banner (conditional)
├── Year Cards Grid
│   └── YearCard (for each year)
│       ├── Calendar Icon + Year Display
│       └── View Months Link (ChevronRight)
└── Empty State (when no years)
    ├── Calendar Icon
    ├── "No years yet"
    └── "Create a month from the Stock Mgt tab to get started."

```

---

## 8. Interaction Flow

1. User သည် Dashboard စာမျက်နှာသို့ သွားလာပြီး အားလုံး နှစ်များကို ကြည့်ရှုသည်။
2. တစ်နှစ်ကို click လုပ်ပြီး `/stock/{year}` သို့ သွားလာကာ ထိုနှစ်အောက်ရှိ လစဉ်များကို ကြည့်ရှုသည်။
3. Year card များ မရှိပါက empty state ပြသသည်။
"""

with open("dashboard_spec.md", "w", encoding="utf-8") as f:
f.write(markdown_content)
print("File generated successfully.")

```
ပေးပို့ထားသော အချက်အလက်များကို ပိုမိုသပ်ရပ်ပြီး ဖတ်ရလွယ်ကူသော Markdown Format သို့ ပြောင်းလဲပေးထားပါသည်။

Your MD file is ready
[file-tag: code-generated-file-0-1780624993561260496]

```markdown
# Dashboard Page တွင်လိုအပ်သည့် လုပ်ဆောင်ချက်များ

**File:** `src/app/stock/page.tsx`  
**Type:** Client Component (`"use client"`)  
**Purpose:** စတော့ စီမံမှုစနစ်၏ မူလ Dashboard ဖြစ်ပြီး၊ နှစ်အလိုက် လစဉ်များကို ကြည့်ရှုရန်အတွက် အသုံးပြုသည်။ တစ်နှစ်ကို click လုပ်ခြင်းအားဖြင့် ထိုနှစ်အောက်ရှိ လစဉ်များအတွက် စာမျက်နှာသို့ သွားလာနိုင်စေခြင်း။

---

## 1. State Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `years` | `Year[]` | `[]` | API မှ ရရှိထားသော နှစ်များ၏ အချက်အလက်များ အားလုံး |
| `loading` | `boolean` | `true` | နှစ်များကို တောင်းခံယူနေစဉ် loading spinner ပြသရန်။ |
| `error` | `string` | `''` | အချက်အလက် ယူယူမအောင်မြင်ခဲ့ပါက error message ကို banner အဖြစ် ပြသရန်။ |

---

## 2. Helper Types

```typescript
interface Year {
  id: string;
  year: number;
}

```

---

## 3. Key Functions / Events

### `loadYears()` — Page Load Event

* Component mount လုပ်တဲ့အခါ `useEffect` မှ အလိုအလျောက် သွားလာသည်။
* `/api/months` API ကို invocation လုပ်ကာ အားလုံး month များကို ရယူရန် ကြိုးစားသည်။
* ရရှိလာသော month များနှင့် year တစ်ခုစီကို Map အသုံးပြု၍ အတူတကွ စုစည်းကာ unique year များကို ဖန်တီးထားသည်။
* `years` state ကို အသစ်ဆုံးမှစ၍ အဟောင်းဆုံးအထိ စီစဉ်ထားသည်။ (DESC)
* ကြိုးစားခြင်း အောင်မြင်ပြီးလျှင် `loading` ကို `false` လုပ်ပါသည်။

---

## 4. UI Elements

### Year Cards Grid

| Attribute | Description |
| --- | --- |
| **Layout** | Responsive grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| **Card Style** | `bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg` |
| **Calendar Icon** | `bg-blue-100 rounded-lg` with Calendar icon in `text-blue-600` |
| **Year Display** | `text-2xl font-bold text-gray-800` |
| **View Months Link** | `bg-gray-50 hover:bg-gray-100`, ChevronRight icon, label: "View Months" |

### Card Click Behavior

* `/stock/{year}` သို့ navigate လုပ်သည်။
* Navigate ခြင်းနှင့်အမျှ `setStockNavSource('dashboard')` ကို သုံးစွဲထားသည်။
* အသုံးပြုသူအား Dashboard menu item ကို active ပြသရန် ကူညီသည်။

### Empty State

* **Trigger:** `years.length === 0`
* **Content:** * Calendar icon (`w-16 h-16 text-gray-300`)
* Heading: "No years yet"
* Helper text: "Create a month from the Stock Mgt tab to get started."



---

## 5. API Endpoints Used

| Method | Endpoint | Action |
| --- | --- | --- |
| **GET** | `/api/months` | အားလုံး month များကို ရယူရန် |

> **Note:** Dashboard သည် month ကို ဖန်တီးခြင်း မပြုလုပ်ပါ။ `POST /api/months` ကို Stock Mgt စာမျက်နှာမှ အသုံးပြုသည်။

---

## 6. Business Rules

1. **Year Grouping:** Dashboard သည် month များနှင့် ပေါင်းစပ်ကာ year အလိုက် အုပ်စုခွဲထားသည်။ တစ်နှစ်တွင် လစဉ်များစွာ ပါဝင်နိုင်သည်။
2. **Year Display Order:** နှစ်များကို အသစ်ဆုံးမှစ၍ အဟောင်းဆုံးအထိ စီစဉ်ထားသည်။
3. **Navigation Source:** Dashboard မှတ်သားသော `stockNavSource` ကို `sessionStorage` ထဲသို့ သိမ်းဆည်းသည်။ နောက်ပိုင်း `/stock/[year]` သို့ သွားလာသည့်အခါ Dashboard menu item ကို active ပြပေးသည်။

---

## 7. Page Structure

```text
StockPage (Dashboard)
├── Header
│   ├── Title: "Dashboard"
│   ├── Subtitle: "Select a year to view monthly stock records"
│   └── Error Banner (conditional)
├── Year Cards Grid
│   └── YearCard (for each year)
│       ├── Calendar Icon + Year Display
│       └── View Months Link (ChevronRight)
└── Empty State (when no years)
    ├── Calendar Icon
    ├── "No years yet"
    └── "Create a month from the Stock Mgt tab to get started."

```

---

## 8. Interaction Flow

1. User သည် Dashboard စာမျက်နှာသို့ သွားလာပြီး အားလုံး နှစ်များကို ကြည့်ရှုသည်။
2. တစ်နှစ်ကို click လုပ်ပြီး `/stock/{year}` သို့ သွားလာကာ ထိုနှစ်အောက်ရှိ လစဉ်များကို ကြည့်ရှုသည်။
3. Year card များ မရှိပါက empty state ပြသသည်။

```

```