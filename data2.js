// Extra ingredients and recipes (loaded after data.js). Same format: per 100 g [kcal, protein, carbs, fat].
Object.assign(INGREDIENTS, {
  mozzarella: { n: "part-skim mozzarella", v: [254, 24, 2.8, 16] },
  parmesan: { n: "grated parmesan", v: [431, 38, 4.1, 29] },
  ricotta: { n: "part-skim ricotta", v: [138, 11.4, 5.1, 7.9] },
  sardines: { n: "canned sardines, drained", v: [208, 25, 0, 11.5] },
  tilapia: { n: "tilapia fillet (raw weight)", v: [96, 20, 0, 1.7] },
  pork: { n: "pork tenderloin (raw weight)", v: [120, 21, 0, 3.5] },
  deli: { n: "sliced turkey breast", v: [104, 17, 3, 2.5] },
  edamame: { n: "shelled edamame", v: [121, 11.9, 8.9, 5.2] },
  kidney: { n: "cooked kidney beans", v: [127, 8.7, 22.8, 0.5] },
  whitebeans: { n: "cooked white beans", v: [139, 9.7, 25, 0.4] },
  peas: { n: "green peas", v: [81, 5, 14, 0.4] },
  corn: { n: "sweetcorn", v: [96, 3.4, 21, 1.5] },
  cauliflower: { n: "cauliflower", v: [25, 1.9, 5, 0.3] },
  kale: { n: "kale", v: [35, 2.9, 4.4, 1.5] },
  cabbage: { n: "cabbage", v: [25, 1.3, 5.8, 0.1] },
  asparagus: { n: "asparagus", v: [20, 2.2, 3.9, 0.1] },
  greenbeans: { n: "green beans", v: [31, 1.8, 7, 0.2] },
  eggplant: { n: "eggplant", v: [25, 1, 6, 0.2] },
  potato: { n: "potatoes", v: [77, 2, 17, 0.1] },
  squash: { n: "butternut squash", v: [45, 1, 11.7, 0.1] },
  strawberries: { n: "strawberries", v: [32, 0.7, 7.7, 0.3] },
  orange: { n: "orange", v: [47, 0.9, 11.8, 0.1], piece: 150, pn: "orange" },
  mango: { n: "mango", v: [60, 0.8, 15, 0.4] },
  pineapple: { n: "pineapple", v: [50, 0.5, 13.1, 0.1] },
  raspberries: { n: "raspberries", v: [52, 1.2, 11.9, 0.7] },
  dates: { n: "pitted dates", v: [282, 2.5, 75, 0.4] },
  coconut: { n: "light coconut milk", v: [80, 0.8, 2.5, 7], ml: true },
  flax: { n: "ground flaxseed", v: [534, 18, 29, 42] },
  pumpkinseeds: { n: "pumpkin seeds", v: [559, 30, 11, 49] },
  tahini: { n: "tahini", v: [595, 17, 21, 54] },
  cashews: { n: "cashews", v: [553, 18, 30, 44] },
  couscous: { n: "cooked whole-wheat couscous", v: [112, 3.8, 23.2, 0.2] },
  bulgur: { n: "cooked bulgur", v: [83, 3.1, 18.6, 0.2] },
  pita: { n: "whole-wheat pita", v: [275, 9, 56, 1.2], piece: 60, pn: "pita" },
  ricenoodles: { n: "cooked rice noodles", v: [109, 0.9, 25, 0.2] },
  soba: { n: "cooked soba noodles", v: [99, 5.1, 21.4, 0.1] },
  cocoa: { n: "unsweetened cocoa powder", v: [228, 19.6, 57.9, 13.7] },
  tempeh: { n: "tempeh", v: [192, 20, 7.6, 10.8] },
  soy: { n: "soy sauce", v: [53, 8, 4.9, 0.6], ml: true },
});

(function () {
  const R = (id, name, meal, diet, time, emoji, ing, steps) => RECIPES.push({ id, name, meal, diet, time, emoji, ing, steps });

  // ---- breakfast ----
  R("pancakes", "Banana Oat Protein Pancakes", "breakfast", "veg", 15, "🥞",
    [["oats", 50], ["egg", 100], ["banana", 100], ["yogurt", 80], ["blueberries", 60]],
    ["Blend oats, eggs and banana into a smooth batter.", "Cook small pancakes in a lightly oiled non-stick pan, 2 minutes per side.", "Serve with yogurt and blueberries."]);
  R("overnight-oats", "Raspberry Overnight Oats", "breakfast", "vegan", 5, "🫙",
    [["oats", 50], ["soymilk", 150], ["chia", 10], ["raspberries", 80], ["almonds", 10], ["maple", 5]],
    ["Stir oats, soy milk, chia and maple syrup together in a jar.", "Refrigerate overnight.", "Top with raspberries and chopped almonds."]);
  R("avo-egg-toast", "Avocado & Egg Toast", "breakfast", "veg", 10, "🥑",
    [["bread", 60], ["avocado", 70], ["egg", 100], ["tomato", 60]],
    ["Toast the bread and mash the avocado with salt, pepper and lemon.", "Fry or poach the eggs.", "Spread avocado on toast, add sliced tomato and the eggs."]);
  R("smoothie-bowl", "Strawberry Banana Smoothie Bowl", "breakfast", "vegan", 8, "🍓",
    [["banana", 120], ["strawberries", 100], ["soymilk", 100], ["oats", 30], ["pumpkinseeds", 15]],
    ["Blend frozen banana, strawberries and soy milk until thick.", "Pour into a bowl.", "Top with oats and pumpkin seeds."]);
  R("shakshuka", "Tomato & Pepper Shakshuka", "breakfast", "veg", 25, "🍅",
    [["egg", 150], ["tomato", 250], ["pepper", 80], ["onion", 50], ["oil", 8], ["bread", 30], ["feta", 20]],
    ["Soften onion and pepper in oil for 5 minutes; add cumin and paprika.", "Add chopped tomatoes and simmer 10 minutes until thick.", "Make wells, crack in the eggs, cover and cook 5–6 minutes.", "Crumble feta over and serve with bread."]);
  R("breakfast-burrito", "Black Bean Breakfast Burrito", "breakfast", "veg", 12, "🌯",
    [["egg", 100], ["blackbeans", 80], ["tortilla", 60], ["pepper", 40], ["mozzarella", 25]],
    ["Scramble the eggs with diced pepper.", "Warm the beans and the tortilla.", "Fill the tortilla with eggs, beans and cheese; roll and toast in the pan 1 minute per side."]);
  R("egg-muffins", "Turkey & Veggie Egg Muffins", "breakfast", "any", 25, "🧁",
    [["egg", 150], ["deli", 80], ["spinach", 40], ["pepper", 40], ["bread", 30]],
    ["Heat the oven to 180 °C / 350 °F and grease a muffin tin.", "Divide chopped turkey, spinach and pepper among the cups; pour beaten egg over.", "Bake 15–18 minutes until set. Serve with toast."]);
  R("pb-banana-toast", "Peanut Butter Banana Toast", "breakfast", "vegan", 5, "🍞",
    [["bread", 60], ["pb", 20], ["banana", 100], ["chia", 5]],
    ["Toast the bread.", "Spread with peanut butter.", "Top with sliced banana and chia seeds."]);
  R("tropical-yogurt", "Tropical Yogurt Bowl", "breakfast", "veg", 5, "🥭",
    [["yogurt", 200], ["mango", 100], ["pineapple", 50], ["flax", 10], ["oats", 20]],
    ["Spoon yogurt into a bowl.", "Top with diced mango and pineapple.", "Sprinkle with flaxseed and oats."]);
  R("savory-oats", "Savory Spinach & Egg Oatmeal", "breakfast", "veg", 12, "🥄",
    [["oats", 50], ["egg", 50], ["spinach", 40], ["mushrooms", 50], ["parmesan", 10], ["oil", 5]],
    ["Cook oats in water with a pinch of salt until creamy.", "Sauté mushrooms and spinach in oil.", "Fry the egg, then pile everything on the oats and finish with parmesan."]);
  R("tempeh-hash", "Tempeh Potato Hash", "breakfast", "vegan", 25, "🥔",
    [["tempeh", 100], ["potato", 150], ["pepper", 60], ["onion", 40], ["oil", 8], ["spinach", 30]],
    ["Dice the potato and microwave or boil for 5 minutes.", "Fry potato, onion and pepper in oil until golden.", "Add crumbled tempeh and cook 5 minutes; stir in spinach and season well."]);

  // ---- lunch ----
  R("chicken-pita", "Chicken Hummus Pita", "lunch", "any", 20, "🥙",
    [["chicken", 130], ["pita", 60], ["hummus", 40], ["cucumber", 60], ["tomato", 50], ["greens", 30]],
    ["Season and pan-sear the chicken for 5–6 minutes per side; slice.", "Warm the pita and spread with hummus.", "Fill with chicken, cucumber, tomato and greens."]);
  R("sardine-salad", "Sardine & White Bean Salad", "lunch", "any", 10, "🐟",
    [["sardines", 100], ["whitebeans", 100], ["tomato", 80], ["greens", 40], ["onion", 20], ["oil", 8], ["lemon", 15]],
    ["Combine beans, chopped tomato, thin onion and greens.", "Top with the sardines.", "Dress with oil, lemon, salt and pepper."]);
  R("buddha-bowl", "Sweet Potato Chickpea Buddha Bowl", "lunch", "vegan", 30, "🥣",
    [["quinoa", 120], ["sweetpotato", 120], ["chickpeas", 80], ["kale", 40], ["tahini", 15], ["lemon", 15]],
    ["Roast cubed sweet potato and chickpeas at 200 °C / 400 °F for 20 minutes.", "Massage the kale with a little lemon juice.", "Assemble over quinoa and drizzle with tahini thinned with lemon and water."]);
  R("caprese-chicken", "Caprese Chicken", "lunch", "any", 25, "🧀",
    [["chicken", 140], ["mozzarella", 40], ["tomato", 120], ["greens", 40], ["oil", 6]],
    ["Sear the chicken in oil until nearly cooked, about 10 minutes.", "Top with tomato slices and mozzarella, cover for 2–3 minutes until melted.", "Serve over greens with black pepper and basil."]);
  R("lentil-curry", "Coconut Lentil Curry", "lunch", "vegan", 25, "🍛",
    [["lentils", 200], ["coconut", 100], ["tomato", 100], ["spinach", 50], ["onion", 50], ["rice", 120], ["oil", 5]],
    ["Soften onion in oil with curry powder, ginger and garlic.", "Add tomato, lentils and coconut milk; simmer 10 minutes.", "Stir in spinach and serve over rice."]);
  R("egg-salad-sandwich", "Light Egg Salad Sandwich", "lunch", "veg", 15, "🥪",
    [["egg", 150], ["yogurt", 50], ["bread", 60], ["greens", 30], ["cucumber", 40]],
    ["Hard-boil the eggs 10 minutes, cool and chop.", "Mix with yogurt, mustard, salt and pepper.", "Layer on bread with greens and cucumber."]);
  R("soba-salad", "Edamame Soba Noodle Salad", "lunch", "vegan", 15, "🍜",
    [["soba", 150], ["edamame", 80], ["carrot", 60], ["cabbage", 60], ["cucumber", 40], ["soy", 10], ["tahini", 10]],
    ["Cook the soba, rinse under cold water and drain.", "Shred the vegetables.", "Whisk soy sauce, tahini and a little water; toss everything together."]);
  R("turkey-wrap", "Turkey Hummus Veggie Wrap", "lunch", "any", 8, "🌯",
    [["deli", 80], ["tortilla", 60], ["hummus", 30], ["spinach", 30], ["tomato", 50], ["cucumber", 40]],
    ["Spread the hummus over the tortilla.", "Layer turkey, spinach, tomato and cucumber.", "Roll tightly and slice in half."]);
  R("tuna-bean-salad", "Tuna & White Bean Salad", "lunch", "any", 10, "🥗",
    [["tuna", 120], ["whitebeans", 100], ["tomato", 80], ["onion", 20], ["greens", 40], ["oil", 8]],
    ["Drain and flake the tuna.", "Toss with beans, chopped tomato, thin onion and greens.", "Dress with oil, lemon, salt and pepper."]);
  R("chickpea-patties", "Baked Chickpea Patties with Tabbouleh", "lunch", "vegan", 35, "🧆",
    [["chickpeas", 150], ["oats", 20], ["onion", 30], ["bulgur", 100], ["tomato", 80], ["cucumber", 60], ["oil", 8], ["lemon", 15]],
    ["Mash chickpeas with oats, grated onion, cumin and salt; shape into 4 patties.", "Bake at 200 °C / 400 °F for 20 minutes, flipping once.", "Mix bulgur with chopped tomato, cucumber, oil and lemon.", "Serve the patties on the tabbouleh."]);
  R("stuffed-peppers", "Turkey & Rice Stuffed Peppers", "lunch", "any", 40, "🫑",
    [["turkey", 130], ["pepper", 200], ["rice", 80], ["tomato", 80], ["onion", 30], ["mozzarella", 20]],
    ["Halve the peppers and remove seeds.", "Brown the turkey with onion, then mix in rice and chopped tomato.", "Fill the peppers, top with cheese and bake at 190 °C / 375 °F for 25 minutes."]);
  R("cauli-fried-rice", "Egg & Cauliflower Fried Rice", "lunch", "veg", 20, "🍚",
    [["egg", 100], ["cauliflower", 200], ["rice", 80], ["peas", 60], ["carrot", 50], ["oil", 8], ["soy", 10]],
    ["Pulse the cauliflower into rice-sized pieces.", "Stir-fry carrot, peas and cauliflower in oil for 5 minutes; add rice and soy sauce.", "Push aside, scramble the eggs in the pan, then mix through."]);
  R("minestrone", "Vegetable Minestrone", "lunch", "vegan", 35, "🍅",
    [["whitebeans", 150], ["pasta", 60], ["carrot", 60], ["zucchini", 60], ["tomato", 100], ["kale", 40], ["onion", 40], ["oil", 8]],
    ["Soften onion, carrot and zucchini in oil for 5 minutes.", "Add tomato and 500 ml water or stock; simmer 15 minutes.", "Add beans, pasta and kale and cook until the pasta is tender."]);

  // ---- dinner ----
  R("turkey-meatballs", "Turkey Meatballs & Spaghetti", "dinner", "any", 35, "🍝",
    [["turkey", 160], ["pasta", 150], ["tomato", 200], ["onion", 30], ["parmesan", 10], ["oats", 15], ["oil", 6]],
    ["Mix turkey, grated onion, oats, parmesan, salt and herbs; roll into balls.", "Brown in oil, then simmer in chopped tomatoes 15 minutes.", "Serve over the cooked pasta."]);
  R("pork-tenderloin", "Roast Pork Tenderloin with Potatoes", "dinner", "any", 40, "🍖",
    [["pork", 150], ["potato", 200], ["greenbeans", 120], ["oil", 8]],
    ["Rub the pork with oil, garlic, paprika and thyme. Cube the potatoes.", "Roast potatoes at 200 °C / 400 °F for 15 minutes, then add the pork for 20–25 minutes (63 °C / 145 °F inside).", "Steam the green beans, rest and slice the pork."]);
  R("chicken-fajitas", "Chicken Fajitas", "dinner", "any", 25, "🌮",
    [["chicken", 150], ["pepper", 150], ["onion", 60], ["tortilla", 60], ["avocado", 40], ["oil", 6]],
    ["Slice chicken, pepper and onion into strips.", "Sear the chicken with cumin, paprika and chili 5 minutes; add vegetables for 4 more.", "Serve in warm tortillas with avocado."]);
  R("tilapia-couscous", "Lemon Tilapia with Couscous & Asparagus", "dinner", "any", 20, "🍋",
    [["tilapia", 180], ["couscous", 150], ["asparagus", 120], ["oil", 8], ["lemon", 15]],
    ["Pan-fry the tilapia in oil 3 minutes per side with lemon and pepper.", "Steam or roast the asparagus 5–6 minutes.", "Serve with the warm couscous."]);
  R("chicken-curry", "Light Chicken Curry", "dinner", "any", 30, "🍛",
    [["chicken", 150], ["coconut", 100], ["tomato", 100], ["onion", 50], ["spinach", 40], ["rice", 130], ["oil", 4]],
    ["Soften onion with curry powder in oil.", "Add diced chicken and brown 4 minutes; add tomato and coconut milk.", "Simmer 12 minutes, stir in spinach, and serve with rice."]);
  R("stuffed-eggplant", "Lentil-Stuffed Eggplant", "dinner", "vegan", 45, "🍆",
    [["eggplant", 250], ["lentils", 150], ["tomato", 80], ["onion", 30], ["oil", 8]],
    ["Halve the eggplant, scoop out some flesh and roast cut-side down at 200 °C / 400 °F for 20 minutes.", "Sauté onion with the chopped flesh, tomato, lentils, cumin and paprika.", "Fill the shells and bake 10 more minutes."]);
  R("tempeh-noodles", "Tempeh Veggie Noodle Stir-fry", "dinner", "vegan", 20, "🍜",
    [["tempeh", 130], ["ricenoodles", 150], ["cabbage", 80], ["carrot", 60], ["pepper", 60], ["soy", 10], ["oil", 8]],
    ["Slice tempeh and fry in half the oil until golden; set aside.", "Stir-fry the vegetables in the rest of the oil for 4 minutes.", "Add noodles, tempeh and soy sauce and toss until hot."]);
  R("salmon-asparagus", "Salmon with Quinoa & Asparagus", "dinner", "any", 25, "🍣",
    [["salmon", 150], ["quinoa", 120], ["asparagus", 150], ["oil", 6], ["lemon", 15]],
    ["Season the salmon and roast with asparagus at 200 °C / 400 °F for 12–15 minutes.", "Warm the quinoa.", "Serve with lemon juice and a drizzle of oil."]);
  R("zucchini-bake", "Zucchini Ricotta Pasta Bake", "dinner", "veg", 40, "🧀",
    [["zucchini", 250], ["ricotta", 100], ["tomato", 150], ["mozzarella", 40], ["onion", 30], ["pasta", 80], ["oil", 5]],
    ["Sauté onion and sliced zucchini in oil; add tomatoes and simmer 8 minutes.", "Mix with cooked pasta and spoon dollops of ricotta through.", "Top with mozzarella and bake at 190 °C / 375 °F for 20 minutes."]);
  R("beef-chili", "Lean Beef & Bean Chili", "dinner", "any", 40, "🌶️",
    [["beef", 130], ["kidney", 150], ["tomato", 200], ["onion", 50], ["pepper", 60], ["oil", 5]],
    ["Brown the beef with onion and pepper in oil.", "Add chili powder, cumin, tomatoes and beans.", "Simmer 25 minutes until thick."]);
  R("shrimp-fried-rice", "Shrimp Fried Rice", "dinner", "any", 20, "🍤",
    [["shrimp", 150], ["rice", 150], ["egg", 50], ["peas", 60], ["carrot", 40], ["soy", 10], ["oil", 8]],
    ["Stir-fry the shrimp in oil 2 minutes per side; set aside.", "Fry carrot and peas, then add rice and soy sauce.", "Scramble in the egg, return the shrimp and toss."]);
  R("chickpea-curry", "Chickpea & Spinach Curry", "dinner", "vegan", 25, "🥘",
    [["chickpeas", 200], ["spinach", 80], ["tomato", 150], ["coconut", 80], ["onion", 50], ["rice", 120], ["oil", 5]],
    ["Soften onion with curry spices in oil.", "Add tomato, chickpeas and coconut milk and simmer 12 minutes.", "Stir in spinach and serve with rice."]);
  R("sheet-pan-chicken", "Sheet-Pan Chicken & Veggies", "dinner", "any", 40, "🍗",
    [["chicken", 160], ["potato", 150], ["broccoli", 100], ["carrot", 80], ["oil", 8]],
    ["Heat the oven to 210 °C / 410 °F. Toss chopped vegetables and chicken with oil, garlic, paprika, salt and pepper.", "Spread on a tray and roast 25–30 minutes, turning once, until the chicken is cooked through."]);
  R("bean-tacos", "Black Bean & Slaw Tacos", "dinner", "vegan", 15, "🌮",
    [["blackbeans", 130], ["tortilla", 90], ["avocado", 50], ["cabbage", 60], ["tomato", 60], ["corn", 40]],
    ["Warm the beans with cumin and paprika, mashing lightly.", "Toss shredded cabbage, corn and tomato with lime or lemon.", "Fill warm tortillas with beans, slaw and sliced avocado."]);
  R("stuffed-squash", "Quinoa-Stuffed Butternut Squash", "dinner", "veg", 50, "🎃",
    [["squash", 250], ["quinoa", 100], ["kale", 50], ["walnuts", 15], ["feta", 25]],
    ["Halve the squash, roast cut-side down at 200 °C / 400 °F for 30 minutes.", "Wilt the kale and mix with quinoa and chopped walnuts.", "Fill the squash and top with feta; return to the oven for 5 minutes."]);
  R("soy-ginger-salmon", "Soy-Ginger Salmon & Rice", "dinner", "any", 25, "🍱",
    [["salmon", 150], ["rice", 150], ["greenbeans", 100], ["soy", 10], ["oil", 4]],
    ["Marinate the salmon in soy sauce, grated ginger and garlic for 10 minutes.", "Bake or pan-fry 10–12 minutes.", "Steam the green beans and serve everything over rice."]);
  R("bulgur-pilaf", "Mushroom & Pea Bulgur Pilaf", "dinner", "vegan", 25, "🍄",
    [["bulgur", 200], ["mushrooms", 150], ["onion", 40], ["peas", 60], ["oil", 8], ["walnuts", 10]],
    ["Brown mushrooms and onion in oil until golden.", "Add peas and cooked bulgur and toss with salt, pepper and thyme.", "Top with chopped walnuts."]);

  // ---- snacks ----
  R("cottage-pineapple", "Cottage Cheese & Pineapple", "snack", "veg", 2, "🍍",
    [["cottage", 150], ["pineapple", 100]], ["Spoon the cottage cheese into a bowl.", "Top with diced pineapple."]);
  R("edamame", "Salted Edamame", "snack", "vegan", 5, "🫛",
    [["edamame", 120]], ["Steam or boil the edamame for 4–5 minutes.", "Sprinkle with a little sea salt."]);
  R("roasted-chickpeas", "Crispy Roasted Chickpeas", "snack", "vegan", 30, "🥜",
    [["chickpeas", 100], ["oil", 5]], ["Dry the chickpeas well and toss with oil, paprika and salt.", "Roast at 200 °C / 400 °F for 25 minutes, shaking halfway."]);
  R("date-bites", "Cocoa Date Energy Bites", "snack", "vegan", 10, "🍫",
    [["dates", 40], ["oats", 20], ["pb", 15], ["cocoa", 5]], ["Blend dates, oats, peanut butter and cocoa until sticky.", "Roll into small balls and chill 15 minutes."]);
  R("turkey-rollups", "Turkey Cucumber Roll-ups", "snack", "any", 5, "🥒",
    [["deli", 60], ["cucumber", 80], ["hummus", 30]], ["Spread hummus on turkey slices.", "Wrap around cucumber sticks."]);
  R("orange-cashews", "Orange & Cashews", "snack", "vegan", 2, "🍊",
    [["orange", 200], ["cashews", 20]], ["Peel and segment the orange.", "Serve with the cashews."]);
  R("tuna-cucumber", "Tuna Cucumber Bites", "snack", "any", 5, "🐟",
    [["tuna", 80], ["cucumber", 120], ["yogurt", 30]], ["Mix tuna with yogurt, salt and pepper.", "Spoon onto thick cucumber slices."]);
  R("ricotta-berries", "Ricotta with Strawberries", "snack", "veg", 3, "🍓",
    [["ricotta", 100], ["strawberries", 120], ["honey", 5]], ["Spoon ricotta into a bowl.", "Top with sliced strawberries and a drizzle of honey."]);
  R("trail-mix", "Seed & Date Trail Mix", "snack", "vegan", 2, "🌰",
    [["pumpkinseeds", 20], ["almonds", 15], ["dates", 20]], ["Mix everything in a small container."]);
})();
