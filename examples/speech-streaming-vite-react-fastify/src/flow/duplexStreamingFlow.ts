import { elevenlabs, openai, streamSpeech, streamText } from "modelfusion";
import { duplexStreamingFlowSchema } from "./duplexStreamingFlowSchema";
import { DefaultFlow } from "modelfusion-experimental/fastify-server";

export const duplexStreamingFlow = new DefaultFlow({
  schema: duplexStreamingFlowSchema,
  async process({ input, run }) {
    const textStream = await streamText({
      model: openai
        .ChatTextGenerator({
          model: "gpt-4",
          temperature: 0.7,
          maxGenerationTokens: 1000,
        })
        .withTextPrompt(),

      prompt: input.prompt,
    });

    const speechStream = await streamSpeech({
      model: elevenlabs.SpeechGenerator({
        model: "eleven_turbo_v2",
        voice: "pNInz6obpgDQGcFmaJgB", // Adam
        optimizeStreamingLatency: 1,
        voiceSettings: {
          stability: 1,
          similarityBoost: 0.35,
        },
        generationConfig: {
          chunkLengthSchedule: [50, 90, 120, 150, 200],
        },
      }),
      text: textStream,
      includeAlignment: true,
    });

    // Run in parallel:
    await Promise.allSettled([
      (async () => {
        // stream text to client:
        for await (const textPart of textStream) {
          run.publishEvent({ type: "text-chunk", delta: textPart });
        }
      })(),

      (async () => {
        for await (const speechPart of speechStream) {
          // stream audio to client
          if (speechPart.type === "delta") {
            run.publishEvent({
              type: "speech-chunk",
              base64Audio: Buffer.from(speechPart.deltaValue).toString("base64"),
            });

            // stream alignment data to client
            if (speechPart.alignmentData) {
              run.publishEvent({
                type: "alignment-chunk",
                alignmentData: speechPart.alignmentData,
              });
            }
          }
        }
      })(),
    ]);
  },
});
