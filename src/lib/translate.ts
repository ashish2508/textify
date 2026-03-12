export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<string> {
  // Use free Google Translate web endpoint (no API key needed)
  const params = new URLSearchParams({
    client: "gtx",
    sl: sourceLanguage || "auto",
    tl: targetLanguage,
    dt: "t",
    q: text,
  });

  const res = await fetch(
    `https://translate.googleapis.com/translate_a/single?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error(`Translation error: ${res.statusText}`);
  }

  const data = await res.json();
  // Response format: [[["translated text","original text",...],...],...]
  const translated = data[0]
    ?.map((segment: [string]) => segment[0])
    .join("");

  return translated || text;
}

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "bn", name: "Bengali" },
] as const;
