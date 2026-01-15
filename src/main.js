import { patchCombat } from './combat.js';
import { patchTracker } from './tracker.js';
import { MODULE_ID, SETTING_KEYS, ACTIONS } from './constants.js';

Hooks.once('init', () => {
  game.settings.register(MODULE_ID, SETTING_KEYS.ENABLE_CUSTOM_COMBAT, {
    name: 'Enable TWD Combat',
    hint: 'Ativa o combate custom para TWD.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  if (game.settings.get(MODULE_ID, SETTING_KEYS.ENABLE_CUSTOM_COMBAT)) {
    patchCombat();
    patchTracker();
  }
});

Hooks.on('renderCombatTracker', (app, html, data) => {
  if (!data.combat) return;

  const isGrouped = data.combat.getFlag(MODULE_ID, 'grouped') ?? false;

  // 1. Ocultar interface padrão
  html.find('[data-control="rollAll"], [data-control="rollNPC"], [data-control="resetAll"], .combat-settings').hide();
  html.find('.token-initiative').hide();

  // 2. Botões Iniciar/Fim de Turno
  const roundHeader = html.find('.encounter-controls h3');
  if (roundHeader.length && data.combat.started) {
    html.find('.twd-round-buttons').remove();
    const buttonsHtml = `
      <nav class="twd-round-buttons">
        <a class="combat-button startTurn ${isGrouped ? 'disabled' : ''}" title="Iniciar Turno"><i class="fas fa-play"></i></a>
        <a class="combat-button endTurn ${!isGrouped ? 'disabled' : ''}" title="Fim de Turno"><i class="fas fa-stop"></i></a>
      </nav>`;
    roundHeader.append(buttonsHtml);

    html.find('.startTurn').click(() => data.combat.groupByAction());
    html.find('.endTurn').click(() => data.combat.resetTurn());
  }

  const combatList = html.find('#combat-tracker');

  // 3. Reorganização Visual e Ícones
  if (isGrouped) {
    const groups = data.combat.groupedCombatants;
    const combatantsElements = html.find('li.combatant').detach();
    combatList.empty();

    groups.forEach(group => {
      const header = $(`
        <li class="twd-action-group-header group-${group.id}" style="border-left: 4px solid ${group.color}; background: ${group.color}44;">
          <i class="${group.icon}"></i> <span>${group.label.toUpperCase()}</span>
        </li>`);
      combatList.append(header);

      group.combatants.forEach(combatant => {
        const $el = combatantsElements.filter(`[data-combatant-id="${combatant.id}"]`);
        if ($el.length) {
          renderActionIcons($el, combatant.id, combatant.getFlag(MODULE_ID, 'selectedAction'), true);
          combatList.append($el);
        }
      });
    });
  } else {
    // Modo Seleção (Cada um escolhe o seu)
    html.find('li.combatant').each((_, li) => {
      const $li = $(li);
      const combatantId = $li.data('combatant-id');
      const combatant = data.combat.combatants.get(combatantId);
      const isReadonly = combatant?.isDefeated ?? false;
      renderActionIcons($li, combatantId, combatant.getFlag(MODULE_ID, 'selectedAction'), isReadonly);
    });
  }

  // 4. Lógica de Clique nos Ícones
  if (!isGrouped) {
    html.find('.action-icon').click(async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const $icon = $(event.currentTarget);
      const combatantId = $icon.data('combatant-id');
      const combatant = data.combat.combatants.get(combatantId);
      
      if (combatant?.isDefeated) return;

      const actionValue = parseInt($icon.data('action'));
      const currentAction = combatant.getFlag(MODULE_ID, 'selectedAction');
      await combatant.setFlag(MODULE_ID, 'selectedAction', currentAction === actionValue ? null : actionValue);
    });
  }
});

function renderActionIcons($li, combatantId, selectedAction, isReadonly) {
  $li.find('.twd-action-container').remove();
  let iconsHtml = `<div class="twd-action-container ${isReadonly ? 'readonly' : ''}">`;
  for (const [key, action] of Object.entries(ACTIONS)) {
    const isSelected = parseInt(key) === parseInt(selectedAction);
    iconsHtml += `<a class="action-icon action-${key} ${isSelected ? 'selected' : ''}" data-action="${key}" data-combatant-id="${combatantId}" title="${action.label}"><i class="${action.icon}"></i></a>`;
  }
  iconsHtml += `</div>`;
  $li.find('.token-name').after(iconsHtml);
}