// A simple utility to parse file content
export function parseTextToHTML(textContent) {
  if (!textContent) return '';
  return textContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `<p>${line}</p>`)
    .join('');
}
