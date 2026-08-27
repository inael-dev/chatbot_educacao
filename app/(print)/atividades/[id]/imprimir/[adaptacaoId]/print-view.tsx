"use client";

import {
  ArrowLeftIcon,
  ImageIcon,
  MessageSquareIcon,
  PrinterIcon,
  PuzzleIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AtividadeContent } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import styles from "./print-view.module.css";

const APOIO_VISUAL_ICONS = [
  { Icon: ImageIcon, name: "imagem" },
  { Icon: PuzzleIcon, name: "quebra-cabeca" },
  { Icon: MessageSquareIcon, name: "fala" },
];

type PrintViewProps = {
  content: AtividadeContent;
  turmaName: string;
  schoolName: string | null;
  studentName: string;
  habilidade: string | null;
  backHref: string;
};

export function PrintView({
  content,
  turmaName,
  schoolName,
  studentName,
  habilidade,
  backHref,
}: PrintViewProps) {
  const [bw, setBw] = useState(false);

  const handleColorido = useCallback(() => setBw(false), []);
  const handlePretoEBranco = useCallback(() => setBw(true), []);
  const handlePrint = useCallback(() => window.print(), []);

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-muted/40 px-4 py-10 print:bg-white print:py-0">
      <div className="flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild size="sm" variant="ghost">
          <Link href={backHref}>
            <ArrowLeftIcon />
            Voltar pra revisão
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-border">
            <button
              className={cn(
                "px-3 py-1.5 font-medium text-xs",
                bw
                  ? "bg-background text-muted-foreground"
                  : "bg-primary text-primary-foreground"
              )}
              onClick={handleColorido}
              type="button"
            >
              Colorido
            </button>
            <button
              className={cn(
                "border-border border-l px-3 py-1.5 font-medium text-xs",
                bw
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground"
              )}
              onClick={handlePretoEBranco}
              type="button"
            >
              Preto e branco
            </button>
          </div>
          <Button onClick={handlePrint} size="sm">
            <PrinterIcon />
            Imprimir / Salvar PDF
          </Button>
        </div>
      </div>

      <div className={cn(styles.pageShell, bw && styles.bw)}>
        <div className={styles.page}>
          <div className={styles.frame} />
          <div className={cn(styles.tickEdge, styles.tickEdgeTop)} />
          <div className={cn(styles.tickEdge, styles.tickEdgeBottom)} />
          <div className={cn(styles.tickEdge, styles.tickEdgeLeft)} />
          <div className={cn(styles.tickEdge, styles.tickEdgeRight)} />

          <div className={styles.pageInner}>
            <div className={styles.headerBox}>
              <div className={styles.headerRow}>
                <div className={styles.field}>
                  <b>ESCOLA:</b>{" "}
                  {schoolName ? (
                    <span className={styles.fill}>{schoolName}</span>
                  ) : (
                    <span className={styles.blank} />
                  )}
                </div>
                <div className={styles.field}>
                  <b>TURMA:</b> <span className={styles.fill}>{turmaName}</span>
                </div>
              </div>
              <div className={styles.headerRow}>
                <div className={styles.field}>
                  <b>PROFESSOR(A):</b> <span className={styles.blank} />
                </div>
                <div className={styles.field}>
                  <b>DATA:</b> ___ / ___ / ______
                </div>
              </div>
              <div className={styles.headerRow}>
                <div className={styles.field}>
                  <b>ALUNO:</b>{" "}
                  <span className={styles.fill}>{studentName}</span>
                </div>
                {habilidade ? (
                  <div className={styles.field}>
                    <b>BNCC:</b>{" "}
                    <span className={styles.fill}>{habilidade}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className={styles.titleBand}>
              <div className={styles.eyebrow}>Atividade</div>
              <h1 className={styles.title}>{content.tema}</h1>
              <div className={styles.rhythm}>
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className={styles.apoioVisual}>
              {APOIO_VISUAL_ICONS.map(({ Icon, name }) => (
                <div className={styles.apoioVisualBlock} key={name}>
                  <Icon size={20} strokeWidth={2} />
                </div>
              ))}
            </div>

            <div className={styles.momentos}>
              {content.momentos.map((momento) => (
                <div key={momento.titulo}>
                  <h2 className={styles.momentoTitle}>{momento.titulo}</h2>
                  <p className={styles.momentoText}>{momento.descricao}</p>
                </div>
              ))}
            </div>

            <div className={styles.responseBlock}>
              <p className={styles.responseLabel}>Sua resposta</p>
              <div className={styles.responseLine} />
              <div className={styles.responseLine} />
              <div className={styles.responseLine} />
            </div>

            <div className={styles.footerRhythm}>
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
