"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { X, Send, RefreshCw, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load history on first open
  useEffect(() => {
    if (!open || loaded) return;
    (async () => {
      try {
        const res = await fetch("/api/chat/history");
        if (res.ok) {
          const data = await res.json();
          const loadedMessages = (data.messages || [])
            .filter((m: any) => m.role === "user" || m.role === "assistant")
            .map((m: any) => ({ id: m.id, role: m.role, content: m.content }));
          setMessages(loadedMessages);
        }
      } catch {
        // Silently fail — user can still send new messages
      } finally {
        setLoaded(true);
      }
    })();
  }, [open, loaded]);

  // Autoscroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Focus input when opened (L10 FIX: cleanup timeout)
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, [open]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Chat failed");
        // Revert user message if server rejected
        setMessages((prev) => prev.slice(0, -1));
        setInput(trimmed);
        return;
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.reply || "Sorry, I couldn't generate a response.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      toast.error("Network error");
      setMessages((prev) => prev.slice(0, -1));
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  }

  async function clearHistory() {
    if (!confirm("Clear all chat messages?")) return;
    try {
      const res = await fetch("/api/chat/history", { method: "DELETE" });
      if (res.ok) {
        setMessages([]);
        setLoaded(false); // M8 FIX: re-fetch next open
        toast.success("Chat cleared");
      } else {
        toast.error("Failed to clear chat");
      }
    } catch {
      toast.error("Network error");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating button (hidden when open) */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-20 right-4 z-[45] h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 flex items-center justify-center sm:bottom-6"
            aria-label="Open AI assistant"
          >
            <Bot className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel (L9 FIX: z-[60] above bottom-nav z-50, mobile height accounts for nav) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed z-[60] bottom-20 right-4 w-[calc(100vw-2rem)] max-w-sm h-[calc(100dvh-6rem)] max-h-[600px] sm:bottom-6 sm:right-6 sm:w-96 sm:h-[70vh] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 p-3 bg-card/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-heading font-semibold">PeptidePin AI</p>
                  <p className="text-[10px] text-muted-foreground">Read-only assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={clearHistory}
                    title="Clear chat"
                    aria-label="Clear chat history"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => setOpen(false)}
                  title="Close"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3 space-y-3"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <Bot className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium">Ask about your stack</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                    I can answer questions about your vials, schedules, and
                    general peptide info. I won&apos;t give medical advice.
                  </p>
                  <div className="mt-4 space-y-1.5 w-full">
                    {[
                      "How much BPC do I have left?",
                      "When will my vial run out?",
                      "What is retatrutide?",
                    ].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => setInput(sample)}
                        className="w-full text-left text-xs px-2.5 py-2 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-colors"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {renderMessageContent(msg.content)}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border/50 p-2 bg-card/30">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your peptides..."
                  rows={1}
                  disabled={sending}
                  maxLength={2000}
                  className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 max-h-24"
                  style={{ minHeight: "38px" }}
                />
                <Button
                  size="sm"
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  className="h-9 w-9 p-0 rounded-lg flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[9px] text-muted-foreground/60 mt-1 text-center">
                Not medical advice. Always consult your doctor.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Render message content with lightweight **bold** markdown.
 * Strips asterisks and renders bold spans instead of literal text.
 */
function renderMessageContent(content: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={key++} className="font-semibold">
        {match[1]}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }
  return parts;
}
