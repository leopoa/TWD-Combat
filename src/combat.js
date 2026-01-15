import { MODULE_ID, ACTIONS } from './constants.js';

class TWDCombatant extends Combatant {
  get selectedAction() {
    return this.getFlag(MODULE_ID, 'selectedAction') ?? null;
  }
}

class TWDCombat extends Combat {
  async groupByAction() {
    // Define iniciativas para ordenar no backend: Derrotados ficam por último (-9999)
    const updates = Array.from(this.combatants).map((c, index) => {
      if (c.isDefeated) return { _id: c.id, initiative: -9999 };
      
      const actionValue = c.getFlag(MODULE_ID, 'selectedAction') ?? 6;
      return { _id: c.id, initiative: (actionValue * -100) - index };
    });
    
    await this.updateEmbeddedDocuments("Combatant", updates);
    await this.setFlag(MODULE_ID, 'grouped', true);
  }

  async resetTurn() {
    // Limpa as flags de ação para a próxima rodada
    const updates = this.combatants.map(c => ({
      _id: c.id,
      [`flags.${MODULE_ID}.selectedAction`]: null
    }));
    
    await this.updateEmbeddedDocuments("Combatant", updates);
    await this.setFlag(MODULE_ID, 'grouped', false);
    return this.nextRound();
  }
  
  get groupedCombatants() {
    if (!this.getFlag(MODULE_ID, 'grouped')) return null;
    
    const groups = {};
    const defeatedGroup = {
      id: 'defeated',
      label: 'Derrotados',
      color: '#000000',
      icon: 'fas fa-skull',
      combatants: []
    };

    // Ordenar por ID da ação
    const sorted = Array.from(this.combatants).sort((a, b) => {
      const aVal = a.getFlag(MODULE_ID, 'selectedAction') || 6;
      const bVal = b.getFlag(MODULE_ID, 'selectedAction') || 6;
      return aVal - bVal;
    });

    for (const combatant of sorted) {
      if (combatant.isDefeated) {
        defeatedGroup.combatants.push(combatant);
        continue;
      }

      const actionId = combatant.getFlag(MODULE_ID, 'selectedAction') || 6;
      if (!groups[actionId]) {
        groups[actionId] = {
          id: actionId,
          label: ACTIONS[actionId].label,
          color: ACTIONS[actionId].color,
          icon: ACTIONS[actionId].icon,
          combatants: []
        };
      }
      groups[actionId].combatants.push(combatant);
    }

    const finalGroups = Object.values(groups);
    if (defeatedGroup.combatants.length > 0) finalGroups.push(defeatedGroup);
    
    return finalGroups;
  }
}

export function patchCombat() {
  CONFIG.Combat.documentClass = TWDCombat;
  CONFIG.Combatant.documentClass = TWDCombatant;
}