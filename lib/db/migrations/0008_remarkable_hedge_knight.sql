ALTER TABLE "Chat" ADD COLUMN "studentId" uuid;--> statement-breakpoint
ALTER TABLE "StudentObservation" ADD COLUMN "chatId" uuid;--> statement-breakpoint
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_studentId_Student_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentObservation" ADD CONSTRAINT "StudentObservation_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;