import { AlertTriangle, X } from "lucide-react";
import { motion } from "framer-motion";

export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-start gap-3 rounded-xl border border-error/20 bg-error/10 p-4 text-error-light backdrop-blur-sm"
      role="alert"
    >
      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-error/20">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
      </div>
      <p className="flex-1 text-sm font-medium leading-6">{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-1.5 text-error-light outline-none transition hover:bg-error/20 focus-visible:ring-2 focus-visible:ring-error/40"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </motion.div>
  );
}
