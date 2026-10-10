const $ = (id) => document.getElementById(id);
const MEALS = ["breakfast", "lunch", "dinner", "snack"];
let lang = store_lang();
function store_lang() {
  try { const l = localStorage.getItem("lang"); if (l) return JSON.parse(l); } catch {}
  return (navigator.language || "en").toLowerCase().startsWith("ar") ? "ar" : "en";
}
const t = (k, ...a) => { const v = (I18N[lang][k] ?? I18N.en[k] ?? k); return typeof v === "function" ? v(...a) : v; };
const AR = () => lang === "ar";
const iname = (k) => (AR() ? AR_ING[k] : INGREDIENTS[k].n);
const iShort = (k) => (AR() ? AR_ING[k] : INGREDIENTS[k].n.replace(/ \(raw weight\)|cooked |, drained/g, "")).replace(/^./, (c) => c.toUpperCase());
const rname = (r) => (AR() ? AR_REC[r.id].n : r.name);
const rsteps = (r) => (AR() ? AR_REC[r.id].s : r.steps);
const pname = (k) => (AR() ? AR_PIECE[k] : INGREDIENTS[k].pn);
const unit = (k) => (INGREDIENTS[k].ml ? t("ml") : t("g"));
const macLine = (n) => `<b>${round(n.kcal)}</b> ${t("kcal")} · ${t("carbs")} ${round(n.c)} ${t("g")} · ${t("protein")} ${round(n.p)} ${t("g")} · ${t("fat")} ${round(n.f)} ${t("g")}`;
const STAPLES = new Set(["oil", "lemon", "soy"]); // assumed to be in every kitchen
const GROUPS = {
  g_meat: ["lamb", "chicken", "beef", "turkey", "pork", "deli", "salmon", "cod", "tilapia", "tuna", "sardines", "shrimp"],
  g_dairy: ["egg", "labneh", "milk", "yogurt", "cottage", "ricotta", "feta", "mozzarella", "parmesan", "soymilk", "tofu", "tempeh", "edamame", "whey"],
  g_grains: ["oats", "rice", "quinoa", "bulgur", "freekeh", "couscous", "pasta", "soba", "ricenoodles", "bread", "pita", "tortilla"],
  g_beans: ["lentils", "chickpeas", "blackbeans", "kidney", "whitebeans", "ful", "hummus"],
  g_veg: ["parsley", "okra", "molokhia", "grapeleaves", "broccoli", "spinach", "kale", "tomato", "cucumber", "zucchini", "pepper", "onion", "carrot", "mushrooms", "cauliflower", "cabbage", "asparagus", "greenbeans", "eggplant", "peas", "corn", "potato", "sweetpotato", "squash", "greens", "avocado"],
  g_fruit: ["banana", "apple", "orange", "blueberries", "strawberries", "raspberries", "mango", "pineapple", "dates"],
  g_nuts: ["zaatar", "almonds", "walnuts", "cashews", "pb", "tahini", "chia", "flax", "pumpkinseeds", "cocoa", "coconut", "honey", "maple"],
};
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
let prefs = store.get("prefs", {}); // recipe id -> 1 (like) | -1 (dislike)
let pantry = new Set(store.get("pantry", []));
let profile = null, targets = null, week = [], day = 0;

// ---------- likes / dislikes ----------
const prefBtns = (id) => `<span class="prefs"><button type="button" class="pref${prefs[id] === 1 ? " on up" : ""}" data-pref="${id}" data-v="1" aria-label="${t("like")}" aria-pressed="${prefs[id] === 1}" title="${t("like")}">👍</button><button type="button" class="pref${prefs[id] === -1 ? " on down" : ""}" data-pref="${id}" data-v="-1" aria-label="${t("dislike")}" aria-pressed="${prefs[id] === -1}" title="${t("dislike")}">👎</button></span>`;
function setPref(id, v) {
  if (prefs[id] === v) delete prefs[id]; else prefs[id] = v;
  store.set("prefs", prefs);
  if (v === -1 && prefs[id] === -1 && week.length) { // swap out any planned meal using it
    week.forEach((d, di) => d.forEach((e, i) => { if (e.id === id) d[i] = pickRecipe(e.meal, e.target, {}, [id]); }));
  }
  if (M) { const el = $("mprefs"); if (el) el.innerHTML = prefBtns(M.r.id); }
  if (week.length) renderPlan();
  applyLang();
}
const sortByPref = (a, b) => (prefs[b.id] || 0) - (prefs[a.id] || 0);

// ---------- nutrition helpers ----------
function perServing(r) {
  if (r._n) return r._n;
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  for (const [k, g] of r.ing) {
    const v = INGREDIENTS[k].v, w = g * (INGREDIENTS[k].d || 1); // ml -> grams
    t.kcal += v[0] * w / 100; t.p += v[1] * w / 100; t.c += v[2] * w / 100; t.f += v[3] * w / 100;
  }
  return (r._n = t);
}
const dietOK = (r, d) => d === "any" || (d === "veg" && r.diet !== "any") || (d === "vegan" && r.diet === "vegan");
const round = (x) => Math.round(x);
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
  // protein per kg of body weight, but never more than 35% of calories (matters for heavier people)
  const prot = Math.min(p.kg * (p.goal === "lose" ? 2.0 : p.goal === "gain" ? 1.8 : 1.6), kcal * 0.35 / 4);
  // fat ~25% of calories, at least 0.6 g/kg and never above 35% of calories
  const fat = Math.min(Math.max(kcal * 0.25 / 9, p.kg * 0.6), kcal * 0.35 / 9);
  const carb = Math.max(0, (kcal - prot * 4 - fat * 9) / 4);
  return { bmr, tdee, kcal, p: prot, f: fat, c: carb, floored,
           bmi: p.kg / Math.pow(p.cm / 100, 2), fiber: kcal / 1000 * 14, water: p.kg * 0.035 };
}
function readForm() {
  const imp = $("units").value === "imperial";
  const w = parseFloat($("weight").value), h = parseFloat($("height").value);
  return { sex: $("sex").value, age: +$("age").value, kg: imp ? w * 0.45359237 : w, cm: imp ? h * 2.54 : h,
           act: +$("activity").value, goal: $("goal").value, diet: $("diet").value, cuisine: $("cuisine").value, snacks: +$("snacks").value,
           units: $("units").value, rawW: w, rawH: h };
}
function showTargets() {
  const T = targets;
  if (!T.auto) T.auto = { kcal: T.kcal, c: T.c, p: T.p, f: T.f };
  $("tkcal").textContent = round(T.kcal);
  $("tkunit").textContent = T.custom ? I18N[lang].kcal_day_custom : I18N[lang].kcal_day;
  [["gk", T.kcal], ["gc", T.c], ["gp", T.p], ["gf", T.f]].forEach(([id, v]) => { if (document.activeElement !== $(id)) $(id).value = round(v); });
  const cp = T.c * 4 / T.kcal * 100, pp = T.p * 4 / T.kcal * 100;
  $("gsplit").textContent = I18N[lang].split(round(cp), round(pp), round(100 - cp - pp));
  $("donut").style.background = `conic-gradient(var(--c) 0 ${cp}%, var(--p) ${cp}% ${cp + pp}%, var(--f) ${cp + pp}% 100%)`;
  if (T.bmr === undefined) { $("facts").innerHTML = `<li>${I18N[lang].f_custom}</li>`; return; }
  const L = I18N[lang], bmiCat = T.bmi < 18.5 ? L.bmi_under : T.bmi < 25 ? L.bmi_ok : T.bmi < 30 ? L.bmi_over : L.bmi_obese;
  $("facts").innerHTML = [
    L.f_bmr(round(T.bmr)), L.f_tdee(round(T.tdee)), L.f_bmi(T.bmi.toFixed(1), bmiCat), L.f_fiber(round(T.fiber)), L.f_water(T.water.toFixed(1)),
    ...(T.floored ? [L.f_floor] : []),
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
  const pool = RECIPES.filter((r) => r.meal === meal && dietOK(r, profile.diet) && !exclude.includes(r.id) && (profile.cuisine !== "arabic" || r.cuisine === "arabic"));
  const allowed = pool.filter((r) => prefs[r.id] !== -1);
  if (allowed.length) pool.splice(0, pool.length, ...allowed);
  const scored = pool.map((r) => {
    const n = perServing(r), f = Math.min(3, Math.max(.5, kcalTarget / n.kcal));
    const s = { p: n.p * 4 / n.kcal, c: n.c * 4 / n.kcal, f: n.f * 9 / n.kcal };
    let score = Math.abs(s.p - share.p) + Math.abs(s.c - share.c) + Math.abs(s.f - share.f)
      + (used[r.id] || 0) * .2 + Math.abs(Math.log(f)) * .15;
    if (bias) score -= pantryMatch(r).ratio * .7;
    if (prefs[r.id] === 1) score -= .5;
    return { r, score, f: Math.round(f * 4) / 4 };
  }).sort((a, b) => a.score - b.score);
  const top = scored.slice(0, Math.min(3, scored.length));
  const c = top[Math.floor(Math.random() * top.length)];
  used[c.r.id] = (used[c.r.id] || 0) + 1;
  return { id: c.r.id, meal, servings: c.f, target: kcalTarget };
}
// Rescale one day's servings so its calories hit the target (servings stay in 0.25 steps).
function calibrateDay(d) {
  const kcal = d.reduce((a, e) => a + perServing(recipeById(e.id)).kcal * e.servings, 0);
  const f = targets.kcal / kcal;
  d.forEach((e) => { e.servings = Math.min(4, Math.max(0.25, Math.round(e.servings * f * 4) / 4)); });
}
function dayError(d) {
  const tot = d.reduce((a, e) => { const n = entryNutrition(e); for (const k in n) a[k] = (a[k] || 0) + n[k]; return a; }, {});
  return Math.abs(tot.kcal / targets.kcal - 1) * 2 + Math.abs(tot.p / targets.p - 1) + Math.abs(tot.c / targets.c - 1) + Math.abs(tot.f / targets.f - 1);
}
function buildWeek() {
  const used = {};
  // for each day, try many random combinations and keep the one closest to the calorie and macro targets
  week = Array.from({ length: 7 }, () => {
    let best = null, bestErr = Infinity;
    for (let i = 0; i < 40; i++) {
      const u = { ...used };
      const d = slots(profile.snacks).map(([m, sh]) => pickRecipe(m, targets.kcal * sh, u));
      calibrateDay(d);
      const err = dayError(d);
      if (err < bestErr) { best = d; bestErr = err; }
    }
    best.forEach((e) => (used[e.id] = (used[e.id] || 0) + 1));
    return best;
  });
  day = 0;
}
const recipeById = (id) => RECIPES.find((r) => r.id === id);
function nutFromAmounts(r, amt) {
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  for (const [k] of r.ing) {
    const v = INGREDIENTS[k].v, g = (amt[k] || 0) * (INGREDIENTS[k].d || 1);
    t.kcal += v[0] * g / 100; t.p += v[1] * g / 100; t.c += v[2] * g / 100; t.f += v[3] * g / 100;
  }
  return t;
}
function entryWeight(e) {
  const r = recipeById(e.id);
  return e.custom ? r.ing.reduce((a, [k]) => a + (e.custom[k] || 0), 0) : r.ing.reduce((a, [, g]) => a + g * e.servings, 0);
}
function entryNutrition(e) {
  if (e.custom) return nutFromAmounts(recipeById(e.id), e.custom);
  const n = perServing(recipeById(e.id));
  return { kcal: n.kcal * e.servings, p: n.p * e.servings, c: n.c * e.servings, f: n.f * e.servings };
}
function renderPlan() {
  $("days").innerHTML = week.map((_, i) =>
    `<button class="tab${i === day ? " on" : ""}" data-day="${i}">${t("day_n", i + 1)}</button>`).join("");
  const d = week[day];
  const tot = d.reduce((a, e) => { const n = entryNutrition(e); for (const k in n) a[k] = (a[k] || 0) + n[k]; return a; }, {});
  const bar = (label, v, goal, cls, u) => `<div class="bar"><span>${label} <b>${round(v)}</b> / ${round(goal)} ${u}</span><i class="${cls}" style="width:${Math.min(100, v / goal * 100)}%"></i></div>`;
  $("daytotals").innerHTML = bar(t("calories"), tot.kcal, targets.kcal, "k", t("kcal")) + bar(t("carbs"), tot.c, targets.c, "c", t("g")) +
    bar(t("protein"), tot.p, targets.p, "p", t("g")) + bar(t("fat"), tot.f, targets.f, "f", t("g"));
  $("meals").innerHTML = d.map((e, i) => {
    const r = recipeById(e.id), n = entryNutrition(e), pm = pantry.size ? pantryMatch(r) : null;
    return `<article class="meal">
      <div class="emoji">${r.emoji}</div>
      <div class="mbody">
        <small class="tag">${t(e.meal)}</small>
        <h3><a href="#" data-open="${r.id}" data-ref="${i}">${rname(r)}</a></h3>
        <p class="muted"><span class="step"><button type="button" data-serv-dn="${i}" aria-label="${t("less")}">−</button><b>${e.custom ? t("custom") : e.servings}</b><button type="button" data-serv-up="${i}" aria-label="${t("more")}">+</button></span> ${e.custom ? t("amounts") : e.servings === 1 ? t("serving") : t("servings_pl")} · ${r.time} ${t("min")} · ${round(entryWeight(e))} ${t("g")}${pm ? ` · ${t("have_n", pm.have, pm.total)}` : ""}</p>
        <p class="mac">${macLine(n)}</p>
      </div>
      <div class="acts"><button class="ghost" data-open="${r.id}" data-ref="${i}">${t("recipe")}</button>
      <button class="ghost edit" data-open="${r.id}" data-ref="${i}" data-edit="1">${t("edit_amounts")}</button>
      <button class="ghost" data-swap="${i}">${t("swap")}</button>${prefBtns(r.id)}</div></article>`;
  }).join("");
}

// ---------- recipe modal ----------
let M = null; // open modal state: { r, amt, ref }
const step = (g, ing) => (ing.piece ? ing.piece / 2 : g < 30 ? 1 : 5);
function openRecipe(id, servings = 1, ref = null) {
  const r = recipeById(id);
  let amt;
  const entry = ref !== null ? week[day][ref] : null;
  if (entry && entry.custom) amt = { ...entry.custom };
  else { amt = {}; const f = entry ? entry.servings : servings; r.ing.forEach(([k, g]) => (amt[k] = g * f)); }
  M = { r, amt, entry };
  const pm = pantry.size ? pantryMatch(r) : null;
  const dietTag = r.diet === "vegan" ? t("t_vegan") : r.diet === "veg" ? t("t_veg") : t("t_meat");
  $("mbody").innerHTML = `
    <div class="mhead"><span class="big">${r.emoji}</span><div><small class="tag">${r.cuisine === "arabic" ? t("arabic") + " · " : ""}${t(r.meal)} · ${dietTag}</small>
    <h2 id="mtitle">${rname(r)}</h2><p class="muted">${r.time} ${t("min")}</p><span id="mprefs">${prefBtns(r.id)}</span></div></div>
    <div class="mmac"><div><b id="mk"></b>${t("kcal")}</div><div><b id="mc"></b>${t("carbs")}</div><div><b id="mp"></b>${t("protein")}</div><div><b id="mf"></b>${t("fat")}</div></div>
    <div class="servrow"><label>${t("m_servings")}
      <span class="step big"><button type="button" id="sdn" aria-label="${t("less")}">−</button><input id="sinp" type="number" min="0.25" max="10" step="0.25"><button type="button" id="sup" aria-label="${t("more")}">+</button></span></label>
      <label>${t("m_weight")}
      <span class="step big"><input id="wtot" type="number" min="10" step="10"></span></label>
      <button type="button" class="ghost" id="sreset">${t("m_reset")}</button></div>
    <h3>${t("m_ingredients")} <span class="muted">${t("m_edit_any")}</span></h3>
    <ul class="ings edit">${r.ing.map(([k]) => {
      return `<li class="${pm ? (pantry.has(k) || STAPLES.has(k) ? "have" : "miss") : ""}">
        <span class="step"><button type="button" data-adj="${k}" data-dir="-1" aria-label="${t("less")} ${iname(k)}">−</button>
        <input type="number" min="0" step="1" data-amt="${k}" aria-label="${iname(k)}">
        <button type="button" data-adj="${k}" data-dir="1" aria-label="${t("more")} ${iname(k)}">+</button></span>
        <span class="unit">${unit(k)}</span><span class="iname">${iname(k)}<em data-pc="${k}"></em></span></li>`; }).join("")}</ul>
    ${pm ? `<p class="muted">${t("m_legend")}</p>` : ""}
    <h3>${t("m_method")}</h3><ol class="steps">${rsteps(r).map((x) => `<li>${x}</li>`).join("")}</ol>
    <p class="note">${t("m_note", !!entry)}</p>`;
  refreshModal();
  $("modal").hidden = false; document.body.classList.add("noscroll");
}
function totalFactor() {
  const r = M.r, base = r.ing.reduce((a, [k, g]) => a + g, 0);
  return r.ing.reduce((a, [k]) => a + (M.amt[k] || 0), 0) / base;
}
function refreshModal(skip) {
  const n = nutFromAmounts(M.r, M.amt);
  $("mk").textContent = round(n.kcal); $("mc").textContent = `${round(n.c)} ${t("g")}`; $("mp").textContent = `${round(n.p)} ${t("g")}`; $("mf").textContent = `${round(n.f)} ${t("g")}`;
  if (skip !== "sinp") $("sinp").value = Math.round(totalFactor() * 100) / 100;
  if (skip !== "wtot") $("wtot").value = Math.round(M.r.ing.reduce((a, [k]) => a + (M.amt[k] || 0), 0));
  M.r.ing.forEach(([k]) => {
    const inp = document.querySelector(`[data-amt="${k}"]`), ing = INGREDIENTS[k], g = M.amt[k] || 0;
    if (skip !== k) inp.value = Math.round(g * 10) / 10;
    document.querySelector(`[data-pc="${k}"]`).textContent = ing.piece ? ` (≈ ${Math.round(g / ing.piece * 10) / 10} ${pname(k)})` : "";
  });
  if (M.entry) { M.entry.custom = { ...M.amt }; M.entry.servings = Math.round(totalFactor() * 4) / 4 || 0.25; }
}
function setServings(f) {
  f = Math.min(10, Math.max(0.25, f));
  M.r.ing.forEach(([k, g]) => (M.amt[k] = Math.round(g * f * 10) / 10));
  if (M.entry) delete M.entry.custom;
  refreshModal(); if (M.entry) M.entry.custom = { ...M.amt };
}
const closeModal = () => { if ($("modal").hidden) return; $("modal").hidden = true; document.body.classList.remove("noscroll"); M = null; if (week.length) renderPlan(); };

// ---------- recipe lists ----------
function card(r, extra = "") {
  const n = perServing(r);
  return `<article class="rcard${prefs[r.id] === -1 ? " disliked" : ""}" data-open="${r.id}" data-serv="1" tabindex="0">
    <div class="emoji">${r.emoji}</div><div class="mbody"><small class="tag">${r.cuisine === "arabic" ? t("arabic") + " · " : ""}${t(r.meal)}${r.diet !== "any" ? " · " + (r.diet === "veg" ? t("t_veg") : t("t_vegan")) : ""}</small>
    <h3>${rname(r)}</h3><p class="mac">${macLine(n)}</p>${extra}${prefBtns(r.id)}</div></article>`;
}
function renderAll() {
  const q = $("q").value.trim().toLowerCase(), m = $("fmeal").value, d = $("fdiet").value, cu = $("fcuisine").value;
  const list = RECIPES.filter((r) => (!m || r.meal === m) && dietOK(r, d) && (!cu || r.cuisine === cu) &&
    (!q || r.name.toLowerCase().includes(q) || AR_REC[r.id].n.includes(q) || r.ing.some(([k]) => INGREDIENTS[k].n.includes(q) || AR_ING[k].includes(q))));
  const fp = $("fpref").value;
  const shown = list.filter((r) => fp === "liked" ? prefs[r.id] === 1 : fp === "hide" ? prefs[r.id] !== -1 : true).sort(sortByPref);
  $("rlist").innerHTML = shown.map((r) => card(r)).join("") || `<p class="muted">${t("no_match")}</p>`;
}
function renderPantry() {
  $("pantrygroups").innerHTML = Object.entries(GROUPS).map(([g, keys]) =>
    `<div class="pgroup"><h4>${t(g)}</h4><div class="chips">${keys.map((k) =>
      `<button type="button" class="chip${pantry.has(k) ? " on" : ""}" data-ing="${k}">${iShort(k)}</button>`).join("")}</div></div>`).join("");
  const m = $("pmeal").value, d = $("pdiet").value, onlyOK = $("pall").checked;
  let list = RECIPES.filter((r) => (!m || r.meal === m) && dietOK(r, d)).map((r) => ({ r, pm: pantryMatch(r) }));
  if (onlyOK) list = list.filter((x) => x.pm.ratio >= 0.6 && pantry.size);
  list.sort((a, b) => b.pm.ratio - a.pm.ratio || a.pm.missing.length - b.pm.missing.length);
  $("pcount").textContent = pantry.size ? `(${list.length})` : "";
  $("plist").innerHTML = !pantry.size ? `<p class="muted">${t("pick_some")}</p>`
    : list.map(({ r, pm }) => card(r, `<p class="match ${pm.missing.length === 0 ? "full" : ""}">${pm.missing.length === 0 ? t("have_all") : t("need", pm.have, pm.total, pm.missing.map(iShort).join(AR() ? "، " : ", "))}</p>`)).join("")
      || `<p class="muted">${t("nothing_yet")}</p>`;
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
    alert(t("alert_bad")); return;
  }
  store.set("profile", { ...profile });
  targets = calcTargets(profile); store.set("goals", null); showTargets(); buildWeek(); renderPlan();
  $("results").hidden = false; $("results").scrollIntoView({ behavior: "smooth" });
});
$("custom").addEventListener("click", () => {
  profile = readForm();
  const ok = profile.kg > 20 && profile.kg < 400 && profile.cm > 100 && profile.cm < 250 && profile.age >= 15;
  if (ok) { targets = calcTargets(profile); }
  else targets = { kcal: 2000, p: 125, f: 56, c: 249 }; // starting point when no body details are given
  targets.auto = { kcal: targets.kcal, c: targets.c, p: targets.p, f: targets.f };
  targets.custom = true;
  showTargets(); buildWeek(); renderPlan();
  $("results").hidden = false; $("results").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => $("gk").focus(), 400);
});
$("units").addEventListener("change", () => {
  const imp = $("units").value === "imperial", w = +$("weight").value, h = +$("height").value;
  $("weight").value = (imp ? w / 0.45359237 : w * 0.45359237).toFixed(1);
  $("height").value = (imp ? h / 2.54 : h * 2.54).toFixed(1);
  setUnitLabels();
});
function onGoalInput(id) {
  const v = parseFloat($(id).value);
  if (!(v >= 0) || !targets) return;
  const t = targets;
  if (id === "gk") { if (v < 500) return; const r = v / t.kcal; t.c *= r; t.p *= r; t.f *= r; t.kcal = v; }
  else { t[{ gc: "c", gp: "p", gf: "f" }[id]] = v; t.kcal = t.c * 4 + t.p * 4 + t.f * 9; }
  if (t.kcal < 500) return;
  t.custom = true; store.set("goals", { kcal: t.kcal, c: t.c, p: t.p, f: t.f });
  showTargets(); // refreshes donut and the other fields, leaves the one being typed in
  if (week.length) renderPlan();
}
["gk", "gc", "gp", "gf"].forEach((id) => {
  $(id).addEventListener("input", () => onGoalInput(id));
  $(id).addEventListener("change", () => { if (targets && week.length) { showTargets(); buildWeek(); renderPlan(); } });
});
$("greset").addEventListener("click", () => {
  if (!targets) return;
  Object.assign(targets, targets.auto, { custom: false }); store.set("goals", null);
  showTargets(); buildWeek(); renderPlan();
});
$("shuffle").addEventListener("click", () => { buildWeek(); renderPlan(); });
$("days").addEventListener("click", (e) => { const b = e.target.closest("[data-day]"); if (b) { day = +b.dataset.day; renderPlan(); } });
document.addEventListener("click", (e) => {
  const pf = e.target.closest("[data-pref]");
  if (pf) { e.stopPropagation(); setPref(pf.dataset.pref, +pf.dataset.v); return; }
  const sw = e.target.closest("[data-swap]");
  if (sw) {
    const i = +sw.dataset.swap, cur = week[day][i], used = {};
    week[day][i] = pickRecipe(cur.meal, cur.target, used, [cur.id]); renderPlan(); return;
  }
  const dn = e.target.closest("[data-serv-dn]"), up = e.target.closest("[data-serv-up]");
  if (dn || up) {
    const en = week[day][+(dn || up).dataset[dn ? "servDn" : "servUp"]], cur = en.custom ? Math.round(entryNutrition(en).kcal / perServing(recipeById(en.id)).kcal * 4) / 4 : en.servings;
    delete en.custom; en.servings = Math.min(10, Math.max(0.25, cur + (up ? 0.25 : -0.25))); renderPlan(); return;
  }
  if (M) {
    if (e.target.id === "sdn") return setServings(totalFactor() - 0.25);
    if (e.target.id === "sup") return setServings(totalFactor() + 0.25);
    if (e.target.id === "sreset") return setServings(1);
    const adj = e.target.closest("[data-adj]");
    if (adj) { const k = adj.dataset.adj, ing = INGREDIENTS[k];
      M.amt[k] = Math.max(0, Math.round(((M.amt[k] || 0) + step(M.amt[k] || 0, ing) * +adj.dataset.dir) * 10) / 10); refreshModal(); return; }
  }
  const o = e.target.closest("[data-open]");
  if (o) { e.preventDefault(); openRecipe(o.dataset.open, +o.dataset.serv || 1, o.dataset.ref !== undefined ? +o.dataset.ref : null);
    if (o.dataset.edit) { const w = $("wtot"); w.scrollIntoView({ block: "center" }); w.focus(); w.select(); }
    return; }
  const c = e.target.closest("[data-ing]");
  if (c) { const k = c.dataset.ing; pantry.has(k) ? pantry.delete(k) : pantry.add(k); afterPantryChange(); }
});
document.addEventListener("input", (e) => {
  if (!M) return;
  if (e.target.id === "sinp") { const f = parseFloat(e.target.value); if (f > 0) { M.r.ing.forEach(([k, g]) => (M.amt[k] = Math.round(g * Math.min(10, f) * 10) / 10)); refreshModal("sinp"); } }
  if (e.target.id === "wtot") { const w = parseFloat(e.target.value), base = M.r.ing.reduce((a, [, g]) => a + g, 0);
    if (w > 0) { const f = Math.min(10, w / base); M.r.ing.forEach(([k, g]) => (M.amt[k] = Math.round(g * f * 10) / 10)); refreshModal("wtot"); } }
  const k = e.target.dataset?.amt;
  if (k) { M.amt[k] = Math.max(0, parseFloat(e.target.value) || 0); refreshModal(k); }
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
["q", "fmeal", "fdiet", "fcuisine", "fpref"].forEach((id) => $(id).addEventListener("input", renderAll));

function setUnitLabels() {
  const imp = $("units").value === "imperial";
  $("wlabel").textContent = t(imp ? "weight_lb" : "weight_kg"); $("hlabel").textContent = t(imp ? "height_in" : "height_cm");
}
// ---------- language ----------
function applyLang() {
  const root = document.documentElement;
  root.lang = lang; root.dir = AR() ? "rtl" : "ltr";
  document.title = t("title");
  document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll("[data-i18n-html]").forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
  $("mclose").setAttribute("aria-label", t("close"));
  setUnitLabels();
  closeModal();
  if (targets) showTargets();
  if (week.length) renderPlan();
  applyLang();
}
$("lang").addEventListener("click", () => { lang = AR() ? "en" : "ar"; store.set("lang", lang); applyLang(); });

// restore saved profile
const saved = store.get("profile", null);
if (saved) {
  $("units").value = saved.units; $("sex").value = saved.sex; $("age").value = saved.age;
  $("height").value = saved.rawH; $("weight").value = saved.rawW; $("activity").value = String(saved.act);
  $("goal").value = saved.goal; $("diet").value = saved.diet; $("cuisine").value = saved.cuisine || "any"; $("snacks").value = String(saved.snacks);
  const imp = saved.units === "imperial";
  setUnitLabels();
}
applyLang();
