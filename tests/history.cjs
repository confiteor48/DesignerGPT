const assert = require("node:assert/strict");
const { createReader, normalizeMessages, splitMarkdown, conversationId } = require("../src/history.js");
const id = "00000000-0000-4000-8000-000000000000";
const mid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const raw = (n, text = `Message ${n}`) => ({ id: mid(n), author: { role: n % 2 ? "user" : "assistant" }, content: { content_type: "text", parts: [text] } });
const response = (body, status = 200) => ({ ok: status === 200, status, json: async () => body });
const page = (messages, more = false, cursor = messages[0]?.id) => ({ title: "Fixture", messages, page_info: { has_previous_page: more, start_cursor: cursor } });

(async () => {
  assert.equal(conversationId(`/g/project/c/${id}`), id);
  assert.equal(conversationId("/library"), null);
  const parts = splitMarkdown("Before\n\n````md\n```js\nx()\n```\n````\n\nAfter");
  assert.deepEqual(parts.map((part) => part.type), ["text", "code", "text"]);
  assert.equal(parts[1].text, "```js\nx()\n```");
  const normalized = normalizeMessages([
    raw(1), { ...raw(2), channel: "analysis" }, { ...raw(3), author: { role: "system" } },
    { ...raw(4), recipient: "python" }, { ...raw(5), metadata: { is_visually_hidden_from_conversation: true } },
    { ...raw(6), content: { content_type: "thoughts", thoughts: [{ summary: "Visible summary" }] } },
    { ...raw(8, "Answer\n```js\nx()\n```"), metadata: { attachments: [{ name: "report.txt" }], content_references: [{ url: "https://example.com", title: "Source" }] } }
  ]);
  assert.equal(normalized.length, 2);
  assert.equal(normalized[1].thinking, "Visible summary");
  assert.equal(normalized[1].fileCount, 1);
  assert.equal(normalized[1].sources[0].url, "https://example.com");
  assert.equal(normalized[1].parts.filter((part) => part.type === "code").length, 1);

  const calls = [];
  const pages = [page([raw(3), raw(4)], true), page([raw(1), raw(2), raw(3)])];
  const reader = createReader({ pause: async () => {}, fetch: async (url, options) => {
    calls.push(url);
    if (url === "/api/auth/session") return response({ accessToken: "fixture-token" });
    assert.equal(options.headers.Authorization, "Bearer fixture-token");
    return response(pages.shift());
  } });
  const pending = reader.load(id);
  assert.equal(reader.load(id), pending, "concurrent requests share a single load");
  const result = await pending;
  assert.deepEqual(result.messages.map((message) => message.messageId), [1, 2, 3, 4].map(mid));
  assert.equal(result.complete, true);
  assert.equal(calls.length, 3);
  assert.match(calls[2], /\/messages\?before=/);
  assert.equal(await reader.load(id), result);
  reader.clear();
  assert.equal(reader.peek(id), null);

  for (const failure of ["429", "401", "malformed", "repeated"]) {
    let attempt = 0;
    const failing = createReader({ pause: async () => {}, fetch: async (url) => {
      if (url === "/api/auth/session") return response({ accessToken: "fixture-token" });
      attempt++;
      if (attempt === 1 || failure === "repeated") return response(page([raw(3)], true));
      return failure === "malformed" ? response({ messages: [] }) : response({}, Number(failure));
    } });
    await assert.rejects(failing.load(id), /rate-limiting|authorize|unrecognized|progress/);
    assert.equal(failing.peek(id), null, "errors must never cache partial history");
  }
  const controller = new AbortController();
  const aborted = createReader({ pause: async () => controller.abort(), fetch: async (url) => response(url === "/api/auth/session" ? { accessToken: "fixture-token" } : page([raw(1)], true)) });
  await assert.rejects(aborted.load(id, { signal: controller.signal }), { name: "AbortError" });
  assert.equal(aborted.peek(id), null);
  console.log("History unit tests passed");
})().catch((error) => { console.error(error); process.exitCode = 1; });
