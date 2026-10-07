# Comparar com os outros

No fim de **Meu Perfil** e de **Meu Estado**, a pessoa pode entrar numa conta anônima e ver o próprio resultado perto do conjunto.

A entrada é um botão, “Entrar na comparação”. Nada é enviado antes disso. A escolha fica neste navegador e vale para os dois testes. Dá para sair com “Tirar o meu da conta”.

## O que entra na conta

Só o agregado, mais o último resultado daquele navegador — para uma nova tentativa substituir a anterior, em vez de contar duas vezes.

- Meu Perfil: posição nos dez eixos (de −1 a +1) e o id do arquétipo.
- Meu Estado: id do arranjo principal e, se houver, do segundo.

O navegador manda um id aleatório (`rosa-politica-comparar-id` no `localStorage`). Esse id não é nome, e-mail nem conta.

## O que não entra

- Nome
- E-mail
- IP (o código não lê nem grava IP)
- O nome que a pessoa deu ao país

A Vercel pode guardar log de acesso do site, como em qualquer hospedagem. Esse log não faz parte da conta da comparação.

Com menos de 20 resultados no teste, a página diz “ainda poucas respostas” e não mostra média nem porcentagem. O envio continua valendo, para a conta crescer.

Se o armazenamento falha ou ainda não foi ligado, o resultado do teste continua na página. A comparação mostra que está fora do ar.

Um mesmo navegador só troca o resultado depois de 3 segundos. Isso segura rajada de escrita. Não muda o placar de quem joga uma vez.

## Local

`npm run dev` grava `data/comparison.json` quando não há Redis e o processo não está na Vercel. A pasta `data/` fica fora do git.

Para forçar o arquivo, mesmo com Redis no ambiente:

```bash
COMPARISON_STORE=file npm run dev
```

Para ver o estado “fora do ar”:

```bash
COMPARISON_STORE=off npm run dev
```

## Produção (o que configurar na Vercel)

O site está em [rosa-politica.vercel.app](https://rosa-politica.vercel.app/). O disco da Vercel não serve: ele some entre uma função e outra. A comparação usa Redis pelo REST do Upstash, que é o encaixe mais simples (um JSON de contadores).

Quem mantém o projeto precisa criar o banco e ligar ao projeto. Este repositório não traz senha.

1. Abra o projeto **rosa-politica** na Vercel.
2. Em **Storage** ou **Integrations** (Marketplace), crie **Upstash Redis** (o nome antigo era Vercel KV) e conecte ao projeto.
3. A integração preenche um destes pares. Qualquer um dos dois basta:
   - `KV_REST_API_URL` e `KV_REST_API_TOKEN`
   - `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`
4. Marque o ambiente **Production**. Preview, se quiser a comparação nos deploys de preview.
5. Faça um novo deploy. A Vercel só injeta variável nova em deploy seguinte.
6. Não defina `COMPARISON_STORE=off` em produção. Não cole os tokens no git.

Sem essas variáveis na Vercel, a API responde `{ "available": false }` e a página esconde a média.

Não é Postgres/Neon nem Supabase. Um documento de contadores não precisa de tabela.

A chave no Redis é `rosa-politica:comparison`.
