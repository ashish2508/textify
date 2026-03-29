import { auth } from "@/lib/auth";
import { translateText } from "@/lib/translate";
import { NextRequest, NextResponse } from "next/server";

function toSimpleEnglish(text: string): string {
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();

  if (!cleaned) return "";

  const sentenceCased = cleaned[0].toUpperCase() + cleaned.slice(1);
  return /[.!?]$/.test(sentenceCased) ? sentenceCased : `${sentenceCased}.`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transcript, sourceLanguage } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "transcript is required" },
        { status: 400 }
      );
    }

    const trimmedTranscript = transcript.trim();
    if (!trimmedTranscript) {
      return NextResponse.json(
        { error: "transcript is required" },
        { status: 400 }
      );
    }

    const translated = await translateText(
      trimmedTranscript,
      "en",
      typeof sourceLanguage === "string" && sourceLanguage ? sourceLanguage : undefined
    );

    const simplifiedText = toSimpleEnglish(translated);

    return NextResponse.json({ simplifiedText });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
