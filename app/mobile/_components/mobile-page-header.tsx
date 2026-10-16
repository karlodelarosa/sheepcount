interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
}

export function MobilePageHeader({ title, subtitle }: MobilePageHeaderProps) {
  return (
    <header className="px-5 pb-5 pt-3">
      <h1 className="text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em]">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1.5 text-[15px] leading-5 text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
