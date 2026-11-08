// Reads a newline-delimited JSON stream (one JSON value per line) as it arrives.
// Safe to use in the browser.

export async function* readNdjson<T>(body: ReadableStream<Uint8Array>): AsyncGenerator<T> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  // Text that arrived but doesn't end in a newline yet: the start of a line still on its way.
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      buffer += decoder.decode(); // flush any half-received multi-byte character
      break;
    }
    // stream: true keeps a character split across two chunks (like an emoji) from being garbled.
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // the last piece may be incomplete, so keep it for next time
    for (const line of lines) {
      if (line.trim() !== "") {
        yield JSON.parse(line) as T;
      }
    }
  }

  if (buffer.trim() !== "") {
    yield JSON.parse(buffer) as T;
  }
}
