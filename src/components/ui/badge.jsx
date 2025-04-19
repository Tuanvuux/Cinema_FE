const Badge = ({ children, variant = "default" }) => {
  const baseStyle = "px-2 py-1 text-xs font-semibold rounded";
  const variants = {
    default: "bg-gray-200 text-gray-800",
    outline: "border border-gray-400 text-gray-800",
  };

  return (
    <span className={`${baseStyle} ${variants[variant]}`}>{children}</span>
  );
};

export default Badge;
