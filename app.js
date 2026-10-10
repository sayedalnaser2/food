const $ = (id) => document.getElementById(id);
const MEALS = ["breakfast", "lunch", "dinner", "snack"];
const STAPLES = new Set(["oil", "lemon", "soy"]); // assumed to be in every kitchen
const GROUPS = {
  "Meat & fish": ["chicken", "beef", "turkey", "pork", "deli", "salmon", "cod", "tilapia", "tuna", "sardines", "shrimp"],
  "Eggs, dairy & plant protein": ["egg", "milk", "yogurt", "cottage", "ricotta", "feta", "mozzarella", "parmesan", "soymilk", "tofu", "tempeh", "edamame", "whey"],
  "Grains, bread & pasta": ["oats", "rice", "quinoa", "bulgur", "couscous", "pasta", "soba", "ricenoodles", "bread", "pita", "tortilla"],
  "Beans & legumes": ["lentils", "chickpeas", "blackbeans", "kidney", "whitebeans", "hummus"],
  "Vegetables": ["broccoli", "spinach", "kale", "tomato", "cucumber", "zucchini", "pepper", "onion", "carrot", "mushrooms", "cauliflower", "cabbage", "asparagus", "greenbeans", "eggplant", "peas", "corn", "potato", "sweetpotato", "squash", "greens", "avocado"],
  "Fruit": ["banana", "apple", "orange", "blueberries", "strawberries", "raspberries", "mango", "pineapple", "dates"],
  "Nuts, seeds & pantry": ["almonds", "walnuts", "cashews", "pb", "tahini", "chia", "flax", "pumpkinseeds", "cocoa", "coconut", "honey", "maple"],
};
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
let pantry = new Set(store.get("pantry", []));
let profile = null, targets = null, week = [], day = 0;

// ---------- nutrition helpers ----------
function perServing(r) {
  if (r._n) return r._n;
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  for (const [k, g] of r.ing) {
    const v = INGREDIENTS[k].v;
    t.kcal += v[0] * g / 100; t.p += v[1] * g / 100; t.c += v[2] * g / 100; t.f += v[3] * g / 100;
  }
  return (r._n = t);
}
const dietOK = (r, d) => d === "any" || (d === "veg" && r.diet !== "any") || (d === "vegan" && r.diet === "vegan");
const round = (x) => Math.round(x);
const cap = (s) => s[0].toUpperCase() + s.slice(1);
function fmtIng(k, g) {
  const ing = INGREDIENTS[k];
  if (ing.piece) {
    const n = Math.round(g / ing.piece * 2) / 2;
    if (n >= 0.5) return `${n} ${ing.pn}${n > 1 ? "s" : ""}`;
  }
  const r = g < 20 ? Math.round(g) : Math.round(g / 5) * 5;
  return `${r} ${ing.ml ? "ml" : "g"} ${ing.n}`;
}
function pantryMatch(r) {
  const need = r.ing.filter(([k]) => !STAPLES.has(k));
  const have = need.filter(([k]) => pantry.has(k));
  return { have: have.length, total: need.length, ratio: need.length ? have.length / need.length : 1,
           missing: need.filter(([k]) => !pantry.has(k)).map(([k]) => k) };
}

// ---------- calculator ----------
function calcTargets(p) {
  const bmr = 10 * p.kg + 6.25 * p.cm - 5 * p.age + (p.sex === "m" ? 5 : -161);
  const tdee = bmr * p.act;
  let kcal = tdee * (p.goal === "lose" ? 0.8 : p.goal === "gain" ? 1.1 : 1);
  const floor = p.sex === "m" ? 1500 : 1200;
  const floored = kcal < floor;
  kcal = Math.max(kcal, floor);
  const prot = p.kg * (p.goal === "lose" ? 2.0 : p.goal === "gain" ? 1.8 : 1.6);
  const fat = Math.max(kcal * 0.25 / 9, p.kg * 0.6);
  const carb = Math.max(0, (kcal - prot * 4 - fat * 9) / 4);
  return { bmr, tdee, kcal, p: prot, f: fat, c: carb, floored,
           bmi: p.kg / Math.pow(p.cm / 100, 2), fiber: kcal / 1000 * 14, water: p.kg * 0.035 };
}
function readForm() {
  const imp = $("units").value === "imperial";
  const w = parseFloat($("weight").value), h = parseFloat($("height").value);
  return { sex: $("sex").value, age: +$("age").value, kg: imp ? w * 0.45359237 : w, cm: imp ? h * 2.54 : h,
           act: +$("activity").value, goal: $("goal").value, diet: $("diet").value, snacks: +$("snacks").value,
           units: $("units").value, rawW: w, rawH: h };
}
function showTargets() {
  const t = targets;
  $("tkcal").textContent = round(t.kcal);
  $("tcarb").textContent = `${round(t.c)} g`; $("tprot").textContent = `${round(t.p)} g`; $("tfat").textContent = `${round(t.f)} g`;
  const cp = t.c * 4 / t.kcal * 100, pp = t.p * 4 / t.kcal * 100;
  $("donut").style.background = `conic-gradient(var(--c) 0 ${cp}%, var(--p) ${cp}% ${cp + pp}%, var(--f) ${cp + pp}% 100%)`;
  const bmiCat = t.bmi < 18.5 ? "underweight" : t.bmi < 25 ? "healthy range" : t.bmi < 30 ? "overweight range" : "obese range";
  $("facts").innerHTML = [
    `BMR (at rest): <b>${round(t.bmr)}</b> kcal`, `Maintenance (TDEE): <b>${round(t.tdee)}</b> kcal`,
    `BMI: <b>${t.bmi.toFixed(1)}</b> (${bmiCat})`, `Fiber goal: <b>${round(t.fiber)}</b> g`,
    `Water: about <b>${t.water.toFixed(1)}</b> L`,
    ...(t.floored ? ["Your target was raised to a safe minimum — don't eat below it without medical supervision."] : []),
  ].map((x) => `<li>${x}</li>`).join("");
}

// ---------- plan generation ----------
function slots(snacks) {
  return snacks === 0 ? [["breakfast", .28], ["lunch", .38], ["dinner", .34]]
    : snacks === 1 ? [["breakfast", .25], ["lunch", .33], ["dinner", .30], ["snack", .12]]
    : [["breakfast", .23], ["lunch", .30], ["dinner", .30], ["snack", .085], ["snack", .085]];
}
function pickRecipe(meal, kcalTarget, used, exclude = []) {
  const share = { p: targets.p * 4 / targets.kcal, c: targets.c * 4 / targets.kcal, f: targets.f * 9 / targets.kcal };
  const bias = $("usepantry").checked && pantry.size > 0;
  const pool = RECIPES.filter((r) => r.meal === meal && dietOK(r, profile.diet) && !exclude.includes(r.id));
  const scored = pool.map((r) => {
    const n = perServing(r), f = Math.min(2, Math.max(.5, kcalTarget / n.kcal));
    const s = { p: n.p * 4 / n.kcal, c: n.c * 4 / n.kcal, f: n.f * 9 / n.kcal };
    let score = Math.abs(s.p - share.p) + Math.abs(s.c - share.c) + Math.abs(s.f - share.f)
      + (used[r.id] || 0) * .2 + Math.abs(Math.log(f)) * .15;
    if (bias) score -= pantryMatch(r).ratio * .7;
    return { r, score, f: Math.round(f * 4) / 4 };
  }).sort((a, b) => a.score - b.score);
  const top = scored.slice(0, Math.min(3, scored.length));
  const c = top[Math.floor(Math.random() * top.length)];
  used[c.r.id] = (used[c.r.id] || 0) + 1;
  return { id: c.r.id, meal, servings: c.f, target: kcalTarget };
}
function buildWeek() {
  const used = {};
  week = Array.from({ length: 7 }, () =>
    slots(profile.snacks).map(([m, sh]) => pickRecipe(m, targets.kcal * sh, used)));
  day = 0;
}
const recipeById = (id) => RECIPES.find((r) => r.id === id);
function entryNutrition(e) {
  const n = perServing(recipeById(e.id));
  return { kcal: n.kcal * e.servings, p: n.p * e.servings, c: n.c * e.servings, f: n.f * e.servings };
}
function renderPlan() {
  $("days").innerHTML = week.map((_, i) =>
    `<button class="tab${i === day ? " on" : ""}" data-day="${i}">Day ${i + 1}</button>`).join("");
  const d = week[day];
  const tot = d.reduce((a, e) => { const n = entryNutrition(e); for (const k in n) a[k] = (a[k] || 0) + n[k]; return a; }, {});
  const bar = (label, v, t, cls) => `<div class="bar"><span>${label} <b>${round(v)}</b> / ${round(t)}${label === "Calories" ? "" : " g"}</span><i class="${cls}" style="width:${Math.min(100, v / t * 100)}%"></i></div>`;
  $("daytotals").innerHTML = bar("Calories", tot.kcal, targets.kcal, "k") + bar("Carbs", tot.c, targets.c, "c") +
    bar("Protein", tot.p, targets.p, "p") + bar("Fat", tot.f, targets.f, "f");
  $("meals").innerHTML = d.map((e, i) => {
    const r = recipeById(e.id), n = entryNutrition(e), pm = pantry.size ? pantryMatch(r) : null;
    return `<article class="meal">
      <div class="emoji">${r.emoji}</div>
      <div class="mbody">
        <small class="tag">${e.meal}</small>
        <h3><a href="#" data-open="${r.id}" data-serv="${e.servings}">${r.name}</a></h3>
        <p class="muted">${e.servings} serving${e.servings === 1 ? "" : "s"} · ${r.time} min${pm ? ` · you have ${pm.have}/${pm.total} ingredients` : ""}</p>
        <p class="mac"><b>${round(n.kcal)}</b> kcal · C ${round(n.c)}g · P ${round(n.p)}g · F ${round(n.f)}g</p>
      </div>
      <div class="acts"><button class="ghost" data-open="${r.id}" data-serv="${e.servings}">Recipe</button>
      <button class="ghost" data-swap="${i}">Swap</button></div></article>`;
  }).join("");
}

// ---------- recipe modal ----------
function openRecipe(id, servings = 1) {
  const r = recipeById(id), n = perServing(r);
  const pm = pantry.size ? pantryMatch(r) : null;
  $("mbody").innerHTML = `
    <div class="mhead"><span class="big">${r.emoji}</span><div><small class="tag">${r.meal} · ${r.diet === "vegan" ? "vegan" : r.diet === "veg" ? "vegetarian" : "contains meat/fish"}</small>
    <h2 id="mtitle">${r.name}</h2><p class="muted">${r.time} min · ${servings} serving${servings === 1 ? "" : "s"}</p></div></div>
    <div class="mmac"><div><b>${round(n.kcal * servings)}</b>kcal</div><div><b>${round(n.c * servings)} g</b>carbs</div><div><b>${round(n.p * servings)} g</b>protein</div><div><b>${round(n.f * servings)} g</b>fat</div></div>
    <h3>Ingredients</h3>
    <ul class="ings">${r.ing.map(([k, g]) => `<li class="${pm ? (pantry.has(k) || STAPLES.has(k) ? "have" : "miss") : ""}">${fmtIng(k, g * servings)}</li>`).join("")}</ul>
    ${pm ? `<p class="muted">Green = you have it · red = you need to buy it.</p>` : ""}
    <h3>Method</h3><ol class="steps">${r.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
    <p class="note">Amounts are for ${servings} serving${servings === 1 ? "" : "s"}; quantities of cooked foods (rice, quinoa, pasta, beans) are cooked weights.</p>`;
  $("modal").hidden = false; document.body.classList.add("noscroll");
}
const closeModal = () => { $("modal").hidden = true; document.body.classList.remove("noscroll"); };

// ---------- recipe lists ----------
function card(r, extra = "") {
  const n = perServing(r);
  return `<article class="rcard" data-open="${r.id}" data-serv="1" tabindex="0">
    <div class="emoji">${r.emoji}</div><div class="mbody"><small class="tag">${r.meal}${r.diet !== "any" ? " · " + (r.diet === "veg" ? "vegetarian" : "vegan") : ""}</small>
    <h3>${r.name}</h3><p class="mac"><b>${round(n.kcal)}</b> kcal · C ${round(n.c)}g · P ${round(n.p)}g · F ${round(n.f)}g</p>${extra}</div></article>`;
}
function renderAll() {
  const q = $("q").value.trim().toLowerCase(), m = $("fmeal").value, d = $("fdiet").value;
  const list = RECIPES.filter((r) => (!m || r.meal === m) && dietOK(r, d) &&
    (!q || r.name.toLowerCase().includes(q) || r.ing.some(([k]) => INGREDIENTS[k].n.includes(q))));
  $("rlist").innerHTML = list.map((r) => card(r)).join("") || `<p class="muted">No recipes match.</p>`;
}
function renderPantry() {
  $("pantrygroups").innerHTML = Object.entries(GROUPS).map(([g, keys]) =>
    `<div class="pgroup"><h4>${g}</h4><div class="chips">${keys.map((k) =>
      `<button type="button" class="chip${pantry.has(k) ? " on" : ""}" data-ing="${k}">${cap(INGREDIENTS[k].n.replace(/ \(raw weight\)|cooked |, drained/g, ""))}</button>`).join("")}</div></div>`).join("");
  const m = $("pmeal").value, d = $("pdiet").value, onlyOK = $("pall").checked;
  let list = RECIPES.filter((r) => (!m || r.meal === m) && dietOK(r, d)).map((r) => ({ r, pm: pantryMatch(r) }));
  if (onlyOK) list = list.filter((x) => x.pm.ratio >= 0.6 && pantry.size);
  list.sort((a, b) => b.pm.ratio - a.pm.ratio || a.pm.missing.length - b.pm.missing.length);
  $("pcount").textContent = pantry.size ? `(${list.length})` : "";
  $("plist").innerHTML = !pantry.size ? `<p class="muted">Pick some ingredients above to see matching recipes.</p>`
    : list.map(({ r, pm }) => card(r, `<p class="match ${pm.missing.length === 0 ? "full" : ""}">${pm.missing.length === 0 ? "✅ You have everything" : `You have ${pm.have}/${pm.total} · need: ${pm.missing.map((k) => INGREDIENTS[k].n.replace(/ \(raw weight\)|cooked |, drained/g, "")).join(", ")}`}</p>`)).join("")
      || `<p class="muted">Nothing matches yet — add more ingredients or untick the filter to see partial matches.</p>`;
}
function afterPantryChange() {
  store.set("pantry", [...pantry]); renderPantry();
  if (week.length) renderPlan();
}

// ---------- events ----------
$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  profile = readForm();
  if (!(profile.kg > 20 && profile.kg < 400 && profile.cm > 100 && profile.cm < 250 && profile.age >= 15)) {
    alert("Please enter realistic values (age 15+, valid height and weight)."); return;
  }
  store.set("profile", { ...profile });
  targets = calcTargets(profile); showTargets(); buildWeek(); renderPlan();
  $("results").hidden = false; $("results").scrollIntoView({ behavior: "smooth" });
});
$("units").addEventListener("change", () => {
  const imp = $("units").value === "imperial", w = +$("weight").value, h = +$("height").value;
  $("weight").value = (imp ? w / 0.45359237 : w * 0.45359237).toFixed(1);
  $("height").value = (imp ? h / 2.54 : h * 2.54).toFixed(1);
  $("wlabel").textContent = imp ? "Weight (lb)" : "Weight (kg)"; $("hlabel").textContent = imp ? "Height (in)" : "Height (cm)";
});
$("shuffle").addEventListener("click", () => { buildWeek(); renderPlan(); });
$("days").addEventListener("click", (e) => { const b = e.target.closest("[data-day]"); if (b) { day = +b.dataset.day; renderPlan(); } });
document.addEventListener("click", (e) => {
  const sw = e.target.closest("[data-swap]");
  if (sw) {
    const i = +sw.dataset.swap, cur = week[day][i], used = {};
    week[day][i] = pickRecipe(cur.meal, cur.target, used, [cur.id]); renderPlan(); return;
  }
  const o = e.target.closest("[data-open]");
  if (o) { e.preventDefault(); openRecipe(o.dataset.open, +o.dataset.serv || 1); return; }
  const c = e.target.closest("[data-ing]");
  if (c) { const k = c.dataset.ing; pantry.has(k) ? pantry.delete(k) : pantry.add(k); afterPantryChange(); }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if (e.key === "Enter" && e.target.classList?.contains("rcard")) openRecipe(e.target.dataset.open);
});
$("mclose").addEventListener("click", closeModal);
$("modal").addEventListener("click", (e) => { if (e.target === $("modal")) closeModal(); });
$("clearpantry").addEventListener("click", () => { pantry.clear(); afterPantryChange(); });
["pmeal", "pdiet", "pall"].forEach((id) => $(id).addEventListener("change", renderPantry));
$("usepantry").addEventListener("change", () => { if (week.length) { buildWeek(); renderPlan(); } });
["q", "fmeal", "fdiet"].forEach((id) => $(id).addEventListener("input", renderAll));

// restore saved profile
const saved = store.get("profile", null);
if (saved) {
  $("units").value = saved.units; $("sex").value = saved.sex; $("age").value = saved.age;
  $("height").value = saved.rawH; $("weight").value = saved.rawW; $("activity").value = String(saved.act);
  $("goal").value = saved.goal; $("diet").value = saved.diet; $("snacks").value = String(saved.snacks);
  const imp = saved.units === "imperial";
  $("wlabel").textContent = imp ? "Weight (lb)" : "Weight (kg)"; $("hlabel").textContent = imp ? "Height (in)" : "Height (cm)";
}
renderAll(); renderPantry();
