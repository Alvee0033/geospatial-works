export function mergeSettledData<T extends Record<string, unknown[]>>(
  previous: T,
  settled: Record<string, PromiseSettledResult<unknown>>,
): { data: T; failed: string[] };
