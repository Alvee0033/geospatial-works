type ExpenseReceiptFields = {
  receiptPhotoUrls?: unknown;
  receipt_photo_urls?: unknown;
  receiptPhotoUrl?: unknown;
  receipt_photo_url?: unknown;
  receiptUrl?: unknown;
  receipt_url?: unknown;
};

export type ExpenseReceiptGroup = {
  categoryName: string;
  categoryId?: string;
  urls: string[];
};

export function getExpenseReceiptUrls(expense: ExpenseReceiptFields): string[] {
  const raw = expense.receiptPhotoUrls ?? expense.receipt_photo_urls;
  const values = Array.isArray(raw) ? raw : [];
  const primary = expense.receiptPhotoUrl ?? expense.receipt_photo_url ?? expense.receiptUrl ?? expense.receipt_url;
  const urls = [primary, ...values]
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter((value) => /^(https?:\/\/|\/uploads\/|\/api\/v1\/uploads\/|data:image\/)/i.test(value));
  return [...new Set(urls)];
}

export function getExpenseReceiptGroups(expense: ExpenseReceiptFields & Record<string, unknown>): ExpenseReceiptGroup[] {
  const items = expense.categoryItems ?? expense.category_items;
  if (Array.isArray(items)) {
    const groups = items.flatMap((item) => {
      if (!item || typeof item !== 'object') return [];
      const line = item as Record<string, unknown>;
      const urls = Array.isArray(line.receiptPhotoUrls)
        ? line.receiptPhotoUrls
        : Array.isArray(line.receipt_photo_urls) ? line.receipt_photo_urls : [];
      const validUrls = urls.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
      return validUrls.length ? [{
        categoryName: String(line.categoryName ?? line.category_name ?? 'Expense'),
        categoryId: String(line.categoryId ?? line.category_id ?? ''),
        urls: [...new Set(validUrls)],
      }] : [];
    });
    if (groups.length) return groups;
  }

  const metadata = expense.receiptPhotos ?? expense.receipt_photos;
  if (Array.isArray(metadata)) {
    const grouped = new Map<string, ExpenseReceiptGroup>();
    for (const raw of metadata) {
      if (!raw || typeof raw !== 'object') continue;
      const item = raw as Record<string, unknown>;
      const url = item.url ?? item.imageUrl ?? item.image_url;
      if (typeof url !== 'string' || !url.trim()) continue;
      const categoryName = String(item.categoryName ?? item.category_name ?? 'Receipt');
      const categoryId = String(item.categoryId ?? item.category_id ?? '');
      const key = `${categoryId}:${categoryName}`;
      const group = grouped.get(key) ?? { categoryName, categoryId, urls: [] };
      if (!group.urls.includes(url)) group.urls.push(url);
      grouped.set(key, group);
    }
    if (grouped.size) return [...grouped.values()];
  }

  const urls = getExpenseReceiptUrls(expense);
  return urls.length ? [{ categoryName: 'Receipt', urls }] : [];
}

export function getExpenseCategoryTone(categoryName: string): string {
  const category = categoryName.toLocaleLowerCase();
  if (category.includes('transport')) return 'border-teal-200 bg-teal-50 text-teal-800';
  if (category.includes('food') || category.includes('meal')) return 'border-amber-200 bg-amber-50 text-amber-800';
  if (category.includes('accommod') || category.includes('hotel')) return 'border-violet-200 bg-violet-50 text-violet-800';
  if (category.includes('equip') || category.includes('hardware')) return 'border-indigo-200 bg-indigo-50 text-indigo-800';
  if (category.includes('office')) return 'border-sky-200 bg-sky-50 text-sky-800';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}
