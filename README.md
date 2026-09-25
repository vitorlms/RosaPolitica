# Rosa Política

Protótipo conceitual de **análise política por ficção interativa**: em vez de “concorda / discorda”, o jogador decide dilemas num país inventado — a **Confederação de Valmora** — e recebe um perfil em cinco eixos + um arquétipo.

Não há respostas certas. Cada opção tem um trade-off explícito.

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Modelo político

Cinco eixos contínuos (**-1 … +1** no cálculo; **0 … 100** na tela):

| Eixo | Pólo baixo (→ 0) | Pólo alto (→ 100) |
|------|------------------|-------------------|
| `economy` | Redistribuição / Estado ativo | Mercado / propriedade privada |
| `authority` | Autonomia / descentralização | Ordem / Estado forte |
| `liberty` | Bem comum / restrições coletivas | Liberdade individual máxima |
| `equality` | Meritocracia / desigualdade aceita | Equalização / justiça redistributiva |
| `tradition` | Mudança / cosmopolitismo | Costumes / continuidade cultural |

Cada escolha soma pesos pequenos (`|w| ≤ 0.25` em geral). O arquétipo final é o centróide mais próximo (distância euclidiana) em [`content/archetypes.json`](content/archetypes.json).

## Como editar o conteúdo

1. **Cenas e opções** — [`content/story.json`](content/story.json)  
   - Adicione um objeto em `scenes` com `id`, `title`, `body` e `choices`.  
   - Em cada `choice`, defina `weights` só nos eixos que a opção move.  
   - Evite rótulos partidários reais; mantenha opções igualmente legítimas.

2. **Arquétipos** — [`content/archetypes.json`](content/archetypes.json)  
   - Ajuste `centroid` (valores -1…+1) e textos do mundo fictício.

3. Reinicie ou recarregue o `dev` — o motor em [`lib/scoring.ts`](lib/scoring.ts) lê esses JSON.

## Estrutura

```
app/           # intro, play, result
components/    # SceneCard, ChoiceButton, AxisRadar, AxisBars
content/       # story.json, archetypes.json
lib/           # types, scoring, storage (sessionStorage)
```

## Gancho futuro (não implementado)

A origem das noções políticas de uma pessoa poderá afetar o **cenário inicial** (filtrar/reordenar cenas ou trocar a abertura da história). O tipo `OriginProfile` em [`lib/types.ts`](lib/types.ts) e a separação conteúdo ↔ score já deixam espaço para isso — sem lógica ligada nesta versão.

## Escopo deste protótipo

Inclui: 5 cenas, score multi-eixo, radar + barras, arquétipo.  
Não inclui: login, salvar progresso, múltiplas histórias, IA gerando perguntas.
