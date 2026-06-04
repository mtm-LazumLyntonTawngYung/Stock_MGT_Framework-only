# Database Schema Documentation

**Project:** Stock Management System  
**Database:** MySQL  
**Migration Files:** 
- `src/lib/migrations/01-create-tables.sql`
- `src/lib/migrations/02-seed-data.sql`

---

## 1. Tables Overview

| # | Table Name | Description |
|---|------------|-------------|
| 1 | `users` | စနစ်အသုံးပြုသူများ၏ အချက်အလက် မှတ်တမ်း |
| 2 | `category` | ပစ္စည်း အမျိုးအစား ကဏ္ဍများ (Parent & Sub-category) |
| 3 | `month` | လစဉ် အချက်အလက် (တစ်နှစ်ထဲက လများ) |
| 4 | `monthly_stock_data` | လစဉ်အလိုက် စတော့ ပစ္စည်း အချက်အလက် |
| 5 | `weekly_stock_check` | လစဉ်အလိုက် ပုံမှန် အသုံးပြုပြီး အသုံးစွဲ အများအပြားမှတ်တမ်း |
| 6 | `purchases` | ဝယ်ယူမှတ်တမ်း များ |

---

## 2. Table Details

### 2.1 `users`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `BIGINT` | AUTO_INCREMENT PRIMARY KEY | အသုံးပြုသူ၏ အမည်အမှတ်စာရင်း ID |
| `name` | `VARCHAR(255)` | NOT NULL | အသုံးပြုသူ၏ အမည် |
| `email` | `VARCHAR(255)` | UNIQUE NOT NULL | အသုံးပြုသူ၏ အီးမေလ် (ကြီးလက်လှည့်‌မရှိ) |
| `password` | `VARCHAR(255)` | NOT NULL | bcrypt ဖြင့် encryption လုပ်ထားသော လျှို့ဝှက်အက္ခရာ |
| `status` | `ENUM('active', 'inactive')` | 'active' | အသုံးပြုသူ၏ အခြေအနေ |
| `last_login` | `TIMESTAMP` | NULL | နောက်ဆုံး ဝင်ရောက်ခဲ့သည့်အချိန် |
| `created_at` | `TIMESTAMP` | CURRENT_TIMESTAMP | မှတ်တမ်း ဖန်တီးခဲ့သည့်အချိန် |
| `updated_at` | `TIMESTAMP` | NULL ON UPDATE CURRENT_TIMESTAMP | အချက်အလက် အပ်ဒိတ်လုပ်ခဲ့သည့်အချိန် |
| `deleted_at` | `TIMESTAMP` | NULL | soft-delete အချိန် |

**Indexes:** PRIMARY KEY (`id`), UNIQUE KEY (`email`)

---

### 2.2 `category`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `BIGINT` | AUTO_INCREMENT PRIMARY KEY | ကဏ္ဍ၏ အမည်အမှတ်စာရင်း ID |
| `name` | `VARCHAR(255)` | NOT NULL | ကဏ္ဍ၏ အမည် (၁၀၀ စာလုံးအထိ) |
| `minimum_threshold` | `INT` | 0 | အန္တရာယ် သတိပေးခြင်း အောက်ကစားချိန် အရေတွက် |
| `remark` | `TEXT` | NULL | ကဏ္ဍ၏ အကြောင်းအရာ မှတ်ချက် (၅၀၀ စာလုံးအထိ) |
| `parent_id` | `BIGINT` | NULL | ပင်မ ကဏ္ဍ ID — မိဘို category များအတွက် NULL |
| `created_at` | `TIMESTAMP` | CURRENT_TIMESTAMP | ဖန်တီးခဲ့သည့်အချိန် |
| `updated_at` | `TIMESTAMP` | NULL ON UPDATE CURRENT_TIMESTAMP | အချက်အလက် အပ်ဒိတ်လုပ်ခဲ့သည့်အချိန် |
| `deleted_at` | `TIMESTAMP` | NULL | soft-delete အချိန် |

**Foreign Keys:**
- `parent_id` → `category(id)` ON DELETE SET NULL

**Relationship:** Self-referential (parent-child hierarchy)

---

### 2.3 `month`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `BIGINT` | AUTO_INCREMENT PRIMARY KEY | လစဉ် အမည်အမှတ်စာရင်း ID |
| `month` | `TINYINT` | NOT NULL CHECK (month BETWEEN 1 AND 12) | လ အမှတ် (၁-၁၂) |
| `year` | `SMALLINT` | NOT NULL | နှစ် |
| `created_at` | `TIMESTAMP` | CURRENT_TIMESTAMP | ဖန်တီးခဲ့သည့်အချိန် |

**Unique Keys:** `unique_month_year` (`month`, `year`)

---

### 2.4 `monthly_stock_data`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `BIGINT` | AUTO_INCREMENT PRIMARY KEY | အမည်အမှတ်စာရင်း ID |
| `month_id` | `BIGINT` | NOT NULL | ပင်မ လစဉ် ID |
| `category_id` | `BIGINT` | NOT NULL | ပင်မ ကဏ္ဍ ID |
| `opening_qty` | `INT` | DEFAULT 0 | လစဉ် စတော့ အရေတွက် |
| `closing_qty` | `INT` | DEFAULT 0 | လစဉ် အဆုံး အရေတွက် |
| `created_by` | `BIGINT` | NULL | ဖန်တီးခဲ့သော အသုံးပြုသူ ID |
| `updated_by` | `BIGINT` | NULL | အပ်ဒိတ်လုပ်ခဲ့သော အသုံးပြုသူ ID |
| `created_at` | `TIMESTAMP` | CURRENT_TIMESTAMP | ဖန်တီးခဲ့သည့်အချိန် |
| `updated_at` | `TIMESTAMP` | NULL ON UPDATE CURRENT_TIMESTAMP | အပ်ဒိတ်လုပ်ခဲ့သည့်အချိန် |
| `deleted_at` | `TIMESTAMP` | NULL | soft-delete အချိန် |

**Foreign Keys:**
- `month_id` → `month(id)` ON DELETE CASCADE
- `category_id` → `category(id)` ON DELETE CASCADE

**Unique Keys:** `unique_monthly_category` (`month_id`, `category_id`)

---

### 2.5 `weekly_stock_check`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `BIGINT` | AUTO_INCREMENT PRIMARY KEY | အမည်အမှတ်စာရင်း ID |
| `month_id` | `BIGINT` | NOT NULL | ပင်မ လစဉ် ID |
| `category_id` | `BIGINT` | NOT NULL | ပင်မ ကဏ္ဍ ID |
| `used_qty_1st_week` | `INT` | DEFAULT 0 | ပထမပတ် အသုံးစွဲ အရေတွက် |
| `used_qty_2nd_week` | `INT` | DEFAULT 0 | ဒုတိယပတ် အသုံးစွဲ အရေတွက် |
| `used_qty_3rd_week` | `INT` | DEFAULT 0 | တတိယပတ် အသုံးစွဲ အရေတွက် |
| `used_qty_4th_week` | `INT` | DEFAULT 0 | စတုတ္ထပတ် အသုံးစွဲ အရေတွက် |
| `used_qty_5th_week` | `INT` | DEFAULT 0 | ပဥပတ္ထပတ် အသုံးစွဲ အရေတွက် |
| `checked_week_1` | `BOOLEAN` | DEFAULT FALSE | ပထမပတ် စစ်ဆေးထားပြီးသလို |
| `checked_week_2` | `BOOLEAN` | DEFAULT FALSE | ဒုတိယပတ် စစ်ဆေးထားပြီးသလို |
| `checked_week_3` | `BOOLEAN` | DEFAULT FALSE | တတိယပတ် စစ်ဆေးထားပြီးသလို |
| `checked_week_4` | `BOOLEAN` | DEFAULT FALSE | စတုတ္ထပတ် စစ်ဆေးထားပြီးသလို |
| `checked_week_5` | `BOOLEAN` | DEFAULT FALSE | ပဥပတ္ထပတ် စစ်ဆေးထားပြီးသလို |
| `created_by` | `BIGINT` | NULL | ဖန်တီးခဲ့သော အသုံးပြုသူ ID |
| `updated_by` | `BIGINT` | NULL | အပ်ဒိတ်လုပ်ခဲ့သော အသုံးပြုသူ ID |
| `created_at` | `TIMESTAMP` | CURRENT_TIMESTAMP | ဖန်တီးခဲ့သည့်အချိန် |
| `updated_at` | `TIMESTAMP` | NULL ON UPDATE CURRENT_TIMESTAMP | အပ်ဒိတ်လုပ်ခဲ့သည့်အချိန် |
| `deleted_at` | `TIMESTAMP` | NULL | soft-delete အချိန် |

**Foreign Keys:**
- `month_id` → `month(id)` ON DELETE CASCADE
- `category_id` → `category(id)` ON DELETE CASCADE

---

### 2.6 `purchases`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `BIGINT` | AUTO_INCREMENT PRIMARY KEY | အမည်အမှတ်စာရင်း ID |
| `monthly_stock_id` | `BIGINT` | NULL | ပင်မ လစဉ်စတော့ အချက်အလက် ID |
| `category_id` | `BIGINT` | NOT NULL | ပင်မ ကဏ္ဍ ID |
| `purchase_date` | `DATE` | NOT NULL | ဝယ်ယူခဲ့သည့် ရက်စွဲ |
| `quantity` | `INT` | NOT NULL | ဝယ်ယူပြီး ရောက်ရှိသော အရေတွက် |
| `purchase_price` | `DECIMAL(10,2)` | DEFAULT 0.00 | ဝယ်ယူပြီး ပေးချေရမည့် စုစုပေါင်း စျေး |
| `discount_price` | `DECIMAL(10,2)` | DEFAULT 0.00 | ပစ္စည်းအတွက် သတ်မှတ်ပေးထားသည့် လျှော့ဈေး |
| `quantity_per_unit` | `INT` | DEFAULT 1 | တစ်သုတ်တည်း ပါဝင်သည့် အရေတွက် |
| `unit_price` | `DECIMAL(10,2)` | NOT NULL | တစ်ခုတည်း ရသမျှ စျေး |
| `discount_amount` | `DECIMAL(10,2)` | DEFAULT 0.00 | ပစ္စည်းအတွက် သတ်မှတ်ပေးထားသည့် လျှော့ဈေး ပမာဏ |
| `created_by` | `BIGINT` | NULL | ဖန်တီးခဲ့သော အသုံးပြုသူ ID |
| `updated_by` | `BIGINT` | NULL | အပ်ဒိတ်လုပ်ခဲ့သော အသုံးပြုသူ ID |
| `created_at` | `TIMESTAMP` | CURRENT_TIMESTAMP | ဖန်တီးခဲ့သည့်အချိန် |
| `updated_at` | `TIMESTAMP` | NULL ON UPDATE CURRENT_TIMESTAMP | အပ်ဒိတ်လုပ်ခဲ့သည့်အချိန် |

**Foreign Keys:**
- `monthly_stock_id` → `monthly_stock_data(id)` ON DELETE SET NULL
- `category_id` → `category(id)` ON DELETE CASCADE

---

## 3. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ monthly_stock_data : "created_by"
    users ||--o{ weekly_stock_check : "created_by"
    users ||--o{ purchases : "created_by"
    users {
        bigint id PK
        varchar name
        varchar email UK
        varchar password
        enum status
        timestamp last_login
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    category ||--o{ category : "parent_id"
    category ||--o{ monthly_stock_data : "category_id"
    category ||--o{ weekly_stock_check : "category_id"
    category ||--o{ purchases : "category_id"
    category {
        bigint id PK
        varchar name
        int minimum_threshold
        text remark
        bigint parent_id FK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    month ||--o{ monthly_stock_data : "month_id"
    month ||--o{ weekly_stock_check : "month_id"
    month {
        bigint id PK
        tinyint month
        smallint year
        timestamp created_at
    }

    monthly_stock_data ||--o{ purchases : "monthly_stock_id"
    monthly_stock_data {
        bigint id PK
        bigint month_id FK
        bigint category_id FK
        int opening_qty
        int closing_qty
        bigint created_by FK
        bigint updated_by FK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    weekly_stock_check {
        bigint id PK
        bigint month_id FK
        bigint category_id FK
        int used_qty_1st_week
        int used_qty_2nd_week
        int used_qty_3rd_week
        int used_qty_4th_week
        int used_qty_5th_week
        boolean checked_week_1
        boolean checked_week_2
        boolean checked_week_3
        boolean checked_week_4
        boolean checked_week_5
        bigint created_by FK
        bigint updated_by FK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    purchases {
        bigint id PK
        bigint monthly_stock_id FK
        bigint category_id FK
        date purchase_date
        int quantity
        decimal purchase_price
        decimal discount_price
        int quantity_per_unit
        decimal unit_price
        decimal discount_amount
        bigint created_by FK
        bigint updated_by FK
        timestamp created_at
        timestamp updated_at
    }