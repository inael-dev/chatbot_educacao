"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { ClockIcon, SparklesIcon, UserIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { type ChangeEvent, useCallback, useRef } from "react";
import useSWR from "swr";
import type { Chat } from "@/lib/db/schema";
import { fetcher } from "@/lib/utils";

type GreetingProps = {
  onStartTurma: () => void;
  onUploadPlano: (file: File) => void;
};

export const Greeting = ({ onStartTurma, onUploadPlano }: GreetingProps) => {
  const { data } = useSWR<{ chats: Chat[] }>(
    `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/history?limit=5`,
    fetcher,
    { revalidateOnFocus: false }
  );
  const recentChats = data?.chats ?? [];

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        onUploadPlano(file);
      }
      event.target.value = "";
    },
    [onUploadPlano]
  );

  return (
    <div
      className="flex w-full max-w-xl flex-col items-center gap-6 px-4"
      key="overview"
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center font-semibold text-2xl tracking-tight text-foreground md:text-3xl"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        Como posso ajudar hoje?
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full flex-col gap-3"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col items-start gap-2 rounded-2xl bg-primary p-5 text-primary-foreground">
          <button
            className="flex w-full flex-col items-start gap-2 text-left transition-opacity hover:opacity-90"
            onClick={onStartTurma}
            type="button"
          >
            <UsersIcon className="size-5" />
            <span className="font-medium text-base">Planejar para a turma</span>
            <span className="text-primary-foreground/80 text-sm">
              Descreva a atividade uma vez e a IA gera as adaptações para cada
              aluno.
            </span>
          </button>

          <button
            className="text-primary-foreground/70 text-xs underline underline-offset-2 hover:text-primary-foreground"
            onClick={handleUploadClick}
            type="button"
          >
            ou envie uma foto/print de um plano existente
          </button>
          <input
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleFileSelect}
            ref={fileInputRef}
            type="file"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link
            className="flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
            href="/alunos"
          >
            <UserIcon className="size-5 text-muted-foreground" />
            <span className="font-medium text-sm">Planejamento individual</span>
          </Link>

          <div
            aria-disabled="true"
            className="flex flex-col items-start gap-2 rounded-2xl border border-border border-dashed bg-card/50 p-4 text-left text-muted-foreground"
          >
            <SparklesIcon className="size-5" />
            <span className="font-medium text-sm">Em breve</span>
          </div>
        </div>
      </motion.div>

      {recentChats.length > 0 && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full flex-col gap-2"
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
            <ClockIcon className="size-3.5" />
            <span>Últimas conversas</span>
          </div>
          <div className="flex flex-col gap-1">
            {recentChats.map((chat) => (
              <Link
                className="flex items-baseline justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                href={`/chat/${chat.id}`}
                key={chat.id}
              >
                <span className="truncate">{chat.title}</span>
                <span className="shrink-0 text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(chat.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
