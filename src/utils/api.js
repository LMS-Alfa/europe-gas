import supabase from './supabaseClient';

// ===== User Management APIs =====
export const getProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const getProfileByPhone = async (phone) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profile by phone:', error);
    throw error;
  }
};

export const getAllProfiles = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('firstName, lastName, phone, email, role, enteredParts, password')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // If no profiles exist, seed with some test users
    if (!data || data.length === 0) {
      await seedTestProfiles();
      // Fetch again after seeding
      const { data: newData, error: newError } = await supabase
        .from('profiles')
        .select('firstName, lastName, phone, email, role, enteredParts, password')
        .order('created_at', { ascending: false });
        
      if (newError) throw newError;
      return newData;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
};

/**
 * Seeds the profiles table with test users if it's empty
 * This is for development purposes only
 */
export const seedTestProfiles = async () => {
  try {
    // Create test users
    const testUsers = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@europegas.com',
        phone: '+1 (555) 123-4567',
        password: 'admin123',
        enteredParts: 0,
        role: 'admin'
      },
      {
        firstName: 'Regular',
        lastName: 'User',
        email: 'user@europegas.com',
        phone: '+1 (555) 987-6543',
        password: 'user123', 
        enteredParts: 5,
        role: 'user'
      },
      {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@europegas.com',
        phone: '+1 (555) 111-2222',
        password: 'test123',
        enteredParts: 2,
        role: 'user'
      }
    ];
    
    // Insert test users
    const { error } = await supabase
      .from('profiles')
      .insert(testUsers);
      
    if (error) throw error;
    
    console.log('Seeded test profiles successfully');
    return true;
  } catch (error) {
    console.error('Error seeding test profiles:', error);
    return false;
  }
};

export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      phone: userData.phone,
      email: userData.email,
      password: userData.password,
      email_confirm: true
    });
    
    if (authError) throw authError;
    
    // Then update the profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({
        name: userData.name,
        email: userData.email,
        role: userData.role
      })
      .eq('id', authData.user.id);
      
    if (profileError) throw profileError;
    
    return { auth: authData, profile: profileData };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// ===== Spare Parts Management APIs =====
export const uploadSpareParts = async (parts) => {
  try {
    const { data, error } = await supabase
      .from('spare_parts')
      .insert(parts);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading spare parts:', error);
    throw error;
  }
};

export const getSpareParts = async () => {
  try {
    const { data, error } = await supabase
      .from('spare_parts')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    throw error;
  }
};

export const getSparePartById = async (partId) => {
  try {
    const { data, error } = await supabase
      .from('spare_parts')
      .select('*')
      .eq('part_id', partId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching spare part:', error);
    throw error;
  }
};

// ===== User Parts Entry APIs =====
export const enterSparePart = async (userId, partId) => {
  try {
    const { data, error } = await supabase
      .from('user_parts')
      .insert([{ user_id: userId, part_id: partId }]);
      
    if (error) throw error;
    
    // Get the entered part with validation status
    const { data: enteredPart, error: fetchError } = await supabase
      .from('user_parts')
      .select('*')
      .eq('id', data[0].id)
      .single();
      
    if (fetchError) throw fetchError;
    
    return enteredPart;
  } catch (error) {
    console.error('Error entering spare part:', error);
    throw error;
  }
};

export const getUserParts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_parts')
      .select(`
        *,
        profiles!user_parts_user_id_fkey (name),
        spare_parts!inner (description, category)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user parts:', error);
    throw error;
  }
};

export const getAllUserParts = async () => {
  try {
    const { data, error } = await supabase
      .from('user_parts')
      .select(`
        *,
        profiles!user_parts_user_id_fkey (name),
        spare_parts!inner (description, category)
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching all user parts:', error);
    throw error;
  }
};

// ===== Bonus Management APIs =====
export const getUserBonus = async (userId) => {
  try {
    // Get the total valid bonus amount
    const { data: totalData, error: totalError } = await supabase
      .from('user_parts')
      .select('bonus_amount')
      .eq('user_id', userId)
      .eq('is_valid', true);
      
    if (totalError) throw totalError;
    
    // Calculate total bonus
    const totalBonus = totalData.reduce((sum, part) => sum + part.bonus_amount, 0);
    
    // Get paid bonus amounts
    const { data: paidData, error: paidError } = await supabase
      .from('bonus_payments')
      .select('total_amount')
      .eq('user_id', userId)
      .eq('status', 'paid');
      
    if (paidError) throw paidError;
    
    // Calculate paid bonus
    const paidBonus = paidData.reduce((sum, payment) => sum + payment.total_amount, 0);
    
    // Calculate pending bonus (total - paid)
    const pendingBonus = totalBonus - paidBonus;
    
    return {
      totalBonus,
      paidBonus,
      pendingBonus
    };
  } catch (error) {
    console.error('Error calculating user bonus:', error);
    throw error;
  }
};

export const getBonusPayments = async (userId = null) => {
  try {
    let query = supabase
      .from('bonus_payments')
      .select(`
        *,
        profiles!bonus_payments_user_id_fkey (name, phone)
      `)
      .order('created_at', { ascending: false });
      
    // If userId is provided, filter by user
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching bonus payments:', error);
    throw error;
  }
};

export const createBonusPayment = async (paymentData) => {
  try {
    const { data, error } = await supabase
      .from('bonus_payments')
      .insert([paymentData]);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating bonus payment:', error);
    throw error;
  }
};

export const updateBonusPayment = async (paymentId, updates) => {
  try {
    const { data, error } = await supabase
      .from('bonus_payments')
      .update(updates)
      .eq('id', paymentId);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating bonus payment:', error);
    throw error;
  }
}; 