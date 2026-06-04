## Stock Management Page ရဲ့လုပ်ဆောင်ပုံ

### Stock List Page - အဓိက စာမျက်နှာ

ဒါက stock management ရဲ့ အဓိက စာမျက်နှာဖြစ်ပြီး ကုန်ပစ္စည်းတွေရဲ့ အသေးစိတ် အချက်အလက်တွေကို table ထဲ ပြသတယ်။

#### API Query

ဒီ query က table ၄ ခုကို JOIN လုပ်ထားတယ်:

```
monthly_stock_data (အဓိက)
  ├── weekly_stock_check (အပတ်စဉ် သုံးစွဲပမာဏ ၅ ပတ်)
  ├── purchases (ဝယ်ယူမှု ၃ ကြိမ်ကို pivot လုပ်ထားတယ်)
  └── category (ကုန်ပစ္စည်းအမည် + parent category အမည်)
```


#### Table မှာ ပြထားတဲ့ column

| column | reference | description |
|---|---|---|
| Sr. | Num | Num |
| Item Description | `category.name` | category name |
| Price | `purchases.discount_price` | ဝယ်ဈေး |
| Opening Qty |  | လအစမှာ 0 (ပြီးခဲ့တဲ့လရဲ့ closing qty ကနောက်လရဲ့ opening qty) |
| Purchase 1st/2nd/3rd | `purchases.quantity` | ဝယ်ယူမှု ၃ ကြိမ် |
| Total Purchase | `Total Purchase Formula` | purchase ၃ ခု ပေါင်း |
| Used Qty (Week 1-5) | `weekly_stock_check` table (Week 1-5) | အပတ်စဉ် သုံးစွဲပမာဏ |
| Total Used Qty | `Total Used Formula` | ၅ ပတ် ပေါင်း |
| Closing Qty | `Closing Qty Formula` | opening + purchase - used |
| Action | - | Edit / Delete button |

#### တွက်ချက်မှု ပုံသေနည်းတွေ

```
Total Purchase = purchaseQty1st + purchaseQty2nd + purchaseQty3rd
Total Used     = usedQty1stWeek + usedQty2ndWeek + usedQty3rdWeek + usedQty4thWeek + usedQty5thWeek
Closing Qty    = openingQty + totalPurchase - totalUsed
Unit Price     = (price - discount) / (purchaseQty * quantityPerUnit)
```

#### ကုန်ပစ္စည်း ထည့်သွင်းခြင် (Add Product)

1. User က "Add Product" button ကို နှိပ်တယ်
2. Modal form ပွင့်လာတယ်
3. Category, Sub Category, purchase info ဖြည့်တယ်
4. Form validation (Zod schema) နဲ့ စစ်တယ်
5. Backend မှာ transaction သုံးပြီး:
   - `monthly_stock_data` table မှာ insert လုပ်တယ်
   - `purchases` table မှာ ဝယ်ယူမှု ၃ ခုအထိ insert လုပ်တယ်
6. အောင်မြင်ရင် alert message ပြတယ်

**သတိထားရမှာ:** နောက်ဆုံး month မှာပဲ ကုန်ပစ္စည်း အသစ် ထည့်လို့ရတယ်။

#### ကုန်ပစ္စည်း ပြင်ဆင်ခြင် (Edit Product)

1. Edit button ကို နှိပ်တယ်
2. ရှိပြီးသား data နဲ့ modal form ကို ဖြည့်တယ်
3. ပြင်ချင်တဲ့ အချက်အလက်တွေ ပြင်တယ်
5. Backend မှာ:
   - `monthly_stock_data` ကို update လုပ်တယ်
   - `purchases` တွေကို update လုပ်တယ်
   - နောက်လရဲ့ `opening_qty` ကို ပြန်ညှိတယ် (ရှိရင်)

**သတိထားရမှာ:** current month & previous month မှာပဲ ပြင်လို့ရတယ်။

#### ကုန်ပစ္စည်း ဖျက်ခြင် (Delete Product)

1. Delete button ကို နှိပ်တယ်
2. Confirmation modal ပြတယ်
4. Soft delete လုပ်တယ် (`deleted_at` field set လုပ်တယ်)

**သတိထားရမှာ:**
- current month မှာပဲ ဖျက်လို့ရတယ်
- opening qty 0, total purchase 0 ဖြစ်မှပဲ ဖျက်လို့ရတယ် (မဟုတ်ရင် button disable ဖစ်နေမယ်)

### 5. Stock Check Page

အပတ်စဉ် သုံးစွဲမှုကို စစ်ဆေးပြီး ပြင်ဆင်နိုင်တဲ့ စာမျက်နှာ။

**လုပ်ဆောင်ပုံ:**
- Stock list page နဲ့ တူညီတဲ့ data loading pattern
- Product တစ်ခုချင်းစီအတွက် Edit button နှိပ်ရင် modal ပွင့်တယ်
- အပတ် ၅ ပတ်အတွက် သုံးစွဲပမာဏနဲ့ "Checked" checkbox တွေ ဖြည့်တယ်
- Backend မှာ:
  - `weekly_stock_check` table မှာ insert/update လုပ်တယ်
  - `closing_qty` ကို ပြန်တွက်တယ်

**စစ်ဆေးချက်:** သုံးစွဲပမာဏ စုစုပေါင်းက (opening + purchases) ထက် မကျော်ရဘူး။


## အရေးကြီးတဲ့ Business Rules

1. **Closing Quantity တွက်ပုံ:** `opening_qty + total_purchase - total_used`

2. **Month အသစ်မှာ Opening Qty ပုံသေနည်း:** ပြီးခဲ့တဲ့လရဲ့ `closing_qty` ကို အလိုအလျောက် ယူတယ်

3. **Edit လုပ်လို့ရတဲ့လ:** နောက်ဆုံးလ နဲ့ အရင်လ ပဲ (current month & previous month)

4. **ကုန်ပစ္စည်း အသစ်ထည့်လို့ရတဲ့လ:** နောက်ဆုံးလ ပဲ (current month only)

5. **သုံးစွဲပမာဏ ကန့်သတ်ချက်:** Opening + Purchase ထက် မကျော်ရဘူး

6. **Soft Delete:** Data တွေကို ဖျက်တာထက် `deleted_at` field ကို set လုပ်တယ်

7. **ပြီးခဲ့တဲ့လ ပြန်ပြင်လို့မရ:** လက်ရှိလနဲ့ အရင်လကို ပြန်ပြင်ရင် နောက်လရဲ့ opening_qty ကို အလိုအလျောက် ပြန်ညှိပေးတယ်

---