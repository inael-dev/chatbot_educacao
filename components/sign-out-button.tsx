"use client";

import { LogOutIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Sair da conta e voltar pro login. Sem isso não dá pra percorrer o fluxo
 * inicial (login → cadastro de aluno → primeira aula) mais de uma vez, já que
 * o `proxy` manda todo mundo autenticado direto pra home.
 */
export function SignOutButton({ className }: { className?: string }) {
  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <Button
      className={cn("text-muted-foreground", className)}
      onClick={handleSignOut}
      size="sm"
      type="button"
      variant="ghost"
    >
      <LogOutIcon className="size-4" />
      Sair
    </Button>
  );
}
