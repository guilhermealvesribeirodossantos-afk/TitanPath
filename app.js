/* =========================================================
   TITANPATH - APP.JS v1.0.0
   Loja individualizada + Fabricação + Titan Advisor Inteligente
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const TIER1_BIN_CAPACITY = {
    1: 35, 2: 41, 3: 47, 4: 53, 5: 59,
    6: 65, 7: 77, 8: 89, 9: 101, 10: 113,
    11: 125, 12: 145, 13: 165, 14: 185, 15: 205
  };

  const RACK_ENERGY = {
    1: 9, 2: 12, 3: 15, 4: 18, 5: 21,
    6: 24, 7: 30, 8: 36, 9: 42, 10: 48,
    11: 54, 12: 63, 13: 72, 14: 81, 15: 90
  };

  const defaultAccount = {
    level: 22,
    gold: 2400000,
    gems: 630,
    energy: 173,
    energyGoal: 250
  };

  const defaultShop = {
    totalSlots: 24,
    racks: {
      mannequin: {
        name: "Manequim",
        icon: "👕",
        items: [
          { id: "mannequin-1", level: 3 },
          { id: "mannequin-2", level: 3 },
          { id: "mannequin-3", level: 3 }
        ]
      },
      table: {
        name: "Mesa",
        icon: "🪵",
        items: [
          { id: "table-1", level: 3 },
          { id: "table-2", level: 3 },
          { id: "table-3", level: 3 }
        ]
      },
      shelf: {
        name: "Prateleira",
        icon: "🗄️",
        items: [
          { id: "shelf-1", level: 3 },
          { id: "shelf-2", level: 3 },
          { id: "shelf-3", level: 3 }
        ]
      },
      vertical: {
        name: "Expositor Vertical",
        icon: "⚔️",
        items: [
          { id: "vertical-1", level: 3 },
          { id: "vertical-2", level: 3 },
          { id: "vertical-3", level: 3 }
        ]
      }
    },
    bins: {
      wood: {
        name: "Madeira",
        resource: "Madeira",
        icon: "🪵",
        items: [
          { id: "wood-1", level: 3 },
          { id: "wood-2", level: 3 }
        ]
      },
      iron: {
        name: "Ferro",
        resource: "Ferro",
        icon: "⛓️",
        items: [
          { id: "iron-1", level: 3 },
          { id: "iron-2", level: 3 }
        ]
      },
      leather: {
        name: "Couro",
        resource: "Couro",
        icon: "🟫",
        items: [
          { id: "leather-1", level: 3 },
          { id: "leather-2", level: 3 }
        ]
      },
      herbs: {
        name: "Ervas",
        resource: "Ervas",
        icon: "🌿",
        items: [
          { id: "herbs-1", level: 3 },
          { id: "herbs-2", level: 3 }
        ]
      },
      steel: {
        name: "Aço",
        resource: "Aço",
        icon: "🔩",
        items: []
      },
      ironwood: {
        name: "Madeira de Ferro",
        resource: "Madeira de Ferro",
        icon: "🌲",
        items: []
      },
      fabric: {
        name: "Tecido",
        resource: "Tecido",
        icon: "🧵",
        items: []
      },
      oil: {
        name: "Óleo",
        resource: "Óleo",
        icon: "🛢️",
        items: []
      },
      jewel: {
        name: "Joias",
        resource: "Joias",
        icon: "💎",
        items: []
      },
      ether: {
        name: "Éter",
        resource: "Éter",
        icon: "🔮",
        items: []
      },
      essence: {
        name: "Essência",
        resource: "Essência",
        icon: "✨",
        items: []
      },
      stardust: {
        name: "Poeira Estelar",
        resource: "Poeira Estelar",
        icon: "🌟",
        items: []
      },
      dragonHoard: {
        name: "Tesouro do Dragão",
        resource: null,
        icon: "🐉",
        items: []
      }
    },
    chests: [
      { id: "chest-1", level: 2 },
      { id: "chest-2", level: 2 },
      { id: "chest-3", level: 2 }
    ],
    counter: { id: "counter-1", level: 3 }
  };

  let account = loadAccount();
  let shop = normalizeShopV060(migrateShop(loadRaw("titanpath_shop")));

  let resourceBinCatalog = [];
  window.TitanPathResourceBins = {
    loaded: false,
    bins: []
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function normalizeShopV060(savedShop) {
    const next = savedShop ? clone(savedShop) : clone(defaultShop);

    next.racks = next.racks || {};
    next.bins = next.bins || {};
    next.chests = Array.isArray(next.chests) ? next.chests : [];
    next.counter = next.counter || clone(defaultShop.counter);

    Object.entries(defaultShop.racks).forEach(([key, defaults]) => {
      if (!next.racks[key]) next.racks[key] = clone(defaults);
      if (!Array.isArray(next.racks[key].items)) next.racks[key].items = [];
    });

    Object.entries(defaultShop.bins).forEach(([key, defaults]) => {
      if (!next.bins[key]) {
        next.bins[key] = clone(defaults);
      } else {
        next.bins[key] = {
          ...clone(defaults),
          ...next.bins[key],
          items: Array.isArray(next.bins[key].items)
            ? next.bins[key].items
            : []
        };
      }
    });

    localStorage.setItem("titanpath_shop", JSON.stringify(next));
    return next;
  }

  async function loadResourceBinCatalog() {
    try {
      const response = await fetch("data/resource-bins.json", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      resourceBinCatalog = Array.isArray(data.bins) ? data.bins : [];

      window.TitanPathResourceBins = {
        loaded: true,
        bins: resourceBinCatalog,
        source: data.source || null
      };

      document.dispatchEvent(new CustomEvent("titanpath:resourcebinsloaded"));
    } catch (error) {
      console.error("TitanPath: não foi possível carregar Resource Bins:", error);

      window.TitanPathResourceBins = {
        loaded: false,
        bins: []
      };
    }
  }

  function resourceBinDefinition(key) {
    return resourceBinCatalog.find(bin => bin.key === key) || null;
  }

  function resourceBinLevelData(key, level) {
    const definition = resourceBinDefinition(key);
    if (definition) {
      return definition.levels?.find(item => Number(item.level) === Number(level)) || null;
    }

    // Fallback somente para os cestos básicos caso o JSON ainda não tenha carregado.
    if (["wood", "iron", "leather", "herbs"].includes(key)) {
      const cap = TIER1_BIN_CAPACITY[Number(level)];
      return cap ? { level: Number(level), storageCap: cap } : null;
    }

    return null;
  }

  function displayBinCapacity(value) {
    if (value === null || value === undefined || value === "") return "—";
    return typeof value === "number" ? formatNumber(value) : String(value);
  }

  function numericBinTotal(key, items) {
    let total = 0;
    let numeric = true;

    items.forEach(item => {
      const value = resourceBinLevelData(key, item.level)?.storageCap;
      if (typeof value === "number") {
        total += value;
      } else if (value !== null && value !== undefined) {
        numeric = false;
      }
    });

    return numeric ? total : null;
  }

  function loadRaw(key) {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }

  function loadAccount() {
    const saved = loadRaw("titanpath_account");
    return saved ? { ...clone(defaultAccount), ...saved } : clone(defaultAccount);
  }

  function migrateShop(saved) {
    if (!saved) return clone(defaultShop);

    if (
      saved.racks?.mannequin?.items &&
      saved.bins?.iron?.items &&
      Array.isArray(saved.chests)
    ) {
      return saved;
    }

    const next = clone(defaultShop);

    if (saved.totalSlots) next.totalSlots = Number(saved.totalSlots);

    if (saved.racks) {
      Object.keys(next.racks).forEach(key => {
        const old = saved.racks[key];
        if (!old) return;
        const qty = Math.max(0, Number(old.quantity || 0));
        const lvl = Math.max(1, Number(old.level || 1));

        next.racks[key].items = Array.from({ length: qty }, (_, i) => ({
          id: `${key}-${i + 1}`,
          level: lvl
        }));
      });
    }

    if (saved.bins) {
      Object.keys(next.bins).forEach(key => {
        const old = saved.bins[key];
        if (!old) return;
        const qty = Math.max(0, Number(old.quantity || 0));
        const lvl = Math.max(1, Number(old.level || 1));

        next.bins[key].items = Array.from({ length: qty }, (_, i) => ({
          id: `${key}-${i + 1}`,
          level: lvl
        }));
      });
    }

    if (saved.chests && !Array.isArray(saved.chests)) {
      const qty = Math.max(0, Number(saved.chests.quantity || 0));
      const lvl = Math.max(1, Number(saved.chests.level || 1));

      next.chests = Array.from({ length: qty }, (_, i) => ({
        id: `chest-${i + 1}`,
        level: lvl
      }));
    }

    if (saved.counter?.level) {
      next.counter.level = Math.max(1, Number(saved.counter.level));
    }

    localStorage.setItem("titanpath_shop", JSON.stringify(next));
    return next;
  }

  function saveAccount() {
    localStorage.setItem("titanpath_account", JSON.stringify(account));
  }

  document.addEventListener("titanpath:accountchanged", () => {
    account = loadAccount();
    updateDashboard();
  });

  function saveShop() {
    localStorage.setItem("titanpath_shop", JSON.stringify(shop));
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("pt-BR");
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 99999)}`;
  }

  function binCapacity(key, level) {
    return resourceBinLevelData(key, level)?.storageCap ?? 0;
  }

  function rackEnergy(level) {
    return RACK_ENERGY[Number(level)] || 0;
  }

  function rackCount() {
    return Object.values(shop.racks).reduce(
      (sum, group) => sum + group.items.length,
      0
    );
  }

  function binCount() {
    return Object.values(shop.bins).reduce(
      (sum, group) => sum + group.items.length,
      0
    );
  }

  function usedSlots() {
    return rackCount() + binCount() + shop.chests.length + 1;
  }

  function freeSlots() {
    return Math.max(0, Number(shop.totalSlots) - usedSlots());
  }

  function calculatedRackEnergy() {
    return Object.values(shop.racks).reduce(
      (sum, group) =>
        sum + group.items.reduce(
          (subtotal, item) => subtotal + rackEnergy(item.level),
          0
        ),
      0
    );
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function updateDashboard() {
    setText("merchantLevel", account.level);
    setText("goldValue", formatNumber(account.gold));
    setText("plannerGoldValue", formatNumber(account.gold));
    setText("gemsValue", formatNumber(account.gems));
    setText("energyValue", formatNumber(account.energy));

    const badge = document.querySelector(".level-badge");
    if (badge) badge.textContent = account.level;

    updateMission();
    updateEvolution();
    updateGoals();
    updateShop();
  }

  function updateMission() {
    const progress = clamp(
      Math.round((account.energy / account.energyGoal) * 100),
      0,
      100
    );

    setText("missionProgressValue", `${progress}%`);

    const circle = document.querySelector(".circle-progress");
    if (circle) {
      const deg = Math.round((progress / 100) * 360);
      circle.style.background =
        `conic-gradient(#2aa7ff 0deg,#7b61ff ${deg}deg,rgba(255,255,255,.08) ${deg}deg)`;
    }

    const title = document.getElementById("currentMissionTitle");
    const step = document.getElementById("nextStepTitle");
    const desc = document.getElementById("nextStepDescription");

    if (!title || !step || !desc) return;

    if (account.energy < account.energyGoal) {
      title.textContent = "Aumentar sua energia";
      step.textContent = `Faltam ${account.energyGoal - account.energy} de energia`;
      desc.textContent =
        "Use Minha Loja para localizar os racks de menor nível e priorizar os upgrades com melhor retorno.";
    } else {
      title.textContent = "Meta de energia concluída";
      step.textContent = "Reavaliar a próxima prioridade";
      desc.textContent =
        "A meta atual foi atingida. O próximo foco deve considerar fabricação, investimentos e heróis.";
    }
  }

  function updateEvolution() {
    const cards = document.querySelectorAll(".evolution-card");
    if (cards.length >= 4) {
      const current = cards[2].querySelector("strong");
      const target = cards[3].querySelector("strong");
      if (current) current.textContent = `${account.energy} ⚡`;
      if (target) target.textContent = `${account.energyGoal} ⚡`;
    }
  }

  function updateGoals() {
    const goals = document.querySelectorAll(".goal-row");

    if (goals[0]) {
      const pct = clamp(
        Math.round((account.energy / account.energyGoal) * 100),
        0,
        100
      );
      const small = goals[0].querySelector("small");
      const bar = goals[0].querySelector(".progress-fill");
      const text = goals[0].querySelector(".goal-progress span");
      if (small) small.textContent = `${account.energy} / ${account.energyGoal}`;
      if (bar) bar.style.width = `${pct}%`;
      if (text) text.textContent = `${pct}%`;
    }

    if (goals[2]) {
      const pct = clamp(
        Math.round((account.gold / 5000000) * 100),
        0,
        100
      );
      const small = goals[2].querySelector("small");
      const bar = goals[2].querySelector(".progress-fill");
      const text = goals[2].querySelector(".goal-progress span");
      if (small) small.textContent = `${formatNumber(account.gold)} / 5.000.000`;
      if (bar) bar.style.width = `${pct}%`;
      if (text) text.textContent = `${pct}%`;
    }
  }

  function updateShop() {
    const used = usedSlots();
    const total = Number(shop.totalSlots);
    const pct = clamp(Math.round((used / total) * 100), 0, 100);

    setText("shopUsedSlots", used);
    setText("shopTotalSlots", total);
    setText("shopEnergyValue", account.energy);
    setText("shopRackCount", rackCount());
    setText("shopPageUsedSlots", used);
    setText("shopPageTotalSlots", total);
    setText("shopChestCount", shop.chests.length);
    setText("shopSlotCounterUsed", used);
    setText("legendRackCount", rackCount());
    setText("legendBinCount", binCount());
    setText("legendChestCount", shop.chests.length);

    const free = document.getElementById("shopFreeSlotsText");
    if (free) {
      free.textContent =
        `${freeSlots()} ${freeSlots() === 1 ? "espaço livre" : "espaços livres"}`;
    }

    const bar1 = document.getElementById("shopSlotsBar");
    const bar2 = document.getElementById("shopSpaceBar");

    if (bar1) bar1.style.width = `${pct}%`;
    if (bar2) bar2.style.width = `${pct}%`;

    renderRacks();
    renderBins();
    renderStorage();
    renderEnergySummary();
    updateAdvisor();
  }

  function renderEnergySummary() {
    document.getElementById("tpEnergyCompare")?.remove();

    const grid = document.querySelector("#page-shop .shop-summary-grid");
    if (!grid) return;

    const card = document.createElement("article");
    card.className = "panel shop-summary-card";
    card.id = "tpEnergyCompare";
    card.innerHTML = `
      <span>🧮 Energia base dos racks</span>
      <strong>${formatNumber(calculatedRackEnergy())}</strong>
      <small>Calculada pelos níveis cadastrados</small>
    `;

    grid.appendChild(card);
  }

  function renderRacks() {
    const grid = document.getElementById("rackGrid");
    if (!grid) return;

    grid.innerHTML = Object.entries(shop.racks)
      .map(([key, group]) => {
        const totalEnergy = group.items.reduce(
          (sum, item) => sum + rackEnergy(item.level),
          0
        );

        const details = group.items
          .map((item, index) => `#${index + 1} Nv.${item.level} (${rackEnergy(item.level)}⚡)`)
          .join(" • ");

        const lowest =
          group.items.length
            ? Math.min(...group.items.map(x => Number(x.level)))
            : null;

        return `
          <article class="panel furniture-card">
            <div class="furniture-icon">${group.icon}</div>
            <div class="furniture-info">
              <span>${group.name}</span>
              <strong>${group.items.length} ${group.items.length === 1 ? "unidade" : "unidades"}</strong>
              <small>${details || "Nenhum cadastrado"}</small>

              <div class="resource-stats">
                <div>
                  <small>Energia total</small>
                  <b>${formatNumber(totalEnergy)} ⚡</b>
                </div>
                <div>
                  <small>Menor nível</small>
                  <b>${lowest ?? "—"}</b>
                </div>
              </div>
            </div>

            <span class="priority-badge ${account.energy < account.energyGoal ? "high" : "medium"}">
              ${account.energy < account.energyGoal ? "ALTA" : "MÉDIA"}
            </span>
          </article>
        `;
      })
      .join("");
  }

  function renderBins() {
    const grid = document.getElementById("binGrid");
    if (!grid) return;

    grid.innerHTML = Object.entries(shop.bins)
      .map(([key, group]) => {
        const totalCapacity = numericBinTotal(key, group.items);

        const detail = group.items
          .map((item, index) => {
            const data = resourceBinLevelData(key, item.level);
            const cap = data?.storageCap ?? "—";
            return `#${index + 1} Nv.${item.level} = ${displayBinCapacity(cap)}`;
          })
          .join(" • ");

        const lowest =
          group.items.length
            ? Math.min(...group.items.map(x => Number(x.level)))
            : null;

        const currentData = lowest
          ? resourceBinLevelData(key, lowest)
          : null;

        const nextData = lowest
          ? resourceBinLevelData(key, lowest + 1)
          : null;

        const definition = resourceBinDefinition(key);
        const maxLevel = definition?.maxLevel || 25;

        const totalText =
          !group.items.length
            ? "0"
            : totalCapacity !== null
              ? formatNumber(totalCapacity)
              : "Múltiplos recursos";

        const nextText = nextData
          ? displayBinCapacity(nextData.storageCap)
          : lowest
            ? `Máx. Nv.${maxLevel}`
            : "—";

        const purchaseText = definition?.extraPurchasePrices
          ? `Compras extras: ${definition.extraPurchasePrices}`
          : "";

        return `
          <article class="panel furniture-card resource-card">
            <div class="furniture-icon">${group.icon}</div>

            <div class="furniture-info">
              <span>${group.name}</span>
              <strong>${group.items.length} ${group.items.length === 1 ? "recipiente" : "recipientes"}</strong>
              <small>${detail || "Nenhum cadastrado"}</small>

              <div class="resource-stats">
                <div>
                  <small>Capacidade total</small>
                  <b>${totalText}</b>
                </div>

                <div>
                  <small>Menor nível</small>
                  <b>${lowest ?? "—"}</b>
                </div>

                <div>
                  <small>Capacidade do menor</small>
                  <b>${currentData ? displayBinCapacity(currentData.storageCap) : "—"}</b>
                </div>

                <div>
                  <small>Após próximo upgrade</small>
                  <b>${nextText}</b>
                </div>
              </div>

              ${
                lowest && nextData
                  ? `<small class="resource-source-note">
                       Próximo upgrade: ${nextData.goldCost ? `${formatNumber(nextData.goldCost)} ouro` : "custo especial"}
                       ${nextData.upgradeTime ? ` • ${nextData.upgradeTime}` : ""}
                       ${nextData.requiredBuilding ? ` • ${nextData.requiredBuilding}` : ""}
                     </small>`
                  : `<small class="resource-source-note">
                       ${purchaseText || "Dados oficiais do Resource Bins."}
                     </small>`
              }
            </div>

            <span class="priority-badge ${group.items.length ? "medium" : "low"}">
              ${group.items.length ? "ATIVO" : "NÃO CADASTRADO"}
            </span>
          </article>
        `;
      })
      .join("");
  }

  function renderStorage() {
    const sections = document.querySelectorAll("#page-shop .shop-section");
    if (sections.length < 3) return;

    const grid = sections[2].querySelector(".furniture-grid");
    if (!grid) return;

    const chestLevels = shop.chests
      .map((x, i) => `#${i + 1} Nv.${x.level}`)
      .join(" • ");

    grid.innerHTML = `
      <article class="panel furniture-card">
        <div class="furniture-icon">📦</div>
        <div class="furniture-info">
          <span>Baús</span>
          <strong>${shop.chests.length} ${shop.chests.length === 1 ? "unidade" : "unidades"}</strong>
          <small>${chestLevels || "Nenhum cadastrado"}</small>
        </div>
        <span class="priority-badge low">BAIXA</span>
      </article>

      <article class="panel furniture-card">
        <div class="furniture-icon">🧑‍💼</div>
        <div class="furniture-info">
          <span>Balcão</span>
          <strong>1 unidade</strong>
          <small>Nv.${shop.counter.level}</small>
        </div>
        <span class="priority-badge medium">MÉDIA</span>
      </article>
    `;
  }

  function updateAdvisor() {
    const el = document.getElementById("shopAdvisorText");
    if (!el) return;

    let lowestRack = null;

    Object.values(shop.racks).forEach(group => {
      group.items.forEach((item, index) => {
        if (!lowestRack || item.level < lowestRack.level) {
          lowestRack = {
            name: group.name,
            index: index + 1,
            level: Number(item.level)
          };
        }
      });
    });

    if (usedSlots() > shop.totalSlots) {
      el.textContent =
        `Sua loja usa ${usedSlots()}/${shop.totalSlots} espaços. Corrija o excesso antes de adicionar novos móveis.`;
      return;
    }

    if (account.energy < account.energyGoal && lowestRack) {
      el.textContent =
        `Energia real informada: ${account.energy}. Energia base estimada pelos racks: ${calculatedRackEnergy()}. ` +
        `O rack de menor nível é ${lowestRack.name} #${lowestRack.index}, Nv.${lowestRack.level}. ` +
        `Esse é o primeiro candidato para revisão. A energia real continua separada porque bônus externos podem alterar o valor final no jogo.`;
      return;
    }

    el.textContent =
      `Sua loja usa ${usedSlots()}/${shop.totalSlots} espaços. Continue comparando energia, capacidade de recursos e custo dos próximos upgrades antes de investir.`;
  }

  function openPage(pageName) {
    document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));

    const target = document.getElementById(`page-${pageName}`);
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-item, .mobile-nav-item").forEach(button => {
      button.classList.toggle("active", button.dataset.page === pageName);
    });

    closeSidebar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.page) openPage(button.dataset.page);
    });
  });

  document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.go) openPage(button.dataset.go);
    });
  });

  function openSidebar() {
    document.body.classList.add("sidebar-open");
  }

  function closeSidebar() {
    document.body.classList.remove("sidebar-open");
  }

  document.getElementById("menuButton")?.addEventListener("click", openSidebar);
  document.getElementById("mobileMoreButton")?.addEventListener("click", openSidebar);
  document.getElementById("sidebarOverlay")?.addEventListener("click", closeSidebar);

  const editAccountButton = document.createElement("button");
  editAccountButton.id = "editAccountButton";
  editAccountButton.innerHTML = "✏️";
  editAccountButton.title = "Editar dados da conta";

  document.querySelector(".topbar-actions")?.prepend(editAccountButton);

  const accountModal = document.createElement("div");
  accountModal.id = "accountEditor";
  accountModal.innerHTML = `
    <div class="tp-modal-overlay"></div>
    <div class="tp-modal">
      <div class="tp-modal-header">
        <div>
          <span>MINHA CONTA</span>
          <h2>Editar progresso</h2>
        </div>
        <button id="closeAccountEditor">✕</button>
      </div>

      <div class="tp-form">
        <label>Nível do Mercador
          <input type="number" id="editLevel" min="1">
        </label>
        <label>Ouro
          <input type="number" id="editGold" min="0">
        </label>
        <label>Gemas
          <input type="number" id="editGems" min="0">
        </label>
        <label>Energia real no jogo
          <input type="number" id="editEnergy" min="0">
        </label>
        <button id="saveAccountButton" class="tp-save-button">
          SALVAR ALTERAÇÕES
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(accountModal);

  function openAccountEditor() {
    document.getElementById("editLevel").value = account.level;
    document.getElementById("editGold").value = account.gold;
    document.getElementById("editGems").value = account.gems;
    document.getElementById("editEnergy").value = account.energy;

    accountModal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeAccountEditor() {
    accountModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  editAccountButton.addEventListener("click", openAccountEditor);
  document.getElementById("closeAccountEditor").addEventListener("click", closeAccountEditor);
  accountModal.querySelector(".tp-modal-overlay").addEventListener("click", closeAccountEditor);

  document.getElementById("saveAccountButton").addEventListener("click", () => {
    account.level = Math.max(1, Number(document.getElementById("editLevel").value));
    account.gold = Math.max(0, Number(document.getElementById("editGold").value));
    account.gems = Math.max(0, Number(document.getElementById("editGems").value));
    account.energy = Math.max(0, Number(document.getElementById("editEnergy").value));

    saveAccount();
    updateDashboard();
    closeAccountEditor();
  });

  const shopModal = document.createElement("div");
  shopModal.id = "shopEditor";
  shopModal.innerHTML = `
    <div class="tp-modal-overlay"></div>
    <div class="tp-modal tp-shop-modal">
      <div class="tp-modal-header">
        <div>
          <span>MINHA LOJA</span>
          <h2>Editar móveis individualmente</h2>
        </div>
        <button id="closeShopEditor">✕</button>
      </div>

      <div class="tp-shop-editor-body" id="shopEditorBody"></div>

      <div class="tp-shop-editor-footer">
        <div>
          <small>Ocupação</small>
          <strong id="shopEditorPreview">0/24</strong>
        </div>

        <button id="saveShopButton" class="tp-save-button">
          SALVAR LOJA
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(shopModal);

  function editorGroupHtml(type, key, group) {
    const definition = type === "bin" ? resourceBinDefinition(key) : null;
    const maxLevel = definition?.maxLevel || (type === "bin" ? 25 : 30);

    return `
      <div class="tp-editor-group" data-editor-group-key="${key}">
        <div class="tp-editor-group-title">
          <span>${group.icon}</span>
          <div>
            <strong>${group.name}</strong>
            ${
              type === "bin"
                ? `<small>${definition?.title || "Recipiente"} • Nv. máx. ${maxLevel}</small>`
                : ""
            }
          </div>
        </div>

        <div class="tp-individual-list">
          ${group.items.map((item, i) => individualItemHtml(type, key, item, i)).join("")}
        </div>

        <button class="tp-add-item" data-add-type="${type}" data-add-key="${key}">
          + Adicionar ${type === "bin" ? "recipiente" : "móvel"}
        </button>
      </div>
    `;
  }

  function individualItemHtml(type, key, item, index) {
    return `
      <div class="tp-individual-item">
        <span>#${index + 1}</span>

        <label>
          Nível
          <input
            type="number"
            min="1"
            max="${type === "bin" ? (resourceBinDefinition(key)?.maxLevel || 25) : 30}"
            value="${item.level}"
            data-level-type="${type}"
            data-level-key="${key}"
            data-level-index="${index}"
          >
        </label>

        <button
          class="tp-remove-item"
          data-remove-type="${type}"
          data-remove-key="${key}"
          data-remove-index="${index}"
        >
          Guardar
        </button>
      </div>
    `;
  }

  function renderShopEditor() {
    const body = document.getElementById("shopEditorBody");
    if (!body) return;

    body.innerHTML = `
      <section class="tp-editor-section">
        <h3>⚡ Expositores</h3>
        ${Object.entries(shop.racks)
          .map(([key, group]) => editorGroupHtml("rack", key, group))
          .join("")}
      </section>

      <section class="tp-editor-section">
        <h3>🔨 Recipientes básicos</h3>
        ${["wood","iron","leather","herbs"]
          .map(key => editorGroupHtml("bin", key, shop.bins[key]))
          .join("")}
      </section>

      <section class="tp-editor-section">
        <h3>⚗️ Recipientes avançados</h3>
        ${["steel","ironwood","fabric","oil","jewel","ether","essence","stardust"]
          .map(key => editorGroupHtml("bin", key, shop.bins[key]))
          .join("")}
      </section>

      <section class="tp-editor-section">
        <h3>🐉 Recipientes especiais</h3>
        ${editorGroupHtml("bin", "dragonHoard", shop.bins.dragonHoard)}
      </section>

      <section class="tp-editor-section">
        <h3>📦 Baús</h3>
        <div class="tp-individual-list">
          ${shop.chests.map((item, i) => individualItemHtml("chest", "chests", item, i)).join("")}
        </div>
        <button class="tp-add-item" data-add-type="chest" data-add-key="chests">
          + Adicionar baú
        </button>
      </section>

      <section class="tp-editor-section">
        <h3>🧑‍💼 Balcão</h3>
        <div class="tp-edit-row single">
          <div class="tp-edit-name"><strong>Balcão único</strong></div>
          <label>Nível
            <input type="number" min="1" max="30" id="counterLevelInput" value="${shop.counter.level}">
          </label>
        </div>
      </section>

      <section class="tp-editor-section">
        <h3>🏪 Limite da loja</h3>
        <div class="tp-edit-row single">
          <div class="tp-edit-name"><strong>Espaços disponíveis</strong></div>
          <label>Total
            <input type="number" min="1" max="100" id="totalSlotsInput" value="${shop.totalSlots}">
          </label>
        </div>
      </section>
    `;

    bindShopEditorActions();
    updateEditorPreview();
  }

  function syncEditorLevels() {
    document.querySelectorAll("[data-level-type]").forEach(input => {
      const type = input.dataset.levelType;
      const key = input.dataset.levelKey;
      const index = Number(input.dataset.levelIndex);
      const value = Math.max(1, Number(input.value || 1));

      if (type === "rack" && shop.racks[key]?.items[index]) {
        shop.racks[key].items[index].level = value;
      }

      if (type === "bin" && shop.bins[key]?.items[index]) {
        shop.bins[key].items[index].level = value;
      }

      if (type === "chest" && shop.chests[index]) {
        shop.chests[index].level = value;
      }
    });

    const counter = document.getElementById("counterLevelInput");
    const total = document.getElementById("totalSlotsInput");

    if (counter) shop.counter.level = Math.max(1, Number(counter.value || 1));
    if (total) shop.totalSlots = Math.max(1, Number(total.value || 1));
  }

  function bindShopEditorActions() {
    document.querySelectorAll("[data-add-type]").forEach(button => {
      button.addEventListener("click", () => {
        syncEditorLevels();

        const type = button.dataset.addType;
        const key = button.dataset.addKey;

        if (type === "rack") {
          shop.racks[key].items.push({ id: uid(key), level: 1 });
        }

        if (type === "bin") {
          shop.bins[key].items.push({ id: uid(key), level: 1 });
        }

        if (type === "chest") {
          shop.chests.push({ id: uid("chest"), level: 1 });
        }

        renderShopEditor();
      });
    });

    document.querySelectorAll("[data-remove-type]").forEach(button => {
      button.addEventListener("click", () => {
        syncEditorLevels();

        const type = button.dataset.removeType;
        const key = button.dataset.removeKey;
        const index = Number(button.dataset.removeIndex);

        if (type === "rack") shop.racks[key].items.splice(index, 1);
        if (type === "bin") shop.bins[key].items.splice(index, 1);
        if (type === "chest") shop.chests.splice(index, 1);

        renderShopEditor();
      });
    });

    document.querySelectorAll("[data-level-type]").forEach(input => {
      input.addEventListener("input", updateEditorPreview);
    });

    document.getElementById("totalSlotsInput")?.addEventListener("input", updateEditorPreview);
  }

  function updateEditorPreview() {
    const preview = document.getElementById("shopEditorPreview");
    const total = Math.max(
      1,
      Number(document.getElementById("totalSlotsInput")?.value || shop.totalSlots)
    );

    if (preview) {
      preview.textContent = `${usedSlots()}/${total}`;
      preview.classList.toggle("over-limit", usedSlots() > total);
    }
  }

  function openShopEditor() {
    renderShopEditor();
    shopModal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeShopEditor() {
    shopModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.getElementById("editShopButton")?.addEventListener("click", openShopEditor);
  document.getElementById("closeShopEditor").addEventListener("click", closeShopEditor);
  shopModal.querySelector(".tp-modal-overlay").addEventListener("click", closeShopEditor);

  document.getElementById("saveShopButton").addEventListener("click", () => {
    syncEditorLevels();

    if (usedSlots() > shop.totalSlots) {
      const ok = confirm(
        `Sua configuração usa ${usedSlots()}/${shop.totalSlots} espaços. Deseja salvar mesmo assim?`
      );
      if (!ok) return;
    }

    saveShop();
    updateShop();
    closeShopEditor();
  });

  const style = document.createElement("style");

  style.textContent = `
    #editAccountButton{
      width:42px;height:42px;border-radius:12px;background:#0d131b;
      border:1px solid rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:16px
    }

    #accountEditor,#shopEditor{
      position:fixed;inset:0;z-index:9999;display:none;align-items:center;
      justify-content:center;padding:20px
    }

    #accountEditor.open,#shopEditor.open{display:flex}

    .tp-modal-overlay{
      position:absolute;inset:0;background:rgba(0,0,0,.8);
      backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)
    }

    .tp-modal{
      position:relative;z-index:2;width:min(460px,100%);max-height:90vh;
      overflow:hidden;background:linear-gradient(180deg,#121923,#090d13);
      border:1px solid rgba(244,185,66,.3);border-radius:20px;padding:22px;
      box-shadow:0 30px 80px rgba(0,0,0,.6)
    }

    .tp-shop-modal{width:min(900px,100%);display:flex;flex-direction:column}

    .tp-modal-header{
      display:flex;align-items:center;justify-content:space-between;
      gap:16px;margin-bottom:20px
    }

    .tp-modal-header span{
      color:#f4b942;font-size:10px;font-weight:900;letter-spacing:.15em
    }

    .tp-modal-header h2{margin-top:4px;color:#fff}

    #closeAccountEditor,#closeShopEditor{
      width:40px;height:40px;border-radius:11px;background:rgba(255,255,255,.05);
      color:#fff;cursor:pointer
    }

    .tp-form{display:grid;gap:14px}

    .tp-form label,.tp-individual-item label,.tp-edit-row label{
      display:grid;gap:6px;color:#a7b0bf;font-size:11px;font-weight:700
    }

    .tp-form input,.tp-individual-item input,.tp-edit-row input{
      width:100%;min-height:42px;padding:0 12px;border-radius:10px;
      border:1px solid rgba(255,255,255,.08);outline:none;background:#080c12;
      color:#fff;font-size:14px
    }

    .tp-save-button{
      min-height:48px;padding:0 18px;border-radius:12px;
      background:linear-gradient(135deg,#ffd36a,#f4b942);
      color:#171005;font-weight:900;cursor:pointer
    }

    .tp-shop-editor-body{overflow-y:auto;padding-right:5px}

    .tp-editor-section{
      padding:15px 0 18px;border-top:1px solid rgba(255,255,255,.07)
    }

    .tp-editor-section:first-child{border-top:0;padding-top:0}
    .tp-editor-section h3{margin-bottom:12px;font-size:15px}

    .tp-editor-group{
      padding:12px;margin-bottom:10px;border-radius:14px;
      background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06)
    }

    .tp-editor-group-title{
      display:flex;align-items:center;gap:8px;margin-bottom:9px
    }

    .tp-editor-group-title>div{min-width:0}
    .tp-editor-group-title strong,.tp-editor-group-title small{display:block}
    .tp-editor-group-title small{
      margin-top:2px;color:#657181;font-size:9px;font-weight:600
    }

    .tp-individual-list{display:grid;gap:7px}

    .tp-individual-item{
      display:grid;grid-template-columns:50px 110px auto;align-items:end;
      gap:10px;padding:9px;border-radius:10px;background:#0b1119
    }

    .tp-individual-item>span{
      align-self:center;color:#ffd36a;font-weight:900
    }

    .tp-remove-item,.tp-add-item{
      min-height:42px;border-radius:10px;cursor:pointer;font-weight:800
    }

    .tp-remove-item{
      background:rgba(255,95,102,.08);color:#ff9297;
      border:1px solid rgba(255,95,102,.18)
    }

    .tp-add-item{
      width:100%;margin-top:8px;background:rgba(244,185,66,.08);
      color:#ffd36a;border:1px dashed rgba(244,185,66,.3)
    }

    .tp-edit-row{
      display:grid;grid-template-columns:1fr 120px;gap:12px;
      align-items:end;padding:10px;border-radius:12px;background:rgba(255,255,255,.025)
    }

    .tp-shop-editor-footer{
      display:flex;align-items:center;justify-content:space-between;gap:14px;
      padding-top:15px;border-top:1px solid rgba(255,255,255,.08)
    }

    .tp-shop-editor-footer small,.tp-shop-editor-footer strong{display:block}
    .tp-shop-editor-footer small{color:#6e7887}
    .tp-shop-editor-footer strong{margin-top:2px;font-size:20px}
    .tp-shop-editor-footer strong.over-limit{color:#ff5f66}

    .resource-card{min-height:240px}

    .resource-stats{
      display:grid;grid-template-columns:repeat(2,minmax(0,1fr));
      gap:7px;margin-top:11px
    }

    .resource-stats>div{
      padding:8px;border-radius:9px;background:rgba(255,255,255,.025);
      border:1px solid rgba(255,255,255,.055)
    }

    .resource-stats small,.resource-stats b{display:block}
    .resource-stats small{color:#6e7887;font-size:9px}
    .resource-stats b{margin-top:3px;color:#f4f7fb;font-size:13px}
    .resource-source-note{margin-top:9px!important;color:#6e7887!important;font-size:9px!important}

    @media(max-width:640px){
      #accountEditor,#shopEditor{align-items:flex-end;padding:0}
      .tp-modal{
        width:100%;max-height:94vh;border-radius:22px 22px 0 0;
        padding:19px 15px calc(18px + env(safe-area-inset-bottom))
      }
      .tp-individual-item{grid-template-columns:42px 85px 1fr;gap:7px}
      .tp-shop-editor-footer .tp-save-button{min-width:150px}
    }
  `;

  document.head.appendChild(style);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeAccountEditor();
      closeShopEditor();
      closeSidebar();
    }
  });

  loadResourceBinCatalog().finally(() => {
    updateDashboard();
  });
});
/* =========================================================
   TITANPATH - FABRICAÇÃO INTELIGENTE v0.3.2
   Projetos desbloqueados + componentes + slots + XP/min + ouro/min + Advisor
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const DEFAULT_CRAFTING = {
    totalSlots: 4,
    strategy: "fast-growth",
    sort: "advisor",
    filter: "all",
    resourcesUpdatedAt: null,
    components: {},
    resources: {
      "Madeira": 0,
      "Ferro": 0,
      "Couro": 0,
      "Ervas": 0,
      "Aço": 0,
      "Madeira de Ferro": 0,
      "Tecido": 0,
      "Óleo": 0,
      "Joias": 0,
      "Éter": 0,
      "Essência": 0,
      "Poeira Estelar": 0
    },
    projects: [],
    queue: [null, null, null, null]
  };

  const RESOURCE_ALIASES = {
    "madeira": "Madeira",
    "wood": "Madeira",
    "ferro": "Ferro",
    "iron": "Ferro",
    "couro": "Couro",
    "leather": "Couro",
    "ervas": "Ervas",
    "erva": "Ervas",
    "herbs": "Ervas",
    "herb": "Ervas",
    "aco": "Aço",
    "steel": "Aço",
    "madeira de ferro": "Madeira de Ferro",
    "ironwood": "Madeira de Ferro",
    "tecido": "Tecido",
    "fabric": "Tecido",
    "oleo": "Óleo",
    "oil": "Óleo",
    "joias": "Joias",
    "joia": "Joias",
    "jewels": "Joias",
    "jewel": "Joias",
    "eter": "Éter",
    "ether": "Éter",
    "essencia": "Essência",
    "essence": "Essência",
    "poeira estelar": "Poeira Estelar",
    "stardust": "Poeira Estelar"
  };

  function normalizeResourceKey(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\\u0300-\\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[_-]+/g, " ")
      .replace(/\\s+/g, " ");
  }

  function canonicalResourceName(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    return RESOURCE_ALIASES[normalizeResourceKey(raw)] || raw;
  }

  function canonicalizeResourceObject(input = {}, mode = "max") {
    const output = {};

    Object.entries(input || {}).forEach(([rawName, rawAmount]) => {
      const name = canonicalResourceName(rawName);
      if (!name) return;

      const amount = Math.max(0, Number(rawAmount || 0));
      if (!(name in output)) {
        output[name] = amount;
      } else if (mode === "sum") {
        output[name] += amount;
      } else {
        // Saldo duplicado PT/EN representa o mesmo recurso; nunca somar para não inflar o estoque.
        output[name] = Math.max(output[name], amount);
      }
    });

    return output;
  }

  function canonicalizeProjectResources(project) {
    if (!project) return project;
    project.resources = canonicalizeResourceObject(project.resources || {}, "max");
    return project;
  }

  function migrateCraftingResourceNames(target) {
    if (!target) return target;

    target.resources = {
      ...cloneCrafting(DEFAULT_CRAFTING.resources),
      ...canonicalizeResourceObject(target.resources || {}, "max")
    };

    if (Array.isArray(target.projects)) {
      target.projects.forEach(canonicalizeProjectResources);
    }

    return target;
  }

  let crafting = migrateCraftingResourceNames(loadCrafting());

  let blueprintCatalog = [];
  let blueprintResourceCatalog = Object.keys(crafting.resources);
  let selectedCatalogBlueprint = null;

  async function loadBlueprintCatalog() {
    try {
      const response = await fetch("data/blueprints-pt.json", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      blueprintCatalog = Array.isArray(data.blueprints) ? data.blueprints : [];

      // Garante PT-BR canônico mesmo se alguma versão anterior do catálogo/projeto tiver inglês.
      blueprintCatalog.forEach(blueprint => {
        if (Array.isArray(blueprint.resources)) {
          blueprint.resources = blueprint.resources.map(resource => ({
            ...resource,
            name: canonicalResourceName(resource.name)
          }));
        }
      });

      if (Array.isArray(data.resourceCatalog)) {
        blueprintResourceCatalog = [...new Set([
          ...Object.keys(crafting.resources),
          ...data.resourceCatalog.map(canonicalResourceName)
        ].filter(Boolean))];
      }

      crafting = migrateCraftingResourceNames(crafting);
      blueprintResourceCatalog = [...new Set(
        blueprintResourceCatalog.map(canonicalResourceName).filter(Boolean)
      )];

      blueprintResourceCatalog.forEach(resource => {
        if (!(resource in crafting.resources)) crafting.resources[resource] = 0;
      });

      saveCrafting();
    } catch (error) {
      console.error("TitanPath: não foi possível carregar o catálogo:", error);
      blueprintCatalog = [];
    }
  }

  function cloneCrafting(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function loadCrafting() {
    const saved = localStorage.getItem("titanpath_crafting");

    if (!saved) return cloneCrafting(DEFAULT_CRAFTING);

    try {
      const parsed = JSON.parse(saved);

      const merged = {
        ...cloneCrafting(DEFAULT_CRAFTING),
        ...parsed,
        resources: {
          ...cloneCrafting(DEFAULT_CRAFTING.resources),
          ...(parsed.resources || {})
        },
        components: {
          ...(parsed.components || {})
        }
      };

      if (!Array.isArray(merged.projects)) merged.projects = [];
      if (!Array.isArray(merged.queue)) merged.queue = [];

      syncQueueLength(merged);

      return migrateCraftingResourceNames(merged);
    } catch (error) {
      console.error("Erro ao carregar fabricação:", error);
      return cloneCrafting(DEFAULT_CRAFTING);
    }
  }

  function saveCrafting() {
    syncQueueLength(crafting);
    localStorage.setItem("titanpath_crafting", JSON.stringify(crafting));
  }

  function syncQueueLength(target = crafting) {
    const total = Math.max(1, Number(target.totalSlots || 4));

    while (target.queue.length < total) target.queue.push(null);

    if (target.queue.length > total) {
      target.queue = target.queue.slice(0, total);
    }
  }

  function fmt(value, decimals = 0) {
    const n = Number(value || 0);

    return n.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function uidCraft(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  function projectXpPerMin(project) {
    const time = Math.max(1, Number(project.timeMin || 1));
    return Number(project.xp || 0) / time;
  }

  function projectGoldPerMin(project) {
    const time = Math.max(1, Number(project.timeMin || 1));
    return Number(project.baseValue || 0) / time;
  }

  function projectResourcesTotal(project) {
    return Object.values(project.resources || {})
      .reduce((sum, amount) => sum + Number(amount || 0), 0);
  }

  function queuedReservedResources() {
    const reserved = {};

    crafting.queue.forEach(projectId => {
      if (!projectId) return;
      const queuedProject = projectById(projectId);
      if (!queuedProject) return;

      Object.entries(queuedProject.resources || {}).forEach(([resource, amount]) => {
        const canonical = canonicalResourceName(resource);
        reserved[canonical] = Number(reserved[canonical] || 0) + Number(amount || 0);
      });
    });

    return reserved;
  }

  function effectiveResources() {
    const reserved = queuedReservedResources();
    const available = {};

    Object.entries(crafting.resources || {}).forEach(([resource, amount]) => {
      const canonical = canonicalResourceName(resource);
      available[canonical] = Math.max(
        0,
        Number(amount || 0) - Number(reserved[canonical] || 0)
      );
    });

    return available;
  }

  function projectComponentRequirements(project) {
    const output = {};
    (Array.isArray(project?.components) ? project.components : []).forEach(component => {
      const name = String(component?.name || "").trim();
      const amount = Math.max(0, Number(component?.amount || 0));
      if (name && amount > 0) output[name] = Number(output[name] || 0) + amount;
    });
    return output;
  }

  function queuedReservedComponents() {
    const reserved = {};
    crafting.queue.forEach(projectId => {
      if (!projectId) return;
      const project = projectById(projectId);
      if (!project) return;
      Object.entries(projectComponentRequirements(project)).forEach(([name, amount]) => {
        reserved[name] = Number(reserved[name] || 0) + Number(amount || 0);
      });
    });
    return reserved;
  }

  function effectiveComponents() {
    const reserved = queuedReservedComponents();
    const available = {};
    Object.entries(crafting.components || {}).forEach(([name, amount]) => {
      available[name] = Math.max(0, Number(amount || 0) - Number(reserved[name] || 0));
    });
    return available;
  }

  function canCraftWithResources(project, resources, components = effectiveComponents()) {
    const req = canonicalizeResourceObject(project.resources || {}, "max");
    const resourcesOk = Object.entries(req).every(([resource, amount]) => {
      return Number(resources[canonicalResourceName(resource)] || 0) >= Number(amount || 0);
    });
    if (!resourcesOk) return false;
    return Object.entries(projectComponentRequirements(project)).every(([name, amount]) => {
      return Number(components[name] || 0) >= Number(amount || 0);
    });
  }

  function canCraft(project) {
    return canCraftWithResources(project, effectiveResources(), effectiveComponents());
  }

  function normalize(value, min, max) {
    if (max <= min) return max > 0 ? 1 : 0;
    return (value - min) / (max - min);
  }

  function scoreProjects() {
    const projects = crafting.projects;

    if (!projects.length) return [];

    const xpValues = projects.map(projectXpPerMin);
    const goldValues = projects.map(projectGoldPerMin);

    const minXp = Math.min(...xpValues);
    const maxXp = Math.max(...xpValues);
    const minGold = Math.min(...goldValues);
    const maxGold = Math.max(...goldValues);

    return projects.map(project => {
      const xpNorm = normalize(projectXpPerMin(project), minXp, maxXp);
      const goldNorm = normalize(projectGoldPerMin(project), minGold, maxGold);

      let score = 0;

      switch (crafting.strategy) {
        case "xp":
          score = xpNorm;
          break;

        case "gold":
          score = goldNorm;
          break;

        case "balanced":
          score = (xpNorm * 0.5) + (goldNorm * 0.5);
          break;

        default:
          score = (xpNorm * 0.6) + (goldNorm * 0.4);
      }

      if (!canCraft(project)) score *= 0.35;

      const stock = Number(project.stock || 0);

      if (stock <= 1) score += 0.08;
      if (stock >= 10) score -= 0.08;

      return {
        ...project,
        xpPerMin: projectXpPerMin(project),
        goldPerMin: projectGoldPerMin(project),
        score: Math.max(0, score),
        craftable: canCraft(project)
      };
    });
  }

  function getRankedProjects() {
    const scored = scoreProjects();

    return [...scored].sort((a, b) => b.score - a.score);
  }

  function strategyLabel() {
    const labels = {
      "fast-growth": "Crescimento Rápido",
      xp: "Priorizar XP",
      gold: "Priorizar Ouro",
      balanced: "Equilibrado"
    };

    return labels[crafting.strategy] || "Crescimento Rápido";
  }

  function setCraftText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function freeCraftingSlots() {
    return crafting.queue.filter(item => !item).length;
  }

  function busyCraftingSlots() {
    return crafting.queue.filter(Boolean).length;
  }

  function totalStock() {
    return crafting.projects.reduce(
      (sum, p) => sum + Number(p.stock || 0),
      0
    );
  }

  function projectById(id) {
    return crafting.projects.find(p => p.id === id) || null;
  }

  const SHOP_BIN_RESOURCE_MAP = {
    wood: "Madeira",
    iron: "Ferro",
    leather: "Couro",
    herbs: "Ervas",
    steel: "Aço",
    ironwood: "Madeira de Ferro",
    fabric: "Tecido",
    oil: "Óleo",
    jewel: "Joias",
    ether: "Éter",
    essence: "Essência",
    stardust: "Poeira Estelar"
  };

  function advisorResourceBinDefinition(shopKey) {
    const bins = window.TitanPathResourceBins?.bins || [];
    return bins.find(bin => bin.key === shopKey) || null;
  }

  function advisorBinLevelData(shopKey, level) {
    return advisorResourceBinDefinition(shopKey)
      ?.levels
      ?.find(item => Number(item.level) === Number(level)) || null;
  }

  function loadCurrentShopForAdvisor() {
    try {
      return JSON.parse(localStorage.getItem("titanpath_shop") || "null");
    } catch {
      return null;
    }
  }

  function shopResourceCapacities() {
    const currentShop = loadCurrentShopForAdvisor();
    const capacities = {};

    if (!currentShop?.bins) return capacities;

    Object.entries(SHOP_BIN_RESOURCE_MAP).forEach(([shopKey, resourceName]) => {
      const items = currentShop.bins?.[shopKey]?.items || [];

      capacities[resourceName] = items.reduce((sum, item) => {
        const cap = advisorBinLevelData(shopKey, item.level)?.storageCap;
        return sum + (typeof cap === "number" ? cap : 0);
      }, 0);
    });

    return capacities;
  }

  function lowestBasicBinForResource(resourceName) {
    const currentShop = loadCurrentShopForAdvisor();
    if (!currentShop?.bins) return null;

    const entry = Object.entries(SHOP_BIN_RESOURCE_MAP)
      .find(([, mappedResource]) => mappedResource === resourceName);

    if (!entry) return null;

    const [shopKey] = entry;
    const items = currentShop.bins?.[shopKey]?.items || [];
    if (!items.length) return null;

    let best = null;

    items.forEach((item, index) => {
      const level = Number(item.level || 1);
      const current = advisorBinLevelData(shopKey, level);
      const next = advisorBinLevelData(shopKey, level + 1);

      if (!best || level < best.level) {
        best = {
          resource: resourceName,
          shopKey,
          index: index + 1,
          level,
          currentCapacity: current?.storageCap ?? 0,
          nextCapacity: next?.storageCap ?? null,
          nextGoldCost: next?.goldCost ?? null,
          nextUpgradeTime: next?.upgradeTime ?? null,
          nextRequiredBuilding: next?.requiredBuilding ?? null
        };
      }
    });

    return best;
  }

  function consumeFromResourceSnapshot(resources, project) {
    Object.entries(canonicalizeResourceObject(project.resources || {}, "max")).forEach(([resource, amount]) => {
      const canonical = canonicalResourceName(resource);
      resources[canonical] = Math.max(
        0,
        Number(resources[canonical] || 0) - Number(amount || 0)
      );
    });
  }

  function consumeFromComponentSnapshot(components, project) {
    Object.entries(projectComponentRequirements(project)).forEach(([name, amount]) => {
      components[name] = Math.max(0, Number(components[name] || 0) - Number(amount || 0));
    });
  }

  function projectShortages(project, resources = effectiveResources(), components = effectiveComponents()) {
    const r = Object.entries(canonicalizeResourceObject(project.resources || {}, "max")).map(([name, required]) => ({kind: "resource", name: canonicalResourceName(name), required: Number(required || 0), available: Number(resources[canonicalResourceName(name)] || 0)})).filter(x => x.available < x.required);
    const c = Object.entries(projectComponentRequirements(project)).map(([name, required]) => ({kind: "component", name, required: Number(required || 0), available: Number(components[name] || 0)})).filter(x => x.available < x.required);
    return [...r, ...c].map(x => ({...x, missing: Math.max(0, x.required - x.available)})).sort((a,b) => b.missing-a.missing);
  }

  function advisorPlanProjectValue(project) {
    const ranked = getRankedProjects();
    const found = ranked.find(item => item.id === project.id);
    return Number(found?.score || 0);
  }

  function advisorPlanScore(projects) {
    if (!projects.length) return null;
    const totalScore = projects.reduce((sum, project) => sum + advisorPlanProjectValue(project), 0);
    const totalXpPerMin = projects.reduce((sum, project) => sum + projectXpPerMin(project), 0);
    const totalGoldPerMin = projects.reduce((sum, project) => sum + projectGoldPerMin(project), 0);
    const distinctProjects = new Set(projects.map(project => project.id)).size;
    let diversityBonus = 0;
    if (crafting.strategy === "fast-growth") diversityBonus = Math.max(0, distinctProjects - 1) * 0.035;
    else if (crafting.strategy === "balanced") diversityBonus = Math.max(0, distinctProjects - 1) * 0.02;
    return { value: totalScore + diversityBonus, totalScore, totalXpPerMin, totalGoldPerMin, distinctProjects };
  }

  function optimizeCraftingCombination(slotCount, resources, components) {
    const ranked = getRankedProjects();
    if (!slotCount || !ranked.length) return { projects: [], resourcesAfter: { ...resources }, componentsAfter: { ...components }, metrics: null };
    const candidates = ranked.slice(0, Math.min(18, ranked.length));
    let best = { projects: [], resourcesAfter: { ...resources }, componentsAfter: { ...components }, metrics: null };

    function isBetter(projects, metrics) {
      if (projects.length !== best.projects.length) return projects.length > best.projects.length;
      if (!best.metrics) return true;
      if (Math.abs(metrics.value - best.metrics.value) > 1e-9) return metrics.value > best.metrics.value;
      if (crafting.strategy === "gold") return metrics.totalGoldPerMin > best.metrics.totalGoldPerMin;
      if (crafting.strategy === "xp") return metrics.totalXpPerMin > best.metrics.totalXpPerMin;
      if (crafting.strategy === "balanced") return (metrics.totalXpPerMin + metrics.totalGoldPerMin) > (best.metrics.totalXpPerMin + best.metrics.totalGoldPerMin);
      return metrics.totalXpPerMin > best.metrics.totalXpPerMin;
    }

    function visit(depth, chosen, resSnapshot, compSnapshot, startIndex = 0) {
      if (chosen.length) {
        const metrics = advisorPlanScore(chosen);
        if (isBetter(chosen, metrics)) best = { projects: [...chosen], resourcesAfter: { ...resSnapshot }, componentsAfter: { ...compSnapshot }, metrics };
      }
      if (depth >= slotCount) return;
      for (let i = startIndex; i < candidates.length; i += 1) {
        const project = candidates[i];
        if (!canCraftWithResources(project, resSnapshot, compSnapshot)) continue;
        const nextResources = { ...resSnapshot };
        const nextComponents = { ...compSnapshot };
        consumeFromResourceSnapshot(nextResources, project);
        consumeFromComponentSnapshot(nextComponents, project);
        chosen.push(project);
        visit(depth + 1, chosen, nextResources, nextComponents, i);
        chosen.pop();
      }
    }

    visit(0, [], { ...resources }, { ...components }, 0);
    return best;
  }

  function buildSmartSlotPlan() {
    const freeIndexes = crafting.queue.map((projectId, index) => projectId ? null : index).filter(index => index !== null);
    const resources = { ...effectiveResources() };
    const components = { ...effectiveComponents() };
    const optimized = optimizeCraftingCombination(freeIndexes.length, resources, components);
    const plan = optimized.projects.map((project, index) => ({ slotIndex: freeIndexes[index], project }));
    return { plan, resourcesAfter: optimized.resourcesAfter, componentsAfter: optimized.componentsAfter, freeSlots: freeIndexes.length, metrics: optimized.metrics };
  }

  function detectAdvisorBottleneck() {
    const ranked = getRankedProjects(); if (!ranked.length) return null;
    const target=ranked[0], capacities=shopResourceCapacities();
    const shortages=projectShortages(target,effectiveResources(),effectiveComponents());
    if (shortages.length) {
      const x=shortages[0];
      if (x.kind === "component") return {type:"component-shortage",component:x.name,required:x.required,available:x.available,missing:x.missing};
      return {type:"shortage",resource:x.name,required:x.required,available:x.available,capacity:capacities[x.name] ?? null,bin:lowestBasicBinForResource(x.name)};
    }
    const freeSlots=freeCraftingSlots();
    if (freeSlots>0) {
      const plan=buildSmartSlotPlan();
      if (plan.plan.length<freeSlots) {
        const post=ranked.flatMap(project => projectShortages(project,plan.resourcesAfter,plan.componentsAfter).map(x=>({...x,project}))).sort((a,b)=>a.missing-b.missing);
        const comp=post.find(x=>x.kind==="component");
        if (comp) return {type:"component-pressure",component:comp.name,required:comp.required,available:comp.available,missing:comp.missing,projectName:comp.project.name};
        const res=post.find(x=>x.kind==="resource");
        if (res) return {type:"slot-pressure",resource:res.name,amount:res.required,available:res.available,capacity:capacities[res.name] ?? null,bin:lowestBasicBinForResource(res.name)};
      }
    }
    return null;
  }

  function smartGrowthDiagnosis() {
    const ranked = getRankedProjects();
    if (!ranked.length) {
      return {
        level: "setup",
        title: "Cadastre os projetos que você desbloqueou",
        text: "O catálogo possui todos os projetos, mas o Advisor só deve recomendar o que sua conta realmente consegue fabricar."
      };
    }

    const plan = buildSmartSlotPlan();
    const bottleneck = detectAdvisorBottleneck();

    if (!plan.plan.length && freeCraftingSlots() > 0) {
      if (bottleneck?.type === "component-shortage") {
        return {level:"warning",title:`${bottleneck.component} está travando sua fabricação`,text:`O melhor projeto atual precisa de ${fmt(bottleneck.required)} de ${bottleneck.component}, mas você possui ${fmt(bottleneck.available)}. Faltam ${fmt(bottleneck.missing)}.`};
      }
      if (bottleneck?.type === "shortage") {
        return {
          level: "warning",
          title: `${bottleneck.resource} está travando sua fabricação`,
          text: `O melhor projeto atual precisa de ${fmt(bottleneck.required)} de ${bottleneck.resource}, mas você tem ${fmt(bottleneck.available)} disponível para novos crafts.`
        };
      }

      return {
        level: "warning",
        title: "Slots livres sem projeto fabricável",
        text: "Atualize seus recursos ou cadastre outros projetos desbloqueados para evitar deixar slots parados."
      };
    }

    if (freeCraftingSlots() === 0) {
      return {
        level: "good",
        title: "Todos os slots estão trabalhando",
        text: "Seu próximo foco é concluir a fila, atualizar os recursos e repetir a recomendação do Advisor."
      };
    }

    if (plan.plan.length < freeCraftingSlots()) {
      return {
        level: "warning",
        title: "Você não consegue alimentar todos os slots",
        text: `O Advisor consegue preencher ${plan.plan.length} de ${freeCraftingSlots()} slots livres com os recursos registrados.`
      };
    }

    return {
      level: "good",
      title: "Sua fabricação está pronta para crescer",
      text: `O Advisor comparou combinações fabricáveis e encontrou o melhor plano para preencher os ${freeCraftingSlots()} slots livres no modo ${strategyLabel()}.`
    };
  }

  function resourceFreshnessText() {
    if (!crafting.resourcesUpdatedAt) {
      return "Recursos ainda não foram atualizados nesta versão.";
    }

    const minutes = Math.floor((Date.now() - Number(crafting.resourcesUpdatedAt)) / 60000);

    if (minutes < 60) return `Recursos atualizados há ${Math.max(1, minutes)} min.`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Recursos atualizados há ${hours} h.`;

    const days = Math.floor(hours / 24);
    return `Recursos atualizados há ${days} dia${days === 1 ? "" : "s"}.`;
  }


  /* =========================================================
     VENDAS INTELIGENTES v0.8.0
     Base: estoque dos projetos + valor base + energia oficial
  ========================================================= */
  const SALES_STORAGE_KEY = "titanpath_sales_v080";

  function loadSalesState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SALES_STORAGE_KEY) || "null");
      return parsed && typeof parsed === "object"
        ? { history: Array.isArray(parsed.history) ? parsed.history : [] }
        : { history: [] };
    } catch {
      return { history: [] };
    }
  }

  const salesState = loadSalesState();

  function readSalesAccount() {
    try {
      const parsed = JSON.parse(localStorage.getItem("titanpath_account") || "null");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeSalesAccount(next) {
    localStorage.setItem("titanpath_account", JSON.stringify(next || {}));
    document.dispatchEvent(new CustomEvent("titanpath:accountchanged"));
  }

  function currentSalesEnergy() {
    return Math.max(0, Number(readSalesAccount().energy || 0));
  }

  function saveSalesState() {
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(salesState));
  }

  function salesEnergy(project) {
    const energy = project?.energy || {};
    return {
      discount: Math.max(0, Number(energy.discount || 0)),
      surcharge: Math.max(0, Number(energy.surcharge || 0)),
      suggest: Math.max(0, Number(energy.suggest || 0))
    };
  }

  function saleValue(project, mode) {
    const base = Math.max(0, Number(project?.baseValue || 0));
    if (mode === "discount") return Math.round(base * 0.5);
    if (mode === "surcharge") return Math.round(base * 2);
    return Math.round(base);
  }

  function saleEnergyDelta(project, mode) {
    const energy = salesEnergy(project);
    if (mode === "discount") return energy.discount;
    if (mode === "surcharge") return -energy.surcharge;
    return 0;
  }

  function saleModeLabel(mode) {
    return {
      normal: "Venda normal",
      discount: "Desconto",
      surcharge: "Sobretaxa"
    }[mode] || "Venda";
  }

  function stockProjectsForSales() {
    return crafting.projects
      .filter(project => Number(project.stock || 0) > 0)
      .map(project => ({
        ...project,
        saleEnergy: salesEnergy(project)
      }));
  }

  function bestSurchargeCandidate(projects) {
    const currentEnergy = currentSalesEnergy();

    return projects
      .filter(project => project.saleEnergy.surcharge > 0)
      .filter(project => currentEnergy >= project.saleEnergy.surcharge)
      .map(project => ({
        project,
        extraGold: Math.max(0, saleValue(project, "surcharge") - saleValue(project, "normal")),
        efficiency: Math.max(0, saleValue(project, "surcharge") - saleValue(project, "normal")) /
          Math.max(1, project.saleEnergy.surcharge)
      }))
      .sort((a, b) =>
        b.efficiency - a.efficiency ||
        b.extraGold - a.extraGold ||
        Number(b.project.baseValue || 0) - Number(a.project.baseValue || 0)
      )[0] || null;
  }

  function bestDiscountCandidate(projects) {
    return projects
      .filter(project => project.saleEnergy.discount > 0)
      .map(project => ({
        project,
        energyGain: project.saleEnergy.discount,
        sacrificedGold: Math.max(0, saleValue(project, "normal") - saleValue(project, "discount")),
        efficiency: project.saleEnergy.discount /
          Math.max(1, saleValue(project, "normal") - saleValue(project, "discount"))
      }))
      .sort((a, b) =>
        b.efficiency - a.efficiency ||
        b.energyGain - a.energyGain ||
        Number(a.project.baseValue || 0) - Number(b.project.baseValue || 0)
      )[0] || null;
  }

  function salesRecommendation() {
    const projects = stockProjectsForSales();
    if (!projects.length) {
      return {
        mode: "none",
        project: null,
        title: "Produza itens antes de vender",
        text: "Seu estoque cadastrado está zerado. Conclua fabricações para o Titan Advisor montar uma estratégia de vendas."
      };
    }

    const surcharge = bestSurchargeCandidate(projects);
    if (surcharge) {
      return {
        mode: "surcharge",
        project: surcharge.project,
        title: `Use Sobretaxa em ${surcharge.project.name}`,
        text: `Você tem energia suficiente. A venda passa de ${fmt(saleValue(surcharge.project, "normal"))} para ${fmt(saleValue(surcharge.project, "surcharge"))} ouro, usando ${fmt(surcharge.project.saleEnergy.surcharge)} de energia.`
      };
    }

    const discount = bestDiscountCandidate(projects);
    if (discount) {
      return {
        mode: "discount",
        project: discount.project,
        title: `Gere energia com ${discount.project.name}`,
        text: `Você ainda não tem energia suficiente para a melhor Sobretaxa disponível. Descontar este item gera ${fmt(discount.energyGain)} de energia com menor sacrifício relativo de ouro entre os itens em estoque.`
      };
    }

    const highest = [...projects].sort((a,b) => Number(b.baseValue||0)-Number(a.baseValue||0))[0];
    return {
      mode: "normal",
      project: highest,
      title: `Venda ${highest.name} normalmente`,
      text: "Nenhuma ação de energia disponível foi encontrada para o estoque atual."
    };
  }

  function salesHistorySummary() {
    return salesState.history.reduce((acc, item) => {
      const gold = Math.max(0, Number(item.gold || 0));
      const energy = Number(item.energyDelta || 0);
      acc.sales += 1;
      acc.gold += gold;
      acc.energy += energy;
      acc[item.mode] = Number(acc[item.mode] || 0) + 1;
      return acc;
    }, {
      sales: 0,
      gold: 0,
      energy: 0,
      normal: 0,
      discount: 0,
      surcharge: 0
    });
  }

  function expandedSalesStock() {
    const units = [];
    stockProjectsForSales().forEach(project => {
      const qty = Math.max(0, Number(project.stock || 0));
      for (let i = 0; i < qty; i += 1) {
        units.push({ ...project, unitIndex: i });
      }
    });
    return units;
  }

  function bestEconomicSurcharge(projects, energy = currentSalesEnergy()) {
    return projects
      .filter(project => project.saleEnergy.surcharge > 0)
      .filter(project => energy >= project.saleEnergy.surcharge)
      .map(project => ({
        project,
        extraGold: saleValue(project, 'surcharge') - saleValue(project, 'normal'),
        energyCost: project.saleEnergy.surcharge,
        efficiency: (saleValue(project, 'surcharge') - saleValue(project, 'normal')) /
          Math.max(1, project.saleEnergy.surcharge)
      }))
      .sort((a, b) =>
        b.efficiency - a.efficiency ||
        b.extraGold - a.extraGold ||
        Number(b.project.baseValue || 0) - Number(a.project.baseValue || 0)
      )[0] || null;
  }

  function discountUnitEfficiency(project) {
    const gain = Number(project.saleEnergy.discount || 0);
    const sacrifice = Math.max(
      0,
      saleValue(project, 'normal') - saleValue(project, 'discount')
    );
    return {
      project,
      gain,
      sacrifice,
      efficiency: gain / Math.max(1, sacrifice)
    };
  }

  function economicBridgePlan(projects) {
    const currentEnergy = currentSalesEnergy();
    const units = expandedSalesStock();
    if (!units.length) return null;

    let best = null;

    units.forEach((target, targetIndex) => {
      const surchargeCost = Number(target.saleEnergy.surcharge || 0);
      if (surchargeCost <= currentEnergy || surchargeCost <= 0) return;

      const discounts = units
        .map((project, index) => ({ ...discountUnitEfficiency(project), index }))
        .filter(item => item.index !== targetIndex)
        .filter(item => item.gain > 0)
        .sort((a, b) =>
          b.efficiency - a.efficiency ||
          a.sacrifice - b.sacrifice ||
          b.gain - a.gain
        );

      let energy = currentEnergy;
      let sacrifice = 0;
      const used = [];

      for (const item of discounts) {
        if (energy >= surchargeCost) break;
        energy += item.gain;
        sacrifice += item.sacrifice;
        used.push(item);
      }

      if (energy < surchargeCost) return;

      const extraGold = Math.max(
        0,
        saleValue(target, 'surcharge') - saleValue(target, 'normal')
      );
      const netGain = extraGold - sacrifice;

      const candidate = {
        target,
        discounts: used,
        energyBefore: currentEnergy,
        energyBeforeSurcharge: energy,
        energyAfter: Math.max(0, energy - surchargeCost),
        surchargeCost,
        sacrifice,
        extraGold,
        netGain
      };

      if (!best ||
          candidate.netGain > best.netGain ||
          (candidate.netGain === best.netGain && candidate.extraGold > best.extraGold)) {
        best = candidate;
      }
    });

    return best;
  }

  function economicAdvisorPlan() {
    const projects = stockProjectsForSales();
    const energy = currentSalesEnergy();
    const history = salesHistorySummary();

    if (!projects.length) {
      return {
        mode: 'produce',
        title: 'Produza antes de montar o próximo ciclo econômico',
        text: 'Sem estoque, o melhor movimento é concluir as fabricações recomendadas. Assim o Advisor volta a comparar Desconto, Venda Normal e Sobretaxa.',
        actionProject: null,
        actionMode: null,
        projectedGold: 0,
        projectedEnergy: energy,
        history
      };
    }

    const surchargeNow = bestEconomicSurcharge(projects, energy);
    if (surchargeNow) {
      return {
        mode: 'surcharge',
        title: `Sobretaxe ${surchargeNow.project.name} agora`,
        text: `Entre os itens em estoque que cabem na sua energia atual, esta é a melhor relação entre ouro extra e energia gasta: +${fmt(surchargeNow.extraGold)} ouro adicional por ${fmt(surchargeNow.energyCost)} de energia.`,
        actionProject: surchargeNow.project,
        actionMode: 'surcharge',
        projectedGold: saleValue(surchargeNow.project, 'surcharge'),
        projectedEnergy: Math.max(0, energy - surchargeNow.energyCost),
        history
      };
    }

    const bridge = economicBridgePlan(projects);
    if (bridge && bridge.netGain > 0 && bridge.discounts.length) {
      const first = bridge.discounts[0].project;
      const discountCount = bridge.discounts.length;
      return {
        mode: 'build-energy',
        title: `Gere energia com ${first.name}`,
        text: `O melhor ciclo encontrado usa ${discountCount} desconto${discountCount === 1 ? '' : 's'} para alcançar a Sobretaxa de ${bridge.target.name}. O ganho extra da Sobretaxa supera o ouro sacrificado nos descontos em aproximadamente ${fmt(bridge.netGain)} ouro.`,
        actionProject: first,
        actionMode: 'discount',
        projectedGold: saleValue(first, 'discount'),
        projectedEnergy: energy + Number(first.saleEnergy.discount || 0),
        bridge,
        history
      };
    }

    // PRO COACH: não sacrifica ouro em Desconto sem enxergar um ciclo
    // completo e lucrativo com o estoque disponível.
    const normal = [...projects].sort((a, b) => Number(b.baseValue || 0) - Number(a.baseValue || 0))[0];
    return {
      mode: 'normal',
      title: `Venda ${normal.name} normalmente`,
      text: 'Com o estoque e a energia atuais, não há ciclo de Desconto + Sobretaxa que melhore o resultado econômico estimado.',
      actionProject: normal,
      actionMode: 'normal',
      projectedGold: saleValue(normal, 'normal'),
      projectedEnergy: energy,
      history
    };
  }

  function economicAdvisorHtml(plan) {
    const h = plan.history || salesHistorySummary();
    const bridge = plan.bridge;

    return `
      <div class="tp-economic-advisor">
        <div class="tp-economic-head">
          <div>
            <span>🧠 ADVISOR ECONÔMICO</span>
            <strong>${escapeHtml(plan.title)}</strong>
            <small>${escapeHtml(plan.text)}</small>
          </div>
          <div class="tp-economic-projection">
            <span>Após próximo passo</span>
            <strong>+${fmt(plan.projectedGold)} 🪙</strong>
            <small>${fmt(plan.projectedEnergy)} ⚡ estimados</small>
          </div>
        </div>

        ${bridge ? `
          <div class="tp-economic-cycle">
            <span>ROTA ECONÔMICA</span>
            <strong>${bridge.discounts.length} desconto${bridge.discounts.length === 1 ? '' : 's'} → Sobretaxa em ${escapeHtml(bridge.target.name)}</strong>
            <small>
              Ouro sacrificado: ${fmt(bridge.sacrifice)} •
              Ouro extra da Sobretaxa: ${fmt(bridge.extraGold)} •
              Ganho líquido estimado: ${fmt(bridge.netGain)}
            </small>
          </div>
        ` : ''}

        <div class="tp-economic-stats">
          <div><span>Vendas registradas</span><strong>${fmt(h.sales)}</strong></div>
          <div><span>Ouro gerado</span><strong>${fmt(h.gold)}</strong></div>
          <div><span>Descontos</span><strong>${fmt(h.discount)}</strong></div>
          <div><span>Sobretaxas</span><strong>${fmt(h.surcharge)}</strong></div>
        </div>

        ${plan.actionProject && plan.actionMode ? `
          <button class="tp-economic-action" data-economic-sale-project="${plan.actionProject.id}" data-economic-sale-mode="${plan.actionMode}">
            ⚡ EXECUTAR PRÓXIMA AÇÃO: ${escapeHtml(saleModeLabel(plan.actionMode).toUpperCase())}
          </button>
        ` : ''}
      </div>
    `;
  }

  function performSale(project, mode) {
    if (!project || Number(project.stock || 0) <= 0) {
      return { ok: false, reason: 'stock' };
    }

    const energyDelta = saleEnergyDelta(project, mode);
    if (mode === 'surcharge' && currentSalesEnergy() < Math.abs(energyDelta)) {
      return { ok: false, reason: 'energy' };
    }

    const gold = saleValue(project, mode);
    project.stock = Math.max(0, Number(project.stock || 0) - 1);

    const accountSnapshot = readSalesAccount();
    accountSnapshot.gold = Math.max(0, Number(accountSnapshot.gold || 0) + gold);
    accountSnapshot.energy = Math.max(0, Number(accountSnapshot.energy || 0) + energyDelta);

    salesState.history.unshift({
      id: `sale-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      projectId: project.id,
      projectName: project.name,
      mode,
      gold,
      energyDelta,
      createdAt: Date.now()
    });
    salesState.history = salesState.history.slice(0, 50);

    saveCrafting();
    writeSalesAccount(accountSnapshot);
    saveSalesState();
    updateCraftingUI();

    return { ok: true, gold, energyDelta };
  }

  function renderSalesAdvisor() {
    const host = document.getElementById("salesIntelligencePanel") || document.querySelector(".crafting-sales-link");
    if (!host) return;

    const recommendation = salesRecommendation();
    const stock = stockProjectsForSales();
    const recent = salesState.history.slice(0, 5);

    host.classList.add("tp-sales-panel");
    host.innerHTML = `
      <div class="tp-sales-heading">
        <div>
          <span class="eyebrow gold-text">💸 VENDAS INTELIGENTES</span>
          <h3>Transforme estoque em ouro e energia</h3>
          <p>O Titan Advisor compara Venda Normal, Desconto e Sobretaxa usando seu estoque, valor base e energia atual.</p>
        </div>
        <div class="tp-sales-energy">
          <span>⚡ Energia atual</span>
          <strong>${fmt(currentSalesEnergy())}</strong>
        </div>
      </div>

      <div class="tp-sales-recommendation ${recommendation.mode}">
        <span>PRÓXIMA AÇÃO</span>
        <strong>${escapeHtml(recommendation.title)}</strong>
        <small>${escapeHtml(recommendation.text)}</small>
      </div>

      ${economicAdvisorHtml(economicAdvisorPlan())}

      ${stock.length ? `
        <div class="tp-sales-grid">
          ${stock.map(project => {
            const e = project.saleEnergy;
            const canSurcharge = e.surcharge > 0 && currentSalesEnergy() >= e.surcharge;
            return `
              <article class="tp-sale-card">
                <div class="tp-sale-card-top">
                  <div>
                    <strong>${escapeHtml(project.name)}</strong>
                    <small>Tier ${fmt(project.tier)} • Estoque ${fmt(project.stock)}</small>
                  </div>
                  <span>${fmt(project.baseValue)} 🪙</span>
                </div>

                <div class="tp-sale-options">
                  <button data-sale-mode="normal" data-sale-project="${project.id}">
                    <span>Venda normal</span>
                    <strong>${fmt(saleValue(project, "normal"))} 🪙</strong>
                    <small>Energia: neutra*</small>
                  </button>

                  <button data-sale-mode="discount" data-sale-project="${project.id}" ${e.discount <= 0 ? "disabled" : ""}>
                    <span>Desconto</span>
                    <strong>${fmt(saleValue(project, "discount"))} 🪙</strong>
                    <small>+${fmt(e.discount)} ⚡</small>
                  </button>

                  <button data-sale-mode="surcharge" data-sale-project="${project.id}" ${!canSurcharge ? "disabled" : ""}>
                    <span>Sobretaxa</span>
                    <strong>${fmt(saleValue(project, "surcharge"))} 🪙</strong>
                    <small>-${fmt(e.surcharge)} ⚡</small>
                  </button>
                </div>
              </article>
            `;
          }).join("")}
        </div>
      ` : `
        <div class="tp-sales-empty">Nenhum item com estoque disponível para venda.</div>
      `}

      <small class="tp-sales-note">*A energia obtida na Venda Normal depende de outras mecânicas da loja; por enquanto o TitanPath mantém essa ação neutra para não inventar um valor.</small>

      ${recent.length ? `
        <div class="tp-sales-history">
          <strong>Últimas vendas registradas</strong>
          ${recent.map(item => `
            <div>
              <span>${escapeHtml(item.projectName)} • ${escapeHtml(saleModeLabel(item.mode))}</span>
              <small>+${fmt(item.gold)} ouro ${item.energyDelta ? `• ${item.energyDelta > 0 ? "+" : ""}${fmt(item.energyDelta)} ⚡` : ""}</small>
            </div>
          `).join("")}
        </div>
      ` : ""}
    `;

    host.querySelectorAll("[data-sale-project]").forEach(button => {
      button.addEventListener("click", () => {
        const project = projectById(button.dataset.saleProject);
        const mode = button.dataset.saleMode;
        const result = performSale(project, mode);
        if (!result.ok && result.reason === "energy") {
          alert("Você não possui energia suficiente para usar Sobretaxa neste item.");
        }
      });
    });

    host.querySelectorAll("[data-economic-sale-project]").forEach(button => {
      button.addEventListener("click", () => {
        const project = projectById(button.dataset.economicSaleProject);
        const mode = button.dataset.economicSaleMode;
        const result = performSale(project, mode);
        if (!result.ok && result.reason === "energy") {
          alert("A energia mudou e já não é suficiente para esta Sobretaxa. O Advisor foi recalculado.");
          updateCraftingUI();
        }
      });
    });
  }


  function proCoachNavigate(page) {
    const button =
      document.querySelector(`.nav-item[data-page="${page}"]`) ||
      document.querySelector(`.mobile-nav-item[data-page="${page}"]`);
    if (button) button.click();
  }

  function proCoachActionLabel(action) {
    const labels = {
      craft: "FABRICAR AGORA",
      finish: "CONCLUIR FABRICAÇÃO",
      discount: "FAZER DESCONTO",
      surcharge: "FAZER SOBRETAXA",
      normal: "VENDER NORMAL",
      resources: "ATUALIZAR RECURSOS",
      setup: "CONFIGURAR CONTA"
    };
    return labels[action] || "VER AÇÃO";
  }

  function buildProCoachSteps() {
    const steps = [];
    const ranked = getRankedProjects();
    const plan = buildSmartSlotPlan();
    const busy = busyCraftingSlots();
    const free = freeCraftingSlots();
    const stock = totalStock();
    const economic = economicAdvisorPlan();

    // 1) Não deixar slots parados é a prioridade operacional.
    if (free > 0 && plan.plan.length) {
      const counts = {};
      plan.plan.forEach(({ project }) => {
        counts[project.name] = (counts[project.name] || 0) + 1;
      });
      const summary = Object.entries(counts)
        .map(([name, count]) => `${count}× ${name}`)
        .join(" + ");

      steps.push({
        icon: "🔨",
        action: "craft",
        title: `Fabrique ${summary}`,
        text: `Preencha ${plan.plan.length} slot${plan.plan.length === 1 ? "" : "s"} livre${plan.plan.length === 1 ? "" : "s"} com o melhor plano calculado para ${strategyLabel().toLowerCase()}.`,
        page: "crafting"
      });
    } else if (free > 0 && ranked.length) {
      const diagnosis = smartGrowthDiagnosis();
      steps.push({
        icon: "📦",
        action: "resources",
        title: diagnosis.title,
        text: diagnosis.text,
        page: "crafting"
      });
    } else if (!ranked.length) {
      steps.push({
        icon: "⚙️",
        action: "setup",
        title: "Cadastre seus projetos desbloqueados",
        text: "O Coach precisa saber o que sua conta realmente fabrica antes de montar a rota.",
        page: "crafting"
      });
    }

    // 2) Se já existe produção em andamento, mostrar claramente o próximo evento.
    if (busy > 0) {
      const firstBusy = crafting.queue
        .map((id, index) => id ? { index, project: projectById(id) } : null)
        .find(Boolean);
      if (firstBusy?.project) {
        steps.push({
          icon: "✓",
          action: "finish",
          title: `Depois, conclua ${firstBusy.project.name}`,
          text: `${busy} slot${busy === 1 ? "" : "s"} trabalhando. Ao concluir, o estoque e o Coach serão recalculados.`,
          page: "crafting"
        });
      }
    }

    // 3) Venda somente quando a decisão econômica completa fizer sentido.
    if (stock > 0 && economic?.actionProject) {
      const mode = economic.actionMode || "normal";
      steps.push({
        icon: mode === "surcharge" ? "⚡" : mode === "discount" ? "🔋" : "💰",
        action: mode,
        title: economic.title,
        text: economic.text,
        page: "crafting"
      });
    }

    // Se não há produção nem estoque, orientar a correção do gargalo.
    if (!steps.length) {
      const diagnosis = smartGrowthDiagnosis();
      steps.push({
        icon: "🧠",
        action: ranked.length ? "resources" : "setup",
        title: diagnosis.title,
        text: diagnosis.text,
        page: "crafting"
      });
    }

    return steps.slice(0, 3);
  }

  function renderProCoach() {
    const host = document.getElementById("proCoachPanel");
    if (!host) return;

    const steps = buildProCoachSteps();
    const main = steps[0];
    const account = readSalesAccount();
    const energy = currentSalesEnergy();
    const gold = Number(account.gold || 0);

    host.innerHTML = `
      <div class="tp-pro-coach-head">
        <div>
          <span>🧠 TITANPATH PRO COACH</span>
          <h2>Faça isso agora</h2>
          <p>Eu analiso os números. Você só executa a próxima jogada.</p>
        </div>
        <div class="tp-pro-coach-state">
          <small>ESTADO ATUAL</small>
          <strong>${fmt(gold)} 🪙 • ${fmt(energy)} ⚡</strong>
          <span>${busyCraftingSlots()}/${crafting.totalSlots} slots • ${fmt(totalStock())} itens em estoque</span>
        </div>
      </div>

      <article class="tp-pro-main-action">
        <div class="tp-pro-main-icon">${main.icon}</div>
        <div class="tp-pro-main-copy">
          <span>🎯 PRÓXIMA JOGADA</span>
          <h3>${escapeHtml(main.title)}</h3>
          <p>${escapeHtml(main.text)}</p>
        </div>
        <button class="tp-pro-go" data-pro-page="${main.page}">
          ${proCoachActionLabel(main.action)} →
        </button>
      </article>

      ${steps.length > 1 ? `
        <div class="tp-pro-next">
          <span>DEPOIS</span>
          ${steps.slice(1).map((step, index) => `
            <button data-pro-page="${step.page}">
              <b>${index + 2}</b>
              <div>
                <strong>${escapeHtml(step.title)}</strong>
                <small>${escapeHtml(step.text)}</small>
              </div>
              <i>→</i>
            </button>
          `).join("")}
        </div>
      ` : ""}

      <details class="tp-pro-details">
        <summary>Ver por que o Coach escolheu isso</summary>
        <p>
          A prioridade atual combina slots livres, projetos fabricáveis, recursos,
          componentes, estoque, energia e o resultado econômico das vendas.
          Desconto só é recomendado quando existe um ciclo completo lucrativo
          com o estoque disponível.
        </p>
      </details>
    `;

    host.querySelectorAll("[data-pro-page]").forEach(button => {
      button.addEventListener("click", () => proCoachNavigate(button.dataset.proPage));
    });
  }

  function updateCraftingUI() {
    syncQueueLength();

    setCraftText("craftingBusySlots", busyCraftingSlots());
    setCraftText("craftingTotalSlots", crafting.totalSlots);
    setCraftText(
      "craftingSlotStatus",
      `${freeCraftingSlots()} ${freeCraftingSlots() === 1 ? "disponível" : "disponíveis"}`
    );
    setCraftText("craftingBlueprintCount", crafting.projects.length);
    setCraftText("craftingStockCount", totalStock());
    setCraftText("craftingModeLabel", strategyLabel());

    const strategySelect = document.getElementById("craftingStrategySelect");
    const sortSelect = document.getElementById("craftingSortSelect");
    const filterSelect = document.getElementById("craftingFilterSelect");

    if (strategySelect) strategySelect.value = crafting.strategy;
    if (sortSelect) sortSelect.value = crafting.sort;
    if (filterSelect) filterSelect.value = crafting.filter;

    renderCraftingSlots();
    renderBlueprints();
    renderCraftingAdvisor();
    renderSmartResourceStatus();
    renderSalesAdvisor();
    renderProCoach();
  }

  function renderCraftingSlots() {
    const grid = document.getElementById("craftingSlotsGrid");
    if (!grid) return;

    grid.innerHTML = crafting.queue.map((projectId, index) => {
      const project = projectId ? projectById(projectId) : null;

      if (!project) {
        return `
          <article class="panel crafting-slot-card empty">
            <span class="crafting-slot-number">SLOT ${index + 1}</span>
            <strong>Livre</strong>
            <small>O Advisor indicará o próximo item.</small>
            <button class="tp-slot-recommend" data-fill-slot="${index}">
              Usar recomendação
            </button>
          </article>
        `;
      }

      return `
        <article class="panel crafting-slot-card active">
          <span class="crafting-slot-number">SLOT ${index + 1}</span>
          <strong>${escapeHtml(project.name)}</strong>
          <small>Tier ${project.tier} • ${fmt(project.timeMin)} min • ${fmt(project.xp)} XP</small>

          <div class="tp-slot-actions">
            <button class="tp-slot-complete" data-complete-slot="${index}">
              ✓ Concluir
            </button>

            <button class="tp-slot-cancel" data-cancel-slot="${index}">
              Liberar
            </button>
          </div>
        </article>
      `;
    }).join("");

    grid.querySelectorAll("[data-fill-slot]").forEach(button => {
      button.addEventListener("click", () => {
        const ranked = getRankedProjects().filter(p => p.craftable);

        if (!ranked.length) {
          alert("Cadastre um projeto fabricável ou atualize seus recursos.");
          return;
        }

        crafting.queue[Number(button.dataset.fillSlot)] = ranked[0].id;
        saveCrafting();
        updateCraftingUI();
      });
    });

    grid.querySelectorAll("[data-cancel-slot]").forEach(button => {
      button.addEventListener("click", () => {
        crafting.queue[Number(button.dataset.cancelSlot)] = null;
        saveCrafting();
        updateCraftingUI();
      });
    });

    grid.querySelectorAll("[data-complete-slot]").forEach(button => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.completeSlot);
        const project = projectById(crafting.queue[index]);

        if (project) {
          project.stock = Number(project.stock || 0) + 1;
          consumeResources(project);
        }

        crafting.queue[index] = null;

        saveCrafting();
        updateCraftingUI();
      });
    });
  }

  function consumeResources(project) {
    const req = canonicalizeResourceObject(project.resources || {}, "max");

    Object.entries(req).forEach(([resource, amount]) => {
      const canonical = canonicalResourceName(resource);
      crafting.resources[canonical] = Math.max(0, Number(crafting.resources[canonical] || 0) - Number(amount || 0));
    });

    Object.entries(projectComponentRequirements(project)).forEach(([name, amount]) => {
      crafting.components[name] = Math.max(0, Number(crafting.components[name] || 0) - Number(amount || 0));
    });
  }

  function renderBlueprints() {
    const grid = document.getElementById("craftingBlueprintsGrid");
    if (!grid) return;

    if (!crafting.projects.length) {
      grid.innerHTML = `
        <article class="panel crafting-empty-state">
          <span>📘</span>
          <h4>Nenhum projeto cadastrado ainda</h4>
          <p>Use “Adicionar Projeto” para informar os itens que você já consegue fabricar. Depois disso, o TitanPath fará os cálculos automaticamente.</p>
        </article>
      `;
      return;
    }

    let list = scoreProjects();

    if (crafting.filter === "recommended") {
      const rankedIds = getRankedProjects()
        .slice(0, Math.max(1, Math.ceil(crafting.projects.length / 2)))
        .map(p => p.id);

      list = list.filter(p => rankedIds.includes(p.id));
    }

    if (crafting.filter === "avoid") {
      const ranked = getRankedProjects();
      const avoidIds = ranked
        .slice(Math.max(1, Math.floor(ranked.length * 0.7)))
        .map(p => p.id);

      list = list.filter(p => avoidIds.includes(p.id));
    }

    if (crafting.filter === "stock-low") {
      list = list.filter(p => Number(p.stock || 0) <= 2);
    }

    switch (crafting.sort) {
      case "xpPerMin":
        list.sort((a, b) => b.xpPerMin - a.xpPerMin);
        break;

      case "goldPerMin":
        list.sort((a, b) => b.goldPerMin - a.goldPerMin);
        break;

      case "tier":
        list.sort((a, b) => Number(b.tier) - Number(a.tier));
        break;

      case "time":
        list.sort((a, b) => Number(a.timeMin) - Number(b.timeMin));
        break;

      default:
        list.sort((a, b) => b.score - a.score);
    }

    const rankedIds = getRankedProjects().map(p => p.id);

    grid.innerHTML = list.map(project => {
      const rank = rankedIds.indexOf(project.id) + 1;
      const badge =
        rank === 1 ? "MELHOR AGORA" :
        project.craftable ? "DISPONÍVEL" : "SEM RECURSO";

      const badgeClass =
        rank === 1 ? "high" :
        project.craftable ? "medium" : "low";

      return `
        <article class="panel crafting-blueprint-card">
          <div class="crafting-blueprint-top">
            <div class="crafting-blueprint-icon">${project.icon || "⚒️"}</div>
            <span class="priority-badge ${badgeClass}">${badge}</span>
          </div>

          <h4>${escapeHtml(project.name)}</h4>
          <span class="blueprint-subtitle">
            Tier ${project.tier} • ${escapeHtml(project.category || "Item")}
          </span>

          <div class="crafting-blueprint-stats">
            <div>
              <span>Tempo</span>
              <strong>${fmt(project.timeMin)} min</strong>
            </div>

            <div>
              <span>Valor base</span>
              <strong>${fmt(project.baseValue)} 🪙</strong>
            </div>

            <div>
              <span>XP</span>
              <strong>${fmt(project.xp)}</strong>
            </div>

            <div>
              <span>Estoque</span>
              <strong>${fmt(project.stock)}</strong>
            </div>

            <div>
              <span>XP/min</span>
              <strong>${fmt(project.xpPerMin, 1)}</strong>
            </div>

            <div>
              <span>Ouro/min</span>
              <strong>${fmt(project.goldPerMin, 1)}</strong>
            </div>
          </div>

          <div class="tp-project-resource-line">
            ${resourceText(project)}
          </div>

          <div class="tp-project-actions">
            <button class="tp-project-craft" data-craft-project="${project.id}">
              🔨 Fabricar
            </button>

            <button class="tp-project-edit" data-edit-project="${project.id}">
              ✏️ Editar
            </button>

            <button class="tp-project-delete" data-delete-project="${project.id}">
              Excluir
            </button>
          </div>
        </article>
      `;
    }).join("");

    grid.querySelectorAll("[data-craft-project]").forEach(button => {
      button.addEventListener("click", () => {
        const project = projectById(button.dataset.craftProject);

        if (!project) return;

        if (!canCraft(project)) {
          alert("Você não registrou recursos suficientes para fabricar este item.");
          return;
        }

        const freeIndex = crafting.queue.findIndex(x => !x);

        if (freeIndex < 0) {
          alert("Todos os slots estão ocupados.");
          return;
        }

        crafting.queue[freeIndex] = project.id;
        saveCrafting();
        updateCraftingUI();
      });
    });

    grid.querySelectorAll("[data-edit-project]").forEach(button => {
      button.addEventListener("click", () => {
        openProjectEditor(button.dataset.editProject);
      });
    });

    grid.querySelectorAll("[data-delete-project]").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.dataset.deleteProject;
        const project = projectById(id);

        if (!project) return;

        if (!confirm(`Excluir o projeto "${project.name}" do TitanPath?`)) return;

        crafting.projects = crafting.projects.filter(p => p.id !== id);
        crafting.queue = crafting.queue.map(q => q === id ? null : q);

        saveCrafting();
        updateCraftingUI();
      });
    });
  }

  function resourceText(project) {
    const entries = Object.entries(project.resources || {})
      .filter(([, amount]) => Number(amount) > 0);

    const resourcePart = entries.length
      ? entries.map(([name, amount]) => `${escapeHtml(name)}: ${fmt(amount)}`).join(" • ")
      : "Recursos não informados";

    const components = Array.isArray(project.components) ? project.components : [];

    const availableComponents = effectiveComponents();
    const componentPart = components.length
      ? ` | Componentes: ${components.map(c => {
          const have = Number(availableComponents[c.name] || 0);
          const need = Number(c.amount || 0);
          return `${escapeHtml(c.name)} ${fmt(have)}/${fmt(need)}${have >= need ? " ✓" : " ⚠"}`;
        }).join(" • ")}`
      : "";

    return resourcePart + componentPart;
  }

  function renderCraftingAdvisor() {
    const ranked = getRankedProjects();

    const priority = document.getElementById("craftingAdvisorPriority");
    const recommendation = document.getElementById("craftingRecommendation");

    if (!ranked.length) {
      if (priority) priority.textContent = "CONFIGURAR";

      if (recommendation) {
        recommendation.innerHTML = `
          <div class="crafting-recommendation-icon">🧠</div>
          <div>
            <span>PRÓXIMA AÇÃO</span>
            <h4>Cadastre os projetos que você já desbloqueou</h4>
            <p>
              O catálogo completo está carregado, mas o TitanPath precisa saber quais projetos pertencem à sua conta antes de recomendar uma rota de fabricação.
            </p>
          </div>
        `;
      }

      setCraftText("bestXpPerMin", "—");
      setCraftText("bestGoldPerMin", "—");
      setCraftText("bestBalancedItem", "—");
      setCraftText("worstCraftItem", "—");

      renderAdvisorExtension();
      return;
    }

    const best = ranked[0];
    const planData = buildSmartSlotPlan();
    const bottleneck = detectAdvisorBottleneck();
    const diagnosis = smartGrowthDiagnosis();

    if (priority) {
      priority.textContent =
        best.craftable ? "PLANO PRONTO" :
        bottleneck ? "CORRIGIR GARGALO" :
        "REVISAR RECURSOS";
    }

    let mainTitle = best.craftable
      ? `Priorize ${escapeHtml(best.name)}`
      : `Prepare recursos para ${escapeHtml(best.name)}`;

    let mainText = advisorReason(best);

    if (planData.plan.length) {
      const planNames = planData.plan
        .map(({ project }) => escapeHtml(project.name))
        .join(" → ");

      mainText += ` Plano dos slots livres: ${planNames}.`;
    }

    if (recommendation) {
      recommendation.innerHTML = `
        <div class="crafting-recommendation-icon">${best.icon || "⚒️"}</div>

        <div class="tp-smart-advisor-copy">
          <span>PRÓXIMA AÇÃO</span>
          <h4>${mainTitle}</h4>
          <p>${mainText}</p>

          <div class="tp-advisor-diagnosis ${diagnosis.level}">
            <strong>${escapeHtml(diagnosis.title)}</strong>
            <small>${escapeHtml(diagnosis.text)}</small>
          </div>

          ${bottleneck ? advisorBottleneckHtml(bottleneck) : ""}

          <div class="tp-advisor-plan">
            <div class="tp-advisor-plan-title">
              <strong>Plano automático</strong>
              <small>${planData.plan.length}/${planData.freeSlots} slots livres planejados${planData.metrics ? ` • ${fmt(planData.metrics.totalXpPerMin, 1)} XP/min total • ${fmt(planData.metrics.totalGoldPerMin, 1)} ouro/min total` : ""}</small>
            </div>

            ${
              planData.plan.length
                ? planData.plan.map(({ slotIndex, project }, index) => `
                    <div class="tp-advisor-plan-row">
                      <span>${index + 1}</span>
                      <div>
                        <strong>Slot ${slotIndex + 1}: ${escapeHtml(project.name)}</strong>
                        <small>
                          ${fmt(project.xpPerMin, 1)} XP/min •
                          ${fmt(project.goldPerMin, 1)} ouro/min
                        </small>
                      </div>
                    </div>
                  `).join("")
                : `
                    <div class="tp-advisor-plan-empty">
                      Nenhum slot livre pode ser preenchido com os recursos atuais.
                    </div>
                  `
            }
          </div>

          ${
            planData.plan.length
              ? `<button class="tp-advisor-auto-fill" id="advisorAutoFillButton">
                   ⚡ PREENCHER SLOTS RECOMENDADOS
                 </button>`
              : ""
          }
        </div>
      `;
    }

    const bestXp = [...ranked].sort((a, b) => b.xpPerMin - a.xpPerMin)[0];
    const bestGold = [...ranked].sort((a, b) => b.goldPerMin - a.goldPerMin)[0];
    const worst = ranked[ranked.length - 1];

    setCraftText("bestXpPerMin", `${bestXp.name} • ${fmt(bestXp.xpPerMin, 1)}`);
    setCraftText("bestGoldPerMin", `${bestGold.name} • ${fmt(bestGold.goldPerMin, 1)}`);
    setCraftText("bestBalancedItem", best.name);
    setCraftText("worstCraftItem", worst.name);

    document.getElementById("advisorAutoFillButton")
      ?.addEventListener("click", () => {
        const freshPlan = buildSmartSlotPlan();

        freshPlan.plan.forEach(({ slotIndex, project }) => {
          crafting.queue[slotIndex] = project.id;
        });

        saveCrafting();
        updateCraftingUI();
      });

    renderAdvisorExtension();
  }

  function advisorBottleneckHtml(bottleneck) {
    if (bottleneck.type === "component-shortage") {
      return `<div class="tp-advisor-bottleneck"><span>🧩 COMPONENTE EM FALTA</span><strong>${escapeHtml(bottleneck.component)}</strong><small>Você possui ${fmt(bottleneck.available)} e precisa de ${fmt(bottleneck.required)}. Faltam ${fmt(bottleneck.missing)} para fabricar o projeto recomendado.</small></div>`;
    }
    if (bottleneck.type === "component-pressure") {
      return `<div class="tp-advisor-bottleneck"><span>🧩 COMPONENTE LIMITANTE</span><strong>${escapeHtml(bottleneck.component)}</strong><small>Depois de reservar os crafts planejados, este componente impede preencher outro slot. ${bottleneck.projectName ? `Projeto afetado: ${escapeHtml(bottleneck.projectName)}.` : ""} Faltam ${fmt(bottleneck.missing)}.</small></div>`;
    }
    if (bottleneck.type === "shortage") {
      const missing = Math.max(0, bottleneck.required - bottleneck.available);

      let binText = "";

      if (bottleneck.bin) {
        const next = bottleneck.bin.nextCapacity
          ? ` Se evoluir o recipiente #${bottleneck.bin.index} do Nv.${bottleneck.bin.level}, a capacidade individual passa de ${bottleneck.bin.currentCapacity} para ${bottleneck.bin.nextCapacity}.` +
            `${bottleneck.bin.nextGoldCost ? ` Custo: ${fmt(bottleneck.bin.nextGoldCost)} ouro.` : ""}` +
            `${bottleneck.bin.nextUpgradeTime ? ` Tempo: ${bottleneck.bin.nextUpgradeTime}.` : ""}` +
            `${bottleneck.bin.nextRequiredBuilding ? ` Requisito: ${bottleneck.bin.nextRequiredBuilding}.` : ""}`
          : "";

        binText = next;
      }

      return `
        <div class="tp-advisor-bottleneck">
          <span>⚠️ GARGALO</span>
          <strong>${escapeHtml(bottleneck.resource)}</strong>
          <small>
            Faltam ${fmt(missing)} para o melhor projeto atual.
            ${bottleneck.capacity !== null ? `Sua capacidade de loja cadastrada é ${fmt(bottleneck.capacity)}.` : ""}
            ${escapeHtml(binText)}
          </small>
        </div>
      `;
    }

    return `
      <div class="tp-advisor-bottleneck">
        <span>⚠️ PRESSÃO DE RECURSO</span>
        <strong>${escapeHtml(bottleneck.resource)}</strong>
        <small>
          Este recurso está limitando o preenchimento de todos os slots.
          ${bottleneck.capacity !== null ? `Capacidade cadastrada: ${fmt(bottleneck.capacity)}.` : ""}
        </small>
      </div>
    `;
  }

  function advisorReason(project) {
    const resourceCount = Object.keys(project.resources || {}).length;

    const parts = [
      `${fmt(project.xpPerMin, 1)} XP/min`,
      `${fmt(project.goldPerMin, 1)} ouro/min`,
      `${resourceCount} recurso${resourceCount === 1 ? "" : "s"}`,
      `estoque ${fmt(project.stock)}`
    ];

    if (!project.craftable) {
      parts.push("não fabricável com o saldo livre atual");
    } else {
      parts.push("fabricável agora");
    }

    if (crafting.strategy === "xp") {
      return `No modo XP, o Advisor priorizou ganho de experiência. ${parts.join(" • ")}.`;
    }

    if (crafting.strategy === "gold") {
      return `No modo Ouro, o Advisor priorizou retorno por minuto. ${parts.join(" • ")}.`;
    }

    if (crafting.strategy === "balanced") {
      return `No modo Equilibrado, o Advisor buscou a melhor combinação entre experiência e ouro. ${parts.join(" • ")}.`;
    }

    return `No modo Crescimento Rápido, o TitanPath dá mais peso a XP sem ignorar ouro, estoque e disponibilidade. ${parts.join(" • ")}.`;
  }

  function renderAdvisorExtension() {
    document.getElementById("tpSmartResourceStatus")?.remove();

    const advisorPanel = document.querySelector("#page-crafting .crafting-advisor-panel");
    if (!advisorPanel) return;

    const card = document.createElement("div");
    card.id = "tpSmartResourceStatus";
    card.className = "tp-smart-resource-status";

    const capacities = shopResourceCapacities();
    const effective = effectiveResources();
    const reserved = queuedReservedResources();

    const preferredOrder = [
      "Ferro","Madeira","Couro","Ervas",
      "Aço","Madeira de Ferro","Tecido","Óleo",
      "Joias","Éter","Essência","Poeira Estelar"
    ];

    const visibleResources = preferredOrder.filter(resource =>
      ["Ferro","Madeira","Couro","Ervas"].includes(resource) ||
      Number(capacities[resource] || 0) > 0 ||
      Number(crafting.resources[resource] || 0) > 0
    );

    card.innerHTML = `
      <div class="tp-smart-resource-header">
        <div>
          <span>🏪 LOJA → FABRICAÇÃO</span>
          <strong>Recursos e capacidades</strong>
        </div>
        <small>${escapeHtml(resourceFreshnessText())}</small>
      </div>

      <div class="tp-smart-resource-grid">
        ${visibleResources.map(resource => `
          <div>
            <span>${resource}</span>
            <strong>${fmt(effective[resource] || 0)} livres</strong>
            <small>
              ${fmt(reserved[resource] || 0)} reservados •
              capacidade ${capacities[resource] !== undefined ? fmt(capacities[resource]) : "—"}
            </small>
          </div>
        `).join("")}
      </div>

      <small class="tp-smart-resource-note">
        A capacidade é lida automaticamente dos cestos cadastrados em Minha Loja.
        A quantidade atual de recursos continua sendo o saldo que você informa em Editar Fabricação.
      </small>
    `;

    advisorPanel.appendChild(card);
  }

  function renderSmartResourceStatus() {
    renderAdvisorExtension();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  /* =======================================================
     EDITOR DE FABRICAÇÃO
  ======================================================= */

  const craftingModal = document.createElement("div");
  craftingModal.id = "craftingEditor";

  craftingModal.innerHTML = `
    <div class="tp-modal-overlay"></div>

    <div class="tp-modal tp-crafting-modal">
      <div class="tp-modal-header">
        <div>
          <span>FABRICAÇÃO</span>
          <h2>Configurar fabricação</h2>
        </div>

        <button id="closeCraftingEditor">✕</button>
      </div>

      <div class="tp-crafting-editor-body">
        <section class="tp-editor-section">
          <h3>🔨 Slots</h3>

          <label class="tp-full-field">
            Slots de fabricação
            <input type="number" id="editCraftingSlots" min="1" max="20">
          </label>
        </section>

        <section class="tp-editor-section">
          <h3>📦 Recursos disponíveis agora</h3>
          <p class="tp-editor-help">
            Informe apenas o que você tem disponível no momento. O TitanPath usa isso para saber o que é fabricável.
          </p>

          <div class="tp-resource-edit-grid" id="craftingResourceInputs"></div>
        </section>

        <section class="tp-editor-section">
          <h3>🧩 Componentes disponíveis</h3>
          <p class="tp-editor-help">
            O TitanPath monta esta lista automaticamente usando os componentes exigidos pelos seus projetos desbloqueados. Informe apenas quantos você possui.
          </p>
          <div class="tp-resource-edit-grid" id="craftingComponentInputs"></div>
        </section>
      </div>

      <button id="saveCraftingConfig" class="tp-save-button">
        SALVAR CONFIGURAÇÃO
      </button>
    </div>
  `;

  document.body.appendChild(craftingModal);

  function renderCraftingResourceInputs() {
    const container = document.getElementById("craftingResourceInputs");
    if (!container) return;

    const names = [...new Set([
      ...blueprintResourceCatalog,
      ...Object.keys(crafting.resources)
    ].map(canonicalResourceName).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));

    const capacities = shopResourceCapacities();

    container.innerHTML = names.map(name => `
      <label>
        <span class="tp-resource-input-label">
          ${escapeHtml(name)}
          ${capacities[name] !== undefined ? `<small>Cap. loja: ${fmt(capacities[name])}</small>` : ""}
        </span>

        <input
          type="number"
          min="0"
          value="${Number(crafting.resources[name] || 0)}"
          data-crafting-resource="${escapeHtml(name)}"
        >
      </label>
    `).join("");
  }

  function renderCraftingComponentInputs() {
    const container = document.getElementById("craftingComponentInputs");
    if (!container) return;
    const names = [...new Set([
      ...Object.keys(crafting.components || {}),
      ...crafting.projects.flatMap(project => (project.components || []).map(component => component.name).filter(Boolean))
    ])].sort((a, b) => a.localeCompare(b, "pt-BR"));

    if (!names.length) {
      container.innerHTML = `<div class="tp-editor-help">Nenhum dos seus projetos desbloqueados exige componentes no momento.</div>`;
      return;
    }

    container.innerHTML = names.map(name => `
      <label>${escapeHtml(name)}
        <input type="number" min="0" value="${Number(crafting.components?.[name] || 0)}" data-crafting-component="${escapeHtml(name)}">
      </label>
    `).join("");
  }

  function openCraftingEditor() {
    document.getElementById("editCraftingSlots").value = crafting.totalSlots;
    renderCraftingResourceInputs();
    renderCraftingComponentInputs();

    craftingModal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeCraftingEditor() {
    craftingModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.getElementById("editCraftingButton")
    ?.addEventListener("click", openCraftingEditor);

  document.getElementById("closeCraftingEditor")
    .addEventListener("click", closeCraftingEditor);

  craftingModal.querySelector(".tp-modal-overlay")
    .addEventListener("click", closeCraftingEditor);

  document.getElementById("saveCraftingConfig")
    .addEventListener("click", () => {
      crafting.totalSlots = Math.max(
        1,
        Number(document.getElementById("editCraftingSlots").value || 4)
      );

      document.querySelectorAll("[data-crafting-resource]").forEach(input => {
        const name = canonicalResourceName(input.dataset.craftingResource);
        crafting.resources[name] = Math.max(0, Number(input.value || 0));
      });

      crafting = migrateCraftingResourceNames(crafting);

      document.querySelectorAll("[data-crafting-component]").forEach(input => {
        const name = input.dataset.craftingComponent;
        crafting.components[name] = Math.max(0, Number(input.value || 0));
      });

      crafting.resourcesUpdatedAt = Date.now();

      syncQueueLength();
      saveCrafting();
      updateCraftingUI();
      closeCraftingEditor();
    });

  /* =======================================================
     EDITOR DE PROJETO
  ======================================================= */

  const projectModal = document.createElement("div");
  projectModal.id = "projectEditor";

  projectModal.innerHTML = `
    <div class="tp-modal-overlay"></div>

    <div class="tp-modal tp-project-modal">
      <div class="tp-modal-header">
        <div>
          <span>PROJETO</span>
          <h2 id="projectEditorTitle">Adicionar projeto</h2>
        </div>

        <button id="closeProjectEditor">✕</button>
      </div>

      <div class="tp-project-form">
        <input type="hidden" id="projectId">

        <label>Nome do item
          <input type="text" id="projectName" placeholder="Ex.: Espada de Ferro">
        </label>

        <div class="tp-project-form-grid">
          <label>Tier
            <input type="number" id="projectTier" min="1" max="20" value="1">
          </label>

          <label>Categoria
            <input type="text" id="projectCategory" placeholder="Espada, Armadura...">
          </label>

          <label>Tempo (min)
            <input type="number" id="projectTime" min="1" value="1">
          </label>

          <label>Valor base
            <input type="number" id="projectValue" min="0" value="0">
          </label>

          <label>XP do Mercador
            <input type="number" id="projectXp" min="0" value="0">
          </label>

          <label>Estoque atual
            <input type="number" id="projectStock" min="0" value="0">
          </label>
        </div>

        <h3 class="tp-project-resource-title">Recursos necessários</h3>

        <div class="tp-project-form-grid" id="projectResourceInputs"></div>

        <div class="tp-catalog-project-info" id="catalogProjectInfo" hidden></div>
      </div>

      <button id="saveProjectButton" class="tp-save-button">
        SALVAR PROJETO
      </button>
    </div>
  `;

  document.body.appendChild(projectModal);

  function renderProjectResourceInputs(values = {}) {
    const container = document.getElementById("projectResourceInputs");
    if (!container) return;

    values = canonicalizeResourceObject(values || {}, "max");

    const providedNames = Object.entries(values || {})
      .filter(([, amount]) => Number(amount) > 0)
      .map(([name]) => canonicalResourceName(name));

    const names = (
      providedNames.length
        ? [...new Set(providedNames)]
        : [...new Set(blueprintResourceCatalog)]
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));

    container.innerHTML = names.map(name => `
      <label>${escapeHtml(name)}
        <input
          type="number"
          min="0"
          value="${Number(values[name] || 0)}"
          data-project-resource="${escapeHtml(name)}"
        >
      </label>
    `).join("");
  }

  function catalogResourcesToObject(blueprint) {
    const output = {};

    (blueprint?.resources || []).forEach(resource => {
      const name = canonicalResourceName(resource.name);
      output[name] = Math.max(Number(output[name] || 0), Number(resource.amount || 0));
    });

    return canonicalizeResourceObject(output, "max");
  }

  function openProjectEditor(id = null, catalogBlueprint = null) {
    const project = id ? projectById(id) : null;
    selectedCatalogBlueprint = catalogBlueprint || null;

    const source = project || (catalogBlueprint ? {
      id: "",
      name: catalogBlueprint.namePt || "",
      tier: catalogBlueprint.tier || 1,
      category: catalogBlueprint.categoryPt || "Item",
      timeMin: catalogBlueprint.craftTimeMinutes || 1,
      baseValue: catalogBlueprint.value || 0,
      xp: catalogBlueprint.merchantXp || 0,
      stock: 0,
      resources: catalogResourcesToObject(catalogBlueprint),
      components: catalogBlueprint.components || [],
      workers: catalogBlueprint.workers || [],
      energy: catalogBlueprint.energy || {},
      sourceUrl: catalogBlueprint.sourceUrl || "",
      catalogId: catalogBlueprint.id || ""
    } : null);

    setProjectValue("projectId", project?.id || "");
    setProjectValue("projectName", source?.name || "");
    setProjectValue("projectTier", source?.tier || 1);
    setProjectValue("projectCategory", source?.category || "");
    setProjectValue("projectTime", source?.timeMin || 1);
    setProjectValue("projectValue", source?.baseValue || 0);
    setProjectValue("projectXp", source?.xp || 0);
    setProjectValue("projectStock", source?.stock || 0);

    renderProjectResourceInputs(source?.resources || {});

    const info = document.getElementById("catalogProjectInfo");
    if (info) {
      if (catalogBlueprint) {
        const components = (catalogBlueprint.components || [])
          .map(c => `${escapeHtml(c.name)} ×${fmt(c.amount)}`)
          .join(" • ");

        info.hidden = false;
        info.innerHTML = `
          <strong>Dados preenchidos automaticamente</strong>
          <span>${escapeHtml(catalogBlueprint.namePt || "")}</span>
          <small>${components ? `Componentes: ${components}` : "Sem componentes cadastrados no seed atual."}</small>
        `;
      } else {
        info.hidden = true;
        info.innerHTML = "";
      }
    }

    setCraftText(
      "projectEditorTitle",
      project ? "Editar projeto" : (catalogBlueprint ? "Adicionar do catálogo" : "Adicionar projeto manual")
    );

    projectModal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function setProjectValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
  }

  function closeProjectEditor() {
    projectModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.getElementById("addBlueprintButton")
    ?.addEventListener("click", () => openCatalogSearch());

  document.getElementById("closeProjectEditor")
    .addEventListener("click", closeProjectEditor);

  projectModal.querySelector(".tp-modal-overlay")
    .addEventListener("click", closeProjectEditor);

  document.getElementById("saveProjectButton")
    .addEventListener("click", () => {
      const id = document.getElementById("projectId").value.trim();
      const name = document.getElementById("projectName").value.trim();

      if (!name) {
        alert("Informe o nome do projeto.");
        return;
      }

      const data = {
        id: id || uidCraft("project"),
        name,
        icon: "⚒️",
        tier: Math.max(1, Number(document.getElementById("projectTier").value || 1)),
        category: document.getElementById("projectCategory").value.trim() || "Item",
        timeMin: Math.max(1, Number(document.getElementById("projectTime").value || 1)),
        baseValue: Math.max(0, Number(document.getElementById("projectValue").value || 0)),
        xp: Math.max(0, Number(document.getElementById("projectXp").value || 0)),
        stock: Math.max(0, Number(document.getElementById("projectStock").value || 0)),
        resources: Object.fromEntries(
          [...document.querySelectorAll("[data-project-resource]")]
            .map(input => [
              input.dataset.projectResource,
              Math.max(0, Number(input.value || 0))
            ])
            .filter(([, amount]) => amount > 0)
        ),
        catalogId: selectedCatalogBlueprint?.id || projectById(id)?.catalogId || null,
        components: selectedCatalogBlueprint?.components || projectById(id)?.components || [],
        workers: selectedCatalogBlueprint?.workers || projectById(id)?.workers || [],
        energy: selectedCatalogBlueprint?.energy || projectById(id)?.energy || {},
        sourceUrl: selectedCatalogBlueprint?.sourceUrl || projectById(id)?.sourceUrl || "",
        unlocked: true
      };

      const existingIndex = crafting.projects.findIndex(p => p.id === data.id);

      if (existingIndex >= 0) {
        crafting.projects[existingIndex] = data;
      } else {
        crafting.projects.push(data);
      }

      saveCrafting();
      updateCraftingUI();
      closeProjectEditor();
    });

  /* =======================================================
     CATÁLOGO / BUSCA AUTOMÁTICA
  ======================================================= */

  const catalogModal = document.createElement("div");
  catalogModal.id = "catalogSearchModal";
  catalogModal.innerHTML = `
    <div class="tp-modal-overlay"></div>

    <div class="tp-modal tp-catalog-modal">
      <div class="tp-modal-header">
        <div>
          <span>CATÁLOGO SHOP TITANS</span>
          <h2>Buscar projeto</h2>
        </div>
        <button id="closeCatalogSearch">✕</button>
      </div>

      <div class="tp-catalog-search-box">
        <input
          type="search"
          id="catalogSearchInput"
          placeholder="Ex.: sandália tier 2, espada tier 5, Squire Sword..."
          autocomplete="off"
        >
      </div>

      <div class="tp-catalog-meta" id="catalogMeta"></div>
      <div class="tp-catalog-results" id="catalogResults"></div>

      <button class="tp-manual-project-button" id="manualProjectButton">
        Não achei o item — cadastrar manualmente
      </button>
    </div>
  `;

  document.body.appendChild(catalogModal);

  function openCatalogSearch() {
    const input = document.getElementById("catalogSearchInput");
    if (input) input.value = "";

    renderCatalogResults("");
    catalogModal.classList.add("open");
    document.body.style.overflow = "hidden";

    setTimeout(() => input?.focus(), 50);
  }

  function closeCatalogSearch() {
    catalogModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  function normalizeSearch(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function catalogSearchProfile(query) {
    const normalized = normalizeSearch(query);

    const tierMatch = normalized.match(/\b(?:tier|t)\s*(\d{1,2})\b/);
    const tier = tierMatch ? Number(tierMatch[1]) : null;

    let text = normalized
      .replace(/\b(?:tier|t)\s*\d{1,2}\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const synonymGroups = [
      {
        triggers: ["sandalia", "sandalias", "sandal", "sandals"],
        aliases: [
          "sandalia", "sandalias", "sandal", "sandals",
          "flip flop", "flip flops", "flip-flop", "flip-flops",
          "chinelo", "chinelos",
          "calcado leve", "light footwear"
        ]
      },
      {
        triggers: ["bota", "botas", "boot", "boots"],
        aliases: ["bota", "botas", "boot", "boots", "calcado leve", "light footwear"]
      },
      {
        triggers: ["sapato", "sapatos", "shoe", "shoes"],
        aliases: ["sapato", "sapatos", "shoe", "shoes", "calcado leve", "light footwear"]
      }
    ];

    const expanded = new Set(text ? text.split(/\s+/).filter(Boolean) : []);

    synonymGroups.forEach(group => {
      const triggered = group.triggers.some(trigger =>
        text.includes(normalizeSearch(trigger))
      );

      if (triggered) {
        group.aliases.forEach(alias => expanded.add(normalizeSearch(alias)));
      }
    });

    return {
      normalized,
      tier,
      text,
      tokens: [...expanded]
    };
  }

  function catalogItemSearchText(item) {
    const aliases = Array.isArray(item.searchAliases)
      ? item.searchAliases.join(" ")
      : "";

    return normalizeSearch(
      `${item.namePt || ""} ` +
      `${item.nameOriginal || ""} ` +
      `${aliases} ` +
      `${item.categoryPt || ""} ` +
      `${item.categoryOriginal || ""} ` +
      `${item.id || ""} ` +
      `tier ${item.tier || ""}`
    );
  }

  function renderCatalogResults(query) {
    const results = document.getElementById("catalogResults");
    const meta = document.getElementById("catalogMeta");
    if (!results || !meta) return;

    const profile = catalogSearchProfile(query);

    let matches = blueprintCatalog.filter(item => {
      if (!profile.normalized) return true;

      if (profile.tier !== null && Number(item.tier) !== profile.tier) {
        return false;
      }

      if (!profile.text) return true;

      const haystack = catalogItemSearchText(item);

      // Busca flexível: cada palavra digitada deve ser reconhecida,
      // considerando sinônimos PT-BR/EN e nomes alternativos.
      const rawTokens = profile.text.split(/\s+/).filter(Boolean);

      return rawTokens.every(token => {
        if (haystack.includes(token)) return true;

        if (["sandalia", "sandalias", "sandal", "sandals"].includes(token)) {
          return [
            "sandal", "sandals",
            "flip flop", "flip-flops",
            "chinelo", "chinelos",
            "calcado leve", "light footwear"
          ].some(alias => haystack.includes(normalizeSearch(alias)));
        }

        if (["sapato", "sapatos", "shoe", "shoes"].includes(token)) {
          return ["sapato", "sapatos", "shoe", "shoes", "calcado leve", "light footwear"]
            .some(alias => haystack.includes(normalizeSearch(alias)));
        }

        if (["bota", "botas", "boot", "boots"].includes(token)) {
          return ["bota", "botas", "boot", "boots", "calcado leve", "light footwear"]
            .some(alias => haystack.includes(normalizeSearch(alias)));
        }

        return false;
      });
    });

    // Relevância: nome exato/semelhante primeiro; tier já foi filtrado acima.
    matches.sort((a, b) => {
      const aText = catalogItemSearchText(a);
      const bText = catalogItemSearchText(b);

      const aName = normalizeSearch(`${a.namePt || ""} ${a.nameOriginal || ""}`);
      const bName = normalizeSearch(`${b.namePt || ""} ${b.nameOriginal || ""}`);

      const q = profile.text;

      const aScore =
        (q && aName.includes(q) ? 100 : 0) +
        (q && aText.includes(q) ? 30 : 0) -
        Number(a.tier || 0) * 0.001;

      const bScore =
        (q && bName.includes(q) ? 100 : 0) +
        (q && bText.includes(q) ? 30 : 0) -
        Number(b.tier || 0) * 0.001;

      return bScore - aScore;
    });

    matches = matches.slice(0, 30);

    const unlockedCount = crafting.projects.filter(project => project.catalogId).length;
    meta.textContent = blueprintCatalog.length
      ? `${blueprintCatalog.length} projetos carregados • ${unlockedCount} desbloqueados • ${matches.length} resultado(s) exibidos`
      : "Catálogo não carregado. Verifique data/blueprints-pt.json.";

    if (!matches.length) {
      results.innerHTML = `
        <div class="tp-catalog-empty">
          <strong>Nenhum projeto encontrado</strong>
          <small>Você pode pesquisar por nome, categoria e tier. Ex.: “sandália tier 2”.</small>
        </div>
      `;
      return;
    }

    results.innerHTML = matches.map(item => {
      const alreadyUnlocked = crafting.projects.some(project => project.catalogId === item.id);
      const resources = (item.resources || [])
        .map(r => `${escapeHtml(r.name)} ${fmt(r.amount)}`)
        .join(" • ");

      return `
        <button class="tp-catalog-item" data-catalog-id="${escapeHtml(item.id)}">
          <div>
            <strong>${escapeHtml(item.namePt || "Projeto")}</strong>
            ${
              item.nameOriginal && item.nameOriginal !== item.namePt
                ? `<small class="tp-catalog-original-name">${escapeHtml(item.nameOriginal)}</small>`
                : ""
            }
            <span>
              ${item.tier ? `Tier ${item.tier}` : "Tier não informado"} •
              ${escapeHtml(item.categoryPt || "Categoria")}
            </span>
            <small>${resources || "Recursos não informados"}</small>
          </div>
          <span class="tp-catalog-arrow">${alreadyUnlocked ? "✓" : "+"}</span>
        </button>
      `;
    }).join("");

    results.querySelectorAll("[data-catalog-id]").forEach(button => {
      button.addEventListener("click", () => {
        const blueprint = blueprintCatalog.find(
          item => item.id === button.dataset.catalogId
        );

        if (!blueprint) return;

        const existing = crafting.projects.find(project => project.catalogId === blueprint.id);
        closeCatalogSearch();
        if (existing) {
          openProjectEditor(existing.id);
        } else {
          openProjectEditor(null, blueprint);
        }
      });
    });
  }

  document.getElementById("catalogSearchInput")
    ?.addEventListener("input", event => {
      renderCatalogResults(event.target.value);
    });

  document.getElementById("closeCatalogSearch")
    ?.addEventListener("click", closeCatalogSearch);

  catalogModal.querySelector(".tp-modal-overlay")
    ?.addEventListener("click", closeCatalogSearch);

  document.getElementById("manualProjectButton")
    ?.addEventListener("click", () => {
      closeCatalogSearch();
      openProjectEditor();
    });

  /* =======================================================
     FILTROS E ESTRATÉGIA
  ======================================================= */

  document.getElementById("craftingStrategySelect")
    ?.addEventListener("change", event => {
      crafting.strategy = event.target.value;
      saveCrafting();
      updateCraftingUI();
    });

  document.getElementById("craftingSortSelect")
    ?.addEventListener("change", event => {
      crafting.sort = event.target.value;
      saveCrafting();
      renderBlueprints();
    });

  document.getElementById("craftingFilterSelect")
    ?.addEventListener("change", event => {
      crafting.filter = event.target.value;
      saveCrafting();
      renderBlueprints();
    });

  /* =======================================================
     ESTILOS DINÂMICOS DA FABRICAÇÃO
  ======================================================= */

  const craftingStyle = document.createElement("style");

  craftingStyle.textContent = `
    #craftingEditor,#projectEditor{
      position:fixed;inset:0;z-index:10010;display:none;
      align-items:center;justify-content:center;padding:20px
    }

    #craftingEditor.open,#projectEditor.open{display:flex}

    .tp-crafting-modal,.tp-project-modal{
      width:min(720px,100%)
    }

    .tp-crafting-editor-body{
      overflow-y:auto;
      padding-right:4px;
    }

    .tp-full-field,
    .tp-resource-edit-grid label,
    .tp-project-form label{
      display:grid;
      gap:7px;
      color:#a7b0bf;
      font-size:11px;
      font-weight:700;
    }

    .tp-full-field input,
    .tp-resource-edit-grid input,
    .tp-project-form input{
      width:100%;
      min-height:44px;
      padding:0 12px;
      border-radius:10px;
      border:1px solid rgba(255,255,255,.08);
      outline:none;
      background:#080c12;
      color:#fff;
      font-size:14px;
    }

    .tp-resource-edit-grid,
    .tp-project-form-grid{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:10px;
    }

    .tp-project-form{
      display:grid;
      gap:14px;
      overflow-y:auto;
      max-height:68vh;
      padding-right:4px;
    }

    .tp-project-resource-title{
      margin-top:4px;
      font-size:14px;
    }

    .tp-project-actions,
    .tp-slot-actions{
      display:flex;
      gap:7px;
      flex-wrap:wrap;
      margin-top:12px;
      position:relative;
      z-index:2;
    }

    .tp-project-actions button,
    .tp-slot-actions button,
    .tp-slot-recommend{
      min-height:38px;
      padding:0 10px;
      border-radius:9px;
      cursor:pointer;
      font-size:11px;
      font-weight:800;
    }

    .tp-project-craft,
    .tp-slot-recommend,
    .tp-slot-complete{
      background:rgba(244,185,66,.10);
      border:1px solid rgba(244,185,66,.25);
      color:#ffd36a;
    }

    .tp-project-edit,
    .tp-slot-cancel{
      background:rgba(42,167,255,.08);
      border:1px solid rgba(42,167,255,.18);
      color:#aaddff;
    }

    .tp-project-delete{
      background:rgba(255,95,102,.07);
      border:1px solid rgba(255,95,102,.16);
      color:#ff9297;
    }

    .tp-project-resource-line{
      margin-top:10px;
      padding:8px 9px;
      border-radius:9px;
      background:rgba(255,255,255,.025);
      color:#a7b0bf;
      font-size:10px;
      line-height:1.45;
    }

    .crafting-slot-card.active{
      border-color:rgba(244,185,66,.22);
    }

    .tp-catalog-modal{
      width:min(760px,100%);
    }

    #catalogSearchModal{
      position:fixed;inset:0;z-index:10020;display:none;
      align-items:center;justify-content:center;padding:20px;
    }

    #catalogSearchModal.open{display:flex}

    .tp-catalog-search-box input{
      width:100%;min-height:52px;padding:0 15px;border-radius:12px;
      border:1px solid rgba(244,185,66,.28);outline:none;background:#080c12;
      color:#fff;font-size:16px;
    }

    .tp-catalog-meta{
      margin:10px 0;color:#6e7887;font-size:11px;
    }

    .tp-catalog-results{
      display:grid;gap:8px;max-height:54vh;overflow-y:auto;padding-right:4px;
    }

    .tp-catalog-item{
      width:100%;display:grid;grid-template-columns:1fr auto;gap:12px;
      align-items:center;text-align:left;padding:13px;border-radius:12px;
      background:#0b1119;border:1px solid rgba(255,255,255,.07);
      color:#fff;cursor:pointer;
    }

    .tp-catalog-item strong,.tp-catalog-item span,.tp-catalog-item small{
      display:block;
    }

    .tp-catalog-item span{
      margin-top:3px;color:#a7b0bf;font-size:11px;
    }

    .tp-catalog-item small{
      margin-top:5px;color:#6e7887;font-size:10px;line-height:1.4;
    }

    .tp-catalog-arrow{
      color:#ffd36a!important;font-size:20px!important;
    }

    .tp-catalog-empty{
      padding:26px;text-align:center;border:1px dashed rgba(255,255,255,.08);
      border-radius:12px;color:#a7b0bf;
    }

    .tp-catalog-empty strong,.tp-catalog-empty small{display:block}
    .tp-catalog-empty small{margin-top:5px;color:#6e7887}

    .tp-manual-project-button{
      width:100%;min-height:44px;margin-top:12px;border-radius:11px;
      background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);
      color:#a7b0bf;cursor:pointer;font-weight:800;
    }

    .tp-catalog-project-info{
      padding:12px;border-radius:11px;background:rgba(35,209,139,.06);
      border:1px solid rgba(35,209,139,.14);
    }

    .tp-catalog-project-info strong,.tp-catalog-project-info span,.tp-catalog-project-info small{
      display:block;
    }

    .tp-catalog-project-info strong{color:#7fe8bb;font-size:11px}
    .tp-catalog-project-info span{margin-top:4px;color:#fff;font-weight:800}
    .tp-catalog-project-info small{margin-top:5px;color:#8c99aa;line-height:1.4}


    .tp-smart-advisor-copy{
      display:grid;
      gap:12px;
    }

    .tp-advisor-diagnosis{
      padding:11px 12px;
      border-radius:11px;
      border:1px solid rgba(255,255,255,.07);
      background:rgba(255,255,255,.025);
    }

    .tp-advisor-diagnosis strong,
    .tp-advisor-diagnosis small{
      display:block;
    }

    .tp-advisor-diagnosis small{
      margin-top:4px;
      color:#8c99aa;
      line-height:1.45;
    }

    .tp-advisor-diagnosis.good{
      border-color:rgba(35,209,139,.18);
      background:rgba(35,209,139,.055);
    }

    .tp-advisor-diagnosis.warning{
      border-color:rgba(244,185,66,.22);
      background:rgba(244,185,66,.055);
    }

    .tp-advisor-bottleneck{
      padding:12px;
      border-radius:11px;
      border:1px solid rgba(255,95,102,.18);
      background:rgba(255,95,102,.055);
    }

    .tp-advisor-bottleneck span,
    .tp-advisor-bottleneck strong,
    .tp-advisor-bottleneck small{
      display:block;
    }

    .tp-advisor-bottleneck span{
      color:#ff9297;
      font-size:9px;
      font-weight:900;
      letter-spacing:.12em;
    }

    .tp-advisor-bottleneck strong{
      margin-top:4px;
      color:#fff;
    }

    .tp-advisor-bottleneck small{
      margin-top:4px;
      color:#9aa6b6;
      line-height:1.45;
    }

    .tp-advisor-plan{
      display:grid;
      gap:7px;
      padding:12px;
      border-radius:12px;
      background:#0a1017;
      border:1px solid rgba(255,255,255,.07);
    }

    .tp-advisor-plan-title{
      display:flex;
      justify-content:space-between;
      gap:12px;
      align-items:center;
      margin-bottom:2px;
    }

    .tp-advisor-plan-title small{
      color:#6e7887;
    }

    .tp-advisor-plan-row{
      display:grid;
      grid-template-columns:28px 1fr;
      gap:9px;
      align-items:center;
      padding:8px;
      border-radius:9px;
      background:rgba(255,255,255,.025);
    }

    .tp-advisor-plan-row>span{
      width:28px;
      height:28px;
      display:grid;
      place-items:center;
      border-radius:8px;
      background:rgba(244,185,66,.1);
      color:#ffd36a;
      font-weight:900;
      font-size:11px;
    }

    .tp-advisor-plan-row strong,
    .tp-advisor-plan-row small{
      display:block;
    }

    .tp-advisor-plan-row small{
      margin-top:3px;
      color:#788494;
      font-size:10px;
    }

    .tp-advisor-plan-empty{
      color:#7b8796;
      font-size:11px;
      padding:7px 0;
    }

    .tp-advisor-auto-fill{
      width:100%;
      min-height:46px;
      border-radius:11px;
      cursor:pointer;
      background:linear-gradient(135deg,#ffd36a,#f4b942);
      color:#171005;
      font-weight:900;
    }

    .tp-smart-resource-status{
      margin-top:14px;
      padding:13px;
      border-radius:12px;
      background:rgba(255,255,255,.022);
      border:1px solid rgba(255,255,255,.065);
    }

    .tp-smart-resource-header{
      display:flex;
      align-items:flex-end;
      justify-content:space-between;
      gap:10px;
    }

    .tp-smart-resource-header span,
    .tp-smart-resource-header strong{
      display:block;
    }

    .tp-smart-resource-header span{
      color:#ffd36a;
      font-size:9px;
      font-weight:900;
      letter-spacing:.12em;
    }

    .tp-smart-resource-header strong{
      margin-top:4px;
      font-size:14px;
    }

    .tp-smart-resource-header>small{
      color:#6e7887;
      font-size:9px;
      text-align:right;
    }

    .tp-smart-resource-grid{
      display:grid;
      grid-template-columns:repeat(4,minmax(0,1fr));
      gap:7px;
      margin-top:10px;
    }

    .tp-smart-resource-grid>div{
      padding:8px;
      border-radius:9px;
      background:#0a1017;
      border:1px solid rgba(255,255,255,.055);
    }

    .tp-smart-resource-grid span,
    .tp-smart-resource-grid strong,
    .tp-smart-resource-grid small{
      display:block;
    }

    .tp-smart-resource-grid span{
      color:#8d98a8;
      font-size:9px;
    }

    .tp-smart-resource-grid strong{
      margin-top:3px;
      font-size:12px;
    }

    .tp-smart-resource-grid small{
      margin-top:3px;
      color:#626d7b;
      font-size:8px;
      line-height:1.35;
    }

    .tp-smart-resource-note{
      display:block;
      margin-top:9px;
      color:#66717f;
      font-size:9px;
      line-height:1.45;
    }

    .tp-resource-input-label{
      display:flex;
      justify-content:space-between;
      gap:8px;
      align-items:center;
    }

    .tp-resource-input-label small{
      color:#6e7887;
      font-size:8px;
      font-weight:600;
    }

    .tp-catalog-original-name{
      color:#596575!important;
      font-size:9px!important;
      margin-top:2px!important;
    }

    @media(max-width:640px){
      #catalogSearchModal{align-items:flex-end;padding:0}
      .tp-catalog-modal{
        width:100%;max-height:94vh;border-radius:22px 22px 0 0;
      }

      #craftingEditor,#projectEditor{
        align-items:flex-end;
        padding:0;
      }

      .tp-crafting-modal,.tp-project-modal{
        width:100%;
        max-height:94vh;
        border-radius:22px 22px 0 0;
      }

      .tp-resource-edit-grid,
      .tp-project-form-grid{
        grid-template-columns:1fr 1fr;
      }

      .tp-project-actions button{
        flex:1 1 auto;
      }

      .tp-smart-resource-grid{
        grid-template-columns:1fr 1fr;
      }

      .tp-advisor-plan-title{
        align-items:flex-start;
        flex-direction:column;
        gap:3px;
      }

      .tp-smart-resource-header{
        align-items:flex-start;
        flex-direction:column;
      }

      .tp-smart-resource-header>small{
        text-align:left;
      }
    }

    @media(max-width:390px){
      .tp-resource-edit-grid,
      .tp-project-form-grid{
        grid-template-columns:1fr;
      }
    }
  `;


  const salesStyle = document.createElement("style");
  salesStyle.id = "titanpath-sales-v080";
  salesStyle.textContent = `
    .tp-sales-panel{display:block!important;padding:18px!important}
    .tp-sales-heading{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
    .tp-sales-heading h3{margin-top:5px;font-size:20px}
    .tp-sales-heading p{margin-top:6px;color:#8c99aa;line-height:1.5;max-width:780px}
    .tp-sales-energy{min-width:125px;padding:10px 12px;border-radius:12px;background:#0a1017;border:1px solid rgba(244,185,66,.18);text-align:right}
    .tp-sales-energy span,.tp-sales-energy strong{display:block}.tp-sales-energy span{font-size:9px;color:#8c99aa}.tp-sales-energy strong{margin-top:3px;color:#ffd36a;font-size:20px}
    .tp-sales-recommendation{margin-top:14px;padding:13px;border-radius:12px;background:rgba(35,209,139,.055);border:1px solid rgba(35,209,139,.18)}
    .tp-sales-recommendation span,.tp-sales-recommendation strong,.tp-sales-recommendation small{display:block}
    .tp-sales-recommendation span{font-size:9px;color:#ffd36a;font-weight:900;letter-spacing:.12em}.tp-sales-recommendation strong{margin-top:5px;font-size:16px}.tp-sales-recommendation small{margin-top:5px;color:#9aa5b4;line-height:1.45}
    .tp-sales-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}
    .tp-sale-card{padding:12px;border-radius:13px;background:#0a1017;border:1px solid rgba(255,255,255,.065)}
    .tp-sale-card-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.tp-sale-card-top strong,.tp-sale-card-top small{display:block}.tp-sale-card-top small{margin-top:3px;color:#6e7887;font-size:9px}.tp-sale-card-top>span{color:#ffd36a;font-weight:900;white-space:nowrap}
    .tp-sale-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:10px}.tp-sale-options button{padding:9px 7px;border-radius:9px;background:#101823;border:1px solid rgba(255,255,255,.07);color:#f4f7fb;cursor:pointer;text-align:left}.tp-sale-options button:hover:not(:disabled){border-color:rgba(244,185,66,.35)}.tp-sale-options button:disabled{opacity:.35;cursor:not-allowed}.tp-sale-options span,.tp-sale-options strong,.tp-sale-options small{display:block}.tp-sale-options span{font-size:8px;color:#8c99aa}.tp-sale-options strong{margin-top:3px;font-size:11px}.tp-sale-options small{margin-top:3px;font-size:8px;color:#6e7887}
    .tp-sales-note{display:block;margin-top:10px;color:#66717f;font-size:8px;line-height:1.4}
    .tp-sales-empty{margin-top:14px;padding:16px;border-radius:11px;border:1px dashed rgba(255,255,255,.08);color:#8c99aa;text-align:center}
    .tp-sales-history{margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.06)}.tp-sales-history>strong{font-size:12px}.tp-sales-history>div{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.04)}.tp-sales-history span{font-size:10px}.tp-sales-history small{font-size:9px;color:#7f8b9b}
    @media(max-width:720px){.tp-sales-heading{flex-direction:column}.tp-sales-energy{width:100%;text-align:left}.tp-sales-grid{grid-template-columns:1fr}.tp-sale-options{grid-template-columns:1fr 1fr 1fr}}
    @media(max-width:430px){.tp-sale-options{grid-template-columns:1fr}.tp-sales-history>div{flex-direction:column;gap:3px}}
  `;
  document.head.appendChild(salesStyle);

  // Garante a montagem do módulo de Vendas mesmo antes de qualquer
  // atualização posterior da Fabricação. O bloco já existe no index.html
  // com a classe .crafting-sales-link, então substituímos o placeholder
  // imediatamente quando o app termina de inicializar.
  const ensureSalesPanelRendered = () => {
    const host = document.getElementById("salesIntelligencePanel") || document.querySelector(".crafting-sales-link");
    if (!host) return;
    renderSalesAdvisor();
  };

  requestAnimationFrame(ensureSalesPanelRendered);
  setTimeout(ensureSalesPanelRendered, 150);
  setTimeout(ensureSalesPanelRendered, 800);

  // Ao voltar para Fabricação pelo menu, renderiza novamente para refletir
  // estoque, energia e histórico atualizados.
  document.querySelectorAll('[data-page="crafting"], [data-go="crafting"]')
    .forEach(button => {
      button.addEventListener("click", () => {
        setTimeout(ensureSalesPanelRendered, 0);
      });
    });


  const economicStyle = document.createElement("style");
  economicStyle.id = "titanpath-economic-advisor-v090";
  economicStyle.textContent = `
    .tp-economic-advisor{
      margin-top:14px;padding:16px;border-radius:14px;
      border:1px solid rgba(255,211,106,.16);
      background:linear-gradient(135deg,rgba(255,211,106,.055),rgba(35,209,139,.035));
    }
    .tp-economic-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
    .tp-economic-head>div:first-child{min-width:0}
    .tp-economic-head span,.tp-economic-head strong,.tp-economic-head small{display:block}
    .tp-economic-head>div:first-child>span{font-size:10px;font-weight:900;letter-spacing:1.1px;color:#ffd36a}
    .tp-economic-head>div:first-child>strong{margin-top:6px;font-size:17px;color:#fff}
    .tp-economic-head>div:first-child>small{margin-top:6px;color:#9eabbd;line-height:1.5}
    .tp-economic-projection{flex:0 0 auto;min-width:150px;padding:10px 12px;border-radius:11px;background:rgba(0,0,0,.2);text-align:right}
    .tp-economic-projection span{font-size:9px;color:#7e8a9b}
    .tp-economic-projection strong{margin-top:4px;color:#ffd36a;font-size:16px}
    .tp-economic-projection small{margin-top:3px;color:#9eabbd}
    .tp-economic-cycle{margin-top:12px;padding:11px 12px;border-radius:11px;border:1px solid rgba(35,209,139,.14);background:rgba(35,209,139,.04)}
    .tp-economic-cycle span,.tp-economic-cycle strong,.tp-economic-cycle small{display:block}
    .tp-economic-cycle span{font-size:9px;font-weight:900;letter-spacing:1px;color:#7fe8bb}
    .tp-economic-cycle strong{margin-top:4px;color:#fff}
    .tp-economic-cycle small{margin-top:5px;color:#8f9caf;line-height:1.45}
    .tp-economic-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}
    .tp-economic-stats>div{padding:10px;border-radius:10px;background:rgba(0,0,0,.18);border:1px solid rgba(255,255,255,.05)}
    .tp-economic-stats span,.tp-economic-stats strong{display:block}
    .tp-economic-stats span{font-size:9px;color:#7e8a9b}
    .tp-economic-stats strong{margin-top:4px;color:#fff;font-size:15px}
    .tp-economic-action{width:100%;margin-top:12px;min-height:44px;border:0;border-radius:11px;background:linear-gradient(90deg,#ffd36a,#f4b942);color:#19140a;font-weight:900;cursor:pointer}
    @media(max-width:640px){
      .tp-economic-head{flex-direction:column}
      .tp-economic-projection{width:100%;text-align:left}
      .tp-economic-stats{grid-template-columns:1fr 1fr}
    }
  `;
  document.head.appendChild(economicStyle);

  document.head.appendChild(craftingStyle);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeCraftingEditor();
      closeProjectEditor();
    }
  });

  document.addEventListener("titanpath:resourcebinsloaded", () => {
    updateCraftingUI();
  });

  loadBlueprintCatalog().finally(() => {
    updateCraftingUI();
    ensureSalesPanelRendered();
  });
});


/* =========================================================
   TITANPATH v0.5.2 — CORREÇÃO REAL DO SCROLL
   IDs reais: #craftingEditor / #projectEditor / #catalogSearchModal
========================================================= */
(() => {
  const style = document.createElement("style");
  style.id = "titanpath-scroll-fix-v052";

  style.textContent = `
    /* O root continua travando o fundo, mas o CARD controla a rolagem */
    #craftingEditor,
    #projectEditor,
    #catalogSearchModal {
      overflow: hidden !important;
    }

    /* FABRICAÇÃO — estrutura flex correta */
    #craftingEditor .tp-crafting-modal {
      display: flex !important;
      flex-direction: column !important;
      width: min(720px, calc(100vw - 40px)) !important;
      height: auto !important;
      max-height: calc(100dvh - 40px) !important;
      overflow: hidden !important;
    }

    #craftingEditor .tp-modal-header {
      flex: 0 0 auto !important;
    }

    #craftingEditor .tp-crafting-editor-body {
      flex: 1 1 auto !important;
      min-height: 0 !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      -webkit-overflow-scrolling: touch !important;
      overscroll-behavior: contain !important;
      touch-action: pan-y !important;
      padding-right: 8px !important;
      padding-bottom: 18px !important;
    }

    #craftingEditor #saveCraftingConfig {
      flex: 0 0 auto !important;
      width: 100% !important;
      margin-top: 12px !important;
    }

    /* PROJETO — mesma proteção */
    #projectEditor .tp-project-modal {
      display: flex !important;
      flex-direction: column !important;
      width: min(720px, calc(100vw - 40px)) !important;
      max-height: calc(100dvh - 40px) !important;
      overflow: hidden !important;
    }

    #projectEditor .tp-project-form {
      flex: 1 1 auto !important;
      min-height: 0 !important;
      max-height: none !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      -webkit-overflow-scrolling: touch !important;
      touch-action: pan-y !important;
      padding-right: 8px !important;
      padding-bottom: 18px !important;
    }

    #projectEditor #saveProjectButton {
      flex: 0 0 auto !important;
      width: 100% !important;
      margin-top: 12px !important;
    }

    /* CATÁLOGO */
    #catalogSearchModal .tp-catalog-modal {
      display: flex !important;
      flex-direction: column !important;
      width: min(760px, calc(100vw - 40px)) !important;
      max-height: calc(100dvh - 40px) !important;
      overflow: hidden !important;
    }

    #catalogSearchModal .tp-catalog-results {
      flex: 1 1 auto !important;
      min-height: 120px !important;
      max-height: none !important;
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch !important;
      touch-action: pan-y !important;
    }

    /* Scrollbar visível no notebook */
    #craftingEditor .tp-crafting-editor-body,
    #projectEditor .tp-project-form,
    #catalogSearchModal .tp-catalog-results {
      scrollbar-width: thin;
      scrollbar-color: rgba(244,185,66,.55) rgba(255,255,255,.04);
    }

    #craftingEditor .tp-crafting-editor-body::-webkit-scrollbar,
    #projectEditor .tp-project-form::-webkit-scrollbar,
    #catalogSearchModal .tp-catalog-results::-webkit-scrollbar {
      width: 7px;
    }

    #craftingEditor .tp-crafting-editor-body::-webkit-scrollbar-thumb,
    #projectEditor .tp-project-form::-webkit-scrollbar-thumb,
    #catalogSearchModal .tp-catalog-results::-webkit-scrollbar-thumb {
      background: rgba(244,185,66,.45);
      border-radius: 999px;
    }

    /* Mobile / iPhone */
    @media (max-width: 640px) {
      #craftingEditor,
      #projectEditor,
      #catalogSearchModal {
        align-items: flex-end !important;
        padding: 0 !important;
      }

      #craftingEditor .tp-crafting-modal,
      #projectEditor .tp-project-modal,
      #catalogSearchModal .tp-catalog-modal {
        width: 100% !important;
        max-width: 100% !important;
        max-height: calc(100dvh - env(safe-area-inset-top)) !important;
        border-radius: 22px 22px 0 0 !important;
      }

      #craftingEditor .tp-crafting-editor-body,
      #projectEditor .tp-project-form {
        padding-bottom: max(24px, env(safe-area-inset-bottom)) !important;
      }
    }

    @supports not (height: 100dvh) {
      #craftingEditor .tp-crafting-modal,
      #projectEditor .tp-project-modal,
      #catalogSearchModal .tp-catalog-modal {
        max-height: calc(100vh - 40px) !important;
      }

      @media (max-width: 640px) {
        #craftingEditor .tp-crafting-modal,
        #projectEditor .tp-project-modal,
        #catalogSearchModal .tp-catalog-modal {
          max-height: calc(100vh - env(safe-area-inset-top)) !important;
        }
      }
    }
  `;

  document.head.appendChild(style);
})();

/* =========================================================
   TITANPATH PRO COACH v1.0.0
========================================================= */
(() => {
  const style = document.createElement("style");
  style.id = "titanpath-pro-coach-v100";
  style.textContent = `
    .tp-pro-coach{
      margin:18px 0 20px;
      padding:18px;
      border:1px solid rgba(244,185,66,.20);
      background:
        radial-gradient(circle at 90% 0%,rgba(244,185,66,.10),transparent 35%),
        linear-gradient(145deg,rgba(22,24,29,.98),rgba(11,13,17,.98));
    }
    .tp-pro-coach-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}
    .tp-pro-coach-head span{font-size:10px;font-weight:900;letter-spacing:1.2px;color:#ffd36a}
    .tp-pro-coach-head h2{margin:5px 0 0;font-size:24px;color:#fff}
    .tp-pro-coach-head p{margin:5px 0 0;color:#8f9bad}
    .tp-pro-coach-state{text-align:right;padding:10px 12px;border-radius:12px;background:rgba(0,0,0,.22)}
    .tp-pro-coach-state small,.tp-pro-coach-state strong,.tp-pro-coach-state span{display:block}
    .tp-pro-coach-state small{font-size:9px;color:#778294}
    .tp-pro-coach-state strong{margin-top:4px;color:#fff}
    .tp-pro-coach-state span{margin-top:3px;font-size:10px;color:#8f9bad}
    .tp-pro-main-action{
      display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:14px;align-items:center;
      margin-top:16px;padding:16px;border-radius:14px;border:1px solid rgba(35,209,139,.18);
      background:rgba(35,209,139,.055)
    }
    .tp-pro-main-icon{width:48px;height:48px;display:grid;place-items:center;border-radius:13px;background:rgba(35,209,139,.10);font-size:24px}
    .tp-pro-main-copy span{font-size:9px;font-weight:900;letter-spacing:1px;color:#7fe8bb}
    .tp-pro-main-copy h3{margin:4px 0 0;color:#fff;font-size:19px}
    .tp-pro-main-copy p{margin:5px 0 0;color:#9aa6b7;line-height:1.45}
    .tp-pro-go{min-height:44px;padding:0 15px;border:0;border-radius:11px;background:#f4b942;color:#15120b;font-weight:950;cursor:pointer}
    .tp-pro-next{margin-top:13px}
    .tp-pro-next>span{display:block;margin-bottom:7px;font-size:9px;font-weight:900;letter-spacing:1px;color:#778294}
    .tp-pro-next button{
      width:100%;display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:10px;align-items:center;
      padding:10px 12px;margin-top:7px;text-align:left;border-radius:11px;
      border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.025);color:#fff;cursor:pointer
    }
    .tp-pro-next b{width:26px;height:26px;display:grid;place-items:center;border-radius:8px;background:rgba(244,185,66,.08);color:#ffd36a}
    .tp-pro-next strong,.tp-pro-next small{display:block}
    .tp-pro-next small{margin-top:3px;color:#7f8b9c;line-height:1.35}
    .tp-pro-next i{font-style:normal;color:#ffd36a}
    .tp-pro-details{margin-top:12px;color:#8995a6;font-size:11px}
    .tp-pro-details summary{cursor:pointer;color:#aeb8c6;font-weight:800}
    .tp-pro-details p{line-height:1.5}
    @media(max-width:700px){
      .tp-pro-coach{margin-top:10px;padding:13px}
      .tp-pro-coach-head{display:block}
      .tp-pro-coach-state{margin-top:10px;text-align:left}
      .tp-pro-main-action{grid-template-columns:42px minmax(0,1fr);padding:13px}
      .tp-pro-main-icon{width:42px;height:42px}
      .tp-pro-main-copy h3{font-size:17px}
      .tp-pro-go{grid-column:1/-1;width:100%;margin-top:2px}
    }
  `;
  document.head.appendChild(style);
})();
