/**
 * Ideal-government flowchart.
 * Source of truth: docs/governo-ideal-fluxograma.md.
 * Axis scoring does not import this module.
 *
 * Internal profile ids stay in this file. The result object sent to the UI
 * carries Portuguese titles only.
 */

import type { InProgressStatus } from "@/lib/storage";

export const GOVERNMENT_RESULT_TITLE = "Seu governo ideal";
export const GOVERNMENT_RESULT_LEAD =
  "Descreve o arranjo que as escolhas desenharam: quem senta, até quando, e o preço. Não usa o perfil dos dez eixos, nem um nome de regime.";
export const NEAR_TIE_LINE =
  "Ficou perto. Os dois arranjos cabem nas suas escolhas. Nenhum leva sozinho.";

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
    title: "Uma linhagem no mando, por costume, difícil de desfazer",
    support:
      "A casa antiga segue. A regra não muda com o ano. Uma geração pode ficar presa ao desenho.",
    problem: "A casa antiga segue. A regra não muda com o ano.",
    cost: "Uma geração pode ficar presa ao desenho.",
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
    title: "Uma linhagem no mando, com dever de pão e terra",
    support:
      "A casa fica, e o título se explica pelo cuidado. O cuidado pode virar favor de quem está perto.",
    problem: "A casa fica, e o título se explica pelo cuidado.",
    cost: "O cuidado pode virar favor de quem está perto.",
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
    title: "Um chefe com prazo marcado, que a câmara não derruba no meio",
    support:
      "Uma pessoa governa até a data, mesmo se a casa resmungar. O erro dura até lá.",
    problem: "Uma pessoa governa até a data, mesmo se a casa resmungar.",
    cost: "O erro dura até lá.",
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
    title: "Um governo que cai quando a câmara retira a confiança",
    support:
      "Quem governa sai da casa e sai quando a casa deixa de confiar. Obra longa não atravessa a briga.",
    problem: "Quem governa sai da casa e sai quando a casa deixa de confiar.",
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
      "A regra civil para onde o texto não deixa passar. Quem lê o texto vira o cargo.",
    problem: "A regra civil para onde o texto não deixa passar.",
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
    title: "Conselhos de quem trabalha, com volta fácil do delegado",
    support:
      "O mando sobe da atividade, não desce da capital. O plano miúdo trava, e quem não está na base não senta.",
    problem: "O mando sobe da atividade, não desce da capital.",
    cost: "O plano miúdo trava, e quem não está na base não senta.",
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
    title: "Os ofícios no mando, os dois lados do ramo",
    support:
      "Quem produz e quem emprega no mesmo ramo sentam juntos, sob quem coordena. O ramo pode virar feudo.",
    problem:
      "Quem produz e quem emprega no mesmo ramo sentam juntos, sob quem coordena.",
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
    title: "Guerra e tratado nas mãos de fora; o cotidiano fica aqui",
    support:
      "A frota e a assinatura externa não dependem do nosso caixa. Quando a carta muda, não há como dizer não.",
    problem: "A frota e a assinatura externa não dependem do nosso caixa.",
    cost: "Quando a carta muda, não há como dizer não.",
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
    title: "O círculo do sangue e do costume, sem máquina de país",
    support:
      "A aldeia decide. O que houver de maior é aliança, não um mando único. A regra muda de vale para vale.",
    problem:
      "A aldeia decide. O que houver de maior é aliança, não um mando único.",
    cost: "A regra muda de vale para vale.",
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
  unidade: "Onde a decisão mora?",
  fora: "A última palavra pode morar fora?",
  fonte: "De onde vem o direito de mandar?",
  confianca: "O mando cai se a câmara retirar a confiança?",
  prazo: "Até quando dura quem manda?",
  sagrado: "A lei comum pode atravessar o sagrado?",
  trabalho: "O trabalho ganha cadeira?",
  dever: "O que a linhagem deve a quem vive dela?",
  fim: "Para que serve o mando?",
  circulo: "Quem conta no círculo miúdo?",
  carta: "Quem segura a carta de fora?",
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
      "No círculo de quem se conhece pelo nome. O que houver de maior é aliança, não um mando único.",
    problem: "A regra de longe não conhece o inverno daqui.",
    cost: "O vale ao lado faz outra lei, e quem chegou de fora não tem voz.",
  },
  regiao: {
    label:
      "Na região. Escola, guarda e parte do imposto ficam perto. O centro só segura a fronteira.",
    problem: "Clima e língua não são os da capital.",
    cost: "A região rica pode recusar partilha.",
  },
  pais: {
    label: "No país inteiro. A mesma regra chega na capital e na fronteira.",
    problem: "A decisão não muda de vale para vale.",
    cost: "O abuso no centro se espalha inteiro.",
  },
  carta_de_fora: {
    label: "Aceito a troca. Guerra e tratado saem daqui. O cotidiano fica.",
    problem: "Frota e crédito não dependem do nosso inverno.",
    cost: "Quando a carta muda, não há a quem dizer não.",
  },
  ultima_aqui: {
    label: "Não. Guerra, moeda e tratado ficam aqui, mesmo mais fracos.",
    problem: "Ninguém de fora reescreve a regra.",
    cost: "A frota e o crédito saem do nosso caixa.",
  },
  voto_contado: {
    label: "Um voto contado, de todo o país.",
    problem: "Quem perde sabe o tamanho da derrota.",
    cost: "Meio país obedece a uma maioria de um ano.",
  },
  linhagem: {
    label:
      "Um nome que já vinha. A casa, ou o costume que aponta o seguinte sem abrir urna.",
    problem: "O mando não recomeça a cada estação.",
    cost: "Quem nasceu fora dessa linha não chega lá.",
  },
  leitor_do_texto: {
    label: "Quem lê a lei sagrada e diz o que ela exige agora.",
    problem: "A regra não fica ao sabor do medo de um ano.",
    cost: "Quem não lê o texto não revoga quem lê.",
  },
  rosto_nomeado: {
    label: "Um rosto daqui, posto e tirado por quem está de fora.",
    problem: "A rua tem a quem procurar.",
    cost: "Esse rosto não diz não à carta.",
  },
  rosto_com_prazo: {
    label:
      "Um rosto daqui, escolhido aqui, com data para sair. A carta de fora segue valendo por cima.",
    problem: "O cotidiano troca de chefe sem esperar o de fora.",
    cost: "A data local não muda a guerra nem o tratado.",
  },
  rosto_camara: {
    label:
      "O rosto local cai se a câmara daqui retirar a confiança. A carta segue por cima.",
    problem: "A casa local corrige quem administra a rua.",
    cost: "A carta não cai junto.",
  },
  de_quem_trabalha: {
    label:
      "De quem trabalha na atividade, não de um voto geral nem de um nome antigo.",
    problem: "Quem não põe a mão na coisa não desenha a regra dela.",
    cost: "Quem está fora da atividade fica sem cadeira.",
  },
  mesmo_sangue: {
    label:
      "De quem é do mesmo sangue e da mesma aldeia, mesmo que a unidade lá atrás tenha sido o país.",
    problem: "O mando não é um estranho com carimbo.",
    cost: "O país que se disse inteiro não cabe nessa regra.",
  },
  cai: {
    label:
      "Cai. O governo só dura enquanto a câmara confia. Outro nome, saído dessa casa, segue a obra ou a enterra.",
    problem: "O mando que perdeu a casa não fica até o estrago completar.",
    cost: "A obra longa não atravessa a briga.",
  },
  fica_ate_a_data: {
    label:
      "Não cai. Houve uma escolha com data. A pessoa fica até lá. A câmara pode travar a lei, não o cargo.",
    problem: "O programa eleito não morre numa moção.",
    cost: "O erro dura até a data.",
  },
  a_casa_governa: {
    label:
      "Não há chefe separado. A própria câmara governa por um grupo que ela desfaz quando quiser.",
    problem: "Não existe um mando ao lado da casa, disputando com ela.",
    cost: "Ninguém responde sozinho quando a obra para.",
  },
  enquanto_confiam: {
    label:
      "Enquanto a confiança durar. Um círculo estreito, não o país inteiro, pode trocar o nome.",
    problem: "A linhagem segue, a pessoa não é eterna.",
    cost: "O círculo estreito vira o verdadeiro cargo.",
  },
  prazo_marcado: {
    label: "Um prazo marcado, e depois sai. O seguinte pode ser de outra casa.",
    problem: "Dá para contar o fim.",
    cost: "Vinte anos de mina não cabem num prazo curto. Quem espera herdar não constrói.",
  },
  vida_ou_linha: {
    label: "A vida inteira, e depois quem a linha já aponta.",
    problem: "O desenho sobrevive a quem está vivo.",
    cost: "Uma geração inteira não escolhe de novo.",
  },
  cadeira_do_ramo: {
    label: "A cadeira não é de pessoa. Dura enquanto o ramo existir.",
    problem: "O ofício não depende do herdeiro.",
    cost: "O ramo que sentou não sai quando o país muda de ideia.",
  },
  texto_trava: {
    label: "A lei comum cede. Quem guarda o texto trava a mudança.",
    problem: "Um susto não risca o que foi posto acima da maioria.",
    cost: "O intérprete vira o cargo, e o texto não envelhece em público.",
  },
  texto_aconselha: {
    label: "O texto aconselha. Se a câmara, ou o círculo, insistir, a lei comum passa.",
    problem: "O culto não congela o país.",
    cost: "O que era chão vira opinião.",
  },
  culto_miudo: {
    label: "Cada círculo guarda o seu culto. Não há um texto só para Valmora.",
    problem: "O vale não reza a regra do vizinho.",
    cost: "Não existe um chão comum quando os círculos se encontram.",
  },
  base_puxa: {
    label:
      "Conselho de quem trabalha. O delegado volta quando a base puxa. Quem só é dono não tem cadeira própria.",
    problem: "O plano sai de quem faz, não de um gabinete que nunca desceu a mina.",
    cost: "A minoria do ofício não senta, e o plano miúdo trava o rio.",
  },
  dois_lados: {
    label:
      "Banca do ramo, os dois lados. Quem emprega e quem trabalha sentam juntos. A cadeira dura com o ramo. Alguém acima coordena para os ramos não se quebrarem.",
    problem: "O conflito do ramo tem uma mesa, não uma guerra.",
    cost: "O ramo vira feudo, e quem está de fora da banca não entra.",
  },
  trabalho_nao_senta: {
    label:
      "O trabalho não dá cadeira. Cadeira vem do voto, da linhagem ou da carta. O ramo fala como qualquer um.",
    problem: "O ofício não vira um segundo país.",
    cost: "Quem faz a coisa obedece a quem nunca a fez.",
  },
  continuidade: {
    label:
      "Deve a continuidade. A lei antiga e a linha. Pão é consequência, não a razão do título.",
    problem: "O desenho não se rende a um inverno.",
    cost: "A fome não tira o mando.",
  },
  pao_e_terra: {
    label:
      "Deve pão, terra e teto. Se o cuidado não chega, o próprio costume acusa o nome. A linha fica; o ocupante pode ser trocado por outro da mesma linha.",
    problem: "O título se explica pelo que chega à mesa.",
    cost: "O cuidado vira favor de quem alcança o ouvido da casa.",
  },
  so_a_forca: {
    label: "Não deve conta. Segura quem puder segurar.",
    problem: "A decisão não espera um julgamento do costume.",
    cost: "Não há acusação interna quando o mando erra. Só a ruptura.",
  },
  continuidade_fim: {
    label: "Que o amanhã se pareça com o que já se sustentou.",
    problem: "O país, ou o círculo, não se reinventa a cada susto.",
    cost: "O que já não cabe continua de pé.",
  },
  cuidado_fim: {
    label: "Que pão, terra e teto cheguem a quem está por baixo.",
    problem: "A regra se mede na mesa, não só no selo.",
    cost: "Quem distribui escolhe o favorecido.",
  },
  plano_fim: {
    label: "Que quem produz dirija o plano, e não um dono ou um gabinete distante.",
    problem: "A meta sai do chão da atividade.",
    cost: "Quem não está na atividade não vota o plano.",
  },
  abrigo_fim: {
    label: "Que a guerra e o mercado não nos engulam, mesmo que a assinatura seja de fora.",
    problem: "Sobreviver pesa mais do que escrever sozinho o tratado.",
    cost: "A razão do mando deixa de ser daqui.",
  },
  anciaos: {
    label: "Contam os mais velhos do sangue. Quem chegou depois ouve, não decide.",
    problem: "A memória do poço está em quem viu os outros invernos.",
    cost: "O novo não decide, mesmo que o poço seja a água dele.",
  },
  leitor_no_circulo: {
    label: "Conta quem lê o texto sagrado do círculo, mesmo sem ser do sangue.",
    problem: "O costume ganha um chão que não é só a família.",
    cost: "O leitor vem de fora do sangue e pode não sair.",
  },
  qualquer_do_vale: {
    label:
      "Conta quem vive no vale agora, sangue ou não. O mais velho fala primeiro, não fala sozinho.",
    problem: "Quem bebe a água tem voz.",
    cost: "Um inverno de chegantes muda a regra do poço.",
  },
  so_de_fora: {
    label: "Só quem está de fora. A câmara daqui administra a rua e não toca na carta.",
    problem: "A frota não fica refém de uma briga local.",
    cost: "A taxa da mina muda sem o nosso selo.",
  },
  os_dois: {
    label:
      "Os dois lados. Guerra e tratado mudam só se os dois assinarem. O cotidiano é daqui.",
    problem: "Não há surpresa na carta, nem bloqueio local na frota.",
    cost: "O impasse não tem dono. A mina espera.",
  },
  saio_da_carta: {
    label:
      "A carta era um empréstimo. Neste caso rasgo e fico com a última palavra, mesmo sem a frota.",
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
    return "Não. Aliança só com quem senta no círculo.";
  }
  return COPY[choiceId].label;
}

function bodyFor(node: NodeId, ctx: Ctx): string {
  switch (node) {
    case "unidade":
      return "Valmora cabe numa viagem de semanas. Tem aldeia que só obedece a quem viu nascer, região com caixa próprio, e gente que quer uma regra só da mina até a fronteira. Onde a decisão mora de verdade?";
    case "fora":
      return ctx.speechFora === "aldeia"
        ? "A aldeia não segura uma guerra longa. Um poder de fora oferece guarda. A praça continuaria de quem já senta nela."
        : "Um poder vizinho oferece frota, moeda estável e tratado. Em troca, guerra, alfândega e a assinatura externa passam para lá. Escola, rua e hospital podem ficar aqui.";
    case "fonte":
      return ctx.fonteMode === "rosto"
        ? "A carta segue por cima. Na rua, quem é o rosto daqui?"
        : "A câmara, a mina e o culto cabem na mesma capital. Quando os três batem o pé, quem tem o direito de mandar?";
    case "confianca":
      return "A câmara e o chefe deixaram de se falar. A obra no rio está no meio. O que acontece com quem governa?";
    case "prazo":
      return ctx.prazoMode === "curto"
        ? "A cadeira já é do ramo, não de uma pessoa. A mina pede uma obra de vinte anos. Até quando esse assento dura?"
        : "O nome já está no cargo. A mina pede uma obra de vinte anos. Até quando esse mando dura?";
    case "sagrado":
      return ctx.sagradoFrom === "aldeia"
        ? "O texto pode ser de fora do vale. A lei sagrada proíbe o que o costume da aldeia agora quer permitir. Quem cede?"
        : "A lei sagrada proíbe o que a maioria, ou o ancião, agora quer permitir. Quem cede?";
    case "trabalho":
      return ctx.trabalhoFrom === "carta"
        ? "A carta já guarda a guerra e o tratado. A mina, o porto e o hospital querem sentar na regra do ramo. A cadeira é daqui, ou já vem escrita na carta?"
        : "A mina, o porto e o hospital querem sentar quando se escreve a regra do ramo. Hoje quem senta veio do voto, do nome ou da carta.";
    case "dever":
      return "A casa está no mando há gerações. O inverno queimou a colheita. Há quem diga que o título basta, e quem diga que o título sem pão é só um nome.";
    case "fim":
      if (ctx.fimFrom === "aldeia") {
        return "O inverno do vale pede uma razão. Se o círculo só pudesse guardar uma, qual seria?";
      }
      if (ctx.fimFrom === "carta") {
        return "A carta já segura a guerra. O inverno, a mina e a rua pedem uma razão para o que ainda é daqui. Se o mando só pudesse guardar uma, qual seria?";
      }
      return "O inverno, a mina e a fronteira pedem uma razão. Se o mando só pudesse guardar uma, qual seria?";
    case "circulo":
      return "O círculo vai decidir a água do poço. Nem todo mundo que bebe a água nasceu ali.";
    case "carta":
      return "A carta está assinada. A mina quer uma taxa nova. Quem pode rasgar ou reescrever isso?";
    default:
      return "";
  }
}

function present(node: NodeId, steps: readonly Step[]): FlowScene {
  const ctx = context(steps);
  return {
    id: node,
    title: NODE_TITLE[node],
    body: bodyFor(node, ctx),
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
}): InProgressStatus {
  const { index, choiceIds } = progress;
  if (choiceIds.length === 0) return "invalid";
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
): FlowScene | null {
  if (!Number.isInteger(index) || index < 0) return null;
  const prefix = choiceIds.slice(0, index);
  const walk = walkChoices(prefix);
  if (!walk.ok || !walk.next) return null;
  if (index < choiceIds.length) {
    const scene = present(walk.next, walk.steps);
    if (!scene.choices.some((choice) => choice.id === choiceIds[index])) {
      return null;
    }
  }
  return present(walk.next, walk.steps);
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
    GOVERNMENT_RESULT_LEAD,
    NEAR_TIE_LINE,
    ...Object.values(NODE_TITLE),
    ...Object.values(COPY).flatMap((copy) => [copy.label, copy.problem, copy.cost]),
    ...Object.values(PROFILE_COPY).flatMap((copy) => [
      copy.title,
      copy.support,
      copy.problem,
      copy.cost,
    ]),
    "Não. Aliança só com quem senta no círculo.",
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
      strings.push(bodyFor(node, ctx));
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
