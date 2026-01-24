export const Card = ({ children, className = "", style = {} }) => (
  <div className={`bg-white border border-zinc-200 shadow-sm ${className}`} style={style}>
    {children}
  </div>
);
