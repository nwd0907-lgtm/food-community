import type { ReactNode } from "react";
import { Text } from "../../components/typography/Text";

type FoundationHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
};

export function FoundationHeader({ eyebrow, title, description, aside }: FoundationHeaderProps) {
  return (
    <header className="flex items-end justify-between gap-[var(--spacing-24)] border-b border-[var(--color-border-default)] pb-[var(--spacing-24)]">
      <div className="flex max-w-[900px] flex-col gap-[var(--spacing-8)]">
        <Text variant="label-md" className="font-semibold tracking-[0.1em] text-[var(--color-text-brand)]">
          {eyebrow}
        </Text>
        <Text variant="display-md">{title}</Text>
        <Text variant="body-md" className="text-[var(--color-text-subtle)]">
          {description}
        </Text>
      </div>
      {aside}
    </header>
  );
}
