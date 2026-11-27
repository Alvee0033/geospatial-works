export interface OrderedRecord {
  id: string;
  title: string;
  sortOrder: number;
}

export function orderIdsAfterMove(items: OrderedRecord[], movedId: string, position: number): string[] {
  const ids = [...items]
    .filter((item) => item.id !== movedId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
    .map((item) => item.id);
  ids.splice(Math.max(0, Math.min(position - 1, ids.length)), 0, movedId);
  return ids;
}
