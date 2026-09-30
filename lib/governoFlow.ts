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
  "Você ajuda a escrever as primeiras regras de um país novo, numa costa longe de Valmora. Ainda não tem capital nem lei antiga. O nome sugerido é Pontal. Pode ficar com ele ou apagar e escrever outro.";
export const COUNTRY_NAME_BUTTON = "Seguir com este nome";
export const GOVERNMENT_RESULT_TITLE = "Meu Estado Ideal";
export const NEAR_TIE_LINE =
  "Ficou perto. Os dois jeitos cabem no que você escolheu. Nenhum ganha sozinho.";

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
  return `É assim que ${name} ficaria com estas escolhas: o que esse jeito de mandar resolve, e o que cobra. Não muda Meu Perfil.`;
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

export const PROFILE_IDS = [
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
    title: "Uma família manda por costume, e é difícil tirar",
    support:
      "A família antiga continua no cargo. A regra não muda todo ano. Quem nasce fora dessa família pode passar a vida inteira sem escolher de novo.",
    problem: "A família antiga continua no cargo, e a regra não muda todo ano.",
    cost: "Quem nasce fora dessa família pode passar a vida inteira sem escolher de novo.",
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
    title: "Uma família manda, mas tem de garantir comida, terra e teto",
    support:
      "A família fica no cargo porque cuida de quem está embaixo. Esse cuidado pode virar favor para quem chega perto da família.",
    problem: "A família fica no cargo porque cuida de quem está embaixo.",
    cost: "Esse cuidado pode virar favor para quem chega perto da família.",
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
    title: "Um chefe fica até a data marcada, e a câmara não tira no meio",
    support:
      "Uma pessoa governa até o dia combinado, mesmo se a câmara reclamar. Se errar, o erro fica até essa data.",
    problem: "Uma pessoa governa até o dia combinado, mesmo se a câmara reclamar.",
    cost: "Se errar, o erro fica até essa data.",
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
    title: "Quem governa cai quando a câmara deixa de confiar",
    support:
      "Quem governa vem da câmara e sai no dia em que a câmara tira a confiança. Uma obra longa pode morrer no meio da briga.",
    problem:
      "Quem governa vem da câmara e sai no dia em que a câmara tira a confiança.",
    cost: "Uma obra longa pode morrer no meio da briga.",
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
    title: "A lei sagrada fica acima da lei do dia a dia",
    support:
      "A lei do dia a dia só vale até onde o texto sagrado deixa. Quem interpreta o texto é quem manda de verdade.",
    problem: "A lei do dia a dia só vale até onde o texto sagrado deixa.",
    cost: "Quem interpreta o texto é quem manda de verdade.",
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
    title: "Quem trabalha manda, e pode trocar o representante fácil",
    support:
      "A ordem vem de quem faz o trabalho, não de um gabinete na capital. Um grupo pequeno pode travar a obra, e quem não trabalha na base não tem cadeira.",
    problem: "A ordem vem de quem faz o trabalho, não de um gabinete na capital.",
    cost: "Um grupo pequeno pode travar a obra, e quem não trabalha na base não tem cadeira.",
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
    title: "Os ramos de trabalho mandam, patrão e empregado juntos",
    support:
      "No mesmo ramo, quem emprega e quem trabalha sentam na mesma mesa, com alguém por cima. O ramo pode fechar a porta para quem está de fora.",
    problem:
      "No mesmo ramo, quem emprega e quem trabalha sentam na mesma mesa, com alguém por cima.",
    cost: "O ramo pode fechar a porta para quem está de fora.",
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
    title: "Guerra e tratado ficam com quem está de fora; o dia a dia fica aqui",
    support:
      "Navio e assinatura de fora não dependem do nosso caixa. Se o acordo mudar, a gente não tem como dizer não.",
    problem: "Navio e assinatura de fora não dependem do nosso caixa.",
    cost: "Se o acordo mudar, a gente não tem como dizer não.",
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
    title: "O povoado manda pelo sangue e pelo costume, sem um governo do país",
    support:
      "Quem se conhece decide. O que for maior que o povoado é aliança, não um mando só. A regra de um lugar não vale no outro.",
    problem:
      "Quem se conhece decide. O que for maior que o povoado é aliança, não um mando só.",
    cost: "A regra de um lugar não vale no outro.",
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
  unidade: "Onde as regras do dia a dia vão ficar?",
  fora: "Guerra e tratado podem passar para outro país?",
  fonte: "Quem ganha o direito de mandar?",
  confianca: "A câmara pode tirar quem governa no meio do caminho?",
  prazo: "Até quando essa pessoa fica no mando?",
  sagrado: "A lei do dia a dia pode ir contra o texto sagrado?",
  trabalho: "Quem trabalha ganha cadeira para escrever a regra?",
  dever: "A família que manda deve o quê a quem vive com ela?",
  fim: "Se só pudesse guardar uma coisa, qual seria?",
  circulo: "Quem vota no grupo pequeno?",
  carta: "Quem pode mudar o acordo com quem está de fora?",
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
      "Fica no povoado. Cada grupo que se conhece pelo nome faz a própria regra. O que for maior que isso é aliança, não um governo só.",
    problem: "A regra de longe não conhece a vida daqui.",
    cost: "O povoado ao lado pode fazer outra lei, e quem chegou de fora não vota.",
  },
  regiao: {
    label:
      "Fica na região. Escola, guarda e parte do imposto ficam perto. O centro só cuida da fronteira.",
    problem: "Quem decide está perto do clima e do jeito de viver da região.",
    cost: "A região rica pode recusar dividir o que tem com as outras.",
  },
  pais: {
    label: "Fica no país inteiro. A mesma regra vale na capital e na fronteira.",
    problem: "A decisão não muda de um lugar para o outro.",
    cost: "Um abuso no centro chega em todo mundo.",
  },
  carta_de_fora: {
    label:
      "Aceito. Guerra e tratado passam para quem está de fora. Escola, rua e hospital ficam aqui.",
    problem: "Navio e crédito não dependem de um ano ruim nosso.",
    cost: "Se o acordo mudar, não tem a quem dizer não.",
  },
  ultima_aqui: {
    label: "Não aceito. Guerra, moeda e tratado ficam aqui, mesmo mais fracos.",
    problem: "Ninguém de fora reescreve a nossa regra.",
    cost: "Navio e crédito saem do nosso próprio caixa.",
  },
  voto_contado: {
    label: "Manda quem ganhar o voto do país inteiro. Cada voto é contado.",
    problem: "Quem perde vê o tamanho da derrota.",
    cost: "Quase metade do país obedece a uma maioria que pode mudar no ano seguinte.",
  },
  linhagem: {
    label:
      "Manda um nome que já vem de antes. A família, ou o costume, aponta a próxima pessoa, sem eleição.",
    problem: "O mando não recomeça do zero toda estação.",
    cost: "Quem nasceu fora dessa família não chega nesse cargo.",
  },
  leitor_do_texto: {
    label: "Manda quem lê a lei sagrada e diz o que ela pede agora.",
    problem: "A regra não fica na mão do medo de um ano.",
    cost: "Quem não lê o texto não consegue tirar quem lê.",
  },
  rosto_nomeado: {
    label: "Uma pessoa daqui, colocada e tirada por quem está de fora.",
    problem: "A rua tem um nome para procurar.",
    cost: "Essa pessoa não pode dizer não ao acordo de fora.",
  },
  rosto_com_prazo: {
    label:
      "Uma pessoa daqui, escolhida aqui, com data para sair. Guerra e tratado continuam com quem está de fora.",
    problem: "O dia a dia troca de chefe sem esperar quem está de fora.",
    cost: "A data daqui não muda a guerra nem o tratado.",
  },
  rosto_camara: {
    label:
      "A pessoa daqui cai se a câmara daqui tirar a confiança. O acordo de fora continua valendo.",
    problem: "A câmara daqui corrige quem cuida da rua.",
    cost: "O acordo de fora não cai junto com essa pessoa.",
  },
  de_quem_trabalha: {
    label:
      "Manda quem trabalha naquela atividade, não um voto geral nem um nome antigo.",
    problem: "Quem não põe a mão no trabalho não escreve a regra dele.",
    cost: "Quem está fora da atividade fica sem cadeira.",
  },
  mesmo_sangue: {
    label:
      "Manda quem é do mesmo sangue e do mesmo povoado, mesmo que antes a gente tenha dito que o país era um só.",
    problem: "Quem manda é gente do povoado, não um estranho mandado de longe.",
    cost: "A ideia de um país com uma regra só não cabe mais.",
  },
  cai: {
    label:
      "Cai. O governo só dura enquanto a câmara confia. Outra pessoa, saída dessa câmara, continua a obra ou enterra.",
    problem: "Quem perdeu a câmara não fica até o estrago terminar.",
    cost: "Uma obra longa pode morrer no meio da briga.",
  },
  fica_ate_a_data: {
    label:
      "Não cai. Houve uma escolha com data. A pessoa fica até lá. A câmara pode travar a lei, mas não tira o cargo.",
    problem: "O que foi escolhido não acaba num pedido da câmara.",
    cost: "Se a pessoa errar, o erro fica até a data.",
  },
  a_casa_governa: {
    label:
      "Não tem chefe separado. A própria câmara governa, por um grupo que ela desfaz quando quiser.",
    problem: "Não existe um mando ao lado da câmara, brigando com ela.",
    cost: "Quando a obra para, ninguém responde sozinho.",
  },
  enquanto_confiam: {
    label:
      "Dura enquanto um grupo pequeno confiar. Esse grupo, não o país inteiro, pode trocar a pessoa.",
    problem: "A família continua. A pessoa não fica para sempre.",
    cost: "Esse grupo pequeno vira quem manda de verdade.",
  },
  prazo_marcado: {
    label: "Um prazo marcado, e depois sai. A próxima pessoa pode ser de outra família.",
    problem: "Dá para saber o dia em que acaba.",
    cost: "Uma obra de vinte anos não cabe num prazo curto. Quem espera herdar não constrói.",
  },
  vida_ou_linha: {
    label: "Fica a vida inteira. Depois entra quem a família já apontou.",
    problem: "O arranjo continua depois da morte de quem está no cargo.",
    cost: "Uma geração inteira não escolhe de novo.",
  },
  cadeira_do_ramo: {
    label: "A cadeira não é de uma pessoa. Ela dura enquanto o ramo de trabalho existir.",
    problem: "O ramo não depende de quem herda o cargo.",
    cost: "O ramo que já sentou não sai quando o país muda de ideia.",
  },
  texto_trava: {
    label: "A lei do dia a dia cede. Quem guarda o texto sagrado trava a mudança.",
    problem: "Um susto não apaga o que foi posto acima da maioria.",
    cost: "Quem interpreta o texto vira quem manda, e o texto não é revisto em público.",
  },
  texto_aconselha: {
    label:
      "O texto só aconselha. Se a câmara, ou o grupo, insistir, a lei do dia a dia passa.",
    problem: "O culto não congela o país.",
    cost: "O que era regra vira opinião.",
  },
  culto_miudo: {
    label:
      "Cada grupo guarda o próprio culto. Não existe um texto só para o país inteiro.",
    problem: "O povoado não segue a regra religiosa do vizinho.",
    cost: "Quando os grupos se encontram, não há uma regra comum.",
  },
  base_puxa: {
    label:
      "Conselho de quem trabalha. O representante volta quando a base puxa. Quem só é dono não tem cadeira própria.",
    problem: "O plano sai de quem faz o trabalho, não de um gabinete que nunca foi ao porto.",
    cost: "Quem é minoria no ramo não senta, e um grupo pequeno pode travar a obra.",
  },
  dois_lados: {
    label:
      "Mesa do ramo, os dois lados. Quem emprega e quem trabalha sentam juntos. A cadeira dura com o ramo. Alguém acima segura para os ramos não se quebrarem.",
    problem: "A briga do ramo tem uma mesa, não uma guerra.",
    cost: "O ramo pode fechar a porta, e quem está de fora da mesa não entra.",
  },
  trabalho_nao_senta: {
    label:
      "O trabalho não dá cadeira. Cadeira vem do voto, da família ou do acordo. O ramo fala como qualquer outra pessoa.",
    problem: "O ramo não vira um segundo país.",
    cost: "Quem faz o trabalho obedece a quem nunca fez.",
  },
  continuidade: {
    label:
      "Deve continuar a família e a regra antiga. Comida pode vir depois, mas não é a razão do cargo.",
    problem: "O arranjo não cai por causa de um ano ruim.",
    cost: "A fome não tira quem manda.",
  },
  pao_e_terra: {
    label:
      "Deve comida, terra e teto. Se isso não chega, o costume troca a pessoa por outra da mesma família. A família fica.",
    problem: "O cargo se explica pelo que chega na mesa.",
    cost: "O cuidado vira favor de quem consegue falar com a família.",
  },
  so_a_forca: {
    label: "Não deve explicação. Fica no mando quem conseguir segurar.",
    problem: "A decisão não espera um julgamento do costume.",
    cost: "Quando erra, não há cobrança por dentro. Só a ruptura.",
  },
  continuidade_fim: {
    label: "Guardar o que já se sustentou, para o amanhã parecer com isso.",
    problem: "O país, ou o grupo, não se reinventa a cada susto.",
    cost: "O que já não serve continua de pé.",
  },
  cuidado_fim: {
    label: "Guardar comida, terra e teto para quem está embaixo.",
    problem: "A regra se mede na mesa, não só no papel.",
    cost: "Quem distribui escolhe quem vai ser favorecido.",
  },
  plano_fim: {
    label:
      "Guardar o plano na mão de quem produz, não de um dono nem de um gabinete longe.",
    problem: "A meta sai de quem faz o trabalho.",
    cost: "Quem não está na atividade não vota o plano.",
  },
  abrigo_fim: {
    label:
      "Guardar a gente da guerra e do mercado, mesmo se a assinatura for de fora.",
    problem: "Sobreviver pesa mais do que escrever o tratado sozinho.",
    cost: "A razão de mandar deixa de ser daqui.",
  },
  anciaos: {
    label: "Votam os mais velhos do sangue. Quem chegou depois ouve, mas não decide.",
    problem: "A memória do poço fica com quem já viveu outros anos difíceis.",
    cost: "Quem é novo não decide, mesmo se a água do poço for dele.",
  },
  leitor_no_circulo: {
    label: "Vota quem lê o texto sagrado do grupo, mesmo sem ser do sangue.",
    problem: "O costume ganha uma base que não é só a família.",
    cost: "Quem lê pode vir de fora do sangue e não sair mais.",
  },
  qualquer_do_vale: {
    label:
      "Vota quem vive no lugar agora, com ou sem o mesmo sangue. O mais velho fala primeiro, mas não fala sozinho.",
    problem: "Quem bebe a água tem voto.",
    cost: "Um ano de gente nova pode mudar a regra do poço.",
  },
  so_de_fora: {
    label:
      "Só quem está de fora muda o acordo. A câmara daqui cuida da rua e não mexe nisso.",
    problem: "O navio não fica parado por uma briga local.",
    cost: "A taxa do porto muda sem a nossa assinatura.",
  },
  os_dois: {
    label:
      "Os dois lados. Guerra e tratado só mudam se os dois assinarem. O dia a dia é daqui.",
    problem: "Não tem surpresa no acordo, nem bloqueio local no navio.",
    cost: "Se os dois não concordarem, ninguém resolve. O porto espera.",
  },
  saio_da_carta: {
    label:
      "O acordo era emprestado. Eu rasgo e fico com a última palavra, mesmo perdendo o navio.",
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

function playerCopy(choiceId: string, ctx: Ctx): Copy {
  if (choiceId === "ultima_aqui" && ctx.speechFora === "aldeia") {
    return {
      label:
        "Não aceito. A guarda de fora não entra. O povoado continua só com quem já senta na praça.",
      problem: "Ninguém de fora passa a mandar na praça.",
      cost: "Sem essa guarda, o povoado enfrenta a guerra sozinho.",
    };
  }
  return COPY[choiceId];
}

function labelFor(choiceId: string, ctx: Ctx): string {
  return playerCopy(choiceId, ctx).label;
}

function bodyFor(node: NodeId, ctx: Ctx, countryName: string): string {
  const name = sanitizeCountryName(countryName);
  switch (node) {
    case "unidade":
      return `${name} ainda não tem capital nem lei antiga. Tem povoado que só obedece a quem se conhece pelo nome, região com caixa e escola próprios, e gente que quer a mesma regra do porto até o interior. Onde as decisões do dia a dia vão ficar?`;
    case "fora":
      return ctx.speechFora === "aldeia"
        ? `Em ${name}, o povoado não aguenta uma guerra longa. Um poder de fora oferece guarda e arma. Em troca, essa guarda fica na praça. A vida do povoado continuaria com quem já mora ali. Você aceita?`
        : `Um país vizinho oferece navio, moeda estável e proteção. Em troca, guerra, alfândega e tratado passam para lá. Escola, rua e hospital continuam em ${name}. Você aceita essa troca?`;
    case "fonte":
      return ctx.fonteMode === "rosto"
        ? "O acordo com quem está de fora continua valendo: guerra e tratado não são daqui. Na rua, quem é a pessoa que manda no dia a dia?"
        : "A câmara, o porto e o culto estão na mesma capital e não se entendem. Quando os três batem o pé, quem tem o direito de mandar?";
    case "confianca":
      return "A câmara e quem governa pararam de se falar. A obra no rio está pela metade. A câmara pode tirar essa pessoa agora, ou ela fica até a data combinada?";
    case "prazo":
      return ctx.prazoMode === "curto"
        ? "A cadeira já é do ramo de trabalho, não de uma pessoa. O porto quer uma obra que leva vinte anos. Esse assento dura quanto tempo?"
        : "Alguém já está no cargo. O porto quer uma obra que leva vinte anos. Essa pessoa fica até quando?";
    case "sagrado":
      return ctx.sagradoFrom === "aldeia"
        ? "O texto sagrado pode ter vindo de fora do povoado. Ele proíbe uma coisa que o costume daqui agora quer permitir. Quem cede: o texto ou o costume?"
        : "O texto sagrado proíbe uma coisa que a maioria, ou os mais velhos, agora quer permitir. Quem cede: o texto ou a lei do dia a dia?";
    case "trabalho":
      return ctx.trabalhoFrom === "carta"
        ? "Guerra e tratado já estão no acordo com quem está de fora. Agora o porto, a lavoura e o hospital querem cadeira para escrever a regra do próprio ramo. Essa cadeira é daqui, ou o acordo de fora já decide isso?"
        : "O porto, a lavoura e o hospital querem cadeira na hora de escrever a regra do próprio ramo. Hoje quem senta chegou pelo voto, pela família ou pelo acordo. O trabalho passa a dar cadeira?";
    case "dever":
      return "Essa família manda há gerações. A colheita queimou e tem gente sem comida. O cargo basta, ou quem manda tem de garantir comida, terra e teto?";
    case "fim":
      if (ctx.fimFrom === "aldeia") {
        return `O povoado de ${name} só pode guardar uma prioridade. Se tiver de escolher uma, qual fica?`;
      }
      if (ctx.fimFrom === "carta") {
        return `Guerra e tratado já estão com quem está de fora. O que ainda é de ${name} só pode guardar uma prioridade. Qual fica?`;
      }
      return `O porto, a lavoura e a fronteira puxam para lados diferentes. Se ${name} só pudesse guardar uma prioridade, qual seria?`;
    case "circulo":
      return "O grupo vai decidir quem usa a água do poço. Nem todo mundo que bebe essa água nasceu no povoado. Quem tem voto?";
    case "carta":
      return "O acordo com quem está de fora já está assinado. O porto quer criar uma taxa nova. Quem pode mudar ou rasgar esse acordo?";
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
        const copy = playerCopy(choiceId, ctx);
        return {
          id: choiceId,
          label: copy.label,
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
    const copy = playerCopy(choiceId, ctx);
    steps.push({
      node,
      choiceId,
      params: effect.params,
      mole: effect.mole,
      sceneTitle,
      choiceLabel: copy.label,
      sentence: copy.problem,
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

export interface OrganizationSummary {
  id: (typeof PROFILE_IDS)[number];
  title: string;
  problem: string;
  cost: string;
}

/** Descriptive titles for the explainer. Internal ids stay off the quiz UI. */
export function organizationSummaries(): OrganizationSummary[] {
  return PROFILE_IDS.map((id) => {
    const copy = PROFILE_COPY[id];
    return {
      id,
      title: copy.title,
      problem: copy.problem,
      cost: copy.cost,
    };
  });
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
    "Não aceito. A guarda de fora não entra. O povoado continua só com quem já senta na praça.",
    "Ninguém de fora passa a mandar na praça.",
    "Sem essa guarda, o povoado enfrenta a guerra sozinho.",
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
