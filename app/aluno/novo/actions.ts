"use server";

import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { createStudentWithDetails } from "@/lib/db/queries";

function splitList(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export async function cadastrarAlunoAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return;
  }

  const preferredName = String(formData.get("preferredName") ?? "").trim();
  const conditions = splitList(String(formData.get("conditions") ?? ""));
  const interests = splitList(String(formData.get("interests") ?? ""));

  await createStudentWithDetails({
    conditions,
    interests,
    name,
    preferredName: preferredName || undefined,
    teacherId: session.user.id,
  });

  redirect("/");
}
