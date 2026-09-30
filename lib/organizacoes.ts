/**
 * Classroom explainer for the nine internal arrangements.
 * The quiz itself does not show these names. Titles, problem, and cost
 * come from the flowchart so they stay aligned with the result.
 */

import { organizationSummaries } from "@/lib/governoFlow";

export interface OrganizationExample {
  place: string;
  note: string;
}

interface OrganizationExtra {
  classroomName: string;
  mechanism: string;
  differs: string;
  examples: OrganizationExample[];
}

const EXTRA: Record<string, OrganizationExtra> = {
  monarquista: {
    classroomName: "Monarquia de costume",
    mechanism:
      "Uma família ou casa antiga ocupa o mando. A sucessão vem do costume, não de uma eleição geral. O desenho atravessa a vida de quem está no cargo e é difícil de desfazer no meio de uma geração.",
    differs:
      "Perto da monarquia de cuidado, a casa também fica. Aqui a razão do cargo é continuar a regra antiga. Comida e teto podem existir, mas não são o que justifica o mando, e o costume não troca a pessoa quando o cuidado falha. Diferente do presidencialismo, não há data marcada para sair.",
    examples: [
      {
        place: "Arábia Saudita",
        note: "A casa de Saud ocupa o mando e a sucessão fica na família. O país também põe a lei religiosa acima da lei comum; esse outro recorte está na teocracia.",
      },
      {
        place: "Essuatíni",
        note: "O rei concentra o mando por costume, sem um mandato com data para acabar.",
      },
      {
        place: "Brunei",
        note: "O sultão segue no cargo pela casa. O mesmo país também distribui moradia e serviço; esse recorte está na monarquia de cuidado.",
      },
    ],
  },
  monarquia_social: {
    classroomName: "Monarquia de cuidado",
    mechanism:
      "A família continua no mando, mas o cargo se explica pelo que chega em comida, terra, moradia e serviço. A casa fica. A pessoa pode ser trocada por outra da mesma família se o cuidado não chega.",
    differs:
      "O teste separa este arranjo da monarquia de costume no dever. Continuar a lei antiga puxa a de costume. Dever de comida, terra e teto puxa esta. O cuidado pode virar favor de quem chega perto da família.",
    examples: [
      {
        place: "Kuwait",
        note: "A família reinante permanece, e uma parte grande do acordo com quem é cidadão é moradia, emprego e serviço público.",
      },
      {
        place: "Catar",
        note: "A casa fica no mando e o Estado distribui renda, moradia e serviço como base visível do cargo.",
      },
      {
        place: "Brunei",
        note: "Além da sucessão, há um pacote amplo de moradia e serviço para a população cidadã. A analogia aqui é o dever de cuidado, não só a casa no cargo.",
      },
    ],
  },
  presidencialista: {
    classroomName: "Presidencialismo",
    mechanism:
      "Uma pessoa é escolhida para governar até uma data. A câmara pode travar lei. No desenho normal, ela não tira o cargo no meio com um voto de confiança.",
    differs:
      "Presidencialismo e parlamentarismo usam voto contado. Aqui quem governa fica até a data, e o erro dura até lá. No parlamentarismo, o governo cai quando a câmara tira a confiança.",
    examples: [
      {
        place: "Brasil",
        note: "O mandato tem data para acabar. O Congresso não derruba o governo com voto de confiança. A saída no meio existe, mas é exceção grave, não a regra do dia.",
      },
      {
        place: "Estados Unidos",
        note: "Mandato de quatro anos. O Congresso não vota confiança para trocar o presidente.",
      },
      {
        place: "México",
        note: "Mandato de seis anos, com data marcada para sair.",
      },
    ],
  },
  parlamentarista: {
    classroomName: "Parlamentarismo",
    mechanism:
      "Quem governa sai da câmara, ou depende dela, e sai quando a câmara deixa de confiar. Uma obra longa pode morrer na briga.",
    differs:
      "No presidencialismo o cargo atravessa a briga até a data. Aqui a confiança da câmara é o prazo. Diferente do corporativismo de ramo, a queda não vem da cadeira de um setor de trabalho.",
    examples: [
      {
        place: "Reino Unido",
        note: "O primeiro-ministro governa enquanto a Câmara dos Comuns confia. Perdeu a maioria, o governo cai.",
      },
      {
        place: "Alemanha",
        note: "O chanceler depende do Bundestag. A moção de desconfiança construtiva troca o governo sem esperar o fim de um mandato fixo.",
      },
      {
        place: "Canadá",
        note: "O governo cai se a Câmara dos Comuns retira a confiança.",
      },
    ],
  },
  teocrata: {
    classroomName: "Teocracia",
    mechanism:
      "A lei sagrada trava a lei comum. Quem lê e interpreta o texto vira o cargo, ou filtra quem pode mandar e o que pode virar lei.",
    differs:
      "Na monarquia de costume o freio é a família antiga. Aqui o freio é o texto. Uma casa pode existir ao lado, mas o que não passa no texto não vira lei.",
    examples: [
      {
        place: "Irã",
        note: "O Líder Supremo e o Conselho dos Guardiães barram lei que, no critério deles, fere a lei religiosa.",
      },
      {
        place: "Arábia Saudita",
        note: "O Alcorão e a sunnah funcionam como lei acima da lei comum, junto com a casa real. O recorte da família está na monarquia de costume.",
      },
      {
        place: "Vaticano",
        note: "Quem interpreta a doutrina ocupa o centro. Não há uma câmara civil reescrevendo o texto por maioria.",
      },
    ],
  },
  sovietica: {
    classroomName: "Conselhos de quem trabalha",
    mechanism:
      "O mando sobe de quem faz o trabalho, não desce de um gabinete longe. O delegado volta quando a base puxa. Quem só é dono não tem cadeira própria. O plano sai da base.",
    differs:
      "No corporativismo de ramo, quem emprega e quem trabalha sentam juntos e a cadeira dura com o ramo. Aqui quem emprega não senta como lado próprio, e o delegado é fácil de trocar.",
    examples: [
      {
        place: "Norte e leste da Síria",
        note: "A administração autônoma usa conselhos locais e cooperativas, com a ideia de que o delegado responde à base. Não é um Estado estável nem um modelo puro.",
      },
      {
        place: "Cuba",
        note: "O Poder Popular sobe de assembleias de bairro e de trabalho. O partido organiza o conjunto, então a troca fácil do delegado não é a prática inteira.",
      },
      {
        place: "Venezuela",
        note: "Os conselhos comunais foram escritos para o plano sair do bairro, com mandato que a base pode cobrar. Na prática o governo central pesa muito.",
      },
    ],
  },
  corporacao: {
    classroomName: "Corporativismo de ramo",
    mechanism:
      "Quem produz e quem emprega no mesmo ramo sentam juntos. A cadeira dura com o ramo, não com uma pessoa. Alguém acima coordena para os ramos não se quebrarem.",
    differs:
      "Os conselhos de quem trabalha não dão cadeira própria a quem só é dono, e o delegado volta fácil. Aqui os dois lados ficam na mesa e o ramo pode virar um feudo de quem já sentou.",
    examples: [
      {
        place: "Áustria",
        note: "A parceria social põe câmaras de trabalhadores e de empresas na mesma mesa, e o Estado coordena. O ramo não governa sozinho o país.",
      },
      {
        place: "Países Baixos",
        note: "Sindicatos e empregadores negociam por setor, no modelo polder, com o governo por cima.",
      },
      {
        place: "Cingapura",
        note: "Sindicatos de ramo ligados ao Estado sentam com empregadores numa coordenação de cima. O voto e o governo eleito continuam no centro.",
      },
    ],
  },
  colonia: {
    classroomName: "Tutela externa",
    mechanism:
      "Guerra, tratado e às vezes a moeda ficam com um poder de fora. Escola, rua e o dia a dia podem ficar aqui. Quando o acordo muda, quem está aqui tem pouco como dizer não.",
    differs:
      "Pode existir governo local e até um país reconhecido. A última palavra de guerra e tratado é de fora. No governo de clã não há essa máquina, nem essa tutela como eixo.",
    examples: [
      {
        place: "Porto Rico",
        note: "Defesa e parte da cidadania estão com os Estados Unidos. A ilha tem governo próprio para o dia a dia.",
      },
      {
        place: "Groenlândia",
        note: "Autonomia interna ampla. Defesa e parte da política externa seguem com a Dinamarca.",
      },
      {
        place: "Ilhas Cook",
        note: "Autogoverno, com defesa e relações exteriores ligadas à Nova Zelândia.",
      },
    ],
  },
  tribal: {
    classroomName: "Governo de clã",
    mechanism:
      "O povoado ou o clã decide. O que for maior que o grupo é aliança, não um mando único. A regra muda de um lugar para o outro. Contam o sangue e o costume.",
    differs:
      "Não é uma família no mando de um país inteiro: é o grupo pequeno, sem máquina de país. Também não é tutela externa. A última palavra não foi entregue a um poder de fora.",
    examples: [
      {
        place: "Somália",
        note: "No costume xeer, anciãos do clã decidem disputas, e o acordo entre clãs é aliança. Há também governos e exércitos, então isto é um recorte, não o país inteiro.",
      },
      {
        place: "Papua-Nova Guiné",
        note: "Em muita terra e em muito conflito local, o grupo de parentesco pesa mais que uma lei única vinda da capital.",
      },
      {
        place: "Nação Navajo (Diné)",
        note: "Clãs e costume contam na vida do grupo, ao lado das instituições da própria nação e do Estado americano. A analogia é só o recorte do parentesco.",
      },
    ],
  },
};

export interface OrganizationEntry extends OrganizationExtra {
  id: string;
  title: string;
  problem: string;
  cost: string;
}

function buildOrganizations(): OrganizationEntry[] {
  return organizationSummaries().map((summary) => {
    const extra = EXTRA[summary.id];
    if (!extra) {
      throw new Error(`Missing explainer for organization: ${summary.id}`);
    }
    return { ...summary, ...extra };
  });
}

export const ORGANIZATIONS: OrganizationEntry[] = buildOrganizations();

export const ORGANIZATIONS_DISCLAIMER =
  "Os nomes desta página são de aula, para comparar arranjos. No teste Meu Estado eles não aparecem: lá o resultado usa só a frase descritiva. Os exemplos do mundo são aproximações. Nenhum país cabe inteiro num tipo, e vários misturam mais de um.";
