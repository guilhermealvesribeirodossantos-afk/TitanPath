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
