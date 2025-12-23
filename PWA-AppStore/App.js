const grid = document.getElementById("grid");
const search = document.getElementById("search");
const category = document.getElementById("category");
const sort = document.getElementById("sort");
const installTip = document.getElementById("installTip");

let APPS = [];

function uniq(arr){ return [...new Set(arr)].sort(); }

function render(){
  const q = (search.value || "").trim().toLowerCase();
  const cat = category.value;

  let items = APPS.filter(a => {
    const matchesQ = !q || (a.name + " " + a.description + " " + a.category).toLowerCase().includes(q);
    const matchesCat = !cat || a.category === cat;
    return matchesQ && matchesCat;
  });

  if (sort.value === "featured") {
    items.sort((a,b)=> (b.featured===true)-(a.featured===true) || a.name.localeCompare(b.name));
  } else if (sort.value === "newest") {
    // If you add "releasedAt" later, sort by it. For now, by version string fallback.
    items.sort((a,b)=> (b.version||"").localeCompare(a.version||""));
  } else {
    items.sort((a,b)=> a.name.localeCompare(b.name));
  }

  grid.innerHTML = items.map(app => `
    <a class="card" href="./app.html?id=${encodeURIComponent(app.id)}" aria-label="${app.name}">
      <div class="row">
        <div class="icon">${(app.iconText || app.name[0] || "?").slice(0,2)}</div>
        <div>
          <div class="name">${app.name}</div>
          <div class="meta">${app.category} • v${app.version}</div>
        </div>
      </div>
      <div class="badge">${app.featured ? "Featured" : "App"}</div>
      <div class="meta">${app.description}</div>
    </a>
  `).join("");
}

async function init(){
  const res = await fetch("./apps.json", { cache: "no-store" });
  const data = await res.json();
  APPS = data.apps || [];

  const cats = uniq(APPS.map(a=>a.category).filter(Boolean));
  category.innerHTML = `<option value="">All Categories</option>` + cats.map(c=>`<option value="${c}">${c}</option>`).join("");

  [search, category, sort].forEach(el => el.addEventListener("input", render));
  render();

  // iOS install tip
  installTip.addEventListener("click", () => {
    alert("On iPhone: tap Share → Add to Home Screen.\nThen open it from your Home Screen like an app.");
  });

  // Register service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }
}

init();
