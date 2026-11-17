import { test } from "vitest";
import { detectJsonStreamFormat, parseJsonResponse } from "./index.js";

type Value = { value: number };

test("parses an application/json-seq response", async ({ expect }) => {
  const response = new Response(`\u001e{"value":1}\n\u001e{"value":2}\n`, {
    headers: { "content-type": "application/json-seq" },
  });
  const array = await Array.fromAsync(parseJsonResponse<Value>(response));
  expect(array).toEqual([{ value: 1 }, { value: 2 }]);
});

test("parses an application/x-ndjson response with a charset parameter", async ({ expect }) => {
  const response = new Response(`{"value":1}\n{"value":2}\n`, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8" },
  });
  const array = await Array.fromAsync(parseJsonResponse<Value>(response));
  expect(array).toEqual([{ value: 1 }, { value: 2 }]);
});

test("parses an application/jsonl response", async ({ expect }) => {
  const response = new Response(`{"value":1}\n`, {
    headers: { "content-type": "application/jsonl" },
  });
  const array = await Array.fromAsync(parseJsonResponse<Value>(response));
  expect(array).toEqual([{ value: 1 }]);
});

test("format option overrides content-type detection", async ({ expect }) => {
  const response = new Response(`{"value":1}\n`, {
    headers: { "content-type": "text/plain" },
  });
  const array = await Array.fromAsync(parseJsonResponse<Value>(response, { format: "jsonl" }));
  expect(array).toEqual([{ value: 1 }]);
});

test("throws TypeError for an unsupported content-type", ({ expect }) => {
  const response = new Response(`{"value":1}\n`, {
    headers: { "content-type": "text/plain" },
  });
  expect(() => parseJsonResponse<Value>(response)).toThrow(TypeError);
});

test("throws TypeError when the content-type header is missing", ({ expect }) => {
  const response = new Response(`{"value":1}\n`);
  response.headers.delete("content-type");
  expect(() => parseJsonResponse<Value>(response)).toThrow(TypeError);
});

test("throws TypeError when the response has no body", ({ expect }) => {
  const response = new Response(null, {
    headers: { "content-type": "application/json-seq" },
  });
  expect(() => parseJsonResponse<Value>(response)).toThrow(TypeError);
});

test("detectJsonStreamFormat detects supported media types", ({ expect }) => {
  expect(detectJsonStreamFormat("application/json-seq")).toBe("json-seq");
  expect(detectJsonStreamFormat("Application/JSON-Seq; charset=utf-8")).toBe("json-seq");
  expect(detectJsonStreamFormat("application/jsonl")).toBe("jsonl");
  expect(detectJsonStreamFormat("application/x-ndjson")).toBe("jsonl");
  expect(detectJsonStreamFormat("application/json")).toBeUndefined();
  expect(detectJsonStreamFormat(null)).toBeUndefined();
});
