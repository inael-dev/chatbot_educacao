import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { organicBody, organicHeading } from "@/styles/organic/fonts";
import "@/styles/organic/theme.css";

/**
 * Wraps its children in the Organic design system: component shapes from the
 * Adapta mobile design handoff, colors/radii/type from the "JobFinder" color
 * tokens (see styles/organic/theme.css header). Scoped to this subtree only —
 * the rest of the app keeps the shadcn/neutral theme in app/globals.css until
 * screens are migrated to Organic one by one.
 */
export function OrganicShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "organic-theme",
        organicHeading.variable,
        organicBody.variable,
        className
      )}
    >
      {children}
    </div>
  );
}
