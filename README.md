# Rosa Política

Protótipo de **análise política por ficção interativa**: em vez de “concorda / discorda”, o jogador decide dilemas na **Confederação de Valmora** e recebe um perfil em **dez eixos** — com **posição** e **essencialidade** (núcleo vs zona limítrofe/negociável) — mais um arquétipo.

Não há respostas certas. Cada opção tem um trade-off explícito.

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Aplicação online

Hospedada em [https://rosa-politica.vercel.app/](https://rosa-politica.vercel.app/).

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

## Cenas atuais (40)

1. Greve na mineração estatal  
2. Protesto que virou violência  
3. O que a escola deve ensinar  
4. Pressão na fronteira  
5. Hidrelétrica no rio  
6. Câmeras depois de um atentado  
7. Explorar ou proteger a floresta  
8. Acordo com um bloco vizinho  
9. Automação no trabalho  
10. Vacina obrigatória numa epidemia  
11. Imposto sobre grandes fortunas  
12. Porte de drogas para uso pessoal  
13. Interrupção da gravidez  
14. Algoritmo na Justiça criminal  
15. Agronegócio e área protegida  
16. Serviço militar obrigatório  
17. Mentira e discurso nas redes  
18. Morte assistida  
19. Ajuda a um país em crise  
20. Metas climáticas e indústria  
21. Seca e gestão da água  
22. Energia nuclear no mix elétrico  
23. Trabalho sexual e a lei  
24. Doação de órgãos  
25. Sanções a um país vizinho  
26. Capital estrangeiro em setor estratégico  
27. Corte internacional e soberania  
28. Dados pessoais e plataformas  
29. Edição genética em humanos  
30. Moeda digital do Estado  
31. Porte de armas por civis  
32. Crime organizado nas periferias  
33. Financiamento da saúde  
34. Moradia e ocupação urbana  
35. Idade de aposentadoria  
36. Cotas no ensino superior  
37. Demarcação de terra indígena  
38. Religião na escola pública  
39. Intervenção em conflito externo  
40. Independência do Judiciário

## Como editar o conteúdo

1. **Cenas e opções** — [`content/story.json`](content/story.json)  
   - `weights`: para onde a opção empurra (em geral `|w| ≤ 0.25`)  
   - `salience`: quão essencial é cada eixo tocado (0–1)  
   - Evite rótulos partidários reais; mantenha opções igualmente legítimas.

2. **Arquétipos** — [`content/archetypes.json`](content/archetypes.json)  
   - `centroid` com os **dez** eixos (-1…+1)

3. Recarregue o `dev` — o motor em [`lib/scoring.ts`](lib/scoring.ts) lê esses JSON.

4. **Governo ideal** — teste separado em [`/governo`](app/governo/page.tsx). Conteúdo em [`content/institutions.json`](content/institutions.json) e [`content/story-institutions-draft.json`](content/story-institutions-draft.json). Não entra nos modos rápido / padrão / completo. Ver [`docs/governo-ideal.md`](docs/governo-ideal.md).

## Estrutura

```
app/           # intro, play, result
components/    # SceneCard, ChoiceButton, AxisRadar, AxisBars, EssentialSummary
content/       # story.json, archetypes.json, institutions.json, story-institutions-draft.json
docs/          # governo-ideal.md
lib/           # types, scoring, storage (sessionStorage)
```

## Governo ideal

Teste à parte, na home, com os oito dilemas de arranjo. O resultado mostra uma opção por categoria, sem nome de regime, e não altera o perfil dos dez eixos. Meu resultado junta os dois só quando cada um foi terminado. Ver [`docs/governo-ideal.md`](docs/governo-ideal.md).

## Gancho futuro (não implementado)

A origem das noções políticas poderá afetar o **cenário inicial**. O tipo `OriginProfile` em [`lib/types.ts`](lib/types.ts) já existe como placeholder.

## Escopo

Inclui: 40 cenas de posicionamento, 3 modos de teste (rápido / padrão / completo), um teste separado de governo ideal (8 dilemas), retomada no meio de cada teste neste navegador, 10 eixos, salience/essencialidade, radar, arquétipos.  
Não inclui: login, múltiplas histórias, IA gerando perguntas.
