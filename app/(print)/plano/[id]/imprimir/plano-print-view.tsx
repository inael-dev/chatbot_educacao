"use client";

import { ArrowLeftIcon, PrinterIcon } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { AtividadeContent } from "@/lib/db/schema";
import styles from "./plano-print-view.module.css";

type PlanoPrintViewProps = {
  content: AtividadeContent;
  objective: string;
  turmaName: string;
  turmaGrade: string | null;
  schoolName: string | null;
  backHref: string;
};

export function PlanoPrintView({
  content,
  objective,
  turmaName,
  turmaGrade,
  schoolName,
  backHref,
}: PlanoPrintViewProps) {
  const handlePrint = useCallback(() => window.print(), []);

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-muted/40 px-4 py-10 print:bg-white print:py-0">
      <div className="flex w-full max-w-3xl items-center justify-between gap-3 print:hidden">
        <Button asChild size="sm" variant="ghost">
          <Link href={backHref}>
            <ArrowLeftIcon />
            Voltar pro plano
          </Link>
        </Button>
        <Button onClick={handlePrint} size="sm">
          <PrinterIcon />
          Imprimir / Salvar PDF
        </Button>
      </div>

      <div className={styles.pageShell}>
        <div className={styles.page}>
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
                <b>TURMA:</b>{" "}
                <span className={styles.fill}>
                  {turmaName}
                  {turmaGrade ? ` · ${turmaGrade}` : ""}
                </span>
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
          </div>

          <div className={styles.titleBand}>
            <div className={styles.eyebrow}>Plano da aula</div>
            <h1 className={styles.title}>{content.tema}</h1>
            <div className={styles.tags}>
              {content.habilidades.map((codigo) => (
                <span className={styles.tag} key={codigo}>
                  BNCC {codigo}
                </span>
              ))}
              {content.unidadeTematica.map((unidade) => (
                <span className={styles.tag} key={unidade}>
                  {unidade}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>Objetivo</p>
            <p className={styles.sectionText}>{objective}</p>
          </div>

          <div className={styles.metaRow}>
            {content.duracao ? (
              <div className={styles.metaCol}>
                <p className={styles.sectionLabel}>Duração</p>
                <p className={styles.sectionText}>{content.duracao}</p>
              </div>
            ) : null}
            {content.recursos.length > 0 ? (
              <div className={styles.metaCol}>
                <p className={styles.sectionLabel}>Recursos</p>
                <p className={styles.sectionText}>
                  {content.recursos.join(", ")}
                </p>
              </div>
            ) : null}
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>Momentos da aula</p>
            <div className={styles.momentos}>
              {content.momentos.map((momento) => (
                <div key={momento.titulo}>
                  <h2 className={styles.momentoTitle}>{momento.titulo}</h2>
                  <p className={styles.momentoText}>{momento.descricao}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>Avaliação</p>
            <p className={styles.sectionText}>{content.avaliacao}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
