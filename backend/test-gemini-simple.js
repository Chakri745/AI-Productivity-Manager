// backend/test-correct-model.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testCorrectModel() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const modelsToTest = [
        "models/gemini-2.0-flash",
        "models/gemini-2.0-flash-exp",
        "models/gemini-flash-latest",
        "models/gemini-2.5-flash",
        "models/gemini-3-flash-preview"
    ];

    for (const modelName of modelsToTest) {
        try {
            console.log(`\nTesting: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say 'Hello World'");
            console.log(`✅ ${modelName} SUCCESS! Response: ${result.response.text()}`);
            return modelName; // Return the first working one
        } catch (error) {
            console.log(`❌ ${modelName} failed: ${error.message}`);
        }
    }

    return null;
}

testCorrectModel().then(workingModel => {
    if (workingModel) {
        console.log(`\n🎉 Use this model in your code: "${workingModel}"`);
    } else {
        console.log("\n😞 No model worked. Check API permissions.");
    }
});