# Fases de implementação

> Detalhamento técnico de `PLANEJAMENTO.md` — lá está o "porquê" (posicionamento,
> concorrência, decisões de produto); aqui está o "o quê construir, em que ordem, em
> que arquivo". Checkbox marcado = confirmado existindo no repo em 2026-08-27 (arquivo
> lido/grepado nesta sessão). Checkbox vazio = não existe ainda. "⚠️ parcial" = existe
> mas com lacuna conhecida, detalhada no item.
>
> Referência visual canônica: `design_handoff_adapta/README.md` (8 telas). Este
> documento não repete copy/layout de lá — só mapeia pra arquivo real e lista o que
> falta pra cada peça funcionar fim a fim.

---

## Fase 0 — Descoberta e validação (não-técnica)

Nenhum item técnico aqui — é reunião/pesquisa, não código. Ver `PLANEJAMENTO.md` §9
(perguntas) e §10 (critério de saída da fase). Nada disto foi feito ainda:

- [ ] Reunião de descoberta com prefeitura/escola usando as 12 perguntas decisivas.
- [ ] Validar Modelo A vs B (turma-first vs aluno-first).
- [ ] Validar o desenho do planejamento semanal (Fase 2A abaixo) com professor real.
- [ ] Validar a percepção de risco do conselho comportamental ("a IA tá me avaliando?").
- [ ] Fechar lista de campos de perfil realmente usados na prática.
- [ ] Protótipo navegável validado com pelo menos um professor real.

**Isso bloqueia investimento pesado nas Fases 2-4, não a Fase 1** (que já está pronta
e pode ser usada como o próprio protótipo navegável desta fase).

---

## Fase 1 — MVP: turma → atividade → adaptação por aluno

**Status: ✅ fechada em 2026-08-27.** Implementado, ligado a dados reais e testado ao
vivo (dev server + Playwright, dados descartáveis criados e removidos). Falta só
validação com usuário real (Fase 0), não trabalho de engenharia.

**2026-08-28 — correção de fluxo:** o pipeline acima (turma → atividade → adaptação)
sempre assumiu que `student` já existia no banco — nenhuma tool de IA cria aluno, só
consulta (`lookupStudent`/`listStudents`). Até esta data, a única forma de um `student`
entrar em produção era o script de seed; não existia tela de cadastro manual. Corrigido:
- **Login trocado para CPF único** (`app/(auth)/login`, `app/(auth)/auth.ts`,
  `lib/cpf.ts`) — substitui email/senha e o modo "guest" por completo. CPF novo cria
  conta; CPF repetido resume a mesma conta (era isso que causava o "reset" sentido por
  inael com o guest). Sem senha/PIN — risco de acesso indevido com dado sensível
  (LGPD) sinalizado e aceito conscientemente por inael via AskUserQuestion, não é
  descuido; não reabrir essa discussão sem pedido explícito.
- **Nova tela `/aluno/novo`** — cadastro completo (nome, nome social, condições,
  interesses), decisão de inael via AskUserQuestion.
- **Home (`/`) ganhou gate**: professor sem nenhum aluno cadastrado vê CTA pra
  `/aluno/novo` em vez do CTA de chat — só depois de ter ≥1 aluno é que a tela de
  turma/chat aparece. Migração `0009` (coluna `user.cpf`, `user.email` virou nullable).
  Testado ao vivo (dev server real + Playwright contra o Neon real): CPF novo → gate →
  cadastro → turma; CPF repetido → resume conta; CPF inválido → rejeitado. Dados de
  teste apagados depois.

### 1.1 Schema (`lib/db/schema.ts`, migrações 0000-0006)
- [x] `student` + `studentProfile`/`studentCondition`/`studentInterest`/
  `studentLearningPreference`/`studentSensitivity`/`studentGoal`/`studentAiMemory`.
- [x] `turma`, `turmaStudent` (join many-to-many).
- [x] `atividade` (`content: AtividadeContent` — tema/duração/recursos/unidades
  temáticas/habilidades BNCC/momentos/avaliação; `sourceChatId`, `sourceFileUrl`,
  `status` draft/finalizada).
- [x] `atividadeAdaptada` (mesmo formato de `content`, `status`
  gerando/rascunho/validada, `editedByTeacher`).
- [x] `studentObservation` (timeline: `tipo` positivo/barreira/neutro, `origem`
  feedback/avulso, `atividadeId` opcional) — migração 0006.
- [x] `studentAeeNote` (colaboração AEE↔regente: `autor`, `papel`, `texto`) —
  migração 0006.
- [x] `user.schoolName` (migração 0005) — usado no cabeçalho de impressão.

### 1.2 AI tools (`lib/ai/tools/`)
- [x] `lookup-bncc-habilidade.ts` — consulta BNCC oficial, nunca inventa código.
- [x] `lookup-student.ts` — perfil completo por nome, retorna `id`.
- [x] `list-students.ts` — roster completo com condições/interesses.
- [x] `save-atividade.ts` — cria turma (se não existir) + `atividade` +
  `atividadeAdaptada` por aluno sinalizado.
- [x] `update-adaptacao.ts` — reescreve a versão adaptada de UM aluno numa atividade
  existente (usado pelo chat de ajuste fino, tela 5), preservando a mesma habilidade
  BNCC/objetivo.
- [x] Tools genéricas herdadas do template (`create-document.ts`, `edit-document.ts`,
  `update-document.ts`, `request-suggestions.ts`, `get-weather.ts`) — não específicas
  do domínio pedagógico, mantidas mas não centrais.

### 1.3 Telas (mapeamento rota → arquivo, todas as 8 do handoff)

| # | Rota | Arquivo(s) | Status |
|---|---|---|---|
| 1 | `/` (Início/Turma) | `app/page.tsx`, `app/turma-home.tsx` | [x] ligado a `getTurmaHomeData` |
| 2 | `/nova-aula` (chat) | `app/nova-aula/page.tsx`, `components/organic/chat/nova-aula-chat.tsx` | [x] composer redesenhado 2026-08-27 (ver git log) |
| 3 | `/plano/:id` (plano da turma) | `app/plano/[id]/page.tsx`, `components/organic/plano/plano-turma.tsx` | [x] "Exportar PDF" agora linka pra `/plano/:id/imprimir` (2026-08-27); "Adaptar por aluno" funciona |
| 4 | `/plano/:id/editar` | `app/plano/[id]/editar/page.tsx`, `components/organic/plano/editar-plano.tsx`, `bncc-selector.tsx` | [x] seletor BNCC (não texto livre) |
| 5 | `/plano/:id/aluno/:studentId` (construtor PEI) | `app/plano/[id]/aluno/[studentId]/page.tsx`, `components/organic/plano/adaptacao-builder.tsx`, `adaptacao-message.tsx` | [x] usa `updateAdaptacao` |
| 6 | `/atividade/:id` pronta+PDF | `app/(print)/atividades/[id]/imprimir/[adaptacaoId]/page.tsx`, `print-view.tsx` | [x] ⚠️ "PDF" = impressão do navegador (`window.print()`), não pipeline server-side. Link "Voltar" corrigido 2026-08-27 (apontava pra `/atividades/:id`, rota inexistente; agora vai pra `/atividades`) |
| 3b | `/plano/:id/imprimir` (novo, 2026-08-27) | `app/(print)/plano/[id]/imprimir/page.tsx`, `plano-print-view.tsx` | [x] documento formal do plano (não é o worksheet do aluno) — cabeçalho ESCOLA/TURMA/PROFESSOR/DATA, objetivo, duração/recursos, momentos, avaliação |
| 7 | `/atividades` (revisão de rascunhos) | `app/atividades/page.tsx`, `components/organic/atividades/atividades-list.tsx` | [x] |
| 8 | `/aluno/:id` (perfil + histórico + AEE) | `app/aluno/[id]/page.tsx`, `components/organic/aluno/aluno-profile.tsx` (622 linhas) | [x] histórico (`studentObservation`) + card "Dupla pedagógica" (AEE) + "Enviar como AEE" |

### 1.4 Débito técnico herdado (limpeza, não bloqueante) — ✅ resolvido 2026-08-27
- [x] `app/(dashboard)/alunos/page.tsx` e `app/(dashboard)/atividades/[id]/` (versão
  antiga/shadcn, órfã — nada mais linkava pra elas exceto a sidebar antiga) foram
  **deletadas**. Os dois links que apontavam pra `/alunos`
  (`components/chat/app-sidebar.tsx`, `components/chat/greeting.tsx`) agora vão pra
  `/` (turma home, que já mostra a lista de alunos com filtro Atípicos/Todos — não
  existe uma tela "lista de alunos" separada no handoff).
- [x] `Exportar PDF` da tela 3 — decisão tomada: implementar (o handoff especifica o
  botão; reaproveitar o padrão de impressão já existente era barato). Nova rota
  `/plano/:id/imprimir` com layout de documento formal (ver tabela acima, linha 3b).
- [x] Bônus encontrado no meio do trabalho: link "Voltar" da tela 6 (impressão por
  aluno) estava quebrado (`/atividades/:id`, rota que nunca existiu) — corrigido pra
  `/atividades`.

---

## Fase 2A — Planejamento semanal (novo módulo, `PLANEJAMENTO.md` §4.2)

**Status: ✅ fechada em 2026-08-27.** Decisão de produto (inael): o professor
normalmente já tem o próprio planejamento da semana pronto — ele manda de uma vez, e o
sistema decompõe em atividades diárias; **adaptação por aluno é flexível por dia**
("pode fazer nas duas situações"), não um modo único fixo.

### 2A.1 Schema — feito
- [x] Optou-se pela tabela própria `planejamentoSemanal` (registro-mãe), não um campo
  solto — mesmo padrão de `atividade`→`atividadeAdaptada`. Campos: `id`, `turmaId`,
  `teacherId`, `objetivoGeral` (opcional), `sourceChatId`, `createdAt`/`updatedAt`.
  Sem `periodoInicio`/`periodoFim`/`status` — cortados por não terem consumidor ainda
  (YAGNI; adicionar quando algo precisar ler esses campos).
- [x] `atividade.planejamentoSemanalId` (nullable) + `atividade.diaAplicacao`
  (`varchar(32)`, texto livre — "Segunda-feira" ou "22/09", não `date`: nem todo
  planejamento do professor vem com data exata).
- [x] Migração `0007_shiny_wind_dancer.sql` gerada e aplicada na base real — só
  `CREATE TABLE` + duas colunas nullable, sem risco pra dado existente, sem precisar
  do workaround de TTY (não houve drop+add na mesma tabela).

### 2A.2 AI tool — feito
- [x] `lib/ai/tools/save-planejamento-semanal.ts` — reaproveita `planoSchema` de
  `save-atividade.ts` por dia, `adaptacoes` por dia é **opcional** (schema Zod
  `dias[].adaptacoes: []` pode vir vazio).
- [x] Extraído `resolveActiveTurma` (`lib/db/queries.ts`) — lógica de "cria turma se
  não existir + puxa alunos do professor pra ela" que estava só dentro de
  `save-atividade.ts` virou helper compartilhado; `save-atividade.ts` foi refatorado
  pra usá-lo também (elimina a duplicação, não só evita nela na tool nova).
- [x] Wired em `app/(chat)/api/chat/route.ts` (import, `activeTools`, `tools`) e
  `lib/ai/prompts.ts` (seção "Planejamento semanal").
- [x] **Ajuste de comportamento descoberto só em teste real, não no schema:** a
  primeira versão do prompt fazia o modelo perguntar "posso salvar?" antes de chamar a
  tool (2 rodadas de teste reais confirmaram isso, incluindo o loop de confirmação).
  Corrigido com uma instrução explícita "não pergunte, chame a tool assim que os dias
  estiverem montados" + "depois de salvar, resuma o que foi criado" (sem isso a
  resposta final ficava só "Planejamento salvo com sucesso", sem recapitular tema/BNCC
  por dia).

### 2A.3 Tela — decisão pragmática: nenhuma tela nova pra MVP
- [x] Entrada: **sem cartão novo em `/nova-aula`** — o professor descreve a semana na
  mesma conversa de sempre; o modelo decide entre `saveAtividade` (1 dia) e
  `savePlanejamentoSemanal` (vários dias) pelo conteúdo da mensagem, igual já decide
  entre outras tools. Evita UI nova pra uma decisão que a IA já consegue tomar.
- [x] "Ficha semanal" (revisão agrupada): **não construída** — as N atividades criadas
  já aparecem automaticamente em `/atividades` (query `getAtividadesWithAdaptacoesByTeacherId`
  é genérica, não filtra por origem) e em `/plano/:id` individualmente. Adicionei só
  duas pequenas melhorias de exibição pra diferenciar os dias de uma mesma semana:
  tag `diaAplicacao` no header de `/plano/:id` (`plano-turma.tsx`) e `· {diaAplicacao}`
  na linha de cada grupo em `/atividades` (`atividades-list.tsx`). Uma tela dedicada de
  ficha semanal fica como possível follow-up de UX, não bloqueador.

### 2A.4 Testes — feito, ao vivo (não só typecheck)
- [x] Chamada real via `/api/chat` (guest descartável + 1 aluno de teste com condição
  TEA) descrevendo 3 dias de aula, pedindo adaptação só pra segunda. Confirmado no
  banco: `planejamentoSemanal` criado, 3 `atividade` corretas (Segunda/Terça/Quarta,
  temas e BNCC coerentes), **1 adaptação em Segunda, 0 em Terça/Quarta** — timing
  flexível funcionando como pedido, não hardcoded pra "tudo ou nada". `resolveActiveTurma`
  criou "Minha turma" e vinculou o aluno corretamente.
  - [x] Efeito colateral positivo observado: quando pedi um teste com BNCC ambíguo
    (educação infantil vs 3º ano no mesmo prompt), o modelo perguntou a etapa em vez de
    chutar um código — reforça que "nunca invente BNCC" continua valendo nesse fluxo.
- [x] Dados de teste (chats, aluno, turma, planejamento, atividades) e os 3 scripts
  `lib/db/_test-*.ts` usados foram apagados depois.

---

## Fase 2B — Conselho comportamental por aluno (novo módulo, `PLANEJAMENTO.md` §4.3)

**Status: ✅ fechada em 2026-08-27.** As duas decisões de produto que faltavam
(granularidade do registro, tom/guardrail) foram tomadas por mim durante a
implementação, não pelo inael — sinalizadas abaixo, não são decisões dele.

### 2B.1 Schema — feito
- [x] `chat.studentId` (nullable FK pra `student.id`). Set só quando o chat é um
  "conselho" (via `findOrCreateConselhoChat`) — todo outro chat continua com
  `studentId: null`.
- [x] `studentObservation.origem` ganhou o valor `"conselho"`.
- [x] `studentObservation.chatId` (nullable FK pra `chat.id`) — **decisão minha**:
  precisa pra implementar upsert-por-conversa (ver 2B.2). Não estava no escopo
  original do doc, mas é o que torna a decisão de granularidade abaixo possível.
- [x] Migração `0008_remarkable_hedge_knight.sql` — só `ADD COLUMN` + FKs, sem drop,
  aplicada na base real sem risco.

### 2B.2 AI tools/contexto — feito, com as duas decisões que estavam em aberto
- [x] **Decisão minha (granularidade):** em vez de tool-call (`log-conselho...`) que o
  modelo precisaria lembrar de chamar, o registro é **automático, server-side**, no
  `onEnd` de `app/(chat)/api/chat/route.ts` — pega o texto da última mensagem do
  assistente e faz upsert direto via `upsertConselhoObservation`. Escolhido depois da
  Fase 2A ter mostrado, com teste real, que depender do modelo lembrar de chamar uma
  tool de salvar é frágil (ver § Fase 2A.2) — automático elimina essa classe de bug
  inteira. **É uma entrada por conversa** (upsert por `chatId`, mesmo padrão de
  "substitui a versão anterior" que `updateAdaptacao` já usa), não uma por mensagem.
- [x] **Decisão minha (contexto):** em vez de uma tool nova, estendi
  `getStudentFullContext` (chamada por `lookupStudent`, que o modelo já usa) pra
  também trazer as últimas 8 `studentObservation` e todas as `studentAeeNote` — assim
  tanto adaptação de atividade quanto conselho comportamental ganham o histórico real
  sem tool extra.
- [x] `lib/db/queries.ts`: `resolveActiveTurma`-like helpers novos —
  `findOrCreateConselhoChat` (reaproveita o chat mais recente do par
  professor+aluno, não fragmenta em vários chats) e `upsertConselhoObservation`.
- [x] Tool set restrito: `activeTools` em route.ts vira só `["lookupStudent"]` quando
  `chat.studentId` está setado — o modelo não tem acesso a `saveAtividade`/
  `savePlanejamentoSemanal`/`updateAdaptacao` nesse modo, então não tem como confundir
  conselho com criação de atividade.
- [x] **Decisão minha (tom/guardrail):** prompt dedicado `conselhoPrompt` em
  `lib/ai/prompts.ts`, **substituindo** `regularPrompt` inteiro nesse modo (não uma
  seção anexada) — reaproveita a regra "você sugere, o professor decide, encaminhe pra
  profissional se precisar" que já existia pra adaptação de atividade, adiciona
  "respostas curtas, 2-4 frases" (contexto de celular em sala) e proíbe explicitamente
  gerar atividade/plano nesse chat. Sem rate-limit de frequência — decidi não construir
  isso agora (nenhum sinal real de necessidade ainda, seria over-engineering).

### 2B.3 Tela — feito
- [x] Botão "Conversar sobre {Nome}" em `aluno-profile.tsx`, acima de "Histórico
  recente".
- [x] Rota: **reaproveitada `/chat/:id`** (já existente, Organic, resumível) em vez de
  criar rota nova — `app/chat/[id]/page.tsx` agora ramifica: se `chat.studentId`
  setado, renderiza o novo `ConselhoChat`; senão, `NovaAulaChat` como antes. Isso
  evitou ter que estender `hooks/use-active-chat.tsx` (`extractChatId` já casa com
  `/chat/:id`) — zero mudança em código compartilhado por outras telas.
- [x] `components/organic/aluno/conselho-chat.tsx` — novo, composer só texto (sem
  anexo, sem os cartões "Descrever"/"Anexar" que não fazem sentido aqui), header com
  nome do aluno + "Vira registro no histórico dele" (transparência sobre o auto-log).
- [x] Server action `startConselhoChatAction` (`app/aluno/[id]/actions.ts`) —
  find-or-create + `redirect`.

### 2B.4 Pendências de produto — resolvidas
- [x] LGPD (editar/apagar): inael confirmou "como qualquer observação manual". **Nota
  importante descoberta ao implementar:** observação manual hoje só tem **apagar**
  (`removerObservacaoAction`), não editar-em-lugar — essa capacidade nunca existiu,
  nem antes desta Fase. `removerObservacaoAction` já funciona genericamente por `id`
  sem filtrar por `origem`, então "apagar como observação manual" já vale de graça
  pra entradas de conselho, sem mudança de código. Edição-em-lugar continua não
  existindo pra NENHUM tipo de observação — não construí isso agora pra não expandir
  escopo além do que foi pedido; se inael quiser editar (não só apagar+recriar), é um
  pedido novo, não parte desta fase.
- [x] Tom/frequência: ver decisão em 2B.2.

### 2B.5 Testes — feito, ao vivo, com achados reais
- [x] Guest descartável + aluna de teste com condição (TDAH), estratégia eficaz
  (`effectiveness: "high"`, "pausas curtas") e 1 observação anterior ("dispersou em
  leitura longa") — pra provar que o contexto é usado de verdade, não só presente no
  schema.
- [x] Fluxo completo via Playwright: clique em "Conversar sobre Maria" → redirect pra
  `/chat/:id` → `ConselhoChat` renderiza (sem cartões de atividade) → mensagem
  enviada → resposta da IA **cita a condição, a observação anterior E a estratégia
  eficaz corretamente**, sugere ação concreta de 2 minutos, e recomenda acionar
  AEE/psicopedagogo se persistir — bate com o guardrail "sugere, não diagnostica".
  Zero erros de console.
- [x] Confirmado no banco: `studentObservation` criada com `origem: "conselho"`,
  `chatId` linkado ao chat certo, `tipo: "neutro"`, texto idêntico ao que apareceu na
  tela.
- [x] Segunda mensagem na mesma conversa testada duas vezes; ambas tiveram a resposta
  cortada por fechamento prematuro do browser no script de teste (limitação do
  Playwright com respostas em streaming, não do produto — o guard `if (assistantText)`
  em route.ts corretamente não gravou nada quando a resposta veio vazia). O caminho de
  UPDATE do upsert (`upsertConselhoObservation` quando já existe linha pro `chatId`)
  não foi confirmado ao vivo por causa disso — é o mesmo padrão simples de
  "update where id" já provado em `updateAtividadeContent`/`validateAtividadeAdaptada`,
  então ficou verificado por revisão de código, não por chamada real. Sinalizando isso
  explicitamente em vez de reivindicar teste completo que não aconteceu.

---

## Fase 3 — Acompanhamento e relatórios

**Status: nada implementado.** Depende de volume real de `studentObservation`/
`studentAeeNote` acumulado (Fases 1/2B), então não faz sentido começar antes delas
terem uso real.

- [ ] Relatórios pra coordenação/secretaria — formato não definido, depende da
  pergunta 9 do §9.1 de `PLANEJAMENTO.md` ("quais documentos são obrigatórios pra
  prefeitura").
- [ ] Exportação de PEI formal a partir de `studentObservation` + `studentAeeNote` +
  `atividadeAdaptada` validadas — obrigação legal (art. 28 da Lei 13.146/2015), não
  feature opcional; formato exato depende de validação com rede real (Fase 0).
- [ ] Biblioteca própria de imagens/ilustrações reutilizáveis — motivada por custo
  (`[[project_cost_economics]]`: geração de imagem domina o custo de IA, ~$260-500/mês
  por município no modelo atual). Sem esboço de schema ainda.
- [ ] Editor de atividade pré-exportação (trocar texto/imagem/reorganizar) — depende
  da biblioteca de imagens acima pra fazer sentido completo.

---

## Fase 4 — Escala e integrações

**Status: nada implementado.** Mais distante, detalhamento fica raso de propósito —
não vale planejar fundo antes das Fases 2/3 terem uso real.

- [ ] Multi-escola/multi-rede — precisa de entidade `escola` de verdade (hoje só
  `user.schoolName`, texto livre) e provavelmente `rede`/`municipio` acima dela.
- [ ] Permissões por papel (professor, coordenador, secretaria, admin) — hoje não
  existe nenhum conceito de papel além de `user` autenticado; toda query já filtra por
  `teacherId`, então isso é uma camada nova, não um remendo.
- [ ] Integrações (Google Classroom, diário eletrônico, importação de alunos em lote).
- [ ] Assistente por voz — evolução do chat existente, não módulo novo do zero.

---

## Ordem recomendada de execução

1. ~~**Fase 0** (descoberta) e **Fase 1.4** (limpeza técnica) podem rodar em
   paralelo~~ — **1.4 feita** (2026-08-27); Fase 0 (validação com professor real)
   segue não feita, é decisão de produto/negócio, não engenharia — não bloqueia o
   resto do trabalho técnico.
2. ~~Entre 2A e 2B~~ — **2A e 2B feitas** (2026-08-27). O diferencial defensável
   (`PLANEJAMENTO.md` §3.2) já está implementado e testado ao vivo.
3. **Fase 3** é a próxima candidata — depende de volume real de `studentObservation`
   (agora alimentado por 3 fontes: feedback, avulso, conselho) pra fazer sentido
   construir relatório. Ainda não validado com professor real (Fase 0).
4. **Fase 4** só quando houver sinal concreto de segunda escola/rede — não
   pré-otimizar pra escala que ainda não existe.
