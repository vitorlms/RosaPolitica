# Governo ideal — fluxograma por parâmetros

Mapa do teste jogável em `/estado` (Meu Estado; o resultado é Meu Estado Ideal). O código está em [`lib/governoFlow.ts`](../lib/governoFlow.ts). Não muda os dez eixos de Meu Perfil. A pessoa não vê nome de regime no meio do teste. O resultado mostra o título descritivo e, logo abaixo, o nome de aula (“Mais próximo de: …”), o mesmo de `/organizacoes`, com link para essa organização. Os ids internos ficam no placar.

O posicionamento (rápido, padrão, completo) continua na Confederação de Valmora. Este teste não. A pessoa ajuda a escrever o primeiro arranjo de um país novo, na mesma ficção, numa costa longe de Valmora. O nome sugerido é **Pontal**. Ela pode ficar com a sugestão ou escrever outro (até 40 caracteres). O nome entra em alguns dilemas e na frase do resultado. Não altera parâmetro, centróide, guarda nem id interno.

Cada resposta empurra **parâmetros mudos**. No fim, a distância até centróides internos escolhe um arranjo principal e, se couber, um segundo. A pessoa não vê nome de regime, partido ou ideologia no meio do teste, nem como opção, nem como título descritivo do resultado. O nome de aula entra só na linha “Mais próximo de”, debaixo desse título.

O texto que a pessoa lê está no código, em português falado. Os parágrafos de dilema abaixo são o mapa de parâmetros. Onde ainda aparece mina ou inverno, isso é o rascunho do mecanismo; a tela usa porto, lavoura, povoado e acordo.

Rótulos como `monarquista` ou `colonia` existem só nesta página, na coluna “interno”. A UI do teste usa o título descritivo. O resultado acrescenta o nome de aula já escrito em `lib/organizacoes.ts`.

## Princípios

1. **Sem nome taxativo no meio do teste.** A opção descreve um mecanismo (quem senta, até quando, quem pode desfazer). Não oferece “monarquia”, “presidencialismo”, “teocracia”, “república soviética”, “estado corporação”, “colônia” nem equivalentes.
2. **Problema e preço em toda opção.** O mesmo espírito do `hint` / `solves` / `tradeoff` de hoje. Nenhuma opção é a resposta moralmente certa.
3. **Trilha separada dos dez eixos.** Este fluxo não lê nem escreve economia, autoridade, liberdade, igualdade, tradição, ambiente, segurança, global, tecnologia ou corpo. Não muda arquétipo. Meu Estado Ideal é outra página, não um bloco dentro de Meu Perfil.
4. **Parâmetro mudo, título falado.** A conta usa ids internos. A frase que a pessoa lê descreve o arranjo (“uma família manda, mas tem de garantir comida, terra e teto”), não o verbete. No resultado, debaixo dessa frase, a linha “Mais próximo de” mostra o nome de aula e leva a `/organizacoes`.
5. **Fluxograma de verdade.** Nem toda pergunta aparece. Uma resposta abre, pula ou troca o texto da seguinte. O baralho tem 20 nós. Um caminho típico passa por 13 a 16: o tronco que já existia, mais um trilho comum de nove perguntas (princípios, poder, cidadania, religião, burocracia, exército, marinha, segurança interna e justiça) antes do fecho.
6. **Ficção, não o mapa real.** Povoado, porto, lavoura, câmara, família, acordo com quem está de fora. Sem país, partido ou líder do mundo real. Valmora só aparece para deixar claro que este teste é outro lugar. O nome que a pessoa digita não passa pela lista negra.
7. **Empate fica visível.** Se dois centróides ficam perto, o resultado mostra os dois títulos e não finge um vencedor único. O mesmo espírito do “em aberto” atual, agora entre arranjos e não entre opções de uma categoria.

### Lista negra (texto que a pessoa vê)

Não usar nos dilemas nem no título descritivo do resultado: monarquia, rei, rainha, presidencialismo, presidente, parlamentarismo, parlamento, teocracia, teocrata, soviete, soviético, corporativismo, corporação, fascismo, colônia, protetorado, república, democracia, socialismo, comunismo, partido, liberal, ditadura, anarquia. A linha “Mais próximo de” é a exceção: ela repete o nome de aula de `/organizacoes`.

Pode usar: chefe, câmara, linhagem, costume, ofício, conselho, delegado, aldeia, ancião, lei sagrada, prazo, confiança, carta, ramo, base.

“Protetor” como nome de regime fica de fora. No dilema, dizer “um poder de fora que oferece frota”.

## Parâmetros

Dois tipos. **Bipolar** soma inteiros negativos e positivos. **Canal** em geral soma para cima. Uma resposta pode descontar (tutela ou sagrado negativos). Pergunta pulada não é zero informativo no bipolar: entra como “sem evidência” e o centróide daquele eixo não pesa na distância (ver mapeamento). Canal pulado fica 0 — “não foi escolhido”.

| Id | Tipo | − / baixo | + / alto |
| --- | --- | --- | --- |
| `escala` | bipolar | o círculo miúdo (aldeia, clã) | o país como uma regra só |
| `fora` | bipolar | a última palavra mora fora | a última palavra fica aqui |
| `quem` | bipolar | um corpo coletivo | uma pessoa |
| `prazo` | bipolar | cai fácil, prazo curto | dura, difícil de desfazer |
| `queda` | bipolar | a câmara derruba o mando | o mando fica mesmo contra a câmara |
| `voto` | canal | — | um voto contado do país |
| `tradicao` | canal | — | linhagem, costume antigo, nome que já vinha |
| `sagrado` | canal | — | texto sagrado e quem o lê |
| `oficio` | canal | — | cadeira estável do ramo econômico, os dois lados |
| `conselho` | canal | — | delegado de quem trabalha, que a base puxa de volta |
| `parentesco` | canal | — | sangue, ancião, quem se conhece pelo nome |
| `tutela` | canal | — | guerra, moeda ou tratado nas mãos de fora |
| `ordem` | canal | — | continuidade, um mando, o amanhã parecido com o ontem |
| `cuidado` | canal | — | pão, terra, teto de quem está por baixo |
| `plano` | canal | — | quem produz dirige o plano comum |

`fora` e `tutela` não são o mesmo eixo com sinal trocado. Dá para querer a última palavra aqui (`fora` +) e mesmo assim não ser um país (`escala` −): é o círculo miúdo. Dá para aceitar tutela e ainda ter um rosto local (`quem` +).

## Perfis internos

Não aparecem na UI. Servem de centróide. O número é a **soma do percurso canônico** desse perfil (tronco + trilho comum), a mesma soma que o código confere ao carregar. Célula vazia = 0. Se o parâmetro bipolar não foi perguntado nesse percurso, esse eixo sai da distância.

| Interno | `escala` | `fora` | `quem` | `prazo` | `queda` | Canais diferentes de zero |
| --- | --- | --- | --- | --- | --- | --- |
| `monarquista` | +3 | +2 | +8 | +2 | +1 | `tutela` −2, `tradicao` 8, `parentesco` 1, `ordem` 8 |
| `monarquia_social` | +3 | +2 | +8 | +1 | +1 | `tutela` −2, `tradicao` 7, `parentesco` 1, `ordem` 4, `cuidado` 5 |
| `presidencialista` | +3 | +2 | +6 | +1 | +3 | `tutela` −2, `voto` 4, `tradicao` 1, `ordem` 8 |
| `parlamentarista` | +2 | +2 | −6 | −2 | −9 | `tutela` −2, `voto` 6, `ordem` 1 |
| `teocrata` | +3 | +2 | +3 |  | +1 | `tutela` −2, `tradicao` 1, `sagrado` 9, `ordem` 7 |
| `sovietica` | +2 | +2 | −3 | −7 | −1 | `tutela` −2, `conselho` 9, `plano` 7 |
| `corporacao` | +2 | +2 | −3 | +2 | −1 | `tutela` −2, `tradicao` 1, `oficio` 10, `ordem` 6, `plano` 2 |
| `colonia` | +3 | −4 | +2 |  | +2 | `tutela` 13, `ordem` 1 |
| `tribal` | −5 | +3 | −1 | +1 |  | `tradicao` 2, `sagrado` −1, `parentesco` 8, `ordem` 1, `cuidado` 3 |

Diferenças que o mapa precisa guardar:

- `monarquista` e `monarquia_social` compartilham linhagem longa. Separam-se em `ordem` contra `cuidado`.
- `presidencialista` e `parlamentarista` compartilham `voto`. Separam-se em `queda` e `prazo`: um fica até a data; o outro cai com a câmara.
- `sovietica` e `corporacao` falam de trabalho. Uma puxa o delegado de volta e não dá cadeira a quem só é dono. A outra senta os dois lados do ramo e a cadeira dura.
- `colonia` é tutela, não “Estado fraco”. Há país (`escala` +) e última palavra fora.
- `tribal` não é “região com imposto próprio”. É o círculo que se conhece. Região sem clã não basta para este centróide.

### Títulos que a pessoa pode ver

| Interno | Título | Linha de apoio |
| --- | --- | --- |
| `monarquista` | Uma família manda por costume, e é difícil tirar | A família antiga continua no cargo. A regra não muda todo ano. Quem nasce fora dessa família pode passar a vida inteira sem escolher de novo. |
| `monarquia_social` | Uma família manda, mas tem de garantir comida, terra e teto | A família fica no cargo porque cuida de quem está embaixo. Esse cuidado pode virar favor para quem chega perto da família. |
| `presidencialista` | Um chefe fica até a data marcada, e a câmara não tira no meio | Uma pessoa governa até o dia combinado, mesmo se a câmara reclamar. Se errar, o erro fica até essa data. |
| `parlamentarista` | Quem governa cai quando a câmara deixa de confiar | Quem governa vem da câmara e sai no dia em que a câmara tira a confiança. Uma obra longa pode morrer no meio da briga. |
| `teocrata` | A lei sagrada fica acima da lei do dia a dia | A lei do dia a dia só vale até onde o texto sagrado deixa. Quem interpreta o texto é quem manda de verdade. |
| `sovietica` | Quem trabalha manda, e pode trocar o representante fácil | A ordem vem de quem faz o trabalho, não de um gabinete na capital. Um grupo pequeno pode travar a obra, e quem não trabalha na base não tem cadeira. |
| `corporacao` | Os ramos de trabalho mandam, patrão e empregado juntos | No mesmo ramo, quem emprega e quem trabalha sentam na mesma mesa, com alguém por cima. O ramo pode fechar a porta para quem está de fora. |
| `colonia` | Guerra e tratado ficam com quem está de fora; o dia a dia fica aqui | Navio e assinatura de fora não dependem do nosso caixa. Se o acordo mudar, a gente não tem como dizer não. |
| `tribal` | O povoado manda pelo sangue e pelo costume, sem um governo do país | Quem se conhece decide. O que for maior que o povoado é aliança, não um mando só. A regra de um lugar não vale no outro. |

O resultado mostra o título descritivo, a linha “Mais próximo de” com o nome de aula (link para a organização), o problema, o preço, e duas ou três escolhas que mais puxaram aquele centróide (cena + opção + uma frase). Se houver segundo arranjo, ele também leva o nome de aula. A frase de abertura usa o nome do país. Não mostra o id interno, nem a tabela, nem “você é X”.

## Mapa do fluxo

```mermaid
flowchart TD
  n1["N1 unidade"]
  n1 -->|aldeia| n11["N11 circulo"]
  n1 -->|pais ou regiao| n2["N2 fora"]
  n11 --> n2a["N2 fora, fala da aldeia"]
  n2a -->|so o circulo| spine["Trilho comum"]
  n2a -->|guarda de fora| n12["N12 carta"]
  n2 -->|ultima palavra fora| n12
  n2 -->|ultima palavra aqui| n3["N3 fonte"]
  n12 --> n3b["N3 rosto local"]
  n3b --> n7["N7 trabalho"]
  n3 -->|voto| n4["N4 confianca"]
  n3 -->|tradicao| n5["N5 prazo"]
  n3 -->|sagrado| n6["N6 sagrado"]
  n3 -->|trabalho| n7
  n3 -->|parentesco| n11
  n4 --> n7
  n5 -->|vida ou linhagem| n8["N8 dever"]
  n5 -->|prazo marcado ou confianca| n7
  n8 --> n7
  n6 -->|texto trava| spine
  n6 -->|texto so aconselha, vindo do leitor| n4
  n7 --> spine
  n11 -->|leitor do texto| n6
  spine --> n13["N13 principios"]
  n13 --> n14["N14 distribuicao"]
  n14 --> n15["N15 cidadania"]
  n15 --> n16["N16 religiao"]
  n16 --> n17["N17 burocracia"]
  n17 --> n18["N18 exercito"]
  n18 --> n19["N19 marinha"]
  n19 --> n20["N20 seguranca"]
  n20 --> n21["N21 justica"]
  n21 --> n9["N9 fim"]
```

O que antes ia direto para N9 agora entra no trilho comum (N13 a N21) e só então chega em N9. N9 continua sendo a última pergunta. Não há nó depois.

Se N6 = texto só aconselha e a fonte não foi o leitor do texto (caminho do povoado), o fluxo entra no trilho, não volta para N4.

### O que se pula

| Se aconteceu | Pula | Por quê |
| --- | --- | --- |
| N1 = aldeia | N3 nacional, N4, N5, N7, N8 | Não há câmara de país nem cadeira de ofício a perguntar. O círculo já é o mando. |
| N2 = última palavra fora | N4, N5, N6, N8 na forma soberana | Quem cai ou dura aqui não é a pergunta principal. Entra N12 e o rosto local. |
| N4 foi perguntado | não há um N10 “quem muda a regra” | Confiança já disse quem desfaz o mando. |
| N3 = tradição e N5 = vida ou linhagem | N4 | A linhagem não é um gabinete da câmara. O dever (N8) faz o trabalho de separar os dois perfis longos. |
| N6 = lei comum não atravessa o sagrado | N4 e N7 | A câmara e o ofício não revogam o texto. |
| N3 = trabalho e N7 = conselho revogável | N5 | A volta do delegado já é o prazo. |
| N7 = bancas estáveis | N4 | A cadeira não cai com a confiança de uma câmara eleita. N5 curto ainda entra: a cadeira dura com o ramo. |
| N1 = região | nada obrigatório | Região não é clã. Segue o tronco do país, com `escala` um ponto mais baixa. |

Reordenar, não só pular:

- N1 = aldeia põe N11 **antes** de N2. A pessoa fala do círculo antes de falar de frota de fora.
- N3 = parentesco, mesmo depois de ter dito “país” em N1, desvia para N11 e depois entra no trilho comum até N9. A contradição (país na unidade, sangue na fonte) fica no vetor.
- N6 no caminho do círculo só aparece se N11 escolheu o leitor do texto. Aí o fim pode ser lei sagrada de aldeia (`teocrata` com `escala` baixa): os dois entram no topo se a guarda disparar.

Caminho mais curto: aldeia → círculo → recusa a guarda → trilho comum → fim (13 nós). Caminho de voto: unidade → fora → fonte → confiança → trabalho → trilho → fim (15 nós). Caminho de linhagem longa: unidade → fora → fonte → prazo → dever → trabalho → trilho → fim (16 nós). O trilho não se pula. Confiança, prazo, dever, texto, carta e círculo continuam dependendo do tronco.

No resultado, os nós do baralho que o caminho não perguntou aparecem como “Perguntas que ficaram de fora”. A pessoa pode responder ou deixar como está. Cada resposta extra soma os mesmos parâmetros daquela opção, no contexto do caminho já feito, e o arranjo é recalculado. Os dilemas continuam sem nome de regime.

## Trilho comum

Todo caminho completo passa por estes nove nós, nesta ordem, e só então por N9. O texto que a pessoa lê está em `lib/governoFlow.ts`. Aqui ficam o que a pergunta decide e os pesos. Nenhuma opção nomeia regime.

O trilho empurra os mesmos parâmetros de antes. Não cria eixo novo. O centróide de cada perfil é a soma de um percurso canônico, não o desenho curto de quando o teste acabava em N9.

### N13 `principios` — Para que servem as primeiras regras?

O país não cabe tudo nas primeiras regras. Qual fim vem antes dos outros?

| Id | O que muda | Parâmetros | Mole |
| --- | --- | --- | --- |
| `pri_continuidade` | A regra não troca de família a cada susto | `ordem` +1, `tradicao` +1 | `monarquista` +1, `teocrata` +1, `corporacao` +1 |
| `pri_cuidado` | Comida, terra e teto vêm antes | `cuidado` +1 | `monarquia_social` +1, `tribal` +1 |
| `pri_plano` | O plano sai de quem produz | `plano` +1, `conselho` +1 | `sovietica` +1 |
| `pri_abrigo` | Guerra e mercado não ficam só no caixa daqui | `tutela` +1 | `colonia` +1 |
| `pri_troca` | A câmara troca quem governa sem esperar data | `voto` +1, `queda` −1 | `parlamentarista` +1 |

### N14 `distribuicao` — Onde o mando fica de verdade?

No dia em que a decisão trava: uma pessoa, a câmara, cada povoado, ou quem está de fora.

| Id | O que muda | Parâmetros | Mole |
| --- | --- | --- | --- |
| `dist_um` | Uma pessoa segura o cargo; a câmara pode travar a lei, não divide o cargo | `quem` +1, `escala` +1 | `monarquista` +1, `monarquia_social` +1, `presidencialista` +1 |
| `dist_varias` | Ninguém segura o cargo sozinho; a câmara pode tirar quem governa | `quem` −1, `queda` −1 | `parlamentarista` +1, `sovietica` +1 |
| `dist_lugares` | Cada povoado manda na própria praça | `escala` −1 | `tribal` +1 |
| `dist_fora` | Guerra, tratado e a última palavra ficam fora; a rua fica aqui | `tutela` +1, `fora` −1 | `colonia` +1 |

`dist_fora` é o único passo do trilho que mexe em `fora`. Os outros “de fora” só somam `tutela`.

### N15 `cidadania` — Quem recebe o papel de membro?

Morar no país não basta. O papel diz quem vota, quem não pode ser expulso e quem entra no cargo.

| Id | O que muda | Parâmetros | Mole |
| --- | --- | --- | --- |
| `cid_sangue` | Nasce na família e no povoado que já estavam aqui | `parentesco` +1, `tradicao` +1 | `monarquista` +1, `monarquia_social` +1, `tribal` +1 |
| `cid_morador` | Mora aqui e entra na lista; o voto é contado | `voto` +1 | `presidencialista` +1, `parlamentarista` +1 |
| `cid_base` | Trabalha na base e senta no conselho do ramo | `conselho` +1, `plano` +1 | `sovietica` +1 |
| `cid_ramo` | Pertence ao ramo, patrão ou empregado | `oficio` +1 | `corporacao` +1 |
| `cid_texto` | Aceita a lei sagrada e obedece a quem a lê | `sagrado` +1 | `teocrata` +1 |
| `cid_fora` | Quem está de fora confirma o papel | `tutela` +1 | `colonia` +1 |

### N16 `religiao` — O que o caixa e o cargo fazem com a religião?

Não é N6. N6 pergunta se a lei do dia a dia cede ao texto. Esta pergunta é se o caixa paga um culto e se quem lê o texto ganha cadeira.

| Id | O que muda | Parâmetros | Mole |
| --- | --- | --- | --- |
| `rel_acima` | O caixa paga o culto e quem lê senta junto de quem manda | `sagrado` +1, `ordem` +1 | `teocrata` +2 |
| `rel_aconselha` | O culto aconselha, sem cadeira e sem dinheiro do caixa | `sagrado` −1 | `teocrata` −1 |
| `rel_cada` | Cada povoado paga o próprio culto | `sagrado` −1, `escala` −1 | `tribal` +1 |
| `rel_neutro` | O caixa não paga culto e o cargo não pergunta a fé | — | `teocrata` −1 |

### N17 `burocracia` — Quem escreve a lista e cobra o imposto?

O cargo de escrever e cobrar não é o de quem governa. No povoado, o texto fala do livro da praça e da taxa do poço.

| Id | O que muda | Parâmetros | Mole |
| --- | --- | --- | --- |
| `bur_familia` | O cargo passa com o nome da família | `tradicao` +1, `quem` +1 | `monarquista` +1, `monarquia_social` +1 |
| `bur_prova` | Passa numa prova igual; família e voto não escolhem o nome | `ordem` +1, `voto` +1 | `presidencialista` +1, `parlamentarista` +1 |
| `bur_base` | A base manda a pessoa e pode puxá-la de volta | `conselho` +1, `prazo` −1 | `sovietica` +1 |
| `bur_ramo` | Cada ramo cobra o próprio ramo | `oficio` +1 | `corporacao` +1 |
| `bur_fora` | Quem está de fora coloca o nome | `tutela` +1 | `colonia` +1 |
| `bur_texto` | Quem lê a lei sagrada aplica o texto na cobrança | `sagrado` +1 | `teocrata` +1 |
| `bur_povo` | Alguém do sangue do povoado, escolhido na praça | `parentesco` +1 | `tribal` +1 |

### N18 `exercito` — Quem comanda a tropa de terra?

Não é a guarda da rua nem a guarda da praça. É a turma que sai para a guerra.

| Id | O que muda | Parâmetros | Mole |
| --- | --- | --- | --- |
| `ex_chefe` | A mesma pessoa que governa | `quem` +1, `ordem` +1 | `monarquista` +1, `monarquia_social` +1, `presidencialista` +1, `teocrata` +1 |
| `ex_camara` | A câmara manda sair e pode chamar de volta | `quem` −1, `queda` −1 | `parlamentarista` +1 |
| `ex_povo` | Cada povoado manda a própria turma | — | `tribal` +1 |
| `ex_base` | O conselho de quem trabalha, e a base troca o comando | `conselho` +1, `prazo` −1 | `sovietica` +1 |
| `ex_fora` | Quem está de fora decide a saída | `tutela` +1 | `colonia` +1 |
| `ex_ramo` | O ramo de arma e estrada, com alguém acima | `oficio` +1, `ordem` +1 | `corporacao` +1 |

### N19 `marinha` — Quem comanda os barcos e o porto?

Não é a tropa de terra. No povoado, a pergunta é o barco do rio e da costa.

| Id | O que muda | Parâmetros | Mole |
| --- | --- | --- | --- |
| `mar_chefe` | A mesma pessoa que governa | `quem` +1, `ordem` +1 | `monarquista` +1, `monarquia_social` +1, `presidencialista` +1, `teocrata` +1 |
| `mar_camara` | A câmara; barco nenhum sai sem o voto dela | `quem` −1, `queda` −1 | `parlamentarista` +1 |
| `mar_base` | O conselho de quem trabalha no porto | `conselho` +1, `prazo` −1 | `sovietica` +1 |
| `mar_ramo` | O ramo do porto e do estaleiro, os dois lados | `oficio` +1, `ordem` +1 | `corporacao` +1 |
| `mar_povo` | Cada povoado manda os próprios barcos | — | `tribal` +1 |
| `mar_fora` | Quem está de fora | `tutela` +1 | `colonia` +1 |

### N20 `seguranca` — Quem separa a briga na rua?

Não é a tropa de guerra. É quem prende e vigia a rua.

| Id | O que muda | Parâmetros | Mole |
| --- | --- | --- | --- |
| `seg_chefe` | A mesma pessoa que governa | `quem` +1, `ordem` +1 | `monarquista` +1, `monarquia_social` +1, `presidencialista` +1, `teocrata` +1 |
| `seg_povo` | A praça do povoado | `parentesco` +1 | `tribal` +1 |
| `seg_base` | O conselho de quem trabalha | `conselho` +1, `prazo` −1 | `sovietica` +1 |
| `seg_texto` | Quem lê a lei sagrada | `sagrado` +1 | `teocrata` +1 |
| `seg_fora` | Quem está de fora | `tutela` +1 | `colonia` +1 |
| `seg_ramo` | Cada ramo vigia o próprio ramo | `oficio` +1 | `corporacao` +1 |
| `seg_camara` | A câmara | `quem` −1, `queda` −1 | `parlamentarista` +1 |

### N21 `justica` — Quem julga uma briga entre duas pessoas?

Terra, dívida ou ofensa. Quem diz quem tem razão, e a decisão vale.

| Id | O que muda | Parâmetros | Mole |
| --- | --- | --- | --- |
| `ju_costume` | Os mais velhos, pelo costume, sem papel acima da praça | `tradicao` +1 | `monarquista` +1, `monarquia_social` +1, `tribal` +1 |
| `ju_escrita` | Lei escrita, no cargo até a data; a câmara não muda a sentença | `ordem` +1, `queda` +1 | `presidencialista` +1 |
| `ju_camara` | A câmara, ou um grupo que ela desfaz | `quem` −1, `queda` −1 | `parlamentarista` +1 |
| `ju_base` | O conselho do ramo da briga; a base troca quem julga | `conselho` +1, `prazo` −1 | `sovietica` +1 |
| `ju_ramo` | A mesa do ramo, os dois lados, com alguém acima | `oficio` +1 | `corporacao` +1 |
| `ju_texto` | A sentença tem de caber na lei sagrada | `sagrado` +1 | `teocrata` +1 |
| `ju_fora` | A sentença daqui não vale sozinha | `tutela` +1 | `colonia` +1 |

N9 ganhou uma quinta opção, `camara_fim`: guardar o poder da câmara de trocar quem governa. Parâmetros: `queda` −1, `voto` +1. Mole: `parlamentarista` +1. As outras quatro opções de N9 não mudaram de peso.

## As perguntas

Cada opção lista parâmetros (inteiros) e um peso **mole** de perfil. O peso mole não escolhe sozinho. Entra como bônus pequeno na distância (abaixo). O texto que a pessoa lê está no código. Onde esta seção ainda diz “Segue: N9”, leia “entra no trilho comum e depois N9”. Ids em inglês, estáveis.

### N1 `unidade` — Onde a decisão mora?

Sempre a primeira.

Pontal (ou o nome que a pessoa deu) ainda não tem capital nem lei antiga. Tem povoado que só obedece a quem se conhece pelo nome, região com caixa e escola próprios, e gente que quer a mesma regra do porto até o interior. Onde as decisões do dia a dia vão ficar?

**A. `aldeia` — No círculo de quem se conhece pelo nome.** O que houver de maior é aliança, não um mando único.

- Problema: a regra de longe não conhece o inverno daqui.
- Preço: o vale ao lado faz outra lei, e quem chegou de fora não tem voz.
- Parâmetros: `escala` −2, `parentesco` +2, `fora` +1
- Mole: `tribal` +2
- Segue: N11

**B. `regiao` — Na região.** Escola, guarda e parte do imposto ficam perto. O centro só segura a fronteira.

- Problema: clima e língua não são os da capital.
- Preço: a região rica pode recusar partilha.
- Parâmetros: `escala` −1
- Mole: nenhum perfil +2. Não é clã e não é mando único.
- Segue: N2 (fala do país)

**C. `pais` — No país inteiro.** A mesma regra chega na capital e na fronteira.

- Problema: a decisão não muda de vale para vale.
- Preço: o abuso no centro se espalha inteiro.
- Parâmetros: `escala` +2
- Mole: `tribal` −2
- Segue: N2 (fala do país)

### N2 `fora` — A última palavra pode morar fora?

Segunda, com fala diferente.

Fala do país (veio de B ou C em N1): um poder vizinho oferece frota, moeda estável e tratado. Em troca, guerra, alfândega e a assinatura externa passam para lá. Escola, rua e hospital podem ficar aqui.

Fala da aldeia (veio de N11): a aldeia não segura uma guerra longa. O mesmo poder oferece guarda. A praça continuaria de quem já senta nela.

**A. `carta_de_fora` — Aceito a troca.** Guerra e tratado saem daqui. O cotidiano fica.

- Problema: frota e crédito não dependem do nosso inverno.
- Preço: quando a carta muda, não há a quem dizer não.
- Parâmetros: `fora` −2, `tutela` +2, `escala` +1 só se a fala era do país
- Mole: `colonia` +2. Na fala da aldeia, também `tribal` +1 (híbrido).
- Segue: N12

**B. `ultima_aqui` — Não.** Guerra, moeda e tratado ficam aqui, mesmo mais fracos. Na fala da aldeia: aliança só com quem senta no círculo.

- Problema: ninguém de fora reescreve a regra.
- Preço: a frota e o crédito saem do nosso caixa.
- Parâmetros: `fora` +2, `tutela` −2. Na fala da aldeia, `escala` −1 e `parentesco` +1 no lugar do `tutela` −2 (não havia país a defender).
- Mole: `colonia` −2. Na aldeia, `tribal` +1.
- Segue: N3 se a fala era do país. N9 se a fala era da aldeia.

### N3 `fonte` — De onde vem o direito de mandar?

Só no tronco soberano (N2 = última palavra aqui, fala do país). No ramo da carta, a pergunta vira o rosto local (opções D–F abaixo) e vem **depois** de N12.

A câmara, a mina e o culto cabem na mesma capital. Quando os três batem o pé, quem tem o direito de mandar?

**A. `voto_contado` — Um voto contado, de todo o país.**

- Problema: quem perde sabe o tamanho da derrota.
- Preço: meio país obedece a uma maioria de um ano.
- Parâmetros: `voto` +2
- Mole: `presidencialista` +1, `parlamentarista` +1
- Segue: N4

**B. `linhagem` — Um nome que já vinha.** A casa, ou o costume que aponta o seguinte sem abrir urna.

- Problema: o mando não recomeça a cada estação.
- Preço: quem nasceu fora dessa linha não chega lá.
- Parâmetros: `tradicao` +2, `quem` +1
- Mole: `monarquista` +1, `monarquia_social` +1
- Segue: N5

**C. `leitor_do_texto` — Quem lê a lei sagrada** e diz o que ela exige agora.

- Problema: a regra não fica ao sabor do medo de um ano.
- Preço: quem não lê o texto não revoga quem lê.
- Parâmetros: `sagrado` +2
- Mole: `teocrata` +2
- Segue: N6

**D. `rosto_nomeado` — Um rosto daqui, posto e tirado por quem está de fora.** (Só no ramo da carta.)

- Problema: a rua tem a quem procurar.
- Preço: esse rosto não diz não à carta.
- Parâmetros: `quem` +2, `queda` +1, `tutela` +1
- Mole: `colonia` +2
- Segue: N7, depois N9

**E. `rosto_com_prazo` — Um rosto daqui, escolhido aqui, com data para sair.** A carta de fora segue valendo por cima. (Só no ramo da carta.)

- Problema: o cotidiano troca de chefe sem esperar o de fora.
- Preço: a data local não muda a guerra nem o tratado.
- Parâmetros: `quem` +1, `voto` +1, `prazo` +1, `tutela` +1
- Mole: `colonia` +1, `presidencialista` +1
- Segue: N7, depois N9

**F. `rosto_camara` — O rosto local cai se a câmara daqui retirar a confiança.** A carta segue por cima. (Só no ramo da carta.)

- Problema: a casa local corrige quem administra a rua.
- Preço: a carta não cai junto.
- Parâmetros: `quem` −1, `queda` −2, `voto` +1, `tutela` +1
- Mole: `colonia` +1, `parlamentarista` +1
- Segue: N7, depois N9

**G. `de_quem_trabalha` — De quem trabalha na atividade**, não de um voto geral nem de um nome antigo.

- Problema: quem não põe a mão na coisa não desenha a regra dela.
- Preço: quem está fora da atividade fica sem cadeira.
- Parâmetros: `plano` +1
- Mole: `sovietica` +1, `corporacao` +1
- Segue: N7

**H. `mesmo_sangue` — De quem é do mesmo sangue e da mesma aldeia**, mesmo que a unidade lá atrás tenha sido o país.

- Problema: o mando não é um estranho com carimbo.
- Preço: o país que se disse inteiro não cabe nessa regra.
- Parâmetros: `parentesco` +2, `escala` −1
- Mole: `tribal` +2
- Segue: N11, depois N9. Não pergunta N4.

### N4 `confianca` — O mando cai se a câmara retirar a confiança?

Depois de N3 = voto. Também depois de N6 se o sagrado só aconselha.

A câmara e o chefe deixaram de se falar. A obra no rio está no meio. O que acontece com quem governa?

**A. `cai` — Cai.** O governo só dura enquanto a câmara confia. Outro nome, saído dessa casa, segue a obra ou a enterra.

- Problema: o mando que perdeu a casa não fica até o estrago completar.
- Preço: a obra longa não atravessa a briga.
- Parâmetros: `quem` −1, `prazo` −2, `queda` −2
- Mole: `parlamentarista` +2, `presidencialista` −2
- Segue: N7

**B. `fica_ate_a_data` — Não cai.** Houve uma escolha com data. A pessoa fica até lá. A câmara pode travar a lei, não o cargo.

- Problema: o programa eleito não morre numa moção.
- Preço: o erro dura até a data.
- Parâmetros: `quem` +2, `prazo` +1, `queda` +2
- Mole: `presidencialista` +2, `parlamentarista` −2
- Segue: N7

**C. `a_casa_governa` — Não há chefe separado.** A própria câmara governa por um grupo que ela desfaz quando quiser.

- Problema: não existe um mando ao lado da casa, disputando com ela.
- Preço: ninguém responde sozinho quando a obra para.
- Parâmetros: `quem` −2, `prazo` −1, `queda` −2, `voto` +1
- Mole: `parlamentarista` +1, `sovietica` +1
- Segue: N7

### N5 `prazo` — Até quando dura quem manda?

Depois de N3 = linhagem. Versão curta também depois de N7 = bancas (a cadeira dura com o ramo, não com a pessoa): nesse caso só as opções A e D fazem sentido; B e C não são oferecidas.

O nome já está no cargo. A mina pede uma obra de vinte anos. Até quando esse mando dura?

**A. `enquanto_confiam` — Enquanto a confiança durar.** Um círculo estreito, não o país inteiro, pode trocar o nome.

- Problema: a linhagem segue, a pessoa não é eterna.
- Preço: o círculo estreito vira o verdadeiro cargo.
- Parâmetros: `prazo` −1, `quem` 0, `tradicao` +1
- Mole: `monarquista` +0 (não empurra os dois perfis longos)
- Segue: N7. Não passa em N8.

**B. `prazo_marcado` — Um prazo marcado, e depois sai.** O seguinte pode ser de outra casa.

- Problema: dá para contar o fim.
- Preço: vinte anos de mina não cabem num prazo curto. Quem espera herdar não constrói.
- Parâmetros: `prazo` +1, `quem` +1, `voto` +1
- Mole: `presidencialista` +1, `monarquista` −1
- Segue: N7. Não passa em N8.

**C. `vida_ou_linha` — A vida inteira, e depois quem a linha já aponta.**

- Problema: o desenho sobrevive a quem está vivo.
- Preço: uma geração inteira não escolhe de novo.
- Parâmetros: `prazo` +2, `quem` +2, `queda` +1, `tradicao` +1
- Mole: `monarquista` +1, `monarquia_social` +1
- Segue: N8

**D. `cadeira_do_ramo` — A cadeira não é de pessoa.** Dura enquanto o ramo existir. (Oferecida no caminho das bancas, e também aqui como recusa da linhagem.)

- Problema: o ofício não depende do herdeiro.
- Preço: o ramo que sentou não sai quando o país muda de ideia.
- Parâmetros: `oficio` +2, `prazo` +1, `quem` −1
- Mole: `corporacao` +2, `monarquista` −1
- Segue: N7 se ainda não foi perguntado; senão N9.

### N6 `sagrado` — A lei comum pode atravessar o sagrado?

Depois de N3 = leitor do texto. Também se N11 escolheu o leitor: aí a “lei comum” é o costume da aldeia, e o texto pode ser de fora do vale.

A lei sagrada proíbe o que a maioria, ou o ancião, agora quer permitir. Quem cede?

**A. `texto_trava` — A lei comum cede.** Quem guarda o texto trava a mudança.

- Problema: um susto não risca o que foi posto acima da maioria.
- Preço: o intérprete vira o cargo, e o texto não envelhece em público.
- Parâmetros: `sagrado` +2, `queda` +1, `ordem` +1
- Mole: `teocrata` +2
- Segue: N9. Pula N4 e N7.

**B. `texto_aconselha` — O texto aconselha.** Se a câmara, ou o círculo, insistir, a lei comum passa.

- Problema: o culto não congela o país.
- Preço: o que era chão vira opinião.
- Parâmetros: `sagrado` −1 (desconta um dos +2 da fonte; o chão não era tão alto)
- Mole: `teocrata` −2
- Segue: N4 se veio do país. N9 se veio da aldeia.

**C. `culto_miudo` — Cada grupo guarda o próprio culto.** Não tem um texto só para o país inteiro.

- Problema: o vale não reza a regra do vizinho.
- Preço: não existe um chão comum quando os círculos se encontram.
- Parâmetros: `sagrado` −1, `escala` −1
- Mole: `teocrata` −1, `tribal` +1
- Segue: N9 se veio da aldeia. N4 se veio do país.

### N7 `trabalho` — O trabalho ganha cadeira?

No tronco soberano: depois de N4, ou depois de N5/N8, ou imediatamente se N3 = de quem trabalha. No ramo da carta: depois do rosto local, em versão curta (as cadeiras são daqui ou estão escritas na carta?).

A mina, o porto e o hospital querem sentar quando se escreve a regra do ramo. Hoje quem senta veio do voto, do nome ou da carta.

**A. `base_puxa` — Conselho de quem trabalha.** O delegado volta quando a base puxa. Quem só é dono não tem cadeira própria.

- Problema: o plano sai de quem faz, não de um gabinete que nunca desceu a mina.
- Preço: a minoria do ofício não senta, e o plano miúdo trava o rio.
- Parâmetros: `conselho` +2, `quem` −2, `prazo` −2, `plano` +2
- Mole: `sovietica` +2, `corporacao` −1
- Segue: N9. Se este nó foi a resposta de N3, não pergunta N5.

**B. `dois_lados` — Banca do ramo, os dois lados.** Quem emprega e quem trabalha sentam juntos. A cadeira dura com o ramo. Alguém acima coordena para os ramos não se quebrarem.

- Problema: o conflito do ramo tem uma mesa, não uma guerra.
- Preço: o ramo vira feudo, e quem está de fora da banca não entra.
- Parâmetros: `oficio` +2, `prazo` +1, `quem` −1, `ordem` +1, `plano` +1
- Mole: `corporacao` +2, `sovietica` −1
- Segue: N5 na versão curta, se N5 ainda não foi perguntado. Senão N9.

**C. `trabalho_nao_senta` — O trabalho não dá cadeira.** Cadeira vem do voto, da linhagem ou da carta. O ramo fala como qualquer um.

- Problema: o ofício não vira um segundo país.
- Preço: quem faz a coisa obedece a quem nunca a fez.
- Parâmetros: nenhum canal de trabalho
- Mole: `sovietica` −1, `corporacao` −1
- Segue: N9

### N8 `dever` — O que a linhagem deve a quem vive dela?

Só depois de N5 = vida ou linha.

A casa está no mando há gerações. O inverno queimou a colheita. Há quem diga que o título basta, e quem diga que o título sem pão é só um nome.

**A. `continuidade` — Deve a continuidade.** A lei antiga e a linha. Pão é consequência, não a razão do título.

- Problema: o desenho não se rende a um inverno.
- Preço: a fome não tira o mando.
- Parâmetros: `ordem` +2, `cuidado` 0, `tradicao` +1
- Mole: `monarquista` +2, `monarquia_social` −1
- Segue: N7

**B. `pao_e_terra` — Deve pão, terra e teto.** Se o cuidado não chega, o próprio costume acusa o nome. A linha fica; o ocupante pode ser trocado por outro da mesma linha.

- Problema: o título se explica pelo que chega à mesa.
- Preço: o cuidado vira favor de quem alcança o ouvido da casa.
- Parâmetros: `cuidado` +2, `ordem` +1, `tradicao` +1, `prazo` −1 (a pessoa sai; a linha fica)
- Mole: `monarquia_social` +2, `monarquista` −1
- Segue: N7

**C. `so_a_forca` — Não deve conta.** Segura quem puder segurar.

- Problema: a decisão não espera um julgamento do costume.
- Preço: não há acusação interna quando o mando erra. Só a ruptura.
- Parâmetros: `ordem` +1, `tradicao` −1, `queda` +1
- Mole: `monarquista` −1, `monarquia_social` −1
- Segue: N7. Este caminho tende a ficar longe dos dois centróides longos; o secundário pode abrir.

### N9 `fim` — Para que serve o mando?

Sempre o último nó do caminho. A fala usa o que já se sabe (aldeia, carta ou país), a pergunta é a mesma.

O inverno, a mina e a fronteira pedem uma razão. Se o mando só pudesse guardar uma, qual seria?

**A. `continuidade_fim` — Que o amanhã se pareça com o que já se sustentou.**

- Problema: o país, ou o círculo, não se reinventa a cada susto.
- Preço: o que já não cabe continua de pé.
- Parâmetros: `ordem` +2
- Mole: `monarquista` +1, `corporacao` +1, `teocrata` +1

**B. `cuidado_fim` — Que pão, terra e teto cheguem a quem está por baixo.**

- Problema: a regra se mede na mesa, não só no selo.
- Preço: quem distribui escolhe o favorecido.
- Parâmetros: `cuidado` +2
- Mole: `monarquia_social` +1, `tribal` +1

**C. `plano_fim` — Que quem produz dirija o plano**, e não um dono ou um gabinete distante.

- Problema: a meta sai do chão da atividade.
- Preço: quem não está na atividade não vota o plano.
- Parâmetros: `plano` +2, `conselho` +1
- Mole: `sovietica` +1

**D. `abrigo_fim` — Que a guerra e o mercado não nos engulam**, mesmo que a assinatura seja de fora.

- Problema: sobreviver pesa mais do que escrever sozinho o tratado.
- Preço: a razão do mando deixa de ser daqui.
- Parâmetros: `tutela` +1, `ordem` +1
- Mole: `colonia` +1

Não há próxima pergunta.

### N11 `circulo` — Quem conta no círculo miúdo?

Logo depois de N1 = aldeia, **antes** de N2. Também depois de N3 = mesmo sangue, e nesse caso N2 já passou: segue para N9, a menos que a opção B abaixo abra N6.

O círculo vai decidir a água do poço. Nem todo mundo que bebe a água nasceu ali.

**A. `anciãos` — Contam os mais velhos do sangue.** Quem chegou depois ouve, não decide.

- Problema: a memória do poço está em quem viu os outros invernos.
- Preço: o novo não decide, mesmo que o poço seja a água dele.
- Parâmetros: `parentesco` +2, `quem` −1, `prazo` +1, `ordem` +1
- Mole: `tribal` +2
- Segue: N2 na fala da aldeia, se N2 ainda não veio. Senão N9.

**B. `leitor_no_circulo` — Conta quem lê o texto sagrado do círculo**, mesmo sem ser do sangue.

- Problema: o costume ganha um chão que não é só a família.
- Preço: o leitor vem de fora do sangue e pode não sair.
- Parâmetros: `sagrado` +2, `parentesco` −1
- Mole: `teocrata` +2, `tribal` −1
- Segue: N6, com a fala da aldeia.

**C. `qualquer_do_vale` — Conta quem vive no vale agora**, sangue ou não. O mais velho fala primeiro, não fala sozinho.

- Problema: quem bebe a água tem voz.
- Preço: um inverno de chegantes muda a regra do poço.
- Parâmetros: `parentesco` +1, `quem` −1, `prazo` −1
- Mole: `tribal` +1
- Segue: como a opção A.

### N12 `carta` — Quem segura a carta de fora?

Só depois de N2 = carta de fora. Antes do rosto local.

A carta está assinada. A mina quer uma taxa nova. Quem pode rasgar ou reescrever isso?

**A. `so_de_fora` — Só quem está de fora.** A câmara daqui administra a rua e não toca na carta.

- Problema: a frota não fica refém de uma briga local.
- Preço: a taxa da mina muda sem o nosso selo.
- Parâmetros: `tutela` +2, `queda` +1, `fora` −1
- Mole: `colonia` +2
- Segue: N3, opções de rosto (D, E ou F).

**B. `os_dois` — Os dois lados.** Guerra e tratado mudam só se os dois assinarem. O cotidiano é daqui.

- Problema: não há surpresa na carta, nem bloqueio local na frota.
- Preço: o impasse não tem dono. A mina espera.
- Parâmetros: `tutela` +1, `fora` −1, `queda` −1
- Mole: `colonia` +1
- Segue: N3, opções de rosto.

**C. `saio_da_carta` — A carta era um empréstimo.** Neste caso rasgo e fico com a última palavra, mesmo sem a frota.

- Problema: a assinatura volta para cá.
- Preço: a oferta de fora acaba no dia seguinte.
- Parâmetros: `tutela` −2, `fora` +2 (desconta o aceite de N2; o autor trata os dois nós juntos e o saldo de `fora` pode ficar 0)
- Mole: `colonia` −2
- Segue: N3 completo (voto, linhagem, texto, trabalho, sangue), não só o rosto. O ramo da carta foi abandonado.

## Como fechar a conta

Isto é regra de desenho, não código.

1. Somar os inteiros dos nós **perguntados**.
2. Bipolar não perguntado fica “vazio”, não zero. Na distância de um perfil, um eixo bipolar vazio **não entra**. Canal vazio entra como 0, porque “não escolheu esse chão” é informação.
3. Cada perfil tem um centróide na tabela acima. Distância = raiz da soma dos quadrados das diferenças, só nos eixos que entram.
4. Bônus mole: para cada perfil, `distância −= 0,15 × (soma dos pesos moles daquele perfil no caminho)`. O bônus desempata. Não cobre um centróide longe.
5. Guardas, aplicadas **depois** do bônus, antes de cravar o par:
   - `tutela` ≥ 2 e `fora` ≤ −1 → `colonia` entra no par do topo. Se não for o mais perto, vira o segundo e empurra o antigo segundo para fora. Se já for o mais perto, o segundo segue a distância.
   - `escala` ≤ −2 e `parentesco` ≥ 2 → `tribal` entra no par, pela mesma regra.
   - `sagrado` ≥ 2 e a pessoa escolheu `texto_trava` → `teocrata` entra no par.
   - `conselho` ≥ 2 e `prazo` ≤ −1 → `sovietica` entra no par.
   - `oficio` ≥ 2 e `conselho` < 1 → `corporacao` entra no par.
   - Duas guardas ao mesmo tempo: o topo são esses dois perfis, o mais perto em primeiro. Não se mostra um terceiro.
6. **Principal** = menor distância depois das guardas.
7. **Segundo** aparece se a distância do segundo for menor que `1,25 ×` a do primeiro. Senão o resultado é um arranjo só.
8. Se mesmo assim os dois primeiros ficam a menos de 10% um do outro (`d2 − d1 < 0,1 × d1`), os dois títulos vão lado a lado, com a frase: “Ficou perto. Os dois arranjos cabem nas suas escolhas. Nenhum leva sozinho.” Não se escolhe um no escuro.
9. A tela mostra título, linha de apoio, problema e preço já escritos na tabela, e até três respostas que mais reduziram a distância desse centróide. Sem id interno. Sem lista negra.

O perfil mole e o centróide podem divergir. Vale o centróide, com o bônus e as guardas. Se um caminho de revisão cair num título absurdo, o ajuste é o centróide ou a guarda — não um nome mostrado no meio do dilema.

O que este mapa **não** faz: não produz os dez eixos, não lê as 40 cenas, não reaproveita o `leans` das cinco categorias atuais como se fosse este vetor. Categorias de hoje (contenção, condução, limites, papel econômico, centro e força) descrevem a máquina administrativa. Estes parâmetros descrevem a forma do mando. Um passe futuro pode cruzar os dois. Este desenho não cruza.

## Percursos que o código confere

Ao carregar, `lib/governoFlow.ts` caminha estes nove percursos e exige um título só, sem segundo lugar. A soma de cada um é a linha do centróide. O tronco abaixo é o que muda; o trilho é o da tabela de N13 a N21.

| Perfil | Tronco, nesta ordem | Trilho, nesta ordem | Fecho |
| --- | --- | --- | --- |
| `tribal` | `aldeia`, `anciaos`, `ultima_aqui` | `pri_cuidado`, `dist_lugares`, `cid_sangue`, `rel_cada`, `bur_povo`, `ex_povo`, `mar_povo`, `seg_povo`, `ju_costume` | `cuidado_fim` |
| `colonia` | `pais`, `carta_de_fora`, `so_de_fora`, `rosto_nomeado`, `trabalho_nao_senta` | `pri_abrigo`, `dist_fora`, `cid_fora`, `rel_neutro`, `bur_fora`, `ex_fora`, `mar_fora`, `seg_fora`, `ju_fora` | `abrigo_fim` |
| `presidencialista` | `pais`, `ultima_aqui`, `voto_contado`, `fica_ate_a_data`, `trabalho_nao_senta` | `pri_continuidade`, `dist_um`, `cid_morador`, `rel_neutro`, `bur_prova`, `ex_chefe`, `mar_chefe`, `seg_chefe`, `ju_escrita` | `continuidade_fim` |
| `monarquia_social` | `pais`, `ultima_aqui`, `linhagem`, `vida_ou_linha`, `pao_e_terra`, `trabalho_nao_senta` | `pri_cuidado`, `dist_um`, `cid_sangue`, `rel_neutro`, `bur_familia`, `ex_chefe`, `mar_chefe`, `seg_chefe`, `ju_costume` | `cuidado_fim` |
| `monarquista` | o mesmo tronco, com `continuidade` no lugar de `pao_e_terra` | o mesmo trilho, com `pri_continuidade` no lugar de `pri_cuidado` | `continuidade_fim` |
| `teocrata` | `pais`, `ultima_aqui`, `leitor_do_texto`, `texto_trava` | `pri_continuidade`, `dist_um`, `cid_texto`, `rel_acima`, `bur_texto`, `ex_chefe`, `mar_chefe`, `seg_texto`, `ju_texto` | `continuidade_fim` |
| `sovietica` | `pais`, `ultima_aqui`, `de_quem_trabalha`, `base_puxa` | `pri_plano`, `dist_varias`, `cid_base`, `rel_neutro`, `bur_base`, `ex_base`, `mar_base`, `seg_base`, `ju_base` | `plano_fim` |
| `corporacao` | `pais`, `ultima_aqui`, `de_quem_trabalha`, `dois_lados`, `cadeira_do_ramo` | `pri_continuidade`, `dist_varias`, `cid_ramo`, `rel_neutro`, `bur_ramo`, `ex_ramo`, `mar_ramo`, `seg_ramo`, `ju_ramo` | `continuidade_fim` |
| `parlamentarista` | `pais`, `ultima_aqui`, `voto_contado`, `cai`, `trabalho_nao_senta` | `pri_troca`, `dist_varias`, `cid_morador`, `rel_neutro`, `bur_prova`, `ex_camara`, `mar_camara`, `seg_camara`, `ju_camara` | `camara_fim` |

`monarquista` e `monarquia_social` continuam se separando no dever da família (N8), no princípio (N13) e no fecho. O resto do trilho, nesses dois percursos, é o mesmo.

## Fora deste mapa

- Não ligar estes parâmetros aos dez eixos.
- Não resolver o híbrido “rosto com prazo debaixo de uma carta de fora” com um perfil novo. O desenho prefere dois títulos perto um do outro a inventar um décimo rótulo interno.

O teste jogável segue este arquivo. O encaixe na home, em Meu Perfil e em Meu Estado Ideal está em [`governo-ideal.md`](./governo-ideal.md).
