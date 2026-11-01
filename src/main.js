import { patchCombat } from "./combat.js";
import { patchTracker } from "./tracker.js";
import { MODULE_ID, SETTING_KEYS, ACTIONS } from "./constants.js";

/**
 * Foundry VTT v14 compatible TWD Combat module.
 * - ApplicationV2 CombatTracker (DOM, not jQuery)
 * - data-action selectors for core controls
 * - compatibility.minimum / verified: 14
 */

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, SETTING_KEYS.ENABLE_CUSTOM_COMBAT, {
    name: "TWD_COMBAT.ENABLE_CUSTOM_COMBAT",
    hint: "TWD_COMBAT.ENABLE_CUSTOM_COMBAT_HINT",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  if (game.settings.get(MODULE_ID, SETTING_KEYS.ENABLE_CUSTOM_COMBAT)) {
    patchCombat();
    patchTracker();
  }
});

/**
 * renderCombatTracker (ApplicationV2): second argument is HTMLElement, not jQuery.
 * @param {foundry.applications.sidebar.tabs.CombatTracker} app
 * @param {HTMLElement} html
 * @param {object} context
 */
Hooks.on("renderCombatTracker", (app, html, context) => {
  const combat = app.viewed ?? context?.combat ?? null;
  if (!combat) return;

  const isGrouped = combat.getFlag(MODULE_ID, "grouped") ?? false;

  // 1. Hide default initiative UI (v13/v14 use data-action)
  hideDefaultControls(html);

  // 2. Play / Stop buttons when combat has started
  if (combat.started) {
    injectRoundButtons(html, combat, isGrouped);
  }

  // 3. Action icons + optional regrouping
  const combatList =
    html.querySelector("#combat-tracker") ||
    html.querySelector("ol.combat-tracker") ||
    html.querySelector(".combat-tracker");

  if (!combatList) return;

  if (isGrouped) {
    renderGroupedView(combatList, combat, html);
  } else {
    renderSelectionView(combatList, combat);
  }

  // 4. Click handlers only while not grouped
  if (!isGrouped) {
    combatList.querySelectorAll(".action-icon").forEach((icon) => {
      icon.addEventListener("click", onActionIconClick);
    });
  }
});

/** Hide roll-all / roll-NPC / reset and initiative columns. */
function hideDefaultControls(html) {
  const selectors = [
    '[data-action="rollAll"]',
    '[data-action="rollNPC"]',
    '[data-action="reset"]',
    '[data-control="rollAll"]',
    '[data-control="rollNPC"]',
    '[data-control="resetAll"]',
    ".combat-settings",
    ".token-initiative",
    '[data-control="settings"]'
  ];
  for (const sel of selectors) {
    html.querySelectorAll(sel).forEach((el) => {
      el.style.display = "none";
    });
  }
}

/**
 * Inject Start Turn / End Turn controls near the encounter header.
 * @param {HTMLElement} html
 * @param {Combat} combat
 * @param {boolean} isGrouped
 */
function injectRoundButtons(html, combat, isGrouped) {
  // Remove previous injects
  html.querySelectorAll(".twd-round-buttons").forEach((n) => n.remove());

  const header =
    html.querySelector(".encounter-controls") ||
    html.querySelector("header.combat-controls") ||
    html.querySelector(".combat-tracker-header") ||
    html.querySelector("h3");

  if (!header) return;

  const nav = document.createElement("nav");
  nav.className = "twd-round-buttons";
  nav.innerHTML = `
    <a class="combat-button startTurn ${isGrouped ? "disabled" : ""}" title="Iniciar Turno" data-twd-action="startTurn">
      <i class="fas fa-play"></i>
    </a>
    <a class="combat-button endTurn ${!isGrouped ? "disabled" : ""}" title="Fim de Turno" data-twd-action="endTurn">
      <i class="fas fa-stop"></i>
    </a>
  `;

  // Prefer appending into controls area; fallback to header
  const controlsRow =
    header.querySelector(".encounter-controls") ||
    header.querySelector(".combat-controls") ||
    header;
  controlsRow.appendChild(nav);

  const startBtn = nav.querySelector('[data-twd-action="startTurn"]');
  const endBtn = nav.querySelector('[data-twd-action="endTurn"]');

  if (startBtn && !isGrouped) {
    startBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      combat.groupByAction();
    });
  }
  if (endBtn && isGrouped) {
    endBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      combat.resetTurn();
    });
  }
}

/**
 * Rebuild list ordered by action groups.
 * @param {HTMLElement} combatList
 * @param {Combat} combat
 * @param {HTMLElement} html
 */
function renderGroupedView(combatList, combat, html) {
  const groups = combat.groupedCombatants;
  if (!groups) return;

  const combatantsElements = Array.from(
    combatList.querySelectorAll("li.combatant")
  );
  const byId = new Map(
    combatantsElements.map((li) => [li.dataset.combatantId, li])
  );

  combatList.replaceChildren();

  for (const group of groups) {
    const header = document.createElement("li");
    header.className = `twd-action-group-header group-${group.id}`;
    header.style.borderLeft = `4px solid ${group.color}`;
    header.style.background = `${group.color}44`;
    header.innerHTML = `<i class="${group.icon}"></i> <span>${String(group.label).toUpperCase()}</span>`;
    combatList.appendChild(header);

    for (const combatant of group.combatants) {
      const el = byId.get(combatant.id);
      if (!el) continue;
      renderActionIcons(
        el,
        combatant.id,
        combatant.getFlag(MODULE_ID, "selectedAction"),
        true
      );
      combatList.appendChild(el);
    }
  }
}

/**
 * Attach action icons under each combatant name (planning phase).
 * @param {HTMLElement} combatList
 * @param {Combat} combat
 */
function renderSelectionView(combatList, combat) {
  combatList.querySelectorAll("li.combatant").forEach((li) => {
    const combatantId = li.dataset.combatantId;
    const combatant = combat.combatants.get(combatantId);
    if (!combatant) return;
    const isReadonly = combatant.isDefeated ?? false;
    renderActionIcons(
      li,
      combatantId,
      combatant.getFlag(MODULE_ID, "selectedAction"),
      isReadonly
    );
  });
}

/**
 * Build / replace the action icon row for one combatant row.
 * @param {HTMLElement} li
 * @param {string} combatantId
 * @param {number|null} selectedAction
 * @param {boolean} isReadonly
 */
function renderActionIcons(li, combatantId, selectedAction, isReadonly) {
  li.querySelectorAll(".twd-action-container").forEach((n) => n.remove());

  const container = document.createElement("div");
  container.className = `twd-action-container${isReadonly ? " readonly" : ""}`;

  for (const [key, action] of Object.entries(ACTIONS)) {
    const isSelected = parseInt(key, 10) === parseInt(selectedAction, 10);
    const a = document.createElement("a");
    a.className = `action-icon action-${key}${isSelected ? " selected" : ""}`;
    a.dataset.action = key;
    a.dataset.combatantId = combatantId;
    a.title = action.label;
    a.innerHTML = `<i class="${action.icon}"></i>`;
    container.appendChild(a);
  }

  const nameEl =
    li.querySelector(".token-name") ||
    li.querySelector(".name") ||
    li.querySelector(".combatant-name");
  if (nameEl) {
    nameEl.after(container);
  } else {
    li.appendChild(container);
  }
}

/**
 * Toggle selected action on icon click.
 * @param {MouseEvent} event
 */
async function onActionIconClick(event) {
  event.preventDefault();
  event.stopPropagation();

  const icon = event.currentTarget;
  const combatantId = icon.dataset.combatantId;
  const combat = game.combat;
  if (!combat) return;

  const combatant = combat.combatants.get(combatantId);
  if (!combatant || combatant.isDefeated) return;

  const actionValue = parseInt(icon.dataset.action, 10);
  const currentAction = combatant.getFlag(MODULE_ID, "selectedAction");
  await combatant.setFlag(
    MODULE_ID,
    "selectedAction",
    currentAction === actionValue ? null : actionValue
  );
}
