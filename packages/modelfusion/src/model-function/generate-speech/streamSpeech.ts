import { FunctionOptions } from "../../core/FunctionOptions";
import { AsyncQueue } from "../../util/AsyncQueue";
import { ModelCallMetadata } from "../ModelCallMetadata";
import { executeStreamCall } from "../executeStreamCall";
import {
  SpeechGenerationModelSettings,
  StreamingSpeechGenerationModel,
} from "./SpeechGenerationModel";
import { Delta } from "../Delta";

/**
 * Stream synthesized speech from text. Also called text-to-speech (TTS).
 * Duplex streaming where both the input and output are streamed is supported.
 *
 * @see https://modelfusion.dev/guide/function/generate-speech
 *
 * @example
 * const textStream = await streamText(...);
 *
 * const speechStream = await streamSpeech({
 *   model: elevenlabs.SpeechGenerator(...),
 *   text: textStream
 * });
 *
 * for await (const speechPart of speechStream) {
 *   // ...
 * }
 *
 * @param {StreamingSpeechGenerationModel<SpeechGenerationModelSettings>} model - The speech generation model.
 * @param {AsyncIterable<string> | string} text - The text to be converted to speech. Can be a string or an async iterable of strings.
 * @param {fullResponse} [fullResponse] - Whether to return the full response with metadata.
 * @param {includeAlignment} [includeAlignment] - Whether to include alignment data in the response.
 * @param {FunctionOptions} [options] - Optional function options.
 *
 * @returns {AsyncIterableResultPromise<Delta<Uint8Array>>} An async iterable promise that contains the synthesized speech chunks.
 */
export async function streamSpeech(
  args: {
    model: StreamingSpeechGenerationModel<SpeechGenerationModelSettings>;
    text: AsyncIterable<string> | string;
    fullResponse?: false;
    includeAlignment?: boolean;
  } & FunctionOptions,
): Promise<AsyncIterable<Delta<Uint8Array>>>;
export async function streamSpeech(
  args: {
    model: StreamingSpeechGenerationModel<SpeechGenerationModelSettings>;
    text: AsyncIterable<string> | string;
    fullResponse: true;
    includeAlignment?: boolean;
  } & FunctionOptions,
): Promise<{
  speechStream: AsyncIterable<Delta<Uint8Array>>;
  metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
}>;
export async function streamSpeech({
                                     model,
                                     text,
                                     fullResponse,
                                     ...options
                                   }: {
  model: StreamingSpeechGenerationModel<SpeechGenerationModelSettings>;
  text: AsyncIterable<string> | string;
  fullResponse?: boolean;
  includeAlignment?: boolean;
} & FunctionOptions): Promise<
  | AsyncIterable<Delta<Uint8Array>>
  | {
  speechStream: AsyncIterable<Delta<Uint8Array>>;
  metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
}
> {
  let textStream: AsyncIterable<string>;

  // simulate a stream with a single value for a string input:
  if (typeof text === "string") {
    const queue = new AsyncQueue<string>();
    queue.push(text);
    queue.close();
    textStream = queue;
  } else {
    textStream = text;
  }

  const callResponse = await executeStreamCall({
    functionType: "stream-speech",
    input: text,
    model,
    options,
    startStream: async (options) =>
      model.doGenerateSpeechStreamDuplex(textStream, options),
    processDelta: (delta) => {
      return options.includeAlignment
        ? delta
        : { type: delta.type, deltaValue: delta.deltaValue };
    },

  });

  return fullResponse
    ? {
      speechStream: callResponse.value,
      metadata: callResponse.metadata,
    }
    : callResponse.value;
}
