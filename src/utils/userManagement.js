import supabase from './supabaseClient';

/**
 * Direct authentication against the profiles table
 * This is for DEVELOPMENT ONLY and should not be used in production
 * In production, you would use proper Supabase Auth methods
 */
export const directAuth = async (phone, password) => {
  try {
    // Check for missing credentials
    if (!phone || !password) {
      return { success: false, error: 'Phone and password are required' };
    }
    
    // Fetch the user with the provided phone number
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single();
      
    if (error) {
      // If error is 'no rows returned', it means user not found
      if (error.code === 'PGRST116') {
        return { success: false, error: 'User not found' };
      }
      throw error;
    }
    
    // If no user found
    if (!data) {
      return { success: false, error: 'User not found' };
    }
    
    // Check if password matches (INSECURE - for development only)
    if (data.password !== password) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Generate a fake session ID for development
    const sessionId = `dev-session-${Date.now()}`;
    
    // Store the auth info in localStorage
    localStorage.setItem('europegas_auth', JSON.stringify({
      session: {
        id: sessionId,
        user: {
          id: data.id || `dev-user-${Date.now()}`, // Use existing ID or generate one
          phone: data.phone
        }
      },
      profile: data
    }));
    
    // Return the authenticated user data
    return { 
      success: true, 
      user: data,
      session: {
        id: sessionId,
        user: {
          id: data.id || `dev-user-${Date.now()}`,
          phone: data.phone
        }
      }
    };
  } catch (error) {
    console.error('Direct auth error:', error);
    return { success: false, error: error.message || 'Authentication failed' };
  }
};

/**
 * Creates a new user in the Supabase auth system and updates their profile
 * @param {Object} userData User data to create
 * @returns {Promise<Object>} Created user data
 */
export const createNewUser = async (userData) => {
  try {
    // First create the user in the auth system
    let authResponse;
    
    // If using password auth
    if (userData.password) {
      authResponse = await supabase.auth.signUp({
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role || 'user'
          }
        }
      });
    } else {
      // If using phone auth
      authResponse = await supabase.auth.signInWithOtp({
        phone: userData.phone
      });
    }
    
    if (authResponse.error) {
      throw authResponse.error;
    }
    
    // For testing purposes, create a profile directly
    // This is useful when we can't complete OTP verification
    // In production, this wouldn't be necessary as the trigger would create the profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authResponse.data?.user?.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password, // Note: For production, never store plain passwords
        role: userData.role || 'user'
      });
      
    if (profileError) {
      console.warn('Profile creation error:', profileError);
      // Not throwing here since the trigger might handle it
    }
    
    return {
      auth: authResponse.data,
      profile: profileData
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Seeds test users for development
 */
export const seedTestUsers = async () => {
  try {
    // Create admin user
    await createNewUser({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@europegas.com',
      phone: '+1 (555) 123-4567',
      password: 'admin123',
      role: 'admin'
    });
    
    // Create regular user
    await createNewUser({
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@europegas.com',
      phone: '+1 (555) 987-6543',
      password: 'user123',
      role: 'user'
    });
    
    // Create a few more test users
    for (let i = 1; i <= 3; i++) {
      await createNewUser({
        firstName: `Test${i}`,
        lastName: 'User',
        email: `test${i}@europegas.com`,
        phone: `+1 (555) 000-${1000 + i}`,
        password: 'password123',
        role: 'user'
      });
    }
    
    return { success: true, message: 'Test users created successfully' };
  } catch (error) {
    console.error('Error seeding test users:', error);
    return { success: false, error };
  }
};

/**
 * Gets a user by phone number directly from the profiles table
 * This is for testing/development only
 */
export const getUserByPhone = async (phone) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user by phone:', error);
    throw error;
  }
};

/**
 * Lists all users from the profiles table
 */
export const listAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error listing users:', error);
    throw error;
  }
}; 