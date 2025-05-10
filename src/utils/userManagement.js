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
    // Generate a numeric ID for the new user
    // Use current timestamp as a base for the ID
    const userId = Date.now();
    
    console.log(`Creating new user with generated ID: ${userId}`);
    console.log('User data:', {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role
    });
    
    // Check if a user with this phone already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id, phone')
      .eq('phone', userData.phone)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking for existing user:', checkError);
    }
    
    if (existingUser) {
      console.log(`User with phone ${userData.phone} already exists with ID: ${existingUser.id}`);
      throw new Error(`A user with this phone number already exists: ${userData.phone}`);
    }
    
    // Skip authentication and directly insert into profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password, // Note: For production, never store plain passwords
        role: userData.role || 'user'
      })
      .select()
      .single();
      
    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }
    
    console.log('Successfully created new user with profile data:', profileData);
    
    return {
      profile: profileData,
      auth: {
        user: {
          id: userId
        }
      }
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

/**
 * Updates a user's profile
 * @param {string} userId - The user's ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user data
 */
export const updateUser = async (userId, updates) => {
  try {
    // Validate inputs
    if (!userId) {
      throw new Error('User ID is required for update');
    }
    
    // Ensure userId is treated as a number if it's a numeric string
    const numericId = Number(userId);
    if (isNaN(numericId)) {
      throw new Error('User ID must be a valid number');
    }
    
    console.log(`Updating user with ID: ${numericId} (original: ${userId})`);
    
    // Create an update object with only the fields that are provided
    const updateData = {};
    if (updates.firstName !== undefined) updateData.firstName = updates.firstName;
    if (updates.lastName !== undefined) updateData.lastName = updates.lastName;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.password && updates.password.trim() !== '') updateData.password = updates.password;
    
    console.log('Update data:', updateData);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', numericId)
      .select()
      .single();
      
    if (error) {
      console.error('Supabase error updating user:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No user found with the provided ID');
    }
    
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Deletes a user from the profiles table
 * @param {string|number} userId - The user's ID to delete
 * @returns {Promise<Object>} Result of the deletion operation
 */
export const deleteUser = async (userId) => {
  try {
    // Ensure userId is treated as a number if it's a numeric string
    const numericId = Number(userId);
    if (isNaN(numericId)) {
      throw new Error('User ID must be a valid number');
    }
    
    console.log(`Deleting user with ID: ${numericId} (original: ${userId})`);
    
    // First check if user exists
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', numericId)
      .single();
      
    if (userError) {
      if (userError.code === 'PGRST116') {
        throw new Error(`No user found with ID: ${numericId}`);
      }
      throw userError;
    }
    
    if (!userData) {
      throw new Error(`No user found with ID: ${numericId}`);
    }
    
    // Delete the user
    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', numericId);
      
    if (error) {
      console.error('Supabase error deleting user:', error);
      throw error;
    }
    
    console.log(`Successfully deleted user with ID: ${numericId}`);
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}; 