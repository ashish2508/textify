import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: session.user.id },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, preferredLanguage: true },
            },
          },
        },
        messages: {
          where: {
            deletions: {
              none: { userId: session.user.id },
            },
          },
          orderBy: { timestamp: "desc" },
          take: 1,
          select: {
            originalText: true,
            timestamp: true,
            senderId: true,
          },
        },
        pins: {
          where: { userId: session.user.id },
          select: { createdAt: true },
        },
      },
    });

    const shaped = conversations.map((conv) => {
      const pinnedAt = conv.pins[0]?.createdAt ?? null;
      const lastMessageAt = conv.messages[0]?.timestamp ?? conv.createdAt;
      return {
        ...conv,
        pinned: Boolean(pinnedAt),
        pinnedAt,
        lastMessageAt,
      };
    });

    shaped.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      const aPin = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0;
      const bPin = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0;
      if (aPin !== bPin) return bPin - aPin;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });

    return NextResponse.json(shaped);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { participantEmail } = await req.json();

    if (!participantEmail) {
      return NextResponse.json(
        { error: "Participant email is required" },
        { status: 400 }
      );
    }

    const otherUser = await prisma.user.findUnique({
      where: { email: participantEmail.toLowerCase() },
    });

    if (!otherUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (otherUser.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot create conversation with yourself" },
        { status: 400 }
      );
    }

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: otherUser.id } } },
        ],
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: session.user.id },
            { userId: otherUser.id },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, preferredLanguage: true },
            },
          },
        },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
