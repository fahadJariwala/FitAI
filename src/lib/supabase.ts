import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xbfxdcrklrhczknpiior.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiZnhkY3JrbHJoY3prbnBpaW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NDkwOTgsImV4cCI6MjA1NjEyNTA5OH0.4s5hQK3qST1ryaoB-Ts38P77W6l-tZfSjy4w07kMpjA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
}); 