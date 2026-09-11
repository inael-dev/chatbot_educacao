"use client";

import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Suspense, useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCpf, sanitizeCpf } from "@/lib/cpf";
import { type LoginActionState, login } from "../actions";

// `proxy.ts` anexa ?redirectUrl=<path> ao mandar um request não autenticado
// pro login. Só aceitamos caminho relativo de uma barra só: "//host" e
// "/\host" são lidos pelo browser como URL absoluta — viraria open redirect.
function safeRedirectTarget(raw: string | null): string {
  if (!raw) {
    return "/";
  }

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return "/";
  }

  const isRelative = decoded.startsWith("/") && !decoded.startsWith("//");

  if (!isRelative || decoded.startsWith("/\\") || decoded === "/login") {
    return "/";
  }

  return decoded;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-dvh bg-primary" />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update: updateSession } = useSession();
  const [display, setDisplay] = useState("");
  const [step, setStep] = useState<"cpf" | "intro">("intro");
  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    { status: "idle" }
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: router, searchParams and updateSession are stable refs
  useEffect(() => {
    if (state.status === "success") {
      updateSession();
      router.push(safeRedirectTarget(searchParams.get("redirectUrl")));
      router.refresh();
    }
  }, [state.status]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = sanitizeCpf(event.target.value).slice(0, 11);
    setDisplay(formatCpf(digits));
  };

  const handleStart = () => {
    setStep("cpf");
  };

  const isCpfStep = step === "cpf";

  const stageTransition = { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const };

  const footerVariants = {
    exit: { opacity: 0, transition: { duration: 0.2 } },
    initial: { opacity: 0 },
    show: { opacity: 1, transition: { delay: 0.75, duration: 0.4 } },
  };

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-primary">
      <motion.div
        animate={{ height: isCpfStep ? "45%" : "72%" }}
        className="relative flex shrink-0 flex-col items-center justify-center px-6 text-primary-foreground"
        transition={stageTransition}
      >
        <motion.div
          animate={{ opacity: 1 }}
          className="-top-24 -right-16 pointer-events-none absolute size-72 rounded-full bg-white/10 blur-3xl"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
        <motion.div
          animate={{ opacity: 1 }}
          className="-bottom-28 -left-20 pointer-events-none absolute size-80 rounded-full bg-white/10 blur-3xl"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />

        <AnimatePresence>
          {!isCpfStep && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-6 text-center"
              exit={{ opacity: 0, y: -12 }}
              initial={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-semibold text-sm">
                logo<b className="font-bold">marca</b>
              </p>
              <p className="mt-4 font-medium text-2xl leading-none tracking-tight">
                Ensino
              </p>
              <p className="font-extrabold text-4xl tracking-tight">
                Inteligente.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex items-center justify-center">
          {!isCpfStep && (
            <>
              <motion.div
                animate={{ opacity: 1 }}
                className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 size-72 rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-violet-200/25 blur-2xl"
                initial={{ opacity: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
              />
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: 0.45, duration: 0.35 }}
              >
                <SparklesIcon className="-top-3 -left-9 absolute size-6 text-white/70" />
              </motion.div>
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: 0.55, duration: 0.35 }}
              >
                <SparklesIcon className="-right-6 absolute top-8 size-4 text-white/50" />
              </motion.div>
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                initial={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: 0.65, duration: 0.35 }}
              >
                <SparklesIcon className="-bottom-1 absolute left-1 size-4 text-white/40" />
              </motion.div>
            </>
          )}
          <motion.div
            animate={{ opacity: 1, scale: isCpfStep ? 60 / 76 : 1, y: 0 }}
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            transition={
              isCpfStep
                ? stageTransition
                : { delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <Image
              alt="Mascote"
              className="-rotate-3 relative h-auto w-76"
              height={340}
              priority
              src="/images/mascots/mascote-login-semfundo.png"
              width={340}
            />
          </motion.div>
        </div>
      </motion.div>

      <div className="relative flex-1">
        <AnimatePresence>
          {isCpfStep ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 flex flex-col overflow-y-auto bg-background px-5 pt-8 pb-6"
              initial={{ opacity: 0, y: 24 }}
              key="cpf-panel"
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <p className="w-full font-semibold text-primary text-xs uppercase tracking-wider">
                Entrar
              </p>
              <h1 className="mt-1 mb-1.5 w-full font-semibold text-2xl text-foreground tracking-tight">
                Seu CPF
              </h1>
              <p className="mb-6 w-full text-muted-foreground text-sm">
                <span className="font-semibold text-foreground">
                  Só o CPF, sem senha.
                </span>
                <br />
                Se for a primeira vez, criamos sua conta na hora.
              </p>
              <form action={formAction} className="flex w-full flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    autoComplete="off"
                    autoFocus
                    className="h-16 rounded-full px-6 text-base"
                    id="cpf"
                    inputMode="numeric"
                    name="cpf"
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    value={display}
                  />
                </div>
                {state.status === "invalid_cpf" && (
                  <p className="text-destructive text-xs">
                    Esse CPF não parece válido. Confira os números e tente de
                    novo.
                  </p>
                )}
                <Button className="w-full" size="lg" type="submit">
                  Entrar
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              animate="show"
              className="absolute inset-0 flex flex-col items-center justify-end gap-6 px-6 pb-16 text-center text-primary-foreground"
              exit="exit"
              initial="initial"
              key="intro-footer"
              variants={footerVariants}
            >
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="text-base leading-snug"
                initial={{ opacity: 0, y: 12 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <span className="font-semibold">Cada aluno é único.</span>
                <br />A IA adapta o aprendizado ao seu ritmo.
              </motion.p>
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
                initial={{ opacity: 0, y: 12 }}
                transition={{ delay: 0.9, duration: 0.4 }}
              >
                <Button
                  className="w-full"
                  onClick={handleStart}
                  size="lg"
                  variant="secondary"
                >
                  Vamos começar
                  <ArrowRightIcon className="size-5" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
