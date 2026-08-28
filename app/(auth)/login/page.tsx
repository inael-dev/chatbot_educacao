"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { OrganicShell } from "@/components/organic/organic-shell";
import { formatCpf, sanitizeCpf } from "@/lib/cpf";
import { type LoginActionState, login } from "../actions";

export default function LoginPage() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [display, setDisplay] = useState("");
  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    { status: "idle" }
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: router and updateSession are stable refs
  useEffect(() => {
    if (state.status === "success") {
      updateSession();
      router.push("/");
      router.refresh();
    }
  }, [state.status]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = sanitizeCpf(event.target.value).slice(0, 11);
    setDisplay(formatCpf(digits));
  };

  return (
    <OrganicShell className="flex min-h-dvh flex-col items-center justify-center p-6">
      <div className="card elev-md" style={{ maxWidth: 360, padding: 24, width: "100%" }}>
        <div className="card-kicker">Entrar</div>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: 24,
            margin: "4px 0 6px",
          }}
        >
          Seu CPF
        </h1>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 18 }}>
          Só o CPF, sem senha. Se é a primeira vez, criamos sua conta agora.
          Se já usou antes, seus alunos e turmas voltam do jeito que estavam.
        </p>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="field">
            <label htmlFor="cpf">CPF</label>
            <input
              autoComplete="off"
              autoFocus
              className="input"
              id="cpf"
              inputMode="numeric"
              name="cpf"
              onChange={handleChange}
              placeholder="000.000.000-00"
              value={display}
            />
          </div>
          {state.status === "invalid_cpf" && (
            <p style={{ color: "var(--color-danger)", fontSize: 12 }}>
              Esse CPF não parece válido. Confira os números e tente de novo.
            </p>
          )}
          <button className="btn btn-primary btn-block" type="submit">
            Entrar
          </button>
        </form>
      </div>
    </OrganicShell>
  );
}
