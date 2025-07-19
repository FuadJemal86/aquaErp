import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

interface NotificationModalProps {
  open: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  onClose?: () => void;
}

function NotificationModal({
  open,
  type,
  title,
  message,
  onClose,
}: NotificationModalProps) {
  const isSuccess = type === "success";
  const Icon = isSuccess ? CheckCircle : XCircle;
  const iconColor = isSuccess ? "text-green-500" : "text-red-500";
  const bgColor = isSuccess
    ? "bg-green-50 dark:bg-green-900/20"
    : "bg-red-50 dark:bg-red-900/20";
  const borderColor = isSuccess
    ? "border-green-200 dark:border-green-800"
    : "border-red-200 dark:border-red-800";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-card text-card-foreground rounded-xl shadow-2xl max-w-md w-full mx-4 p-8 flex flex-col items-center border border-border dark:bg-card dark:text-card-foreground"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 200,
                delay: 0.2,
              }}
              className="mb-4"
            >
              <Icon className={`h-16 w-16 ${iconColor}`} />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-gray-800 dark:text-card-foreground mb-2 text-center"
            >
              {title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 dark:text-gray-300 text-center mb-6"
            >
              {message}
            </motion.p>

            {onClose && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={onClose}
                  className="min-w-[100px]"
                  variant={isSuccess ? "default" : "destructive"}
                >
                  {isSuccess ? "OK" : "Close"}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NotificationModal;
