import Section from '../components/Section.jsx';
import { site } from '../config/site.js';

const field =
  'mt-1.5 w-full rounded-lg border border-line bg-bg px-4 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20';

// Phase 4 (P4-5): submit to POST /api/enquiries with validation and a success state.
export default function Contact() {
  return (
    <Section title="Get a free consultation" intro="Tell us about your plan. We usually call back the same day.">
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <form className="grid gap-5" onSubmit={(e) => e.preventDefault()}>
          <label className="block">
            <span className="text-sm font-medium">Name</span>
            <input className={field} name="name" autoComplete="name" required />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Phone / WhatsApp</span>
            <input className={field} name="phone" type="tel" autoComplete="tel" inputMode="tel" required />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Location of plot</span>
            <input className={field} name="location" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Message</span>
            <textarea className={field} name="message" rows={4} />
          </label>
          <button
            type="submit"
            className="justify-self-start rounded-full bg-accent px-6 py-3 font-medium text-accent-ink hover:opacity-90"
          >
            Request a call back
          </button>
        </form>
        <div className="self-start rounded-[var(--radius-card)] bg-bg-soft p-6">
          <p className="font-semibold">Visit or call</p>
          <p className="mt-2 text-ink-soft">{site.address}</p>
          <p className="mt-4">
            <a href={`tel:${site.phone}`} className="text-accent hover:underline">{site.phone}</a>
          </p>
          <p>
            <a href={`mailto:${site.email}`} className="text-accent hover:underline">{site.email}</a>
          </p>
        </div>
      </div>
    </Section>
  );
}
