/* =========================================================
   TITANPATH - APP.JS
   Sistema principal
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     DADOS PADRÃO DA CONTA
  ======================================================= */

  const defaultAccount = {
    level: 22,
    gold: 2400000,
    gems: 630,
    energy: 173,
    energyGoal: 250
  };

  let account = loadAccount();

  /* =======================================================
     ELEMENTOS
  ======================================================= */

  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const menuButton = document.getElementById("menuButton");
  const mobileMoreButton = document.getElementById("mobileMoreButton");

  const merchantLevel = document.getElementById("merchantLevel");
  const goldValue = document.getElementById("goldValue");
  const plannerGoldValue = document.getElementById("plannerGoldValue");
  const gemsValue = document.getElementById("gemsValue");
  const energyValue = document.getElementById("energyValue");

  const missionProgressValue =
    document.getElementById("missionProgressValue");

  const currentMissionTitle =
    document.getElementById("currentMissionTitle");

  const nextStepTitle =
    document.getElementById("nextStepTitle");

  const nextStepDescription =
    document.getElementById("nextStepDescription");


  /* =======================================================
     FORMATADORES
  ======================================================= */

  function formatNumber(value) {
    return Number(value).toLocaleString("pt-BR");
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }


  /* =======================================================
     LOCALSTORAGE
  ======================================================= */

  function loadAccount() {

    const saved = localStorage.getItem("titanpath_account");

    if (!saved) {
      return { ...defaultAccount };
    }

    try {

      return {
        ...defaultAccount,
        ...JSON.parse(saved)
      };

    } catch (error) {

      console.error("Erro ao carregar dados:", error);

      return { ...defaultAccount };
    }
  }


  function saveAccount() {

    localStorage.setItem(
      "titanpath_account",
      JSON.stringify(account)
    );

  }


  /* =======================================================
     ATUALIZAR DASHBOARD
  ======================================================= */

  function updateDashboard() {

    /* Nível */

    if (merchantLevel) {
      merchantLevel.textContent = account.level;
    }

    const levelBadge =
      document.querySelector(".level-badge");

    if (levelBadge) {
      levelBadge.textContent = account.level;
    }


    /* Ouro */

    if (goldValue) {
      goldValue.textContent = formatNumber(account.gold);
    }

    if (plannerGoldValue) {
      plannerGoldValue.textContent =
        formatNumber(account.gold);
    }


    /* Gemas */

    if (gemsValue) {
      gemsValue.textContent =
        formatNumber(account.gems);
    }


    /* Energia */

    if (energyValue) {
      energyValue.textContent =
        formatNumber(account.energy);
    }


    updateEnergyMission();
    updateEvolution();
    updateGoals();
  }


  /* =======================================================
     MISSÃO DE ENERGIA
  ======================================================= */

  function updateEnergyMission() {

    const progress = clamp(
      Math.round(
        (account.energy / account.energyGoal) * 100
      ),
      0,
      100
    );


    if (missionProgressValue) {
      missionProgressValue.textContent =
        `${progress}%`;
    }


    const circle =
      document.querySelector(".circle-progress");

    if (circle) {

      const degrees =
        Math.round((progress / 100) * 360);

      circle.style.background = `
        conic-gradient(
          #2aa7ff 0deg,
          #7b61ff ${degrees}deg,
          rgba(255,255,255,.08) ${degrees}deg
        )
      `;
    }


    /* =====================================================
       RECOMENDAÇÃO AUTOMÁTICA
    ===================================================== */

    if (account.energy < 200) {

      currentMissionTitle.textContent =
        "Aumentar sua energia";

      nextStepTitle.textContent =
        "Continue melhorando seus expositores";

      nextStepDescription.textContent =
        `Você possui ${account.energy} de energia. 
        Continue evoluindo seus expositores para chegar primeiro a 200 e depois atingir a meta de ${account.energyGoal}.`;

    }

    else if (account.energy < account.energyGoal) {

      currentMissionTitle.textContent =
        "Reta final para 250 de energia";

      nextStepTitle.textContent =
        `Faltam ${account.energyGoal - account.energy} de energia`;

      nextStepDescription.textContent =
        "Sua estrutura já melhorou bastante. Continue aumentando os níveis dos expositores sem comprometer toda sua reserva de ouro.";

    }

    else {

      currentMissionTitle.textContent =
        "Meta de energia concluída!";

      nextStepTitle.textContent =
        "250 de energia alcançados";

      nextStepDescription.textContent =
        "Excelente. Sua próxima prioridade será analisada com base no seu nível, patrimônio, fabricação e investimentos.";

    }

  }


  /* =======================================================
     HISTÓRICO VISUAL DE ENERGIA
  ======================================================= */

  function updateEvolution() {

    const cards =
      document.querySelectorAll(
        ".evolution-card"
      );

    if (cards.length >= 4) {

      const current =
        cards[2].querySelector("strong");

      const target =
        cards[3].querySelector("strong");

      if (current) {
        current.textContent =
          `${account.energy} ⚡`;
      }

      if (target) {
        target.textContent =
          `${account.energyGoal} ⚡`;
      }
    }

  }


  /* =======================================================
     METAS
  ======================================================= */

  function updateGoals() {

    const goals =
      document.querySelectorAll(".goal-row");

    /* Energia */

    if (goals[0]) {

      const percentage = clamp(
        Math.round(
          (account.energy /
            account.energyGoal) * 100
        ),
        0,
        100
      );

      const small =
        goals[0].querySelector("small");

      const bar =
        goals[0].querySelector(
          ".progress-fill"
        );

      const text =
        goals[0].querySelector(
          ".goal-progress span"
        );

      if (small) {
        small.textContent =
          `${account.energy} / ${account.energyGoal}`;
      }

      if (bar) {
        bar.style.width =
          `${percentage}%`;
      }

      if (text) {
        text.textContent =
          `${percentage}%`;
      }
    }


    /* Meta de nível 25 */

    if (goals[1]) {

      const percentage =
        account.level >= 25
          ? 100
          : clamp(
              Math.round(
                ((account.level - 22) / 3) * 100
              ),
              0,
              100
            );

      const small =
        goals[1].querySelector("small");

      const bar =
        goals[1].querySelector(
          ".progress-fill"
        );

      const text =
        goals[1].querySelector(
          ".goal-progress span"
        );

      if (small) {
        small.textContent =
          `Mercador nível ${account.level}`;
      }

      if (bar) {
        bar.style.width =
          `${percentage}%`;
      }

      if (text) {
        text.textContent =
          `${percentage}%`;
      }
    }


    /* Meta 5 milhões */

    if (goals[2]) {

      const goldTarget = 5000000;

      const percentage = clamp(
        Math.round(
          (account.gold /
            goldTarget) * 100
        ),
        0,
        100
      );

      const small =
        goals[2].querySelector("small");

      const bar =
        goals[2].querySelector(
          ".progress-fill"
        );

      const text =
        goals[2].querySelector(
          ".goal-progress span"
        );

      if (small) {
        small.textContent =
          `${formatNumber(account.gold)} / 5.000.000`;
      }

      if (bar) {
        bar.style.width =
          `${percentage}%`;
      }

      if (text) {
        text.textContent =
          `${percentage}%`;
      }
    }


    /* Meta nível 30 */

    if (goals[3]) {

      const percentage =
        account.level >= 30
          ? 100
          : clamp(
              Math.round(
                ((account.level - 22) / 8) * 100
              ),
              0,
              100
            );

      const bar =
        goals[3].querySelector(
          ".progress-fill"
        );

      const text =
        goals[3].querySelector(
          ".goal-progress span"
        );

      if (bar) {
        bar.style.width =
          `${percentage}%`;
      }

      if (text) {
        text.textContent =
          `${percentage}%`;
      }
    }

  }


  /* =======================================================
     NAVEGAÇÃO
  ======================================================= */

  function openPage(pageName) {

    document
      .querySelectorAll(".page")
      .forEach(page => {
        page.classList.remove("active");
      });


    const target =
      document.getElementById(
        `page-${pageName}`
      );

    if (target) {
      target.classList.add("active");
    }


    document
      .querySelectorAll(
        ".nav-item, .mobile-nav-item"
      )
      .forEach(button => {

        button.classList.toggle(
          "active",
          button.dataset.page === pageName
        );

      });


    closeSidebar();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }


  document
    .querySelectorAll("[data-page]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const page =
            button.dataset.page;

          if (page) {
            openPage(page);
          }

        }
      );

    });


  document
    .querySelectorAll("[data-go]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const page =
            button.dataset.go;

          if (page) {
            openPage(page);
          }

        }
      );

    });


  /* =======================================================
     SIDEBAR
  ======================================================= */

  function openSidebar() {
    document.body.classList.add(
      "sidebar-open"
    );
  }

  function closeSidebar() {
    document.body.classList.remove(
      "sidebar-open"
    );
  }


  if (menuButton) {

    menuButton.addEventListener(
      "click",
      openSidebar
    );

  }


  if (mobileMoreButton) {

    mobileMoreButton.addEventListener(
      "click",
      openSidebar
    );

  }


  if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
      "click",
      closeSidebar
    );

  }


  /* =======================================================
     BOTÃO EDITAR CONTA
  ======================================================= */

  const editButton =
    document.createElement("button");

  editButton.id =
    "editAccountButton";

  editButton.innerHTML =
    "✏️";

  editButton.title =
    "Editar dados da conta";

  editButton.setAttribute(
    "aria-label",
    "Editar conta"
  );


  const topbarActions =
    document.querySelector(
      ".topbar-actions"
    );

  if (topbarActions) {

    topbarActions.prepend(
      editButton
    );

  }


  /* =======================================================
     MODAL
  ======================================================= */

  const modal =
    document.createElement("div");

  modal.id =
    "accountEditor";

  modal.innerHTML = `

    <div class="tp-modal-overlay"></div>

    <div class="tp-modal">

      <div class="tp-modal-header">

        <div>
          <span>MINHA CONTA</span>
          <h2>Editar progresso</h2>
        </div>

        <button
          id="closeAccountEditor"
          aria-label="Fechar"
        >
          ✕
        </button>

      </div>


      <div class="tp-form">

        <label>

          Nível do Mercador

          <input
            type="number"
            id="editLevel"
            min="1"
          >

        </label>


        <label>

          Ouro

          <input
            type="number"
            id="editGold"
            min="0"
          >

        </label>


        <label>

          Gemas

          <input
            type="number"
            id="editGems"
            min="0"
          >

        </label>


        <label>

          Energia máxima

          <input
            type="number"
            id="editEnergy"
            min="0"
          >

        </label>


        <button
          id="saveAccountButton"
          class="tp-save-button"
        >
          SALVAR ALTERAÇÕES
        </button>

      </div>

    </div>

  `;


  document.body.appendChild(modal);


  /* =======================================================
     CSS DO EDITOR
  ======================================================= */

  const modalStyle =
    document.createElement("style");

  modalStyle.textContent = `

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


    #accountEditor {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }


    #accountEditor.open {
      display: flex;
    }


    .tp-modal-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,.78);
      backdrop-filter: blur(8px);
    }


    .tp-modal {
      position: relative;
      z-index: 2;
      width: min(460px, 100%);
      background:
        linear-gradient(
          180deg,
          #121923,
          #090d13
        );
      border: 1px solid
        rgba(244,185,66,.3);
      border-radius: 20px;
      padding: 22px;
      box-shadow:
        0 30px 80px
        rgba(0,0,0,.6);
    }


    .tp-modal-header {
      display: flex;
      align-items: center;
      justify-content:
        space-between;
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


    #closeAccountEditor {
      width: 40px;
      height: 40px;
      border-radius: 11px;
      background:
        rgba(255,255,255,.05);
      color: #fff;
      cursor: pointer;
    }


    .tp-form {
      display: grid;
      gap: 14px;
    }


    .tp-form label {
      display: grid;
      gap: 7px;
      color: #a7b0bf;
      font-size: 12px;
      font-weight: 700;
    }


    .tp-form input {
      width: 100%;
      min-height: 48px;
      padding: 0 14px;
      border-radius: 12px;
      border: 1px solid
        rgba(255,255,255,.08);
      outline: none;
      background: #080c12;
      color: white;
      font-size: 16px;
    }


    .tp-form input:focus {
      border-color:
        rgba(244,185,66,.6);
      box-shadow:
        0 0 0 3px
        rgba(244,185,66,.08);
    }


    .tp-save-button {
      min-height: 50px;
      margin-top: 5px;
      border-radius: 12px;
      background:
        linear-gradient(
          135deg,
          #ffd36a,
          #f4b942
        );
      color: #171005;
      font-weight: 900;
      cursor: pointer;
    }


    @media(max-width:640px) {

      #accountEditor {
        align-items: flex-end;
        padding: 0;
      }

      .tp-modal {
        width: 100%;
        border-radius:
          22px 22px 0 0;
        padding:
          22px 18px
          calc(
            22px +
            env(
              safe-area-inset-bottom
            )
          );
      }

    }

  `;

  document.head.appendChild(
    modalStyle
  );


  /* =======================================================
     ABRIR EDITOR
  ======================================================= */

  function openAccountEditor() {

    document.getElementById(
      "editLevel"
    ).value = account.level;

    document.getElementById(
      "editGold"
    ).value = account.gold;

    document.getElementById(
      "editGems"
    ).value = account.gems;

    document.getElementById(
      "editEnergy"
    ).value = account.energy;

    modal.classList.add("open");

    document.body.style.overflow =
      "hidden";
  }


  function closeAccountEditor() {

    modal.classList.remove("open");

    document.body.style.overflow =
      "";
  }


  editButton.addEventListener(
    "click",
    openAccountEditor
  );


  document
    .getElementById(
      "closeAccountEditor"
    )
    .addEventListener(
      "click",
      closeAccountEditor
    );


  modal
    .querySelector(
      ".tp-modal-overlay"
    )
    .addEventListener(
      "click",
      closeAccountEditor
    );


  /* =======================================================
     SALVAR CONTA
  ======================================================= */

  document
    .getElementById(
      "saveAccountButton"
    )
    .addEventListener(
      "click",
      () => {

        const newLevel =
          Number(
            document.getElementById(
              "editLevel"
            ).value
          );

        const newGold =
          Number(
            document.getElementById(
              "editGold"
            ).value
          );

        const newGems =
          Number(
            document.getElementById(
              "editGems"
            ).value
          );

        const newEnergy =
          Number(
            document.getElementById(
              "editEnergy"
            ).value
          );


        if (
          newLevel < 1 ||
          newGold < 0 ||
          newGems < 0 ||
          newEnergy < 0
        ) {

          alert(
            "Confira os valores informados."
          );

          return;
        }


        account.level =
          newLevel;

        account.gold =
          newGold;

        account.gems =
          newGems;

        account.energy =
          newEnergy;


        saveAccount();

        updateDashboard();

        closeAccountEditor();

      }
    );


  /* =======================================================
     ESC FECHA MODAL/SIDEBAR
  ======================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (event.key === "Escape") {

        closeAccountEditor();
        closeSidebar();

      }

    }
  );


  /* =======================================================
     INICIALIZAÇÃO
  ======================================================= */

  updateDashboard();

});
