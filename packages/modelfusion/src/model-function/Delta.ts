export type Delta<T> =
  | {
  type: "delta";
  deltaValue: T;
  alignmentData?: {
    chars: string[];
    charStartTimesMs: number[];
    charDurationsMs: number[];
  };
}
  | {
  type: "error";
  error: unknown;
};