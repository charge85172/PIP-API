export const getRequestLanguage = (req) => {
    // We check the 'accept-language' header sent from the frontend fetch service
    const lang = req.headers['accept-language'];
    const supportedLanguages = ['en', 'nl', 'hamster'];

    // If no header is present or the language isn't supported, default to English
    if (!lang || !supportedLanguages.includes(lang)) {
        return 'en';
    }

    return lang;
};