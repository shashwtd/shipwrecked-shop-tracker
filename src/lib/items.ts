// THIS FILE CONTAINS ALL THE ITEMS PRESENT ON THE SHOP AT: 16/AUG/2025
// Updated with correctly calculated base prices from reverse-engineering algorithm

export const items = [
    {
        id: "cmebn7caq0118nv01spx78x4t",
        name: "Raspbery PI 5",
        description: "Tiny board, massive possibilities, hack anything!",
        image: "https://m.media-amazon.com/images/I/61EQZoZvcEL._AC_SX679_.jpg",
        basePrice: 478, // Correctly calculated base price
        type: 'hardware',
        category: 'Electronics',
        isFixed: false
    },
    {
        id: "cmebn55yi0116nv01orzpor1v",
        name: "Samsung T7 1TB SSD",
        description: "Pocket-sized speedster, bulk up storage without the lag!",
        image: "https://summer.hackclub.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsiZGF0YSI6NTA4MjQsInB1ciI6ImJsb2JfaWQifX0=--c85a007e74ea5713fd31d769f0fb2a286bf8c7bd/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fbGltaXQiOlsyNTYsMjU2XX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--69edd5fc8f56201b3f04f7560743d8fad0d8d976/2025_08_14_0g5_Kleki.png",
        basePrice: 551, // Correctly calculated base price
        type: 'hardware',
        category: 'Storage',
        isFixed: false
    },
    {
        id: "cmebmn7um010wnv012eongfmj",
        name: "Flipper Zero",
        description:
            "Your digital multi-tool for hacking fun, cyber adventures await!",
        image: "https://summer.hackclub.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsiZGF0YSI6OTYsInB1ciI6ImJsb2JfaWQifX0=--355255c6559988d0ce586e089449e3280bfd4e29/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fbGltaXQiOlsyNTYsMjU2XX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--69edd5fc8f56201b3f04f7560743d8fad0d8d976/2025_06_15_0th_Kleki.png",
        basePrice: 1072, // Correctly calculated base price
        type: 'hardware',
        category: 'Security',
        isFixed: false
    },
    {
        id: "cme97z84p00r7nv01etg8md2q",
        name: "iPad 11-inch + Apple Pencil (USB-C)",
        description:
            "Draw, note, and doodle like a pro, paper is so last century!",
        image: "https://summer.hackclub.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsiZGF0YSI6MjM5LCJwdXIiOiJibG9iX2lkIn19--00b9312b1ea065d925f83ad3b53d6684eff483f4/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fbGltaXQiOlsyNTYsMjU2XX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--69edd5fc8f56201b3f04f7560743d8fad0d8d976/2025_06_16_0qh_Kleki(1).png",
        basePrice: 1995, // Correctly calculated base price
        type: 'electronics',
        category: 'Tablets',
        isFixed: false
    },
    {
        id: "cmdsx1fef0052sd01ygneytpv",
        name: "E-fidgets",
        description: "All the fun of a fidget but with no moving parts!",
        image: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/f41404149d4e37c370989a1617452b0db8a15b9b_image.png",
        basePrice: 58, // Correctly calculated base price
        type: 'gadget',
        category: 'Fun',
        isFixed: false
    },
    {
        id: "cmdmch4xb056cqn01rc10afcq",
        name: "Donate a shell to the void",
        description: "Self explanatory. No refunds!",
        image: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/58570ed145749843df2c2473de3d8015590d5bb6_void.webp",
        basePrice: 1, // Fixed price
        type: 'donation',
        category: 'Special',
        isFixed: true,
    },
    {
        id: "cmdelz54j00celf013dx0xr84",
        name: "RTL-SDR V4 Kit",
        description:
            "Turn your PC into an all-band radio scanner, sideband digging fun!",
        image: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/8279d13adf6af77e72eeb5f301b63bc24d4a7b42_rtl-sdr_v4_kit.jpg",
        basePrice: 311, // Correctly calculated base price
        type: 'hardware',
        category: 'Radio',
        isFixed: false
    },
    {
        id: "cmdelstju00cclf01v5y89dr9",
        name: "Pinetime",
        description: "Open-source smartwatch, tick in style, tinker at will!",
        image: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/195d7241f6c6c04f77efe1ac7490720fdf3a868f_pinetime.png",
        basePrice: 240, // Correctly calculated base price
        type: 'wearable',
        category: 'Smartwatch',
        isFixed: false
    },
    {
        id: "cmdelpbl000calf01fhievo7a",
        name: "Universal AI Credit",
        description:
            "OpenAI, Anthropic, Groq, Gemini, Cursor, Openrouter, all the AI you crave!",
        image: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/14ad26063d941e9c6d917d4c78c9cdbd15c4c6e5_universal_ai_credit.png",
        basePrice: 50, // Correctly calculated base price
        type: 'credits',
        category: 'AI',
        isFixed: false
    },
    {
        id: "cmdel7uer00c8lf017kdhtiaa",
        name: "Centauri",
        description:
            "Ever wanted a printer that can print out of the box and auto calibrate? Here ya go!",
        image: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/a51dda2074f5aa4bdf304ec7163becd20f8003ee_centauri.webp",
        basePrice: 1260, // Correctly calculated base price
        type: 'hardware',
        category: '3D Printer',
        isFixed: false
    },
    {
        id: "cmdel771k00c6lf01coz5rlhz",
        name: "Centauri Carbon",
        description:
            "Ever wanted a printer that can print out of the box and auto calibrate and print carbon fiber? Here ya go!",
        image: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/3ed4b029d631da804476a739ad61aac228fcfd0f_centauri_carbon.png",
        basePrice: 1844, // Correctly calculated base price
        type: 'hardware',
        category: '3D Printer',
        isFixed: false
    },
    {
        id: "cmdel4iob00c3lf01obbetleo",
        name: "M4 mac mini",
        description:
            "Pocket-rocket performance in a mini chassis, meet your new desk boss!",
        image: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/eeaa6eedf312fdd412e119d44e2ec8401e2fe27d_m4_mac_mini.jpg",
        basePrice: 2671, // Correctly calculated base price
        type: 'computer',
        category: 'Desktop',
        isFixed: false
    },
    {
        id: "cmd7in0r4000kro01x3l2c1v8",
        name: "Travel Stipend",
        description:
            "A $10 Travel Stipend to get you to the Island. Stack up as many of these as you want!",
        image: "https://hc-cdn.hel1.your-objectstorage.com/s/v3/b1bc731ce06be80dae2080af70cb11b4bbcba617_travelstipend.jpg",
        basePrice: 15, // Correctly calculated base price (close to formula)
        type: 'stipend',
        category: 'Travel',
        isFixed: true,
    },
];
