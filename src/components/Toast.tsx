import { useEffect } from 'react';

export function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success'|'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg border shadow-lg flex items-center gap-3 ${colors[type]} animate-slide-up z-50`}>
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-70 font-bold">✕</button>
    </div>
  );
}