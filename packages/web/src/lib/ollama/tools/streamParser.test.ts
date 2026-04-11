import { describe, it, expect } from 'vitest';
import {
  extractPartialToolResponse,
  extractToolCallsFromPartialJson,
  parseToolCallResponse,
} from './streamParser';

describe('streamParser', () => {
  describe('extractPartialToolResponse', () => {
    it('extracts response from complete JSON', () => {
      const json = '{"tool_calls": [], "response": "Hello there!"}';
      const result = extractPartialToolResponse(json);
      expect(result).toBe('Hello there!');
    });

    it('extracts response from partial JSON (still streaming)', () => {
      const json = '{"tool_calls": [], "response": "Hello th';
      const result = extractPartialToolResponse(json);
      expect(result).toBe('Hello th');
    });

    it('returns empty string when no response field', () => {
      const json = '{"tool_calls": []}';
      const result = extractPartialToolResponse(json);
      expect(result).toBe('');
    });

    it('handles escaped characters in response', () => {
      const json = '{"tool_calls": [], "response": "Line 1\\nLine 2"}';
      const result = extractPartialToolResponse(json);
      expect(result).toBe('Line 1\nLine 2');
    });
  });

  describe('extractToolCallsFromPartialJson', () => {
    it('extracts completed tool calls array', () => {
      const json = '{"tool_calls": [{"name": "search_recipes", "arguments": {"query": "pasta"}}], "response": "Searching..."}';
      const result = extractToolCallsFromPartialJson(json);
      expect(result).toHaveLength(1);
      expect(result![0].name).toBe('search_recipes');
      expect(result![0].arguments).toEqual({ query: 'pasta' });
    });

    it('returns null when tool_calls array is not yet closed', () => {
      const json = '{"tool_calls": [{"name": "search_recipes", "arguments": {"query": "pas';
      const result = extractToolCallsFromPartialJson(json);
      expect(result).toBeNull();
    });

    it('returns null when no tool_calls field exists', () => {
      const json = '{"response": "Hello"}';
      const result = extractToolCallsFromPartialJson(json);
      expect(result).toBeNull();
    });

    it('extracts empty tool calls array', () => {
      const json = '{"tool_calls": [], "response": "Just chatting"}';
      const result = extractToolCallsFromPartialJson(json);
      expect(result).toHaveLength(0);
    });

    it('extracts multiple tool calls', () => {
      const json = '{"tool_calls": [{"name": "search_ingredients", "arguments": {}}, {"name": "search_recipes", "arguments": {"query": "soup"}}], "response": ""}';
      const result = extractToolCallsFromPartialJson(json);
      expect(result).toHaveLength(2);
      expect(result![0].name).toBe('search_ingredients');
      expect(result![1].name).toBe('search_recipes');
    });

    it('handles brackets inside JSON string values', () => {
      const json = '{"tool_calls": [{"name": "search_recipes", "arguments": {"query": "find [pasta] recipes"}}], "response": ""}';
      const result = extractToolCallsFromPartialJson(json);
      expect(result).toHaveLength(1);
      expect(result![0].arguments).toEqual({ query: 'find [pasta] recipes' });
    });
  });

  describe('parseToolCallResponse', () => {
    it('parses complete valid JSON response', () => {
      const json = JSON.stringify({
        tool_calls: [{ name: 'get_recipe', arguments: { recipe_id: 'r1' } }],
        response: 'Here is your recipe!',
      });
      const result = parseToolCallResponse(json);
      expect(result).not.toBeNull();
      expect(result!.toolCalls).toHaveLength(1);
      expect(result!.toolCalls[0].name).toBe('get_recipe');
      expect(result!.response).toBe('Here is your recipe!');
    });

    it('returns empty tool calls when none provided', () => {
      const json = JSON.stringify({ tool_calls: [], response: 'Hi!' });
      const result = parseToolCallResponse(json);
      expect(result).not.toBeNull();
      expect(result!.toolCalls).toHaveLength(0);
      expect(result!.response).toBe('Hi!');
    });

    it('returns null for invalid JSON', () => {
      const result = parseToolCallResponse('not json');
      expect(result).toBeNull();
    });

    it('returns null for non-object JSON', () => {
      const result = parseToolCallResponse('"just a string"');
      expect(result).toBeNull();
    });

    it('handles missing tool_calls gracefully', () => {
      const json = JSON.stringify({ response: 'Hello' });
      const result = parseToolCallResponse(json);
      expect(result).not.toBeNull();
      expect(result!.toolCalls).toHaveLength(0);
    });

    it('filters out invalid tool call entries', () => {
      const json = JSON.stringify({
        tool_calls: [
          { name: 'valid_tool', arguments: {} },
          { invalid: true },
          'not an object',
        ],
        response: 'test',
      });
      const result = parseToolCallResponse(json);
      expect(result!.toolCalls).toHaveLength(1);
      expect(result!.toolCalls[0].name).toBe('valid_tool');
    });
  });
});
