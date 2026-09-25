# Rosa Política

Protótipo de **análise política por ficção interativa**: em vez de “concorda / discorda”, o jogador decide dilemas na **Confederação de Valmora** e recebe um perfil em **dez eixos** — com **posição** e **essencialidade** (núcleo vs zona limítrofe/negociável) — mais um arquétipo.

Não há respostas certas. Cada opção tem um trade-off explícito.

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Modelo político

### Posição (dez eixos, -1 … +1 → 0 … 100 na UI)

| Eixo | Pólo baixo (→ 0) | Pólo alto (→ 100) |
|------|------------------|-------------------|
| `economy` | Redistribuição / Estado ativo | Mercado / propriedade privada |
| `authority` | Autonomia / descentralização | Ordem / Estado forte |
| `liberty` | Bem comum / restrições coletivas | Liberdade individual máxima |
| `equality` | Meritocracia / desigualdade aceita | Equalização / justiça redistributiva |
| `tradition` | Mudança / cosmopolitismo | Costumes / continuidade cultural |
| `environment` | Exploração / crescimento | Preservação / limites ecológicos |
| `security` | Risco aceito / abertura | Proteção / controle de ameaças |
| `global` | Soberania / prioridade local | Cooperação / integração externa |
| `technology` | Cautela / freio social | Aceleração / inovação liberada |
| `body` | Norma coletiva / proteção moral | Autonomia corporal / privada |

### Essencialidade (por eixo)

Cada opção pode declarar `salience` (0–1) por eixo: o quanto aquele tema é **central / quase inegociável** na decisão.

- Média das saliences ao longo das cenas → **essencialidade** (0–100)
- Faixas na UI: **Essencial** (≥70), **Moderado** (40–69), **Limítrofe / negociável** (&lt;40), **Não tocado**

Assim duas pessoas com a mesma posição em Economia podem diferir: uma trata mercado como dogma; a outra, como preferência.

O arquétipo final é o centróide mais próximo (distância euclidiana nas posições) em [`content/archetypes.json`](content/archetypes.json).

## Cenas atuais (10)

1. Greve nas Minas de Ferroalto  
2. Discurso após o tumulto de Maré Alta  
3. Currículo das Escolas do Pacto  
4. Fronteira de Salgueiro  
5. Rio de Cinzas e a usina  
6. Lanternas de Porto Véu (vigilância)  
7. Floresta dos Cem Anos  
8. Tratado com a Liga do Norte  
9. Autômatos nas guildas  
10. Rito do Véu e a febre de Âmbar (corpo)

## Como editar o conteúdo

1. **Cenas e opções** — [`content/story.json`](content/story.json)  
   - `weights`: para onde a opção empurra (em geral `|w| ≤ 0.25`)  
   - `salience`: quão essencial é cada eixo tocado (0–1)  
   - Evite rótulos partidários reais; mantenha opções igualmente legítimas.

2. **Arquétipos** — [`content/archetypes.json`](content/archetypes.json)  
   - `centroid` com os **dez** eixos (-1…+1)

3. Recarregue o `dev` — o motor em [`lib/scoring.ts`](lib/scoring.ts) lê esses JSON.

## Estrutura

```
app/           # intro, play, result
components/    # SceneCard, ChoiceButton, AxisRadar, AxisBars, EssentialSummary
content/       # story.json, archetypes.json
lib/           # types, scoring, storage (sessionStorage)
```

## Gancho futuro (não implementado)

A origem das noções políticas poderá afetar o **cenário inicial**. O tipo `OriginProfile` em [`lib/types.ts`](lib/types.ts) já existe como placeholder.

## Escopo

Inclui: 10 cenas, 10 eixos, salience/essencialidade, radar, arquétipos.  
Não inclui: login, salvar progresso, múltiplas histórias, IA gerando perguntas.
