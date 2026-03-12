"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Conversation {
  id: string;
  pinned?: boolean;
  pinnedAt?: string | null;
  participants: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];
  messages: {
    originalText: string;
    timestamp: string;
    senderId: string;
  }[];
}

export default function ChatListPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function createConversation() {
    setError("");
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantEmail: newEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setNewEmail("");
      setShowNew(false);
      fetchConversations();
    } catch {
      setError("Failed to create conversation");
    }
  }

  async function togglePin(conversationId: string, isPinned: boolean) {
    try {
      await fetch("/api/conversations/pin", {
        method: isPinned ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      fetchConversations();
    } catch {
    }
  }

  function getOtherUser(conv: Conversation) {
    return conv.participants.find((p) => p.user.id !== session?.user?.id)?.user;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black uppercase">Chats</h1>
        <Button onClick={() => setShowNew(!showNew)} variant="accent">
          + New Chat
        </Button>
      </div>

      {showNew && (
        <Card className="mb-6">
          <h3 className="font-black uppercase mb-4 text-lg">Start New Conversation</h3>
          {error && (
            <div className="p-3 mb-4 font-black text-sm border-4 border-black bg-red text-white">
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter user's email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <Button onClick={createConversation} variant="secondary">
              Start
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="font-black text-xl uppercase">Loading...</p>
        </div>
      ) : conversations.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-6xl mb-4">💬</p>
          <p className="font-black text-xl uppercase">No conversations yet</p>
          <p className="text-sm font-bold mt-2">Start a new chat to begin messaging!</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {conversations.map((conv) => {
            const other = getOtherUser(conv);
            const lastMsg = conv.messages[0];

            return (
              <Link key={conv.id} href={`/chat/${conv.id}`}>
                <div
                  className="p-5 border-4 border-black bg-white cursor-pointer transition-all hover:translate-x-0.75 hover:translate-y-0.75 hover:shadow-[3px_3px_0px_#000]"
                  style={{ boxShadow: "6px 6px 0px #000" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-xl uppercase text-black">{other?.name || "Unknown"}</h3>
                      <p className="text-sm font-bold text-black/60">
                        {other?.email || "No email"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {conv.pinned && (
                        <span className="text-xs font-black px-2 py-1 border-4 border-black uppercase bg-lime">
                          Pinned
                        </span>
                      )}
                      {lastMsg && (
                        <span className="text-xs font-black px-3 py-2 border-4 border-black uppercase bg-teal">
                          {new Date(lastMsg.timestamp).toLocaleDateString()}
                        </span>
                      )}
                      <button
                        className="text-xs font-black uppercase px-3 py-2 border-4 border-black bg-yellow"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePin(conv.id, Boolean(conv.pinned));
                        }}
                      >
                        {conv.pinned ? "Unpin" : "Pin"}
                      </button>
                    </div>
                  </div>
                  {lastMsg && (
                    <p className="mt-3 text-sm font-bold truncate text-black/80 bg-yellow/30 p-2 border-2 border-black">
                      {lastMsg.senderId === session?.user?.id ? "You: " : ""}
                      {lastMsg.originalText}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
