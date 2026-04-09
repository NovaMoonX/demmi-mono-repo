export interface ParsedToolCallResponse {
  toolCalls: Array<{ name: string; arguments: Record<string, unknown> }>;
  response: string;
}

/**
 * Extract the "response" field value from a partial JSON stream.
 * Handles incomplete JSON gracefully (stream still building).
 */
export function extractPartialToolResponse(partialJson: string): string {
  const match = partialJson.match(/"response"\s*:\s*"((?:[^"\\]|\\.)*)"?/s);
  if (!match) return '';

  try {
    const result = JSON.parse('"' + match[1] + '"') as string;
    return result;
  } catch {
    return '';
  }
}

/**
 * Extract tool calls from a partial JSON stream.
 * Returns completed tool call objects from the "tool_calls" array, even if the
 * overall JSON is still incomplete (the response field may still be streaming).
 */
export function extractToolCallsFromPartialJson(
  partialJson: string,
): Array<{ name: string; arguments: Record<string, unknown> }> | null {
  const toolCallsMatch = partialJson.match(/"tool_calls"\s*:\s*\[/);
  if (!toolCallsMatch) return null;

  const startIdx = partialJson.indexOf('[', toolCallsMatch.index);
  if (startIdx === -1) return null;

  let depth = 0;
  let endIdx = -1;
  for (let i = startIdx; i < partialJson.length; i++) {
    const char = partialJson[i];
    if (char === '[') depth++;
    else if (char === ']') {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }

  if (endIdx === -1) return null;

  const arrayStr = partialJson.slice(startIdx, endIdx + 1);
  try {
    const parsed = JSON.parse(arrayStr) as Array<{ name: string; arguments: Record<string, unknown> }>;
    const result = parsed.filter(
      (tc) => typeof tc.name === 'string' && tc.arguments != null,
    );
    return result;
  } catch {
    return null;
  }
}

/**
 * Parse a complete tool-call JSON response from the LLM.
 * Expected format:
 * {
 *   "tool_calls": [{ "name": "...", "arguments": { ... } }],
 *   "response": "..."
 * }
 */
export function parseToolCallResponse(json: string): ParsedToolCallResponse | null {
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const toolCalls = Array.isArray(parsed.tool_calls) ? parsed.tool_calls : [];
    const response = typeof parsed.response === 'string' ? parsed.response : '';

    const result: ParsedToolCallResponse = {
      toolCalls: toolCalls.filter(
        (tc: unknown) =>
          typeof tc === 'object' &&
          tc !== null &&
          typeof (tc as Record<string, unknown>).name === 'string',
      ),
      response,
    };
    return result;
  } catch {
    return null;
  }
}
