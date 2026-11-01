import { MODULE_ID, ACTIONS } from "./constants.js";

/**
 * Combatant subclass for TWD action selection.
 * Compatible with Foundry VTT v14 (foundry.documents.Combatant).
 */
class TWDCombatant extends Combatant {
  /** @type {number|null} */
  get selectedAction() {
    return this.getFlag(MODULE_ID, "selectedAction") ?? null;
  }
}

/**
 * Combat subclass that groups combatants by selected action.
 * Compatible with Foundry VTT v14 (foundry.documents.Combat).
 */
class TWDCombat extends Combat {
  /**
   * Assign initiative based on selected action so the tracker sorts by action priority.
   * Defeated combatants are pushed to the end.
   */
  async groupByAction() {
    const updates = Array.from(this.combatants).map((c, index) => {
      if (c.isDefeated) return { _id: c.id, initiative: -9999 };

      const actionValue = c.getFlag(MODULE_ID, "selectedAction") ?? 6;
      // Lower initiative number acts first in Foundry; we use negative of action id
      return { _id: c.id, initiative: actionValue * -100 - index };
    });

    await this.updateEmbeddedDocuments("Combatant", updates);
    await this.setFlag(MODULE_ID, "grouped", true);
  }

  /**
   * Clear action flags, ungroup, and advance to the next round.
   */
  async resetTurn() {
    const updates = this.combatants.map((c) => ({
      _id: c.id,
      [`flags.${MODULE_ID}.selectedAction`]: null
    }));

    await this.updateEmbeddedDocuments("Combatant", updates);
    await this.setFlag(MODULE_ID, "grouped", false);
    return this.nextRound();
  }

  /**
   * Build ordered groups of combatants by selected action (plus defeated).
   * @returns {Array<{id: string|number, label: string, color: string, icon: string, combatants: Combatant[]}>|null}
   */
  get groupedCombatants() {
    if (!this.getFlag(MODULE_ID, "grouped")) return null;

    const groups = {};
    const defeatedGroup = {
      id: "defeated",
      label: "Derrotados",
      color: "#000000",
      icon: "fas fa-skull",
      combatants: []
    };

    const sorted = Array.from(this.combatants).sort((a, b) => {
      const aVal = a.getFlag(MODULE_ID, "selectedAction") || 6;
      const bVal = b.getFlag(MODULE_ID, "selectedAction") || 6;
      return aVal - bVal;
    });

    for (const combatant of sorted) {
      if (combatant.isDefeated) {
        defeatedGroup.combatants.push(combatant);
        continue;
      }

      const actionId = combatant.getFlag(MODULE_ID, "selectedAction") || 6;
      if (!groups[actionId]) {
        groups[actionId] = {
          id: actionId,
          label: ACTIONS[actionId]?.label ?? `Ação ${actionId}`,
          color: ACTIONS[actionId]?.color ?? "#888888",
          icon: ACTIONS[actionId]?.icon ?? "fas fa-question",
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

/**
 * Register custom Combat / Combatant document classes.
 */
export function patchCombat() {
  CONFIG.Combat.documentClass = TWDCombat;
  CONFIG.Combatant.documentClass = TWDCombatant;
}
