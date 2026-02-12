// Simple local authentication system
const getUsers = () => {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem('nexia_users') || '[]');
    } catch {
        return [];
    }
};

const saveUsers = (users: any[]) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('nexia_users', JSON.stringify(users));
    }
};

const getCurrentUser = () => {
    if (typeof window === 'undefined') return null;
    try {
        return JSON.parse(localStorage.getItem('nexia_current_user') || 'null');
    } catch {
        return null;
    }
};

const setCurrentUser = (user: any) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('nexia_current_user', JSON.stringify(user));
    }
};

export const supabase = {
    auth: {
        signUp: async ({ email, password }: any) => {
            const users = getUsers();
            const exists = users.find((u: any) => u.email === email);
            if (exists) {
                return { data: null, error: { message: 'User already registered' } };
            }
            const newUser = { id: Date.now().toString(), email, password };
            users.push(newUser);
            saveUsers(users);
            setCurrentUser(newUser);
            return { data: { user: newUser }, error: null };
        },
        signInWithPassword: async ({ email, password }: any) => {
            const users = getUsers();
            const user = users.find((u: any) => u.email === email && u.password === password);
            if (!user) {
                return { data: null, error: { message: 'Invalid email or password' } };
            }
            setCurrentUser(user);
            return { data: { user }, error: null };
        },
        signInWithOAuth: async () => {
            const googleUser = { id: 'google-' + Date.now(), email: 'google@nexia.ai', provider: 'google' };
            setCurrentUser(googleUser);
            return { data: { url: null }, error: null };
        },
        signOut: async () => {
            setCurrentUser(null);
            return { error: null };
        },
        getSession: async () => {
            const user = getCurrentUser();
            return { data: { session: user ? { user } : null }, error: null };
        },
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    }
};
