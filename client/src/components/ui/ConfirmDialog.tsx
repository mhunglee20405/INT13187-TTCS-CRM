interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: "danger" | "primary";
  loading?: boolean;
}

import Modal from "./Modal";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  confirmVariant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-300 text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary btn-sm" disabled={loading}>
          Hủy
        </button>
        <button
          onClick={onConfirm}
          className={`${confirmVariant === "danger" ? "btn-danger" : "btn-primary"} btn-sm`}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : confirmText}
        </button>
      </div>
    </Modal>
  );
}
