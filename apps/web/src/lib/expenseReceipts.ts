type ExpenseReceiptFields = {
  receiptPhotoUrls?: unknown;
  receipt_photo_urls?: unknown;
  receiptPhotoUrl?: unknown;
  receipt_photo_url?: unknown;
  receiptUrl?: unknown;
  receipt_url?: unknown;
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
