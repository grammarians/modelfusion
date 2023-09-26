import { ModelCallMetadata } from "./executeCall.js";

export class AsyncIterableResultPromise<T> extends Promise<AsyncIterable<T>> {
  private outputPromise: Promise<AsyncIterable<T>>;

  constructor(
    private fullPromise: Promise<{
      output: AsyncIterable<T>;
      metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
    }>
  ) {
    super((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolve(null as any); // we override the resolve function
    });

    this.outputPromise = fullPromise.then((result) => result.output);
  }

  asFullResponse(): Promise<{
    output: AsyncIterable<T>;
    metadata: Omit<ModelCallMetadata, "durationInMs" | "finishTimestamp">;
  }> {
    return this.fullPromise;
  }

  override then<TResult1 = AsyncIterable<T>, TResult2 = never>(
    onfulfilled?:
      | ((value: AsyncIterable<T>) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): Promise<TResult1 | TResult2> {
    return this.outputPromise.then(onfulfilled, onrejected);
  }

  override catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | undefined
      | null
  ): Promise<AsyncIterable<T> | TResult> {
    return this.outputPromise.catch(onrejected);
  }

  override finally(
    onfinally?: (() => void) | undefined | null
  ): Promise<AsyncIterable<T>> {
    return this.outputPromise.finally(onfinally);
  }
}
