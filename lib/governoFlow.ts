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
  "circulo",
  "carta",
  "principios",
  "distribuicao",
  "cidadania",
  "religiao",
  "burocracia",
  "exercito",
  "marinha",
  "seguranca",
  "justica",
  "fim",
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
  /** Internal id. The result screen uses it only to name the classroom organization. */
  profileId: ProfileId;
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
      escala: 3,
      fora: 2,
      quem: 8,
      prazo: 2,
      queda: 1,
      tutela: -2,
      tradicao: 8,
      parentesco: 1,
      ordem: 8,
    },
  },
  monarquia_social: {
    title: "Uma família manda, mas tem de garantir comida, terra e teto",
    support:
      "A família fica no cargo porque cuida de quem está embaixo. Esse cuidado pode virar favor para quem chega perto da família.",
    problem: "A família fica no cargo porque cuida de quem está embaixo.",
    cost: "Esse cuidado pode virar favor para quem chega perto da família.",
    centroid: {
      escala: 3,
      fora: 2,
      quem: 8,
      prazo: 1,
      queda: 1,
      tutela: -2,
      tradicao: 7,
      parentesco: 1,
      ordem: 4,
      cuidado: 5,
    },
  },
  presidencialista: {
    title: "Um chefe fica até a data marcada, e a câmara não tira no meio",
    support:
      "Uma pessoa governa até o dia combinado, mesmo se a câmara reclamar. Se errar, o erro fica até essa data.",
    problem: "Uma pessoa governa até o dia combinado, mesmo se a câmara reclamar.",
    cost: "Se errar, o erro fica até essa data.",
    centroid: {
      escala: 3,
      fora: 2,
      quem: 6,
      prazo: 1,
      queda: 3,
      tutela: -2,
      voto: 4,
      tradicao: 1,
      ordem: 8,
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
      quem: -6,
      prazo: -2,
      queda: -9,
      tutela: -2,
      voto: 6,
      ordem: 1,
    },
  },
  teocrata: {
    title: "A lei sagrada fica acima da lei do dia a dia",
    support:
      "A lei do dia a dia só vale até onde o texto sagrado deixa. Quem interpreta o texto é quem manda de verdade.",
    problem: "A lei do dia a dia só vale até onde o texto sagrado deixa.",
    cost: "Quem interpreta o texto é quem manda de verdade.",
    centroid: {
      escala: 3,
      fora: 2,
      quem: 3,
      queda: 1,
      tutela: -2,
      tradicao: 1,
      sagrado: 9,
      ordem: 7,
    },
  },
  sovietica: {
    title: "Quem trabalha manda, e pode trocar o representante fácil",
    support:
      "A ordem vem de quem faz o trabalho, não de um gabinete na capital. Um grupo pequeno pode travar a obra, e quem não trabalha na base não tem cadeira.",
    problem: "A ordem vem de quem faz o trabalho, não de um gabinete na capital.",
    cost: "Um grupo pequeno pode travar a obra, e quem não trabalha na base não tem cadeira.",
    centroid: {
      escala: 2,
      fora: 2,
      quem: -3,
      prazo: -7,
      queda: -1,
      tutela: -2,
      conselho: 9,
      plano: 7,
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
      quem: -3,
      prazo: 2,
      queda: -1,
      tutela: -2,
      tradicao: 1,
      oficio: 10,
      ordem: 6,
      plano: 2,
    },
  },
  colonia: {
    title: "Guerra e tratado ficam com quem está de fora; o dia a dia fica aqui",
    support:
      "Navio e assinatura de fora não dependem do nosso caixa. Se o acordo mudar, a gente não tem como dizer não.",
    problem: "Navio e assinatura de fora não dependem do nosso caixa.",
    cost: "Se o acordo mudar, a gente não tem como dizer não.",
    centroid: {
      escala: 3,
      fora: -4,
      quem: 2,
      queda: 2,
      tutela: 13,
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
      escala: -5,
      fora: 3,
      quem: -1,
      prazo: 1,
      tradicao: 2,
      sagrado: -1,
      parentesco: 8,
      ordem: 1,
      cuidado: 3,
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
  circulo: "Quem vota no grupo pequeno?",
  carta: "Quem pode mudar o acordo com quem está de fora?",
  principios: "Para que servem as primeiras regras?",
  distribuicao: "Onde o mando fica de verdade?",
  cidadania: "Quem recebe o papel de membro?",
  religiao: "O que o caixa e o cargo fazem com a religião?",
  burocracia: "Quem escreve a lista e cobra o imposto?",
  exercito: "Quem comanda a tropa de terra?",
  marinha: "Quem comanda os barcos e o porto?",
  seguranca: "Quem separa a briga na rua?",
  justica: "Quem julga uma briga entre duas pessoas?",
  fim: "Se só pudesse guardar uma coisa, qual seria?",
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
  circulo: ["anciaos", "leitor_no_circulo", "qualquer_do_vale"],
  carta: ["so_de_fora", "os_dois", "saio_da_carta"],
  principios: [
    "pri_continuidade",
    "pri_cuidado",
    "pri_plano",
    "pri_abrigo",
    "pri_troca",
  ],
  distribuicao: ["dist_um", "dist_varias", "dist_lugares", "dist_fora"],
  cidadania: [
    "cid_sangue",
    "cid_morador",
    "cid_base",
    "cid_ramo",
    "cid_texto",
    "cid_fora",
  ],
  religiao: ["rel_acima", "rel_aconselha", "rel_cada", "rel_neutro"],
  burocracia: [
    "bur_familia",
    "bur_prova",
    "bur_base",
    "bur_ramo",
    "bur_fora",
    "bur_texto",
    "bur_povo",
  ],
  exercito: ["ex_chefe", "ex_camara", "ex_povo", "ex_base", "ex_fora", "ex_ramo"],
  marinha: ["mar_chefe", "mar_camara", "mar_base", "mar_ramo", "mar_povo", "mar_fora"],
  seguranca: [
    "seg_chefe",
    "seg_povo",
    "seg_base",
    "seg_texto",
    "seg_fora",
    "seg_ramo",
    "seg_camara",
  ],
  justica: [
    "ju_costume",
    "ju_escrita",
    "ju_camara",
    "ju_base",
    "ju_ramo",
    "ju_texto",
    "ju_fora",
  ],
  fim: ["continuidade_fim", "cuidado_fim", "plano_fim", "abrigo_fim", "camara_fim"],
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
  pri_continuidade: {
    label:
      "Servem para o mando e a regra não trocarem de família a cada susto. Comida e voto podem vir depois.",
    problem: "O arranjo de amanhã parece com o de hoje.",
    cost: "Quem quer mudar a regra espera uma geração.",
  },
  pri_cuidado: {
    label:
      "Servem para comida, terra e teto chegarem em quem está embaixo, antes de qualquer outro fim.",
    problem: "A regra se mede na mesa.",
    cost: "Quem distribui escolhe quem vai ser favorecido.",
  },
  pri_plano: {
    label:
      "Servem para o plano de trabalho sair de quem produz, não de um gabinete longe do porto.",
    problem: "A meta sai de quem faz o trabalho.",
    cost: "Quem não está na atividade não vota o plano.",
  },
  pri_abrigo: {
    label:
      "Servem para o país não enfrentar guerra e mercado sozinho, mesmo se a assinatura for de fora.",
    problem: "Sobreviver pesa mais do que escrever o tratado sozinho.",
    cost: "Parte da razão de mandar deixa de ser daqui.",
  },
  pri_troca: {
    label:
      "Servem para a câmara trocar quem governa quando deixa de confiar, sem esperar uma data marcada.",
    problem: "Quem perdeu a câmara não fica até o estrago terminar.",
    cost: "Uma obra longa pode morrer no meio da briga.",
  },
  dist_um: {
    label:
      "Fica numa pessoa só. A câmara pode travar a lei, mas não divide o cargo com essa pessoa.",
    problem: "Tem um nome para procurar quando a decisão trava.",
    cost: "Se essa pessoa errar, o erro vale no país inteiro.",
  },
  dist_varias: {
    label:
      "Fica repartido. Nenhuma pessoa segura o cargo sozinha, e a câmara pode tirar quem governa.",
    problem: "Um erro não fica preso numa pessoa até o fim do prazo.",
    cost: "Quando ninguém responde sozinho, a obra para no meio.",
  },
  dist_lugares: {
    label: "Fica em cada povoado. O que houver de capital não manda na regra da praça.",
    problem: "Quem conhece o poço decide o poço.",
    cost: "A regra de um lugar não vale no outro.",
  },
  dist_fora: {
    label:
      "Guerra, tratado e a última palavra ficam com quem está de fora. O dia a dia da rua fica aqui.",
    problem: "Navio e assinatura não dependem do nosso caixa.",
    cost: "Se o acordo mudar, a gente não tem como dizer não.",
  },
  cid_sangue: {
    label:
      "Quem nasce na família e no povoado que já estavam aqui. Quem chegou depois mora, mas não vota nem herda cargo.",
    problem: "O mando não passa para quem acabou de chegar.",
    cost: "Quem nasceu fora dessa família pode viver a vida inteira sem voto.",
  },
  cid_morador: {
    label:
      "Quem mora aqui e entra na lista. O voto é contado, sem pedir sangue nem ramo de trabalho.",
    problem: "Quem vive aqui tem o mesmo papel na hora de votar.",
    cost: "Um ano de gente nova pode mudar quem manda.",
  },
  cid_base: {
    label:
      "Quem trabalha na base e senta no conselho do próprio ramo. Quem não trabalha nessa atividade não recebe o papel.",
    problem: "O papel sai do trabalho, não do nascimento.",
    cost: "Quem está sem essa atividade fica sem voto e sem cadeira.",
  },
  cid_ramo: {
    label:
      "Quem pertence a um ramo de trabalho, patrão ou empregado. Quem está fora do ramo não recebe o papel.",
    problem: "A cadeira segue o ofício, não a família.",
    cost: "O ramo pode fechar a porta para quem não é do ofício.",
  },
  cid_texto: {
    label:
      "Quem aceita a lei sagrada e obedece a quem a lê. Sem isso, a pessoa mora aqui, mas não vota nem ocupa cargo.",
    problem: "O papel segue o texto, não o nascimento.",
    cost: "Quem não segue o texto fica fora da decisão.",
  },
  cid_fora: {
    label:
      "Quem está de fora confirma o papel. A lista daqui não basta para votar nem para ocupar cargo.",
    problem: "A lista não muda sem a assinatura de fora.",
    cost: "A gente daqui não decide sozinha quem é membro.",
  },
  rel_acima: {
    label:
      "O culto entra no governo. O caixa paga o culto, e quem lê o texto senta junto de quem manda.",
    problem: "A religião não fica só na casa de quem crê.",
    cost: "Quem não segue esse culto paga o caixa e obedece mesmo assim.",
  },
  rel_aconselha: {
    label:
      "O culto aconselha, sem cadeira e sem dinheiro do caixa. A lei segue sem a assinatura de quem lê o texto.",
    problem: "O culto não congela a regra nem o caixa.",
    cost: "Quem guarda o texto não trava a mudança.",
  },
  rel_cada: {
    label:
      "Cada povoado guarda o próprio culto, com o próprio caixa. Não existe um culto pago pelo país.",
    problem: "O povoado não paga o culto do vizinho.",
    cost: "Quando os grupos se encontram, não há um culto comum.",
  },
  rel_neutro: {
    label:
      "O caixa não paga culto nenhum, e o cargo não pergunta a religião de quem senta.",
    problem: "O cargo não escolhe pela fé.",
    cost: "O culto que precisa de dinheiro do caixa não recebe.",
  },
  bur_familia: {
    label:
      "Senta alguém da família que já manda. O cargo passa com o nome, sem prova aberta a quem quiser.",
    problem: "O papel não muda de mão a cada ano.",
    cost: "Quem nasceu fora dessa família não chega nesse cargo.",
  },
  bur_prova: {
    label:
      "Senta quem passa numa prova igual para todo mundo. A família e o voto não escolhem o nome.",
    problem: "O cargo não é herança nem favor.",
    cost: "Quem não passou na prova não entra, mesmo se a praça confiar nessa pessoa.",
  },
  bur_base: {
    label:
      "Senta alguém mandado pela base de quem trabalha. A base pode puxar essa pessoa de volta no meio da cobrança.",
    problem: "O papel do imposto sai de quem faz o trabalho.",
    cost: "A base pode trocar a pessoa no meio da cobrança.",
  },
  bur_ramo: {
    label:
      "Senta alguém do próprio ramo. O porto cobra o porto, e a lavoura cobra a lavoura.",
    problem: "Quem cobra conhece o ofício.",
    cost: "O ramo cobra a si mesmo, e quem está fora não entra na conta.",
  },
  bur_fora: {
    label:
      "Senta alguém colocado por quem está de fora. A lista daqui não escolhe esse nome.",
    problem: "A cobrança não para numa briga local.",
    cost: "Essa pessoa não responde à praça daqui.",
  },
  bur_texto: {
    label:
      "Senta quem lê a lei sagrada. Essa pessoa aplica o texto na cobrança e no papel.",
    problem: "A lista segue o texto, não o favor.",
    cost: "Quem não lê o texto não chega nesse cargo.",
  },
  bur_povo: {
    label:
      "Senta alguém do sangue do povoado, escolhido na praça. Não é prova de longe nem família de uma capital.",
    problem: "O livro da praça fica com quem já vive ali.",
    cost: "Quem chegou depois não escreve nem cobra.",
  },
  ex_chefe: {
    label:
      "Uma pessoa só, a mesma que governa. A tropa obedece a esse nome, não à câmara.",
    problem: "A ordem de guerra não se divide no meio do caminho.",
    cost: "Se essa pessoa errar, a tropa inteira erra com ela.",
  },
  ex_camara: {
    label:
      "A câmara. A tropa só sai se a câmara mandar, e a câmara pode chamar a tropa de volta.",
    problem: "A guerra não fica na mão de uma pessoa só.",
    cost: "A câmara pode travar a saída no meio da briga.",
  },
  ex_povo: {
    label: "Cada povoado manda a própria turma. Não existe uma tropa do país inteiro.",
    problem: "Quem luta conhece o lugar.",
    cost: "O povoado ao lado pode não vir quando a guerra chegar aqui.",
  },
  ex_base: {
    label:
      "O conselho de quem trabalha. A tropa obedece a esse conselho, e a base pode trocar o comando.",
    problem: "A ordem de guerra sai de quem produz, não de um gabinete.",
    cost: "A base pode trocar o comando no meio da campanha.",
  },
  ex_fora: {
    label:
      "Quem está de fora. A tropa daqui não decide sozinha quando sai nem contra quem.",
    problem: "A arma não sai do nosso caixa.",
    cost: "A tropa pode ir para uma guerra que a praça não escolheu.",
  },
  ex_ramo: {
    label:
      "O ramo de quem faz arma e estrada, com alguém acima dos ramos. A tropa não é de uma família só.",
    problem: "Quem equipa a tropa senta na ordem.",
    cost: "O ramo de arma ganha voz que os outros ramos não têm.",
  },
  mar_chefe: {
    label: "A mesma pessoa que governa. Porto e barco obedecem a esse nome.",
    problem: "Barco e terra não recebem duas ordens diferentes.",
    cost: "Um erro nessa pessoa para o porto inteiro.",
  },
  mar_camara: {
    label:
      "A câmara. Barco nenhum sai sem o voto dela, e ela pode chamar o barco de volta.",
    problem: "O porto não fica na mão de uma pessoa só.",
    cost: "Uma briga na câmara deixa o barco parado.",
  },
  mar_base: {
    label:
      "O conselho de quem trabalha no porto. Esse conselho manda no barco e pode trocar o comando.",
    problem: "A ordem sai de quem carrega e navega.",
    cost: "Um grupo pequeno no porto pode travar o barco.",
  },
  mar_ramo: {
    label:
      "O ramo do porto e do estaleiro, patrão e empregado na mesma mesa, com alguém acima.",
    problem: "Quem constrói o barco senta na ordem.",
    cost: "O ramo do porto pode fechar o cais para os outros.",
  },
  mar_povo: {
    label: "Cada povoado manda os próprios barcos. Não existe uma frota do país.",
    problem: "O barco fica com quem conhece o rio.",
    cost: "Não há frota comum quando a guerra chega pela água.",
  },
  mar_fora: {
    label:
      "Quem está de fora. O barco grande e a guarda do porto obedecem a essa assinatura.",
    problem: "O barco grande não depende do nosso caixa.",
    cost: "O porto pode fechar por uma ordem que a gente daqui não deu.",
  },
  seg_chefe: {
    label: "A mesma pessoa que governa. A guarda da rua obedece a esse nome.",
    problem: "A ordem da rua não briga com a ordem do cargo.",
    cost: "Essa pessoa pode usar a guarda contra quem reclama dela.",
  },
  seg_povo: {
    label: "A própria praça do povoado. A guarda é de quem mora ali, não de uma capital.",
    problem: "Quem vigia conhece a rua.",
    cost: "A guarda de um povoado não entra no outro.",
  },
  seg_base: {
    label:
      "O conselho de quem trabalha. A guarda obedece a esse conselho, e a base pode trocar quem comanda.",
    problem: "A guarda não fica num gabinete longe do trabalho.",
    cost: "A base pode puxar a guarda no meio de uma prisão.",
  },
  seg_texto: {
    label: "Quem lê a lei sagrada. A guarda prende o que o texto manda prender.",
    problem: "A prisão segue o texto, não o favor.",
    cost: "Quem interpreta o texto decide quem é preso.",
  },
  seg_fora: {
    label: "Quem está de fora. A guarda da rua obedece a essa assinatura.",
    problem: "A arma da rua não sai do nosso caixa.",
    cost: "A prisão pode seguir uma ordem que a praça não deu.",
  },
  seg_ramo: {
    label:
      "O ramo de cada ofício vigia o próprio ramo. A lavoura vigia a lavoura, e o porto vigia o porto.",
    problem: "Quem vigia conhece o ofício.",
    cost: "O ramo pode proteger os seus e fechar a porta.",
  },
  seg_camara: {
    label: "A câmara. A guarda só age com ordem dela, e ela pode tirar o comando.",
    problem: "A prisão não fica na mão de uma pessoa só.",
    cost: "A câmara pode travar a guarda no meio da briga.",
  },
  ju_costume: {
    label:
      "Os mais velhos, pelo costume. Não tem papel escrito acima do que a praça já faz.",
    problem: "O julgamento conhece a vida daqui.",
    cost: "Quem chegou depois não conhece o costume que decide a briga.",
  },
  ju_escrita: {
    label:
      "Uma pessoa com a lei escrita, no cargo até a data marcada. A câmara não muda a sentença no meio.",
    problem: "A sentença não muda com o humor da câmara.",
    cost: "Se a lei escrita errar, o erro vale até a data.",
  },
  ju_camara: {
    label:
      "A câmara, ou um grupo que ela escolhe e pode desfazer. A sentença cai se a câmara tirar a confiança.",
    problem: "O julgamento não fica numa pessoa só.",
    cost: "A sentença pode mudar no meio da briga da câmara.",
  },
  ju_base: {
    label:
      "O conselho de quem trabalha no ramo da briga. A base pode trocar quem julga.",
    problem: "Quem julga conhece o trabalho.",
    cost: "Quem não é da base não entra nesse julgamento.",
  },
  ju_ramo: {
    label:
      "A mesa do ramo, patrão e empregado juntos, com alguém acima para os ramos não se quebrarem.",
    problem: "A briga do ofício tem mesa, não guerra.",
    cost: "O ramo julga os seus, e quem está fora da mesa não entra.",
  },
  ju_texto: {
    label: "Quem lê a lei sagrada. A sentença tem de caber no texto.",
    problem: "A sentença não muda com o susto do ano.",
    cost: "Quem interpreta o texto decide a briga.",
  },
  ju_fora: {
    label:
      "Quem está de fora, ou alguém que essa assinatura coloca. A sentença daqui não vale sozinha.",
    problem: "A briga grande não para por falta de juiz daqui.",
    cost: "A sentença pode vir de quem não vive a briga.",
  },
  camara_fim: {
    label: "Guardar o poder da câmara de trocar quem governa no meio do caminho.",
    problem: "Quem perdeu a câmara não fica até o estrago terminar.",
    cost: "Uma obra longa pode morrer no meio da briga.",
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
    case "pri_continuidade":
      return {
        params: { ordem: 1, tradicao: 1 },
        mole: { monarquista: 1, teocrata: 1, corporacao: 1 },
      };
    case "pri_cuidado":
      return {
        params: { cuidado: 1 },
        mole: { monarquia_social: 1, tribal: 1 },
      };
    case "pri_plano":
      return {
        params: { plano: 1, conselho: 1 },
        mole: { sovietica: 1 },
      };
    case "pri_abrigo":
      return { params: { tutela: 1 }, mole: { colonia: 1 } };
    case "pri_troca":
      return {
        params: { voto: 1, queda: -1 },
        mole: { parlamentarista: 1 },
      };
    case "dist_um":
      return {
        params: { quem: 1, escala: 1 },
        mole: { monarquista: 1, monarquia_social: 1, presidencialista: 1 },
      };
    case "dist_varias":
      return {
        params: { quem: -1, queda: -1 },
        mole: { parlamentarista: 1, sovietica: 1 },
      };
    case "dist_lugares":
      return { params: { escala: -1 }, mole: { tribal: 1 } };
    case "dist_fora":
      return {
        params: { tutela: 1, fora: -1 },
        mole: { colonia: 1 },
      };
    case "cid_sangue":
      return {
        params: { parentesco: 1, tradicao: 1 },
        mole: { monarquista: 1, monarquia_social: 1, tribal: 1 },
      };
    case "cid_morador":
      return {
        params: { voto: 1 },
        mole: { presidencialista: 1, parlamentarista: 1 },
      };
    case "cid_base":
      return {
        params: { conselho: 1, plano: 1 },
        mole: { sovietica: 1 },
      };
    case "cid_ramo":
      return { params: { oficio: 1 }, mole: { corporacao: 1 } };
    case "cid_texto":
      return { params: { sagrado: 1 }, mole: { teocrata: 1 } };
    case "cid_fora":
      return { params: { tutela: 1 }, mole: { colonia: 1 } };
    case "rel_acima":
      return {
        params: { sagrado: 1, ordem: 1 },
        mole: { teocrata: 2 },
      };
    case "rel_aconselha":
      return { params: { sagrado: -1 }, mole: { teocrata: -1 } };
    case "rel_cada":
      return {
        params: { sagrado: -1, escala: -1 },
        mole: { tribal: 1 },
      };
    case "rel_neutro":
      return { params: {}, mole: { teocrata: -1 } };
    case "bur_familia":
      return {
        params: { tradicao: 1, quem: 1 },
        mole: { monarquista: 1, monarquia_social: 1 },
      };
    case "bur_prova":
      return {
        params: { ordem: 1, voto: 1 },
        mole: { presidencialista: 1, parlamentarista: 1 },
      };
    case "bur_base":
      return {
        params: { conselho: 1, prazo: -1 },
        mole: { sovietica: 1 },
      };
    case "bur_ramo":
      return { params: { oficio: 1 }, mole: { corporacao: 1 } };
    case "bur_fora":
      return { params: { tutela: 1 }, mole: { colonia: 1 } };
    case "bur_texto":
      return { params: { sagrado: 1 }, mole: { teocrata: 1 } };
    case "bur_povo":
      return { params: { parentesco: 1 }, mole: { tribal: 1 } };
    case "ex_chefe":
      return {
        params: { quem: 1, ordem: 1 },
        mole: { monarquista: 1, monarquia_social: 1, presidencialista: 1, teocrata: 1 },
      };
    case "ex_camara":
      return {
        params: { quem: -1, queda: -1 },
        mole: { parlamentarista: 1 },
      };
    case "ex_povo":
      return { params: {}, mole: { tribal: 1 } };
    case "ex_base":
      return {
        params: { conselho: 1, prazo: -1 },
        mole: { sovietica: 1 },
      };
    case "ex_fora":
      return { params: { tutela: 1 }, mole: { colonia: 1 } };
    case "ex_ramo":
      return {
        params: { oficio: 1, ordem: 1 },
        mole: { corporacao: 1 },
      };
    case "mar_chefe":
      return {
        params: { quem: 1, ordem: 1 },
        mole: { monarquista: 1, monarquia_social: 1, presidencialista: 1, teocrata: 1 },
      };
    case "mar_camara":
      return {
        params: { quem: -1, queda: -1 },
        mole: { parlamentarista: 1 },
      };
    case "mar_base":
      return {
        params: { conselho: 1, prazo: -1 },
        mole: { sovietica: 1 },
      };
    case "mar_ramo":
      return {
        params: { oficio: 1, ordem: 1 },
        mole: { corporacao: 1 },
      };
    case "mar_povo":
      return { params: {}, mole: { tribal: 1 } };
    case "mar_fora":
      return { params: { tutela: 1 }, mole: { colonia: 1 } };
    case "seg_chefe":
      return {
        params: { quem: 1, ordem: 1 },
        mole: { monarquista: 1, monarquia_social: 1, presidencialista: 1, teocrata: 1 },
      };
    case "seg_povo":
      return { params: { parentesco: 1 }, mole: { tribal: 1 } };
    case "seg_base":
      return {
        params: { conselho: 1, prazo: -1 },
        mole: { sovietica: 1 },
      };
    case "seg_texto":
      return { params: { sagrado: 1 }, mole: { teocrata: 1 } };
    case "seg_fora":
      return { params: { tutela: 1 }, mole: { colonia: 1 } };
    case "seg_ramo":
      return { params: { oficio: 1 }, mole: { corporacao: 1 } };
    case "seg_camara":
      return {
        params: { quem: -1, queda: -1 },
        mole: { parlamentarista: 1 },
      };
    case "ju_costume":
      return {
        params: { tradicao: 1 },
        mole: { monarquista: 1, monarquia_social: 1, tribal: 1 },
      };
    case "ju_escrita":
      return {
        params: { ordem: 1, queda: 1 },
        mole: { presidencialista: 1 },
      };
    case "ju_camara":
      return {
        params: { quem: -1, queda: -1 },
        mole: { parlamentarista: 1 },
      };
    case "ju_base":
      return {
        params: { conselho: 1, prazo: -1 },
        mole: { sovietica: 1 },
      };
    case "ju_ramo":
      return { params: { oficio: 1 }, mole: { corporacao: 1 } };
    case "ju_texto":
      return { params: { sagrado: 1 }, mole: { teocrata: 1 } };
    case "ju_fora":
      return { params: { tutela: 1 }, mole: { colonia: 1 } };
    case "camara_fim":
      return {
        params: { queda: -1, voto: 1 },
        mole: { parlamentarista: 1 },
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
      return visited("fora") ? "principios" : "fora";
    case "leitor_no_circulo":
      return "sagrado";
    case "carta_de_fora":
      return "carta";
    case "ultima_aqui":
      return answered("aldeia") ? "principios" : "fonte";
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
      return visited("trabalho") ? "principios" : "trabalho";
    case "vida_ou_linha":
      return "dever";
    case "texto_trava":
    case "base_puxa":
    case "trabalho_nao_senta":
      return "principios";
    case "continuidade_fim":
    case "cuidado_fim":
    case "plano_fim":
    case "abrigo_fim":
    case "camara_fim":
      return null;
    case "texto_aconselha":
    case "culto_miudo":
      return answered("leitor_do_texto") ? "confianca" : "principios";
    case "dois_lados":
      return visited("prazo") ? "principios" : "prazo";
    case "pri_continuidade":
    case "pri_cuidado":
    case "pri_plano":
    case "pri_abrigo":
    case "pri_troca":
      return "distribuicao";
    case "dist_um":
    case "dist_varias":
    case "dist_lugares":
    case "dist_fora":
      return "cidadania";
    case "cid_sangue":
    case "cid_morador":
    case "cid_base":
    case "cid_ramo":
    case "cid_texto":
    case "cid_fora":
      return "religiao";
    case "rel_acima":
    case "rel_aconselha":
    case "rel_cada":
    case "rel_neutro":
      return "burocracia";
    case "bur_familia":
    case "bur_prova":
    case "bur_base":
    case "bur_ramo":
    case "bur_fora":
    case "bur_texto":
    case "bur_povo":
      return "exercito";
    case "ex_chefe":
    case "ex_camara":
    case "ex_povo":
    case "ex_base":
    case "ex_fora":
    case "ex_ramo":
      return "marinha";
    case "mar_chefe":
    case "mar_camara":
    case "mar_base":
    case "mar_ramo":
    case "mar_povo":
    case "mar_fora":
      return "seguranca";
    case "seg_chefe":
    case "seg_povo":
    case "seg_base":
    case "seg_texto":
    case "seg_fora":
    case "seg_ramo":
    case "seg_camara":
      return "justica";
    case "ju_costume":
    case "ju_escrita":
    case "ju_camara":
    case "ju_base":
    case "ju_ramo":
    case "ju_texto":
    case "ju_fora":
      return "fim";
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
    case "principios":
      return `${name} vai escrever as primeiras regras. Elas não cabem tudo. Se tiverem de servir a uma coisa antes das outras, qual é?`;
    case "distribuicao":
      return `Em ${name}, o mando pode ficar numa pessoa só, repartido numa câmara, em cada povoado, ou com quem está de fora. Onde ele fica de verdade, no dia em que uma decisão trava?`;
    case "cidadania":
      return `Morar em ${name} não responde sozinho. O papel de membro diz quem vota, quem não pode ser expulso e quem entra no cargo. Quem recebe esse papel?`;
    case "religiao":
      return ctx.speechFora === "aldeia"
        ? `Isto não é a pergunta sobre o costume ceder ao texto sagrado. A pergunta agora é o caixa do povoado: ele paga um culto, deixa cada grupo com o seu, ou não paga culto nenhum?`
        : `Isto não é a pergunta sobre a lei do dia a dia ceder ao texto sagrado. A pergunta agora é outra: o caixa e o cargo de ${name} pagam um culto e dão cadeira a quem lê o texto, ou a religião fica fora do governo?`;
    case "burocracia":
      return ctx.speechFora === "aldeia"
        ? `No povoado, alguém escreve o livro da praça e cobra a taxa do poço. Esse cargo não é o dos mais velhos que já decidem a água. Quem senta nele?`
        : `Em ${name}, alguém escreve a lista, cobra o imposto e guarda o papel do porto. Esse cargo não é o de quem governa. Quem senta nele?`;
    case "exercito":
      return ctx.speechFora === "aldeia"
        ? `Isto não é a guarda da praça. É a turma que sai do povoado quando a briga passa do poço e vira guerra. Quem dá a ordem a essa turma?`
        : `Isto não é a guarda da rua. É a tropa que sai para a fronteira e para a guerra em ${name}. Quem dá a ordem a essa tropa?`;
    case "marinha":
      return ctx.speechFora === "aldeia"
        ? `Os barcos do rio e da costa não são a turma que sai por terra. Quem dá a ordem nesses barcos?`
        : `Os barcos de ${name} e a guarda do porto não são a tropa de terra. Quem dá a ordem no cais e na água?`;
    case "seguranca":
      return `Isto não é a tropa de guerra. É quem separa briga, prende e vigia a rua em ${name}. Quem manda nessa guarda?`;
    case "justica":
      return `Duas pessoas de ${name} brigam por terra, dívida ou ofensa. Quem diz quem tem razão, e essa decisão vale?`;
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
    profileId: profile,
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

function pathDebug(choiceIds: readonly string[]): string {
  const walk = walkChoices(choiceIds);
  const vector = vectorOf(walk.steps);
  const ranked = PROFILE_IDS.map((id) => ({
    id,
    d: Number(adjustedDistance(vector, id).toFixed(3)),
  })).sort((a, b) => a.d - b.d || a.id.localeCompare(b.id));
  return JSON.stringify({
    sums: vector.sums,
    mole: vector.mole,
    guards: guardsOf(vector),
    ranked,
  });
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
  if (!result || result.nearTie || result.secondary || result.primary.title !== title) {
    throw new Error(
      `Expected a single title “${title}”, got ${result?.primary.title ?? "none"} / ${result?.secondary?.title ?? "none"} near=${result?.nearTie ?? false}. ${pathDebug(choiceIds)}`,
    );
  }
}

const SPINE = [
  "principios",
  "distribuicao",
  "cidadania",
  "religiao",
  "burocracia",
  "exercito",
  "marinha",
  "seguranca",
  "justica",
  "fim",
] as const satisfies readonly NodeId[];

function assertExamples(): void {
  expectPath(
    [
      "aldeia",
      "anciaos",
      "ultima_aqui",
      "pri_cuidado",
      "dist_lugares",
      "cid_sangue",
      "rel_cada",
      "bur_povo",
      "ex_povo",
      "mar_povo",
      "seg_povo",
      "ju_costume",
      "cuidado_fim",
    ],
    ["unidade", "circulo", "fora", ...SPINE],
    PROFILE_COPY.tribal.title,
  );
  expectPath(
    [
      "pais",
      "carta_de_fora",
      "so_de_fora",
      "rosto_nomeado",
      "trabalho_nao_senta",
      "pri_abrigo",
      "dist_fora",
      "cid_fora",
      "rel_neutro",
      "bur_fora",
      "ex_fora",
      "mar_fora",
      "seg_fora",
      "ju_fora",
      "abrigo_fim",
    ],
    ["unidade", "fora", "carta", "fonte", "trabalho", ...SPINE],
    PROFILE_COPY.colonia.title,
  );
  expectPath(
    [
      "pais",
      "ultima_aqui",
      "voto_contado",
      "fica_ate_a_data",
      "trabalho_nao_senta",
      "pri_continuidade",
      "dist_um",
      "cid_morador",
      "rel_neutro",
      "bur_prova",
      "ex_chefe",
      "mar_chefe",
      "seg_chefe",
      "ju_escrita",
      "continuidade_fim",
    ],
    ["unidade", "fora", "fonte", "confianca", "trabalho", ...SPINE],
    PROFILE_COPY.presidencialista.title,
  );
  expectPath(
    [
      "pais",
      "ultima_aqui",
      "linhagem",
      "vida_ou_linha",
      "pao_e_terra",
      "trabalho_nao_senta",
      "pri_cuidado",
      "dist_um",
      "cid_sangue",
      "rel_neutro",
      "bur_familia",
      "ex_chefe",
      "mar_chefe",
      "seg_chefe",
      "ju_costume",
      "cuidado_fim",
    ],
    ["unidade", "fora", "fonte", "prazo", "dever", "trabalho", ...SPINE],
    PROFILE_COPY.monarquia_social.title,
  );
  expectPath(
    [
      "pais",
      "ultima_aqui",
      "linhagem",
      "vida_ou_linha",
      "continuidade",
      "trabalho_nao_senta",
      "pri_continuidade",
      "dist_um",
      "cid_sangue",
      "rel_neutro",
      "bur_familia",
      "ex_chefe",
      "mar_chefe",
      "seg_chefe",
      "ju_costume",
      "continuidade_fim",
    ],
    ["unidade", "fora", "fonte", "prazo", "dever", "trabalho", ...SPINE],
    PROFILE_COPY.monarquista.title,
  );
  expectPath(
    [
      "pais",
      "ultima_aqui",
      "leitor_do_texto",
      "texto_trava",
      "pri_continuidade",
      "dist_um",
      "cid_texto",
      "rel_acima",
      "bur_texto",
      "ex_chefe",
      "mar_chefe",
      "seg_texto",
      "ju_texto",
      "continuidade_fim",
    ],
    ["unidade", "fora", "fonte", "sagrado", ...SPINE],
    PROFILE_COPY.teocrata.title,
  );
  expectPath(
    [
      "pais",
      "ultima_aqui",
      "de_quem_trabalha",
      "base_puxa",
      "pri_plano",
      "dist_varias",
      "cid_base",
      "rel_neutro",
      "bur_base",
      "ex_base",
      "mar_base",
      "seg_base",
      "ju_base",
      "plano_fim",
    ],
    ["unidade", "fora", "fonte", "trabalho", ...SPINE],
    PROFILE_COPY.sovietica.title,
  );
  expectPath(
    [
      "pais",
      "ultima_aqui",
      "de_quem_trabalha",
      "dois_lados",
      "cadeira_do_ramo",
      "pri_continuidade",
      "dist_varias",
      "cid_ramo",
      "rel_neutro",
      "bur_ramo",
      "ex_ramo",
      "mar_ramo",
      "seg_ramo",
      "ju_ramo",
      "continuidade_fim",
    ],
    ["unidade", "fora", "fonte", "trabalho", "prazo", ...SPINE],
    PROFILE_COPY.corporacao.title,
  );
  expectPath(
    [
      "pais",
      "ultima_aqui",
      "voto_contado",
      "cai",
      "trabalho_nao_senta",
      "pri_troca",
      "dist_varias",
      "cid_morador",
      "rel_neutro",
      "bur_prova",
      "ex_camara",
      "mar_camara",
      "seg_camara",
      "ju_camara",
      "camara_fim",
    ],
    ["unidade", "fora", "fonte", "confianca", "trabalho", ...SPINE],
    PROFILE_COPY.parlamentarista.title,
  );
}

assertPlayerCopy();
assertExamples();
