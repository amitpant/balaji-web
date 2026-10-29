// Contact links built only from verified numbers the owner saved in the admin panel.

export const telHref = (phone) => (phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null);

export function whatsappHref(number, message) {
  if (!number) return null;
  const digits = String(number).replace(/\D/g, '');
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export function formatCost(cost, t, num) {
  if (cost?.amountInr > 0) {
    const n = cost.amountInr;
    return n >= 10000000
      ? t('facts.crore', { n: num(n / 10000000, { maximumFractionDigits: 2 }) })
      : t('facts.lakh', { n: num(n / 100000, { maximumFractionDigits: 1 }) });
  }
  return cost?.onRequest ? t('facts.onRequest') : null;
}

export function monthYear(ym, lang) {
  if (!ym) return null;
  const d = new Date(`${ym.slice(0, 7)}-01T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric' });
}
