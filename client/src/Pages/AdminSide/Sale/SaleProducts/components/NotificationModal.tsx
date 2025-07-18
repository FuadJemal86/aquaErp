import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface NotificationModalProps {
  open: boolean;
  type: "success" | "error" | "warning";
  title: string;
  message: string;
}

function NotificationModal({
  open,
  type,
  title,
  message,
}: NotificationModalProps) {
  if (!open) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case "error":
        return <XCircle className="h-8 w-8 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-8 w-8 text-yellow-500" />;
      default:
        return <CheckCircle className="h-8 w-8 text-green-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800 dark:text-green-200";
      case "error":
        return "text-red-800 dark:text-red-200";
      case "warning":
        return "text-yellow-800 dark:text-yellow-200";
      default:
        return "text-green-800 dark:text-green-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-card text-card-foreground rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 animate-fade-in border border-border dark:bg-card dark:text-card-foreground">
        <div className="flex flex-col items-center text-center gap-4">
          {getIcon()}
          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              {title}
            </h3>
            <p className={`text-sm ${getTextColor()}`}>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationModal;
