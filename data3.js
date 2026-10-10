// Arabic / Middle Eastern recipes (loaded after data2.js).
Object.assign(INGREDIENTS, {
  ful: { n: "cooked fava beans (ful)", v: [110, 7.6, 19.6, 0.4] },
  freekeh: { n: "cooked freekeh", v: [130, 4.5, 26, 1] },
  labneh: { n: "labneh (strained yogurt)", v: [130, 9, 5, 8] },
  okra: { n: "okra", v: [33, 1.9, 7.5, 0.2] },
  molokhia: { n: "molokhia (jute leaves)", v: [43, 4.6, 7.1, 0.3] },
  grapeleaves: { n: "grape leaves", v: [93, 5.6, 17, 2.1] },
  lamb: { n: "lean lamb (raw weight)", v: [175, 23, 0, 9] },
  parsley: { n: "fresh parsley", v: [36, 3, 6.3, 0.8] },
  zaatar: { n: "za'atar mix", v: [270, 9, 40, 10] },
});
(function () {
  const R = (id, name, meal, diet, time, emoji, ing, steps) =>
    RECIPES.push({ id, name, meal, diet, time, emoji, ing, steps, cuisine: "arabic" });

  // breakfast
  R("ful-medames", "Ful Medames", "breakfast", "vegan", 15, "🫘",
    [["ful", 200], ["tomato", 60], ["onion", 20], ["oil", 8], ["lemon", 15], ["bread", 60]],
    ["Warm the fava beans with a splash of water, cumin, salt and crushed garlic; mash lightly.", "Spoon into a bowl and top with diced tomato, onion and parsley.", "Finish with olive oil and lemon and serve with bread."]);
  R("manakish", "Za'atar Manakish with Labneh", "breakfast", "veg", 15, "🫓",
    [["pita", 60], ["zaatar", 8], ["oil", 6], ["labneh", 60], ["tomato", 80], ["cucumber", 60]],
    ["Mix za'atar with the oil and spread over the pita.", "Bake at 220 °C / 425 °F for 5 minutes until crisp at the edges.", "Serve with labneh, tomato and cucumber."]);
  R("eggs-sujuk-style", "Eggs with Tomato & Onion (Beid bi Banadoura)", "breakfast", "veg", 15, "🍳",
    [["egg", 150], ["tomato", 200], ["onion", 40], ["oil", 8], ["pita", 60]],
    ["Soften sliced onion in oil, add chopped tomato and cook 8 minutes until jammy.", "Crack in the eggs and stir gently until set.", "Season with salt, pepper and a pinch of cumin; serve with pita."]);
  R("labneh-plate", "Labneh Breakfast Plate", "breakfast", "veg", 5, "🥙",
    [["labneh", 100], ["cucumber", 80], ["tomato", 80], ["oil", 5], ["bread", 60]],
    ["Spread labneh on a plate and make a well in the middle.", "Drizzle with olive oil and sprinkle with za'atar.", "Serve with cucumber, tomato and bread."]);
  R("hummus-egg-plate", "Hummus Plate with Boiled Egg", "breakfast", "veg", 12, "🥚",
    [["hummus", 100], ["egg", 100], ["cucumber", 80], ["tomato", 60], ["pita", 60]],
    ["Boil the eggs for 9 minutes, cool and peel.", "Spread hummus on a plate and top with halved eggs.", "Serve with cucumber, tomato and warm pita."]);

  // lunch
  R("tabbouleh-chicken", "Tabbouleh with Grilled Chicken", "lunch", "any", 25, "🥗",
    [["chicken", 130], ["bulgur", 100], ["parsley", 60], ["tomato", 100], ["onion", 20], ["oil", 10], ["lemon", 20]],
    ["Season and grill the chicken 5–6 minutes per side, then slice.", "Finely chop parsley, tomato and onion; mix with the bulgur.", "Dress with oil, lemon, salt and pepper, and top with the chicken."]);
  R("fattoush", "Fattoush Salad", "lunch", "vegan", 15, "🥬",
    [["greens", 80], ["cucumber", 100], ["tomato", 120], ["pita", 40], ["parsley", 20], ["oil", 10], ["lemon", 20], ["chickpeas", 80]],
    ["Toast the pita until crisp and break into pieces.", "Chop the vegetables and combine with chickpeas and parsley.", "Dress with oil, lemon, sumac and salt; add the pita just before serving."]);
  R("mujaddara", "Mujaddara (Lentils & Rice)", "lunch", "vegan", 35, "🍚",
    [["lentils", 150], ["rice", 120], ["onion", 80], ["oil", 10], ["cucumber", 80]],
    ["Cook the lentils until just tender, then combine with the cooked rice, cumin and salt.", "Slowly brown the sliced onion in oil for 15 minutes until deep golden.", "Top the lentil rice with the onion and serve with sliced cucumber."]);
  R("koshari", "Egyptian Koshari", "lunch", "vegan", 40, "🍝",
    [["lentils", 100], ["rice", 100], ["pasta", 80], ["chickpeas", 60], ["tomato", 150], ["onion", 60], ["oil", 8]],
    ["Cook the rice and pasta; warm the lentils and chickpeas.", "Simmer tomato with garlic, cumin and a splash of vinegar into a sauce.", "Fry the onion in oil until crisp, then layer everything and top with sauce and onion."]);
  R("shawarma-bowl", "Chicken Shawarma Bowl", "lunch", "any", 30, "🌯",
    [["chicken", 150], ["rice", 120], ["cucumber", 80], ["tomato", 80], ["yogurt", 40], ["oil", 6]],
    ["Marinate sliced chicken in yogurt, cumin, paprika, cinnamon, garlic and lemon for 20 minutes.", "Sear in oil over high heat until browned and cooked through.", "Serve over rice with cucumber, tomato and a spoon of yogurt."]);
  R("baba-ganoush-plate", "Baba Ganoush & Chickpea Plate", "lunch", "vegan", 35, "🍆",
    [["eggplant", 250], ["tahini", 20], ["lemon", 15], ["chickpeas", 100], ["pita", 60], ["tomato", 80]],
    ["Char the whole eggplant over a flame or in a hot oven until collapsed, 30 minutes at 220 °C / 425 °F.", "Scoop out the flesh and mash with tahini, lemon, garlic and salt.", "Serve with chickpeas, tomato and pita."]);
  R("shorbat-adas", "Shorbat Adas (Lentil Soup)", "lunch", "vegan", 30, "🍲",
    [["lentils", 200], ["carrot", 60], ["onion", 50], ["potato", 80], ["oil", 8], ["lemon", 15], ["bread", 30]],
    ["Sauté onion and carrot in oil with cumin.", "Add lentils, diced potato and 500 ml water; simmer 20 minutes.", "Blend until smooth, finish with lemon and serve with bread."]);
  R("fatteh-chickpea", "Chickpea Fatteh", "lunch", "veg", 20, "🥣",
    [["chickpeas", 150], ["yogurt", 120], ["pita", 40], ["tahini", 10], ["oil", 6], ["almonds", 10]],
    ["Toast the pita pieces until crisp and place in a bowl.", "Warm the chickpeas and spoon over the pita.", "Top with yogurt whisked with tahini and garlic, then oil and toasted almonds."]);

  // dinner
  R("kofta-tray", "Baked Kofta with Vegetables", "dinner", "any", 35, "🍢",
    [["lamb", 140], ["onion", 40], ["parsley", 15], ["tomato", 150], ["pepper", 100], ["rice", 100], ["oil", 4]],
    ["Mix lamb with grated onion, chopped parsley, salt, pepper, cumin and cinnamon; shape into fingers.", "Arrange on a tray with sliced tomato and pepper, drizzle with oil.", "Bake at 200 °C / 400 °F for 20 minutes and serve with rice."]);
  R("shish-tawook", "Shish Tawook with Rice", "dinner", "any", 30, "🍗",
    [["chicken", 160], ["yogurt", 60], ["rice", 130], ["pepper", 80], ["onion", 40], ["lemon", 15]],
    ["Marinate cubed chicken in yogurt, lemon, garlic, paprika and salt for at least 30 minutes.", "Thread on skewers with pepper and onion and grill or bake at 220 °C / 425 °F for 15 minutes.", "Serve over rice."]);
  R("okra-stew", "Bamya (Okra & Tomato Stew)", "dinner", "vegan", 35, "🌿",
    [["okra", 250], ["tomato", 200], ["onion", 50], ["oil", 10], ["rice", 130]],
    ["Fry the okra in half the oil for 5 minutes.", "Soften onion and garlic in the remaining oil, add tomato, coriander and a little water.", "Add the okra and simmer 20 minutes; serve with rice."]);
  R("molokhia", "Molokhia with Chicken", "dinner", "any", 40, "🥬",
    [["molokhia", 150], ["chicken", 140], ["rice", 130], ["onion", 30], ["oil", 6]],
    ["Simmer the chicken with onion until cooked; shred and keep the broth.", "Add the molokhia and plenty of garlic to the broth and cook 8–10 minutes without boiling hard.", "Serve over rice with the chicken."]);
  R("sayadieh", "Sayadieh (Fish & Spiced Rice)", "dinner", "any", 40, "🐟",
    [["cod", 200], ["rice", 150], ["onion", 80], ["oil", 10], ["lemon", 15]],
    ["Season the fish with cumin, coriander and salt and pan-fry 3 minutes per side; set aside.", "Caramelize the onion in oil, then cook the rice with the onions and a little fish stock or water.", "Serve the fish on the rice with lemon."]);
  R("freekeh-chicken", "Freekeh with Chicken & Vegetables", "dinner", "any", 40, "🍲",
    [["freekeh", 180], ["chicken", 150], ["carrot", 60], ["onion", 40], ["peas", 50], ["oil", 6]],
    ["Brown the chicken in oil with onion, cinnamon, allspice and salt.", "Add carrot, peas, freekeh and enough water to cover; simmer 25 minutes.", "Fluff and serve."]);
  R("stuffed-zucchini", "Stuffed Zucchini (Koussa Mahshi)", "dinner", "any", 50, "🥒",
    [["zucchini", 300], ["lamb", 100], ["rice", 80], ["tomato", 150], ["onion", 30]],
    ["Hollow out the zucchini with a corer.", "Mix lamb, rice, onion, cinnamon, allspice and salt; stuff the zucchini loosely.", "Simmer in tomato sauce with a little water for 30 minutes."]);
  R("grape-leaves", "Stuffed Grape Leaves (Warak Enab)", "dinner", "vegan", 60, "🍃",
    [["grapeleaves", 100], ["rice", 150], ["tomato", 100], ["parsley", 30], ["oil", 10], ["lemon", 20]],
    ["Mix cooked rice, chopped tomato, parsley, oil, lemon and spices.", "Roll a spoonful into each leaf, tucking in the sides.", "Pack tightly in a pot, add lemon juice and water, weigh down with a plate and simmer 40 minutes."]);
  R("lamb-okra", "Lamb & Tomato Stew with Bulgur", "dinner", "any", 50, "🥘",
    [["lamb", 130], ["tomato", 200], ["onion", 50], ["bulgur", 150], ["oil", 4]],
    ["Brown the lamb with onion in oil.", "Add tomato, cinnamon, allspice, salt and water; simmer 35 minutes until tender.", "Serve over the cooked bulgur."]);
  R("tahini-fish", "Baked Fish with Tahini & Vegetables", "dinner", "any", 30, "🐠",
    [["tilapia", 180], ["tahini", 20], ["tomato", 120], ["onion", 40], ["lemon", 15], ["potato", 120]],
    ["Roast potato wedges at 200 °C / 400 °F for 15 minutes.", "Add the fish, tomato and onion to the tray and bake 12 minutes.", "Whisk tahini with lemon and water and spoon over to serve."]);

  // snacks
  R("labneh-cucumber", "Labneh with Cucumber", "snack", "veg", 3, "🥒",
    [["labneh", 80], ["cucumber", 150]], ["Spread labneh on a small plate and drizzle with a little oil and za'atar.", "Dip cucumber slices."]);
  R("dates-almonds", "Dates & Almonds", "snack", "vegan", 2, "🌴",
    [["dates", 45], ["almonds", 15]], ["Stuff pitted dates with an almond each."]);
  R("balila", "Balila (Warm Spiced Chickpeas)", "snack", "vegan", 10, "🫘",
    [["chickpeas", 150], ["lemon", 10], ["oil", 4]], ["Warm the chickpeas with cumin, salt and a splash of water.", "Finish with lemon juice and olive oil."]);
  R("hummus-pita", "Hummus with Pita & Cucumber", "snack", "vegan", 3, "🥙",
    [["hummus", 60], ["pita", 30], ["cucumber", 100]], ["Serve the hummus with pita wedges and cucumber slices."]);
})();
