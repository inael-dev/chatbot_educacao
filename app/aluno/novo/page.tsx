import { ArrowLeftIcon, SparklesIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/app/(auth)/auth";
import { CadastroSubmit } from "@/components/aluno/cadastro-submit";
import { TagChipsField } from "@/components/aluno/tag-chips-field";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStudentsByTeacherId } from "@/lib/db/queries";
import { cadastrarAlunoAction } from "./actions";

const CONDITION_SUGGESTIONS = ["TEA", "TDAH", "Dislexia", "TOD"];
const INTEREST_SUGGESTIONS = [
  "Dinossauros",
  "Futebol",
  "Música",
  "Minecraft",
  "Desenhos",
  "Animais",
];

export default function CadastrarAlunoPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-background" />}>
      <CadastrarAlunoPageContent />
    </Suspense>
  );
}

async function CadastrarAlunoPageContent() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const students = await getStudentsByTeacherId({ teacherId: session.user.id });
  const isFirstStudent = students.length === 0;

  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <div className="flex items-center justify-between px-4 pt-4">
        {isFirstStudent ? (
          <span />
        ) : (
          <Button asChild size="icon" variant="ghost">
            <Link href="/">
              <ArrowLeftIcon className="size-5" />
            </Link>
          </Button>
        )}
        <SignOutButton />
      </div>

      <div className="flex flex-col items-center px-6 pt-2 pb-4 text-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute size-36 rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-violet-100" />
          <SparklesIcon className="-top-2 -left-6 absolute size-4 text-violet-300" />
          <SparklesIcon className="-right-4 absolute top-4 size-3.5 text-primary/30" />
          <Image
            alt="Mascote"
            className="relative h-auto w-28"
            height={478}
            priority
            src="/images/mascots/mascote-cadastro-aluno.png"
            width={521}
          />
        </div>

        <h1 className="mt-4 font-semibold text-2xl text-foreground leading-tight tracking-tight">
          {isFirstStudent
            ? "Vamos conhecer seu primeiro aluno!"
            : "Vamos conhecer esse aluno!"}
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-muted-foreground text-sm">
          Quanto mais você contar, melhor a IA consegue adaptar as aulas.
        </p>
      </div>

      <form
        action={cadastrarAlunoAction}
        className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-5 px-6 pb-10"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Como ele se chama?</Label>
          <Input
            autoFocus
            className="h-14 rounded-full px-5 text-base"
            id="name"
            name="name"
            placeholder="Nome do aluno"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="preferredName">
            Como prefere ser chamado?{" "}
            <span className="font-normal text-muted-foreground">
              (opcional)
            </span>
          </Label>
          <Input
            className="h-14 rounded-full px-5 text-base"
            id="preferredName"
            name="preferredName"
            placeholder="Ex.: Zeca"
          />
        </div>

        <TagChipsField
          label="Existe algo que devemos considerar? (opcional)"
          name="conditions"
          placeholder="Digite e pressione Enter"
          suggestions={CONDITION_SUGGESTIONS}
        />

        <TagChipsField
          label="O que ele gosta? (opcional)"
          name="interests"
          placeholder="Digite e pressione Enter"
          suggestions={INTEREST_SUGGESTIONS}
        />

        <CadastroSubmit label={isFirstStudent ? "Continuar" : "Criar aluno"} />
      </form>
    </div>
  );
}
