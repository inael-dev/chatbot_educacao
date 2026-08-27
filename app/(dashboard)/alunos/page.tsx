import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { getStudentsByTeacherId } from "@/lib/db/queries";
import { cn, getAvatarColor, getInitials } from "@/lib/utils";
import { auth } from "../../(auth)/auth";

export default function AlunosPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl p-6 text-muted-foreground text-sm">
          Carregando…
        </div>
      }
    >
      <AlunosContent />
    </Suspense>
  );
}

async function AlunosContent() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const students = await getStudentsByTeacherId({
    teacherId: session.user.id,
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="font-semibold text-xl">Alunos</h1>
        <p className="text-muted-foreground text-sm">
          {students.length} aluno{students.length === 1 ? "" : "s"} associado
          {students.length === 1 ? "" : "s"} a você.
        </p>
      </div>

      {students.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum aluno cadastrado ainda.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {students.map((student) => (
            <div
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
              key={student.id}
            >
              {student.photoUrl ? (
                // biome-ignore lint/performance/noImgElement: avatar URL is arbitrary/external, not worth next/image remote-pattern config yet
                <img
                  alt={student.name}
                  className="size-11 shrink-0 rounded-full object-cover"
                  src={student.photoUrl}
                />
              ) : (
                <div
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full font-medium text-sm",
                    getAvatarColor(student.name)
                  )}
                >
                  {getInitials(student.name)}
                </div>
              )}

              <div className="flex min-w-0 flex-col gap-1.5 pt-0.5">
                <span className="truncate font-medium text-sm">
                  {student.preferredName || student.name}
                </span>

                {student.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {student.conditions.map((condition) => (
                      <Badge key={condition.id} variant="secondary">
                        {condition.condition}
                      </Badge>
                    ))}
                  </div>
                )}

                {student.interests.length > 0 && (
                  <p className="truncate text-muted-foreground text-xs">
                    {student.interests.map((i) => i.interest).join(", ")}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
