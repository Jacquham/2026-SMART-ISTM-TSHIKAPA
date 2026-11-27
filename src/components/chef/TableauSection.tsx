import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth';

// Nombre de notifications en attente :
// - SGAC : rapports de sections non encore lus ;
// - chef de section : réponses du SGAC non encore lues.
export function useNotifications(): { total: number; recharger: () => void } {
  const { aRole, session } = useAuth();
  const [total, setTotal] = useState(0);
  const estSgac = aRole('sgac');
  const estChef = aRole('chef_section');
  const connecte = Boolean(session);

  const recharger = useCallback(async () => {
    if (!connecte) {
      setTotal(0);
      return;
    }
    let somme = 0;
    if (estSgac) {
      const { count } = await supabase
        .from('rapports')
        .select('id', { count: 'exact', head: true })
        .is('lu_le', null);
      somme += count ?? 0;
    }
    if (estChef) {
      const { count } = await supabase
        .from('reponses_rapport')
        .select('id', { count: 'exact', head: true })
        .eq('lue', false);
      somme += count ?? 0;
    }
    setTotal(somme);
  }, [connecte, estSgac, estChef]);

  useEffect(() => {
    void recharger();
    const minuteur = window.setInterval(() => void recharger(), 60000);
    return () => window.clearInterval(minuteur);
  }, [recharger]);

  return { total, recharger };
                }
