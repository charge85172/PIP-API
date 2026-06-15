const manualTranslations = {
    nl: {
        "social media basics": "Sociale Media Basis",
        "general knowledge": "Algemene Kennis",
        "modules": "Modules",
        "learning the fundamentals of social media.": "Leer de fundamenten van sociale media.",
        "discover the world of social media — learn how the most popular platforms work and how to use them safely and confidently.": "Ontdek de wereld van sociale media — leer hoe de meest populaire platforms werken en hoe je ze veilig en zelfverzekerd kunt gebruiken.",
        "test and expand your understanding of the digital world with a variety of general knowledge questions.": "Test en vergroot je begrip van de digitale wereld met een verscheidenheid aan algemene kennisvragen.",
        "hamster wheel": "Hamsterrad",
        "golden sunflower seed": "Gouden Zonnebloempit",
        "show lessons": "Toon lessen",
        "start lesson": "Start les"
    }
};

const toHamster = (text) => {
    if (!text) return "";
    return text.split(" ").map(() => "peep").join(" ").replace(/^\w/, (c) => c.toUpperCase()) + ".";
};

export const translateContent = (data, lang) => {
    if (!data || lang === 'en') return data;

    const translateValue = (val) => {
        if (typeof val !== 'string') return val;

        if (lang === 'hamster') {
            return toHamster(val);
        }

        if (lang === 'nl') {
            const lookupKey = val.trim().toLowerCase();
            if (manualTranslations.nl[lookupKey]) {
                return manualTranslations.nl[lookupKey];
            }
        }
        return val;
    };

    const processItem = (item) => {
        if (!item || typeof item !== 'object') return item;
        const newItem = { ...item };
        const fieldsToTranslate = [
            'title',
            'description',
            'course_name',
            'course_title',
            'module_title',
            'question_text',
            'answer_text',
            'feedback_text',
            'tip',
            'question_tip'
        ];

        fieldsToTranslate.forEach(field => {
            if (newItem[field]) {
                newItem[field] = translateValue(newItem[field]);
            }
        });
        return newItem;
    };

    if (Array.isArray(data)) {
        return data.map(item => processItem(item));
    }
    return processItem(data);
};