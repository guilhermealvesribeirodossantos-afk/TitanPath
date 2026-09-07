/* =========================================================
   TITANPATH - APP.JS v0.2.2
   Loja individualizada + energia por rack + capacidades por bin
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
        icon: "🪵",
        items: [
          { id: "wood-1", level: 3 },
          { id: "wood-2", level: 3 }
        ]
      },
      iron: {
        name: "Ferro",
        icon: "⛓️",
        items: [
          { id: "iron-1", level: 3 },
          { id: "iron-2", level: 3 }
        ]
      },
      leather: {
        name: "Couro",
        icon: "🟫",
        items: [
          { id: "leather-1", level: 3 },
          { id: "leather-2", level: 3 }
        ]
      },
      herbs: {
        name: "Ervas",
        icon: "🌿",
        items: [
          { id: "herbs-1", level: 3 },
          { id: "herbs-2", level: 3 }
        ]
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
  let shop = migrateShop(loadRaw("titanpath_shop"));

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
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

  function binCapacity(level) {
    return TIER1_BIN_CAPACITY[Number(level)] || 0;
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
        const totalCapacity = group.items.reduce(
          (sum, item) => sum + binCapacity(item.level),
          0
        );

        const detail = group.items
          .map((item, index) => `#${index + 1} Nv.${item.level} = ${binCapacity(item.level)}`)
          .join(" • ");

        const lowest =
          group.items.length
            ? Math.min(...group.items.map(x => Number(x.level)))
            : null;

        const next =
          lowest && TIER1_BIN_CAPACITY[lowest + 1]
            ? TIER1_BIN_CAPACITY[lowest + 1]
            : null;

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
                  <b>${formatNumber(totalCapacity)}</b>
                </div>
                <div>
                  <small>Menor nível</small>
                  <b>${lowest ?? "—"}</b>
                </div>
                <div>
                  <small>Capacidade do menor</small>
                  <b>${lowest ? binCapacity(lowest) : "—"}</b>
                </div>
                <div>
                  <small>Após próximo upgrade</small>
                  <b>${next ?? "—"}</b>
                </div>
              </div>

              <small class="resource-source-note">
                Capacidade base. Bônus externos não incluídos.
              </small>
            </div>

            <span class="priority-badge medium">MÉDIA</span>
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
    return `
      <div class="tp-editor-group">
        <div class="tp-editor-group-title">
          <span>${group.icon}</span>
          <strong>${group.name}</strong>
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
            max="${type === "bin" ? 15 : 30}"
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
        <h3>🔨 Recipientes</h3>
        ${Object.entries(shop.bins)
          .map(([key, group]) => editorGroupHtml("bin", key, group))
          .join("")}
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

  updateDashboard();
});
/* =========================================================
   TITANPATH - FABRICAÇÃO INTELIGENTE v0.3.1
   Projetos + slots + XP/min + ouro/min + Advisor
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  const DEFAULT_CRAFTING = {
    totalSlots: 4,
    strategy: "fast-growth",
    sort: "advisor",
    filter: "all",
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

  let crafting = loadCrafting();

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

      if (Array.isArray(data.resourceCatalog)) {
        blueprintResourceCatalog = [...new Set([
          ...Object.keys(crafting.resources),
          ...data.resourceCatalog
        ])];
      }

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
        }
      };

      if (!Array.isArray(merged.projects)) merged.projects = [];
      if (!Array.isArray(merged.queue)) merged.queue = [];

      syncQueueLength(merged);

      return merged;
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
    const r = project.resources || {};
    return (
      Number(r.wood || 0) +
      Number(r.iron || 0) +
      Number(r.leather || 0) +
      Number(r.herbs || 0)
    );
  }

  function canCraft(project) {
    const req = project.resources || {};

    return Object.entries(req).every(([resource, amount]) => {
      return Number(crafting.resources[resource] || 0) >= Number(amount || 0);
    });
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
    const req = project.resources || {};

    Object.entries(req).forEach(([resource, amount]) => {
      crafting.resources[resource] = Math.max(
        0,
        Number(crafting.resources[resource] || 0) - Number(amount || 0)
      );
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

    const componentPart = components.length
      ? ` | Componentes: ${components.map(c => `${escapeHtml(c.name)} ×${fmt(c.amount)}`).join(" • ")}`
      : "";

    return resourcePart + componentPart;
  }

  function renderCraftingAdvisor() {
    const ranked = getRankedProjects();

    const priority = document.getElementById("craftingAdvisorPriority");
    const recommendation = document.getElementById("craftingRecommendation");

    if (!ranked.length) {
      if (priority) priority.textContent = "AGUARDANDO";

      if (recommendation) {
        recommendation.innerHTML = `
          <div class="crafting-recommendation-icon">⚙️</div>
          <div>
            <span>PRÓXIMA AÇÃO</span>
            <h4>Cadastre seus projetos desbloqueados</h4>
            <p>Depois disso, o TitanPath poderá comparar automaticamente XP/min, ouro/min, recursos disponíveis e estoque.</p>
          </div>
        `;
      }

      setCraftText("bestXpPerMin", "—");
      setCraftText("bestGoldPerMin", "—");
      setCraftText("bestBalancedItem", "—");
      setCraftText("worstCraftItem", "—");
      return;
    }

    const best = ranked[0];

    if (priority) priority.textContent = best.craftable ? "FABRIQUE AGORA" : "FALTA RECURSO";

    if (recommendation) {
      recommendation.innerHTML = `
        <div class="crafting-recommendation-icon">${best.icon || "⚒️"}</div>
        <div>
          <span>PRÓXIMA AÇÃO</span>
          <h4>${best.craftable ? `Fabrique ${escapeHtml(best.name)}` : `Prepare recursos para ${escapeHtml(best.name)}`}</h4>
          <p>
            ${advisorReason(best)}
          </p>
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
  }

  function advisorReason(project) {
    const parts = [
      `${fmt(project.xpPerMin, 1)} XP/min`,
      `${fmt(project.goldPerMin, 1)} ouro/min`,
      `estoque ${fmt(project.stock)}`
    ];

    if (!project.craftable) {
      parts.push("recursos insuficientes");
    } else {
      parts.push("recursos disponíveis");
    }

    if (crafting.strategy === "xp") {
      return `No modo XP, este projeto se destaca por ${parts.join(", ")}.`;
    }

    if (crafting.strategy === "gold") {
      return `No modo Ouro, este projeto se destaca por ${parts.join(", ")}.`;
    }

    if (crafting.strategy === "balanced") {
      return `No modo Equilibrado, este projeto apresenta a melhor combinação atual: ${parts.join(", ")}.`;
    }

    return `Para crescimento rápido, o TitanPath ponderou XP e ouro com maior peso em XP. Resultado atual: ${parts.join(", ")}.`;
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
    ])].sort((a, b) => a.localeCompare(b, "pt-BR"));

    container.innerHTML = names.map(name => `
      <label>${escapeHtml(name)}
        <input
          type="number"
          min="0"
          value="${Number(crafting.resources[name] || 0)}"
          data-crafting-resource="${escapeHtml(name)}"
        >
      </label>
    `).join("");
  }

  function openCraftingEditor() {
    document.getElementById("editCraftingSlots").value = crafting.totalSlots;
    renderCraftingResourceInputs();

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
        const name = input.dataset.craftingResource;
        crafting.resources[name] = Math.max(0, Number(input.value || 0));
      });

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

    const names = [...new Set([
      ...blueprintResourceCatalog,
      ...Object.keys(values || {})
    ])].sort((a, b) => a.localeCompare(b, "pt-BR"));

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
      output[resource.name] = Number(resource.amount || 0);
    });

    return output;
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
        sourceUrl: selectedCatalogBlueprint?.sourceUrl || projectById(id)?.sourceUrl || ""
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
          placeholder="Digite o nome do item em português..."
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

  function renderCatalogResults(query) {
    const results = document.getElementById("catalogResults");
    const meta = document.getElementById("catalogMeta");
    if (!results || !meta) return;

    const normalized = normalizeSearch(query);

    let matches = blueprintCatalog.filter(item => {
      if (!normalized) return true;

      const haystack = normalizeSearch(
        `${item.namePt || ""} ${item.categoryPt || ""} ${item.id || ""}`
      );

      return haystack.includes(normalized);
    });

    matches = matches.slice(0, 30);

    meta.textContent = blueprintCatalog.length
      ? `${blueprintCatalog.length} projetos carregados • ${matches.length} resultado(s) exibidos`
      : "Catálogo não carregado. Verifique data/blueprints-pt.json.";

    if (!matches.length) {
      results.innerHTML = `
        <div class="tp-catalog-empty">
          <strong>Nenhum projeto encontrado</strong>
          <small>Tente outro nome ou use o cadastro manual.</small>
        </div>
      `;
      return;
    }

    results.innerHTML = matches.map(item => {
      const resources = (item.resources || [])
        .map(r => `${escapeHtml(r.name)} ${fmt(r.amount)}`)
        .join(" • ");

      return `
        <button class="tp-catalog-item" data-catalog-id="${escapeHtml(item.id)}">
          <div>
            <strong>${escapeHtml(item.namePt || "Projeto")}</strong>
            <span>
              ${item.tier ? `Tier ${item.tier}` : "Tier não informado"} •
              ${escapeHtml(item.categoryPt || "Categoria")}
            </span>
            <small>${resources || "Recursos não informados"}</small>
          </div>
          <span class="tp-catalog-arrow">→</span>
        </button>
      `;
    }).join("");

    results.querySelectorAll("[data-catalog-id]").forEach(button => {
      button.addEventListener("click", () => {
        const blueprint = blueprintCatalog.find(
          item => item.id === button.dataset.catalogId
        );

        if (!blueprint) return;

        closeCatalogSearch();
        openProjectEditor(null, blueprint);
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
    }

    @media(max-width:390px){
      .tp-resource-edit-grid,
      .tp-project-form-grid{
        grid-template-columns:1fr;
      }
    }
  `;

  document.head.appendChild(craftingStyle);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeCraftingEditor();
      closeProjectEditor();
    }
  });

  loadBlueprintCatalog().finally(() => {
    updateCraftingUI();
  });
});
