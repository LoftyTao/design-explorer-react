export const Badge = ({ children, className = "" }) => (
  <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-medium tracking-wide ${className}`}>
    {children}
  </span>
);
