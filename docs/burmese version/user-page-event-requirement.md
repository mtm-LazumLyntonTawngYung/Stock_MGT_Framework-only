# User Page တွင်လိုအပ်သည့် လုပ်ဆောင်ချက်များ

User Management Page သည် user account များကို စီမံခန့်ခွဲနိုင်ရန် ပြင်ဆင်ထားသော page ဖြစ်ပါသည်။
Existing User များကို delete/edit လုပ်ဆောင်နိုင်ပြီး New User အတွက် လည်း အသစ်ထပ်မံထပ်ထည့်နိုင်ပါသည်။
Active ဖြစ်သော member များ Inactive ဖြစ်သော member များကိုလည်း status ပြောင်းလည်းနိုင်ရန်ဖြစ်ပါသည်။

---

## အဓိကလုပ်ဆောင်ချက်များ (Key Features)

### 1. List Users

- System ထဲတွင် ရှိထားပြီးသော user များကိုပြသနိုင်ရမည်။
- **မှတ်ချက်** user email, status, created date, last login, action column တို့ ပါ၀င်ပြသရမည်။

### 2. Create User

- User အသစ်များကို ဖန်တီးနိုင်ရမည်။

### 3. Update Users

- System ထဲတွင် ရှိထားပြီးသော user များကို update လုပ်ဆောင်နိုင်ရမည်။

### 4. Delete Users

- Create လုပ်ထားသော user များကို delete လုပ်ဆောင်နိုင်ရမည်။
- **မှတ်ချက်** Delete လုပ်ရတွင် login လုပ်ထားသော member သည် မိမိအကောင့်ကို delete လုပ်ခွင့်မပြုထားပါ။

### 5. Search Filter
- User Email/Name အသုံးပြုပြီး search filter ကို လုပ်ဆောင်နိုင်ရမည်။

### 6. Skeleton Page

- User list များမရှိနေချိန်မှာ `No users found No users in the system` ကို table တွင် display ပြထားပေးပါ။

---

## Error Handling

| အခြေအနေ | တုံ့ပြန်ချက် |
|---|---|
| မိမိ login ၀င်ထားသောအကောင့်ကို ဖျက်မိပါက | "You cannot delete your own account.
e" toast error |
| password field empty ဖြစ်လျှင် | "Please fill out this field"  |
| email format   | "please include an @ in the email address" မက်ဆေ့ချ် ပြသည် |
| User create success/unsuccess ဖြစ် လျှင် message ပြရန် | "User created successfully/ User Creation Failed" |
| Existing Email/User | "Email already Exist" toaster message ပြရန်|

---
