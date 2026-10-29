import { useState } from 'react';
import Section from '../components/Section.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { categories } from '../data/sampleProjects.js';
import { useAllProjects } from '../api/hooks.js';

const tabs = [
  { id: 'completed', label: 'Completed' },
  { id: 'ongoing', label: 'Ongoing' },
];

export default function Projects() {
  const [tab, setTab] = useState('completed');
  const [category, setCategory] = useState('all');
  const { projects, isLoading } = useAllProjects();

  const inTab = projects.filter((p) => p.status === tab);
  const usedCategories = categories.filter((c) => c.id === 'all' || projects.some((p) => p.category === c.id));
  const list = inTab.filter((p) => category === 'all' || p.category === category);

  return (
    <Section title="Our projects" intro="Real homes and buildings, with the details that matter.">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" className="inline-flex self-start rounded-full border border-line p-1">
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
        {usedCategories.length > 2 && (
          <div className="flex flex-wrap gap-2">
            {usedCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                aria-pressed={category === c.id}
                className={`rounded-full border px-4 py-1.5 text-sm ${
                  category === c.id ? 'border-accent bg-accent/10 text-accent' : 'border-line text-ink-soft hover:text-ink'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <p className="mt-10 text-ink-soft">Loading projects…</p>
      ) : list.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center text-ink-soft">
          No {tab} projects{category !== 'all' ? ' in this category' : ''} yet.
        </p>
      )}
    </Section>
  );
}
