/** Merge successful live API results while retaining the last real snapshot for failed sources. */
export function mergeSettledData(previous, settled) {
  const data = { ...previous };
  const failed = [];

  for (const [key, result] of Object.entries(settled)) {
    if (result.status === 'fulfilled') {
      data[key] = Array.isArray(result.value) ? result.value : [];
    } else {
      failed.push(key);
    }
  }

  return { data, failed };
}
