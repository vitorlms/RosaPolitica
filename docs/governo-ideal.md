# Meu Perfil e Meu Estado

O Rosa Política tem dois testes. **Meu Perfil** é o posicionamento em Valmora: dez eixos, essencialidade e arquétipo, a partir das cenas em [`content/story.json`](../content/story.json). **Meu Estado** é o fluxograma à parte (antes chamado Governo ideal). Nele a pessoa ajuda a fundar um país novo, na mesma ficção, longe de Valmora. O nome sugerido é Pontal; ela pode ficar com ele ou escrever outro. Cada resultado tem a própria página.

## Duas saídas

| | Meu Perfil | Meu Estado |
| --- | --- | --- |
| Pergunta | Para onde a pessoa inclina, e o quanto isso é inegociável | Que arranjo de mando a pessoa prefere |
| Saída | Eixos + arquétipo | Título descritivo do arranjo, com o nome de aula mais próximo, problema, preço e as escolhas que puxaram |
| Conteúdo | 40 cenas de posicionamento | [`lib/governoFlow.ts`](../lib/governoFlow.ts), mapa em [`governo-ideal-fluxograma.md`](./governo-ideal-fluxograma.md) |
| Nome | Arquétipo ilustrativo | Nome de aula só no resultado (“Mais próximo de”). Os dilemas ficam sem nome de regime |

O resultado se chama **Meu Estado Ideal**. Ele não substitui o radar nem o arquétipo. A página [`/organizacoes`](../app/organizacoes/page.tsx) explica os nove arranjos, com nome de aula e exemplos aproximados do mundo. Esses nomes não entram nos dilemas. No resultado, a frase descritiva continua em primeiro, e “Mais próximo de” repete o nome de aula, com link para a organização.

## Como entra no jogo

1. Os modos rápido, padrão e completo jogam só as cenas de posicionamento (5, 15 ou 40). Meu Estado tem entrada própria na home (`/estado`). A retomada de cada um fica numa chave separada. Os endereços antigos `/result`, `/governo` e `/governo/resultado` redirecionam.
2. O caminho não é uma lista fixa. Cada resposta abre, pula ou troca a pergunta seguinte. O baralho tem 20 nós. Um percurso típico tem 13 a 16: o tronco, mais o trilho de princípios, poder, cidadania, religião, burocracia, exército, marinha, segurança interna e justiça. No resultado, as perguntas que o caminho pulou ficam opcionais. Responder uma delas entra na conta e o arranjo é recalculado. Dá para deixar como está.
3. As respostas somam parâmetros mudos. No fim, a distância até centróides internos escolhe um arranjo principal e, se couber, um segundo. Perto demais, os dois títulos aparecem lado a lado. A tela não mostra o id interno.
4. Meu Perfil fica em `/perfil`. Meu Estado Ideal fica em `/estado/resultado`. `/meu-resultado` só aponta para os dois. Terminar um não exige o outro.
5. Os dez eixos saem só das cenas de posicionamento. Este fluxo não escreve neles.

O nome do país entra em alguns textos e na frase do resultado. Não muda o placar. O catálogo linear antigo (cinco categorias e oito dilemas) não entra mais no jogo. Os arquivos em `content/institutions.json` e `content/story-institutions-draft.json` ficam só como nota de que foram substituídos. Na home, Meu Estado avisa cerca de 13 a 16 dilemas, perto de 15 minutos.

## Mapa

Nós, opções, pesos, centróides, guardas e os nove percursos de exemplo estão em [`governo-ideal-fluxograma.md`](./governo-ideal-fluxograma.md). O código segue esse mapa. Ao carregar, confere um percurso canônico de cada um dos nove arranjos.
