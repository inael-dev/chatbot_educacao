# Planejamento — Plataforma de IA para Educação Inclusiva

> Documento de trabalho. Reescrito em 2026-08-27 porque a versão anterior tinha ficado
> desatualizada em relação ao código real (schema já implementa boa parte do que estava
> listado como "falta fazer") e misturava demais ideia + decisão + rascunho. Pontos
> marcados **[EM ABERTO]** dependem de validação com cliente/professor real antes de
> virar decisão técnica travada. A referência visual canônica das telas é o handoff
> `design_handoff_adapta/README.md` — este documento não repete o que já está descrito
> lá, só referencia e adiciona o que é novo.

## 1. Posicionamento

Não é "um chatbot para professores". É uma **plataforma de planejamento, adaptação
pedagógica e apoio comportamental com IA**, com dois pilares complementares:

1. **Planejamento e adaptação:** o professor prepara uma proposta de aula (ou da
   semana) e a plataforma gera as adaptações necessárias para que cada estudante
   participe da mesma experiência de aprendizagem, alinhada à BNCC.
2. **Apoio do dia a dia:** o professor pode, a qualquer momento (inclusive pelo
   celular, em sala), relatar uma situação de comportamento de um aluno específico e
   receber orientação de manejo fundamentada no histórico e no perfil daquele aluno —
   não é conversa genérica, é conselho contextualizado.

**Discurso de venda:**
> "Nossa IA preserva o planejamento do professor, adapta automaticamente as atividades
> para cada aluno que precisa de apoio, e ajuda o professor a lidar com o dia a dia da
> sala — tudo ancorado no histórico real de cada criança, alinhado à BNCC e aos
> princípios da educação inclusiva."

## 2. Público e clientes

- **Público de uso:** Educação Infantil e Ensino Fundamental I (expansão futura possível).
- **Clientes:** prefeituras/secretarias de educação, escolas particulares.
- **[EM ABERTO]** Uso restrito a professores do AEE ou também regentes? Foco inicial só
  em alunos atípicos ou toda a turma?
- Municípios podem já ter ferramenta própria de planejamento (ex: Fortaleza —
  "Professor Online", seção 3.2) — validar coexistência/integração na Fase 0, não
  assumir substituição.

## 3. Diferencial e concorrência

### 3.1 O que já é mercado disputado (não é diferencial sozinho)

- **Adaptação de atividade por aluno/PEI:** **Lírios** (lirios.tech) já faz quase
  exatamente o Modelo A deste projeto (turma → IA adapta por aluno a partir do PEI) e
  está vendendo direto pra prefeitura ("Municípios Pioneiros 2026"). **Prova Adaptada**
  adapta por *tipo de condição* (não por aluno individual), 50 escolas particulares,
  R$1M investido, ambição declarada de ir pra rede pública.
- **Geração de plano semanal/BNCC:** categoria concorrida — AulaGen (diário a anual,
  BNCC, já com "adaptações"), PlanoEdu, Prof.AI, Plano AI, planoaula.com.br,
  planejamentodeaulasbncc.com.br. **A "ficha semanal" (seção 4.2) não deve ser vendida
  como diferencial — é conveniência de fluxo, não avanço competitivo.**

### 3.2 O que ainda parece espaço livre (pesquisa 2026-08-27)

- **Conselho comportamental ancorado no histórico do aluno, em tempo real:**
  pesquisa dedicada (web, 2026-08-27) não encontrou nenhum concorrente — brasileiro ou
  internacional — que ofereça um chat onde o professor relata uma situação de
  comportamento de uma criança específica e recebe orientação fundamentada no
  perfil/histórico daquele aluno. O mais próximo:
  - **Vínculoo** tem um assistente chamado **"Apoio Inteligente"** (chat em linguagem
    natural pro professor tirar dúvidas) — formato parecido, mas não confirmado se é
    ancorado no histórico individual em tempo real ou é orientação genérica sobre
    inclusão/documentação. **Risco:** Vínculoo cresceu **16x em 12 meses** (320+
    escolas, 2.300 professores, 10 mil alunos, projeção 20 mil até fim de ano),
    puxada pelo Decreto 12.686/2025 que expandiu a obrigação de PAEE — é o concorrente
    que mais rápido poderia fechar essa lacuna, não um adjacente distante.
  - **SchoolAI** (internacional) tem "Mission Control" (chatbot de intervenção
    comportamental, mas genérico/dashboard, não amarrado a perfil individual) e
    "AI Coach" (coaching de desenvolvimento profissional do professor, não conselho
    situacional sobre uma criança).
  - Categoria "SEL (apoio socioemocional) com IA para professor" ainda não tem líder
    claro — ferramentas existentes (Panorama Education, Satchel Pulse, ClassDojo,
    TeachFX) são dashboards/analytics de turma, não chat individual conversacional.
- **Colaboração AEE↔regente:** pesquisa acadêmica mostra que essa parceria
  **rotineiramente falha na prática** na rede municipal (regente muitas vezes nem
  conhece o PEI do aluno) — nenhum concorrente pesquisado resolve isso de forma
  visível. Ver seção 3.3.

**Conclusão prática:** o diferencial defensável não é mais "gerar atividade adaptada"
(commodity crescente) — é a combinação **conselho comportamental contextualizado +
colaboração AEE↔regente estruturada**, ambos ancorados no mesmo histórico vivo do
aluno que a adaptação de atividade já alimenta. Validar isso como aposta central na
Fase 0 (seção 9), não como suposição.

### 3.3 Como o planejamento/colaboração funcionam hoje (pesquisa 2026-08)

- **Fortaleza (SME)** roda "Professor Online" desde ago/2025: planejamento,
  frequência, acompanhamento, currículo próprio (DCRFor), coordenador validando o
  planejamento. Sem IA, sem adaptação, sem AEE. Pra esse tipo de prefeitura o pitch é
  "a camada de inclusão que a ferramenta deles não cobre", não "façam planejamento
  aqui".
- **AEE + regente:** modelo formal é "turma primeiro, atípico depois" (regente planeja
  pra turma, AEE colabora na adaptação), mas pesquisa mostra que na rede municipal essa
  parceria costuma não acontecer de fato — falta diálogo, recursos, o regente às vezes
  nem conhece o PEI. Rede estadual articula melhor.
- **PEI é obrigação legal**, não boa prática — art. 28 da Lei 13.146/2015 (LBI),
  exigível sempre que o aluno tem necessidade específica. Munição de venda ("cumpre uma
  obrigação legal hoje feita manualmente ou não feita"); `studentObservation` +
  `studentAeeNote` (seção 5) devem, na Fase 3, poder alimentar o PEI formal.

## 4. Os três fluxos do produto

### 4.1 Planejamento de aula → adaptação por aluno (existente, telas 2-4/6/7 do handoff)

```
Professor descreve a aula (chat) ou anexa plano pronto (foto/PDF)
      ↓
IA monta o plano completo da turma (tema, objetivo, BNCC real, momentos, avaliação)
      ↓
IA identifica alunos que provavelmente precisam de adaptação
      ↓
IA gera versão adaptada por aluno (mesmo objetivo, mesmo momento da aula)
      ↓
Professor revisa/valida em /atividades — não no histórico do chat
```

Já implementado (ver seção 5): tool `saveAtividade` gera `atividade` + uma
`atividadeAdaptada` por aluno sinalizado. Fluxo em lote (uma ação → N saídas), não
"chat por aluno" — benchmarking (MagicSchool AI, Diffit, Brisk Teaching, SchoolAI)
confirma que nenhum concorrente usa "conversa por aluno" como mecanismo principal;
com turma de 10-15+ alunos isso é inviável na prática. O chat por aluno
(`/plano/:id/aluno/:id`) continua existindo, mas como ajuste fino ("deixa a da Ana
mais visual"), não como criação primária.

**Decisão em aberto herdada — Modelo A vs B [EM ABERTO]:** ponto de partida é a turma
(atividade única com derivações) ou o aluno individual (atividade própria por aluno)?
Muda a arquitetura de dados. Não decidir sem validar com professor/coordenação real.

### 4.2 Planejamento semanal (novo — ✅ implementado 2026-08-27, ver `fases.md` § Fase 2A)

Ideia validada com inael (2026-08-27): em vez de só criar uma aula por dia, o
professor manda **o planejamento da semana inteira, uma vez, pra turma como um todo**.
A partir disso o sistema **decompõe automaticamente em atividades diárias** ao longo
dos dias da semana, reaproveitando o mesmo pipeline de adaptação por aluno da seção
4.1 (não é um mecanismo novo de adaptação, é uma forma diferente de dar o input).

```
Professor descreve o planejamento da semana (uma vez, pra turma)
      ↓
IA quebra em N atividades diárias (mesma lógica de "momentos"/objetivo já usada)
      ↓
Para cada atividade diária: mesmo pipeline da seção 4.1
      (identifica quem precisa de adaptação → gera versão por aluno)
      ↓
Semana inteira revisável num só lugar (ficha semanal)
```

**Por que isso é conveniência de fluxo, não diferencial (ver 3.1):** o mercado de
geração de plano semanal com BNCC já é disputado. O valor real aqui é reduzir fricção
de entrada (uma interação em vez de cinco) mantendo a adaptação por aluno acoplada —
isso sim é diferencial, herdado da seção 4.1.

**Implementado:** tabela `planejamentoSemanal` + `atividade.planejamentoSemanalId` +
`atividade.diaAplicacao`, tool `savePlanejamentoSemanal`, testado ao vivo (ver
`fases.md` § Fase 2A.4). Sem tela nova — as atividades da semana aparecem
automaticamente em `/atividades` e `/plano/:id`, cada uma com a tag do dia.

**Resolvido (2026-08-27, inael):** "pode fazer nas duas situações" — a adaptação por
aluno em cada dia é **opcional por chamada**, não um modo fixo. Se o professor já
sinalizou quem adaptar num dia específico durante a conversa, a IA já inclui; senão,
fica pra depois, individualmente, quando o professor abrir aquele dia em `/plano/:id`.
Não existe mais uma escolha binária "confirma dia a dia" vs "gera as 5 de uma vez" — a
tool sempre cria as N atividades-base de uma vez (o professor já trouxe o conteúdo
pronto), e só a *adaptação por aluno* é que fica flexível dia a dia.

**Ainda em aberto:** cadência sempre semanal ou período escolhido pelo professor? Não
apareceu necessidade real ainda — `periodoInicio`/`periodoFim` foram deliberadamente
deixados fora do schema (YAGNI) até um caso de uso pedir.

### 4.3 Conselho comportamental por aluno (✅ implementado 2026-08-27, ver `fases.md` § Fase 2B)

Exemplo motivador: professor no celular, em sala, escreve "ele tá muito agitado hoje,
não para quieto" sobre um aluno específico — a IA responde com orientação de manejo
fundamentada no perfil e histórico daquele aluno (condição, o que já funcionou antes,
notas do AEE), não uma resposta genérica de "dicas de sala de aula".

**Onde vive (decisão 2026-08-27):** ponto de entrada **separado do fluxo de
atividade**, dentro do perfil do aluno (`/aluno/:id` — tela 8 do handoff, que já reúne
histórico + colaboração AEE). Não fica dentro de `/plano/:id/aluno/:id` (o construtor
de adaptação, tela 5) porque aquele é um fluxo estruturado e versionado (v1, v2...)
amarrado a uma atividade/aula específica — desabafo de comportamento é atemporal, não
tem "versão de plano".

**Regra de registro (decisão 2026-08-27):** toda conversa desse tipo **sempre vira uma
entrada no histórico do aluno** (`studentObservation`, que já existe e já modela
exatamente isso: `tipo` positivo/barreira/neutro, `origem` feedback/avulso). Precisa
adicionar um novo valor de `origem` (ex.: `"conselho"`) pra diferenciar de observação
avulsa digitada à mão.

```
Professor abre "Conversar sobre {Nome}" em /aluno/:id
      ↓
Relata a situação (texto livre, sem estrutura obrigatória)
      ↓
IA consulta perfil + condição + últimas N observações + notas AEE do aluno
  (lookupStudent já existe; falta a tool ler studentObservation/studentAeeNote)
      ↓
IA aconselha (estratégia de manejo, não gera atividade)
      ↓
Conversa vira automaticamente uma StudentObservation (origem: "conselho")
```

**Implementado:** `chat.studentId`, `studentObservation.chatId`/`origem: "conselho"`,
`getStudentFullContext` estendido com histórico+AEE, prompt dedicado, registro
**automático server-side** (não tool-call — mais confiável, ver `fases.md` § Fase
2B.2 pra por quê). Testado ao vivo: a IA citou corretamente a condição, uma
observação anterior e uma estratégia já eficaz de uma aluna de teste.

**Resolvido (2026-08-27):**
- LGPD: inael confirmou "editar e apagar como observação manual" — só **apagar**
  existe hoje (pra qualquer observação, manual ou não; editar-em-lugar nunca existiu,
  nem antes desta feature). `removerObservacaoAction` já cobre isso sem mudança.
- Tom: reaproveita a regra "sugere, não diagnostica, encaminha pra profissional"
  já usada na adaptação de atividade + instrução de resposta curta. Sem limite de
  frequência — não implementado por falta de sinal real de necessidade (decisão
  minha, não pedido do inael — revisitar se virar problema real).

### 4.4 Colaboração AEE ↔ regente (existente, tela 8 do handoff)

Já modelado (`studentAeeNote`): professor de AEE deixa nota no perfil do aluno,
regente responde. Continua sendo a aposta central de diferenciação de longo prazo
(seção 3.2/3.3) — nenhum concorrente pesquisado ataca isso de forma visível.

## 5. Onde os dados já vivem (schema real, `lib/db/schema.ts`)

**Importante:** a versão anterior deste documento listava turma/atividade/adaptação
como "não implementado ainda" — isso estava **desatualizado**. Checado direto no
schema em 2026-08-27, já existe:

- `student`, `studentProfile` (níveis 1-5), `studentCondition`, `studentInterest`,
  `studentLearningPreference`, `studentSensitivity`, `studentGoal`, `studentAiMemory`
  (resumo vivo do aluno, usado como contexto compacto em vez do histórico completo).
- `studentObservation` — **já é** a timeline/histórico do handoff (tela 8): `tipo`
  (positivo/barreira/neutro), `origem` (feedback/avulso), `atividadeId` opcional.
  Precisa só do novo valor de `origem` pra seção 4.3.
- `studentAeeNote` — **já é** a colaboração AEE↔regente (seção 4.4): `autor`, `papel`
  (aee/regente), `texto`.
- `turma`, `turmaStudent` (join many-to-many, porque um professor pode ter mais de uma
  turma e um aluno pode trocar de turma).
- `atividade` — atividade-base da turma (`content` estruturado: tema, duração,
  recursos, unidades temáticas, habilidades BNCC, momentos, avaliação; `sourceChatId`,
  `sourceFileUrl`, `status` draft/finalizada).
- `atividadeAdaptada` — versão por aluno (`content` no mesmo formato, `status`
  gerando/rascunho/validada, `editedByTeacher`).
- Tools de IA já plugadas no chat: `lookupBnccHabilidade`, `lookupStudent`,
  `listStudents`, `saveAtividade` (cria turma se não existir + atividade +
  atividadeAdaptada por aluno).
- **"Professor" ainda é só `user`**, mas já tem `user.schoolName` (migração 0005,
  2026-08-07) — resolve o cabeçalho de impressão sem precisar de entidade `escola`
  própria; não há rede/multi-escola por trás disso ainda (fica pra Fase 4).

**O que falta de fato** (não é retrabalho, é extensão do que já existe):
1. `chat.studentId` (ou equivalente) — seção 4.3.
2. Novo valor de `origem` em `studentObservation` — seção 4.3.
3. Agrupamento de `atividade` por semana — seção 4.2.
4. Campo de dia/data de aplicação em `atividade` — seção 4.2.
5. Tool de IA que leia `studentObservation`/`studentAeeNote` como contexto — seção 4.3.

## 6. Telas

Base canônica: `design_handoff_adapta/README.md` (8 telas, rotas, copy exata, layout).
Não repetido aqui. Duas adições que o handoff original não cobre:

- **Ponto de entrada do conselho comportamental** dentro de `/aluno/:id` (tela 8) —
  ex.: botão/card "Conversar sobre {Nome}" perto da timeline. Precisa de mockup próprio
  — não existe ainda no handoff visual.
- **Ficha semanal** (seção 4.2) — tela nova, sem mockup ainda. Provável rota
  `/planejamento` ou `/plano-semanal` (nome final em aberto).

**Status de implementação (corrigido 2026-08-27, checado direto no repo):** as 8 telas
do handoff **já existem e estão ligadas a dados reais**, não só a tela 1/2 como uma
versão anterior deste documento chegou a dizer por engano — `app/page.tsx` (1),
`app/nova-aula` (2), `app/plano/[id]` (3), `app/plano/[id]/editar` (4),
`app/plano/[id]/aluno/[studentId]` (5), `app/(print)/atividades/[id]/imprimir/...` (6,
via impressão do navegador em vez de PDF gerado no servidor), `app/atividades` (7),
`app/aluno/[id]` (8, já com histórico + colaboração AEE). Ver detalhamento tela a tela
em `fases.md` § Fase 1. Não confundir "tela existe e funciona" com "validada por
professor real" — isso continua em aberto (Fase 0).

## 7. Papel da IA

A IA **não adivinha** — recebe contexto antes de agir. "Crie atividade pra Maria" →
consulta cadastro, histórico, objetivos, BNCC, observações, só então monta o prompt.

**Faz:** sugerir/adaptar atividade, explicar BNCC, aconselhar sobre manejo
comportamental (seção 4.3, ancorado em contexto real), resumir observações, apoiar
planejamento (diário e semanal).
**Não faz:** substituir o professor, decidir sozinha sem contexto do aluno, diagnosticar.

## 8. Arquitetura — evolução deste repositório

Este projeto (`chatbot`) **é a base** da plataforma, não um projeto à parte.

| Camada | Estado atual | Decisão |
|---|---|---|
| Frontend | Next.js (App Router) | mantém |
| Backend | Next.js API routes (`app/api`) | mantém até haver motivo real pra separar (processamento pesado assíncrono ou múltiplos consumidores fora do Next.js) |
| Banco | PostgreSQL via Drizzle ORM | mantém |
| Filas | Redis já é dependência (sem BullMQ ainda) | adicionar BullMQ quando houver job assíncrono real (ex: geração de PDF em lote, decomposição semanal da seção 4.2) |
| Storage | Cloudflare R2 (`@aws-sdk/client-s3`) | decidido; bucket público `r2.dev` é dev/teste — trocar por domínio próprio/URLs assinadas antes de produção com dado real de aluno |
| Infra | Vercel (`@vercel/*`: functions, analytics, otel, bot protection) | **[EM ABERTO]** — migrar pra infra própria só se exigência contratual de dado nacional/self-hosted aparecer (comum em contrato público — perguntar na Fase 0) |
| IA | AI SDK, múltiplos providers resolvidos no código, hoje só OpenAI ativo (`gpt-5-mini`) | outros providers ficam inertes até haver motivo/chave |

## 9. Perguntas de descoberta para a reunião com o cliente

Abertura:
> "Quando um professor chega em casa depois de um dia de aula, qual é a tarefa mais
> cansativa e repetitiva que vocês gostariam que um sistema fizesse por ele?"

### 9.1 As 12 mais decisivas

1. O planejamento começa pela turma ou pelo aluno? *(Modelo A vs B, seção 4.1)*
2. A atividade deve ser criada do zero, adaptada de uma existente, ou só sugerida?
3. O professor quer conversar com a IA ou apertar um botão e receber tudo pronto?
4. O sistema é usado no planejamento, durante a aula, ou nos dois momentos?
5. O professor edita tudo que a IA gerar, ou só aprova?
6. **Quando um aluno "dá trabalho" em sala, o que o professor faz hoje?** Pede ajuda a
   quem? Registra em algum lugar? *(valida a seção 4.3 diretamente)*
7. **Um conselho de manejo comportamental viraria registro que o professor
   confia/usaria de fato, ou soaria "a IA tá me avaliando"?** *(risco de percepção da
   seção 4.3)*
8. O professor planeja aula por aula ou pensa a semana inteira de uma vez? *(seção 4.2)*
9. Quais documentos são obrigatórios pra prefeitura e poderiam ser gerados automaticamente?
10. Como avaliam hoje se uma atividade deu certo?
11. Como funciona hoje, na prática, a comunicação entre regente e AEE — diálogo direto
    ou cada um trabalha separado?
12. Se só pudessem pagar por uma funcionalidade, qual resolveria o maior problema do
    dia a dia?

### 9.2 Lista completa, por tema

**Público-alvo:** só Educação Infantil ou também Fundamental I? AEE, regente, ou ambos?

**Perfil do aluno:** o que realmente ajuda a IA — idade, série, diagnóstico, laudo,
interesses, hiperfocos, dificuldades, PEI, acompanhante?

**Conselho comportamental (novo, seção 4.3):** situações mais comuns que geram dúvida
no professor? Prefere resposta rápida (1-2 frases) ou explicação mais longa? Já usa
algum grupo/pessoa (coordenação, AEE, outro professor) pra esse tipo de dúvida hoje —
o produto compete ou complementa esse canal?

**Planejamento semanal (novo, seção 4.2):** hoje já planeja a semana de uma vez, ou
aula por aula? Precisa de aprovação da coordenação antes de aplicar?

**Evolução/histórico:** como acompanham hoje — relatório, PEI, ficha, avaliação
periódica? Quem mais além do professor vê isso — coordenador, secretaria, família?

**BNCC:** quem escolhe o código — professor, coordenação? Currículo próprio além da BNCC?

**Impressão:** A4, colorido ou P&B? Envia pra pais? Usa tablet?

**Ferramentas atuais/concorrência:** já conhecem ou testaram Lírios, Prova Adaptada,
Vínculoo, AulaGen? O que funcionou ou não? A rede já tem plataforma própria (tipo
"Professor Online" de Fortaleza)? Precisaria integrar ou poderia substituir?

**Escala:** uma escola, dez escolas, ou toda a rede?

**Permissões:** quem pode criar, editar, aprovar, excluir, visualizar?

## 10. Fases do projeto

### Fase 0 — Descoberta e validação (pré-desenvolvimento)
- Reunião de descoberta usando a seção 9.
- Validar Modelo A vs B (seção 4.1), o desenho da seção 4.2 e a percepção de risco da
  seção 4.3 pergunta 7.
- Validar quais campos de perfil são realmente usados na prática.
- Sair da fase com: 1 fluxo de uso validado, 1 lista de campos de perfil fechada, 1
  protótipo navegável validado com pelo menos um professor real.

### Fase 1 — MVP — **já implementado** (ver `fases.md` § Fase 1 para o detalhamento)
- Turma → atividade → adaptação por aluno funcionando fim a fim, com as 8 telas do
  handoff ligadas a dados reais.
- Exportação em PDF via impressão do navegador (funcional para MVP; pipeline de
  geração server-side fica pra depois, não é bloqueador).
- Sem relatórios formais, sem biblioteca de imagens própria, sem integrações externas.
- **Objetivo pendente:** validar com usuário real se "turma → IA → adaptação" resolve
  o problema antes de investir mais nos módulos novos (4.2, 4.3) — isso é Fase 0, não
  Fase 1, e continua não feito.

### Fase 2 — Conselho comportamental + planejamento semanal (novo escopo) — ✅ fechada
- **2A (planejamento semanal, seção 4.2) — implementado** (2026-08-27, ver
  `fases.md` § Fase 2A). Sem tela nova; reaproveita `/atividades` e `/plano/:id`.
- **2B (conselho comportamental, seção 4.3) — implementado** (2026-08-27, ver
  `fases.md` § Fase 2B). Chat em `/chat/:id` (reaproveitado), registro automático
  server-side em `studentObservation`, testado ao vivo com contexto real (condição +
  estratégia eficaz + histórico anterior citados corretamente pela IA).
- Ainda não feito: detecção proativa de adaptação, motor de adaptação como serviço
  reutilizável, editor de atividade antes da exportação — ficam pra quando houver
  sinal de necessidade real (Fase 0/uso real), não foram pedidos agora.

### Fase 3 — Acompanhamento e relatórios
- Relatórios pra coordenação/secretaria.
- PEI/ficha de acompanhamento alimentado por `studentObservation`/`studentAeeNote` —
  obrigação legal (art. 28 da Lei 13.146/2015), não feature bônus.
- Biblioteca própria de imagens/ilustrações reutilizáveis (custo de geração de imagem
  em escala, ver seção 11).

### Fase 4 — Escala e integrações
- Multi-escola/multi-rede, permissões por papel.
- Integrações (Google Classroom, diário eletrônico, importação de alunos).
- Assistente por voz.

## 11. Riscos e pontos a monitorar

- **Não decidir Modelo A/B por suposição** (seção 4.1) — muda a arquitetura de dados.
- **Vínculoo é o concorrente que mais rápido poderia fechar a lacuna da seção 3.2** —
  16x de crescimento em 12 meses, "Apoio Inteligente" já existe em formato de chat.
  Reconfirmar na Fase 0 se o diferencial de "conselho ancorado em histórico" ainda está
  de pé, não assumir estático.
- **Percepção de "a IA tá me avaliando"** (seção 4.3, pergunta 7) pode matar adoção do
  conselho comportamental mesmo que a tecnologia funcione — validar tom/enquadramento
  antes de construir.
- Custo de geração de imagem por IA pode inviabilizar uso em escala — biblioteca
  reutilizável já está no plano da Fase 3, não como otimização tardia.
- Dado sensível (diagnóstico, laudo, PEI, e agora conselho comportamental registrado
  automaticamente) exige cuidado com LGPD desde o desenho do schema — tratar como
  requisito de Fase 1/2, não deixar para depois. Ver pergunta em aberto da seção 4.3
  sobre editar/apagar entradas de histórico.
- Geração de plano semanal com BNCC (seção 4.2) é mercado disputado — não vender como
  diferencial, só como redução de fricção.
