/**
 * Ideal-government flowchart.
 * Source of truth: docs/governo-ideal-fluxograma.md.
 * Axis scoring does not import this module.
 *
 * Internal profile ids stay in this file. The result object sent to the UI
 * carries Portuguese titles only.
 */

import type { InProgressStatus } from "@/lib/storage";

export const DEFAULT_COUNTRY_NAME = "Pontal";
export const COUNTRY_NAME_TITLE = "Como vai se chamar o país?";
export const COUNTRY_NAME_BODY =
  "Um grupo chegou numa costa nova, longe de Valmora, para escrever as primeiras regras. Ainda não tem capital nem lei antiga. Pode ficar com o nome sugerido ou escrever outro.";
export const COUNTRY_NAME_BUTTON = "Começar com esse nome";
export const GOVERNMENT_RESULT_TITLE = "Seu governo ideal";
export const NEAR_TIE_LINE =
  "Ficou perto. Os dois arranjos cabem no que você escolheu. Nenhum leva sozinho.";

const COUNTRY_NAME_MAX = 40;

/** Empty or messy input falls back to the suggested name. */
export function sanitizeCountryName(value: string | null | undefined): string {
  const cleaned = (value ?? "")
    .replace(/[\u0000-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, COUNTRY_NAME_MAX);
  return cleaned || DEFAULT_COUNTRY_NAME;
}

export function governmentResultLead(countryName: string): string {
  const name = sanitizeCountryName(countryName);
  return `É o arranjo que essas escolhas desenham para ${name}. Não entra no perfil dos dez eixos e não põe nome de regime.`;
}

const MOLE_BONUS = 0.15;
const SECONDARY_RATIO = 1.25;
const NEAR_TIE_RATIO = 0.1;

const BIPOLAR = ["escala", "fora", "quem", "prazo", "queda"] as const;
const CHANNELS = [
  "voto",
  "tradicao",
  "sagrado",
  "oficio",
  "conselho",
  "parentesco",
  "tutela",
  "ordem",
  "cuidado",
  "plano",
] as const;

type BipolarId = (typeof BIPOLAR)[number];
type ChannelId = (typeof CHANNELS)[number];
type ParamId = BipolarId | ChannelId;

const PROFILE_IDS = [
  "monarquista",
  "monarquia_social",
  "presidencialista",
  "parlamentarista",
  "teocrata",
  "sovietica",
  "corporacao",
  "colonia",
  "tribal",
] as const;

type ProfileId = (typeof PROFILE_IDS)[number];

const NODE_IDS = [
  "unidade",
  "fora",
  "fonte",
  "confianca",
  "prazo",
  "sagrado",
  "trabalho",
  "dever",
  "fim",
  "circulo",
  "carta",
] as const;

type NodeId = (typeof NODE_IDS)[number];

type Delta = Partial<Record<ParamId, number>>;
type Mole = Partial<Record<ProfileId, number>>;

interface Copy {
  label: string;
  problem: string;
  cost: string;
}

interface ProfileCopy {
  title: string;
  support: string;
  problem: string;
  cost: string;
  centroid: Delta;
}

export interface GovernmentDriver {
  sceneTitle: string;
  choiceLabel: string;
  sentence: string;
}

export interface GovernmentArrangement {
  title: string;
  support: string;
  problem: string;
  cost: string;
  drivers: GovernmentDriver[];
}

export interface GovernmentResult {
  primary: GovernmentArrangement;
  secondary: GovernmentArrangement | null;
  nearTie: boolean;
}

export interface FlowChoice {
  id: string;
  label: string;
  hint: string;
}

export interface FlowScene {
  id: string;
  title: string;
  body: string;
  choices: FlowChoice[];
}

interface Step {
  node: NodeId;
  choiceId: string;
  params: Delta;
  mole: Mole;
  sceneTitle: string;
  choiceLabel: string;
  sentence: string;
}

interface Walk {
  ok: boolean;
  steps: Step[];
  next: NodeId | null;
  complete: boolean;
}

const PROFILE_COPY: Record<ProfileId, ProfileCopy> = {
  monarquista: {
    title: "Uma família no mando, por costume, difícil de desfazer",
    support:
      "A família antiga continua. A regra não muda todo ano. Uma geração inteira pode ficar presa nesse desenho.",
    problem: "A família antiga continua. A regra não muda todo ano.",
    cost: "Uma geração inteira pode ficar presa nesse desenho.",
    centroid: {
      escala: 2,
      fora: 2,
      quem: 2,
      prazo: 2,
      queda: 1,
      tradicao: 2,
      ordem: 2,
    },
  },
  monarquia_social: {
    title: "Uma família no mando, com dever de comida, terra e teto",
    support:
      "A família fica, e o cargo se explica pelo cuidado com quem está embaixo. Esse cuidado pode virar favor para quem chega perto.",
    problem: "A família fica, e o cargo se explica pelo cuidado com quem está embaixo.",
    cost: "Esse cuidado pode virar favor para quem chega perto.",
    centroid: {
      escala: 2,
      fora: 2,
      quem: 2,
      prazo: 2,
      queda: 1,
      tradicao: 2,
      cuidado: 2,
      ordem: 1,
    },
  },
  presidencialista: {
    title: "Um chefe com data para sair, que a câmara não derruba no meio",
    support:
      "Uma pessoa governa até a data, mesmo se a câmara reclamar. O erro dura até essa data.",
    problem: "Uma pessoa governa até a data, mesmo se a câmara reclamar.",
    cost: "O erro dura até essa data.",
    centroid: {
      escala: 2,
      fora: 2,
      quem: 2,
      prazo: 1,
      queda: 2,
      voto: 2,
      ordem: 1,
    },
  },
  parlamentarista: {
    title: "Um governo que cai quando a câmara tira a confiança",
    support:
      "Quem governa sai da câmara e sai quando a câmara deixa de confiar. Obra longa não atravessa a briga.",
    problem: "Quem governa sai da câmara e sai quando a câmara deixa de confiar.",
    cost: "Obra longa não atravessa a briga.",
    centroid: {
      escala: 2,
      fora: 2,
      quem: -1,
      prazo: -2,
      queda: -2,
      voto: 2,
    },
  },
  teocrata: {
    title: "A lei sagrada acima da lei comum",
    support:
      "A lei comum só vai até onde o texto sagrado deixa. Quem lê o texto vira o cargo.",
    problem: "A lei comum só vai até onde o texto sagrado deixa.",
    cost: "Quem lê o texto vira o cargo.",
    centroid: {
      escala: 1,
      fora: 2,
      quem: 0,
      prazo: 1,
      queda: 1,
      sagrado: 2,
      ordem: 2,
    },
  },
  sovietica: {
    title: "Conselhos de quem trabalha, com o delegado fácil de trocar",
    support:
      "O mando sobe de quem faz o trabalho, não desce da capital. O plano miúdo emperra, e quem não está na base não senta.",
    problem: "O mando sobe de quem faz o trabalho, não desce da capital.",
    cost: "O plano miúdo emperra, e quem não está na base não senta.",
    centroid: {
      escala: 1,
      fora: 2,
      quem: -2,
      prazo: -2,
      queda: -1,
      conselho: 2,
      plano: 2,
    },
  },
  corporacao: {
    title: "Os ramos de trabalho no mando, os dois lados juntos",
    support:
      "Quem produz e quem emprega no mesmo ramo sentam juntos, com alguém coordenando. O ramo pode virar feudo.",
    problem:
      "Quem produz e quem emprega no mesmo ramo sentam juntos, com alguém coordenando.",
    cost: "O ramo pode virar feudo.",
    centroid: {
      escala: 2,
      fora: 2,
      quem: -1,
      prazo: 1,
      queda: 1,
      oficio: 2,
      ordem: 2,
      plano: 1,
    },
  },
  colonia: {
    title: "Guerra e tratado na mão de quem está de fora; o dia a dia fica aqui",
    support:
      "Navio e assinatura de fora não dependem do nosso caixa. Quando o acordo muda, não tem como dizer não.",
    problem: "Navio e assinatura de fora não dependem do nosso caixa.",
    cost: "Quando o acordo muda, não tem como dizer não.",
    centroid: {
      escala: 1,
      fora: -2,
      quem: 1,
      prazo: 1,
      queda: 1,
      tutela: 2,
      ordem: 1,
    },
  },
  tribal: {
    title: "O grupo do sangue e do costume, sem máquina de país",
    support:
      "O povoado decide. O que for maior que isso é aliança, não um mando único. A regra muda de um lugar para o outro.",
    problem:
      "O povoado decide. O que for maior que isso é aliança, não um mando único.",
    cost: "A regra muda de um lugar para o outro.",
    centroid: {
      escala: -2,
      fora: 1,
      quem: -1,
      prazo: 1,
      queda: 0,
      parentesco: 2,
      ordem: 1,
      cuidado: 1,
    },
  },
};

const NODE_TITLE: Record<NodeId, string> = {
  unidade: "Onde a decisão fica?",
  fora: "A última palavra pode ficar com gente de fora?",
  fonte: "De onde vem o direito de mandar?",
  confianca: "Quem governa cai se a câmara tirar a confiança?",
  prazo: "Até quando dura quem manda?",
  sagrado: "A lei comum pode passar por cima do sagrado?",
  trabalho: "O trabalho ganha cadeira?",
  dever: "O que a família no mando deve a quem vive com ela?",
  fim: "Para que serve mandar?",
  circulo: "Quem conta no grupo pequeno?",
  carta: "Quem segura o acordo com quem está de fora?",
};

const NODE_OPTIONS: Record<NodeId, readonly string[]> = {
  unidade: ["aldeia", "regiao", "pais"],
  fora: ["carta_de_fora", "ultima_aqui"],
  fonte: [
    "voto_contado",
    "linhagem",
    "leitor_do_texto",
    "rosto_nomeado",
    "rosto_com_prazo",
    "rosto_camara",
    "de_quem_trabalha",
    "mesmo_sangue",
  ],
  confianca: ["cai", "fica_ate_a_data", "a_casa_governa"],
  prazo: ["enquanto_confiam", "prazo_marcado", "vida_ou_linha", "cadeira_do_ramo"],
  sagrado: ["texto_trava", "texto_aconselha", "culto_miudo"],
  trabalho: ["base_puxa", "dois_lados", "trabalho_nao_senta"],
  dever: ["continuidade", "pao_e_terra", "so_a_forca"],
  fim: ["continuidade_fim", "cuidado_fim", "plano_fim", "abrigo_fim"],
  circulo: ["anciaos", "leitor_no_circulo", "qualquer_do_vale"],
  carta: ["so_de_fora", "os_dois", "saio_da_carta"],
};

const COPY: Record<string, Copy> = {
  aldeia: {
    label:
      "No grupo de quem se conhece pelo nome. O que for maior que isso é aliança, não um mando só.",
    problem: "A regra de longe não conhece a vida daqui.",
    cost: "O povoado ao lado faz outra lei, e quem chegou de fora não tem voz.",
  },
  regiao: {
    label:
      "Na região. Escola, guarda e parte do imposto ficam perto. O centro só cuida da fronteira.",
    problem: "O clima e o jeito de falar não são os da capital.",
    cost: "A região rica pode recusar dividir o que tem.",
  },
  pais: {
    label: "No país inteiro. A mesma regra vale na capital e na fronteira.",
    problem: "A decisão não muda de um lugar para o outro.",
    cost: "Um abuso no centro se espalha para todo mundo.",
  },
  carta_de_fora: {
    label: "Aceito a troca. Guerra e tratado saem daqui. O dia a dia fica.",
    problem: "Navio e crédito não dependem do nosso ano ruim.",
    cost: "Quando o acordo muda, não tem a quem dizer não.",
  },
  ultima_aqui: {
    label: "Não. Guerra, moeda e tratado ficam aqui, mesmo mais fracos.",
    problem: "Ninguém de fora reescreve a regra.",
    cost: "O navio e o crédito saem do nosso caixa.",
  },
  voto_contado: {
    label: "Um voto contado, do país inteiro.",
    problem: "Quem perde sabe o tamanho da derrota.",
    cost: "Metade do país obedece a uma maioria de um ano.",
  },
  linhagem: {
    label:
      "Um nome que já vem de antes. A família, ou o costume, aponta o próximo sem eleição.",
    problem: "O mando não recomeça toda estação.",
    cost: "Quem nasceu fora dessa família não chega lá.",
  },
  leitor_do_texto: {
    label: "Quem lê a lei sagrada e diz o que ela pede agora.",
    problem: "A regra não fica na mão do medo de um ano.",
    cost: "Quem não lê o texto não tira quem lê.",
  },
  rosto_nomeado: {
    label: "Uma pessoa daqui, colocada e tirada por quem está de fora.",
    problem: "A rua tem a quem procurar.",
    cost: "Essa pessoa não diz não ao acordo.",
  },
  rosto_com_prazo: {
    label:
      "Uma pessoa daqui, escolhida aqui, com data para sair. O acordo de fora continua valendo por cima.",
    problem: "O dia a dia troca de chefe sem esperar quem está de fora.",
    cost: "A data daqui não muda a guerra nem o tratado.",
  },
  rosto_camara: {
    label:
      "A pessoa daqui cai se a câmara tirar a confiança. O acordo continua por cima.",
    problem: "A câmara daqui corrige quem cuida da rua.",
    cost: "O acordo não cai junto.",
  },
  de_quem_trabalha: {
    label:
      "De quem trabalha na atividade, não de um voto geral nem de um nome antigo.",
    problem: "Quem não põe a mão na coisa não escreve a regra dela.",
    cost: "Quem está fora da atividade fica sem cadeira.",
  },
  mesmo_sangue: {
    label:
      "De quem é do mesmo sangue e do mesmo povoado, mesmo que antes a gente tenha dito que o país era um só.",
    problem: "Quem manda não é um estranho com carimbo.",
    cost: "O país que se disse inteiro não cabe nessa regra.",
  },
  cai: {
    label:
      "Cai. O governo só dura enquanto a câmara confia. Outro nome, saído dessa câmara, segue a obra ou enterra.",
    problem: "Quem perdeu a câmara não fica até o estrago terminar.",
    cost: "Obra longa não atravessa a briga.",
  },
  fica_ate_a_data: {
    label:
      "Não cai. Teve uma escolha com data. A pessoa fica até lá. A câmara pode travar a lei, não o cargo.",
    problem: "O que foi escolhido não morre num pedido da câmara.",
    cost: "O erro dura até a data.",
  },
  a_casa_governa: {
    label:
      "Não tem chefe separado. A própria câmara governa, por um grupo que ela desfaz quando quiser.",
    problem: "Não existe um mando ao lado da câmara, brigando com ela.",
    cost: "Ninguém responde sozinho quando a obra para.",
  },
  enquanto_confiam: {
    label:
      "Enquanto a confiança durar. Um grupo pequeno, não o país inteiro, pode trocar o nome.",
    problem: "A família segue. A pessoa não fica para sempre.",
    cost: "Esse grupo pequeno vira o cargo de verdade.",
  },
  prazo_marcado: {
    label: "Um prazo marcado, e depois sai. O próximo pode ser de outra família.",
    problem: "Dá para contar quando acaba.",
    cost: "Uma obra de vinte anos não cabe num prazo curto. Quem espera herdar não constrói.",
  },
  vida_ou_linha: {
    label: "A vida inteira, e depois quem a família já aponta.",
    problem: "O desenho continua depois de quem está vivo.",
    cost: "Uma geração inteira não escolhe de novo.",
  },
  cadeira_do_ramo: {
    label: "A cadeira não é de uma pessoa. Dura enquanto o ramo existir.",
    problem: "O ramo não depende de quem herda.",
    cost: "O ramo que sentou não sai quando o país muda de ideia.",
  },
  texto_trava: {
    label: "A lei comum cede. Quem guarda o texto trava a mudança.",
    problem: "Um susto não apaga o que foi posto acima da maioria.",
    cost: "Quem interpreta vira o cargo, e o texto não envelhece em público.",
  },
  texto_aconselha: {
    label:
      "O texto aconselha. Se a câmara, ou o grupo, insistir, a lei comum passa.",
    problem: "O culto não congela o país.",
    cost: "O que era chão vira opinião.",
  },
  culto_miudo: {
    label:
      "Cada grupo guarda o próprio culto. Não tem um texto só para o país inteiro.",
    problem: "O povoado não reza a regra do vizinho.",
    cost: "Não existe um chão comum quando os grupos se encontram.",
  },
  base_puxa: {
    label:
      "Conselho de quem trabalha. O delegado volta quando a base puxa. Quem só é dono não tem cadeira própria.",
    problem: "O plano sai de quem faz, não de um gabinete que nunca foi ao porto.",
    cost: "A minoria do ramo não senta, e o plano pequeno trava a obra.",
  },
  dois_lados: {
    label:
      "Banca do ramo, os dois lados. Quem emprega e quem trabalha sentam juntos. A cadeira dura com o ramo. Alguém acima coordena para os ramos não se quebrarem.",
    problem: "A briga do ramo tem uma mesa, não uma guerra.",
    cost: "O ramo vira feudo, e quem está de fora da banca não entra.",
  },
  trabalho_nao_senta: {
    label:
      "O trabalho não dá cadeira. Cadeira vem do voto, da família ou do acordo. O ramo fala como qualquer um.",
    problem: "O ramo não vira um segundo país.",
    cost: "Quem faz a coisa obedece a quem nunca fez.",
  },
  continuidade: {
    label:
      "Deve continuar. A lei antiga e a família. Comida é consequência, não a razão do cargo.",
    problem: "O desenho não se rende a um ano ruim.",
    cost: "A fome não tira quem manda.",
  },
  pao_e_terra: {
    label:
      "Deve comida, terra e teto. Se o cuidado não chega, o próprio costume cobra o nome. A família fica; a pessoa pode ser trocada por outra da mesma família.",
    problem: "O cargo se explica pelo que chega na mesa.",
    cost: "O cuidado vira favor de quem consegue falar com a família.",
  },
  so_a_forca: {
    label: "Não deve explicação. Segura quem conseguir segurar.",
    problem: "A decisão não espera um julgamento do costume.",
    cost: "Não tem cobrança interna quando o mando erra. Só a ruptura.",
  },
  continuidade_fim: {
    label: "Que o amanhã pareça com o que já se sustentou.",
    problem: "O país, ou o grupo, não se reinventa a cada susto.",
    cost: "O que já não cabe continua de pé.",
  },
  cuidado_fim: {
    label: "Que comida, terra e teto cheguem a quem está embaixo.",
    problem: "A regra se mede na mesa, não só no carimbo.",
    cost: "Quem distribui escolhe o favorecido.",
  },
  plano_fim: {
    label: "Que quem produz dirija o plano, e não um dono ou um gabinete longe.",
    problem: "A meta sai do chão do trabalho.",
    cost: "Quem não está na atividade não vota o plano.",
  },
  abrigo_fim: {
    label:
      "Que a guerra e o mercado não engulam a gente, mesmo se a assinatura for de fora.",
    problem: "Sobreviver pesa mais do que escrever o tratado sozinho.",
    cost: "A razão de mandar deixa de ser daqui.",
  },
  anciaos: {
    label: "Contam os mais velhos do sangue. Quem chegou depois ouve, não decide.",
    problem: "A memória do poço está em quem já viveu outros anos difíceis.",
    cost: "Quem é novo não decide, mesmo se o poço for a água dele.",
  },
  leitor_no_circulo: {
    label: "Conta quem lê o texto sagrado do grupo, mesmo sem ser do sangue.",
    problem: "O costume ganha um chão que não é só a família.",
    cost: "Quem lê vem de fora do sangue e pode não sair.",
  },
  qualquer_do_vale: {
    label:
      "Conta quem vive no lugar agora, com ou sem o mesmo sangue. O mais velho fala primeiro, não fala sozinho.",
    problem: "Quem bebe a água tem voz.",
    cost: "Um ano de gente nova muda a regra do poço.",
  },
  so_de_fora: {
    label: "Só quem está de fora. A câmara daqui cuida da rua e não mexe no acordo.",
    problem: "O navio não fica refém de uma briga local.",
    cost: "A taxa do porto muda sem o nosso carimbo.",
  },
  os_dois: {
    label:
      "Os dois lados. Guerra e tratado só mudam se os dois assinarem. O dia a dia é daqui.",
    problem: "Não tem surpresa no acordo, nem bloqueio local no navio.",
    cost: "O impasse não tem dono. O porto espera.",
  },
  saio_da_carta: {
    label:
      "O acordo era um empréstimo. Nesse caso eu rasgo e fico com a última palavra, mesmo sem o navio.",
    problem: "A assinatura volta para cá.",
    cost: "A oferta de fora acaba no dia seguinte.",
  },
};

const CHOICE_NODE = new Map<string, NodeId>();
for (const node of NODE_IDS) {
  for (const choiceId of NODE_OPTIONS[node]) {
    if (CHOICE_NODE.has(choiceId)) {
      throw new Error(`Duplicate flowchart choice id: ${choiceId}`);
    }
    if (!COPY[choiceId]) {
      throw new Error(`Missing copy for choice: ${choiceId}`);
    }
    CHOICE_NODE.set(choiceId, node);
  }
}

function choiceOn(steps: readonly Step[], node: NodeId): string | null {
  return steps.find((step) => step.node === node)?.choiceId ?? null;
}

function hasNode(steps: readonly Step[], node: NodeId): boolean {
  return steps.some((step) => step.node === node);
}

interface Ctx {
  speechFora: "aldeia" | "pais";
  fonteMode: "rosto" | "soberano";
  prazoMode: "curto" | "cheio";
  sagradoFrom: "aldeia" | "pais";
  trabalhoFrom: "carta" | "tronco";
  fimFrom: "aldeia" | "carta" | "pais";
}

function context(steps: readonly Step[]): Ctx {
  const unidade = choiceOn(steps, "unidade");
  const fora = choiceOn(steps, "fora");
  const fonte = choiceOn(steps, "fonte");
  const carta = choiceOn(steps, "carta");
  const onCharter = fora === "carta_de_fora" && carta !== null && carta !== "saio_da_carta";
  const face =
    fonte === "rosto_nomeado" ||
    fonte === "rosto_com_prazo" ||
    fonte === "rosto_camara";
  return {
    speechFora: unidade === "aldeia" ? "aldeia" : "pais",
    fonteMode: onCharter ? "rosto" : "soberano",
    prazoMode: choiceOn(steps, "trabalho") === "dois_lados" ? "curto" : "cheio",
    sagradoFrom: fonte === "leitor_do_texto" ? "pais" : "aldeia",
    trabalhoFrom: face ? "carta" : "tronco",
    fimFrom: onCharter ? "carta" : unidade === "aldeia" ? "aldeia" : "pais",
  };
}

function visible(node: NodeId, choiceId: string, ctx: Ctx): boolean {
  if (node === "fonte") {
    const face = choiceId.startsWith("rosto_");
    return ctx.fonteMode === "rosto" ? face : !face;
  }
  if (node === "prazo" && ctx.prazoMode === "curto") {
    return choiceId === "enquanto_confiam" || choiceId === "cadeira_do_ramo";
  }
  return true;
}

function effects(choiceId: string, ctx: Ctx): { params: Delta; mole: Mole } {
  switch (choiceId) {
    case "aldeia":
      return {
        params: { escala: -2, parentesco: 2, fora: 1 },
        mole: { tribal: 2 },
      };
    case "regiao":
      return { params: { escala: -1 }, mole: {} };
    case "pais":
      return { params: { escala: 2 }, mole: { tribal: -2 } };
    case "carta_de_fora": {
      const params: Delta = { fora: -2, tutela: 2 };
      const mole: Mole = { colonia: 2 };
      if (ctx.speechFora === "pais") params.escala = 1;
      if (ctx.speechFora === "aldeia") mole.tribal = 1;
      return { params, mole };
    }
    case "ultima_aqui":
      if (ctx.speechFora === "aldeia") {
        return {
          params: { fora: 2, escala: -1, parentesco: 1 },
          mole: { colonia: -2, tribal: 1 },
        };
      }
      return { params: { fora: 2, tutela: -2 }, mole: { colonia: -2 } };
    case "voto_contado":
      return {
        params: { voto: 2 },
        mole: { presidencialista: 1, parlamentarista: 1 },
      };
    case "linhagem":
      return {
        params: { tradicao: 2, quem: 1 },
        mole: { monarquista: 1, monarquia_social: 1 },
      };
    case "leitor_do_texto":
      return { params: { sagrado: 2 }, mole: { teocrata: 2 } };
    case "rosto_nomeado":
      return {
        params: { quem: 2, queda: 1, tutela: 1 },
        mole: { colonia: 2 },
      };
    case "rosto_com_prazo":
      return {
        params: { quem: 1, voto: 1, prazo: 1, tutela: 1 },
        mole: { colonia: 1, presidencialista: 1 },
      };
    case "rosto_camara":
      return {
        params: { quem: -1, queda: -2, voto: 1, tutela: 1 },
        mole: { colonia: 1, parlamentarista: 1 },
      };
    case "de_quem_trabalha":
      return {
        params: { plano: 1 },
        mole: { sovietica: 1, corporacao: 1 },
      };
    case "mesmo_sangue":
      return {
        params: { parentesco: 2, escala: -1 },
        mole: { tribal: 2 },
      };
    case "cai":
      return {
        params: { quem: -1, prazo: -2, queda: -2 },
        mole: { parlamentarista: 2, presidencialista: -2 },
      };
    case "fica_ate_a_data":
      return {
        params: { quem: 2, prazo: 1, queda: 2 },
        mole: { presidencialista: 2, parlamentarista: -2 },
      };
    case "a_casa_governa":
      return {
        params: { quem: -2, prazo: -1, queda: -2, voto: 1 },
        mole: { parlamentarista: 1, sovietica: 1 },
      };
    case "enquanto_confiam":
      return {
        params: { prazo: -1, quem: 0, tradicao: 1 },
        mole: { monarquista: 0 },
      };
    case "prazo_marcado":
      return {
        params: { prazo: 1, quem: 1, voto: 1 },
        mole: { presidencialista: 1, monarquista: -1 },
      };
    case "vida_ou_linha":
      return {
        params: { prazo: 2, quem: 2, queda: 1, tradicao: 1 },
        mole: { monarquista: 1, monarquia_social: 1 },
      };
    case "cadeira_do_ramo":
      return {
        params: { oficio: 2, prazo: 1, quem: -1 },
        mole: { corporacao: 2, monarquista: -1 },
      };
    case "texto_trava":
      return {
        params: { sagrado: 2, queda: 1, ordem: 1 },
        mole: { teocrata: 2 },
      };
    case "texto_aconselha":
      return { params: { sagrado: -1 }, mole: { teocrata: -2 } };
    case "culto_miudo":
      return {
        params: { sagrado: -1, escala: -1 },
        mole: { teocrata: -1, tribal: 1 },
      };
    case "base_puxa":
      return {
        params: { conselho: 2, quem: -2, prazo: -2, plano: 2 },
        mole: { sovietica: 2, corporacao: -1 },
      };
    case "dois_lados":
      return {
        params: { oficio: 2, prazo: 1, quem: -1, ordem: 1, plano: 1 },
        mole: { corporacao: 2, sovietica: -1 },
      };
    case "trabalho_nao_senta":
      return { params: {}, mole: { sovietica: -1, corporacao: -1 } };
    case "continuidade":
      return {
        params: { ordem: 2, cuidado: 0, tradicao: 1 },
        mole: { monarquista: 2, monarquia_social: -1 },
      };
    case "pao_e_terra":
      return {
        params: { cuidado: 2, ordem: 1, tradicao: 1, prazo: -1 },
        mole: { monarquia_social: 2, monarquista: -1 },
      };
    case "so_a_forca":
      return {
        params: { ordem: 1, tradicao: -1, queda: 1 },
        mole: { monarquista: -1, monarquia_social: -1 },
      };
    case "continuidade_fim":
      return {
        params: { ordem: 2 },
        mole: { monarquista: 1, corporacao: 1, teocrata: 1 },
      };
    case "cuidado_fim":
      return {
        params: { cuidado: 2 },
        mole: { monarquia_social: 1, tribal: 1 },
      };
    case "plano_fim":
      return {
        params: { plano: 2, conselho: 1 },
        mole: { sovietica: 1 },
      };
    case "abrigo_fim":
      return {
        params: { tutela: 1, ordem: 1 },
        mole: { colonia: 1 },
      };
    case "anciaos":
      return {
        params: { parentesco: 2, quem: -1, prazo: 1, ordem: 1 },
        mole: { tribal: 2 },
      };
    case "leitor_no_circulo":
      return {
        params: { sagrado: 2, parentesco: -1 },
        mole: { teocrata: 2, tribal: -1 },
      };
    case "qualquer_do_vale":
      return {
        params: { parentesco: 1, quem: -1, prazo: -1 },
        mole: { tribal: 1 },
      };
    case "so_de_fora":
      return {
        params: { tutela: 2, queda: 1, fora: -1 },
        mole: { colonia: 2 },
      };
    case "os_dois":
      return {
        params: { tutela: 1, fora: -1, queda: -1 },
        mole: { colonia: 1 },
      };
    case "saio_da_carta":
      return {
        params: { tutela: -2, fora: 2 },
        mole: { colonia: -2 },
      };
    default:
      throw new Error(`Unknown flowchart choice: ${choiceId}`);
  }
}

function nextNode(choiceId: string, stepsAfter: readonly Step[]): NodeId | null {
  const answered = (id: string) => stepsAfter.some((step) => step.choiceId === id);
  const visited = (node: NodeId) => hasNode(stepsAfter, node);
  switch (choiceId) {
    case "aldeia":
      return "circulo";
    case "regiao":
    case "pais":
      return "fora";
    case "anciaos":
    case "qualquer_do_vale":
      return visited("fora") ? "fim" : "fora";
    case "leitor_no_circulo":
      return "sagrado";
    case "carta_de_fora":
      return "carta";
    case "ultima_aqui":
      return answered("aldeia") ? "fim" : "fonte";
    case "so_de_fora":
    case "os_dois":
    case "saio_da_carta":
      return "fonte";
    case "de_quem_trabalha":
    case "rosto_nomeado":
    case "rosto_com_prazo":
    case "rosto_camara":
    case "cai":
    case "fica_ate_a_data":
    case "a_casa_governa":
    case "continuidade":
    case "pao_e_terra":
    case "so_a_forca":
      return "trabalho";
    case "voto_contado":
      return "confianca";
    case "linhagem":
      return "prazo";
    case "leitor_do_texto":
      return "sagrado";
    case "mesmo_sangue":
      return "circulo";
    case "enquanto_confiam":
    case "prazo_marcado":
    case "cadeira_do_ramo":
      return visited("trabalho") ? "fim" : "trabalho";
    case "vida_ou_linha":
      return "dever";
    case "texto_trava":
    case "base_puxa":
    case "trabalho_nao_senta":
      return "fim";
    case "continuidade_fim":
    case "cuidado_fim":
    case "plano_fim":
    case "abrigo_fim":
      return null;
    case "texto_aconselha":
    case "culto_miudo":
      return answered("leitor_do_texto") ? "confianca" : "fim";
    case "dois_lados":
      return visited("prazo") ? "fim" : "prazo";
    default:
      return null;
  }
}

function labelFor(choiceId: string, ctx: Ctx): string {
  if (choiceId === "ultima_aqui" && ctx.speechFora === "aldeia") {
    return "Não. Aliança só com quem senta no grupo.";
  }
  return COPY[choiceId].label;
}

function bodyFor(node: NodeId, ctx: Ctx, countryName: string): string {
  const name = sanitizeCountryName(countryName);
  switch (node) {
    case "unidade":
      return `${name} ainda está nascendo, numa costa que não tinha país. Tem povoado que só obedece a quem se conhece, região com caixa próprio, e gente que quer a mesma regra do porto até o interior. Onde a decisão fica de verdade?`;
    case "fora":
      return ctx.speechFora === "aldeia"
        ? `Em ${name}, o povoado não aguenta uma guerra longa. Um poder de fora oferece guarda. A praça continuaria de quem já senta nela.`
        : `Um vizinho oferece navio, moeda estável e um acordo. Em troca, guerra, alfândega e a assinatura de fora passam para lá. Escola, rua e hospital podem ficar em ${name}.`;
    case "fonte":
      return ctx.fonteMode === "rosto"
        ? "O acordo continua valendo por cima. Na rua, quem é a pessoa daqui?"
        : "A câmara, o porto e o culto cabem na mesma capital. Quando os três não se entendem, quem tem o direito de mandar?";
    case "confianca":
      return "A câmara e o chefe pararam de se falar. A obra no rio está no meio. O que acontece com quem governa?";
    case "prazo":
      return ctx.prazoMode === "curto"
        ? "A cadeira já é do ramo, não de uma pessoa. O porto pede uma obra de vinte anos. Até quando esse assento dura?"
        : "O nome já está no cargo. O porto pede uma obra de vinte anos. Até quando esse mando dura?";
    case "sagrado":
      return ctx.sagradoFrom === "aldeia"
        ? "O texto pode vir de fora do povoado. A lei sagrada proíbe o que o costume daqui agora quer permitir. Quem cede?"
        : "A lei sagrada proíbe o que a maioria, ou os mais velhos, agora quer permitir. Quem cede?";
    case "trabalho":
      return ctx.trabalhoFrom === "carta"
        ? "O acordo já guarda a guerra e o tratado. O porto, a lavoura e o hospital querem sentar na regra do ramo. A cadeira é daqui, ou já vem escrita no acordo?"
        : "O porto, a lavoura e o hospital querem sentar quando se escreve a regra do ramo. Hoje quem senta veio do voto, da família ou do acordo.";
    case "dever":
      return "Essa família está no mando há gerações. A colheita queimou. Tem quem diga que o cargo basta, e quem diga que cargo sem comida é só um nome.";
    case "fim":
      if (ctx.fimFrom === "aldeia") {
        return `O povoado de ${name} precisa de uma razão. Se o grupo só pudesse guardar uma coisa, qual seria?`;
      }
      if (ctx.fimFrom === "carta") {
        return `O acordo já segura a guerra. O que ainda é de ${name} precisa de uma razão. Se o mando só pudesse guardar uma coisa, qual seria?`;
      }
      return `O porto, a lavoura e a fronteira pedem uma razão. Se ${name} só pudesse guardar uma coisa, qual seria?`;
    case "circulo":
      return "O grupo vai decidir a água do poço. Nem todo mundo que bebe essa água nasceu ali.";
    case "carta":
      return "O acordo está assinado. O porto quer uma taxa nova. Quem pode rasgar ou reescrever isso?";
    default:
      return "";
  }
}

function present(
  node: NodeId,
  steps: readonly Step[],
  countryName: string,
): FlowScene {
  const ctx = context(steps);
  return {
    id: node,
    title: NODE_TITLE[node],
    body: bodyFor(node, ctx, countryName),
    choices: NODE_OPTIONS[node]
      .filter((choiceId) => visible(node, choiceId, ctx))
      .map((choiceId) => {
        const copy = COPY[choiceId];
        return {
          id: choiceId,
          label: labelFor(choiceId, ctx),
          hint: `Problema. ${copy.problem}\nPreço. ${copy.cost}`,
        };
      }),
  };
}

function walkChoices(choiceIds: readonly string[]): Walk {
  let node: NodeId | null = "unidade";
  const steps: Step[] = [];
  for (const choiceId of choiceIds) {
    if (!node) return { ok: false, steps, next: null, complete: false };
    if (CHOICE_NODE.get(choiceId) !== node) {
      return { ok: false, steps, next: null, complete: false };
    }
    const ctx = context(steps);
    if (!visible(node, choiceId, ctx)) {
      return { ok: false, steps, next: null, complete: false };
    }
    const effect = effects(choiceId, ctx);
    const sceneTitle = NODE_TITLE[node];
    steps.push({
      node,
      choiceId,
      params: effect.params,
      mole: effect.mole,
      sceneTitle,
      choiceLabel: labelFor(choiceId, ctx),
      sentence: COPY[choiceId].problem,
    });
    node = nextNode(choiceId, steps);
  }
  return {
    ok: true,
    steps,
    next: node,
    complete: node === null && steps.length > 0 && steps[steps.length - 1].node === "fim",
  };
}

interface Vector {
  sums: Partial<Record<ParamId, number>>;
  askedBipolar: Set<BipolarId>;
  mole: Record<ProfileId, number>;
  chose: Set<string>;
}

function vectorOf(steps: readonly Step[]): Vector {
  const sums: Partial<Record<ParamId, number>> = {};
  const askedBipolar = new Set<BipolarId>();
  const mole = Object.fromEntries(PROFILE_IDS.map((id) => [id, 0])) as Record<
    ProfileId,
    number
  >;
  const chose = new Set<string>();
  for (const step of steps) {
    chose.add(step.choiceId);
    for (const [key, value] of Object.entries(step.params) as [ParamId, number][]) {
      sums[key] = (sums[key] ?? 0) + value;
      if ((BIPOLAR as readonly string[]).includes(key)) {
        askedBipolar.add(key as BipolarId);
      }
    }
    for (const profile of PROFILE_IDS) {
      mole[profile] += step.mole[profile] ?? 0;
    }
  }
  return { sums, askedBipolar, mole, chose };
}

function rawDistance(vector: Vector, profile: ProfileId): number {
  const centroid = PROFILE_COPY[profile].centroid;
  let sum = 0;
  for (const axis of BIPOLAR) {
    if (!vector.askedBipolar.has(axis)) continue;
    const delta = (vector.sums[axis] ?? 0) - (centroid[axis] ?? 0);
    sum += delta * delta;
  }
  for (const axis of CHANNELS) {
    const delta = (vector.sums[axis] ?? 0) - (centroid[axis] ?? 0);
    sum += delta * delta;
  }
  return Math.sqrt(sum);
}

function adjustedDistance(vector: Vector, profile: ProfileId): number {
  return rawDistance(vector, profile) - MOLE_BONUS * vector.mole[profile];
}

function guardsOf(vector: Vector): ProfileId[] {
  const guarda: ProfileId[] = [];
  const fora = vector.sums.fora;
  const escala = vector.sums.escala;
  const prazo = vector.askedBipolar.has("prazo") ? (vector.sums.prazo ?? 0) : null;
  if ((vector.sums.tutela ?? 0) >= 2 && fora !== undefined && fora <= -1) {
    guarda.push("colonia");
  }
  if (
    escala !== undefined &&
    vector.askedBipolar.has("escala") &&
    escala <= -2 &&
    (vector.sums.parentesco ?? 0) >= 2
  ) {
    guarda.push("tribal");
  }
  if ((vector.sums.sagrado ?? 0) >= 2 && vector.chose.has("texto_trava")) {
    guarda.push("teocrata");
  }
  if ((vector.sums.conselho ?? 0) >= 2 && prazo !== null && prazo <= -1) {
    guarda.push("sovietica");
  }
  if ((vector.sums.oficio ?? 0) >= 2 && (vector.sums.conselho ?? 0) < 1) {
    guarda.push("corporacao");
  }
  return guarda;
}

function arrangement(
  profile: ProfileId,
  steps: readonly Step[],
): GovernmentArrangement {
  const copy = PROFILE_COPY[profile];
  // How much closer this answer moved the centroid, in the order it was asked.
  // Dropping a finished answer can shrink the distance by erasing an overshoot,
  // so the useful “what pulled this” signal is the step that closed the gap.
  const drivers = steps
    .map((step, index) => {
      const before = adjustedDistance(vectorOf(steps.slice(0, index)), profile);
      const after = adjustedDistance(vectorOf(steps.slice(0, index + 1)), profile);
      return { step, index, reduction: before - after };
    })
    .filter((row) => row.reduction > 1e-9)
    .sort((a, b) => b.reduction - a.reduction || a.index - b.index)
    .slice(0, 3)
    .map((row) => ({
      sceneTitle: row.step.sceneTitle,
      choiceLabel: row.step.choiceLabel,
      sentence: row.step.sentence,
    }));
  return {
    title: copy.title,
    support: copy.support,
    problem: copy.problem,
    cost: copy.cost,
    drivers,
  };
}

export function scoreGovernment(
  choiceIds: readonly string[],
): GovernmentResult | null {
  const walk = walkChoices(choiceIds);
  if (!walk.ok || !walk.complete) return null;
  const vector = vectorOf(walk.steps);
  const ranked = PROFILE_IDS.map((id) => ({
    id,
    distance: adjustedDistance(vector, id),
  })).sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));

  const triggered = guardsOf(vector);
  let pair: [ProfileId, ProfileId];
  if (triggered.length >= 2) {
    const ordered = [...triggered].sort((a, b) => {
      const da = ranked.find((row) => row.id === a)?.distance ?? 0;
      const db = ranked.find((row) => row.id === b)?.distance ?? 0;
      return da - db || a.localeCompare(b);
    });
    pair = [ordered[0], ordered[1]];
  } else if (triggered.length === 1) {
    const guard = triggered[0];
    if (ranked[0].id === guard) {
      pair = [guard, ranked[1].id];
    } else {
      pair = [ranked[0].id, guard];
    }
  } else {
    pair = [ranked[0].id, ranked[1].id];
  }

  const d1 = ranked.find((row) => row.id === pair[0])?.distance ?? 0;
  const d2 = ranked.find((row) => row.id === pair[1])?.distance ?? 0;
  const showSecondary = d2 < SECONDARY_RATIO * d1;
  const nearTie = showSecondary && d2 - d1 < NEAR_TIE_RATIO * d1;

  return {
    primary: arrangement(pair[0], walk.steps),
    secondary: showSecondary ? arrangement(pair[1], walk.steps) : null,
    nearTie,
  };
}

export function assessGovernment(progress: {
  index: number;
  choiceIds: string[];
  countryName?: string;
}): InProgressStatus {
  const { index, choiceIds } = progress;
  if (choiceIds.length === 0) {
    if (progress.countryName?.trim() && index === 0) return "resume";
    return "invalid";
  }
  if (!Number.isInteger(index) || index < 0) return "invalid";
  const walk = walkChoices(choiceIds);
  if (!walk.ok) return "invalid";
  if (index > choiceIds.length) return "invalid";
  if (walk.complete) return "complete";
  return "resume";
}

/** Scene at `index` along a legal prefix. `null` when the path cannot be shown. */
export function sceneAt(
  choiceIds: readonly string[],
  index: number,
  countryName?: string,
): FlowScene | null {
  if (!Number.isInteger(index) || index < 0) return null;
  const prefix = choiceIds.slice(0, index);
  const walk = walkChoices(prefix);
  if (!walk.ok || !walk.next) return null;
  const name = sanitizeCountryName(countryName);
  if (index < choiceIds.length) {
    const scene = present(walk.next, walk.steps, name);
    if (!scene.choices.some((choice) => choice.id === choiceIds[index])) {
      return null;
    }
  }
  return present(walk.next, walk.steps, name);
}

export function choiceCompletes(
  choiceIds: readonly string[],
  index: number,
  choiceId: string,
): boolean {
  const prefix = choiceIds.slice(0, index);
  return walkChoices([...prefix, choiceId]).complete;
}

const BLACKLIST = [
  "monarquia",
  "rei",
  "rainha",
  "presidencialismo",
  "presidente",
  "parlamentarismo",
  "parlamento",
  "teocracia",
  "teocrata",
  "soviete",
  "soviético",
  "sovietico",
  "corporativismo",
  "corporação",
  "corporacao",
  "fascismo",
  "colônia",
  "colonia",
  "protetorado",
  "república",
  "republica",
  "democracia",
  "socialismo",
  "comunismo",
  "partido",
  "liberal",
  "ditadura",
  "anarquia",
];

const BLACKLIST_RE = new RegExp(
  `(?:^|[^\\p{L}])(?:${BLACKLIST.join("|")})(?=[^\\p{L}]|$)`,
  "iu",
);

function assertPlayerCopy(): void {
  const strings: string[] = [
    GOVERNMENT_RESULT_TITLE,
    governmentResultLead(DEFAULT_COUNTRY_NAME),
    COUNTRY_NAME_TITLE,
    COUNTRY_NAME_BODY,
    COUNTRY_NAME_BUTTON,
    NEAR_TIE_LINE,
    ...Object.values(NODE_TITLE),
    ...Object.values(COPY).flatMap((copy) => [copy.label, copy.problem, copy.cost]),
    ...Object.values(PROFILE_COPY).flatMap((copy) => [
      copy.title,
      copy.support,
      copy.problem,
      copy.cost,
    ]),
    "Não. Aliança só com quem senta no grupo.",
  ];
  const stub = (node: NodeId, choiceId: string): Step => ({
    node,
    choiceId,
    params: {},
    mole: {},
    sceneTitle: "",
    choiceLabel: "",
    sentence: "",
  });
  const contexts = [
    context([]),
    context([stub("unidade", "aldeia")]),
    context([
      stub("unidade", "pais"),
      stub("fora", "carta_de_fora"),
      stub("carta", "so_de_fora"),
    ]),
    context([
      stub("unidade", "pais"),
      stub("fora", "carta_de_fora"),
      stub("carta", "so_de_fora"),
      stub("fonte", "rosto_nomeado"),
    ]),
    context([stub("trabalho", "dois_lados")]),
    context([stub("fonte", "leitor_do_texto")]),
  ];
  for (const ctx of contexts) {
    for (const node of NODE_IDS) {
      strings.push(bodyFor(node, ctx, DEFAULT_COUNTRY_NAME));
      strings.push(bodyFor(node, ctx, "Serra Clara"));
      strings.push(labelFor("ultima_aqui", ctx));
    }
  }
  for (const text of strings) {
    if (BLACKLIST_RE.test(text)) {
      throw new Error(`Player-facing copy uses a blocked regime word: ${text}`);
    }
  }
}

function expectPath(
  choiceIds: readonly string[],
  nodes: readonly NodeId[],
  title: string,
): void {
  const walk = walkChoices(choiceIds);
  const got = walk.steps.map((step) => step.node).join(">");
  const want = nodes.join(">");
  if (!walk.ok || !walk.complete || got !== want) {
    throw new Error(`Path ${want} walked as ${got} (ok=${walk.ok}).`);
  }
  const result = scoreGovernment(choiceIds);
  if (!result || result.nearTie || result.secondary) {
    throw new Error(
      `Expected a single title “${title}”, got ${result?.primary.title ?? "none"} / ${result?.secondary?.title ?? "none"}.`,
    );
  }
  if (result.primary.title !== title) {
    throw new Error(`Expected “${title}”, got “${result.primary.title}”.`);
  }
}

function assertExamples(): void {
  expectPath(
    ["aldeia", "anciaos", "ultima_aqui", "cuidado_fim"],
    ["unidade", "circulo", "fora", "fim"],
    PROFILE_COPY.tribal.title,
  );
  expectPath(
    [
      "pais",
      "carta_de_fora",
      "so_de_fora",
      "rosto_nomeado",
      "trabalho_nao_senta",
      "abrigo_fim",
    ],
    ["unidade", "fora", "carta", "fonte", "trabalho", "fim"],
    PROFILE_COPY.colonia.title,
  );
  expectPath(
    [
      "pais",
      "ultima_aqui",
      "voto_contado",
      "fica_ate_a_data",
      "trabalho_nao_senta",
      "continuidade_fim",
    ],
    ["unidade", "fora", "fonte", "confianca", "trabalho", "fim"],
    PROFILE_COPY.presidencialista.title,
  );

  const social = scoreGovernment([
    "pais",
    "ultima_aqui",
    "linhagem",
    "vida_ou_linha",
    "pao_e_terra",
    "trabalho_nao_senta",
    "cuidado_fim",
  ]);
  const continuity = scoreGovernment([
    "pais",
    "ultima_aqui",
    "linhagem",
    "vida_ou_linha",
    "continuidade",
    "trabalho_nao_senta",
    "continuidade_fim",
  ]);
  if (social?.primary.title !== PROFILE_COPY.monarquia_social.title) {
    throw new Error(
      `Social lineage landed on “${social?.primary.title ?? "none"}”.`,
    );
  }
  if (continuity?.primary.title !== PROFILE_COPY.monarquista.title) {
    throw new Error(
      `Continuity lineage landed on “${continuity?.primary.title ?? "none"}”.`,
    );
  }
}

assertPlayerCopy();
assertExamples();
