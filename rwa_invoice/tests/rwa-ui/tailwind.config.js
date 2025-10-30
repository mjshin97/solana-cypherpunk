// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // 🚨 여기가 수정되었습니다!
    // "./index.html", // <- 이 경로 대신
    "./public/index.html", // <- 'public' 폴더 안을 보도록 수정
    
    "./src/**/*.{js,ts,jsx,tsx}", // 이 줄은 원래대로 둡니다.
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
