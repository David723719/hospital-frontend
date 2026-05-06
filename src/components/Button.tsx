export function Button({ children, type = 'button', variant = 'primary', onClick, className = '', disabled = false }: { 
  children: React.ReactNode; type?: 'button' | 'submit'; variant?: 'primary' | 'outline'; onClick?: () => void; className?: string; disabled?: boolean;
}) {
  const base = 'px-4 py-2 rounded font-medium transition';
  const styles = variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50';
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>{children}</button>;
}