import { toast } from "sonner";
import {
  OctagonAlert,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import React from "react";

type ToastVariant = "error" | "warning" | "success" | "info";

interface ToastProps {
  title?: string;
  description: string;
  variant?: ToastVariant;
  autoClose?: boolean;
  duration?: number;
}

const getVariantStyles = (variant: ToastVariant) => {
  const baseStyles =
    "flex items-start gap-3 p-2 rounded-lg border-l-4 shadow-lg md:text-nowrap w-full ";

  const variants = {
    error: `${baseStyles} bg-red-50 text-red-900 border-red-500 dark:bg-red-400 dark:text-red-100 dark:border-red-700`,
    warning: `${baseStyles} bg-amber-50 text-amber-900 border-amber-500 dark:bg-amber-400 dark:text-amber-100 dark:border-amber-700`,
    success: `${baseStyles} bg-emerald-50 text-emerald-900 border-emerald-500 dark:bg-emerald-400 dark:text-emerald-100 dark:border-emerald-700`,
    info: `${baseStyles} bg-blue-50 text-blue-900 border-blue-500 dark:bg-blue-400 dark:text-blue-100 dark:border-blue-700`,
  };

  return variants[variant];
};

const getVariantIcon = (variant: ToastVariant) => {
  const iconClass = "h-6 w-6 flex-shrink-0 my-auto";

  const icons = {
    error: (
      <OctagonAlert className={`${iconClass} text-red-500 dark:text-red-700`} />
    ),
    warning: (
      <AlertTriangle
        className={`${iconClass} text-amber-500 dark:text-amber-700`}
      />
    ),
    success: (
      <CheckCircle2
        className={`${iconClass} text-emerald-500 dark:text-emerald-700`}
      />
    ),
    info: <Info className={`${iconClass} text-blue-500 dark:text-blue-700`} />,
  };

  return icons[variant];
};

const getAutoCloseDuration = (
  variant: ToastVariant,
  autoClose?: boolean,
  duration?: number,
) => {
  if (typeof autoClose === "number") return autoClose;
  if (autoClose === false) return Infinity;

  const defaults = {
    error: 6000,
    warning: Infinity,
    success: 3000,
    info: Infinity,
  };

  return defaults[variant];
};

const ToastContent = ({
  t,
  title,
  description,
  variant,
  duration,
}: {
  t: any;
  title?: string;
  description: string;
  variant: ToastVariant;
  duration: number;
}) => {
  const [secondsLeft, setSecondsLeft] = React.useState(
    Math.floor(duration / 1000),
  );

  React.useEffect(() => {
    if (!Number.isFinite(duration)) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div className={getVariantStyles(variant)}>
      {getVariantIcon(variant)}

      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-base">{description}</p>
        {Number.isFinite(duration) && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
            Fechará em {secondsLeft}s
          </p>
        )}
      </div>

      <button
        onClick={() => toast.dismiss(t)}
        className="text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-500"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

// ✅ Função principal
export const showToast = ({
  title,
  description,
  variant = "info",
  autoClose,
  duration,
}: ToastProps) => {
  const resolvedDuration = duration ?? getAutoCloseDuration(variant, autoClose);

  toast.custom(
    (t) => (
      <ToastContent
        t={t}
        title={title}
        description={description}
        variant={variant}
        duration={resolvedDuration}
      />
    ),
    { duration: resolvedDuration },
  );
};

// 📦 Versões simplificadas
export const toastError = (
  props: Pick<ToastProps, "description" | "title" | "duration">,
) => showToast({ ...props, variant: "error" });

export const toastWarning = (
  props: Pick<ToastProps, "description" | "title" | "duration">,
) => showToast({ ...props, variant: "warning", autoClose: false });

export const toastSuccess = (
  props: Pick<ToastProps, "description" | "title" | "duration">,
) => showToast({ ...props, variant: "success" });

export const toastInfo = (
  props: Pick<ToastProps, "description" | "title" | "duration">,
) => showToast({ ...props, variant: "info", autoClose: false });
