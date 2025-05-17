export  const GradientText = ({ children, className }) => {
    return (
        <h1
            className={`bg-gradient-to-r from-[#40ffaa] via-[#4079ff] to-[#40ffaa] bg-clip-text text-transparent text-6xl font-bold ${className}`}
        >
            {children}
        </h1>
    );
};
