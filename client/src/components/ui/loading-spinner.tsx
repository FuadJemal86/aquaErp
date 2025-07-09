import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function LoadingSpinner({
  className,
  size = "md",
  showText = true,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-50",
        className
      )}
    >
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900/20",
            sizeClasses[size]
          )}
        />

        {/* Spinning gradient ring */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full border-4 border-transparent",
            "border-t-purple-600 dark:border-t-purple-400",
            "border-r-indigo-600 dark:border-r-indigo-400",
            "border-b-purple-500 dark:border-b-purple-300",
            "border-l-indigo-500 dark:border-l-indigo-300",
            sizeClasses[size]
          )}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Inner spinning gradient ring (opposite direction) */}
        <motion.div
          className={cn(
            "absolute inset-2 rounded-full border-4 border-transparent",
            "border-t-purple-400 dark:border-t-purple-600",
            "border-r-indigo-400 dark:border-r-indigo-600",
            "border-b-purple-300 dark:border-b-purple-500",
            "border-l-indigo-300 dark:border-l-indigo-500",
            sizeClasses[size]
          )}
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Center pulsing dot */}
        <motion.div
          className={cn(
            "absolute rounded-full bg-gradient-to-br from-purple-600 to-indigo-600",
            size === "sm" ? "inset-5" : size === "md" ? "inset-7" : "inset-9"
          )}
          animate={{
            scale: [0.8, 1, 0.8],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Placeholder to maintain size */}
        <div className={sizeClasses[size]} />
      </div>

      {showText && (
        <motion.div
          className={cn(
            "mt-6 font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent",
            textSizeClasses[size]
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          Loading Dvora...
        </motion.div>
      )}
    </div>
  );
}
