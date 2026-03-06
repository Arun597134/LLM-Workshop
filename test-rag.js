import { processQueryStream } from './src/api/ragService.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    try {
        const stream = processQueryStream("What is Proof of Work?");
        for await (const chunk of stream) {
            process.stdout.write(chunk);
        }
        console.log("\nDone");
    } catch (e) {
        console.error("Script error:", e);
    }
}

test();
