import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  nested?: boolean;
}

export default function ConfirmModal({ open, onClose, onConfirm, title, description, confirmLabel = 'Hapus', nested = false }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} nested={nested}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-xl bg-[var(--color-warn-soft)] px-3.5 py-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[var(--color-warn)]" />
          <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">{description}</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-[var(--color-surface-alt)] py-2.5 text-sm font-medium text-[var(--color-ink-soft)] transition hover:bg-[var(--color-border)]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 rounded-xl bg-[var(--color-warn)] py-2.5 text-sm font-semibold text-[var(--color-warn-contrast)] shadow-[var(--shadow-flat)] transition hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
