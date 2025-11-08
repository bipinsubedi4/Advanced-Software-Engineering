import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const backgroundMap: Record<ToastType, string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
};

const iconMap: Record<ToastType, React.ReactElement> = {
  success: <FaCheckCircle className="text-2xl" />,
  error: <FaExclamationCircle className="text-2xl" />,
  info: <FaInfoCircle className="text-2xl" />,
};

const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 4000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-6 right-6 z-50">
      <div
        className={`${backgroundMap[type]} text-white rounded-2xl shadow-2xl px-5 py-4 flex items-start gap-3 w-80 transition transform`}
        role="status"
        aria-live="polite"
      >
        <div>{iconMap[type]}</div>
        <div className="flex-1">
          <p className="font-semibold text-sm tracking-wide">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="text-white/90 hover:text-white transition-colors mt-1"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default Toast;
