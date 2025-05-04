import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message?: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
}) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
      <AlertCircle size={14} />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
