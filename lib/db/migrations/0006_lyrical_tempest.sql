CREATE TABLE "StudentAeeNote" (
	"autor" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"papel" varchar NOT NULL,
	"studentId" uuid NOT NULL,
	"texto" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "StudentObservation" ADD COLUMN "atividadeId" uuid;--> statement-breakpoint
ALTER TABLE "StudentObservation" ADD COLUMN "origem" varchar DEFAULT 'avulso' NOT NULL;--> statement-breakpoint
ALTER TABLE "StudentObservation" ADD COLUMN "tipo" varchar DEFAULT 'neutro' NOT NULL;--> statement-breakpoint
ALTER TABLE "StudentAeeNote" ADD CONSTRAINT "StudentAeeNote_studentId_Student_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentObservation" ADD CONSTRAINT "StudentObservation_atividadeId_Atividade_id_fk" FOREIGN KEY ("atividadeId") REFERENCES "public"."Atividade"("id") ON DELETE no action ON UPDATE no action;