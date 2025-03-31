/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        borderRadius: {
          'btn': '0.5rem',  // el valor de redondeo de Nord
        },
      },
    },
    plugins: [
      require("daisyui")
    ],
    daisyui: {
      themes: [{
        nord: {
          ...require("daisyui/src/theming/themes")["nord"],
        },
      }],
      base: true,
      styled: true,
      utils: true,
      prefix: "",
      logs: true,
      themeRoot: ":root",
    },
    corePlugins: {
      preflight: true,
    },
  }