CREATE TABLE "Atividade" (
	"bnccCode" varchar(32),
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"objective" text NOT NULL,
	"sourceChatId" uuid,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"teacherId" uuid NOT NULL,
	"turmaId" uuid NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "AtividadeAdaptada" (
	"atividadeId" uuid NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"editedByTeacher" boolean DEFAULT false NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" varchar DEFAULT 'gerando' NOT NULL,
	"studentId" uuid NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Turma" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"grade" varchar(32),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"teacherId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "TurmaStudent" (
	"studentId" uuid NOT NULL,
	"turmaId" uuid NOT NULL,
	CONSTRAINT "TurmaStudent_turmaId_studentId_pk" PRIMARY KEY("turmaId","studentId")
);
--> statement-breakpoint
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_sourceChatId_Chat_id_fk" FOREIGN KEY ("sourceChatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_teacherId_User_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_turmaId_Turma_id_fk" FOREIGN KEY ("turmaId") REFERENCES "public"."Turma"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AtividadeAdaptada" ADD CONSTRAINT "AtividadeAdaptada_atividadeId_Atividade_id_fk" FOREIGN KEY ("atividadeId") REFERENCES "public"."Atividade"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "AtividadeAdaptada" ADD CONSTRAINT "AtividadeAdaptada_studentId_Student_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_teacherId_User_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TurmaStudent" ADD CONSTRAINT "TurmaStudent_studentId_Student_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "TurmaStudent" ADD CONSTRAINT "TurmaStudent_turmaId_Turma_id_fk" FOREIGN KEY ("turmaId") REFERENCES "public"."Turma"("id") ON DELETE no action ON UPDATE no action;