import { GoogleGenerativeAI } from "@google/generative-ai";
// Access the API key from Vite's environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Sample Blockchain Documents for Context
export const sampleDocs = [
    "Proof of Work (PoW) is a consensus mechanism used in Bitcoin. It requires miners to solve complex cryptographic hash puzzles using computational power. The first miner to solve the puzzle adds the block to the blockchain and receives block rewards. PoW is energy intensive but highly secure due to computational difficulty.",
    "Proof of Stake (PoS) is an alternative consensus mechanism used by Ethereum 2.0. Instead of miners, it uses validators who stake their cryptocurrency to propose and validate blocks. It is much more energy-efficient than PoW but can be prone to centralization if wealth is concentrated.",
    "A smart contract is a self-executing contract with the terms of the agreement directly written into lines of code. The code and the agreements contained therein exist across a distributed, decentralized blockchain network. Smart contracts permit trusted transactions and agreements to be carried out among disparate, anonymous parties without the need for a central authority, legal system, or external enforcement mechanism. However, bugs in the code can lead to vulnerabilities and exploits.",
    "Decentralized Finance (DeFi) refers to financial services provided on public blockchains, primarily Ethereum. Instead of going through a bank or brokerage, users interact with smart contracts to lend, borrow, trade, or earn interest. DeFi protocols aim to be permissionless and transparent.",
    "Non-Fungible Tokens (NFTs) are unique digital identifiers recorded on a blockchain that certify ownership and authenticity. Unlike cryptocurrencies like Bitcoin, which are fungible and identical, each NFT is unique and cannot be mutually exchanged. They are often used for digital art, collectibles, and gaming items."
];

/**
 * Returns a basic Dice's Coefficient to mimic string similarity natively
 */
function compareTwoStrings(first, second) {
    first = first.replace(/\s+/g, '').toLowerCase();
    second = second.replace(/\s+/g, '').toLowerCase();

    if (first === second) return 1;
    if (first.length < 2 || second.length < 2) return 0;

    const firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
        const bigram = first.substring(i, i + 2);
        const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;
        firstBigrams.set(bigram, count);
    }

    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
        const bigram = second.substring(i, i + 2);
        const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;
        if (count > 0) {
            firstBigrams.set(bigram, count - 1);
            intersectionSize++;
        }
    }

    return (2.0 * intersectionSize) / (first.length - 1 + second.length - 1);
}

/**
 * Simulates Vector Search by combining basic Dice Coefficient with direct keyword inclusion
 * to prevent length penalties on short user queries.
 */
export const findSimilarDocuments = (query, docs, threshold = 0.01, topK = 3) => {
    if (!query) return [];

    const normalizedQuery = query.toLowerCase();

    // Calculate scores combining substring matching and Dice coefficient
    const scoredDocs = docs.map(doc => {
        const normalizedDoc = doc.toLowerCase();
        let score = compareTwoStrings(query, doc);

        // Massive boost if the document simply contains the primary nouns/words
        const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 3);
        if (queryWords.length > 0) {
            const matches = queryWords.filter(w => normalizedDoc.includes(w)).length;
            score += (matches / queryWords.length) * 0.5; // Boost score massively
        }

        return { text: doc, score };
    });

    // Sort by highest score first
    scoredDocs.sort((a, b) => b.score - a.score);

    // Filter by threshold and take top K
    return scoredDocs
        .filter(doc => doc.score >= threshold)
        .slice(0, topK)
        .map(doc => doc.text);
};

export const processQueryStream = async function* (userQuestion) {
    try {
        if (!API_KEY || API_KEY === "your_gemini_api_key_here") {
            throw new Error("GEMINI_API_KEY is missing. Please set it in your .env file.");
        }

        console.log(`Processing Question: '${userQuestion}'`);

        // 1. Retrieve Context using simulated similarity search
        const validDocs = findSimilarDocuments(userQuestion, sampleDocs);

        // 2. Removed the exact enforcement of "not enough data" rule to answer all blockchain queries
        // Even if validDocs is empty, we will let Gemini use its broader knowledge base.

        // Combine context
        const retrievedContext = validDocs.length > 0 ? validDocs.join("\n\n") : "No specific local context found. Use your internal expertise.";

        // 3. Format prompt PRECISELY as requested
        const prompt = `You are BlockMind AI, a highly specialized Blockchain Domain Expert.

Your task is to answer ALL blockchain and cryptocurrency-related questions using your internal knowledge and any provided context.

STRICT RULES:
1. You can use the provided context, but you MUST also use your own vast knowledge of blockchain, crypto, web3, etc. to answer the question detailedly.
2. If the question is outside the blockchain or cryptocurrency domain, refuse to answer and respond exactly with:
   "I am specialized only in Blockchain and Cryptocurrency domain."
3. Do NOT hallucinate.
4. Never provide financial or investment advice.
5. Maintain a professional and technical tone.

Structure your response strictly in this format:

Definition:
Clear and concise definition.

Technical Explanation:
Detailed explanation of how it works technically.

Example:
Provide a real-world blockchain example if applicable. If not applicable, write "Not applicable."

Security / Limitations:
Mention security aspects or limitations if relevant. If not relevant, write "Not applicable."

--------------------------------------------

Context:
${retrievedContext}

Question:
${userQuestion}`;

        console.log("-> Sending text stream request to Gemini...");

        // 4. Send to LLM as Stream
        const result = await model.generateContentStream(prompt);
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                yield chunkText;
            }
        }

    } catch (error) {
        console.error("Error in processQueryStream:", error);
        yield `Error connecting to LLM: ${error.message}`;
    }
};
