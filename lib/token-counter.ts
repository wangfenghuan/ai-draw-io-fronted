/**
 * Token counting utilities using js-tiktoken
 *
 * Uses cl100k_base encoding (GPT-4) which is close to Claude's tokenization.
 * This is a pure JavaScript implementation, no WASM required.
 *
 * Note: System prompts are now handled by the backend, so this file only
 * provides basic token counting for client-side use.
 */

import { encodingForModel } from "js-tiktoken"

const encoder = encodingForModel("gpt-4o")

/**
 * Count the number of tokens in a text string
 * @param text - The text to count tokens for
 * @returns The number of tokens
 */
export function countTextTokens(text: string): number {
    return encoder.encode(text).length
}

/**
 * Estimate token count for a message (approximate)
 * @param content - The message content
 * @returns Estimated token count
 */
export function estimateMessageTokens(content: string): number {
    // Add a small overhead for message formatting
    return countTextTokens(content) + 4
}