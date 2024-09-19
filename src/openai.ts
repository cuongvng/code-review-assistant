import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();
import {systemPrompt} from './prompt';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function getOpenAIReview(changes: string) {

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: changes
            }
        ],
    });
    const review = response.choices[0].message.content;
    return review;
}
