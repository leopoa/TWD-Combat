export const MODULE_ID = 'twd-combat';

export const ACTIONS = {
  1: { 
    label: 'Cover', 
    icon: 'fas fa-shield-alt',
    color: '#2980b9'
  },
  2: { 
    label: 'Tiro a Distância', 
    icon: 'fas fa-bow-arrow',
    color: '#c0392b'
  },
  3: { 
    label: 'Lutar Corpo-a-Corpo', 
    icon: 'fas fa-sword',
    color: '#27ae60'
  },
  4: { 
    label: 'Movimentação', 
    icon: 'fas fa-running',
    color: '#d35400'
  },
  5: { 
    label: 'Curar', 
    icon: 'fas fa-medkit',
    color: '#8e44ad'
  },
  6: { 
    label: 'Outros', 
    icon: 'fas fa-asterisk',
    color: '#ffe601'
  }
};

export const SETTING_KEYS = {
  ENABLE_CUSTOM_COMBAT: 'enableCustomCombat'
};
