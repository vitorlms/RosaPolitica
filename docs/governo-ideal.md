# Posição política e governo ideal

O Rosa Política continua centrado no **posicionamento**: dez eixos, essencialidade e arquétipo, a partir das cenas em [`content/story.json`](../content/story.json). Este documento descreve o segundo resultado, **Seu governo ideal**, calculado à parte e mostrado abaixo dos eixos.

## Duas saídas

| | Posicionamento | Governo ideal |
| --- | --- | --- |
| Pergunta | Para onde a pessoa inclina, e o quanto isso é inegociável | Como ela estruturaria o arranjo de um governo |
| Saída | Eixos + arquétipo | Uma opção por categoria de lei |
| Conteúdo | 40 cenas de posicionamento | [`content/institutions.json`](../content/institutions.json) e os dilemas de arranjo |
| Nome | Arquétipo ilustrativo | Nenhum nome de regime, partido ou ideologia |

O bloco se chama **Seu governo ideal**. Ele não substitui o radar nem o arquétipo. Fica separado, para não misturar “em que você acredita” com “que máquina você montaria”.

## Conteúdo

- **Categorias** em [`content/institutions.json`](../content/institutions.json): contenção do poder, condução do dia a dia, limites do Estado, papel econômico do Estado, centro / território / força. Cada uma tem 3–4 opções exclusivas, com `label`, `solves` (o problema) e `tradeoff` (o custo) — o mesmo espírito do `hint` das cenas.
- **Oito dilemas** em [`content/story-institutions-draft.json`](../content/story-institutions-draft.json). O formato é o das cenas ao vivo (`id`, `title`, `body`, escolhas com `label` e `hint`, mais `weights` / `salience`). O campo extra `leans` aponta para uma opção institucional. [`lib/scoring.ts`](../lib/scoring.ts) lê só `weights` e `salience` desses dilemas. `leans` fica em [`lib/institutions.ts`](../lib/institutions.ts).
- **Tipos** em [`lib/types.ts`](../lib/types.ts) (`InstitutionCatalog`, `InstitutionLean`, `InstitutionPick`, …). O placar e a tela usam esse módulo.

## Como entra no jogo

1. Cada escolha pode declarar `leans`: `{ categoryId, optionId, strength }` com `strength` de 0 a 1. As 40 cenas de posicionamento ainda não têm isso. Os oito dilemas são a sonda; um passe futuro pode anotar cenas antigas só quando elas já falarem de arranjo (Judiciário, escola, força).
2. Os modos rápido, padrão e completo **não trocam** as cenas de posicionamento (5, 15 ou 40, pela saliência de sempre). Os dilemas de arranjo entram **depois**, na mesma partida. Assim uma retomada no meio do teste continua alinhada ao prefixo salvo. O rápido joga cinco cenas, uma por categoria (`emenda-travada`, `hospital-transicao`, `regra-dos-setores`, `policia-da-fronteira`, `capitulo-de-emergencia`). Padrão e completo jogam as oito.
3. No fim da partida, para cada categoria, somar `strength` das `leans` das escolhas feitas. A conta está em `scoreInstitutions` e usa só os ids salvos — Meu resultado refaz o bloco sem guardar o placar à parte.
4. A opção com maior soma é a sugestão daquela categoria. Se a segunda chega a **80%** da primeira (`INSTITUTION_CLOSE_RATIO`), a categoria fica **em aberto**. Sem nenhum lean, também fica em aberto. Empate exato conta como perto.
5. A UI mostra, por categoria, o nome, a pergunta, o `label`, `solves` (problema) e `tradeoff` (preço). Texto de apoio está em `resultTitle` e `resultLead`. Categoria em aberto não exibe problema nem preço de um vencedor.
6. Não derivar um rótulo de regime a partir da combinação. O jogador vê o mecanismo e o preço, não uma bandeira.

`weights` continuam alimentando só os dez eixos — inclusive os dos dilemas de arranjo, quando a pessoa os respondeu. Um resultado antigo, sem esses ids, pontua os eixos como antes. `leans` não entra nesse cálculo.

## O que ainda não faz

As 40 cenas de posicionamento não declaram `leans`. O texto de compartilhar continua sendo só o arquétipo. [`lib/institutions.ts`](../lib/institutions.ts) roda `assertInstitutionDraft` ao carregar: todo `leans` aponta para uma opção real, e toda opção é sondada ao menos uma vez no conjunto dos oito.
