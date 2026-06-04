# Sidebar Event Requirements: Category Management Page

**Purpose:** Stock Management System တွင် id ဝင်ထားသော အသုံးပြုသူများအတွက် အဓိက လမ်းညွှန်ချက်များကို ပြသပေးခြင်း၊ လက်ရှိ ဝင်ရောက်နေသော စာမျက်နှာကို ညွှန်ပြခြင်းနှင့် အသုံးပြုသူ၏ လည်ပတ်မှုကို စီမံခန့်ခွဲမှုလုပ်ပေးခြင်းဖြစ်သည်။

---

## 1. Component Overview

Sidebar သည် `AuthenticatedLayout` အတွင် ပါဝင်ပြီး အောက်ပါ အလုပ်များကို ပြုလုပ်သည် -
- id ဝင်ထားသူများအတွက် လိုအပ်သော အဓိက စာမျက်နှာများအားလုံးကို ပြသခြင်း
- လက်ရှိ login page ပြီးလျှင် စာမျက်နှာကို ပြသခြင်း
- အကျယ်အဝန်းကို လျှော့ခြင်း/ချဲ့ကြည့်ခြင်း
- လက်ရှိ ဝင်ရောက်နေသော အသုံးပြုသူ၏ အမည်နှင့် အီးမေလ်ကို ပြသခြင်း
- Change Password နှင့် Logout လုပ်ဆောင်ချက်များကို ပြသခြင်း

---

## 2. State Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `collapsed` | `boolean` | `false` | Sidebar ၏ အကျယ်အဝန်းကို ထိန်းချုပ်သည်။ `true` ဖြစ်ပါက icon များကိုသာ ပြသခြင်း (w-20)။ |
| `user` | `{ name: string; email: string } \| null` | `null` | API မှ ရရှိထားသော အသုံးပြုသူ၏ အချက်အလက်များ။ |
| `loading` | `boolean` | `true` | အသုံးပြုသူ၏ အချက်အလက်များကို ယူယူနေစဉ် avatar ပေါ်တွင် spinner animation ပြသရန်။ |
| `stockNavSource` | `StockNavSource` | `'dashboard'` | လက်ရှိ stock စာမျက်နှာကို Dashboard မှတဝင်ခဲ့၍ သို့မဟုတ် Stock Mgt မှတဝင်ခဲ့ပြီးကို ခြိန်းဆန်းစွာ မှတ်သားထားသည်။ актив menu item ကို မှန်ကန်စွာ ညွှန်ပြရန် အသုံးပြုသည်။ |

---

## 3. Constants — Navigation Menu (`navigation`)

Sidebar menu သည် static `NavItem` array အဖြစ် သတ်မှတ်ထားသည်။

| အမည် | Href | Icon | Active Condition |
|------|------|------|-----------------|
| `Dashboard` | `/stock` | `LayoutDashboard` | Exact `/stock` OR `/stock/\d+` OR `/stock/\d+/\d+` when `stockNavSource === 'dashboard'` |
| `Stock Mgt` | `/stock/current` | `Package` | Exact `/stock/current` OR `/stock/\d+/\d+` when `stockNavSource === 'stock-mgt'` |
| `Category Mgt` | `/categories` | `Tag` | Pathname `/categories` နှင့် စပြုနေသည် |
| `Purchases` | `/purchases` | `ShoppingBag` | Pathname `/purchases` နှင့် စပြုနေသည် |
| `Compare Stock` | `/stock/compare` | `GitCompare` | Pathname `/stock/compare` နှင့် စပြုနေသည် |
| `User Mgt` | `/users` | `Users` | Pathname `/users` နှင့် စပြုနေသည် |

---

## 4. Side Effects

### A. localStorage ဖြင့် Collapsed State ကို မှတ်သားထားခြင်း
- Page အလိုအလျောက် load လုပ်တာနဲ့ `localStorage.getItem('sidebarCollapsed')` ကို ဖတ်ပြီး အခြေအနေကို အသုံးပြုသည်။
- Collapsed state ပြောင်းလဲသလား `localStorage.setItem('sidebarCollapsed', String(collapsed))` ဖြင့် မှတ်သားထားသည်။
- အခြေအနေပြောင်းလဲသည့်အခါ parent layout ကို `onCollapsedChange?.(collapsed)` ဖြင့် သတိပေးသည်။

### B. Stock Navigation Source ကို Sync လုပ်ခြင်း
- `useEffect` သည် `pathname` အပေါ် မှတ်ချေသည်။
- `getStockNavSource()` ကို အသုံးပြု၍ `sessionStorage` မှ ရလဒ်ကို ဖတ်ပြီး `stockNavSource` state ကို သတ်မှတ်သည်။
- Month-stock URL များသို့တိုက်ရိုက် သွားလာခြင်းအခါ အမှန်တရားကိစ္စ menu item ကို active ပြသရန် အသုံးပြုသည်။

### C. User Profile Loading
- Component mount လုပ်သည့်အခါ `getMe()` API ကို invocation လုပ်သည်။
- Success ပြီးလျှင် `user` state ကို `{ name, email }` အဖြစ် သတ်မှတ်သည်။
- Failure ပြီးလျှင် `user` ကို `null` လုပ်လိုက်သည် (မရှိပါက generic "User" label ပြသသည်။)
- အဆုံးမရှိ `loading` ကို `false` လုပ်လိုက်သည်။

---

## 5. User Events

### 1. Toggle Collapse/Expand
- **Trigger:** Collapse button (`ChevronLeft`/`ChevronRight`) ကို click လုပ်ခြင်း
- **Action:** `setCollapsed(!collapsed)` ဖြင့် state ကို ပြောင်းလဲသည်။
- **Result:** Sidebar အကျယ်အဝန်း w-256 (expanded) နှင့် w-20 (collapsed) အကြား transition ဖြင့် အပြောင်းအလဲပြုလုပ်သည်။
- **Tooltip:** `title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}`

### 2. Navigate to Dashboard
- **Trigger:** "Dashboard" menu item ကို click လုပ်ခြင်း
- **Action:** Click handler ထဲမှာ `setStockNavSource('dashboard')` ကို သော်လျှက် သုံးစွဲထားသည်။
- **Result:** Dashboard menu item active ဖြစ်သည်။ ပြီးခြင်း `/stock/[year]/[month]` သို့ သွားလာခြင်း အခါ Dashboard active ဖြစ်နေဆဲသလို ဆက်လက်ပြသသည်။

### 3. Navigate to Stock Management
- **Trigger:** "Stock Mgt" menu item ကို click လုပ်ခြင်း
- **Action:** `setStockNavSource('stock-mgt')` ကို သုံးစွဲထားသည်။
- **Result:** Stock Mgt menu item active ဖြစ်သည်။ ပြီးခြင်း month-stock URL များသို့ သွားလာခြင်း အခါ Stock Mgt active ဖြစ်နေဆဲသလို ဆက်လက်ပြသသည်။

### 4. Navigate to Category Management
- **Trigger:** "Category Mgt" menu item ကို click လုပ်ခြင်း
- **Action:** `/categories` သို့ သွားသည် (Next.js Link)
- **Result:** Category Mgt menu item active ဖြစ်သည်။

### 5. Navigate to Purchases
- **Trigger:** "Purchases" menu item ကို click လုပ်ခြင်း
- **Action:** `/purchases` သို့ သွားသည်
- **Result:** Purchases menu item active ဖြစ်သည်။

### 6. Navigate to Compare Stock
- **Trigger:** "Compare Stock" menu item ကို click လုပ်ခြင်း
- **Action:** `/stock/compare` သို့ သွားသည်
- **Result:** Compare Stock menu item active ဖြစ်သည်။

### 7. Navigate to User Management
- **Trigger:** "User Mgt" menu item ကို click လုပ်ခြင်း
- **Action:** `/users` သို့ သွားသည်
- **Result:** User Mgt menu item active ဖြစ်သည်။

### 8. Change Password
- **Trigger:** အခ်ျပက် section တွင် "Change Password" link ကို click လုပ်ခြင်း
- **Action:** `/password` သို့ သွားသည်
- **Result:** User ကို Change Password စာမျက်နှာသို့ ပြောင်းလဲပေးသည်။

### 9. Logout
- **Trigger:** အခ်ျပက် section တွင် "Logout" button ကို click လုပ်ခြင်း
- **Action:** `logoutUser()` API ကို invocation လုပ်သည် (`auth-token` cookie ကို ဖယ်ထုတ်သည်)၊ ပြီးလျှင် `router.push('/login')` ဖြင့် Login စာမျက်နှာသို့ ပြန်လည်သွားသည်။
- **Result:** User သည် အကာ ဝင်ရောက်မှုကို ပိတ်ဆို့ပြီး Login စာမျက်နှာသို့ ပြန်လည်သွားသည်။

---

## 6. UI/UX Behavior

### Active Link State
- Active menu item များ: `bg-blue-600 text-white`
- Inactive menu item များ: `text-gray-300 hover:bg-gray-700`
- Active မှတ်ချက်ကို `isActive` predicate ဖြင့် လုပ်ဆောင်သည်။

### Collapsed State Behavior
- "Stock Mgt" brand title ကို ဖascus
- Menu item အမည်များကို ဖascus; icon များကိုသာ Kent
- User အမည် နှင့် အီးမေလ်ကို ဖascus; avatar circle ကိုသာ ပြသသည်။
- "Change Password" နှင့် "Logout" button များကို icon များသာ ပြသခြင်း
- Collapsed ဖြစ်နေသည့်အခါ tooltip များ hover ဖြင့် ဖန်တီးထားသည်။

### Loading State
- User profile load လုပ်နေစဉ် avatar အရာပေါ်တွင် `Loader2` spinner animation ပြသသည်။
- User အမည်/အီးမေလ် အချက်အလက် load မပြီးခင် spinner animation ပြသည်။

### Avatar
- User အချက်အလက် ရရှိပြီးလျှဉ် `UserCircle` icon ကို ပြသသည်။
- အချti color: `bg-gray-600`
- အထူးပင် အတန်း: `w-12 h-12` (expanded) သို့မဟုတ် centered (collapsed)

---

## 8. Layout Integration

- Sidebar သည် fixed element အဖြစ် ရပ်တည်သည် (`fixed left-0 top-0 h-screen`)။
- သူ၏ အကျယ်အဝန်းပြောင်းလဲမိခြင်း သည် `onCollapsedChange?.(collapsed)` callback ဖြင့် parent သို့ သတိပေးသည်။
- Parent `AuthenticatedLayout` သည် ဤ callback ကို အသုံးပြု၍ main content area ၏ margin `ml-64` (expanded) သို့မဟုတ် `ml-20` (collapsed) အဖြစ် အပြောင်းအလဲပြုလုပ်သည်။

---

## 9. Business Rules

1. **Unauthenticated Users**: Sidebar သည် `AuthenticatedLayout` အတွင် ပါဝင်ပြီး authenticated routes များအတွက် သာ ပြသသည်။ JWT token မရှိသော အသုံးပြုသျှကို `/login` သို့ redirect လုပ်ပေးပြီး Sidebar ကို မပြသပါ။
2. **Self-Logout**: လက်ရှိ ဝင်ရောက်နေသော အသုံးပြုသျှ မိဘို အကာ ဖျက်ခြင်းကို အချိန်မရွေး ပြုလုပ်နိုင်သည်။ Sidebar ထဲမှာ role check မရှိပါ။
3. **Navigation Persistence**: Dashboard သို့မဟုတ် Stock Mgt မှ ရွေးချယ်ထားသော stock navigation သည် `sessionStorage` တွင် browser tab ပိတ်သည့်အထိ ထားရှိသည်။
4. **Collapse Persistence**: Sidebar collapse/expand အခြေအနေသည် `localStorage` တွင် browser restart ချိန်တွင် မှတ်သားထားသည်။

---

## 10. Accessibility Notes

- Collapsed ဖြစ်နေသည့်အခါ menu item များ၏ `title` attribute များသည် tooltip အဖြစ် အလိုအလျောက် ပြသသည်။
- Navigation သည် semantic `<nav>` နှင့် `<Link>` components များကို အသုံးပြုထားသည်။
- Logout သည် form-less action အတွက် `<button>` element ကို အသုံးပြုထားသည်။
- Active state သည် color contrast (`bg-blue-600`) ဖြင့်သာ ပြသသည့်အတွက် screen reader အနေနဲ့ မှတ်သားနိုင်ရန် screen reader only text ထည့်သွင်းနိုင်သည်။