import { useEffect } from 'react';
export function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  return <div className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg ${bg} flex items-center gap-3 z-50`}><span>{message}</span><button onClick={onClose} className="font-bold">✕</button></div>;
}