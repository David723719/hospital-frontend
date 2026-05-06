export function Button({ children, variant = 'primary', className = '', ...props }: any) {
    const base = 'px-4 py-2 rounded-lg font-medium transition border cursor-pointer';
    const v = { primary: 'bg-hospital-600 text-white hover:bg-hospital-700 border-transparent', outline: 'border-slate-300 text-slate-700 hover:bg-slate-50', danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent' };
    return <button className={`${base} ${v[variant as keyof typeof v]} ${className}`} {...props}>{children}</button>;
  }