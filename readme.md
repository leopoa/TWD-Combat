TWD Combat for Foundry VTT
Este módulo transforma o Combat Tracker padrão do Foundry VTT em uma ferramenta tática específica para o sistema The Walking Dead RPG (Free League) ou qualquer sistema baseado em Year Zero Engine que utilize seleção de ações por fase.

--- 

🚀 Funcionalidades Principal
Seleção de Ações Visual: Substitui a rolagem de iniciativa padrão por 6 ícones de ação rápida no tracker.

Persistência de Estado: As cores das ações são salvas no banco de dados. Mesmo se você atualizar a página, a escolha do jogador permanece lá.

Agrupamento Tático (Modo Play): Ao iniciar o turno, o Mestre clica no botão de "Play" e o Tracker reorganiza todos os combatentes em grupos baseados em suas ações (ex: todos que estão em Cover agem primeiro).

Gestão de Derrotados: Combatentes marcados com o estado "Defeated" (caveira) são automaticamente movidos para o grupo Derrotados ao final da lista, com um visual diferenciado.

Bloqueio de Segurança (Read-Only): Assim que o turno começa e os grupos são formados, os ícones tornam-se imutáveis para evitar alterações acidentais durante a execução da rodada.

--- 

🕹️ Como Operar

Para Jogadores:
Abra o Combat Tracker.
Durante a fase de planejamento, clique em um dos ícones abaixo do nome do seu personagem.
O ícone ficará colorido, indicando sua escolha. Para desmarcar, clique novamente no mesmo ícone.

Para o Mestre:
Iniciar Turno (▶️): Após todos os jogadores escolherem suas ações, clique no botão de Play no topo do Tracker. Os personagens serão agrupados e a lista será reordenada.
Finalizar Rodada (■): Ao fim da rodada, clique no botão de Stop. Isso irá:
Limpar todas as seleções de ações.
Remover os agrupamentos.
Voltar os ícones para o estado original (cinza).
Avançar o contador de rodadas do combate.

---

📋 Grupos e Ordem de Iniciativa
O módulo organiza a fila de combate seguindo esta ordem de prioridade:
🔵 Cover (Ação 1)
🔴 Tiro a Distância (Ação 2)
🟢 Corpo-a-Corpo (Ação 3)
🟠 Movimentação (Ação 4)
🟣 Curar (Ação 5)
⚪ Outros (Ação 6)
💀 Derrotados (Tokens com status de derrotado)


🛠️ Instalação
Vá até a aba Add-on Modules no seu Foundry VTT.
Clique em Install Module.
No campo Manifest URL, cole o link do module.json deste repositório ou extraia a pasta na sua diretório Data/modules/twd-combat.


Desenvolvido por: Leonardo Amarilho
Compatibilidade: Foundry VTT v11+
