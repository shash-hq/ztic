// Currency — always JPY for now, extensible later
export const formatPrice = (amount, currency = 'JPY') =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount);

// Date → "24 AUG 2025"
export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

// Date → "19:00"
export const formatTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

// "the-brutalist-symphony" → "The Brutalist Symphony"
export const unslugify = (slug) =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Slugify in reverse for navigation
export const slugify = (str) =>
  str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

// Row index → Greek letter label
const ROW_LABELS = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ'];
export const rowLabel = (index) => ROW_LABELS[index] ?? String(index + 1);
