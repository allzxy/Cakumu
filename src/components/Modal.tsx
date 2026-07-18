import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  open,
  onClose,
  title,
  children,
  nested = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Set true for modals opened from within another modal (e.g. select pickers) so they stack on top. */
  nested?: boolean;
}) {
  if (!open) return null;
  return (
    <div className={`animate-fade fixed inset-0 flex items-end justify-center sm:items-center sm:p-4 ${nested ? 'z-[70]' : 'z-[60]'}`}>
      <div className="absolute inset-0 bg-[#1e241f]/45" onClick={onClose} />
      <div className="animate-rise relative flex max-h-[88vh] w-full flex-col rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-flat)] sm:max-h-[85vh] sm:max-w-md sm:rounded-2xl sm:p-6">
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-[var(--color-border)] sm:hidden" />
        <div className="mb-4 flex shrink-0 items-center justify-between sm:mb-5">
          <h3 className="font-bold tracking-tight text-lg text-[var(--color-ink)] sm:text-xl">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-muted)] transition hover:bg-[var(--color-surface-alt)]"
          >
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pb-1">{children}</div>
      </div>
    </div>
  );
}
