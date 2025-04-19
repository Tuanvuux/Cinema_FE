import forms from '@tailwindcss/forms';
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // Định nghĩa phạm vi áp dụng Tailwind
    theme: {
      extend: {},
    },
    plugins: [
        forms
    ],
  };
  