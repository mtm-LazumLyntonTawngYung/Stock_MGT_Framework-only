# Category Management Page တွင်လိုအပ်သည့် လုပ်ဆောင်ချက်များ

**Purpose:** ပစ္စည်း အမျိုးအစား ကဏ္ဍများကို စီမံခန့်ခွဲမှုလုပ်ဆောင်ပြီး၊ အထွေထု (Parent) ကဏ္ဍများနှင့် ဒုတိယ (Sub) ကဏ္ဍများကို တိုးမြှင့်ခြင်း၊ တည်းဖြတ်ခြင်း၊ ဖျက်ခြင်းနှင့် အခြေအနေပြောင်းလဲမှုများကို လုပ်ဆောင်နိုင်ရမည်။

---

## 1. State Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `categories` | `Category[]` | `[]` | API မှ ရရှိထားသော category များအားလုံး tree structure အဖြစ်သို့ ပြောင်းလဲထားသည်။ |
| `loading` | `boolean` | `true` | Category များကို တောင်းခံယူနေစဉ် loading spinner ပြသရန်။ |
| `error` | `string` | `''` | အချက်အလက် ယူယူမအောင်မြင်ခဲ့ပြီးဆိုရာ error message ကို banner အဖြစ် ပြသရန်။ |
| `expandedCategories` | `Set<string>` | `new Set()` | Tree view တွင် ဖွင့်ထားသော parent category ID များကို သိမ်းဆည်သည်။ |
| `isModalOpen` | `boolean` | `false` | Add/Edit Category modal ကို ဖွင့်/ပိတ် လုပ်ဆောင်ချက်။ |
| `editingCategory` | `Category \| null` | `null` | Modal ထဲမှာ ပြုပြင် လုပ်နေသော category အချက်အလက်။ |
| `formData` | `object` | `{ name: '', parentId: '', remark: '', minQuantity: '' }` | Modal form ထဲ၏ input field အားလုံး၏ value များကို လက်ခံထားသည်။ |
| `parentNameInput` | `string` | `''` | Sub-category ဖန်တီးခြင်းအခါ parent category အမည် ပြသရန် အသုံးပြုသည်။ |
| `saving` | `boolean` | `false` | Form ကို သိမ်းဆည်နေစဉ် submit button ကို disable လုပ်ရန်။ |
| `fieldErrors` | `Record<string, string>` | `{}` | Zod validation မှတ်တမ်း မှားသွားစဉ် input field တစ်ခုချင်းစီ inline error message ပြရန်။ |
| `confirmDelete` | `string \| null` | `null` | ဖျက်ခြင်း အတည်ပြုမှု modal ဖွင့်နေပါက ဖျက်ခြင်းလုပ်ဆောင်ခြင်း အမည် ID value ကို သိမ်းဆည်သည်။ |

---

## 2. Database Schema (`category` table)

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `BIGINT` | AUTO_INCREMENT | ကဏ္ဍ၏ အမည်အမှတ်စာရင်း ID |
| `name` | `VARCHAR(255)` | NOT NULL | ကဏ္ဍ၏ အမည် (အလွန်အမြင် ၁၀၀ စာလုံးအထိ) |
| `minimumThreshold` | `INT` | 0 | အန္တရာယ် သတိပေးခြင်း အောက်ကစားချိန် အရေတွက် (၀ယ်ယူမှတ်တမ်း အတွက်) |
| `remark` | `TEXT` | NULL | ကဏ္ဍ၏ အကြောင်းအရာ မှတ်ချက် |
| `parent_id` | `BIGINT` | NULL | ပင်က category ID (ကြီးလက်လှည့်) - မိဘို category များအတွက် NULL |
| `created_at` | `TIMESTAMP` | CURRENT_TIMESTAMP | ဖန်တီးခဲ့သည့် အချိန် |
| `updated_at` | `TIMESTAMP` | ON UPDATE | အချက်အလက် အပ်ဒိတ်လုပ်ခဲ့သည့် အချိန် |
| `deleted_at` | `TIMESTAMP` | NULL | soft-delete အချိန် |

---

## 3. Tree Structure Helpers

### `buildCategoryTree(flat)`
- Flat category list ကို parent-child relationship အရ tree structure အဖြစ် တည်ဆောက်သည်။
- `parent_id` ရှိသော category များကို သက်ဆိုင်သော parent ၏ `children` array ထဲသို့ ပေါင်းစပ်သည်။
- `parent_id` မရှိသော category များကို root level အဖြစ် ပြန်လည်ဖန်တီးသည်။

### `getAllCategoryIds(categories)`
- Tree **အောက်ရှိ** category ID အားလုံးကို recursive traversal ဖြင့် ရှာဖွေရယူသည်။
- Page load ဖြစ်သည့်အခါ category အားလုံးကို expand လုပ်ထားနိုင်ရန် အသုံးပြုသည်။
---

## 4. Key Functions / Events

### `loadCategories()` — Page Load Event
1. Component mount လုပ်တဲ့အခါ `useEffect` မှ အလိုအလျောက် သွားလာသည်။
2. `getCategories()` API ကို invocation လုပ်ကာ အားလုံး categories ကို ရယူလည်ကြိုးစားသည်။
3. `mapCategoryFromAPI()` ဖြင့် data များကို ပြောင်းလဲ၍ tree structure အဖြစ် တည်ဆောက်သည်။
4. `expandedCategories` state ကို အားလုံး category ID များပါဝင်သော Set အဖြစ် သတ်မှတ်သည်။
5. ကြိုးစားခြင်း အောင်မြင်ပြီးလျှင် `loading` ကို `false` လုပ်ပါသည်။

### `toggleExpand(categoryId)` — Expand/Collapse Event
1. Parent category ရှိသောအခါ Chevron icon ကို click လုပ်ပြီး expand/collapse လုပ်သည်။
2. `expandedCategories` Set ထဲမှာ ID ရှိပါက ဖယ်ထုတ်သည်။ မရှိပါက အသစ်ထည့်သည်။

### `getCategoryNameById(id)` — Helper Function
1. Category ID မှ category အမည် ကို ရယူရန် အသုံးပြုသည်။
2. Tree structure အောက်မှာ recursive ရှာဖွေသည်။

### `openModal(category?, parentId?)` — Add/Edit Button Click Event
1. `category` parameter ပါပါပြီဆိုရင် edit mode အဖြစ် ဖွင့်သည်။
2. `category` မရှိပါကနှင့် `parentId` ပါပါပြီဆိုရင် new subcategory အဖြစ် ဖွင့်သည်။
3. `parentId` မရှိပါကနှင့် new parent category အဖြစ် ဖွင့်သည်။
4. `formData` နှင့် `parentNameInput` ကို အစအသစ်ထားအဖြစ် ပြန်လည်သတ်မှတ်လိုက်သည်။

### `closeModal()` — Modal Close Event
1. `isModalOpen` ကို `false` လုပ်လိုက်သည်။
2. `editingCategory` state ကို null လုပ်လိုက်သည်။
3. `formData` နှင့် `parentNameInput` ကို အစအသစ်ထားအဖြစ် ပြန်လည်သတ်မှတ်လိုက်သည်။

### `handleSubmit(e)` — Form Submit Event
1. `categoryFormSchema.safeParse(formData)` ဖြင့် Zod validation လုပ်သည်။
2. Validation မအောင်မြင်ပါက `fieldErrors` state သို့ သိမ်းပြီး inline message ပြသည်။
3. Save လုပ်နေစဉ် `saving` state ကို `true` လုပ်ပြီး button ကို disable လုပ်သည်။
4. API လှောလှောင့်လာသည်:
   - `editingCategory` ရှိပါက `updateCategory(id, data)` ကို အသုံးပြုသည်။
   - မရှိပါက `createCategory(data)` ကို အသုံးပြုသည်။
5. Success ပြီးလျှင် modal ကို ပိတ်၍ toast success ပြပြီး categories list ကို ပြန်လည် load လုပ်သည်။

### `handleDelete(categoryId)` — Delete Button Click Event
1. Category ကို ဖျက်မှုကို အတည်ပြုရန် `confirmDelete` သို့ categoryId ကို သတ်မှတ်လိုက်သည်။
2. `ConfirmModal` ကို ဖွင့်ပြီး category ကို ဖျက်မှုကို အတည်ပြုရန် ဖ requesting လုပ်သည်။

### `confirmDeleteCategory()` — Confirm Delete Event
1. `confirmDelete` ရှိပါက `deleteCategory(id)` API ကို invocation လုပ်သည်။
2. Success ပြီးလျှင် toast success ပြပြီး categories list ကို ပြန်လည် load လုပ်သည်။
3. Error ဖြစ်ပါက toast error ပြသည်။

---

## 5. Form Fields (Add/Edit Category Modal)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `text` | ✓ | Category အမည် (၁၀၀ စာလုံးအထိ) |
| `parentId` | `hidden/derived` | | Parent category ID (sub-category ဖန်တီးခြင်းအတွက် အလိုအလျောက်သတ်မှတ်သည်) |
| `parentNameInput` | `text` (disabled) | | Sub-category ဖန်တီးခြင်းအခါ parent category အမည် ပြသသည်။ |
| `remark` | `textarea` | | Optional မှတ်ချက် (၅၀၀ စာလုံးအထိ) |
| `minQuantity` | `number` | | Minimum Stock Alert Threshold (၀ နှင့် အထက်မဟုတ်) |

---

## 6. Validation Rules (categoryFormSchema)

| Rule | Description |
|------|-------------|
| `name` | Required; string; max 100 characters |
| `parentId` | Optional; number |
| `minimumThreshold` | Optional; min 0; cannot be negative |
| `remark` | Optional; string; max 500 characters |

---

## 7. UI / UX Elements

### Loading State
- Page load စဉ် `Loader2` spinner animation နှင့် "Loading categories..." text ပြသသည်။

### Error Display
- `error` state ရှိပါက အသေးစိတ် error banner (AlertCircle icon ပါဝင်သည်) ကို ပြသည်။

### Tree View Display
- **Parent Category**: Folder icon ပါ၀င်သည်။ Expand/Collapse လုပ်နိုင်သည်။
- **Sub Category**: Dot icon ပါ၀င်သည်။ Indent လုပ်ထားသည်။
- **Min Qty Badge**: `minQuantity > 0` ဖြစ်ပါက amber badge အနေနဲ့ ပြသသည်။
- **Remark Badge**: `remark` ရှိပါက Info icon ပါ၀င်သော badge အနေနဲ့ ပြသသည်။

### Category Row Actions (Hover reveal)
| Action | Icon | Description |
|--------|------|-------------|
| Add Subcategory | Plus (+) | Parent category only. Opens modal with parentId pre-filled. |
| Edit | Pencil | Opens edit modal with existing data |
| Delete | Trash2 | Opens confirm delete modal |

### Empty State
- Folder icon ပါ၀င်သော empty state ပြသသည်။
- "No categories setup" နှင့် "Get started by creating your primary high-level categories." ဟု ပြသည်။
- "Add your first category →" link button ပါ၀င်သည်။

### Modal Actions
- **Cancel Button**: Modal ကို ပိတ်လိုက်သည်။
- **Submit Button**: Create/Edit အဖြစ် label ပြောင်းသည်. saving စဉ်တွင် `Loader2` spinner ပြသသည်။

### Delete Confirmation Modal
- `ConfirmModal` component အသုံးပြု၍ အတည်ပြုမှု လုပ်ဆောင်သည်.
- Confirm Button text: "Delete"
- Message: "Are you sure you want to delete this category? This action cannot be undone."

### Toast Notifications
- `toast.success()` — Category created/updated/deleted successfully
- `toast.error()` — Failed to load/save/delete category

---

## 8. Business Rules

1. **Tree Structure**: Category များကို parent-child relationship အရ စီစဉ်ထားသည်။ Parent category ထဲမှာ sub-category များပါဝင်နိုင်သည်။
2. **Sub-category Remark & Min Threshold**: Sub-category အတွက် သာ remark နှင့် minimum stock threshold သတ်မှတ်နိုင်သည်။ Parent category များအတွက် မလိုအပ်ပါ။
3. **Soft Delete**: ဖျက်ခြင်းဆိုတာ database ထဲမှာ `deleted_at` timestamp ကို မှတ်ထားလိုက်ခြင်း (အမှန်တရား မဖျက်ပါ).
4. **Add Subcategory**: Parent category ရှိသောအခါ မျက်နှာပြင် `+` button ဖြင့် sub-category တစ်ခု လုံးလျက်အားဖြင့် ဖန်တီးနိုင်သည်။
5. **Category/Sub-Category Deletion**: Parent Category အောက်တွင် ရှိသော sub-category များသည် purchase record တွင် ရှိနေပါက ဖျက်၍မရနိုင်ရပါ။ Purchase record တွင် မရှိနေပါက deletion ပြုလုပ်နိုင်ပါသည်။ Delete ပြုလုပ်သော အခါတွင်လည်း Category ကို delete လုပ်လျှင် sub-category ပါ delete ဖြစ်ရမည်။ 