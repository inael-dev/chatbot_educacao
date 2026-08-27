CREATE TABLE "Student" (
	"birthDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"enrollmentNumber" varchar(64),
	"gender" varchar(32),
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"photoUrl" text,
	"preferredName" text,
	"status" varchar DEFAULT 'active' NOT NULL,
	"teacherId" uuid NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "StudentAiMemory" (
	"studentId" uuid PRIMARY KEY NOT NULL,
	"summary" text NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "StudentCondition" (
	"condition" varchar(128) NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" varchar(32),
	"observation" text,
	"studentId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "StudentGoal" (
	"bnccCode" varchar(32),
	"difficulty" varchar,
	"endDate" timestamp,
	"goal" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"startDate" timestamp,
	"status" varchar DEFAULT 'not_started' NOT NULL,
	"studentId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "StudentInterest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interest" varchar(128) NOT NULL,
	"studentId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "StudentLearningPreference" (
	"effectiveness" varchar NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"strategy" varchar(128) NOT NULL,
	"studentId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "StudentObservation" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"observation" text NOT NULL,
	"studentId" uuid NOT NULL,
	"teacherId" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "StudentProfile" (
	"attentionLevel" integer,
	"autonomyLevel" integer,
	"communicationLevel" integer,
	"generalNotes" text,
	"grade" varchar(32),
	"literacyLevel" integer,
	"mathLevel" integer,
	"motorCoordinationLevel" integer,
	"studentId" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "StudentSensitivity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"severity" varchar,
	"studentId" uuid NOT NULL,
	"type" varchar(128) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Student" ADD CONSTRAINT "Student_teacherId_User_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentAiMemory" ADD CONSTRAINT "StudentAiMemory_studentId_Student_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentCondition" ADD CONSTRAINT "StudentCondition_studentId_Student_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentGoal" ADD CONSTRAINT "StudentGoal_studentId_Student_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentInterest" ADD CONSTRAINT "StudentInterest_studentId_Student_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentLearningPreference" ADD CONSTRAINT "StudentLearningPreference_studentId_Student_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentObservation" ADD CONSTRAINT "StudentObservation_studentId_Student_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentObservation" ADD CONSTRAINT "StudentObservation_teacherId_User_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_studentId_Student_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "StudentSensitivity" ADD CONSTRAINT "StudentSensitivity_studentId_Student_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE no action ON UPDATE no action;
