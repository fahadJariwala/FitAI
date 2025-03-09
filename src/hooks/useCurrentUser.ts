import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    // Add any other user properties from your profiles table
}

export const useCurrentUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();

        // Subscribe to auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                await fetchUser();
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => {
            if (authListener && authListener.subscription) {
                authListener.subscription.unsubscribe();
            }
        };
    }, []);

    const fetchUser = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                // Fetch additional user details from the profiles table
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (error) {
                    throw error;
                }

                if (profile) {
                    setUser({
                        id: authUser.id,
                        email: authUser.email!,
                        full_name: profile.full_name,
                        avatar_url: profile.avatar_url,
                        // Add other profile fields as needed
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    };

    return { user, loading };
}; 