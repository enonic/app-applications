export type ManagedModeBannerProps = {
  title: string;
  /** What the operator can do about it, beside the title. */
  help?: string;
};

/**
 * A strip stating that the section is managed elsewhere, in place of the action row. The copy is the
 * section's, since only it knows what is managed.
 */
export function ManagedModeBanner({ title, help }: ManagedModeBannerProps) {
  return (
    <div className="bg-muted border-bdr-soft flex h-11 shrink-0 items-center justify-center gap-2 border-b px-5 text-sm">
      <span className="shrink-0 font-semibold">{title}</span>
      {help !== undefined && <span className="text-subtle truncate">{help}</span>}
    </div>
  );
}
