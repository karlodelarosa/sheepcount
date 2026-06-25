"use client";

import { cn } from "@/lib/utils";

const BULLET_PREFIX = /^[-•*]\s*/;

function parseLines(content: string) {
  const lines = content.split("\n").filter(line => line.trim());
  const bullets: string[] = [];
  const paragraphs: string[] = [];

  for (const line of lines) {
    if (BULLET_PREFIX.test(line.trim())) {
      bullets.push(line.trim().replace(BULLET_PREFIX, ""));
    } else {
      paragraphs.push(line);
    }
  }

  return { bullets, paragraphs };
}

export function BulletText({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  if (!content.trim()) return null;

  const { bullets, paragraphs } = parseLines(content);

  if (bullets.length === 0 && paragraphs.length === 0) {
    return (
      <p
        className={cn(
          "text-muted-foreground whitespace-pre-wrap leading-relaxed",
          className,
        )}
      >
        {content}
      </p>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {paragraphs.map((paragraph, index) => (
        <p
          key={`p-${index}`}
          className="text-muted-foreground leading-relaxed"
        >
          {paragraph}
        </p>
      ))}
      {bullets.length > 0 && (
        <ul className="space-y-1.5">
          {bullets.map((bullet, index) => (
            <li
              key={`b-${index}`}
              className="flex items-start gap-2 text-muted-foreground leading-relaxed"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
