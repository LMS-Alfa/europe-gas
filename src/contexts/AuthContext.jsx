import { createContext, useState, useContext, useEffect } from 'react';
import supabase from '../utils/supabaseClient';
import { getProfileByPhone, getAllProfiles } from '../utils/api';
import { directAuth } from '../utils/userManagement';

// Keep mock users for development/testing until Supabase is fully set up
const mockUsers = [
  {
    id: 1,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@europegas.com',
    phone: '+1 (555) 123-4567',
    password: 'admin123',
    enteredParts: 0,
    role: 'admin'
  },
  {
    id: 2,
    firstName: 'Regular',
    lastName: 'User',
    email: 'user@europegas.com',
    phone: '+1 (555) 987-6543',
    password: 'user123',
    enteredParts: 5,
    role: 'user'
  }
];

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profiles, setProfiles] = useState([]);

  // Fetch all profiles on mount for development
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await getAllProfiles();
        setProfiles(data || []);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };
    
    fetchProfiles();
  }, []);

  useEffect(() => {
    // Check the current auth session
    const checkSession = async () => {
      try {
        // First check local storage for development session
        const localAuth = localStorage.getItem('europegas_auth');
        if (localAuth) {
          const authData = JSON.parse(localAuth);
          setCurrentUser(authData.profile);
          setLoading(false);
          return;
        }

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          // Get user data including role from users table
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (userError) {
            throw userError;
          }
          
          setCurrentUser({
            id: session.user.id,
            firstName: userData?.firstName || '',
            lastName: userData?.lastName || '',
            phone: userData?.phone || session.user.phone,
            email: userData?.email || '',
            role: userData?.role || 'user',
            enteredParts: userData?.enteredParts || 0
          });
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Get user data from the database
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!userError) {
            setCurrentUser({
              id: session.user.id,
              firstName: userData?.firstName || '',
              lastName: userData?.lastName || '',
              phone: userData?.phone || session.user.phone,
              email: userData?.email || '',
              role: userData?.role || 'user',
              enteredParts: userData?.enteredParts || 0
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      }
    );

    checkSession();

    // Cleanup the subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Phone authentication functions
  const loginWithPhone = async ({ phone, password }) => {
    setError(null);
    
    try {
      // Use direct authentication against profiles table
      const authResult = await directAuth(phone, password);
      
      if (!authResult.success) {
        // Try mock users as fallback
        const mockUser = mockUsers.find(
          u => u.phone === phone && u.password === password
        );
        
        if (mockUser) {
          const { password, ...userWithoutPassword } = mockUser;
          setCurrentUser(userWithoutPassword);
          return { success: true, user: userWithoutPassword };
        }
        
        throw new Error(authResult.error || 'Authentication failed');
      }
      
      // Set the current user
      setCurrentUser(authResult.user);
      
      return { success: true, user: authResult.user };
    } catch (error) {
      setError(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };
  
  const verifyOTP = async (phone, otp) => {
    setError(null);
    
    try {
      // In development mode, we'll just return success
      // This function is kept for API compatibility
      return { success: true, message: 'Verification not needed in development mode' };
    } catch (error) {
      setError(error.message || 'Verification failed');
      return { success: false, error: error.message };
    }
  };
  
  const logout = async () => {
    try {
      // Clear localStorage auth
      localStorage.removeItem('europegas_auth');
      
      // Also sign out from Supabase if we were using it
      await supabase.auth.signOut();
      
      setCurrentUser(null);
      return { success: true };
    } catch (error) {
      setError(error.message || 'Logout failed');
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentUser,
    loginWithPhone,
    verifyOTP,
    logout,
    error,
    isAdmin: currentUser?.role === 'admin',
    isUser: currentUser?.role === 'user',
    profiles
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 