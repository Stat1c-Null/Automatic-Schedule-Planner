// app/tests/page.tsx
"use client";

import { useState } from "react";

export default function TestPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const endpoints = [
    "/api/v1/rmp?class_code=CSE1321",
    "/api/v1/rmp?department=Computer%20Science",
    "/api/v1/rmp/tags?teacher_id=VGVhY2hlci0yMzkyNzkw",
    "/api/v1/rmp?name=Min%20Wang",
    "/api/v1/courses?program=Computer%20Science%20B.S.",
  ];

  async function runTests() {
    setLoading(true);
    const results: any[] = [];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        const data = await res.json();
        results.push({ url, data, status: res.status });
      } catch (err: any) {
        results.push({ url, error: err.message });
      }
    }

    setLogs((prev) => [...prev, ...results]);
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: "monospace", padding: 20 }}>
      <h2>API Test Runner</h2>
      <button
        onClick={runTests}
        disabled={loading}
        style={{
          padding: "6px 12px",
          background: "#222",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        {loading ? "Testing..." : "Run Tests"}
      </button>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {logs.map((item, i) => (
          <div
            key={i}
            style={{ border: "1px solid #444", padding: 10, borderRadius: 6 }}
          >
            <div style={{ marginBottom: 6, color: "#ccc" }}>
              <strong>{item.url}</strong> — Status: {item.status ?? "ERR"}
            </div>
            <pre
              style={{
                background: "#111",
                color: "#0f0",
                padding: 10,
                borderRadius: 4,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(item.data ?? item.error, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
