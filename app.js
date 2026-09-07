/* =========================================================
   TITANPATH - APP.JS v0.2.1
   Conta + Minha Loja + Editor + Recursos
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     BASES DE DADOS
  ======================================================= */

  const TIER1_BIN_CAPACITY = {
    1: 35,
    2: 41,
    3: 47,
    4: 53,
    5: 59,
    6: 65,
    7: 77,
    8: 89,
    9: 101,
    10: 113,
    11: 125,
    12: 145,
    13: 165,
    14: 185,
    15: 205
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
      mannequin: { name: "Manequim", icon: "👕", quantity: 3, level: 3 },
      table: { name: "Mesa", icon: "🪵", quantity: 3, level: 3 },
      shelf: { name: "Prateleira", icon: "🗄️", quantity: 3, level: 3 },
      vertical: { name: "Expositor Vertical", icon: "⚔️", quantity: 3, level: 3 }
    },

    bins: {
      wood: {
        name: "Madeira",
        gameName: "Wood Bin",
        icon: "🪵",
        quantity: 2,
        level: 3
      },
      iron: {
        name: "Ferro",
        gameName: "Iron Bin",
        icon: "⛓️",
        quantity: 2,
        level: 3
      },
      leather: {
        name: "Couro",
        gameName: "Leather Bin",
        icon: "🟫",
        quantity: 2,
        level: 3
      },
      herbs: {
        name: "Ervas",
        gameName: "Herb Dryer",
        icon: "🌿",
        quantity: 2,
        level: 3
      }
    },

    chests: {
      quantity: 3,
      level: 2
    },

    counter: {
      quantity: 1,
      level: 3
    }
  };

  let account = loadData("titanpath_account", defaultAccount);
  let shop = loadData("titanpath_shop", defaultShop);

  /* =======================================================
     HELPERS
  ======================================================= */

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function loadData(key, fallback) {
    const saved = localStorage.getItem(key);

    if (!saved) return clone(fallback);

    try {
      return deepMerge(clone(fallback), JSON.parse(saved));
    } catch (error) {
      console.error(`Erro ao carregar ${key}:`, error);
      return clone(fallback);
    }
  }

  function deepMerge(target, source) {
    if (!source || typeof source !== "object") return target;

    Object.keys(source).forEach(key => {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key])
      ) {
        if (!target[key] || typeof target[key] !== "object") {
          target[key] = {};
        }
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });

    return target;
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

  function getBinCapacity(level) {
    const safeLevel = clamp(Number(level) || 1, 1, 15);
    return TIER1_BIN_CAPACITY[safeLevel] || 0;
  }

  function getBinNextCapacity(level) {
    const next = Number(level) + 1;
    return TIER1_BIN_CAPACITY[next] || null;
  }

  function totalRacks() {
    return Object.values(shop.racks).reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  }

  function totalBins() {
    return Object.values(shop.bins).reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  }

  function usedSlots() {
    return (
      totalRacks() +
      totalBins() +
      Number(shop.chests.quantity || 0) +
      Number(shop.counter.quantity || 0)
    );
  }

  function freeSlots() {
    return Math.max(0, Number(shop.totalSlots || 0) - usedSlots());
  }

  /* =======================================================
     CONTA / DASHBOARD
  ======================================================= */

  const merchantLevel = document.getElementById("merchantLevel");
  const goldValue = document.getElementById("goldValue");
  const plannerGoldValue = document.getElementById("plannerGoldValue");
  const gemsValue = document.getElementById("gemsValue");
  const energyValue = document.getElementById("energyValue");
  const missionProgressValue = document.getElementById("missionProgressValue");
  const currentMissionTitle = document.getElementById("currentMissionTitle");
  const nextStepTitle = document.getElementById("nextStepTitle");
  const nextStepDescription = document.getElementById("nextStepDescription");

  function updateDashboard() {
    if (merchantLevel) merchantLevel.textContent = account.level;

    const levelBadge = document.querySelector(".level-badge");
    if (levelBadge) levelBadge.textContent = account.level;

    if (goldValue) goldValue.textContent = formatNumber(account.gold);
    if (plannerGoldValue) plannerGoldValue.textContent = formatNumber(account.gold);
    if (gemsValue) gemsValue.textContent = formatNumber(account.gems);
    if (energyValue) energyValue.textContent = formatNumber(account.energy);

    updateEnergyMission();
    updateEvolution();
    updateGoals();
    updateShopDashboardSummary();
  }

  function updateEnergyMission() {
    const progress = clamp(
      Math.round((account.energy / account.energyGoal) * 100),
      0,
      100
    );

    if (missionProgressValue) {
      missionProgressValue.textContent = `${progress}%`;
    }

    const circle = document.querySelector(".circle-progress");
    if (circle) {
      const degrees = Math.round((progress / 100) * 360);
      circle.style.background = `
        conic-gradient(
          #2aa7ff 0deg,
          #7b61ff ${degrees}deg,
          rgba(255,255,255,.08) ${degrees}deg
        )
      `;
    }

    if (!currentMissionTitle || !nextStepTitle || !nextStepDescription) return;

    if (account.energy < 200) {
      currentMissionTitle.textContent = "Aumentar sua energia";
      nextStepTitle.textContent = "Continue melhorando seus expositores";
      nextStepDescription.textContent =
        `Você possui ${formatNumber(account.energy)} de energia. Continue evoluindo seus expositores e reavalie seus recursos sem comprometer todo o ouro.`;
    } else if (account.energy < account.energyGoal) {
      currentMissionTitle.textContent = "Reta final para a meta de energia";
      nextStepTitle.textContent =
        `Faltam ${formatNumber(account.energyGoal - account.energy)} de energia`;
      nextStepDescription.textContent =
        "Sua estrutura já avançou. Continue melhorando os expositores com melhor custo-benefício e mantenha uma reserva de ouro.";
    } else {
      currentMissionTitle.textContent = "Meta de energia concluída!";
      nextStepTitle.textContent = `${formatNumber(account.energyGoal)} de energia alcançados`;
      nextStepDescription.textContent =
        "A meta de energia foi concluída. O próximo foco deve ser definido pela sua fabricação, investimentos, nível e patrimônio.";
    }
  }

  function updateEvolution() {
    const cards = document.querySelectorAll(".evolution-card");

    if (cards.length >= 4) {
      const current = cards[2].querySelector("strong");
      const target = cards[3].querySelector("strong");

      if (current) current.textContent = `${formatNumber(account.energy)} ⚡`;
      if (target) target.textContent = `${formatNumber(account.energyGoal)} ⚡`;
    }
  }

  function updateGoals() {
    const goals = document.querySelectorAll(".goal-row");

    if (goals[0]) {
      const percentage = clamp(
        Math.round((account.energy / account.energyGoal) * 100),
        0,
        100
      );

      const small = goals[0].querySelector("small");
      const bar = goals[0].querySelector(".progress-fill");
      const text = goals[0].querySelector(".goal-progress span");

      if (small) small.textContent = `${account.energy} / ${account.energyGoal}`;
      if (bar) bar.style.width = `${percentage}%`;
      if (text) text.textContent = `${percentage}%`;
    }

    if (goals[1]) {
      const percentage =
        account.level >= 25
          ? 100
          : clamp(Math.round(((account.level - 22) / 3) * 100), 0, 100);

      const small = goals[1].querySelector("small");
      const bar = goals[1].querySelector(".progress-fill");
      const text = goals[1].querySelector(".goal-progress span");

      if (small) small.textContent = `Mercador nível ${account.level}`;
      if (bar) bar.style.width = `${percentage}%`;
      if (text) text.textContent = `${percentage}%`;
    }

    if (goals[2]) {
      const goldTarget = 5000000;
      const percentage = clamp(
        Math.round((account.gold / goldTarget) * 100),
        0,
        100
      );

      const small = goals[2].querySelector("small");
      const bar = goals[2].querySelector(".progress-fill");
      const text = goals[2].querySelector(".goal-progress span");

      if (small) {
        small.textContent = `${formatNumber(account.gold)} / 5.000.000`;
      }
      if (bar) bar.style.width = `${percentage}%`;
      if (text) text.textContent = `${percentage}%`;
    }

    if (goals[3]) {
      const percentage =
        account.level >= 30
          ? 100
          : clamp(Math.round(((account.level - 22) / 8) * 100), 0, 100);

      const bar = goals[3].querySelector(".progress-fill");
      const text = goals[3].querySelector(".goal-progress span");

      if (bar) bar.style.width = `${percentage}%`;
      if (text) text.textContent = `${percentage}%`;
    }
  }

  /* =======================================================
     MINHA LOJA
  ======================================================= */

  function updateShopDashboardSummary() {
    const used = usedSlots();
    const total = Number(shop.totalSlots || 24);
    const percent = clamp(Math.round((used / total) * 100), 0, 100);

    setText("shopUsedSlots", used);
    setText("shopTotalSlots", total);

    const dashboardBar = document.getElementById("shopSlotsBar");
    if (dashboardBar) dashboardBar.style.width = `${percent}%`;

    setText("shopEnergyValue", formatNumber(account.energy));
    setText("shopRackCount", totalRacks());
    setText("shopPageUsedSlots", used);
    setText("shopPageTotalSlots", total);
    setText("shopChestCount", Number(shop.chests.quantity || 0));
    setText("shopSlotCounterUsed", used);
    setText("legendRackCount", totalRacks());
    setText("legendBinCount", totalBins());
    setText("legendChestCount", Number(shop.chests.quantity || 0));

    const freeText = document.getElementById("shopFreeSlotsText");
    if (freeText) {
      freeText.textContent =
        freeSlots() === 1
          ? "1 espaço livre"
          : `${freeSlots()} espaços livres`;
    }

    const spaceBar = document.getElementById("shopSpaceBar");
    if (spaceBar) spaceBar.style.width = `${percent}%`;

    renderRacks();
    renderBins();
    renderStorage();
    updateShopAdvisor();
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function renderRacks() {
    const grid = document.getElementById("rackGrid");
    if (!grid) return;

    grid.innerHTML = Object.entries(shop.racks)
      .map(([key, item]) => `
        <article class="panel furniture-card">
          <div class="furniture-icon">${item.icon}</div>

          <div class="furniture-info">
            <span>${item.name}</span>
            <strong>${item.quantity} ${Number(item.quantity) === 1 ? "unidade" : "unidades"}</strong>
            <small>Nível configurado: ${item.level}</small>
          </div>

          <span class="priority-badge ${account.energy < account.energyGoal ? "high" : "medium"}">
            ${account.energy < account.energyGoal ? "ALTA" : "MÉDIA"}
          </span>
        </article>
      `)
      .join("");
  }

  function renderBins() {
    const grid = document.getElementById("binGrid");
    if (!grid) return;

    grid.innerHTML = Object.entries(shop.bins)
      .map(([key, item]) => {
        const capacityEach = getBinCapacity(item.level);
        const totalCapacity = capacityEach * Number(item.quantity || 0);
        const nextCapacity = getBinNextCapacity(item.level);

        const nextGain =
          nextCapacity !== null
            ? (nextCapacity - capacityEach) * Number(item.quantity || 0)
            : null;

        return `
          <article class="panel furniture-card resource-card">
            <div class="furniture-icon">${item.icon}</div>

            <div class="furniture-info">
              <span>${item.name}</span>
              <strong>${item.quantity} ${Number(item.quantity) === 1 ? "recipiente" : "recipientes"} • Nv.${item.level}</strong>

              <div class="resource-stats">
                <div>
                  <small>Por recipiente</small>
                  <b>${formatNumber(capacityEach)}</b>
                </div>

                <div>
                  <small>Capacidade total</small>
                  <b>${formatNumber(totalCapacity)}</b>
                </div>

                <div>
                  <small>Próximo nível</small>
                  <b>${nextCapacity !== null ? formatNumber(nextCapacity) : "Máx. base"}</b>
                </div>

                <div>
                  <small>Ganho total</small>
                  <b>${nextGain !== null ? `+${formatNumber(nextGain)}` : "—"}</b>
                </div>
              </div>

              <small class="resource-source-note">
                Capacidade base; bônus de guilda não incluído.
              </small>
            </div>

            <span class="priority-badge medium">MÉDIA</span>
          </article>
        `;
      })
      .join("");
  }

  function renderStorage() {
    const cards = document.querySelectorAll("#page-shop .shop-section");

    if (cards.length < 3) return;

    const storageGrid = cards[2].querySelector(".furniture-grid");
    if (!storageGrid) return;

    storageGrid.innerHTML = `
      <article class="panel furniture-card">
        <div class="furniture-icon">📦</div>
        <div class="furniture-info">
          <span>Baús</span>
          <strong>${shop.chests.quantity} ${Number(shop.chests.quantity) === 1 ? "unidade" : "unidades"}</strong>
          <small>Nível configurado: ${shop.chests.level}</small>
        </div>
        <span class="priority-badge low">BAIXA</span>
      </article>

      <article class="panel furniture-card">
        <div class="furniture-icon">🧑‍💼</div>
        <div class="furniture-info">
          <span>Balcão</span>
          <strong>${shop.counter.quantity} unidade</strong>
          <small>Nível configurado: ${shop.counter.level}</small>
        </div>
        <span class="priority-badge medium">MÉDIA</span>
      </article>
    `;
  }

  function updateShopAdvisor() {
    const advisor = document.getElementById("shopAdvisorText");
    if (!advisor) return;

    const used = usedSlots();
    const total = Number(shop.totalSlots || 24);

    let message = "";

    if (used > total) {
      message =
        `Sua configuração usa ${used}/${total} espaços. Você excedeu o limite em ${used - total}. Reduza móveis antes de considerar novos upgrades.`;
    } else if (account.energy < account.energyGoal) {
      message =
        `Você está com ${formatNumber(account.energy)} de energia e ${totalRacks()} expositores. ` +
        `A meta atual é ${formatNumber(account.energyGoal)}. Priorize melhorar níveis dos expositores, ` +
        `mas mantenha recipientes suficientes para não travar seus ${4} slots de fabricação. ` +
        `Hoje sua loja usa ${used}/${total} espaços e possui ${freeSlots()} livres.`;
    } else {
      message =
        `Sua meta de ${formatNumber(account.energyGoal)} de energia já foi alcançada. ` +
        `Agora vale priorizar capacidade de fabricação, investimentos e eficiência dos heróis antes de adicionar mais expositores.`;
    }

    advisor.textContent = message;
  }

  /* =======================================================
     NAVEGAÇÃO
  ======================================================= */

  function openPage(pageName) {
    document.querySelectorAll(".page").forEach(page => {
      page.classList.remove("active");
    });

    const target = document.getElementById(`page-${pageName}`);
    if (target) target.classList.add("active");

    document
      .querySelectorAll(".nav-item, .mobile-nav-item")
      .forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.page === pageName
        );
      });

    closeSidebar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
      const page = button.dataset.page;
      if (page) openPage(page);
    });
  });

  document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
      const page = button.dataset.go;
      if (page) openPage(page);
    });
  });

  function openSidebar() {
    document.body.classList.add("sidebar-open");
  }

  function closeSidebar() {
    document.body.classList.remove("sidebar-open");
  }

  const menuButton = document.getElementById("menuButton");
  const mobileMoreButton = document.getElementById("mobileMoreButton");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  if (menuButton) menuButton.addEventListener("click", openSidebar);
  if (mobileMoreButton) mobileMoreButton.addEventListener("click", openSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);

  /* =======================================================
     EDITOR DE CONTA
  ======================================================= */

  const editAccountButton = document.createElement("button");
  editAccountButton.id = "editAccountButton";
  editAccountButton.innerHTML = "✏️";
  editAccountButton.title = "Editar dados da conta";
  editAccountButton.setAttribute("aria-label", "Editar conta");

  const topbarActions = document.querySelector(".topbar-actions");
  if (topbarActions) topbarActions.prepend(editAccountButton);

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

        <button id="closeAccountEditor" aria-label="Fechar">✕</button>
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

        <label>Energia máxima
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

  document
    .getElementById("closeAccountEditor")
    .addEventListener("click", closeAccountEditor);

  accountModal
    .querySelector(".tp-modal-overlay")
    .addEventListener("click", closeAccountEditor);

  document
    .getElementById("saveAccountButton")
    .addEventListener("click", () => {
      const newLevel = Number(document.getElementById("editLevel").value);
      const newGold = Number(document.getElementById("editGold").value);
      const newGems = Number(document.getElementById("editGems").value);
      const newEnergy = Number(document.getElementById("editEnergy").value);

      if (
        newLevel < 1 ||
        newGold < 0 ||
        newGems < 0 ||
        newEnergy < 0
      ) {
        alert("Confira os valores informados.");
        return;
      }

      account.level = newLevel;
      account.gold = newGold;
      account.gems = newGems;
      account.energy = newEnergy;

      saveAccount();
      updateDashboard();
      closeAccountEditor();
    });

  /* =======================================================
     EDITOR DA LOJA
  ======================================================= */

  const shopModal = document.createElement("div");
  shopModal.id = "shopEditor";

  const rackFields = Object.entries(shop.racks)
    .map(([key, item]) => `
      <div class="tp-edit-row">
        <div class="tp-edit-name">
          <span>${item.icon}</span>
          <strong>${item.name}</strong>
        </div>

        <label>
          Quantidade
          <input type="number" min="0" max="30" id="shop_${key}_qty">
        </label>

        <label>
          Nível
          <input type="number" min="1" max="30" id="shop_${key}_lvl">
        </label>
      </div>
    `)
    .join("");

  const binFields = Object.entries(shop.bins)
    .map(([key, item]) => `
      <div class="tp-edit-row">
        <div class="tp-edit-name">
          <span>${item.icon}</span>
          <strong>${item.name}</strong>
        </div>

        <label>
          Quantidade
          <input type="number" min="0" max="10" id="shop_${key}_qty">
        </label>

        <label>
          Nível
          <input type="number" min="1" max="15" id="shop_${key}_lvl">
        </label>
      </div>
    `)
    .join("");

  shopModal.innerHTML = `
    <div class="tp-modal-overlay"></div>

    <div class="tp-modal tp-shop-modal">
      <div class="tp-modal-header">
        <div>
          <span>MINHA LOJA</span>
          <h2>Editar configuração</h2>
        </div>

        <button id="closeShopEditor" aria-label="Fechar">✕</button>
      </div>

      <div class="tp-shop-editor-body">
        <section class="tp-editor-section">
          <h3>⚡ Expositores</h3>
          ${rackFields}
        </section>

        <section class="tp-editor-section">
          <h3>🔨 Recipientes de recursos</h3>
          <p class="tp-editor-help">
            O TitanPath calcula automaticamente a capacidade base pelo nível.
          </p>
          ${binFields}
        </section>

        <section class="tp-editor-section">
          <h3>📦 Armazenamento</h3>

          <div class="tp-edit-row">
            <div class="tp-edit-name">
              <span>📦</span>
              <strong>Baús</strong>
            </div>

            <label>
              Quantidade
              <input type="number" min="0" max="30" id="shop_chests_qty">
            </label>

            <label>
              Nível
              <input type="number" min="1" max="30" id="shop_chests_lvl">
            </label>
          </div>

          <div class="tp-edit-row">
            <div class="tp-edit-name">
              <span>🧑‍💼</span>
              <strong>Balcão</strong>
            </div>

            <label>
              Quantidade
              <input type="number" value="1" disabled>
            </label>

            <label>
              Nível
              <input type="number" min="1" max="30" id="shop_counter_lvl">
            </label>
          </div>
        </section>

        <section class="tp-editor-section">
          <h3>🏪 Limite da loja</h3>

          <div class="tp-edit-row single">
            <div class="tp-edit-name">
              <span>📐</span>
              <strong>Espaços disponíveis</strong>
            </div>

            <label>
              Total
              <input type="number" min="1" max="100" id="shop_total_slots">
            </label>
          </div>
        </section>
      </div>

      <div class="tp-shop-editor-footer">
        <div>
          <small>Prévia de ocupação</small>
          <strong id="shopEditorPreview">0/24</strong>
        </div>

        <button id="saveShopButton" class="tp-save-button">
          SALVAR LOJA
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(shopModal);

  function openShopEditor() {
    Object.entries(shop.racks).forEach(([key, item]) => {
      document.getElementById(`shop_${key}_qty`).value = item.quantity;
      document.getElementById(`shop_${key}_lvl`).value = item.level;
    });

    Object.entries(shop.bins).forEach(([key, item]) => {
      document.getElementById(`shop_${key}_qty`).value = item.quantity;
      document.getElementById(`shop_${key}_lvl`).value = item.level;
    });

    document.getElementById("shop_chests_qty").value = shop.chests.quantity;
    document.getElementById("shop_chests_lvl").value = shop.chests.level;
    document.getElementById("shop_counter_lvl").value = shop.counter.level;
    document.getElementById("shop_total_slots").value = shop.totalSlots;

    updateShopEditorPreview();

    shopModal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeShopEditor() {
    shopModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  function editorNumber(id) {
    return Math.max(0, Number(document.getElementById(id)?.value || 0));
  }

  function updateShopEditorPreview() {
    let total = 1;

    Object.keys(shop.racks).forEach(key => {
      total += editorNumber(`shop_${key}_qty`);
    });

    Object.keys(shop.bins).forEach(key => {
      total += editorNumber(`shop_${key}_qty`);
    });

    total += editorNumber("shop_chests_qty");

    const max = Math.max(1, editorNumber("shop_total_slots"));
    const preview = document.getElementById("shopEditorPreview");

    if (preview) {
      preview.textContent = `${total}/${max}`;
      preview.classList.toggle("over-limit", total > max);
    }
  }

  const editShopButton = document.getElementById("editShopButton");

  if (editShopButton) {
    editShopButton.addEventListener("click", openShopEditor);
  }

  document
    .getElementById("closeShopEditor")
    .addEventListener("click", closeShopEditor);

  shopModal
    .querySelector(".tp-modal-overlay")
    .addEventListener("click", closeShopEditor);

  shopModal.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", updateShopEditorPreview);
  });

  document
    .getElementById("saveShopButton")
    .addEventListener("click", () => {
      const newShop = clone(shop);

      Object.keys(newShop.racks).forEach(key => {
        newShop.racks[key].quantity = editorNumber(`shop_${key}_qty`);
        newShop.racks[key].level = clamp(
          editorNumber(`shop_${key}_lvl`),
          1,
          30
        );
      });

      Object.keys(newShop.bins).forEach(key => {
        newShop.bins[key].quantity = editorNumber(`shop_${key}_qty`);
        newShop.bins[key].level = clamp(
          editorNumber(`shop_${key}_lvl`),
          1,
          15
        );
      });

      newShop.chests.quantity = editorNumber("shop_chests_qty");
      newShop.chests.level = clamp(
        editorNumber("shop_chests_lvl"),
        1,
        30
      );

      newShop.counter.quantity = 1;
      newShop.counter.level = clamp(
        editorNumber("shop_counter_lvl"),
        1,
        30
      );

      newShop.totalSlots = Math.max(
        1,
        editorNumber("shop_total_slots")
      );

      const newUsed =
        Object.values(newShop.racks).reduce((s, x) => s + x.quantity, 0) +
        Object.values(newShop.bins).reduce((s, x) => s + x.quantity, 0) +
        newShop.chests.quantity +
        1;

      if (newUsed > newShop.totalSlots) {
        const confirmOver = confirm(
          `Essa configuração usa ${newUsed}/${newShop.totalSlots} espaços. ` +
          `Deseja salvar mesmo assim para corrigir depois?`
        );

        if (!confirmOver) return;
      }

      shop = newShop;
      saveShop();
      updateShopDashboardSummary();
      closeShopEditor();
    });

  /* =======================================================
     CSS DOS EDITORES / DADOS PROFISSIONAIS
  ======================================================= */

  const dynamicStyle = document.createElement("style");

  dynamicStyle.textContent = `
    #editAccountButton {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: #0d131b;
      border: 1px solid rgba(255,255,255,.08);
      color: #fff;
      cursor: pointer;
      font-size: 16px;
    }

    #accountEditor,
    #shopEditor {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    #accountEditor.open,
    #shopEditor.open {
      display: flex;
    }

    .tp-modal-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,.78);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    .tp-modal {
      position: relative;
      z-index: 2;
      width: min(460px, 100%);
      max-height: 90vh;
      overflow: hidden;
      background: linear-gradient(180deg, #121923, #090d13);
      border: 1px solid rgba(244,185,66,.3);
      border-radius: 20px;
      padding: 22px;
      box-shadow: 0 30px 80px rgba(0,0,0,.6);
    }

    .tp-shop-modal {
      width: min(850px, 100%);
      display: flex;
      flex-direction: column;
    }

    .tp-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 20px;
    }

    .tp-modal-header span {
      color: #f4b942;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .15em;
    }

    .tp-modal-header h2 {
      margin-top: 4px;
      color: #fff;
    }

    #closeAccountEditor,
    #closeShopEditor {
      width: 40px;
      height: 40px;
      border-radius: 11px;
      background: rgba(255,255,255,.05);
      color: #fff;
      cursor: pointer;
    }

    .tp-form {
      display: grid;
      gap: 14px;
    }

    .tp-form label,
    .tp-edit-row label {
      display: grid;
      gap: 7px;
      color: #a7b0bf;
      font-size: 11px;
      font-weight: 700;
    }

    .tp-form input,
    .tp-edit-row input {
      width: 100%;
      min-height: 44px;
      padding: 0 12px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,.08);
      outline: none;
      background: #080c12;
      color: white;
      font-size: 15px;
    }

    .tp-form input:focus,
    .tp-edit-row input:focus {
      border-color: rgba(244,185,66,.6);
      box-shadow: 0 0 0 3px rgba(244,185,66,.08);
    }

    .tp-save-button {
      min-height: 50px;
      padding: 0 18px;
      margin-top: 5px;
      border-radius: 12px;
      border: 0;
      background: linear-gradient(135deg, #ffd36a, #f4b942);
      color: #171005;
      font-weight: 900;
      cursor: pointer;
    }

    .tp-shop-editor-body {
      overflow-y: auto;
      padding-right: 5px;
    }

    .tp-editor-section {
      padding: 15px 0 18px;
      border-top: 1px solid rgba(255,255,255,.07);
    }

    .tp-editor-section:first-child {
      border-top: 0;
      padding-top: 0;
    }

    .tp-editor-section h3 {
      margin-bottom: 12px;
      font-size: 15px;
      color: #fff;
    }

    .tp-editor-help {
      margin: -5px 0 12px;
      color: #6e7887;
      font-size: 11px;
    }

    .tp-edit-row {
      display: grid;
      grid-template-columns: minmax(150px, 1fr) 120px 120px;
      gap: 12px;
      align-items: end;
      padding: 10px;
      margin-bottom: 8px;
      border-radius: 12px;
      background: rgba(255,255,255,.025);
      border: 1px solid rgba(255,255,255,.06);
    }

    .tp-edit-row.single {
      grid-template-columns: minmax(150px, 1fr) 120px;
    }

    .tp-edit-name {
      display: flex;
      align-items: center;
      gap: 10px;
      align-self: center;
    }

    .tp-edit-name span {
      font-size: 20px;
    }

    .tp-edit-name strong {
      font-size: 13px;
    }

    .tp-shop-editor-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding-top: 15px;
      border-top: 1px solid rgba(255,255,255,.08);
    }

    .tp-shop-editor-footer small,
    .tp-shop-editor-footer strong {
      display: block;
    }

    .tp-shop-editor-footer small {
      color: #6e7887;
    }

    .tp-shop-editor-footer strong {
      margin-top: 2px;
      color: #fff;
      font-size: 20px;
    }

    .tp-shop-editor-footer strong.over-limit {
      color: #ff5f66;
    }

    .resource-card {
      min-height: 230px;
    }

    .resource-stats {
      display: grid;
      grid-template-columns: repeat(2, minmax(0,1fr));
      gap: 7px;
      margin-top: 11px;
    }

    .resource-stats > div {
      padding: 8px;
      border-radius: 9px;
      background: rgba(255,255,255,.025);
      border: 1px solid rgba(255,255,255,.055);
    }

    .resource-stats small,
    .resource-stats b {
      display: block;
    }

    .resource-stats small {
      color: #6e7887;
      font-size: 9px;
    }

    .resource-stats b {
      margin-top: 3px;
      color: #f4f7fb;
      font-size: 13px;
    }

    .resource-source-note {
      margin-top: 9px !important;
      color: #6e7887 !important;
      font-size: 9px !important;
    }

    @media(max-width:640px) {
      #accountEditor,
      #shopEditor {
        align-items: flex-end;
        padding: 0;
      }

      .tp-modal {
        width: 100%;
        max-height: 94vh;
        border-radius: 22px 22px 0 0;
        padding: 19px 15px calc(18px + env(safe-area-inset-bottom));
      }

      .tp-edit-row {
        grid-template-columns: 1fr 88px 88px;
        gap: 7px;
        padding: 9px;
      }

      .tp-edit-row.single {
        grid-template-columns: 1fr 90px;
      }

      .tp-edit-name strong {
        font-size: 11px;
      }

      .tp-shop-editor-footer .tp-save-button {
        min-width: 150px;
      }

      .resource-stats {
        grid-template-columns: 1fr 1fr;
      }
    }
  `;

  document.head.appendChild(dynamicStyle);

  /* =======================================================
     ESC
  ======================================================= */

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeAccountEditor();
      closeShopEditor();
      closeSidebar();
    }
  });

  /* =======================================================
     INICIALIZAÇÃO
  ======================================================= */

  updateDashboard();
  updateShopDashboardSummary();
});
