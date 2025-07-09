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
        "fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/90 to-cyan-50/90 dark:from-gray-950/90 dark:to-blue-950/90 backdrop-blur-sm z-50",
        className
      )}
    >
      {/* Main Water Container */}
      <div className="relative flex items-center justify-center">
        {/* Multiple Ripple Effects */}
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={cn(
              "absolute rounded-full border-2 border-blue-400/30 dark:border-blue-300/20",
              sizeClasses[size]
            )}
            animate={{
              scale: [0.3, 2],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.6,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Water Surface with Waves */}
        <motion.div
          className={cn(
            "relative rounded-full bg-gradient-to-b from-blue-400/20 to-cyan-400/30 dark:from-blue-500/20 dark:to-cyan-500/30 border border-blue-300/50 dark:border-blue-400/30",
            sizeClasses[size]
          )}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Inner Water Pool */}
          <div
            className={cn(
              "absolute inset-2 rounded-full bg-gradient-to-b from-blue-300/40 to-cyan-300/40 dark:from-blue-400/30 dark:to-cyan-400/30",
              size === "sm" ? "inset-3" : size === "md" ? "inset-4" : "inset-6"
            )}
          />
        </motion.div>

        {/* Multiple Water Drops */}
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={`drop-${index}`}
            className="absolute"
            style={{
              left: `${20 + index * 20}%`,
              top: `${10 + (index % 2) * 20}%`,
            }}
            initial={{ y: -30, opacity: 0 }}
            animate={{
              y: [-30, 0, -30],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: index * 0.4,
              ease: "easeInOut",
            }}
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={cn(
                "text-blue-500 dark:text-blue-300",
                size === "sm"
                  ? "h-3 w-3"
                  : size === "md"
                  ? "h-4 w-4"
                  : "h-6 w-6"
              )}
              fill="currentColor"
            >
              <path d="M12 2C12 2 6 8 6 12c0 4 2.5 8 6 8s6-4 6-8c0-4-6-10-6-10z" />
            </motion.svg>
          </motion.div>
        ))}

        {/* Central Water Drop */}
        <motion.div
          className="absolute"
          animate={{
            y: [-5, 0, -5],
            scale: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            className={cn(
              "text-blue-600 dark:text-blue-400",
              size === "sm"
                ? "h-6 w-6"
                : size === "md"
                ? "h-8 w-8"
                : "h-12 w-12"
            )}
            fill="currentColor"
          >
            <path d="M32 4C32 4 12 28 12 40c0 11 9 20 20 20s20-9 20-20C52 28 32 4 32 4z" />
          </motion.svg>
        </motion.div>

        {/* Floating Bubbles */}
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={`bubble-${index}`}
            className="absolute rounded-full bg-blue-300/40 dark:bg-blue-400/30"
            style={{
              width: `${4 + (index % 3) * 2}px`,
              height: `${4 + (index % 3) * 2}px`,
              left: `${15 + index * 15}%`,
              top: `${20 + (index % 2) * 30}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: index * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Aqua System Text */}
      {showText && (
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.div
            className={cn(
              "font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-600 bg-clip-text text-transparent",
              textSizeClasses[size]
            )}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Aqua System
          </motion.div>
          <motion.div
            className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Loading...
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
