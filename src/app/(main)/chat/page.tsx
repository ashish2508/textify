"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Conversation {
  id: string;
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

  function getOtherUser(conv: Conversation) {
    return conv.participants.find((p) => p.user.id !== session?.user?.id)?.user;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black uppercase">Chats</h1>
        <Button onClick={() => setShowNew(!showNew)} variant="accent">
          + New Chat
        </Button>
      </div>

      {showNew && (
        <Card className="mb-6">
          <h3 className="font-black uppercase mb-3">Start New Conversation</h3>
          {error && (
            <div className="bg-primary/10 neo-border p-2 mb-3 font-bold text-sm text-primary">
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
          <p className="font-bold text-lg">Loading conversations...</p>
        </div>
      ) : conversations.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-6xl mb-4">💬</p>
          <p className="font-bold text-lg">No conversations yet</p>
          <p className="text-sm mt-2">Start a new chat to begin messaging!</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {conversations.map((conv) => {
            const other = getOtherUser(conv);
            const lastMsg = conv.messages[0];

            return (
              <Link key={conv.id} href={`/chat/${conv.id}`}>
                <div className="neo-card p-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_var(--border)] transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-lg">{other?.name}</h3>
                      <p className="text-sm text-fg/60 font-medium">
                        {other?.email}
                      </p>
                    </div>
                    {lastMsg && (
                      <span className="text-xs font-bold bg-bg px-2 py-1 neo-border">
                        {new Date(lastMsg.timestamp).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {lastMsg && (
                    <p className="mt-2 text-sm font-medium truncate">
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
