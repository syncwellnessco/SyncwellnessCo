import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Yes, delete",
  cancelText = "Cancel",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-md w-full max-w-sm shadow-2xl relative overflow-hidden border border-[#EBE3DB]"
        >
          <div className="p-6">
            <h3 className="font-display text-2xl font-semibold text-charcoal mb-2">{title}</h3>
            <p className="text-charcoal/60 text-sm mb-6 leading-relaxed">{message}</p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-none border-[#EBE3DB] text-charcoal/80 text-xs font-semibold tracking-wider uppercase h-10 px-5"
              >
                {cancelText}
              </Button>
              <Button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`rounded-none text-xs font-semibold tracking-wider uppercase h-10 px-5 text-white ${
                  confirmText.toLowerCase().includes("delete") 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-[#8C6D40] hover:bg-[#B8955F]"
                }`}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
