const Button = ({ children, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`border-1 rounded-full hover:bg-gray-900 hover:text-white font-semibold py-2 px-4 transition ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
