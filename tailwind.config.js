/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],

    theme: {
        container: {
            center: true,

            screens: {
                "2xl": "1440px",
            },

            padding: {
                DEFAULT: "90px",
            },
        },

        screens: {
            sm: "525px",
            md: "768px",
            lg: "1024px",
            xl: "1240px",
            "2xl": "1440px",
            1180: "1180px",
            1060: "1060px",
            991: "991px",
            868: "868px",
        },

        extend: {
            colors: {
                navyBlue: "#25843D", // primary (Sainmarks green, AA on white)
                lightOrange: "#F3F4F3", // footer / soft background (Sainmarks light grey)
                darkGreen: '#40994A',
                darkBlue: '#0044F2',
                darkPink: '#F85156',

                // Sainmarks palette (logo green #35A64E, gold frame #C9A04A, charcoal wordmark #4A4C4D)
                brand: {
                    50: '#EEF8F0',
                    100: '#D7EFDC',
                    200: '#B0DFBA',
                    300: '#83CC93',
                    400: '#57B96C',
                    500: '#35A64E',
                    600: '#2B9445',
                    700: '#25843D',
                    800: '#1E6B32',
                    900: '#17532A',
                },
                gold: '#C9A04A',
                charcoal: '#4A4C4D',
            },

            fontFamily: {
                poppins: ["Poppins", "sans-serif"],
                dmserif: ["DM Serif Display", "serif"],
            },
        }
    },

    plugins: [],

    safelist: [
        {
            pattern: /icon-/,
        }
    ]
};
