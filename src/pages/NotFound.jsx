import { Link } from 'react-router-dom';
import Section from '../components/Section.jsx';

export default function NotFound() {
  return (
    <Section title="Page not found" intro="The page you are looking for does not exist.">
      <Link to="/" className="text-accent hover:underline">
        Go to the home page
      </Link>
    </Section>
  );
}
