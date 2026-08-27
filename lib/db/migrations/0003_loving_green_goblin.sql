ALTER TABLE "Atividade" ALTER COLUMN "content" SET DATA TYPE json USING "content"::json;--> statement-breakpoint
ALTER TABLE "AtividadeAdaptada" ALTER COLUMN "content" SET DATA TYPE json USING "content"::json;--> statement-breakpoint
ALTER TABLE "Atividade" ADD COLUMN "sourceFileUrl" text;