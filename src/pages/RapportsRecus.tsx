import { useAuth } from '../lib/auth';
import { useNotifications } from '../lib/notifications';
import RapportsSgac from '../components/chef/RapportsSgac';

export default function RapportsRecus() {
  const { aRole } = useAuth();
  const { total, recharger } = useNotifications();
  const autorise = aRole('sgac') || aRole('dg');

  if (!autorise) {
    return (
      <div className="card p-5">
        <h1 className="text-lg font-semibold text-navy-800">Accès réservé</h1>
        <p className="mt-1 text-sm text-slate-600">Cette page est réservée au SGAC et à la Direction générale.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-brand-gradient p-5 text-white shadow-card sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-400">Espace académique</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Rapports des sections</h1>
        <p className="mt-1 text-sm text-navy-100">
          {total > 0 ? `${total} nouveau(x) rapport(s) à lire.` : 'Aucun nouveau rapport pour le moment.'}
        </p>
      </section>

      <RapportsSgac onNotification={recharger} />
    </div>
  );
}
