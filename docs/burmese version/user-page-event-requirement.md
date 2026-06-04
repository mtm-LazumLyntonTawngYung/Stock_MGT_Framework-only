# User Page တွင်လိုအပ်သည့် လုပ်ဆောင်ချက်များ

**Purpose:** စနစ်အသုံးပြုသူများအားလုံးကို စီမံခန့်ခွဲမှုလုပ်ဆောင်ပြီး၊ အသစ်ဖန်တီးမှု၊ တည်းဖြတ်ခြင်း၊ ဖျက်ခြင်းနှင့် အခြေအနေပြောင်းလဲမှုများကို လုပ်ဆောင်နိုင်ရမည်။

---

## 1. State Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `users` | `UserType[]` | `[]` | API မှ ရရှိထားသော အသုံးပြုသူများ အားလုံး သိမ်းဆည်သည်။ |
| `loading` | `boolean` | `true` | အသုံးပြုသူများကို တောင်းခံယူနေစဉ် loading spinner ပြသရန်။ |
| `error` | `string` | `''` | အသုံးပြုသူများကို တောင်းခံယူလာခြင်း မအောင်မြင်ခဲ့ပြီးဆိုရာ error message ကို banner အဖြစ် ပြသရန်။ |
| `currentUserId` | `number \| null` | `null` | လက်ရှိ ဝင်ရောက်နေသော အသုံးပြုသူ၏ ID ကို သိမ်းဆည်သည်။ member ဖျက်ခြင်း ကို တားဆီးရန် အသုံးပြုသည်။ |
| `isModalOpen` | `boolean` | `false` | Add/Edit User modal ကို ဖွင့်/ပိတ် လုပ်ဆောင်ချက်။ |
| `editingUser` | `UserType \| null` | `null` | Modal ထဲမှာ ပြုပြင် လုပ်နေသော အသုံးပြုသူ၏ အချက်အလက်။ |
| `saving` | `boolean` | `false` | Form ကို သိမ်းဆည်နေစဉ် submit button ကို disable လုပ်ရန်။ |
| `formData` | `object` | `{ name: '', email: '', password: '', confirmPassword: '', status: 'active' }` | Modal form ထဲ၏ input field အားလုံး၏ value များကို လက်ခံထားသည်။ |
| `searchTerm` | `string` | `''` | User table ကို အမည် သို့မဟုတ် email အလိုက် ရှာဖွေမှတ် term ကို သိမ်းဆည်သည်။ |
| `confirmDelete` | `string \| null` | `null` | ဖျက်ခြင်း အတည်ပြုမှုး modal ဖွင့်နေပါက ဖျက်ခြင်းလုပ်ဆောင်ခြင်း အမည် ID value ကို သိမ်းဆည်သည်။ |
| `fieldErrors` | `Record<string, string>` | `{}` | Zod validation မှတ်တမ်း မှားသွားစဉ် input field တစ်ခုချင်းစီ inline error message ပြရန်။ |

---

## 2. Database Schema (`users` table)

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `BIGINT` | AUTO_INCREMENT | အသုံးပြုသူ၏ အမည်အမှတ်စာရင်း ID |
| `name` | `VARCHAR(255)` | NOT NULL | အသုံးပြုသူ၏ အမည် |
| `email` | `VARCHAR(255)` | UNIQUE NOT NULL | အသုံးပြုသူ၏ အီးမေလ် (ကြီးလက်လှည့်မှုနှင့် အမှားမရှိ) |
| `password` | `VARCHAR(255)` | NOT NULL | bcrypt encrypted လျှို့ဝှက်အက္ခရာ |
| `status` | `ENUM('active', 'inactive')` | 'active' | အသုံးပြုသူ၏ အခြေအနေ |
| `last_login` | `TIMESTAMP` | NULL | နောက်ဆုံး ဝင်ရောက်ခဲ့သည့် အချိန် |
| `created_at` | `TIMESTAMP` | CURRENT_TIMESTAMP | ဖန်တီးခဲ့သည့် အချိန် |
| `updated_at` | `TIMESTAMP` | ON UPDATE | အချက်အလက် အပ်ဒိတ်လုပ်ခဲ့သည့် အချိန် |
| `deleted_at` | `TIMESTAMP` | NULL | soft-delete အချိန် |

---
## 4. Form Fields (Add/Edit User Modal)

| Field | Type | Required (Create) | Required (Edit) | Description |
|-------|------|----------|----------|-------------|
| `name` | `text` | ✓ | ✓ | အသုံးပြုသူ၏ အမည် |
| `email` | `email` | ✓ | ✓ | အသုံးပြုသူ၏ အီးမေလ် |
| `password` | `password` | ✓ (Edit mode မှာ မဖြစ်ပါ) | ✗ | အသစ်ဖန်တီးခြင်း/ပြောင်းလဲမှုအတွက် လျှို့ဝှက်အက္ခရာ |
| `confirmPassword` | `password` | ✓ (Edit mode မှာ မဖြစ်ပါ) | ✗ | Password ကို အတည်ပြုရန် ထပ်မံစာရင်း |
| `status` | `select` | ✓ | ✓ | 'active' သို့မဟုတ် 'inactive' |

---

## 5. Validation Rules

| Scenario | Schema | Rules |
|----------|--------|-------|
| Create User | `userFormSchema` | name, email, password အားလုံး required; email format; password min length; password နှစ်ခု မကိုက်ညီပါက error |
| Edit User | `updateUserSchema` | name, email, status required; email format; password/confirmPassword မလိုအပ်ပါ |

---

## 6. UI / UX Elements

### Loading State
- Page load စဉ် `Loader2` spinner animation ပြသသည်။

### Error Display
- `error` state ရှိပါက table ညာနက် error message ကို အသေးစိတ် banner အဖြစ် ပြသည်။

### Search Bar
- Magnifying glass (`Search` icon) ပါဝင်သည်.
- Name သို့မဟုတ် email အလိုက် real-time filter လုပ်သည်။

### User Table Columns
| Column | Description |
|--------|-------------|
| User | ပုံ (User icon), အမည် နှင့် email |
| Status | Active (green badge) / Inactive (gray badge) — clickable toggle |
| Created | ဖန်တီးခဲ့သက် (toLocaleDateString) |
| Last Login | နောက်ဆုံး ဝင်ရောက်ခဲ့သက် (မရှိပါက "Never") |
| Actions | Edit (pencil icon) နှင့် Delete (trash icon) buttons |

### Empty State
- User မရှိပါ icon ပါ၀င်သော empty state ပြသသည်.
- Search term ရှိပါက "Try adjusting your search term"၊ မရှိပါက "No users in the system" ဟု ပြသည်။

### Modal Actions
- **Cancel Button**: Modal ကို ပိတ်လိုက်သည်။
- **Submit Button**: Create/Update အဖြစ် label ပြောင်းသည်. saving စဉ်တွင် `Loader2` spinner ပြသသည်။

### Delete Confirmation Modal
- `ConfirmModal` component အသုံးပြု၍ အတည်ပြုမှု လုပ်ဆောင်သည်.
- Confirm Button text: "Delete"
- Message: "Are you sure you want to delete this user? This action cannot be undone."
- မိဘို account ကို ဖျက်မှု တားဆီးသည်.

### Toast Notifications
- `toast.success()` — User created/updated/deleted successfully
- `toast.error()` — Failed to load/save/delete user

---
## 7. Business Rules

1. **Self-deletion prevention**: လက်ရှိဝင်ရောက်နေသော အသုံးပြုသူ မိဘို account ကို ဖျက်ခြင်း မပြုလုပ်နိုင်ပါ။
2. **Edit mode behavior**: Password နှစ်ခုကို edit mode မှာ လိုအပ်မည့် မဟုတ်ပါ။
3. **Status toggle**: Active ↔ Inactive အခြေအနေ ပြောင်းလဲမှု လုပ်ဆောင်ခြင်းအား အတည်ပြုမှု modal လိုအပ်ပါ။
4. **Soft delete**: ဖျက်ခြင်းဆိုတာ database ထဲမှာ `deleted_at` timestamp ကို မှတ်ထားလိုက်ခြင်း (အမှန်တရား မဖျက်ပါ).