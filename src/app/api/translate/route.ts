import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { translateText } from "@/lib/translate";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, targetLanguage } = await req.json();

    if (!messageId || !targetLanguage) {
      return NextResponse.json(
        { error: "messageId and targetLanguage are required" },
        { status: 400 }
      );
    }

    // Check if translation already cached
    const existingTranslation = await prisma.messageTranslation.findUnique({
      where: {
        messageId_userId: {
          messageId,
          userId: session.user.id,
        },
      },
    });

    if (existingTranslation) {
      return NextResponse.json({
        translatedText: existingTranslation.translatedText,
      });
    }

    // Fetch the original message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Translate
    const translatedText = await translateText(
      message.originalText,
      targetLanguage,
      message.messageLanguage
    );

    // Cache translation
    const translation = await prisma.messageTranslation.create({
      data: {
        messageId,
        userId: session.user.id,
        translatedText,
      },
    });

    return NextResponse.json({
      translatedText: translation.translatedText,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
