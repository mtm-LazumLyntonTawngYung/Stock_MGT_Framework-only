# Reset Password Page တွင်လိုအပ်သည့် လုပ်ဆောင်ချက်များ

Password အ‌‌ဟောင်းကိုအသစ်ဖြစ်အောင် update လုပ်ပေးနိုင်ရမည်။

---

## အဓိကလုပ်ဆောင်ချက်များ (Key Features)

### 1. Password Reset

- Password update ပြုလုပ်နိုင်ရမည်။
- Password crypt hashဖြင့် database တွင်သိမ်းထားရမည်။

---

## Error Handling

| အခြေအနေ | တုံ့ပြန်ချက် |
|---|---|
| Password validation | "Password must be at least 6 characters" toast error |
| New Password, Confirm Password Match မဖြစ်ပါက | "Passwords do not match" toast error ဖော်ပြသည် |
| Old Password မှားလျှင် | "Current password is incorrect" toast error ဖော်ပြသည်|

---
