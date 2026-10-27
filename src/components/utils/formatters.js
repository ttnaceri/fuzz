export function formatPrice(amount, currency = 'USD') {
  if (amount === 0 || amount === '0') return 'Free';
  if (amount == null || isNaN(amount)) return 'N/A';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(Number(amount));
  } catch {
    return `$${Number(amount).toFixed(2)}`;
  }
}

export function formatDate(input) {
  if (!input) return '—';
  try {
    const d = new Date(input);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function formatRelativeTime(input) {
  if (!input) return '—';
  const d = new Date(input);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return formatDate(input);
}

export function truncate(str, max = 100) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}