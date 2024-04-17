import dotenv from "dotenv";
import { openai, elevenlabs, generateText, streamSpeech } from "modelfusion";
import fs from "node:fs";

dotenv.config();

async function main() {
  const text = await generateText({
    model: openai.CompletionTextGenerator({
      model: "gpt-3.5-turbo-instruct",
      temperature: 0.7,
      maxGenerationTokens: 100,
    }),
    prompt: "Write a short story about a robot learning to love:\n\n",
  });

  const speechStream = await streamSpeech({
    model: elevenlabs.SpeechGenerator({
      voice: "pNInz6obpgDQGcFmaJgB", // Adam
      voiceSettings: {
        stability: 1,
        similarityBoost: 0.35,
      },
    }),
    text,
  });

  // delete output file if it already exists:
  if (fs.existsSync("./stream-text-example.mp3")) {
    fs.rmSync("./stream-text-example.mp3");
  }

  let counter = 0;
  for await (const speechPart of speechStream) {
    counter++;
    console.log(`Writing part ${counter}...`);
    if (speechPart.type === "delta") {
      fs.appendFileSync("./stream-text-example.mp3", speechPart.deltaValue);
    }
  }
}

main().catch(console.error);
