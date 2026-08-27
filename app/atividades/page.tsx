import { redirect } from "next/navigation";
import { AtividadesList } from "@/components/organic/atividades/atividades-list";
import { OrganicShell } from "@/components/organic/organic-shell";
import { getAtividadesWithAdaptacoesByTeacherId } from "@/lib/db/queries";
import { auth } from "../(auth)/auth";

export default async function AtividadesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const grupos = await getAtividadesWithAdaptacoesByTeacherId({
    teacherId: session.user.id,
  });

  return (
    <OrganicShell className="flex min-h-dvh flex-col">
      <AtividadesList grupos={grupos} />
    </OrganicShell>
  );
}
