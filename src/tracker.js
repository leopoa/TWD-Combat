import { MODULE_ID } from './constants.js';

class TWDCombatTracker extends CombatTracker {
  async getData(options) {
    const data = await super.getData(options);
    data.isGrouped = this.combat?.getFlag(MODULE_ID, 'grouped') ?? false;
    return data;
  }
}

export function patchTracker() {
  CONFIG.ui.combat = TWDCombatTracker;
}