(function (root) {
  "use strict";

  const validId = (value) => /^[a-z0-9-]{16,80}$/i.test(value || "");
  const conversationId = (pathname) => pathname.match(/\/c\/([a-z0-9-]{16,80})(?:\/|$)/i)?.[1] || null;

  function splitMarkdown(text) {
    const parts = [];
    let prose = [];
    let block = null;
    const flush = () => {
      const value = prose.join("\n").trim();
      if (value) parts.push({ type: "text", text: value });
      prose = [];
    };
    for (const line of String(text).split("\n")) {
      const fence = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (block) {
        if (fence && fence[1][0] === block.fence[0] && fence[1].length >= block.fence.length && !fence[2].trim()) {
          parts.push({ type: "code", language: block.language, text: block.lines.join("\n") });
          block = null;
        } else block.lines.push(line);
      } else if (fence) {
        flush();
        block = { fence: fence[1], language: fence[2].trim().split(/\s+/)[0], lines: [] };
      } else prose.push(line);
    }
    if (block) parts.push({ type: "code", language: block.language, text: block.lines.join("\n") });
    flush();
    return parts;
  }

  function sourceReferences(metadata) {
    const sources = new Map();
    function visit(value, depth = 0) {
      if (!value || typeof value !== "object" || depth > 8) return;
      if (Array.isArray(value)) { value.forEach((item) => visit(item, depth + 1)); return; }
      const url = value.url || value.source_url;
      const name = value.title || value.file_name || value.filename || value.name;
      if (typeof url === "string" && /^https?:\/\//i.test(url)) sources.set(url, { title: String(name || url), url });
      else if (name && (value.file_id || value.file_name || value.filename)) sources.set(String(value.file_id || name), { title: String(name) });
      for (const [key, child] of Object.entries(value)) {
        if (!["prompt_text", "content", "text", "snippet"].includes(key)) visit(child, depth + 1);
      }
    }
    visit(metadata.content_references);
    visit(metadata.citations);
    return Array.from(sources.values());
  }

  function normalizeMessages(rawMessages) {
    const messages = [];
    let summaries = [];
    for (const raw of rawMessages) {
      const role = raw.author?.role;
      const metadata = raw.metadata || {};
      const content = raw.content || {};
      if (role === "user") summaries = [];
      if (metadata.is_visually_hidden_from_conversation) continue;
      if (role === "assistant" && content.content_type === "thoughts") {
        summaries.push(...(content.thoughts || []).map((thought) => [thought.summary, thought.content].filter(Boolean).join("\n")));
        continue;
      }
      if (!["user", "assistant"].includes(role) || raw.channel === "analysis" || (raw.recipient && raw.recipient !== "all")) continue;
      if (!["text", "multimodal_text", "code", "text_audio", "audio_transcription", "audio", "video", "image"].includes(content.content_type)) continue;
      const files = new Map();
      for (const file of metadata.attachments || []) {
        const name = file.name || file.filename || file.file_name;
        if (name) files.set(file.id || file.file_id || name, String(name));
      }
      const chunks = [];
      const media = [];
      for (const part of content.parts || []) {
        if (typeof part === "string") chunks.push(part);
        else if (part && typeof part === "object") {
          if (typeof part.text === "string") chunks.push(part.text);
          else if (part.content_type === "image_asset_pointer") media.push("Image");
          else if (/audio/.test(part.content_type || "")) media.push("Audio");
          else if (/video/.test(part.content_type || "")) media.push("Video");
        }
      }
      if (typeof content.text === "string") chunks.push(content.text);
      if (typeof content.transcription === "string") chunks.push(content.transcription);
      if (!chunks.length && ["audio", "video", "image"].includes(content.content_type)) media.push(content.content_type);
      let text = chunks.join("\n\n");
      for (const ref of metadata.content_references || []) {
        if (typeof ref.matched_text === "string" && ref.matched_text) text = text.split(ref.matched_text).join("");
      }
      text = text.replace(/\uE200[^\uE201]*\uE201/g, "").trim();
      const attachments = Array.from(files.values());
      // API media pointers have no downloadable URL; keep their presence explicit.
      const unnamedMedia = media.slice(Math.min(media.length, attachments.length));
      const attachmentText = [...attachments.map((name) => `[Attachment: ${name}]`), ...unnamedMedia.map((kind) => `[${kind} attachment]`)];
      if (attachmentText.length) text = [text, attachmentText.join("\n")].filter(Boolean).join("\n\n");
      if (!text || !raw.id) continue;
      const parts = content.content_type === "code"
        ? [{ type: "code", language: content.language || "", text }]
        : splitMarkdown(text);
      messages.push({
        messageId: raw.id,
        exportKey: raw.id,
        role,
        text,
        parts,
        createdAt: raw.create_time || null,
        sources: sourceReferences(metadata),
        fileCount: attachments.length + unnamedMedia.length,
        thinking: role === "assistant" ? summaries.join("\n\n") : ""
      });
      if (role === "assistant") summaries = [];
    }
    return messages.map((message, index) => ({ ...message, index: index + 1 }));
  }

  function createReader({ fetch: fetcher = root.fetch.bind(root), pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = {}) {
    let cache = null;
    let pending = null;
    let generation = 0;

    async function read(id, { signal, onProgress = () => {} } = {}) {
      const request = async (url, token) => {
        const response = await fetcher(url, {
          credentials: "include",
          signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (!response.ok) {
          if (response.status === 429) throw new Error("ChatGPT is rate-limiting history requests. Wait a moment, then retry.");
          if (response.status === 401 || response.status === 403) throw new Error("ChatGPT could not authorize history access. Refresh the page and retry.");
          throw new Error(`Could not load conversation history (${response.status}).`);
        }
        return response.json();
      };
      const session = await request("/api/auth/session");
      if (!session.accessToken) throw new Error("Sign in to ChatGPT to load the full conversation.");
      const base = `/backend-api/conversations/${encodeURIComponent(id)}`;
      let page = await request(`${base}?include_has_versions=true&num_turns=10`, session.accessToken);
      const title = page.title || "";
      const pages = [];
      const cursors = new Set();
      let count = 0;
      for (;;) {
        if (!Array.isArray(page.messages) || !page.page_info || typeof page.page_info.has_previous_page !== "boolean") {
          throw new Error("ChatGPT returned an unrecognized history page. No partial export was created.");
        }
        pages.push(page.messages);
        count += page.messages.length;
        onProgress(count);
        if (!page.page_info.has_previous_page) break;
        const cursor = page.page_info.start_cursor;
        if (!validId(cursor) || cursors.has(cursor)) throw new Error("History pagination stopped making progress. Please retry.");
        cursors.add(cursor);
        await pause(250);
        signal?.throwIfAborted();
        page = await request(`${base}/messages?before=${encodeURIComponent(cursor)}&include_has_versions=true&num_turns=10`, session.accessToken);
      }
      const deduplicated = new Map();
      for (const pageMessages of pages.reverse()) {
        for (const message of pageMessages) if (message?.id) deduplicated.set(message.id, message);
      }
      signal?.throwIfAborted();
      return { id, title, messages: normalizeMessages(Array.from(deduplicated.values())), complete: true };
    }

    return {
      peek: (id) => cache?.id === id ? cache : null,
      clear() { generation++; cache = null; pending = null; },
      load(id, options = {}) {
        if (!validId(id)) return Promise.reject(new Error("No saved conversation is open."));
        if (pending?.id === id) return pending.promise;
        if (!options.force && cache?.id === id) return Promise.resolve(cache);
        const entry = { id };
        const version = ++generation;
        if (options.force) cache = null;
        entry.promise = read(id, options).then((result) => {
          if (generation === version) cache = result;
          return result;
        }).finally(() => { if (pending === entry) pending = null; });
        pending = entry;
        return entry.promise;
      }
    };
  }

  const api = { conversationId, splitMarkdown, normalizeMessages, createReader };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DesignerGPTHistory = api;
})(globalThis);
