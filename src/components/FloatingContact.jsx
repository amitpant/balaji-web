import { useT } from '../i18n/index.jsx';
import { track } from '../lib/pixel.js';
import { WhatsAppIcon, Svg, Icon } from './ui.jsx';

// Shows call/WhatsApp only when the owner has saved verified numbers.
export default function FloatingContact({ tel, wa }) {
  const { t } = useT();
  if (!tel && !wa) return null;
  return (
    <div className="fixed right-4 bottom-4 z-30 flex flex-col items-end gap-3">
      {tel && (
        <a
          href={tel}
          aria-label={t('cta.callUs')}
          onClick={() => track('Contact', { method: 'call' })}
          className="grid h-13 w-13 place-items-center rounded-full border border-line bg-white text-charcoal shadow-lg hover:bg-sage"
        >
          <Svg>{Icon.phone}</Svg>
        </a>
      )}
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          aria-label={t('cta.chat')}
          onClick={() => track('Contact', { method: 'whatsapp' })}
          className="grid h-13 w-13 place-items-center rounded-full bg-[#1f8a4c] text-white shadow-lg hover:bg-[#18723e]"
        >
          <WhatsAppIcon />
        </a>
      )}
    </div>
  );
}
