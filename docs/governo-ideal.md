# Posição política e governo ideal

O Rosa Política continua centrado no **posicionamento**: dez eixos, essencialidade e arquétipo, a partir das cenas em [`content/story.json`](../content/story.json). O segundo teste, **Governo ideal**, é um fluxograma à parte. Meu resultado mostra os dois quando cada um foi terminado.

## Duas saídas

| | Posicionamento | Governo ideal |
| --- | --- | --- |
| Pergunta | Para onde a pessoa inclina, e o quanto isso é inegociável | Que arranjo de mando a pessoa prefere |
| Saída | Eixos + arquétipo | Título descritivo do arranjo, com problema, preço e as escolhas que puxaram |
| Conteúdo | 40 cenas de posicionamento | [`lib/governoFlow.ts`](../lib/governoFlow.ts), mapa em [`governo-ideal-fluxograma.md`](./governo-ideal-fluxograma.md) |
| Nome | Arquétipo ilustrativo | Nenhum nome de regime, partido ou ideologia |

O resultado se chama **Seu governo ideal**. Ele não substitui o radar nem o arquétipo.

## Como entra no jogo

1. Os modos rápido, padrão e completo jogam só as cenas de posicionamento (5, 15 ou 40). O governo ideal tem entrada própria na home (`/governo`). A retomada de cada um fica numa chave separada.
2. O caminho não é uma lista fixa. Cada resposta abre, pula ou troca a pergunta seguinte. Um percurso típico tem 6 a 8 nós, de um baralho de 11.
3. As respostas somam parâmetros mudos. No fim, a distância até centróides internos escolhe um arranjo principal e, se couber, um segundo. Perto demais, os dois títulos aparecem lado a lado. A tela não mostra o id interno.
4. Meu resultado mostra o perfil, o arranjo, ou os dois. Terminar um não exige o outro.
5. Os dez eixos saem só das cenas de posicionamento. Este fluxo não escreve neles.

O catálogo linear antigo (cinco categorias e oito dilemas) não entra mais no jogo. Os arquivos em `content/institutions.json` e `content/story-institutions-draft.json` ficam só como nota de que foram substituídos.

## Mapa

Nós, opções, pesos, centróides, guardas e os três percursos de exemplo estão em [`governo-ideal-fluxograma.md`](./governo-ideal-fluxograma.md). O código segue esse mapa. Ao carregar, confere os percursos do círculo miúdo, da carta de fora e do chefe com data.
