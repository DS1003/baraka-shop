const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function listModels() {
    const ai = new GoogleGenAI({});
    try {
        const response = await ai.models.list();
        for await (const model of response) {
            console.log(model.name);
        }
    } catch (e) {
        console.error(e);
    }
}

listModels();
