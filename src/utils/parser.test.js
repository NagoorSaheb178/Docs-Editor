import { test } from 'node:test';
import assert from 'node:assert';
import { parseTextToHTML } from './parser.js';

test('parseTextToHTML converts newlines to paragraph tags', () => {
  const input = `Hello
World

This is a test.`;
  const expected = '<p>Hello</p><p>World</p><p>This is a test.</p>';
  
  assert.strictEqual(parseTextToHTML(input), expected);
});

test('parseTextToHTML handles empty input', () => {
  assert.strictEqual(parseTextToHTML(''), '');
  assert.strictEqual(parseTextToHTML('   \n  '), '');
});
