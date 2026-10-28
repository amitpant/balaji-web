import { Link, useParams } from 'react-router-dom';
import Section from '../components/Section.jsx';

// Phase 4 (P4-3): load GET /api/projects/:slug and render only filled fields.
export default function ProjectDetail() {
  const { slug } = useParams();
  return (
    <Section title="Project" intro={`Details for "${slug}" will load from the API.`}>
      <Link to="/projects" className="text-accent hover:underline">
        ← All projects
      </Link>
    </Section>
  );
}
