// Recipe pictures: top-down plate illustrations drawn as SVG from each recipe's ingredients (not photographs).
(function () {
  const COL = {
    chicken: "#d9a066", beef: "#8a4b32", lamb: "#7a4030", turkey: "#b98a64", deli: "#e8a9a0", pork: "#d9a58a",
    salmon: "#f08a6b", cod: "#f1ead9", tilapia: "#efe4cf", sardines: "#9aa5ad", tuna: "#e7b9a5", shrimp: "#f3855f",
    tofu: "#f4e6bf", tempeh: "#d8c08a", chickpeas: "#d9b36a", lentils: "#9c6b3b", whitebeans: "#f1ead2", blackbeans: "#2f2a2a", kidney: "#8a2e2a", ful: "#9b7a4a", edamame: "#8fb34e",
    egg: "#fbf6e6", rice: "#efe3c6", quinoa: "#e6cf9a", bulgur: "#cfa46a", couscous: "#f0d79f", freekeh: "#a9824c", pasta: "#f1d98f", ricenoodles: "#f4ead2", soba: "#b49872",
    potato: "#eccb7c", sweetpotato: "#e68a3c", oats: "#e3cfa3", bread: "#d9b27c", pita: "#e8cfa0", tortilla: "#ead6a8",
    broccoli: "#3f8f3c", cauliflower: "#f3efe0", spinach: "#2e7d3a", kale: "#2f6b3b", greens: "#6fb34a", parsley: "#2f8a3c", asparagus: "#6aa84f", greenbeans: "#5a9f3c", peas: "#7fc05a", cucumber: "#9fcf7a",
    zucchini: "#7fae5a", pepper: "#d9382c", tomato: "#e0402f", carrot: "#f08a24", cabbage: "#b7d98a", corn: "#f6d23a", eggplant: "#5a2f6b", mushrooms: "#b79a7a", onion: "#e5c6dc", okra: "#7aa846", squash: "#e8a23a", grapeleaves: "#4f7f35",
    avocado: "#a6c45a", banana: "#f5de6a", apple: "#e5604f", orange: "#f59a2a", blueberries: "#3b4a8f", strawberries: "#e0334a", raspberries: "#c2255c", mango: "#f7a823", pineapple: "#f6d04d", dates: "#6b3d22",
    almonds: "#b98a55", walnuts: "#a67b4f", cashews: "#e3c58f", pumpkinseeds: "#6f8f3a", chia: "#3a3434", flax: "#8a5a30", pb: "#b97d3c", tahini: "#d9bd8a", cocoa: "#4a2b1c",
    yogurt: "#fbf8f1", cottage: "#f6f2e6", ricotta: "#f8f4ea", labneh: "#f6f1e3", feta: "#f7f3e8", mozzarella: "#f8f3e0", parmesan: "#f2dc9a", hummus: "#e6c88f", milk: "#fbfaf6", soymilk: "#f3ecd6", coconut: "#f6f2e6", honey: "#e8a82a", maple: "#b5651d", whey: "#f2e9d8",
    lemon: "#f7e45c", oil: "#e8d56a", soy: "#3b2418", zaatar: "#6b7a2f", lamb_: "#7a4030", molokhia: "#2a6b34",
  };
  const KIND = {
    chicken: "slices", beef: "slices", lamb: "slices", pork: "slices", deli: "slices", turkey: "crumbles", salmon: "fillet", cod: "fillet", tilapia: "fillet", sardines: "fillet", tuna: "crumbles", shrimp: "shrimp",
    tofu: "cubes", tempeh: "cubes", potato: "cubes", sweetpotato: "cubes", squash: "cubes", mango: "cubes", pineapple: "cubes", feta: "cubes", eggplant: "cubes", dates: "oval",
    chickpeas: "beans", lentils: "beans", whitebeans: "beans", blackbeans: "beans", kidney: "beans", ful: "beans", edamame: "beans", peas: "beans", corn: "beans", chia: "dots", flax: "dots", pumpkinseeds: "beans", almonds: "oval", walnuts: "oval", cashews: "oval",
    egg: "egg", rice: "grains", quinoa: "grains", bulgur: "grains", couscous: "grains", freekeh: "grains", oats: "grains", pasta: "noodles", ricenoodles: "noodles", soba: "noodles",
    broccoli: "florets", cauliflower: "florets", spinach: "leaves", kale: "leaves", greens: "leaves", parsley: "leaves", grapeleaves: "leaves", molokhia: "leaves", cabbage: "leaves",
    tomato: "rounds", cucumber: "rounds", carrot: "rounds", zucchini: "rounds", onion: "rounds", mushrooms: "rounds", okra: "rounds", banana: "rounds", orange: "rounds", apple: "slices2",
    pepper: "strips", asparagus: "strips", greenbeans: "strips",
    blueberries: "berries", strawberries: "berries", raspberries: "berries",
    yogurt: "dollop", cottage: "dollop", ricotta: "dollop", labneh: "dollop", hummus: "dollop", avocado: "dollop", mozzarella: "dollop", tahini: "dollop", pb: "dollop", parmesan: "dots",
    bread: "bread", pita: "flat", tortilla: "flat",
  };
  const HIDDEN = new Set(["oil", "lemon", "soy", "milk", "soymilk", "coconut", "honey", "maple", "whey", "cocoa", "zaatar"]);
  const BASES = new Set(["rice", "quinoa", "bulgur", "couscous", "freekeh", "pasta", "ricenoodles", "soba", "potato", "sweetpotato", "oats", "bread", "pita", "tortilla"]);

  const seedOf = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const mk = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); const c = (v) => Math.max(0, Math.min(255, Math.round(v * f))); return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`; };
  const f1 = (x) => Math.round(x * 10) / 10;

  // draw `n` pieces of one ingredient around (cx, cy) within radius rr
  function cluster(kind, col, cx, cy, rr, n, rnd) {
    let s = "";
    const pt = (spread = 1) => { const a = rnd() * 6.283, d = Math.sqrt(rnd()) * rr * spread; return [cx + Math.cos(a) * d, cy + Math.sin(a) * d]; };
    const edge = shade(col, 0.78);
    switch (kind) {
      case "slices": for (let i = 0; i < n; i++) { const [x, y] = pt(0.75); s += `<rect x="${f1(x - rr * 0.34)}" y="${f1(y - rr * 0.16)}" width="${f1(rr * 0.68)}" height="${f1(rr * 0.32)}" rx="${f1(rr * 0.14)}" fill="${col}" stroke="${edge}" stroke-width="1" transform="rotate(${Math.round(rnd() * 180)} ${f1(x)} ${f1(y)})"/>`; } break;
      case "slices2": for (let i = 0; i < n; i++) { const [x, y] = pt(0.75); s += `<path d="M${f1(x - rr * .3)} ${f1(y)} a${f1(rr * .3)} ${f1(rr * .3)} 0 0 1 ${f1(rr * .6)} 0 z" fill="${col}" stroke="${edge}" stroke-width="1" transform="rotate(${Math.round(rnd() * 360)} ${f1(x)} ${f1(y)})"/>`; } break;
      case "crumbles": for (let i = 0; i < n * 5; i++) { const [x, y] = pt(); s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rr * (0.07 + rnd() * 0.07))}" fill="${rnd() > .5 ? col : edge}"/>`; } break;
      case "fillet": { s += `<ellipse cx="${cx}" cy="${cy}" rx="${f1(rr * 0.95)}" ry="${f1(rr * 0.55)}" fill="${col}" stroke="${edge}" stroke-width="1.2" transform="rotate(${Math.round(rnd() * 60 - 30)} ${cx} ${cy})"/>`; for (let i = -2; i <= 2; i++) s += `<path d="M${f1(cx + i * rr * .3 - rr * .08)} ${f1(cy - rr * .32)} q${f1(rr * .12)} ${f1(rr * .32)} 0 ${f1(rr * .64)}" stroke="${shade(col, 1.15)}" stroke-width="1.6" fill="none" opacity=".8" transform="rotate(${Math.round(rnd() * 20 - 10)} ${cx} ${cy})"/>`; break; }
      case "shrimp": for (let i = 0; i < Math.max(3, Math.min(n, 5)); i++) { const [x, y] = pt(0.7); s += `<path d="M${f1(x - rr * .35)} ${f1(y)} q${f1(rr * .35)} ${f1(-rr * .6)} ${f1(rr * .7)} 0 q${f1(-rr * .35)} ${f1(-rr * .22)} ${f1(-rr * .7)} 0z" fill="${col}" stroke="${edge}" stroke-width="1" transform="rotate(${Math.round(rnd() * 360)} ${f1(x)} ${f1(y)})"/>`; } break;
      case "cubes": for (let i = 0; i < n; i++) { const [x, y] = pt(0.85), w = rr * (0.3 + rnd() * 0.08); s += `<rect x="${f1(x - w / 2)}" y="${f1(y - w / 2)}" width="${f1(w)}" height="${f1(w)}" rx="2" fill="${col}" stroke="${edge}" stroke-width="1" transform="rotate(${Math.round(rnd() * 90)} ${f1(x)} ${f1(y)})"/>`; } break;
      case "beans": for (let i = 0; i < n * 3; i++) { const [x, y] = pt(); s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rr * 0.13)}" ry="${f1(rr * 0.09)}" fill="${col}" stroke="${edge}" stroke-width=".6" transform="rotate(${Math.round(rnd() * 180)} ${f1(x)} ${f1(y)})"/>`; } break;
      case "oval": for (let i = 0; i < n; i++) { const [x, y] = pt(0.9); s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rr * 0.17)}" ry="${f1(rr * 0.1)}" fill="${col}" stroke="${edge}" stroke-width=".6" transform="rotate(${Math.round(rnd() * 180)} ${f1(x)} ${f1(y)})"/>`; } break;
      case "dots": for (let i = 0; i < n * 5; i++) { const [x, y] = pt(); s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rr * 0.045)}" fill="${col}"/>`; } break;
      case "egg": s += `<path d="M${f1(cx - rr * .9)} ${f1(cy)} q${f1(rr * .1)} ${f1(-rr * .9)} ${f1(rr * .9)} ${f1(-rr * .8)} q${f1(rr * .9)} ${f1(rr * .2)} ${f1(rr * .7)} ${f1(rr * .9)} q${f1(-rr * .3)} ${f1(rr * .8)} ${f1(-rr * 1.5)} ${f1(rr * .4)}z" fill="${col}" stroke="${shade("#e0d8b8", 1)}" stroke-width="1"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(rr * .32)}" fill="#f2b21b"/><circle cx="${f1(cx - rr * .1)}" cy="${f1(cy - rr * .1)}" r="${f1(rr * .09)}" fill="#fbd75a"/>`; break;
      case "grains": s += `<circle cx="${cx}" cy="${cy}" r="${f1(rr)}" fill="${col}"/>`; for (let i = 0; i < 38; i++) { const [x, y] = pt(0.95); s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rr * .07)}" ry="${f1(rr * .035)}" fill="${shade(col, rnd() > .5 ? 0.88 : 1.06)}" transform="rotate(${Math.round(rnd() * 180)} ${f1(x)} ${f1(y)})"/>`; } break;
      case "noodles": for (let i = 0; i < 7; i++) { const y = cy - rr * .7 + i * rr * .23; s += `<path d="M${f1(cx - rr * .85)} ${f1(y)} q${f1(rr * .28)} ${f1(-rr * .3)} ${f1(rr * .55)} 0 t${f1(rr * .55)} 0 t${f1(rr * .55)} 0" fill="none" stroke="${col}" stroke-width="${f1(rr * .12)}" stroke-linecap="round"/>`; } break;
      case "florets": for (let i = 0; i < n; i++) { const [x, y] = pt(0.7), r0 = rr * 0.24; s += `<rect x="${f1(x - r0 * .18)}" y="${f1(y)}" width="${f1(r0 * .36)}" height="${f1(r0 * .8)}" fill="${shade(col, 1.25)}"/>`; for (const [dx, dy, k] of [[-.5, -.2, .75], [.5, -.2, .75], [0, -.6, .85]]) s += `<circle cx="${f1(x + dx * r0)}" cy="${f1(y + dy * r0)}" r="${f1(r0 * k)}" fill="${col}" stroke="${edge}" stroke-width=".6"/>`; } break;
      case "leaves": for (let i = 0; i < n + 2; i++) { const [x, y] = pt(0.9); s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rr * .3)}" ry="${f1(rr * .15)}" fill="${rnd() > .5 ? col : shade(col, 1.15)}" stroke="${edge}" stroke-width=".6" transform="rotate(${Math.round(rnd() * 180)} ${f1(x)} ${f1(y)})"/>`; } break;
      case "rounds": for (let i = 0; i < n; i++) { const [x, y] = pt(0.8), r0 = rr * 0.22; s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r0)}" fill="${col}" stroke="${edge}" stroke-width="1"/><circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r0 * .5)}" fill="${shade(col, 1.2)}" opacity=".75"/>`; } break;
      case "strips": for (let i = 0; i < n + 1; i++) { const [x, y] = pt(0.75); s += `<path d="M${f1(x - rr * .4)} ${f1(y)} q${f1(rr * .4)} ${f1(-rr * .35)} ${f1(rr * .8)} 0" fill="none" stroke="${col}" stroke-width="${f1(rr * .16)}" stroke-linecap="round" transform="rotate(${Math.round(rnd() * 180)} ${f1(x)} ${f1(y)})"/>`; } break;
      case "berries": for (let i = 0; i < n * 2; i++) { const [x, y] = pt(); s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rr * .14)}" fill="${col}" stroke="${edge}" stroke-width=".6"/><circle cx="${f1(x - rr * .04)}" cy="${f1(y - rr * .04)}" r="${f1(rr * .04)}" fill="#fff" opacity=".5"/>`; } break;
      case "dollop": s += `<circle cx="${cx}" cy="${cy}" r="${f1(rr * .8)}" fill="${col}" stroke="${shade(col, 0.88)}" stroke-width="1.4"/><path d="M${f1(cx - rr * .45)} ${f1(cy)} q${f1(rr * .2)} ${f1(-rr * .5)} ${f1(rr * .45)} ${f1(-rr * .1)} q${f1(rr * .3)} ${f1(rr * .3)} ${f1(rr * .1)} ${f1(rr * .4)}" fill="none" stroke="${shade(col, 0.82)}" stroke-width="1.6" stroke-linecap="round"/>`; break;
      case "bread": s += `<rect x="${f1(cx - rr * .85)}" y="${f1(cy - rr * .7)}" width="${f1(rr * 1.7)}" height="${f1(rr * 1.4)}" rx="${f1(rr * .3)}" fill="${col}" stroke="${edge}" stroke-width="1.4" transform="rotate(${Math.round(rnd() * 30 - 15)} ${cx} ${cy})"/><rect x="${f1(cx - rr * .6)}" y="${f1(cy - rr * .45)}" width="${f1(rr * 1.2)}" height="${f1(rr * .9)}" rx="${f1(rr * .2)}" fill="${shade(col, 1.25)}" transform="rotate(${Math.round(rnd() * 30 - 15)} ${cx} ${cy})"/>`; break;
      case "flat": s += `<circle cx="${cx}" cy="${cy}" r="${f1(rr)}" fill="${col}" stroke="${edge}" stroke-width="1.4"/>`; for (let i = 0; i < 6; i++) { const [x, y] = pt(0.8); s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rr * .08)}" fill="${shade(col, .85)}"/>`; } break;
      default: for (let i = 0; i < n; i++) { const [x, y] = pt(0.8); s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rr * .2)}" fill="${col}"/>`; }
    }
    return s;
  }

  function look(r) {
    const nm = (r.name || "").toLowerCase();
    if (r.meal === "snack" && /shake/.test(nm)) return "glass";
    if (/soup|stew|chili|curry|shorbat|minestrone|ragout|tagine|braise|lentil soup|oatmeal|oats|porridge|pudding|parfait|yogurt bowl|bowl with|smoothie/.test(nm) && !/rice bowl|burrito bowl|donburi|bibimbap|taco bowl|shawarma bowl/.test(nm)) return "bowl";
    return "plate";
  }
  const BOWLCOL = (r) => {
    const ks = r.ing.map(([k]) => k);
    if (ks.includes("coconut")) return "#f2d9a6";
    if (ks.includes("tomato") && !/salad/i.test(r.name)) return "#d9552e";
    if (ks.includes("lentils") || ks.includes("whitebeans")) return "#d9a548";
    if (ks.includes("yogurt") || ks.includes("labneh") || ks.includes("cottage") || ks.includes("ricotta")) return "#fbf8f1";
    if (ks.includes("oats")) return "#e8d9b5";
    return "#e2b866";
  };

  window.recipeArt = function (r) {
    if (r._svg) return r._svg;
    const rnd = mk(seedOf(r.id)), kind0 = look(r);
    const W = 120, C = 60;
    let body = "";
    const items = r.ing.filter(([k]) => !HIDDEN.has(k) && KIND[k]).sort((a, b) => b[1] * (BASES.has(b[0]) ? 1.3 : 1) - a[1] * (BASES.has(a[0]) ? 1.3 : 1)).slice(0, 7);
    if (kind0 === "glass") {
      const col = r.ing.some(([k]) => k === "soymilk") ? "#e9d8b0" : "#f3d6dc";
      const fruit = r.ing.find(([k]) => COL[k] && ["banana", "strawberries", "raspberries", "blueberries", "mango", "pineapple", "orange", "apple"].includes(k));
      const lc = fruit ? COL[fruit[0]] : col;
      body = `<rect width="${W}" height="${W}" fill="#eef3ee"/><path d="M38 24 h44 l-6 74 q-1 6 -8 6 h-16 q-7 0 -8 -6z" fill="#fff" stroke="#c9d3cc" stroke-width="2"/><path d="M41 38 h38 l-4.5 58 q-.5 4 -6 4 h-17 q-5.5 0 -6 -4z" fill="${lc}"/><ellipse cx="60" cy="38" rx="19" ry="4" fill="${shade(lc, 1.12)}"/><rect x="66" y="8" width="6" height="40" rx="3" fill="#e0536b" transform="rotate(14 66 8)"/>`;
    } else {
      const plateFill = kind0 === "bowl" ? "#e7eef0" : "#ffffff";
      body = `<rect width="${W}" height="${W}" fill="${kind0 === "bowl" ? "#e9efe6" : "#e8efe6"}"/><ellipse cx="62" cy="66" rx="50" ry="49" fill="#000" opacity=".08"/><circle cx="${C}" cy="${C}" r="52" fill="${plateFill}" stroke="#d4dcd6" stroke-width="1.5"/><circle cx="${C}" cy="${C}" r="43" fill="${kind0 === "bowl" ? "#d9e3e6" : "#f6f8f5"}" stroke="#e2e8e3" stroke-width="1"/>`;
      if (kind0 === "bowl") body += `<circle cx="${C}" cy="${C}" r="36" fill="${BOWLCOL(r)}"/><circle cx="${C}" cy="${C}" r="36" fill="none" stroke="#000" opacity=".08" stroke-width="3"/>`;
      const n = items.length || 1, a0 = rnd() * 6.283, rad = kind0 === "bowl" ? 17 : 24;
      items.forEach(([k, g], i) => {
        const base = BASES.has(k) && kind0 === "plate";
        const ang = a0 + i * (6.283 / n), d = base ? 15 : (n === 1 ? 0 : rad), cx = C + Math.cos(ang) * d, cy = C + Math.sin(ang) * d;
        const rr = base ? 26 : Math.min(21, 12 + g / 22);
        const cnt = Math.max(3, Math.min(8, Math.round(g / 22)));
        body += cluster(KIND[k], COL[k] || "#c9a46a", f1(cx), f1(cy), rr, cnt, rnd);
      });
      if (items.some(([k]) => ["parsley", "greens", "spinach"].includes(k)) || rnd() > 0.5) for (let i = 0; i < 10; i++) { const a = rnd() * 6.283, d = rnd() * 28; body += `<circle cx="${f1(C + Math.cos(a) * d)}" cy="${f1(C + Math.sin(a) * d)}" r="1.4" fill="#3f8f3c" opacity=".85"/>`; }
    }
    return (r._svg = `<svg viewBox="0 0 ${W} ${W}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${(r.name || "").replace(/"/g, "")}" preserveAspectRatio="xMidYMid slice">${body}</svg>`);
  };
})();
