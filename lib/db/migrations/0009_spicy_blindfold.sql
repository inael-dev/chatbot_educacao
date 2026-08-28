ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "cpf" varchar(11);--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_cpf_unique" UNIQUE("cpf");