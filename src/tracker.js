import { MODULE_ID } from "./constants.js";

/**
 * CombatTracker subclass for Foundry VTT v14 (ApplicationV2).
 * Extends foundry.applications.sidebar.tabs.CombatTracker.
 * Uses _prepareContext instead of the legacy getData().
 */
class TWDCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
  /**
   * @param {object} options
   * @returns {Promise<object>}
   * @override
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const combat = this.viewed;
    context.isGrouped = combat?.getFlag(MODULE_ID, "grouped") ?? false;
    return context;
  }
}

/**
 * Register the custom Combat Tracker UI class.
 */
export function patchTracker() {
  CONFIG.ui.combat = TWDCombatTracker;
}
