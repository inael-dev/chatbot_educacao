CREATE TABLE "PlanejamentoSemanal" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"objetivoGeral" text,
	"sourceChatId" uuid,
	"teacherId" uuid NOT NULL,
	"turmaId" uuid NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Atividade" ADD COLUMN "diaAplicacao" varchar(32);--> statement-breakpoint
ALTER TABLE "Atividade" ADD COLUMN "planejamentoSemanalId" uuid;--> statement-breakpoint
ALTER TABLE "PlanejamentoSemanal" ADD CONSTRAINT "PlanejamentoSemanal_sourceChatId_Chat_id_fk" FOREIGN KEY ("sourceChatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PlanejamentoSemanal" ADD CONSTRAINT "PlanejamentoSemanal_teacherId_User_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PlanejamentoSemanal" ADD CONSTRAINT "PlanejamentoSemanal_turmaId_Turma_id_fk" FOREIGN KEY ("turmaId") REFERENCES "public"."Turma"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_planejamentoSemanalId_PlanejamentoSemanal_id_fk" FOREIGN KEY ("planejamentoSemanalId") REFERENCES "public"."PlanejamentoSemanal"("id") ON DELETE no action ON UPDATE no action;