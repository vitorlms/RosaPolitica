# Posição política e governo ideal

O Rosa Política continua centrado no **posicionamento**: dez eixos, essencialidade e arquétipo, a partir das cenas em [`content/story.json`](../content/story.json). Este documento descreve um segundo resultado, ainda sem tela e sem placar.

## Duas saídas

| | Posicionamento (hoje) | Governo ideal (esqueleto) |
| --- | --- | --- |
| Pergunta | Para onde a pessoa inclina, e o quanto isso é inegociável | Como ela estruturaria o arranjo de um governo |
| Saída | Eixos + arquétipo | Uma opção por categoria de lei |
| Conteúdo | 40 cenas ao vivo | [`content/institutions.json`](../content/institutions.json) e o rascunho de dilemas |
| Nome | Arquétipo ilustrativo | Nenhum nome de regime, partido ou ideologia |

O bloco futuro se chama **Seu governo ideal**. Ele não substitui o radar nem o arquétipo. Fica separado, para não misturar “em que você acredita” com “que máquina você montaria”.

## O que já existe neste esqueleto

- **Categorias** em [`content/institutions.json`](../content/institutions.json): contenção do poder, condução do dia a dia, limites do Estado, papel econômico do Estado, centro / território / força. Cada uma tem 3–4 opções exclusivas, com `label`, `solves` (o problema) e `tradeoff` (o custo) — o mesmo espírito do `hint` das cenas.
- **Oito dilemas rascunho** em [`content/story-institutions-draft.json`](../content/story-institutions-draft.json). O formato é o das cenas ao vivo (`id`, `title`, `body`, escolhas com `label` e `hint`, mais `weights` / `salience` para poderem entrar depois no mesmo formato). O campo extra `leans` aponta para uma opção institucional. Esse arquivo **não** é lido por [`lib/scoring.ts`](../lib/scoring.ts). As 40 cenas seguem sozinhas.
- **Tipos** em [`lib/types.ts`](../lib/types.ts) (`InstitutionCatalog`, `InstitutionLean`, `InstitutionPick`, …). [`lib/institutions.ts`](../lib/institutions.ts) só amarra o JSON e confere o rascunho. Nenhuma página importa esse módulo.

## Como plugar depois

1. Cada escolha — das 40 cenas e dos dilemas novos — pode declarar `leans`: `{ categoryId, optionId, strength }` com `strength` de 0 a 1. As 40 ainda não têm isso. O rascunho é a primeira sonda; um passe futuro anota cenas antigas só quando elas já falarem de arranjo (Judiciário, escola, força), sem obrigar cena nova para tudo.
2. No fim da partida, para cada categoria, somar `strength` das `leans` das escolhas que a pessoa fez.
3. A opção com maior soma é a sugestão daquela categoria. Se as duas primeiras ficarem próximas, deixar a categoria **em aberto** em vez de forçar um vencedor. A margem fica para a implementação.
4. A UI mostra, por categoria, o nome da categoria, o `label` da opção, `solves` e `tradeoff`. Texto de apoio já está em `resultTitle` e `resultLead`.
5. Não derivar um rótulo de regime a partir da combinação. “Sem dar nome aos bois”: o jogador vê o mecanismo e o preço, não uma bandeira.

`weights` continuam alimentando só os dez eixos. `leans` não entra nesse cálculo. Os dois perfis podem usar as mesmas respostas e ainda assim sair em blocos diferentes.

## O que este passo não faz

Não há placar institucional, não há bloco na tela de resultado, e o rascunho não aumenta o teste de 40 cenas. [`lib/institutions.ts`](../lib/institutions.ts) exporta `assertInstitutionDraft` para um passo futuro conferir se todo `leans` aponta para uma opção real e se toda opção é sondada ao menos uma vez.
