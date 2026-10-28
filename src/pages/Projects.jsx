import { useState } from 'react';
import Section from '../components/Section.jsx';

const tabs = [
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'completed', label: 'Completed' },
];

export default function Projects() {
  const [tab, setTab] = useState('completed');

  return (
    <Section title="Our projects" intro="Real homes and buildings, with the details that matter.">
      <div role="tablist" className="inline-flex rounded-full border border-line p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-5 py-2 text-[15px] ${tab === t.id ? 'bg-ink text-bg' : 'text-ink-soft hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="mt-10 rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center text-ink-soft">
        {tab === 'ongoing' ? 'Ongoing' : 'Completed'} projects will appear here once added in the admin panel.
      </p>
    </Section>
  );
}
