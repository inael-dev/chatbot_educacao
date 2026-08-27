# Planejamento — Plataforma de IA para Educação Inclusiva

> Documento de trabalho. Reflete o entendimento atual do produto e será atualizado
> conforme validarmos premissas com escolas/prefeituras. Pontos marcados como
> **[EM ABERTO]** dependem de validação com o cliente antes de virar decisão técnica.

## 1. Posicionamento

Não é "um chatbot para professores". É uma **plataforma de planejamento e adaptação
pedagógica com IA**.

**Discurso de venda:**
> "Nossa IA preserva o planejamento do professor e adapta automaticamente as
> atividades para cada aluno que necessite de apoio, mantendo todos trabalhando o
> mesmo objetivo pedagógico, alinhado à BNCC e aos princípios da educação inclusiva."

O professor prepara **uma única proposta de aula**; a plataforma gera as adaptações
necessárias para que cada estudante participe da mesma experiência de aprendizagem.

## 2. Público e clientes

- **Público de uso:** Educação Infantil e Ensino Fundamental I (possibilidade futura
  de expansão para outras etapas).
- **Clientes:** prefeituras / secretarias de educação, escolas particulares.
- **[EM ABERTO]** Uso restrito a professores do AEE ou também professores regentes?
  Foco inicial só em alunos atípicos ou toda a turma?
- Municípios podem já ter ferramenta própria de planejamento (ex: Fortaleza —
  "Professor Online", ver 3.2); validar integração/coexistência na Fase 0, não
  assumir que o produto substitui essa camada.

## 3. O diferencial real

Não é o chatbot nem a geração de PDF. É o **contexto pedagógico contínuo**: cada
aluno tem um histórico vivo, e a IA usa esse histórico em todas as decisões
(planejar, adaptar, registrar resultado, sugerir próximos passos) ao longo do ano
letivo. Isso é o que separa o produto de uma ferramenta genérica de IA.

### 3.1 Panorama competitivo (pesquisa 2026-08)

Já existem players brasileiros fazendo adaptação de atividade com IA para
neurodivergência — o mercado não está vazio:

- **[Lírios](https://www.lirios.tech/)** — o mais parecido com o Modelo A daqui
  (seção 4.2): professor cria avaliação alinhada à BNCC, sistema adapta por
  aluno a partir do PEI. Está recrutando **"Municípios Pioneiros 2026"** (só 3
  vagas) — já vendendo direto pra prefeitura, no mesmo mercado-alvo deste
  projeto, agora.
- **[Prova Adaptada](https://www.projetodraft.com/inclusao-na-escola-eles-criaram-uma-plataforma-que-em-30-segundos-adapta-provas-e-licoes-de-casa-para-alunos-neurodivergentes/)**
  — professor sobe a atividade, seleciona quais condições precisam de
  adaptação, gera versão em 30s. Adaptação é **por tipo de condição**, não por
  aluno individual. 50 escolas, hoje só rede particular (Rede La Salle,
  Colégio São Francisco Xavier), R$1M investido pelos fundadores; ambição
  declarada de ir pra rede pública depois.
- **[Vínculoo](https://vinculoo.com.br/)** — mais gestor de caso (PEI/PDI/PAEE
  + contexto familiar) do que gerador de atividade; atende particular,
  prefeitura/estado e família direto. Concorrente adjacente, não direto.
- **Lupa IA, Para Casa Inclusivo, Inclui.ai** — variações menores do mesmo
  tema, fluxo turma-vs-individual pouco claro publicamente.

**Implicação:** "turma primeiro, IA adapta pra quem precisa" (seção 4) segue
validado, mas deixou de ser diferencial único — o Lírios já faz quase isso e
já está batendo em porta de prefeitura. Nenhum concorrente pesquisado resolve
de forma visível o problema institucional real (ver 3.2): a colaboração entre
professor regente e AEE, que a pesquisa mostra que **não acontece na prática**
na rede municipal. Ver seção 10 (riscos) e seção 8.2 (perguntas).

### 3.2 Como o planejamento funciona hoje (pesquisa 2026-08)

- **Fortaleza (SME)** lançou em ago/2025 a plataforma própria **"Professor
  Online"**: planejamento, frequência, acompanhamento pedagógico, integrada ao
  currículo próprio da rede (DCRFor), com coordenador validando o
  planejamento do professor. Sem menção a IA, adaptação ou AEE. Pra esse tipo
  de prefeitura, o pitch não é "façam planejamento aqui" — é **a camada de
  inclusão que a ferramenta deles não cobre**; validar na Fase 0 se precisa
  integrar ou se dá pra coexistir.
- **AEE + professor regente:** o modelo formal já é "turma primeiro, atípico
  depois" — regente planeja pra turma, professor de AEE (Sala de Recursos
  Multifuncionais) colabora na adaptação. Mas pesquisa acadêmica mostra que na
  **rede municipal** essa parceria costuma **não acontecer de fato** — falta
  diálogo, o regente muitas vezes nem conhece o PEI do aluno, faltam recursos
  pedagógicos. Na rede estadual a articulação é melhor. Isso reforça a seção
  3.1: o buraco real pode estar mais na colaboração do que na geração de
  conteúdo.
- **PEI é obrigação legal**, não boa prática — art. 28 da Lei 13.146/2015 (Lei
  Brasileira de Inclusão), exigível sempre que o aluno tem necessidade
  específica de aprendizagem. Isso é munição de venda ("ajuda a cumprir uma
  obrigação legal hoje feita manualmente ou não feita") e reforça que
  `atividadeAdaptada` (seção 4.3) deveria, na Fase 3, poder alimentar o PEI
  formal do aluno — não é feature bônus.

## 4. Fluxo principal do produto

Modelo adotado como hipótese de trabalho (turma primeiro, aluno como modificador):

```
Planejamento da aula
      ↓
Objetivo pedagógico (BNCC)
      ↓
Turma
      ↓
IA cria atividade principal
      ↓
IA identifica alunos que provavelmente precisam de adaptação
      ↓
IA gera versões adaptadas (mesmo objetivo, mesmo conteúdo, mesmo momento da aula)
```

Exemplo:
- Atividade original: "Conte as maçãs e escreva o resultado."
- João (TEA, dificuldade motora): "Conte as maçãs e coloque o número correspondente
  usando cartões."
- Maria (TDAH): versão com menos distração visual.
- Pedro (deficiência intelectual): versão com menos elementos.

Todos trabalham o mesmo objetivo (contagem), no mesmo momento da aula.

Fluxo proativo desejado: ao clicar em "Finalizar atividade", a IA avisa
*"Detectei N alunos que provavelmente precisarão de adaptação: [lista]. Deseja gerar
automaticamente as versões adaptadas?"* — o professor não precisa pedir.

### 4.1 UX da geração de adaptações — ação em lote, não chat por aluno

Benchmarking (2026-08) contra MagicSchool AI, Diffit, Brisk Teaching e SchoolAI: nenhuma
dessas ferramentas usa "abrir uma conversa por aluno" como mecanismo principal de
diferenciação. O padrão do mercado é **uma entrada do professor → uma ação em lote → N
saídas diferentes**, usando dados de perfil já cadastrados (interesse, nível, condição)
como parâmetro silencioso do prompt — não como algo perguntado no momento pela IA.

Isso resolve o incômodo identificado por inael: com uma turma de 10-15+ alunos, entrar
"chat por chat" pra gerar adaptação de cada um é inviável na prática, mesmo que o
resultado individual seja bom.

Fluxo adotado:

1. Professor descreve a atividade/objetivo da turma **uma única vez** (tela da turma).
2. Botão **"Gerar adaptações"** — o sistema gera, em uma única ação, uma versão
   adaptada por aluno sinalizado (ou selecionado manualmente), injetando automaticamente
   o perfil de cada um (`studentCondition`, `studentInterest`,
   `studentLearningPreference`, níveis de `studentProfile` — já existem no schema atual).
3. Resultado aparece como **lista/grade de atividades geradas**, uma por aluno — não como
   conversas separadas.
4. O chat por aluno continua existindo, mas como **ferramenta secundária de ajuste fino**
   ("deixa a da Ana mais visual"), não como o mecanismo principal de criação.

**Status:** direção validada com inael e apoiada por benchmarking de mercado — hipótese
mais forte que antes, mas ainda **não é decisão fechada**: falta a validação de Fase 0
com professor/coordenação real (ver seção 9). Não hard-commitar UX/schema como definitivo
antes disso.

### 4.2 Decisão em aberto — Modelo A vs Modelo B **[EM ABERTO — validar com cliente]**

| | Modelo A (adotado como hipótese) | Modelo B |
|---|---|---|
| Ponto de partida | Turma / objetivo da aula | Aluno individual |
| Atividade da turma | Uma só, com derivações | Uma por aluno, criada à parte |
| Papel do perfil do aluno | Modificador de uma atividade-base | Ponto de partida da geração |
| Alinhamento BNCC | Mais direto (garante acesso ao mesmo currículo) | Depende de como for implementado |

Essa escolha muda a experiência de uso e a arquitetura de dados — **não decidir sem
validar com professores, coordenação e secretaria**.

### 4.3 Mapeamento com o schema atual

O que já existe no schema (`lib/db/schema.ts`), além do `user`/auth original do template:

- `student`, `studentProfile` (níveis 1-5), `studentCondition`, `studentInterest`,
  `studentLearningPreference`, `studentSensitivity`, `studentGoal`,
  `studentObservation`, `studentAiMemory` (resumo vivo do aluno) — cobre bem mais do
  que o "perfil básico" previsto originalmente pra Fase 1 (seção 9).
- Tools de IA já plugadas no chat: `lookupStudent` (busca perfil completo por nome) e
  `lookupBnccHabilidade` (consulta oficial de habilidades BNCC).
- Tela `/alunos` (`app/(dashboard)/alunos/page.tsx`) — lista somente leitura dos alunos
  do professor logado.

O que falta pra viabilizar o fluxo da seção 4.1 (decidido em 2026-08-05, ver 4.4;
implementação em andamento no schema):

- **`turma`** — hoje não existe agrupamento de alunos por turma; `student.teacherId`
  aponta pro professor, mas não há turma nem disciplina.
- **`turmaStudent`** — tabela de vínculo many-to-many entre `turma` e `student`.
  Decidido em vez de turma = "todos os alunos do professor" porque um professor pode
  ter mais de uma turma e um aluno pode trocar de turma; a lista de alunos.teacherId
  sozinha não aguentaria isso sem retrabalho depois.
- **`atividade`** — a atividade-base gerada pra turma (objetivo, conteúdo, código BNCC,
  turmaId, teacherId, `sourceChatId` apontando pra conversa que a gerou) não tem
  tabela própria ainda.
- **`atividadeAdaptada`** — a versão gerada por aluno a partir de uma `atividade`
  (studentId, atividadeId, conteúdo adaptado, status `gerando`/`rascunho`/`validada`,
  `editedByTeacher`) também não existe.
- **Professor como entidade própria** — hoje "professor" é só `user`; não há
  turma/escola/rede associada a ele além do que o auth do template já oferece.

Isso confirma o que a seção 9 (Fase 1) já previa como próximo passo de schema
("turma, aluno, professor, atividade") — a parte de aluno já está adiantada, o restante
ainda está por fazer.

### 4.4 Onde revisar e editar as atividades — decidido (2026-08-05)

O chat **não** é o lugar onde a atividade adaptada fica salva pra revisão. Mensagens de
chat são conversa efêmera — sem status, sem forma de listar as adaptações da turma
inteira num painel, sem "isso já foi validado". Por isso `atividade` e
`atividadeAdaptada` (seção 4.3) existem como registros estruturados, separados do
histórico de mensagens que os gerou.

Fluxo decidido:

1. **Chat da turma** (principal) — professor descreve a atividade/objetivo uma vez;
   a IA gera a `atividade` base e uma `atividadeAdaptada` por aluno sinalizado.
2. **Tela de revisão** (por turma + atividade) — grade com um card por aluno, cada um
   mostrando a `atividadeAdaptada` gerada. Edição rápida acontece direto ali (editor
   estruturado, sem precisar reabrir o chat). Botão "Validar" por aluno e "Validar
   todos" em lote — isso é o que marca `atividadeAdaptada.status = validada`.
3. **Clique num aluno** → redireciona pro chat individual dele. Serve pra ajuste fino
   ("deixa a da Ana mais visual"): ao gerar algo novo nesse chat, o resultado
   **atualiza o mesmo registro `atividadeAdaptada`** em vez de virar uma conversa
   desconectada da atividade.

Isso mantém o chat como mecanismo de geração (turma-first e, secundariamente,
aluno-a-aluno para ajuste fino), enquanto o dado que importa pra revisão/aprovação
vive em tabelas próprias — consistente com o Motor de Adaptação Pedagógica previsto
como módulo separado na seção 5 e o editor pré-exportação da Fase 2 (seção 9).

### 4.5 Template de impressão — layout e cabeçalho **[EM ABERTO — refinamento em andamento]**

Primeira tentativa (tema cordel/xilogravura, 2026-08-10/11) foi rejeitada por inael
("não gostei, temos muito que trabalhar nisso") sem detalhamento do motivo ainda.
Nova direção, definida a partir de duas referências visuais em 2026-08-11:

- **Fundo branco, com borda decorativa** (não fundo colorido) — referência 1 mostrava
  borda decorativa colorida (azul/laranja, padrão ondulado) num fundo branco; a borda
  é o elemento "lúdico" aprovado, não uma textura/tema aplicada à página toda.
- **Precisa funcionar em preto e branco** — muitas escolas só têm impressora P&B; a
  borda decorativa deve ser desenhada de um jeito que funcione bem só com contorno/
  traço preto (sem depender de cor pra ser legível ou ficar "bonita"), como a
  referência 2 (borda geométrica em zigue-zague, só preto e branco).
- **Cabeçalho no topo da página**, campos definidos (decisão 2026-08-11, ver pergunta
  feita a inael sobre pré-preenchimento):
  - **ESCOLA** — preenchido automaticamente a partir do cadastro no sistema.
  - **TURMA** — preenchido automaticamente a partir do cadastro no sistema.
  - **PROFESSOR(A)** — em branco, preenchido à mão.
  - **ALUNO** — em branco, preenchido à mão (mesmo a atividade já sendo gerada para
    um aluno específico — cobre reimpressão/substituição de professor e reforça a
    criança escrever o próprio nome).
  - **DATA** — em branco (campo ___/___/___).

**Gap identificado:** hoje não existe entidade `escola` no schema (`lib/db/schema.ts`)
— "professor" é só `user`, sem escola/rede associada (ver seção 7). Pré-preencher
ESCOLA no cabeçalho depende de existir algum lugar pra cadastrar esse nome antes; até
o módulo de Administração (seção 5) existir de fato, provavelmente um campo simples
no perfil/configuração do professor (`user`) como solução mínima, não a modelagem
completa de município/escola.

Ainda não há mockup novo, PDF pipeline real, nem decisão de biblioteca de renderização
— isso é só o brief visual acordado antes de produzir a próxima versão (consistente
com [[feedback-plan-before-execute]]: alinhar antes de gerar artefato).

## 5. Módulos

- **Administração:** municípios, escolas, usuários, permissões.
- **Gestão Escolar:** turmas, disciplinas, professores, calendário.
- **Cadastro de Alunos:** perfil (idade, série, interesses, diagnóstico, habilidades,
  dificuldades, estratégias que funcionam/não funcionam, objetivos pedagógicos).
- **Planejamento:** aula, planejamento semanal/mensal, com apoio da IA.
- **Assistente IA:** chat (texto, futuramente voz) — ex: "Hoje quero trabalhar
  adição", "João está muito agitado", "Adapte essa atividade para Maria", "Gere um
  relatório".
- **Geração de Atividades:** atividades, jogos, desafios, histórias, material para
  impressão, sempre no contexto informado.
- **Motor de Adaptação Pedagógica** (módulo separado do gerador): recebe
  `atividade original + perfil do aluno` → gera nova versão mantendo o objetivo.
- **Editor:** ajuste de texto, imagens e organização de página antes de imprimir.
- **PDF:** exportação automática.
- **Histórico:** atividades, observações, resultados, evolução do aluno.
- **Relatórios:** visões para professor, coordenador, secretaria.
- **Biblioteca:** banco de imagens/ilustrações reutilizáveis (animais, frutas,
  letras, emoções, profissões, formas, objetos) para reduzir custo de geração de
  imagem por IA.

## 6. Papel da IA (o que ela faz e o que não faz)

A IA **não adivinha** — ela recebe contexto. Ex: professor pede "crie atividade para
Maria" → a API consulta cadastro, histórico, objetivos, BNCC e observações, e só
então monta o prompt.

Faz: sugerir atividades, adaptar atividades, explicar BNCC, gerar relatórios,
resumir observações, apoiar planejamento.
Não faz: substituir o professor / decidir sozinha sem contexto do aluno.

## 7. Arquitetura — evolução deste repositório

Este projeto (`chatbot`) **é a base** da plataforma, não um projeto à parte. É uma
evolução direta: o chat com IA que já funciona aqui (auth, UI de conversa, seleção
de modelo, streaming) vira o ponto de partida do Assistente IA e do restante dos
módulos é construído em cima dessa fundação.

| Camada | Hipótese original (doc do ChatGPT) | Já existe neste repo | Decisão |
|---|---|---|---|
| Frontend | Next.js | ✅ Next.js (App Router) | mantém |
| Backend | NestJS separado | Next.js API routes (`app/api`) | **[EM ABERTO]** — ver abaixo |
| Banco | PostgreSQL | ✅ PostgreSQL via Drizzle ORM | mantém |
| Filas | Redis + BullMQ | ✅ Redis já é dependência (sem BullMQ ainda) | adicionar BullMQ quando houver job assíncrono (ex: geração de PDF em lote) |
| Storage | Cloudflare R2 | ✅ Cloudflare R2 (via `@aws-sdk/client-s3`, S3-compatible) | decidido — ver nota abaixo |
| Infra | Docker + Hetzner | Vercel (deploy atual usa `@vercel/*`: functions, analytics, otel) | **[EM ABERTO]** — ver abaixo |
| IA | OpenAI | AI SDK com múltiplos providers resolvidos (Anthropic/Google/OpenAI/HuggingFace), hoje ativo só com OpenAI (`gpt-5-mini` para chat, tools e título) | volta a bater com a hipótese original — outros providers ficam resolvidos no código mas inertes até haver motivo/chave pra ativar |

**Decisões de arquitetura que essa correção reabre:**

- **Backend separado (NestJS) vs API routes do Next.js:** hoje toda a lógica
  (chat, auth, modelos) roda dentro do próprio Next.js. Um backend NestJS separado
  só se justifica se: (a) surgir processamento pesado/assíncrono demais para rodar
  em serverless (ex: geração de atividades em lote pra rede inteira), ou (b) o
  frontend passar a ter múltiplos consumidores (app mobile, integração externa)
  que não deveriam falar direto com o Next.js. Até lá, manter tudo em Next.js reduz
  complexidade operacional.
- **Vercel vs Docker+Hetzner:** o repo ainda usa alguns pacotes `@vercel/*`
  (functions, analytics, otel, bot protection). Migrar pra Hetzner exigiria
  substituir cada um desses por alternativa self-hosted. Só vale a pena se custo em
  escala (multi-prefeitura) ou exigência contratual (dado teria que ficar em infra
  própria/nacional) empurrar nessa direção — comum em contrato público, então vale
  perguntar isso já na Fase 0.
- **Vercel Blob → Cloudflare R2:** decidido em 2026-08-05, trocado antes mesmo de
  sair da Vercel (não depende da decisão de infra acima). Upload de imagem de plano
  (`app/(chat)/api/files/upload/route.ts`) usa o bucket público `r2.dev` (dev/teste).
  Antes de produção com dados reais de aluno, revisitar: `r2.dev` não tem SLA e
  serve tudo publicamente sem controle de acesso — trocar por domínio customizado
  e/ou URLs assinadas se o conteúdo for sensível.

## 8. Perguntas de descoberta para a reunião com o cliente

Pergunta de abertura, para direcionar toda a conversa:
> "Quando um professor chega em casa depois de um dia de aula, qual é a tarefa mais
> cansativa e repetitiva que vocês gostariam que um sistema fizesse por ele?"

### 8.1 As 10 perguntas mais decisivas (priorizar estas)

1. O planejamento começa pela turma ou pelo aluno? *(define o Modelo A vs B)*
2. A atividade deve ser criada do zero, adaptada de uma existente, ou apenas
   sugerida?
3. O professor quer conversar com a IA ou apertar um botão e receber tudo pronto?
4. A IA deve conhecer apenas o aluno selecionado ou todo o contexto da turma?
5. O sistema será usado durante o planejamento, durante a aula, ou nos dois
   momentos?
6. O professor pretende editar tudo que a IA gerar, ou apenas aprovar?
7. Como vocês avaliam hoje se uma atividade deu certo?
8. O que mais consome tempo hoje: planejar, adaptar, produzir material, registrar
   resultado ou fazer relatório?
9. Quais documentos são obrigatórios para a prefeitura e poderiam ser gerados
   automaticamente?
10. Se só pudessem pagar por uma funcionalidade, qual resolveria o maior problema do
    dia a dia?

### 8.2 Lista completa, por tema

**Público-alvo:** só Educação Infantil ou também Fundamental I? Suporte a AEE?
Professores regentes usam ou só o AEE? Foco inicial em alunos atípicos ou todos?

**Fluxo do professor hoje:** como planeja uma aula hoje? Diário, semanal ou mensal?
As atividades já são adaptadas atualmente? Quanto tempo gasta nisso? Onde ficam
armazenadas hoje?

**Geração de atividades:** criar do zero, sugerir, adaptar existente, ou só melhorar
o que o professor já escreveu?

**Fluxo da adaptação:** quando há aluno com TEA/TDAH, hoje o professor cria
atividade separada, adapta a da turma, ou usa material pronto? Quem decide a
adaptação — professor, coordenador ou AEE?

**Perfil do aluno:** o que realmente ajuda a IA — idade, série, diagnóstico, laudo,
interesses, hiperfocos, dificuldades, habilidades, PEI, acompanhante? (medicação
provavelmente não é necessário)

**Evolução:** como acompanham hoje — relatório, PEI, ficha, avaliação periódica?

**BNCC:** quem escolhe o código — professor, coordenação? A prefeitura tem
currículo próprio além da BNCC?

**Planejamento — quem inicia:** professor → IA → atividade, ou coordenação →
planejamento → professor → atividade?

**Chat:** para que serve — tirar dúvida, gerar atividade, revisar, planejar,
conversar no dia a dia?

**Histórico:** o que precisa ficar salvo — conversas, atividades, PDFs,
observações, avaliações?

**Biblioteca:** professor pode criar, compartilhar e reutilizar atividades próprias?

**Imagens:** precisa ser inédita ou pode usar banco de imagens/ilustrações
reaproveitadas? Prefeitura tem identidade visual própria?

**Impressão:** A4, colorido ou P&B? Envia pra pais? Usa tablet?

**Resultados:** professor registra "conseguiu / parcialmente / não conseguiu", ou
relatório livre?

**Relatórios:** quem visualiza — professor, diretor, coordenação, secretaria?

**Percepção de IA:** "O que vocês imaginam quando falam em IA?" — a resposta pode
ser bem diferente do que estamos pensando.

**Processo ideal:** "Se não existisse limitação tecnológica, como seria o sistema
perfeito para vocês?"

**Integrações:** Google Classroom, Microsoft, diário eletrônico, sistema da
prefeitura, importação de alunos?

**Permissões:** quem pode criar, editar, aprovar, excluir, visualizar?

**Escala:** uma escola, dez escolas, ou toda a rede?

**Ferramentas atuais / concorrência (2026-08):** vocês já conhecem ou testaram
alguma ferramenta de adaptação de atividade com IA (Lírios, Prova Adaptada,
Vínculoo, Lupa IA)? O que funcionou ou não funcionou? A rede já tem uma
plataforma própria de planejamento (como o "Professor Online" de Fortaleza)?
Precisaria integrar com ela ou poderia substituir? Como funciona hoje, na
prática, a comunicação entre professor regente e professor de AEE — existe
diálogo direto ou cada um trabalha separado?

## 9. Fases do projeto

### Fase 0 — Descoberta e validação (pré-desenvolvimento)
- Reunião de descoberta com prefeitura/escola usando a seção 8.
- Validar Modelo A vs B (seção 4.2).
- Validar quais campos do perfil do aluno são realmente usados na prática.
- Validar formato de saída esperado (impressão, tablet, PDF, cor).
- Sair da fase com: 1 fluxo de uso validado, 1 lista de campos de perfil fechada,
  1 protótipo navegável (Figma ou similar) validado com pelo menos um professor
  real.

### Fase 1 — MVP
- **Ponto de partida:** este repo já resolve auth, UI de chat, streaming e seleção
  de modelo de IA — não é trabalho de Fase 1, é reaproveitado.
- Schema novo no Drizzle: turma, aluno (perfil básico), professor, atividade.
- Planejamento de aula simples (objetivo + BNCC) — pode nascer como uma extensão do
  chat atual (ex: um modo/ferramenta dentro da conversa) em vez de uma tela nova.
- Geração de **uma atividade principal** pela IA a partir do objetivo.
- Adaptação manual: professor pede adaptação para 1 aluno por vez (sem detecção
  automática ainda).
- Exportação em PDF.
- Sem relatórios, sem biblioteca de imagens própria (usa geração de imagem direto
  ou banco público), sem integrações externas.
- Objetivo da fase: validar com usuários reais se o fluxo "turma → IA →
  adaptação" resolve o problema antes de investir em automação.

### Fase 2 — Motor de Adaptação Pedagógica
- Detecção proativa: ao finalizar atividade, IA sugere quais alunos precisam de
  adaptação e gera automaticamente mediante confirmação.
- Motor de adaptação como serviço reutilizável (`atividade original + perfil →
  nova versão`), não mais um caminho manual dentro do gerador.
- Início da biblioteca própria de imagens/ilustrações reutilizáveis.
- Editor de atividade antes da exportação (trocar texto, imagem, reorganizar).

### Fase 3 — Acompanhamento e relatórios
- Histórico por aluno: atividades aplicadas, observações, resultado
  (conseguiu/parcial/não conseguiu).
- Relatórios para coordenação/secretaria (o que a prefeitura exige hoje, ver
  pergunta 9 da seção 8.1).
- PEI / ficha de acompanhamento — não é só boa prática, é obrigação legal
  (art. 28 da Lei 13.146/2015) quando o aluno tem necessidade específica de
  aprendizagem, ver 3.2; a Fase 0 valida o formato esperado pela rede, não se
  deve existir.

### Fase 4 — Escala e integrações
- Multi-escola / multi-rede, permissões por papel (professor, coordenador,
  secretaria, admin).
- Integrações (Google Classroom, diário eletrônico, importação de alunos).
- Assistente por voz (evolução do chat).

## 10. Riscos e pontos a monitorar

- **Não decidir Modelo A/B por suposição** — é a decisão que mais muda a
  arquitetura de dados (atividade única com derivações vs. atividades
  independentes por aluno).
- Custo de geração de imagem por IA pode inviabilizar uso em escala — daí a
  biblioteca reutilizável ser parte do plano desde a Fase 2, não como otimização
  tardia.
- Dado sensível (diagnóstico, laudo, PEI) exige cuidado com LGPD desde o desenho
  do schema — tratar como requisito de Fase 1, não deixar para depois.
- **Não é mais oceano azul** (ver 3.1) — Lírios já vende pra prefeitura
  (recrutando "Municípios Pioneiros 2026"), Prova Adaptada já tem 50 escolas
  particulares. Diferenciação provável não está em "gerar atividade adaptada"
  (já existe no mercado), e sim em resolver a colaboração AEE-regente que a
  pesquisa mostra que falha na prática (3.2) — validar isso como aposta
  central na Fase 0, não como suposição.
