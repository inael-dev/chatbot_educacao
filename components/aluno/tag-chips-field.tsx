"use client";

import { XIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Chip({
  tag,
  onRemove,
}: {
  tag: string;
  onRemove: (tag: string) => void;
}) {
  const handleClick = useCallback(() => onRemove(tag), [tag, onRemove]);

  return (
    <button
      className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 font-medium text-primary-foreground text-sm"
      onClick={handleClick}
      type="button"
    >
      {tag}
      <XIcon className="size-3.5" />
    </button>
  );
}

function SuggestionChip({
  suggestion,
  onAdd,
}: {
  suggestion: string;
  onAdd: (suggestion: string) => void;
}) {
  const handleClick = useCallback(() => onAdd(suggestion), [suggestion, onAdd]);

  return (
    <button
      className="rounded-full border border-input bg-input/30 px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
      onClick={handleClick}
      type="button"
    >
      + {suggestion}
    </button>
  );
}

export function TagChipsField({
  name,
  label,
  placeholder,
  suggestions,
}: {
  name: string;
  label: string;
  placeholder: string;
  suggestions: string[];
}) {
  const [tags, setTags] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const addTag = useCallback((raw: string) => {
    const value = raw.trim();
    if (!value) {
      return;
    }
    setTags((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setDraft("");
  }, []);

  const removeTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  }, []);

  const handleDraftChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDraft(event.target.value);
    },
    []
  );

  const handleDraftKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" || event.key === ",") {
        event.preventDefault();
        addTag(draft);
      }
    },
    [addTag, draft]
  );

  const availableSuggestions = suggestions.filter((s) => !tags.includes(s));

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <input name={name} type="hidden" value={tags.join(",")} />

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Chip key={tag} onRemove={removeTag} tag={tag} />
          ))}
        </div>
      )}

      <Input
        className="h-12 rounded-full px-5 text-base"
        id={name}
        onChange={handleDraftChange}
        onKeyDown={handleDraftKeyDown}
        placeholder={placeholder}
        value={draft}
      />

      {availableSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableSuggestions.map((suggestion) => (
            <SuggestionChip
              key={suggestion}
              onAdd={addTag}
              suggestion={suggestion}
            />
          ))}
        </div>
      )}
    </div>
  );
}
