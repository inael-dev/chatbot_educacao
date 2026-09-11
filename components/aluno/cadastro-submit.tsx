"use client";

import { ArrowRightIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

// O cadastro grava aluno + condições + interesses + vínculo com a turma e só
// então redireciona — tempo suficiente pro professor achar que travou. As
// mensagens giram pra deixar claro que algo continua acontecendo.
const STEPS = [
  "Salvando o perfil…",
  "Validando as informações…",
  "Preparando a turma…",
];

const STEP_INTERVAL_MS = 1600;

function CadastroOverlay() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    }, STEP_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/95 px-6 text-center backdrop-blur-sm"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.06, 1] }}
          className="absolute size-44 rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-violet-100"
          transition={{
            duration: 2.4,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.8,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <SparklesIcon className="-top-1 -left-8 absolute size-5 text-violet-300" />
        </motion.div>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            delay: 0.6,
            duration: 1.8,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <SparklesIcon className="-right-6 absolute top-5 size-4 text-primary/40" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 2.4,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <Image
            alt=""
            className="relative h-auto w-36"
            height={478}
            src="/images/mascots/mascote-cadastro-aluno.png"
            width={521}
          />
        </motion.div>
      </div>

      <div aria-live="polite" className="flex items-center gap-2">
        <Loader2Icon className="size-4 animate-spin text-primary" />
        <AnimatePresence mode="wait">
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className="font-medium text-foreground text-sm"
            exit={{ opacity: 0, y: -6 }}
            initial={{ opacity: 0, y: 6 }}
            key={STEPS[step]}
            transition={{ duration: 0.25 }}
          >
            {STEPS[step]}
          </motion.span>
        </AnimatePresence>
      </div>

      <p className="max-w-xs text-muted-foreground text-xs">
        Isso leva alguns segundos. Não feche a tela.
      </p>
    </motion.div>
  );
}

export function CadastroSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <>
      <Button
        className="mt-2 w-full"
        disabled={pending}
        size="lg"
        type="submit"
      >
        {pending ? (
          <>
            <Loader2Icon className="size-5 animate-spin" />
            Salvando…
          </>
        ) : (
          <>
            {label}
            <ArrowRightIcon className="size-5" />
          </>
        )}
      </Button>

      <AnimatePresence>{pending ? <CadastroOverlay /> : null}</AnimatePresence>
    </>
  );
}
