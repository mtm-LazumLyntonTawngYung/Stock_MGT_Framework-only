## Dashboard Page ရဲ့လုပ်ဆောင်ပုံ

နှစ်အလိုက် လအလိုက် stock data တွေကို ကြည့်ရှုနိုင်တဲ့ စာမျက်နှာ။

```

### Empty State

 Content:  Calendar icon
 Heading: "No years yet"
 Helper text: "Create a month from the Stock Mgt tab to get started."

**သတိထားရမှာ:** Dashboard ကနေ month create လို့မရဖူး။ month create လုပ်ဖို့ Stock Mgt Page သို့သွားရမယ်။

---

## Business Rules

 Year Grouping: Dashboard သည် month table ထဲကနေ year အလိုက်အုပ်စုခွဲထားသည်။ တစ်နှစ်တွင် month များစွာ ပါဝင်နိုင်သည်။

 Year Card: တစ်နှစ်ကို click လုပ်လျှင် အောက်တွင် month များကို ပြသသည်။ month များကို month table ထဲကနေ year အလိုက် filter လုပ်ထားသည်။

---

## Interaction Flow

 User သည် Dashboard page သို့သွားပီး year month အလိုက် stock data များကို ကြည့်နိုင်သည်။
 Year card များ မရှိပါက empty state ပြသသည်။
"""

```