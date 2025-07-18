import { GoogleGenAI } from "@google/genai";
import _CONFIG from "../config.js";

async function getFactsFromGemini(query) {
    const sample_Input_text =
        "Sample Input: Imagine you a smart bot that tell 7-8 interesting facts about the topic given to you. Topic may be given directly or a related statement can be told to you. Here is you topic/statement/query -> Football";

    const sample_Output_text = `Sample Output: {Category: Sports, Facts: Okay, here are 7 interesting facts about football:

        1.  Football's origins are ancient and widespread: While the modern game originated in England, versions of football were played in ancient Greece, Rome, and China centuries ago. These early games often involved kicking a ball or other object and were more chaotic and less standardized than today's rules.

        Like this, 6 more pointers}`;

    const ai = new GoogleGenAI({
        apiKey: _CONFIG.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Imagine you a smart bot that tell 7-8 interesting facts about the topic given to you. Topic may be given directly or a related statement can be told to you. Here is you topic/statement/query -> ${query} Also identify the category of the query from the following categories - [Science, History, Technology, Sports, Nature, Arts] and provide the result in object format as mentioned in the Sample Output. NOTE: Make sure you only give me object as response, with no introductory text outside JSON object attached to it.

        ${sample_Input_text}
        ${sample_Output_text}`,
    });

    const { Category, Facts } = JSON.parse(
        response.text.match(/```json([\s\S]*?)```/)[1]
    );

    // const formatted_facts = Facts.replace(
    //     /\*\*(.*?)\*\*/g,
    //     "<strong>$1</strong>"
    // );

    // console.log("From Gemini_2: ", { Category, formatted_facts });

    return { Category, Facts };
}
export default getFactsFromGemini;
