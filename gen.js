// Recipe generator: builds ~5000 extra recipes (EN + AR) by combining real dish patterns
// (stir-fry, bake, bowl, stew, curry, pasta, soup, wrap, salad, ...) with cuisines, proteins, vegetables and carbs.
// Ingredient amounts are per serving; nutrition is computed from INGREDIENTS like every other recipe.
(function () {
  let seed = 20261010;
  const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // ---- pools ----
  const PROT = {
    chicken: { g: 150, type: "cut", n: "Chicken", l: "chicken", a: "دجاج", ad: "الدجاج" },
    beef: { g: 130, type: "cut", n: "Beef", l: "beef", a: "لحم بقري", ad: "اللحم البقري" },
    lamb: { g: 130, type: "cut", n: "Lamb", l: "lamb", a: "لحم ضأن", ad: "لحم الضأن" },
    turkey: { g: 140, type: "ground", n: "Turkey", l: "ground turkey", a: "ديك رومي", ad: "الديك الرومي" },
    salmon: { g: 140, type: "fish", n: "Salmon", l: "salmon", a: "سلمون", ad: "السلمون" },
    cod: { g: 170, type: "fish", n: "Cod", l: "cod", a: "سمك القد", ad: "سمك القد" },
    tilapia: { g: 170, type: "fish", n: "Tilapia", l: "tilapia", a: "سمك البلطي", ad: "سمك البلطي" },
    shrimp: { g: 150, type: "shrimp", n: "Shrimp", l: "shrimp", a: "جمبري", ad: "الجمبري" },
    tofu: { g: 180, type: "tofu", n: "Tofu", l: "tofu", a: "توفو", ad: "التوفو" },
    tempeh: { g: 120, type: "tofu", n: "Tempeh", l: "tempeh", a: "تمبيه", ad: "التمبيه" },
    chickpeas: { g: 170, type: "bean", n: "Chickpea", l: "chickpeas", a: "حمص", ad: "الحمص" },
    lentils: { g: 180, type: "bean", n: "Lentil", l: "lentils", a: "عدس", ad: "العدس" },
    whitebeans: { g: 170, type: "bean", n: "White Bean", l: "white beans", a: "فاصوليا بيضاء", ad: "الفاصوليا البيضاء" },
    blackbeans: { g: 170, type: "bean", n: "Black Bean", l: "black beans", a: "فاصوليا سوداء", ad: "الفاصوليا السوداء" },
  };
  const VEG = {
    broccoli: ["Broccoli", "broccoli", "بروكلي", "البروكلي"], spinach: ["Spinach", "spinach", "سبانخ", "السبانخ"], zucchini: ["Zucchini", "zucchini", "كوسا", "الكوسا"],
    pepper: ["Pepper", "bell pepper", "فلفل رومي", "الفلفل الرومي"], mushrooms: ["Mushroom", "mushrooms", "فطر", "الفطر"], cauliflower: ["Cauliflower", "cauliflower", "قرنبيط", "القرنبيط"],
    greenbeans: ["Green Bean", "green beans", "فاصوليا خضراء", "الفاصوليا الخضراء"], eggplant: ["Eggplant", "eggplant", "باذنجان", "الباذنجان"], carrot: ["Carrot", "carrots", "جزر", "الجزر"],
    cabbage: ["Cabbage", "cabbage", "ملفوف", "الملفوف"], tomato: ["Tomato", "tomatoes", "طماطم", "الطماطم"], asparagus: ["Asparagus", "asparagus", "هليون", "الهليون"],
    kale: ["Kale", "kale", "كيل", "الكيل"], peas: ["Pea", "peas", "بازلاء", "البازلاء"], okra: ["Okra", "okra", "بامية", "البامية"], corn: ["Corn", "corn", "ذرة", "الذرة"],
    cucumber: ["Cucumber", "cucumber", "خيار", "الخيار"], squash: ["Squash", "butternut squash", "قرع", "القرع"],
  };
  const BASE = {
    rice: { g: 150, n: "Rice", l: "brown rice", a: "أرز", ad: "الأرز" }, quinoa: { g: 140, n: "Quinoa", l: "quinoa", a: "كينوا", ad: "الكينوا" },
    bulgur: { g: 150, n: "Bulgur", l: "bulgur", a: "برغل", ad: "البرغل" }, couscous: { g: 150, n: "Couscous", l: "couscous", a: "كسكسي", ad: "الكسكسي" },
    potato: { g: 200, n: "Potatoes", l: "potatoes", a: "بطاطس", ad: "البطاطس" }, sweetpotato: { g: 180, n: "Sweet Potato", l: "sweet potato", a: "بطاطا حلوة", ad: "البطاطا الحلوة" },
    ricenoodles: { g: 150, n: "Rice Noodles", l: "rice noodles", a: "شعيرية أرز", ad: "شعيرية الأرز" }, soba: { g: 140, n: "Soba Noodles", l: "soba noodles", a: "نودلز سوبا", ad: "نودلز السوبا" },
    freekeh: { g: 150, n: "Freekeh", l: "freekeh", a: "فريكة", ad: "الفريكة" }, pasta: { g: 170, n: "Pasta", l: "pasta", a: "معكرونة", ad: "المعكرونة" },
  };
  const SAUCE = { // key -> [EN, AR, grams]
    yogurt: ["Yogurt", "زبادي", 60, "الزبادي"], tahini: ["Tahini", "طحينة", 15, "الطحينة"], avocado: ["Avocado", "أفوكادو", 50, "الأفوكادو"], hummus: ["Hummus", "حمص", 40, "الحمص"],
    feta: ["Feta", "فيتا", 30, "الفيتا"], parmesan: ["Parmesan", "بارميزان", 10, "البارميزان"], labneh: ["Labneh", "لبنة", 40, "اللبنة"],
  };

  // ---- cooking text per protein / type ----
  const SEAR = {
    chicken: ["Season the chicken with salt, pepper and {sp}. Sear in a little of the oil 5–6 minutes per side until cooked through (75 °C / 165 °F), then slice.", "تبّل الدجاج بالملح والفلفل و{sp}. حمّره في قليل من الزيت 5–6 دقائق لكل جانب حتى ينضج تماماً (75 °م) ثم قطّعه شرائح."],
    beef: ["Slice the beef thinly and season with salt, pepper and {sp}. Sear over high heat 2–3 minutes per side.", "قطّع اللحم البقري شرائح رفيعة وتبّله بالملح والفلفل و{sp}. حمّره على نار عالية 2–3 دقائق لكل جانب."],
    lamb: ["Slice the lamb thinly and season with salt, pepper and {sp}. Sear over high heat 3–4 minutes per side.", "قطّع لحم الضأن شرائح رفيعة وتبّله بالملح والفلفل و{sp}. حمّره على نار عالية 3–4 دقائق لكل جانب."],
    turkey: ["Brown the ground turkey with {sp} in a non-stick pan for 6–7 minutes, breaking it up as it cooks.", "حمّر الديك الرومي المفروم مع {sp} في مقلاة غير لاصقة 6–7 دقائق مع تفتيته أثناء الطهي."],
    fish: ["Season the {p} with salt, pepper and {sp}. Pan-sear 3 minutes per side until it flakes easily.", "تبّل {pa} بالملح والفلفل و{sp}. حمّره 3 دقائق لكل جانب حتى يتفتت بسهولة."],
    shrimp: ["Season the shrimp with {sp}. Sear 2 minutes per side until pink and curled.", "تبّل الجمبري بـ{sp}. حمّره دقيقتين لكل جانب حتى يحمرّ ويلتف."],
    tofu: ["Press the {p} for 10 minutes, cube it and pan-fry with {sp} until golden on all sides, about 8 minutes.", "اعصر {pa} 10 دقائق وقطّعه مكعبات ثم حمّره مع {sp} حتى يصبح ذهبياً من كل الجهات نحو 8 دقائق."],
    bean: ["Warm the cooked {p} with {sp} and a splash of water for 5 minutes.", "سخّن {pa} المطبوخ مع {sp} وقليل من الماء لمدة 5 دقائق."],
  };
  const sear = (k, c, lang) => { const tpl = SEAR[k] || SEAR[PROT[k].type]; return (lang ? tpl[1] : tpl[0]).replace("{sp}", lang ? c.spa : c.sp).replace("{p}", c.p.l).replace("{pa}", c.p.ad); };
  const BAKE = {
    chicken: ["25–30 minutes until the chicken reaches 75 °C / 165 °F", "25–30 دقيقة حتى تصل حرارة الدجاج إلى 75 °م"],
    beef: ["20–25 minutes, turning once, until browned", "20–25 دقيقة مع التقليب مرة حتى يحمرّ"],
    lamb: ["25 minutes, turning once, until browned and tender", "25 دقيقة مع التقليب مرة حتى يحمرّ ويلين"],
    turkey: ["18–20 minutes (shape the turkey into patties first)", "18–20 دقيقة (شكّل الديك الرومي أقراصاً أولاً)"],
    fish: ["12–15 minutes until the fish flakes easily", "12–15 دقيقة حتى يتفتت السمك بسهولة"],
    shrimp: ["8–10 minutes until pink", "8–10 دقائق حتى يحمرّ"],
    tofu: ["20–25 minutes, turning once, until golden", "20–25 دقيقة مع التقليب مرة حتى يصبح ذهبياً"],
    bean: ["20 minutes, shaking the tray once, until the edges crisp", "20 دقيقة مع رجّ الصينية مرة حتى تتقرمش الأطراف"],
  };
  const bake = (k, lang) => { const t = BAKE[k] || BAKE[PROT[k].type]; return t[lang ? 1 : 0]; };
  const STEW = { chicken: ["20 minutes", "20 دقيقة"], beef: ["35 minutes", "35 دقيقة"], lamb: ["40 minutes", "40 دقيقة"], turkey: ["20 minutes", "20 دقيقة"], fish: ["8 minutes", "8 دقائق"], shrimp: ["4 minutes", "4 دقائق"], tofu: ["10 minutes", "10 دقائق"], bean: ["12 minutes", "12 دقيقة"] };
  const stewMin = (c, L) => (STEW[c.pk] || STEW[c.p.type])[L];

  // ---- format step builders: (c, lang) -> [steps] ----
  const FMT = {
    stirfry: (c, L) => L ? [sear(c.pk, c, 1), `قلّب ${c.v1d} و${c.v2d} في الزيت 4–5 دقائق مع ${c.spa}.`, `أعد ${c.p.ad} إلى المقلاة وأضف رشة ماء وقلّب دقيقة.`, `قدّمه فوق ${c.b.ad}.`]
      : [sear(c.pk, c, 0), `Stir-fry the ${c.v1} and ${c.v2} in the oil for 4–5 minutes with ${c.sp}.`, `Return the ${c.p.l} to the pan, add a splash of water and toss for 1 minute.`, `Serve over the ${c.b.l}.`],
    bake: (c, L) => { const roast = c.bk === "potato" || c.bk === "sweetpotato";
      return L ? [`سخّن الفرن إلى 200 °م. قلّب ${c.v1d} و${c.v2d}${roast ? ` و${c.b.ad} المقطع مكعبات` : ""} في صينية مع الزيت والملح والفلفل و${c.spa}.`, `أضف ${c.p.ad} إلى الصينية واخبزها ${bake(c.pk, 1)}.`, roast ? `قدّمه ساخناً مع الخضار.` : `سخّن ${c.b.ad} وقدّم الصينية فوقه.`]
        : [`Heat the oven to 200 °C / 400 °F. Toss the ${c.v1}${roast ? `, ${c.v2} and cubed ${c.b.l}` : ` and ${c.v2}`} on a tray with the oil, salt, pepper and ${c.sp}.`, `Add the ${c.p.l} to the tray and bake ${bake(c.pk, 0)}.`, roast ? `Serve hot with the roasted vegetables.` : `Warm the ${c.b.l} and serve the tray over it.`]; },
    bowl: (c, L) => L ? [sear(c.pk, c, 1), `سخّن ${c.b.ad} واسلق ${c.v1d} و${c.v2d} بالبخار أو حمّرهما 4 دقائق.`, `رتّب ${c.b.ad} في وعاء وضع فوقه ${c.p.ad} والخضار.`, `زيّنه بـ${c.s.ad} وقطرة زيت.`]
      : [sear(c.pk, c, 0), `Warm the ${c.b.l} and steam or sauté the ${c.v1} and ${c.v2} for 4 minutes.`, `Build the bowl with the ${c.b.l} at the base, then the ${c.p.l} and vegetables.`, `Top with the ${c.s.l} and a drizzle of oil.`],
    stew: (c, L) => L ? [`قلّب البصل والطماطم في الزيت مع ${c.spa} لمدة 5 دقائق.`, `أضف ${c.v1d} و${c.v2d} و200 مل ماء واتركها تغلي بهدوء 10 دقائق.`, `أضف ${c.p.ad} واطبخ ${stewMin(c, 1)} حتى ينضج.`, `قدّمها مع ${c.b.ad}.`]
      : [`Soften the onion and tomato in the oil with ${c.sp} for 5 minutes.`, `Add the ${c.v1}, ${c.v2} and 200 ml water; simmer 10 minutes.`, `Add the ${c.p.l} and cook ${stewMin(c, 0)} until done.`, `Serve with the ${c.b.l}.`],
    wrap: (c, L) => L ? [sear(c.pk, c, 1), `قطّع ${c.v1d} و${c.v2d} شرائح رفيعة.`, `افرد ${c.s.ad} على ${c.w.a} وأضف ${c.p.ad} والخضار.`, `لفّه بإحكام وسخّنه في المقلاة دقيقة لكل جانب.`]
      : [sear(c.pk, c, 0), `Slice the ${c.v1} and ${c.v2} thinly.`, `Spread the ${c.s.l} over the ${c.w.l} and add the ${c.p.l} and vegetables.`, `Roll tightly and toast in the pan for a minute per side.`],
    salad: (c, L) => L ? [sear(c.pk, c, 1), `قطّع ${c.v1d} و${c.v2d} وضعهما مع الخضار الورقية و${c.b.ad} في وعاء.`, `ضع ${c.p.ad} فوق السلطة.`, `تبّل بالزيت والليمون والملح والفلفل وقدّمها مع ${c.s.ad}.`]
      : [sear(c.pk, c, 0), `Chop the ${c.v1} and ${c.v2} and combine with the salad greens and ${c.b.l} in a bowl.`, `Top with the ${c.p.l}.`, `Dress with the oil, lemon, salt and pepper and serve with the ${c.s.l}.`],
    curry: (c, L) => L ? [`قلّب البصل في الزيت مع ${c.spa} لمدة 4 دقائق.`, `أضف ${c.v1d} و${c.v2d} والطماطم وحليب جوز الهند واتركها تغلي 8 دقائق.`, `أضف ${c.p.ad} واطبخ ${stewMin(c, 1)} حتى ينضج.`, `قدّم الكاري فوق ${c.b.ad}.`]
      : [`Soften the onion in the oil with ${c.sp} for 4 minutes.`, `Add the ${c.v1}, ${c.v2}, tomato and coconut milk and simmer 8 minutes.`, `Add the ${c.p.l} and cook ${stewMin(c, 0)} until done.`, `Serve the curry over the ${c.b.l}.`],
    pasta: (c, L) => L ? [`اسلق المعكرونة حسب التعليمات وصفّها.`, sear(c.pk, c, 1), `أضف ${c.v1d} و${c.v2d} والطماطم المقطعة مع ${c.spa} واتركها 8 دقائق.`, `أضف المعكرونة وقلّب حتى تتغطى بالصلصة.`]
      : [`Cook the pasta according to the packet and drain.`, sear(c.pk, c, 0), `Add the ${c.v1}, ${c.v2} and chopped tomato with ${c.sp} and simmer 8 minutes.`, `Toss in the pasta until coated in the sauce.`],
    soup: (c, L) => L ? [`قلّب البصل في الزيت 4 دقائق مع ${c.spa}.`, `أضف ${c.v1d} و${c.v2d} والطماطم و500 مل ماء أو مرق واتركها تغلي 12 دقيقة.`, `أضف ${c.p.ad} واطبخ ${stewMin(c, 1)}، ثم أضف ${c.b.ad}.`, `تبّل بالملح والفلفل وقدّمها ساخنة.`]
      : [`Soften the onion in the oil with ${c.sp} for 4 minutes.`, `Add the ${c.v1}, ${c.v2}, tomato and 500 ml water or stock; simmer 12 minutes.`, `Add the ${c.p.l} and cook ${stewMin(c, 0)}, then stir in the ${c.b.l}.`, `Season with salt and pepper and serve hot.`],
  };
  const FMT_NAME_BASE = { stirfry: 1, bake: 0, bowl: 1, stew: 1, curry: 1, salad: 0, wrap: 0, pasta: 0, soup: 0 }; // append "with {base}" in the name
  const FMT_EMOJI = { stirfry: "🥘", bake: "🍗", bowl: "🥣", stew: "🍲", wrap: "🌯", salad: "🥗", curry: "🍛", pasta: "🍝", soup: "🍜" };
  const FMT_TIME = { stirfry: 25, bake: 40, bowl: 25, stew: 40, wrap: 20, salad: 20, curry: 35, pasta: 30, soup: 35 };

  // ---- cuisines ----
  // f = formats: [format, noun EN, noun AR, meals]; b = carb options; v = vegetables; s = sauces; w = wrap bread
  const C = {
    italian: { en: "Italian", ar: "إيطالي", sty: "على الطريقة الإيطالية", adj: ["Tuscan", "Roman", "Sicilian", "Garlic-Herb", "Tomato-Basil", "Lemon-Oregano"],
      sp: ["garlic, oregano and basil", "rosemary, garlic and chili flakes", "thyme, garlic and black pepper"], spa: ["الثوم والأوريغانو والريحان", "إكليل الجبل والثوم والفلفل الحار", "الزعتر والثوم والفلفل الأسود"],
      v: ["tomato", "zucchini", "spinach", "mushrooms", "eggplant", "pepper", "asparagus", "broccoli", "kale", "greenbeans", "peas"], b: ["potato", "quinoa", "couscous", "rice"], s: ["parmesan", "avocado"], w: "pita",
      f: [["pasta", "Pasta", "معكرونة", "lunch,dinner"], ["bake", "Bake", "فرن", "dinner"], ["soup", "Soup", "شوربة", "lunch"], ["salad", "Salad", "سلطة", "lunch"], ["stew", "Stew", "يخنة", "dinner"]],
      egg: { n: ["Frittata", "فريتاتا"], cheese: "parmesan", base: "bread" } },
    mexican: { en: "Mexican", ar: "مكسيكي", sty: "على الطريقة المكسيكية", adj: ["Smoky", "Smoky Chili", "Lime-Cilantro", "Fajita-Style", "Cumin-Spiced", "Baja"],
      sp: ["cumin, smoked paprika and chili powder", "cumin, oregano and garlic", "chili, coriander and lime"], spa: ["الكمون والبابريكا المدخنة ومسحوق الفلفل الحار", "الكمون والأوريغانو والثوم", "الفلفل الحار والكزبرة والليمون"],
      v: ["pepper", "tomato", "corn", "onion", "zucchini", "cabbage", "cauliflower", "greenbeans", "squash"].filter((x) => x !== "onion"), b: ["rice", "sweetpotato", "quinoa", "potato"], s: ["avocado", "yogurt"], w: "tortilla",
      f: [["bowl", "Burrito Bowl", "وعاء بوريتو", "lunch,dinner"], ["wrap", "Tacos", "تاكو", "lunch,dinner"], ["stew", "Chili", "تشيلي", "dinner"], ["salad", "Taco Salad", "سلطة تاكو", "lunch"], ["bake", "Fajita Tray Bake", "صينية فاهيتا", "dinner"]],
      egg: { n: ["Huevos Scramble", "بيض مخفوق مكسيكي"], cheese: "avocado", base: "tortilla" } },
    indian: { en: "Indian", ar: "هندي", sty: "على الطريقة الهندية", adj: ["Masala", "Tikka-Style", "Tandoori-Spiced", "Korma-Style", "Jeera", "Madras"],
      sp: ["cumin, turmeric and garam masala", "coriander, turmeric and chili", "ginger, garlic and garam masala"], spa: ["الكمون والكركم وجارام ماسالا", "الكزبرة والكركم والفلفل الحار", "الزنجبيل والثوم وجارام ماسالا"],
      v: ["cauliflower", "spinach", "peas", "carrot", "eggplant", "okra", "tomato", "greenbeans", "pepper"], b: ["rice", "potato", "quinoa"], s: ["yogurt", "tahini"], w: "pita",
      f: [["curry", "Curry", "كاري", "lunch,dinner"], ["bowl", "Bowl", "وعاء", "lunch,dinner"], ["bake", "Tandoori-Style Bake", "مخبوز تندوري", "dinner"], ["soup", "Soup", "شوربة", "lunch"], ["stew", "Stew", "يخنة", "dinner"]],
      egg: { n: ["Masala Omelette", "عجة ماسالا"], cheese: null, base: "bread" } },
    chinese: { en: "Chinese", ar: "صيني", sty: "على الطريقة الصينية", adj: ["Ginger-Garlic", "Szechuan-Style", "Sesame-Soy", "Five-Spice", "Kung Pao-Style", "Hoisin-Style"],
      sp: ["ginger, garlic and a splash of soy sauce", "garlic, white pepper and soy sauce", "ginger, five-spice and soy sauce"], spa: ["الزنجبيل والثوم ورشة صلصة صويا", "الثوم والفلفل الأبيض وصلصة الصويا", "الزنجبيل وخمسة بهارات وصلصة الصويا"],
      v: ["broccoli", "cabbage", "carrot", "mushrooms", "greenbeans", "pepper", "peas", "cauliflower", "zucchini"], b: ["rice", "ricenoodles", "quinoa"], s: ["tahini", "avocado"], w: "tortilla",
      f: [["stirfry", "Stir-fry", "مقلّب", "lunch,dinner"], ["bowl", "Bowl", "وعاء", "lunch,dinner"], ["soup", "Soup", "شوربة", "lunch"], ["salad", "Noodle Salad", "سلطة نودلز", "lunch"], ["stew", "Braise", "يخنة", "dinner"]],
      egg: { n: ["Egg Stir-fry", "بيض مقلّب"], cheese: null, base: "rice" } },
    japanese: { en: "Japanese", ar: "ياباني", sty: "على الطريقة اليابانية", adj: ["Teriyaki-Style", "Soy-Glazed", "Yakitori-Style", "Ginger-Soy", "Sesame", "Katsu-Free"].filter((x) => x !== "Katsu-Free"),
      sp: ["ginger, garlic and soy sauce", "soy sauce, ginger and a pinch of sesame", "garlic, ginger and rice vinegar"], spa: ["الزنجبيل والثوم وصلصة الصويا", "صلصة الصويا والزنجبيل وقليل من السمسم", "الثوم والزنجبيل وخل الأرز"],
      v: ["mushrooms", "cabbage", "carrot", "spinach", "asparagus", "greenbeans", "eggplant", "cucumber", "broccoli"], b: ["rice", "soba", "quinoa"], s: ["tahini", "avocado"], w: "tortilla",
      f: [["bowl", "Donburi-Style Bowl", "وعاء على طريقة الدونبوري", "lunch,dinner"], ["stirfry", "Stir-fry", "مقلّب", "dinner"], ["soup", "Soup", "شوربة", "lunch"], ["salad", "Soba Salad", "سلطة سوبا", "lunch"], ["bake", "Sheet-Pan Bake", "مخبوز في الصينية", "dinner"]],
      egg: { n: ["Tamagoyaki-Style Omelette", "عجة على طريقة تاماغوياكي"], cheese: null, base: "rice" } },
    thai: { en: "Thai", ar: "تايلندي", sty: "على الطريقة التايلندية", adj: ["Basil", "Lemongrass", "Red Chili", "Green Chili", "Lime-Chili", "Ginger-Lime"],
      sp: ["garlic, chili and basil", "lemongrass, ginger and chili", "lime, garlic and coriander"], spa: ["الثوم والفلفل الحار والريحان", "عشبة الليمون والزنجبيل والفلفل الحار", "الليمون والثوم والكزبرة"],
      v: ["broccoli", "pepper", "greenbeans", "cabbage", "carrot", "eggplant", "mushrooms", "zucchini", "peas"], b: ["rice", "ricenoodles", "quinoa"], s: ["avocado", "tahini"], w: "tortilla",
      f: [["stirfry", "Stir-fry", "مقلّب", "lunch,dinner"], ["curry", "Curry", "كاري", "lunch,dinner"], ["bowl", "Bowl", "وعاء", "lunch,dinner"], ["soup", "Soup", "شوربة", "lunch"], ["salad", "Noodle Salad", "سلطة نودلز", "lunch"]],
      egg: { n: ["Thai-Style Omelette", "عجة على الطريقة التايلندية"], cheese: null, base: "rice" } },
    greek: { en: "Greek", ar: "يوناني", sty: "على الطريقة اليونانية", adj: ["Lemon-Oregano", "Santorini", "Athenian", "Olive-Herb", "Aegean", "Garlic-Lemon"],
      sp: ["oregano, garlic and lemon", "oregano, thyme and black pepper", "dill, garlic and lemon"], spa: ["الأوريغانو والثوم والليمون", "الأوريغانو والزعتر والفلفل الأسود", "الشبت والثوم والليمون"],
      v: ["tomato", "cucumber", "zucchini", "eggplant", "spinach", "pepper", "greenbeans", "kale", "asparagus"], b: ["potato", "rice", "couscous", "bulgur", "quinoa"], s: ["feta", "yogurt"], w: "pita",
      f: [["bake", "Tray Bake", "مخبوز في الصينية", "dinner"], ["salad", "Salad", "سلطة", "lunch"], ["wrap", "Gyro Wrap", "لفافة جيرو", "lunch,dinner"], ["stew", "Stew", "يخنة", "dinner"], ["bowl", "Bowl", "وعاء", "lunch,dinner"]],
      egg: { n: ["Omelette", "عجة"], cheese: "feta", base: "bread" } },
    turkish: { en: "Turkish", ar: "تركي", sty: "على الطريقة التركية", adj: ["Anatolian", "Izmir-Style", "Aegean", "Sumac", "Istanbul", "Pul Biber"],
      sp: ["paprika, cumin and mint", "sumac, garlic and pepper flakes", "oregano, paprika and garlic"], spa: ["البابريكا والكمون والنعناع", "السماق والثوم وشرائح الفلفل", "الأوريغانو والبابريكا والثوم"],
      v: ["eggplant", "pepper", "tomato", "zucchini", "spinach", "greenbeans", "okra", "carrot", "cauliflower"], b: ["bulgur", "rice", "potato", "freekeh", "couscous"], s: ["yogurt", "hummus", "labneh"], w: "pita",
      f: [["bake", "Tray Bake", "مخبوز في الصينية", "dinner"], ["stew", "Stew", "يخنة", "dinner"], ["wrap", "Wrap", "لفافة", "lunch,dinner"], ["bowl", "Bowl", "وعاء", "lunch,dinner"], ["soup", "Soup", "شوربة", "lunch"]],
      egg: { n: ["Menemen-Style Scramble", "بيض مخفوق على طريقة المنمن"], cheese: "feta", base: "bread" } },
    moroccan: { en: "Moroccan", ar: "مغربي", sty: "على الطريقة المغربية", adj: ["Chermoula", "Ras el Hanout", "Harissa", "Saffron-Spiced", "Preserved-Lemon-Style", "Marrakesh"],
      sp: ["cumin, coriander and cinnamon", "paprika, ginger and turmeric", "ras el hanout and garlic"], spa: ["الكمون والكزبرة والقرفة", "البابريكا والزنجبيل والكركم", "راس الحانوت والثوم"],
      v: ["carrot", "zucchini", "tomato", "pepper", "squash", "eggplant", "peas", "cauliflower", "spinach"], b: ["couscous", "bulgur", "rice", "quinoa"], s: ["yogurt", "hummus", "tahini"], w: "pita",
      f: [["stew", "Tagine-Style Stew", "يخنة على طريقة الطاجين", "dinner"], ["bowl", "Couscous Bowl", "وعاء كسكسي", "lunch,dinner"], ["bake", "Tray Bake", "مخبوز في الصينية", "dinner"], ["soup", "Soup", "شوربة", "lunch"], ["salad", "Salad", "سلطة", "lunch"]],
      egg: { n: ["Egg Tagine", "طاجين البيض"], cheese: null, base: "bread" } },
    korean: { en: "Korean", ar: "كوري", sty: "على الطريقة الكورية", adj: ["Gochujang", "Bulgogi-Style", "Kimchi-Free Spicy", "Sesame-Garlic", "Soy-Garlic", "Ginger-Chili"].map((x) => (x === "Kimchi-Free Spicy" ? "Spicy" : x)),
      sp: ["garlic, ginger and chili flakes", "soy sauce, garlic and a pinch of sesame", "ginger, garlic and soy sauce"], spa: ["الثوم والزنجبيل وشرائح الفلفل الحار", "صلصة الصويا والثوم وقليل من السمسم", "الزنجبيل والثوم وصلصة الصويا"],
      v: ["cabbage", "spinach", "carrot", "mushrooms", "zucchini", "greenbeans", "cauliflower", "pepper"], b: ["rice", "soba", "ricenoodles", "sweetpotato"], s: ["tahini", "avocado"], w: "tortilla",
      f: [["bowl", "Bibimbap-Style Bowl", "وعاء على طريقة البيبمباب", "lunch,dinner"], ["stirfry", "Stir-fry", "مقلّب", "lunch,dinner"], ["soup", "Soup", "شوربة", "lunch"], ["bake", "Sheet-Pan Bake", "مخبوز في الصينية", "dinner"], ["wrap", "Wrap", "لفافة", "lunch"]],
      egg: { n: ["Rolled Omelette", "عجة ملفوفة"], cheese: null, base: "rice" } },
    french: { en: "French", ar: "فرنسي", sty: "على الطريقة الفرنسية", adj: ["Provençal", "Herbes de Provence", "Lyonnaise-Style", "Dijon", "Bistro", "Garlic-Thyme"],
      sp: ["thyme, garlic and black pepper", "herbes de Provence and garlic", "tarragon, garlic and lemon"], spa: ["الزعتر والثوم والفلفل الأسود", "أعشاب بروفانس والثوم", "الطرخون والثوم والليمون"],
      v: ["greenbeans", "mushrooms", "carrot", "asparagus", "spinach", "zucchini", "peas", "tomato", "eggplant"], b: ["potato", "quinoa", "couscous", "rice"], s: ["yogurt", "parmesan"], w: "pita",
      f: [["bake", "Roast", "مشوي", "dinner"], ["stew", "Ragout", "راغو", "dinner"], ["soup", "Soup", "شوربة", "lunch"], ["salad", "Salad", "سلطة", "lunch"], ["bowl", "Bowl", "وعاء", "lunch,dinner"]],
      egg: { n: ["Herb Omelette", "عجة بالأعشاب"], cheese: null, base: "bread" } },
    spanish: { en: "Spanish", ar: "إسباني", sty: "على الطريقة الإسبانية", adj: ["Andalusian", "Smoked Paprika", "Catalan", "Saffron", "Valencian", "Garlic-Paprika"],
      sp: ["smoked paprika, garlic and parsley", "paprika, saffron and garlic", "garlic, cumin and smoked paprika"], spa: ["البابريكا المدخنة والثوم والبقدونس", "البابريكا والزعفران والثوم", "الثوم والكمون والبابريكا المدخنة"],
      v: ["pepper", "tomato", "zucchini", "peas", "asparagus", "eggplant", "greenbeans", "mushrooms", "carrot"], b: ["rice", "potato", "quinoa", "couscous"], s: ["yogurt", "avocado"], w: "pita",
      f: [["bowl", "Bowl", "وعاء", "lunch,dinner"], ["bake", "Tray Bake", "مخبوز في الصينية", "dinner"], ["stew", "Stew", "يخنة", "dinner"], ["salad", "Salad", "سلطة", "lunch"], ["soup", "Soup", "شوربة", "lunch"]],
      egg: { n: ["Potato Tortilla-Style Omelette", "عجة على طريقة التورتيّا الإسبانية"], cheese: null, base: "potato" } },
    american: { en: "American", ar: "أمريكي", sty: "على الطريقة الأمريكية", adj: ["BBQ-Style", "Cajun-Spiced", "Southwest", "Garlic-Herb", "Smoky", "Backyard"],
      sp: ["smoked paprika, garlic and onion powder", "paprika, garlic and black pepper", "chili powder, cumin and garlic"], spa: ["البابريكا المدخنة والثوم ومسحوق البصل", "البابريكا والثوم والفلفل الأسود", "مسحوق الفلفل الحار والكمون والثوم"],
      v: ["broccoli", "corn", "carrot", "greenbeans", "cauliflower", "peas", "pepper", "tomato", "kale", "squash"], b: ["potato", "sweetpotato", "rice", "quinoa"], s: ["avocado", "yogurt"], w: "tortilla",
      f: [["bake", "Sheet-Pan Dinner", "عشاء الصينية", "dinner"], ["bowl", "Bowl", "وعاء", "lunch,dinner"], ["wrap", "Wrap", "لفافة", "lunch"], ["stew", "Chili", "تشيلي", "dinner"], ["soup", "Soup", "شوربة", "lunch"], ["salad", "Salad", "سلطة", "lunch"]],
      egg: { n: ["Veggie Scramble", "بيض مخفوق بالخضار"], cheese: "parmesan", base: "bread" } },
    mediterranean: { en: "Mediterranean", ar: "متوسطي", sty: "على الطريقة المتوسطية", adj: ["Lemon-Herb", "Sun-Kissed", "Garlic-Olive", "Herbed", "Coastal", "Rosemary"],
      sp: ["oregano, garlic and lemon zest", "thyme, rosemary and garlic", "basil, garlic and black pepper"], spa: ["الأوريغانو والثوم وقشر الليمون", "الزعتر وإكليل الجبل والثوم", "الريحان والثوم والفلفل الأسود"],
      v: ["tomato", "cucumber", "eggplant", "zucchini", "pepper", "kale", "asparagus", "spinach", "greenbeans"], b: ["quinoa", "bulgur", "couscous", "potato", "freekeh"], s: ["hummus", "yogurt", "feta", "tahini"], w: "pita",
      f: [["bowl", "Bowl", "وعاء", "lunch,dinner"], ["bake", "Tray Bake", "مخبوز في الصينية", "dinner"], ["salad", "Salad", "سلطة", "lunch"], ["wrap", "Wrap", "لفافة", "lunch,dinner"], ["stew", "Stew", "يخنة", "dinner"]],
      egg: { n: ["Veggie Skillet Eggs", "بيض بالخضار في المقلاة"], cheese: "feta", base: "bread" } },
    arabic: { en: "Arabic", ar: "عربي", sty: "على الطريقة العربية", adj: ["Levantine", "Gulf-Style", "Egyptian-Style", "Shami", "Baharat", "Za'atar"],
      sp: ["cumin, coriander and baharat", "allspice, cinnamon and garlic", "cumin, paprika and lemon"], spa: ["الكمون والكزبرة والبهارات", "البهارات والقرفة والثوم", "الكمون والبابريكا والليمون"],
      v: ["eggplant", "okra", "tomato", "zucchini", "pepper", "spinach", "cauliflower", "carrot", "greenbeans", "peas"], b: ["rice", "bulgur", "freekeh", "couscous", "potato"], s: ["yogurt", "tahini", "hummus", "labneh"], w: "pita",
      f: [["bowl", "Bowl", "وعاء", "lunch,dinner"], ["stew", "Stew", "يخنة", "dinner"], ["wrap", "Shawarma Wrap", "لفافة شاورما", "lunch,dinner"], ["bake", "Tray Bake", "مخبوز في الصينية", "dinner"], ["salad", "Salad", "سلطة", "lunch"], ["soup", "Soup", "شوربة", "lunch"]],
      egg: { n: ["Egg & Veggie Skillet", "بيض بالخضار في المقلاة"], cheese: "labneh", base: "pita" } },
  };
  window.CUISINES = [{ id: "everyday", en: "Everyday", ar: "منزلي يومي" }, ...Object.entries(C).map(([id, c]) => ({ id, en: c.en, ar: c.ar }))];

  // ---- diet detection ----
  const ANIMAL = new Set(["chicken", "beef", "lamb", "turkey", "salmon", "cod", "tilapia", "shrimp", "tuna", "sardines", "pork", "deli"]);
  const DAIRY = new Set(["egg", "yogurt", "feta", "parmesan", "labneh", "mozzarella", "cottage", "ricotta", "milk", "whey", "honey"]);
  const dietOf = (ing) => (ing.some(([k]) => ANIMAL.has(k)) ? "any" : ing.some(([k]) => DAIRY.has(k)) ? "veg" : "vegan");
  const merge = (ing) => { const m = {}; ing.forEach(([k, g]) => (m[k] = (m[k] || 0) + g)); return Object.entries(m).map(([k, g]) => [k, Math.round(g)]); };
  const kcalOf = (ing) => ing.reduce((a, [k, g]) => a + INGREDIENTS[k].v[0] * g * (INGREDIENTS[k].d || 1) / 100, 0);
  // Keep portions in a realistic range by nudging the carb/base amount.
  function balance(ing, baseKey, lo, hi) {
    for (let i = 0; i < 4; i++) {
      const k = kcalOf(ing);
      const row = ing.find(([x]) => x === baseKey);
      if (!row) return;
      if (k > hi && row[1] > 60) row[1] = Math.round(row[1] * 0.8);
      else if (k < lo && row[1] < 300) row[1] = Math.round(row[1] * 1.25);
      else return;
    }
  }

  const out = [];
  const names = new Set();
  let n = 0;
  const add = (r) => { if (names.has(r.name)) return false; names.add(r.name); r.id = "g" + (n++); r.gen = true; out.push(r); return true; };
  const hash = (...a) => a.join("|").split("").reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

  // ---- main dishes (lunch + dinner) ----
  const mains = [];
  for (const [cid, c] of Object.entries(C)) {
    for (const [fmt, nounEn, nounAr, meals] of c.f) {
      for (const pk of Object.keys(PROT)) {
        for (const v1 of c.v) for (const v2 of c.v) {
          if (v1 === v2 || (fmt === "stew" || fmt === "curry" || fmt === "soup" || fmt === "pasta") && (v1 === "tomato" || v2 === "tomato")) continue;
          const bases = fmt === "pasta" ? ["pasta"] : c.b;
          for (const bk of bases) mains.push({ cid, fmt, nounEn, nounAr, meals: meals.split(","), pk, v1, v2, bk });
        }
      }
    }
  }
  // choose a balanced sample: shuffle, then round-robin across cuisine x meal
  const want = { lunch: 1900, dinner: 1900 };
  const byBucket = {};
  shuffle(mains).forEach((m) => { (byBucket[m.cid] = byBucket[m.cid] || []).push(m); });
  const cids = Object.keys(byBucket);
  const count = { lunch: 0, dinner: 0 };
  let guard = 0;
  while ((count.lunch < want.lunch || count.dinner < want.dinner) && guard++ < 200000) {
    let progress = false;
    for (const cid of cids) {
      const m = byBucket[cid].pop();
      if (!m) continue;
      progress = true;
      const c = C[cid], p = PROT[m.pk], b = BASE[m.bk];
      const meal = m.meals.length === 1 ? m.meals[0] : (count.lunch - want.lunch < count.dinner - want.dinner ? "lunch" : "dinner");
      if (count[meal] >= want[meal]) continue;
      const si = hash(cid, m.fmt, m.pk, m.v1, m.v2) % c.sp.length;
      const sk = c.s[hash(m.pk, m.v1, cid) % c.s.length], S = SAUCE[sk];
      const adj = c.adj[hash(cid, m.fmt, m.pk, m.v1) % c.adj.length];
      const wk = c.w, W = wk === "pita" ? { l: "whole-wheat pita", a: "خبز البيتا" } : { l: "whole-wheat tortilla", a: "خبز التورتيلا" };
      const V1 = VEG[m.v1], V2 = VEG[m.v2];
      let ing;
      const soy = ["chinese", "japanese", "korean", "thai"].includes(cid) && ["stirfry", "bowl", "soup", "salad", "stew", "bake"].includes(m.fmt) ? [["soy", 10]] : [];
      switch (m.fmt) {
        case "stirfry": ing = [[m.pk, p.g], [m.v1, 120], [m.v2, 80], [m.bk, b.g], ["oil", 8], ...soy]; break;
        case "bake": ing = [[m.pk, p.g], [m.v1, 150], [m.v2, 100], [m.bk, Math.min(b.g, 200)], ["oil", 8], ...soy]; break;
        case "bowl": ing = [[m.pk, p.g], [m.v1, 100], [m.v2, 80], [m.bk, b.g], [sk, S[2]], ["oil", 6], ...soy]; break;
        case "stew": ing = [[m.pk, p.g], [m.v1, 120], [m.v2, 80], ["tomato", 120], ["onion", 40], [m.bk, Math.min(b.g, 120)], ["oil", 6], ...soy]; break;
        case "wrap": ing = [[m.pk, Math.round(p.g * 0.85)], [m.v1, 70], [m.v2, 50], [wk, 60], [sk, S[2]], ["greens", 20], ["oil", 4]]; break;
        case "salad": ing = [[m.pk, p.g], [m.v1, 100], [m.v2, 80], ["greens", 50], [m.bk, Math.min(b.g, 100)], [sk, S[2]], ["oil", 10], ["lemon", 15], ...soy]; break;
        case "curry": ing = [[m.pk, p.g], [m.v1, 120], [m.v2, 80], ["coconut", 100], ["tomato", 100], ["onion", 40], [m.bk, Math.min(b.g, 130)], ["oil", 4]]; break;
        case "pasta": ing = [[m.pk, p.g], [m.v1, 100], [m.v2, 80], ["tomato", 150], ["pasta", 170], ["oil", 8], ...(cid === "italian" ? [["parmesan", 10]] : [])]; break;
        case "soup": ing = [[m.pk, Math.round(p.g * 0.8)], [m.v1, 120], [m.v2, 100], ["tomato", 100], ["onion", 40], [m.bk, 70], ["oil", 6], ...soy]; break;
      }
      ing = merge(ing);
      balance(ing, m.fmt === "wrap" ? wk : m.bk, 380, 720);
      const ctx = { bk: m.bk, pk: m.pk, p: { ...p }, v1: V1[1], v2: V2[1], v1a: V1[2], v2a: V2[2], v1d: V1[3], v2d: V2[3], b: { l: b.l, a: b.a, ad: b.ad }, w: W, s: { l: S[0].toLowerCase(), a: S[1], ad: S[3] }, sp: c.sp[si], spa: c.spa[si] };
      const baseName = FMT_NAME_BASE[m.fmt] ? ` with ${b.n}` : "";
      const name = `${adj} ${p.n}, ${V1[0]} & ${V2[0]} ${m.nounEn}${baseName}`;
      const ar = `${m.nounAr} ${p.a} و${V1[2]} و${V2[2]} ${c.sty}${FMT_NAME_BASE[m.fmt] ? " مع " + b.a : ""}`;
      const rec = { name, ar, meal, diet: dietOf(ing), time: FMT_TIME[m.fmt], emoji: FMT_EMOJI[m.fmt], cuisine: cid, ing,
        stepsFn: (L) => FMT[m.fmt](ctx, L === "ar" ? 1 : 0) };
      if (add(rec)) count[meal]++;
    }
    if (!progress) break;
  }

  // ---- breakfasts ----
  const FRUIT = { banana: ["Banana", "موز"], apple: ["Apple", "تفاح"], blueberries: ["Blueberry", "توت أزرق"], strawberries: ["Strawberry", "فراولة"], raspberries: ["Raspberry", "توت العليق"], mango: ["Mango", "مانجو"], pineapple: ["Pineapple", "أناناس"], orange: ["Orange", "برتقال"] };
  const FRG = { banana: 120, apple: 150, blueberries: 80, strawberries: 100, raspberries: 80, mango: 100, pineapple: 100, orange: 150 };
  const NUT = { almonds: ["Almond", "لوز", 15], walnuts: ["Walnut", "عين الجمل", 15], cashews: ["Cashew", "كاجو", 15], pumpkinseeds: ["Pumpkin Seed", "بذور القرع", 15], chia: ["Chia", "بذور الشيا", 12], flax: ["Flax", "بذور الكتان", 10], pb: ["Peanut Butter", "زبدة الفول السوداني", 20] };
  const bf = [];
  // egg dishes per cuisine
  for (const [cid, c] of Object.entries(C)) {
    for (const v1 of c.v) for (const v2 of c.v) {
      if (v1 === v2) continue;
      bf.push({ kind: "egg", cid, v1, v2 });
    }
  }
  for (const y of ["yogurt", "cottage", "ricotta", "labneh"]) for (const f1 of Object.keys(FRUIT)) for (const f2 of Object.keys(FRUIT)) {
    if (f1 >= f2) continue;
    for (const nk of Object.keys(NUT)) bf.push({ kind: "dairy", y, f1, f2, nk });
  }
  for (const f1 of Object.keys(FRUIT)) for (const nk of Object.keys(NUT)) for (const milk of ["milk", "soymilk"]) bf.push({ kind: "oats", f1, nk, milk });
  for (const top of ["avocado", "cottage", "hummus", "pb", "labneh", "ricotta"]) for (const f1 of [...Object.keys(FRUIT), "tomato", "cucumber"]) for (const bk of ["bread", "pita"]) bf.push({ kind: "toast", top, f1, bk });
  let nb = 0;
  for (const m of shuffle(bf)) {
    if (nb >= 800) break;
    let rec;
    if (m.kind === "egg") {
      const c = C[m.cid], V1 = VEG[m.v1], V2 = VEG[m.v2], bk = c.egg.base;
      const baseG = bk === "rice" ? 120 : bk === "potato" ? 150 : 60, baseL = bk === "rice" ? "brown rice" : bk === "potato" ? "potatoes" : bk === "tortilla" ? "tortilla" : bk === "pita" ? "pita" : "whole-wheat toast";
      const baseA = bk === "rice" ? "أرز" : bk === "potato" ? "بطاطس" : bk === "tortilla" ? "تورتيلا" : bk === "pita" ? "خبز بيتا" : "توست";
      const cheese = c.egg.cheese && SAUCE[c.egg.cheese];
      const ing = merge([["egg", 150], [m.v1, 90], [m.v2, 60], [bk, baseG], ["oil", 6], ...(c.egg.cheese ? [[c.egg.cheese, SAUCE[c.egg.cheese][2]]] : [])]);
      const si = hash(m.cid, m.v1, m.v2) % c.sp.length;
      rec = { name: `${C[m.cid].adj[hash(m.cid, m.v1, m.v2) % c.adj.length]} ${V1[0]} & ${V2[0]} ${c.egg.n[0]}`, ar: `${c.egg.n[1]} ${V1[2]} و${V2[2]} ${c.sty}`, meal: "breakfast", diet: dietOf(ing), time: 15, emoji: "🍳", cuisine: m.cid, ing,
        stepsFn: (L) => (L === "ar" ? [`قلّب ${V1[3]} و${V2[3]} في الزيت 3–4 دقائق مع ${c.spa[si]}.`, `اخفق البيض واسكبه في المقلاة واطبخه برفق حتى يتماسك${cheese ? ` ثم أضف ${cheese[3]}` : ""}.`, `قدّمه مع ${baseA}.`]
          : [`Sauté the ${V1[1]} and ${V2[1]} in the oil for 3–4 minutes with ${c.sp[si]}.`, `Beat the eggs, pour them into the pan and cook gently until set${cheese ? `, then add the ${cheese[0].toLowerCase()}` : ""}.`, `Serve with the ${baseL}.`]) };
    } else if (m.kind === "dairy") {
      const [F1, F2, N] = [FRUIT[m.f1], FRUIT[m.f2], NUT[m.nk]];
      const Y = { yogurt: ["Greek Yogurt", "زبادي يوناني", 200], cottage: ["Cottage Cheese", "جبن قريش", 180], ricotta: ["Ricotta", "ريكوتا", 150], labneh: ["Labneh", "لبنة", 120] }[m.y];
      const ing = merge([[m.y, Y[2]], [m.f1, FRG[m.f1]], [m.f2, Math.round(FRG[m.f2] * 0.6)], [m.nk, N[2]], ["oats", 20]]);
      rec = { name: `${F1[0]} & ${F2[0]} ${Y[0]} Bowl with ${N[0]}`, ar: `وعاء ${Y[1]} مع ${F1[1]} و${F2[1]} و${N[1]}`, meal: "breakfast", diet: dietOf(ing), time: 5, emoji: "🥣", cuisine: "everyday", ing,
        stepsFn: (L) => (L === "ar" ? [`ضع ${Y[1]} في وعاء.`, `أضف ${F1[1]} و${F2[1]} المقطعين.`, `رشّ ${N[1]} والشوفان فوقها.`] : [`Spoon the ${Y[0].toLowerCase()} into a bowl.`, `Top with the sliced ${F1[0].toLowerCase()} and ${F2[0].toLowerCase()}.`, `Sprinkle over the ${N[0].toLowerCase()} and oats.`]) };
    } else if (m.kind === "oats") {
      const [F1, N] = [FRUIT[m.f1], NUT[m.nk]];
      const MK = m.milk === "milk" ? ["milk", "حليب", "Milk"] : ["soymilk", "حليب الصويا", "Soy Milk"];
      const ing = merge([["oats", 50], [m.milk, 200], [m.f1, FRG[m.f1]], [m.nk, N[2]]]);
      rec = { name: `${F1[0]} & ${N[0]} Oatmeal with ${MK[2]}`, ar: `شوفان مع ${MK[1]} و${F1[1]} و${N[1]}`, meal: "breakfast", diet: dietOf(ing), time: 10, emoji: "🥣", cuisine: "everyday", ing,
        stepsFn: (L) => (L === "ar" ? [`اطبخ الشوفان مع ${MK[1]} على نار هادئة 4–5 دقائق حتى يصبح كريمياً.`, `اسكبه في وعاء وأضف ${F1[1]} المقطع.`, `زيّنه بـ${N[1]}.`] : [`Simmer the oats with the ${MK[2].toLowerCase()} for 4–5 minutes until creamy.`, `Pour into a bowl and add the sliced ${F1[0].toLowerCase()}.`, `Top with the ${N[0].toLowerCase()}.`]) };
    } else {
      const TOP = { avocado: ["Avocado", "أفوكادو", 70], cottage: ["Cottage Cheese", "جبن قريش", 120], hummus: ["Hummus", "حمص", 60], pb: ["Peanut Butter", "زبدة الفول السوداني", 20], labneh: ["Labneh", "لبنة", 80], ricotta: ["Ricotta", "ريكوتا", 100] }[m.top];
      const isF = FRUIT[m.f1], F = isF || { tomato: ["Tomato", "طماطم"], cucumber: ["Cucumber", "خيار"] }[m.f1];
      const gram = isF ? FRG[m.f1] * 0.8 : 100;
      const BK = m.bk === "pita" ? ["Pita", "خبز بيتا", 60] : ["Toast", "توست", 60];
      const ing = merge([[m.bk, BK[2]], [m.top, TOP[2]], [m.f1, Math.round(gram)], ["oil", m.top === "pb" ? 0 : 3]].filter((x) => x[1] > 0));
      rec = { name: `${TOP[0]} & ${F[0]} ${BK[0]}`, ar: `${BK[1]} ${TOP[1]} مع ${F[1]}`, meal: "breakfast", diet: dietOf(ing), time: 5, emoji: "🍞", cuisine: m.top === "hummus" || m.top === "labneh" ? "arabic" : "everyday", ing,
        stepsFn: (L) => (L === "ar" ? [`حمّص ${BK[1]} أو سخّنه.`, `افرد ${TOP[1]} عليه.`, `زيّنه بشرائح ${F[1]} وقليل من الملح والفلفل.`] : [`Toast or warm the ${BK[0].toLowerCase()}.`, `Spread with the ${TOP[0].toLowerCase()}.`, `Top with sliced ${F[0].toLowerCase()} and a pinch of salt and pepper.`]) };
    }
    if (add(rec)) nb++;
  }

  // ---- snacks ----
  const sn = [];
  for (const f1 of Object.keys(FRUIT)) for (const nk of Object.keys(NUT)) sn.push({ k: "fn", f1, nk });
  for (const v of ["carrot", "cucumber", "pepper", "cauliflower", "greenbeans"]) for (const d of ["hummus", "yogurt", "tahini", "labneh", "avocado"]) sn.push({ k: "vd", v, d });
  for (const y of ["yogurt", "cottage", "ricotta", "labneh"]) for (const f1 of Object.keys(FRUIT)) sn.push({ k: "yf", y, f1 });
  for (const f1 of Object.keys(FRUIT)) for (const f2 of Object.keys(FRUIT)) if (f1 < f2) for (const nk of Object.keys(NUT)) sn.push({ k: "fn2", f1, f2, nk });
  for (const v1 of ["carrot", "cucumber", "pepper", "cauliflower", "greenbeans"]) for (const v2 of ["carrot", "cucumber", "pepper", "cauliflower", "greenbeans"]) if (v1 < v2) for (const d of ["hummus", "yogurt", "tahini", "labneh", "avocado"]) sn.push({ k: "vd2", v1, v2, d });
  for (const pk of ["chickpeas", "edamame", "lentils", "blackbeans", "whitebeans"]) for (const sp of [["Paprika", "بابريكا"], ["Cumin", "كمون"], ["Za'atar", "زعتر"], ["Garlic", "ثوم"], ["Chili-Lime", "فلفل حار وليمون"], ["Curry", "كاري"]]) sn.push({ k: "rb", pk, sp });
  for (const f1 of Object.keys(FRUIT)) for (const milk of ["milk", "soymilk"]) for (const pr of ["whey", "yogurt"]) sn.push({ k: "sh", f1, milk, pr });
  let ns = 0;
  for (const m of shuffle(sn)) {
    if (ns >= 400) break;
    let rec;
    if (m.k === "fn") {
      const [F, N] = [FRUIT[m.f1], NUT[m.nk]];
      const ing = merge([[m.f1, FRG[m.f1]], [m.nk, N[2] + 5]]);
      rec = { name: `${F[0]} with ${N[0]}`, ar: `${F[1]} مع ${N[1]}`, meal: "snack", diet: "vegan", time: 3, emoji: "🍎", cuisine: "everyday", ing,
        stepsFn: (L) => (L === "ar" ? [`قطّع ${F[1]} وقدّمه مع ${N[1]}.`] : [`Slice the ${F[0].toLowerCase()} and serve with the ${N[0].toLowerCase()}.`]) };
    } else if (m.k === "fn2") {
      const [F1, F2, N] = [FRUIT[m.f1], FRUIT[m.f2], NUT[m.nk]];
      const ing = merge([[m.f1, FRG[m.f1] * 0.7], [m.f2, FRG[m.f2] * 0.6], [m.nk, N[2] + 5]]);
      rec = { name: `${F1[0]} & ${F2[0]} Cup with ${N[0]}`, ar: `كوب ${F1[1]} و${F2[1]} مع ${N[1]}`, meal: "snack", diet: "vegan", time: 4, emoji: "🍓", cuisine: "everyday", ing,
        stepsFn: (L) => (L === "ar" ? [`قطّع ${F1[1]} و${F2[1]} في كوب.`, `رشّ ${N[1]} فوقها.`] : [`Dice the ${F1[0].toLowerCase()} and ${F2[0].toLowerCase()} into a cup.`, `Sprinkle with the ${N[0].toLowerCase()}.`]) };
    } else if (m.k === "vd2") {
      const [V1, V2] = [VEG[m.v1], VEG[m.v2]], D = { hummus: ["Hummus", "حمص", 60], yogurt: ["Yogurt Dip", "غموس الزبادي", 80], tahini: ["Tahini Dip", "غموس الطحينة", 25], labneh: ["Labneh", "لبنة", 60], avocado: ["Guacamole", "جواكامولي", 70] }[m.d];
      const ing = merge([[m.v1, 90], [m.v2, 80], [m.d === "yogurt" ? "yogurt" : m.d, D[2]]]);
      rec = { name: `${V1[0]} & ${V2[0]} Sticks with ${D[0]}`, ar: `أصابع ${V1[2]} و${V2[2]} مع ${D[1]}`, meal: "snack", diet: dietOf(ing), time: 5, emoji: "🥕", cuisine: ["hummus", "labneh", "tahini"].includes(m.d) ? "arabic" : "everyday", ing,
        stepsFn: (L) => (L === "ar" ? [`قطّع ${V1[2]} و${V2[2]} أصابع.`, `قدّمها مع ${D[1]} للتغميس.`] : [`Cut the ${V1[1]} and ${V2[1]} into sticks.`, `Serve with the ${D[0].toLowerCase()} for dipping.`]) };
    } else if (m.k === "vd") {
      const V = VEG[m.v], D = { hummus: ["Hummus", "حمص", 60], yogurt: ["Yogurt Dip", "غموس الزبادي", 80], tahini: ["Tahini Dip", "غموس الطحينة", 25], labneh: ["Labneh", "لبنة", 60], avocado: ["Guacamole", "جواكامولي", 70] }[m.d];
      const dk = m.d === "yogurt" ? "yogurt" : m.d === "tahini" ? "tahini" : m.d === "avocado" ? "avocado" : m.d;
      const ing = merge([[m.v, 150], [dk, D[2]]]);
      rec = { name: `${V[0]} Sticks with ${D[0]}`, ar: `أصابع ${V[2]} مع ${D[1]}`, meal: "snack", diet: dietOf(ing), time: 5, emoji: "🥕", cuisine: m.d === "hummus" || m.d === "labneh" || m.d === "tahini" ? "arabic" : "everyday", ing,
        stepsFn: (L) => (L === "ar" ? [`قطّع ${V[2]} أصابع.`, `قدّمه مع ${D[1]} للتغميس.`] : [`Cut the ${V[1]} into sticks.`, `Serve with the ${D[0].toLowerCase()} for dipping.`]) };
    } else if (m.k === "yf") {
      const Y = { yogurt: ["Greek Yogurt", "زبادي يوناني", 170], cottage: ["Cottage Cheese", "جبن قريش", 150], ricotta: ["Ricotta", "ريكوتا", 100], labneh: ["Labneh", "لبنة", 100] }[m.y], F = FRUIT[m.f1];
      const ing = merge([[m.y, Y[2]], [m.f1, FRG[m.f1] * 0.8]]);
      rec = { name: `${Y[0]} with ${F[0]}`, ar: `${Y[1]} مع ${F[1]}`, meal: "snack", diet: "veg", time: 3, emoji: "🥛", cuisine: m.y === "labneh" ? "arabic" : "everyday", ing,
        stepsFn: (L) => (L === "ar" ? [`ضع ${Y[1]} في وعاء وزيّنه بـ${F[1]} المقطع.`] : [`Spoon the ${Y[0].toLowerCase()} into a bowl and top with the sliced ${F[0].toLowerCase()}.`]) };
    } else if (m.k === "rb") {
      const p = m.pk === "edamame" ? { n: "Edamame", a: "إدامامي", l: "edamame" } : PROT[m.pk];
      const ing = merge([[m.pk, 130], ["oil", 5]]);
      rec = { name: `Roasted ${p.n === "Chickpea" ? "Chickpeas" : p.n === "Lentil" ? "Lentils" : p.n === "White Bean" ? "White Beans" : p.n === "Black Bean" ? "Black Beans" : p.n} with ${m.sp[0]}`, ar: `${p.a} محمص بنكهة ${m.sp[1]}`, meal: "snack", diet: "vegan", time: 25, emoji: "🫘", cuisine: m.sp[0] === "Za'atar" ? "arabic" : "everyday", ing,
        stepsFn: (L) => (L === "ar" ? [`جفّف ${p.a} جيداً وقلّبه مع الزيت والملح و${m.sp[1]}.`, `اشوه على 200 °م لمدة 20–25 دقيقة مع رجّ الصينية في المنتصف.`] : [`Dry the ${p.l || p.n.toLowerCase()} well and toss with the oil, salt and ${m.sp[0].toLowerCase()}.`, `Roast at 200 °C / 400 °F for 20–25 minutes, shaking the tray halfway.`]) };
    } else {
      const F = FRUIT[m.f1], ML = m.milk === "milk" ? ["Milk", "حليب"] : ["Soy Milk", "حليب الصويا"], PR = m.pr === "whey" ? ["Protein", "بروتين", 30] : ["Greek Yogurt", "زبادي يوناني", 120];
      if (m.milk === "soymilk" && m.pr === "yogurt") continue;
      const ing = merge([[m.pr, PR[2]], [m.milk, 200], [m.f1, FRG[m.f1] * 0.8]]);
      rec = { name: `${F[0]} ${PR[0]} Shake with ${ML[0]}`, ar: `شيك ${F[1]} و${PR[1]} مع ${ML[1]}`, meal: "snack", diet: dietOf(ing), time: 3, emoji: "🥤", cuisine: "everyday", ing,
        stepsFn: (L) => (L === "ar" ? [`ضع كل المكونات في الخلاط واخلطها 30 ثانية حتى تصبح ناعمة.`] : [`Blend everything for 30 seconds until smooth.`]) };
    }
    if (add(rec)) ns++;
  }

  RECIPES.forEach((r) => { r.cuisine = r.cuisine || "everyday"; });
  RECIPES.push(...out);
  window.GEN_COUNT = out.length;
})();
