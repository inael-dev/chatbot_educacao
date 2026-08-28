"use server";

import { isValidCpf, sanitizeCpf } from "@/lib/cpf";
import { signIn } from "./auth";

export type LoginActionState = {
  status: "idle" | "in_progress" | "success" | "invalid_cpf";
};

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  const cpf = sanitizeCpf(String(formData.get("cpf") ?? ""));

  if (!isValidCpf(cpf)) {
    return { status: "invalid_cpf" };
  }

  await signIn("cpf", { cpf, redirect: false });

  return { status: "success" };
};
