# TWD Combat for Foundry VTT (v14)

Módulo que transforma o Combat Tracker padrão do Foundry VTT em uma ferramenta tática para **The Walking Dead RPG** (Free League) ou qualquer sistema baseado em **Year Zero Engine** com seleção de ações por fase.

**Compatibilidade: Foundry VTT v14** (migrado a partir da versão original para v11).

---

## Funcionalidades

- **Seleção de Ações Visual**: 6 ícones de ação no tracker (substitui iniciativa padrão).
- **Persistência de Estado**: escolha salva em flags do combatente (sobrevive a refresh).
- **Agrupamento Tático (Modo Play)**: o Mestre clica em **Play** e o tracker reorganiza por ação.
- **Gestão de Derrotados**: combatentes defeated vão para o grupo Derrotados no final.
- **Bloqueio Read-Only**: com grupos ativos, os ícones ficam imutáveis.

---

## Como usar

### Jogadores
1. Abra o Combat Tracker.
2. Na fase de planejamento, clique em um ícone abaixo do nome do personagem.
3. Clique de novo no mesmo ícone para desmarcar.

### Mestre
- **Iniciar Turno (▶️)**: após todos escolherem ações → agrupa e reordena.
- **Finalizar Rodada (■)**: limpa seleções, remove grupos, avança a rodada.

### Ordem dos grupos
1. Cover  
2. Tiro a Distância  
3. Corpo-a-Corpo  
4. Movimentação  
5. Curar  
6. Outros  
7. Derrotados  

---

## Instalação

1. Add-on Modules → Install Module  
2. Manifest URL: o `module.json` deste repositório, **ou**  
3. Extraia a pasta em `Data/modules/twd-combat`.

---

### 📋 Grupos e Ordem de Iniciativa

O módulo organiza a fila de combate seguindo esta ordem de prioridade:

🔵 Cover (Ação 1)

🔴 Tiro a Distância (Ação 2)

🟢 Corpo-a-Corpo (Ação 3)

🟠 Movimentação (Ação 4)

🟣 Curar (Ação 5)

⚪ Outros (Ação 6)

💀 Derrotados (Tokens com status de derrotado)


<img width="297" height="409" alt="image" src="https://github.com/user-attachments/assets/a07bd0e6-1337-4cee-ada6-c0d85275121e" />

---

Desenvolvido por: Leonardo Amarilho  
Migração v14: regras oficiais Foundry ApplicationV2 / package compatibility.
