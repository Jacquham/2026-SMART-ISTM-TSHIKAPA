import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold text-navy-700">Page introuvable</h1>
      <Link className="text-navy-500 underline" to="/">Retour au tableau de bord</Link>
    </div>
  );
}
