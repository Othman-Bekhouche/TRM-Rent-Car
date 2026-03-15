import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api';

/**
 * Custom hook to handle navigation based on user role
 */
export function useRoleRedirect() {
    const navigate = useNavigate();

    const redirectAfterLogin = async () => {
        try {
            const user = await authApi.getCurrentUser();
            if (!user) {
                navigate('/login');
                return;
            }

            // Get profile from DB
            const { data: profile } = await (await import('../lib/supabase')).supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            // Get role with fallback for Sara if DB is not updated
            let userRole = profile?.role;
            if (profile?.email === 'sara.b@trmrentcar.ma') {
                userRole = 'assistant';
                // background update for DB
                (await import('../lib/supabase')).supabase.from('profiles').update({ role: 'assistant' }).eq('id', user.id).then(() => { });
            }

            if (userRole === 'super_admin') {
                navigate('/admin');
            } else if (userRole === 'admin') {
                navigate('/admin/vehicles');
            } else if (userRole === 'assistant') {
                navigate('/admin/reservations');
            } else {
                navigate('/profile');
            }
        } catch (err) {
            console.error('Redirect error:', err);
            navigate('/');
        }
    };

    return { redirectAfterLogin };
}
