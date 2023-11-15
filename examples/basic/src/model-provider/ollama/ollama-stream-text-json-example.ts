import dotenv from "dotenv";
import { OllamaTextGenerationModel, streamText } from "modelfusion";

dotenv.config();

async function main() {
  const textStream = await streamText(
    new OllamaTextGenerationModel({
      model: "mistral",
      maxCompletionTokens: 500,
      format: "json",
    }),
    "Generate 3 character descriptions for a fantasy role playing game. " +
      "Respond using JSON."
  );

  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
}

main().catch(console.error);