"use client";

import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";

export function NoStudentsYet() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6 py-12 text-center">
      <SignOutButton className="absolute top-4 right-4" />

      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute size-64 rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-violet-100" />
        <SparklesIcon className="-top-2 -left-8 absolute size-5 text-violet-300" />
        <SparklesIcon className="-right-6 absolute top-6 size-4 text-primary/30" />
        <Image
          alt="Mascote"
          className="relative h-auto w-56"
          height={478}
          priority
          src="/images/mascots/mascote-cadastro-aluno.png"
          width={521}
        />
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 12 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <h1 className="mt-8 font-semibold text-3xl text-foreground leading-tight tracking-tight">
          Nenhum aluno
          <br />
          cadastrado ainda
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-muted-foreground text-sm">
          Antes de criar uma aula, cadastre seus alunos. A IA usa o perfil de
          cada aluno para adaptar o aprendizado.
        </p>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 flex w-full max-w-xs flex-col items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Button asChild className="w-full" size="lg">
          <Link href="/aluno/novo">
            Cadastrar aluno
            <ArrowRightIcon className="size-5" />
          </Link>
        </Button>
        <p className="text-muted-foreground text-xs">
          Você pode adicionar mais alunos depois
        </p>
      </motion.div>
    </div>
  );
}
