"use client";

import React, { useEffect, useRef, useState } from "react";

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hi! Ask anything about loans or eligibility. 👋" },
    ]);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (open) {
            scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages, open]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || sending) return;
        setInput("");

        const nextMessages = [...messages, { role: "user", content: text }];
        setMessages(nextMessages);
        setSending(true);

        try {
            const res = await fetch("/api/rag-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    history: nextMessages.map(({ role, content }) => ({ role, content })),
                }),
            });

            if (!res.ok) {
                const errText = (await res.text().catch(() => "")) || `Error ${res.status}`;
                setMessages((m) => [
                    ...m,
                    { role: "assistant", content: `Sorry, I couldn't fetch a reply. ${errText}` },
                ]);
            } else {
                const data = await res.json().catch(() => ({}));
                const reply =
                    data.reply || data.answer || data.output ||
                    "I couldn't find an answer. Please try rephrasing your question.";
                setMessages((m) => [...m, { role: "assistant", content: reply }]);
            }
        } catch (_e) {
            setMessages((m) => [
                ...m,
                { role: "assistant", content: "Network error reaching the chat service." },
            ]);
        } finally {
            setSending(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Toggle button */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="fixed bottom-4 right-4 z-50 rounded-full bg-indigo-600 p-3 text-white shadow-lg hover:brightness-95 focus:outline-none"
                aria-label={open ? "Close chat" : "Open chat"}
            >
                {open ? (
                    // Close (X)
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                ) : (
                    // Chat bubble
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                            d="M21 12c0 4.418-4.03 8-9 8-1.016 0-1.995-.14-2.91-.4L3 21l1.53-3.57C3.57 16.14 3 14.63 3 13c0-4.418 4.03-8 9-8s9 3.582 9 7z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </button>

            {/* Panel */}
            {open && (
                <div className="fixed bottom-20 right-4 z-50 w-[92vw] max-w-[360px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                        <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100">FinFlow Assistant</div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Beta</span>
                    </div>

                    <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto px-3 py-3">
                        {messages.map((m, i) => (
                            <div key={i} className={"mb-2 flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
                                <div
                                    className={
                                        "max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm " +
                                        (m.role === "user"
                                            ? "bg-indigo-600 text-white"
                                            : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100")
                                    }
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}

                        {sending && (
                            <div className="mb-2 flex justify-start">
                                <div className="max-w-[80%] rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                                    Thinking…
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
                        <div className="flex items-end gap-2">
                            <textarea
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={onKeyDown}
                                className="min-h-[36px] flex-1 resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                placeholder="Ask about loans, eligibility, EMI, etc."
                            />
                            <button
                                onClick={sendMessage}
                                disabled={sending || !input.trim()}
                                className="flex h-9 items-center rounded-md bg-indigo-600 px-3 text-sm font-medium text-white disabled:opacity-60"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
