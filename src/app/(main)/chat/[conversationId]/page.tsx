"use client";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { pusherClient } from "@/lib/pusher";
import { LANGUAGES } from "@/lib/translate";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  senderId: string;
  sender: { id: string; name: string };
  originalText: string;
  messageLanguage: string;
  timestamp: string;
  translations?: { translatedText: string }[];
  translatedText?: string;
}

interface PusherMessage {
  id: string;
  senderId: string;
  senderName: string;
  originalText: string;
  messageLanguage: string;
  timestamp: string;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [messageLanguage, setMessageLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<{ name: string; email: string; preferredLanguage: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userPreferredLang = useRef("en");

  const translateMessage = useCallback(async (msg: Message): Promise<string> => {
    if (msg.messageLanguage === userPreferredLang.current) {
      return msg.originalText;
    }

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: msg.id,
          targetLanguage: userPreferredLang.current,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.translatedText;
      }
    } catch {
    }
    return msg.originalText;
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const convRes = await fetch("/api/conversations");
        if (convRes.ok) {
          const conversations = await convRes.json();
          const thisConv = conversations.find((c: { id: string }) => c.id === conversationId);
          if (thisConv) {
            const other = thisConv.participants.find(
              (p: { user: { id: string } }) => p.user.id !== session?.user?.id
            );
            if (other) setOtherUser(other.user);

            const me = thisConv.participants.find(
              (p: { user: { id: string } }) => p.user.id === session?.user?.id
            );
            if (me) userPreferredLang.current = me.user.preferredLanguage;
          }
        }

        const msgRes = await fetch(`/api/messages?conversationId=${conversationId}`);
        if (msgRes.ok) {
          const msgs: Message[] = await msgRes.json();

          const processed = await Promise.all(
            msgs.map(async (msg) => {
              if (msg.senderId === session?.user?.id) return msg;
              if (msg.translations && msg.translations.length > 0) {
                return { ...msg, translatedText: msg.translations[0].translatedText };
              }
              const translated = await translateMessage(msg);
              return { ...msg, translatedText: translated };
            })
          );

          setMessages(processed);
        }
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) fetchData();
  }, [conversationId, session?.user?.id, translateMessage]);

  useEffect(() => {
    const channel = pusherClient.subscribe(`conversation-${conversationId}`);

    channel.bind("new-message", async (data: PusherMessage) => {
      const newMsg: Message = {
        id: data.id,
        senderId: data.senderId,
        sender: { id: data.senderId, name: data.senderName },
        originalText: data.originalText,
        messageLanguage: data.messageLanguage,
        timestamp: data.timestamp,
      };

      if (data.senderId !== session?.user?.id) {
        const translated = await translateMessage(newMsg);
        newMsg.translatedText = translated;
      }

      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      pusherClient.unsubscribe(`conversation-${conversationId}`);
    };
  }, [conversationId, session?.user?.id, translateMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!newMessage.trim() || sending) return;
    setSending(true);

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          text: newMessage.trim(),
          messageLanguage,
        }),
      });
      setNewMessage("");
    } finally {
      setSending(false);
    }
  }

  async function deleteMessage(messageId: string) {
    try {
      const res = await fetch(`/api/messages?messageId=${messageId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      }
    } catch {
    }
  }

  const languageOptions = LANGUAGES.map((l) => ({
    value: l.code,
    label: l.name,
  }));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-black text-xl uppercase">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
      <div className="border-b-4 border-black bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/chat")}
            className="font-black text-2xl hover:bg-yellow px-3 py-2 border-4 border-black transition-colors"
            style={{ boxShadow: "3px 3px 0px #000" }}
          >
            ←
          </button>
          <div>
            <h2 className="font-black text-xl uppercase text-black">{otherUser?.name}</h2>
            <p className="text-xs font-bold text-black/60">{otherUser?.email}</p>
          </div>
        </div>
        <span
          className="text-xs font-black uppercase bg-lime px-3 py-2 border-4 border-black"
          style={{ boxShadow: "3px 3px 0px #000" }}
        >
          {LANGUAGES.find((l) => l.code === otherUser?.preferredLanguage)?.name || "English"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-cream">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">👋</p>
            <p className="font-black uppercase">Send a message to start chatting!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.senderId === session?.user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-4 border-4 border-black ${isOwn ? "bg-purple" : "bg-white"}`}
                style={{ boxShadow: "4px 4px 0px #000" }}
              >
                <div className="flex items-center justify-between gap-3">
                  {!isOwn && (
                    <p className="text-xs font-black uppercase tracking-wide mb-1 text-black">{msg.sender?.name}</p>
                  )}
                  {isOwn && (
                    <button
                      className="text-[10px] font-black uppercase px-2 py-1 border-2 border-black bg-yellow"
                      onClick={() => deleteMessage(msg.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className={`font-bold text-base ${isOwn ? "text-white" : "text-black"}`}>
                  {isOwn ? msg.originalText : msg.translatedText || msg.originalText}
                </p>
                {!isOwn && msg.translatedText && msg.translatedText !== msg.originalText && (
                  <p className="text-xs mt-2 text-black/50 font-bold border-t-2 border-black/20 pt-2">
                    Original: {msg.originalText}
                  </p>
                )}
                <p className={`text-xs font-black mt-2 ${isOwn ? "text-white/80" : "text-black/50"}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t-4 border-black bg-white p-4">
        <div className="flex gap-3 items-end">
          <div className="w-40">
            <Select
              id="msgLang"
              options={languageOptions}
              value={messageLanguage}
              onChange={(e) => setMessageLanguage(e.target.value)}
              label="Language"
            />
          </div>
          <div className="flex-1">
            <textarea
              className="w-full px-4 py-3 resize-none text-base font-bold border-4 border-black bg-white text-black outline-none"
              style={{ boxShadow: "4px 4px 0px #000" }}
              rows={2}
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            variant="primary"
            size="lg"
          >
            {sending ? "..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
