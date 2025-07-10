import React from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationModalProps {
  open: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  onClose?: () => void;
  showLoading?: boolean;
  loadingText?: string;
}

function NotificationModal({
  open,
  type,
  title,
  message,
  onClose,
  showLoading = false,
  loadingText = "Processing...",
}: NotificationModalProps) {
  if (!open) return null;

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm" />
      <div className="relative bg-card text-card-foreground rounded-xl shadow-2xl max-w-md w-full mx-4 p-8 flex flex-col items-center animate-fade-in border border-border dark:bg-card dark:text-card-foreground">
        <Icon className={`h-16 w-16 ${iconColor} mb-4`} />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-card-foreground mb-2 text-center">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          {message}
        </p>

        {showLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{loadingText}</span>
          </div>
        )}

        {onClose && (
          <Button
            onClick={onClose}
            className="min-w-[100px]"
            variant={isSuccess ? "default" : "destructive"}
          >
            {isSuccess ? "OK" : "Close"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default NotificationModal;
