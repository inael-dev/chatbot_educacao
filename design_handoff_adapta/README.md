# Handoff: Adapta — plataforma de IA para adaptação inclusiva de atividades (mobile)

## Overview
Adapta é um app **mobile** para professores de Educação Infantil / Fundamental I que automatiza a **adaptação de atividades** para alunos atípicos (TEA, TDAH, deficiência intelectual e outras necessidades específicas), sem perder o objetivo pedagógico alinhado à BNCC.

Fluxo central ("turma primeiro"):
1. O professor descreve a atividade da turma **uma vez** (chat) **ou anexa** um plano pronto (foto/PDF).
2. A IA monta o **plano completo da turma** (tema, objetivo, recursos, momentos da aula, avaliação e **habilidade BNCC real — consultada, nunca inventada**).
3. O professor toca num aluno → abre a **construção do plano individual** (estilo PEI, a quatro mãos com a IA), refinando por conversa até aceitar.
4. Ao aceitar, gera a **atividade final** e o **PDF** imprimível; tudo fica salvo como rascunho validado em `/atividades`.

Diferencial de mercado: **colaboração professor regente ↔ professor de AEE** (mais do que "só gerar atividade adaptada").

## About the Design Files
Os arquivos deste pacote são **referências de design feitas em HTML** — protótipos que mostram a aparência e o comportamento pretendidos, **não** código de produção para copiar diretamente. A tarefa é **recriar esses designs no ambiente do codebase existente** (o usuário já tem um chatbot mais simples funcionando) usando seus padrões e bibliotecas — ou, se for começar do zero, escolher o framework mais adequado (ex.: React Native / Expo para mobile) e implementar lá.

O protótipo `Adapta.dc.html` é um arquivo de **Design Component** que abre no navegador. Ele contém vários "turnos" de exploração empilhados numa tela de canvas — cada opção é uma tela de celular (344px de largura). Use-o como referência visual; **as rotas e o comportamento estão documentados abaixo**.

## Fidelity
**High-fidelity (hifi).** Cores, tipografia, espaçamento, raios e ícones vêm do design system **Organic** (cream/terracota/sage, Caprasimo + Figtree, cantos bem arredondados). Recriar a UI com fidelidade, usando os tokens de `Design Tokens` abaixo. Os ícones são Lucide, stroke-width 2.75.

---

## Rotas (foco mobile)

| Rota | Tela | Propósito |
| --- | --- | --- |
| `/` ou `/turma` | **Início / Turma** | Home "turma primeiro": aula do dia no topo + lista de alunos com status. Tab bar. |
| `/nova-aula` | **Nova aula (chat)** | Ponto de partida: escolher **Descrever no chat** ou **Anexar plano pronto** (foto/PDF). Conversa que monta o plano. |
| `/plano/:aulaId` | **Plano completo da turma** | Plano da turma inteira (BNCC, objetivo, duração/recursos, momentos, avaliação). Botões: Exportar PDF, Adaptar por aluno. |
| `/plano/:aulaId/editar` | **Editar plano** | Campos editáveis; BNCC via **seletor da base oficial** (nunca texto livre). |
| `/plano/:aulaId/aluno/:alunoId` | **Construtor da adaptação (PEI)** | IA parte do perfil+histórico do aluno, propõe v1, professor refina por chat/chips até **Aceitar e gerar PDF**. |
| `/atividade/:id` | **Atividade pronta + PDF** | Folha final imprimível (nome, enunciado adaptado, apoio visual, espaço de resposta). Exportar PDF / salvar. |
| `/atividades` | **Revisão de rascunhos** | Lista de todas as versões geradas por aluno, com status (Rascunho / Validada / Pronto). |
| `/aluno/:alunoId` | **Perfil do aluno** | Dados, necessidades, **histórico recente** (timeline) e **dupla pedagógica (AEE)**. *(a projetar — ver Notas)* |

Tab bar (persistente): **Início · Atividades · Turma · Perfil**.

---

## Screens / Views

### 1. Início / Turma (`/turma`) — ref. opção `1b`
- **Purpose:** ponto de entrada; ver a aula do dia e a lista de alunos.
- **Layout:** header com data + nome da turma ("Turma 3º A") e avatar do professor à direita. Abaixo, card destacado "Aula de hoje" (fill terracota `--color-accent`, texto cream). Depois um cabeçalho "Alunos" com controle segmentado **Atípicos / Todos**, e a lista de alunos. Tab bar fixa no rodapé.
- **Card "Aula de hoje":** kicker "AULA DE HOJE" (uppercase, opacity .8), título Caprasimo ~21px, tags BNCC + disciplina (pílulas translúcidas cream sobre o accent), linha "5 alunos p/ adaptar" + botão pílula cream "Abrir no chat".
- **Linha de aluno (`.srow`):** avatar circular (44px, inicial em Caprasimo), nome (14.5px, weight 600), tag de necessidade (TEA/TDAH/DI — `tag-accent-2`), e à direita uma **pílula de status**:
  - `Pronto` → fundo `--color-accent-2-200`, texto `--color-accent-2-800`
  - `Rascunho` → fundo `--color-accent-200`, texto `--color-accent-800`
  - `Adaptar` → fundo `--color-neutral-200`, texto `--color-neutral-700`
- **Copy exata:** "Segunda, 11 ago", "Turma 3º A", "Aula de hoje", "Dezenas e unidades", "BNCC EF03MA02", "5 alunos p/ adaptar", "Abrir no chat".

### 2. Nova aula — chat (`/nova-aula`) — ref. opção `1a`
- **Purpose:** professor inicia a aula descrevendo ou anexando.
- **Layout:** header voltar + título "Nova aula" / subtítulo "3º A · Matemática". Fio de chat (bolhas). No topo do fio, mensagem da IA + **dois cartões de escolha lado a lado**:
  - **Descrever no chat** (ícone +): "Conte a atividade e a IA monta o plano." (superfície neutra)
  - **Anexar plano pronto** (ícone upload): "Foto ou PDF — a IA extrai e organiza." (fundo `--color-accent-100`, borda `--color-accent-300`)
- Abaixo, exemplo de **anexo enviado** (bolha do usuário): ícone de arquivo + "plano-aula-3A.pdf" + "anexado · 1 página".
- IA responde com um **card de plano resumido** (kicker "Plano da aula", título, tags BNCC, resumo, link "Ver plano completo →" que navega para `/plano/:id`).
- Depois: "Quer adaptar essa atividade pra algum aluno? Toque no nome." + **linha horizontal de avatares** (chips) → tocar navega para o construtor (`/plano/:id/aluno/:id`).
- **Barra de input:** ícone de anexo (clipe), campo pílula "Mensagem…", botão de enviar circular (accent).
- **Bolhas:** IA = `--color-accent-2-100` fundo / `--color-accent-2-900` texto, canto inferior-esquerdo 6px; usuário = `--color-accent` fundo / cream texto, canto inferior-direito 6px. max-width 80%, radius 20px, 13.5px/1.45.

### 3. Plano completo da turma (`/plano/:id`) — ref. opção `2a`
- **Purpose:** ler/validar o plano da **turma inteira** antes de adaptar.
- **Layout (scroll):** header voltar + "Plano da aula" + link "Editar" (ícone lápis). Título Caprasimo 24px + tags (BNCC, série, disciplina). Bloco **Habilidade BNCC** (card `--color-accent-2-100`, kicker + texto da habilidade real). Bloco **Objetivo** (label uppercase + parágrafo). Dois mini-cards lado a lado: **Duração** (50 min) e **Recursos** (Palitos). Bloco **Momentos da aula**: 3 linhas numeradas (avatar 26px accent) — Abertura / Desenvolvimento / Fechamento. Card **Avaliação**.
- **Rodapé fixo:** botão secundário quadrado (ícone download = Exportar PDF) + botão primário largo "Adaptar por aluno" (→ seleção de aluno / volta ao chat).
- **Copy exata:** habilidade "Comparar e ordenar números naturais de até quatro ordens; compor e decompor em dezenas e unidades." · objetivo "Que os alunos agrupem quantidades em dezenas e registrem as unidades restantes." · momentos "Abertura — roda de conversa: quantos dias tem a semana?", "Desenvolvimento — agrupar palitos em dezenas em duplas.", "Fechamento — cada dupla registra o total no quadro." · avaliação "Observar se o aluno forma grupos de 10 e nomeia a quantidade de dezenas."

### 4. Editar plano (`/plano/:id/editar`) — ref. opção `2b`
- **Purpose:** ajustar o plano da turma.
- **Layout:** header "Cancelar" / título "Editar plano" / "Salvar" (accent). Campos (`.field` + `.input`): Título (input), **Habilidade BNCC** (campo que abre **seletor** — mostra a tag EF03MA02 + chevron; nota "Selecionada da base oficial — não é digitada."), Objetivo (textarea), **Momentos da aula** (label com "+ Adicionar"; cada momento é uma linha pílula com **handle de arrastar** à esquerda e **X** de remover à direita), Avaliação (textarea).
- **Rodapé fixo:** Cancelar (secundário) + Salvar plano (primário).
- **Regra crítica:** BNCC **nunca** é texto livre — sempre selecionada de base oficial.

### 5. Construtor da adaptação — PEI (`/plano/:id/aluno/:alunoId`) — ref. opção `3a`
- **Purpose:** construir o plano individual do aluno a quatro mãos com a IA, até aceitar.
- **Layout:** **topo fixo** com voltar + avatar + "Plano do {Nome}" + subtítulo "Dezenas e unidades · EF03MA02" + pílula "Rascunho". Abaixo, faixa horizontal de tags do que a IA está considerando: necessidade (TEA), estratégia (PECS / apoio visual), histórico (engajou: dinossauros).
- **Fio central:** mensagem da IA explicando o raciocínio + **card de prévia viva** ("Prévia · versão do {Nome}", badge de versão v1, título temático, três blocos de apoio visual, enunciado). Mensagem do professor pedindo ajuste. **Chips de ação rápida:** "Trocar tema", "Menos texto", "+ apoio visual", "Mais fácil".
- **Rodapé:** barra de input ("Peça um ajuste…" + enviar) e, abaixo, botão primário largo **"Aceitar e gerar PDF"**.
- **Regras:** mantém a **mesma habilidade BNCC** da turma; só mudam as barreiras de acesso. A IA parte do perfil + histórico do aluno (ver State). Cada ajuste incrementa a versão (v1 → v2…).

### 6. Atividade pronta + PDF (`/atividade/:id`) — ref. opção `3b`
- **Purpose:** versão final imprimível; exportar PDF ou salvar.
- **Layout:** header voltar + "Atividade pronta" + tag "Validada" (check). A folha em si é um **card branco** (`#fff`, sombra md) com: cabeçalho (label "Nome" + nome do aluno, tag BNCC à direita, separado por linha tracejada), título temático, fileira de **3 blocos de apoio visual** (quadrados arredondados, ícones), enunciado (frase curta, "10 em 10" em bold), e **área tracejada "Espaço para a resposta"**.
- **Rodapé fixo:** botão secundário quadrado (salvar em Atividades) + botão primário "Exportar PDF".
- **Conteúdo do PDF (requisito do usuário):** Enunciado adaptado, Nome do aluno, Espaço para resposta do aluno, Imagens / apoio visual. Deve exportar em **A4 imprimível de verdade**.

### 7. Revisão de rascunhos (`/atividades`) *(a construir — descrição)*
- Lista das atividades geradas, agrupadas por aula/aluno, com status (Rascunho / Validada / Pronto), busca/filtro por turma. Cada item leva a `/atividade/:id`. Segue o padrão de `.srow` + pílulas de status já definido.

### 8. Perfil do aluno + histórico + AEE (`/aluno/:id`) *(parcial em `1c`; a finalizar)*
- **Header do perfil:** avatar grande (66px, `.washed`), nome Caprasimo 22px, tags (necessidade + idade).
- **Histórico recente (timeline):** card com entradas ponto+texto+data — ex.: "Reagiu muito bem à tarefa com tema de dinossauros. — 5 ago", "Dispersou em atividade com muito texto corrido. — 2 ago". Pontos coloridos por tipo (positivo `--color-accent-2-500`, barreira `--color-accent-400`).
- **Dupla pedagógica (AEE):** card `--color-accent-2-100`, kicker "Dupla pedagógica" + selo "AEE + Regente", bolha da prof. de AEE (avatar + mensagem), link "Responder →". Ex.: "Ele usa comunicação por imagens (PECS). Prefira enunciado curto e apoio visual. — Prof. Pâmela (AEE)".
- **Rodapé:** botão primário "Gerar atividade adaptada".
- **Origem do histórico (decisão de produto pendente, recomendada):** entradas nascem de **feedback pós-atividade** (após aplicar, o app pergunta "Reagiu bem / Neutro / Dispersou" + 1 linha opcional, já ligado ao tema), com **registro avulso** ("+ Registrar observação") e **nota AEE** como complementos. Considerar edição/remoção de entradas (LGPD — dado sensível de criança).

---

## Interactions & Behavior
- **Navegação:** chat → "Ver plano completo" abre `/plano/:id`. Tocar num avatar de aluno abre o construtor. "Aceitar e gerar PDF" → gera `/atividade/:id` e salva em `/atividades`.
- **Upload:** cartão "Anexar plano pronto" abre seletor de foto/PDF; após upload, IA extrai e preenche o plano (loading state no card do plano).
- **Refino do PEI:** chips de ação rápida e input de texto disparam nova geração; card de prévia atualiza com nova versão (transição suave; manter versões anteriores acessíveis).
- **Seletor BNCC:** modal/lista de busca sobre a base oficial; retorna código + descrição. Nunca aceitar entrada livre.
- **Estados de carregamento:** geração de plano e de adaptação mostram skeleton/placeholder no card correspondente.
- **Feedback pós-atividade:** ao marcar atividade como "aplicada", card curto de 3 opções + texto opcional → cria entrada de histórico.
- **Estados de foco/hover/press:** usar os do Organic (hover tint da rampa accent, pressed um passo além, `:focus-visible` outline 2px accent). Alvos de toque ≥ 44px.

## State Management
- `turma`: { id, nome, serie, alunos[] } — cada aluno { id, nome, inicial, corAvatar, necessidade (TEA/TDAH/DI…), idade, statusAtividade }.
- `aula`: { id, titulo, bnccCodigo, bnccDescricao, disciplina, serie, objetivo, duracao, recursos[], momentos[], avaliacao, origem: 'chat'|'anexo' }.
- `adaptacao` (por aluno): { id, aulaId, alunoId, versao, tema, enunciado, apoiosVisuais[], status: 'rascunho'|'validada'|'pronto', mensagens[] }.
- `historicoAluno[]`: { data, tipo: 'positivo'|'barreira'|'neutro', texto, origem: 'feedback'|'avulso'|'aee', temaRelacionado }.
- `notasAEE[]`: { autor, papel: 'AEE'|'regente', texto, data }.
- **Data fetching:** IA via API (ChatGPT/Claude) para: montar plano da turma, extrair de anexo, gerar/refinar adaptação. BNCC via **consulta a base oficial** (não gerada pelo modelo). A geração da adaptação **injeta no prompt** perfil + últimas N entradas de histórico + notas de AEE do aluno.

## Design Tokens (Organic — `_ds/organic-.../styles.css`)
Sempre usar as variáveis, não hex crus. Principais:
- **Cores:** `--color-bg` #f5ead8 · `--color-text` #201e1d · `--color-accent` #c67139 (terracota) · `--color-accent-2` #7a8a5e (sage). Rampas 100–900 para neutral / accent / accent-2 (fills tênues 100–300, base 500, texto/press 700–900). `--color-surface`, `--color-divider`.
- **Tipografia:** `--font-heading` = Caprasimo (displays/títulos) · `--font-body` = Figtree. Título de tela ~16px, título de conteúdo Caprasimo 21–24px, corpo 13–14px, meta 10–11px uppercase.
- **Raios:** `--radius-lg` (16px) para containers; `999px` para botões/inputs/pílulas.
- **Sombras:** `--shadow-sm/md/lg` (já ajustadas ao fundo cream).
- **Ícones:** Lucide, stroke-width **2.75**.
- **Componentes/classes:** `.btn` (`.btn-primary/-secondary/-ghost/-block`), `.tag` (`.tag-accent/-accent-2/-neutral/-outline`), `.card` (`.card-kicker`, `.elev-sm/md/lg`), `.field`+`.input`, `.seg`+`.seg-opt`, `.washed` (fotos). Carregar `_ds_bundle.js` + `styles.css`.

## Assets
- Nenhuma imagem final embutida — o protótipo usa **placeholders de apoio visual** (blocos com ícones Lucide). Em produção, os apoios visuais das atividades virão de um banco de imagens/pictogramas (ex.: ARASAAC) ou upload. Avatares são iniciais coloridas (sem foto).
- Fontes Caprasimo + Figtree carregadas via design system.

## Files
- `Adapta.dc.html` — protótipo de todas as telas (canvas com turnos empilhados; opções `1a`, `1b`, `1c`, `2a`, `2b`, `3a`, `3b`).
- `_ds/organic-fca2326c-a815-4468-a345-a30a652755f5/` — design system Organic (styles.css, _ds_bundle.js). Fonte dos tokens.

## Referência externa citada pelo usuário
Produto Educacional (CAPES) sobre PEI/adaptação — usar como base pedagógica para a estrutura do plano individual:
`https://educapes.capes.gov.br/bitstream/capes/570204/2/Produto%20Educacional.pdf`
