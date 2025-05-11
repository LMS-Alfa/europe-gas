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
      .select('id, firstName, lastName, phone, email, role, password')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    // If no profiles exist, seed with some test users
    if (!data || data.length === 0) {
      await seedTestProfiles();
      // Fetch again after seeding
      const { data: newData, error: newError } = await supabase
        .from('profiles')
        .select('id, firstName, lastName, phone, email, role, password')
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
        role: 'admin'
      },
      {
        firstName: 'Regular',
        lastName: 'User',
        email: 'user@europegas.com',
        phone: '+1 (555) 987-6543',
        password: 'user123', 
        role: 'user'
      },
      {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@europegas.com',
        phone: '+1 (555) 111-2222',
        password: 'test123',
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

// ===== Parts Management APIs =====
export const uploadParts = async (parts) => {
  try {
    console.log('Uploading parts with this data:', parts);
    
    // First, get all existing parts to check for duplicates
    const { data: existingParts, error: fetchError } = await supabase
      .from('parts')
      .select('serial_number');
      
    if (fetchError) {
      console.error('Error fetching existing parts:', fetchError);
      throw fetchError;
    }
    
    // Create a set of existing serial numbers for faster lookup
    const existingSerialNumbers = new Set();
    existingParts.forEach(part => {
      if (part.serial_number) existingSerialNumbers.add(part.serial_number);
    });
    
    console.log('Existing serial numbers:', existingSerialNumbers);
    
    // Filter out parts that already exist
    const newParts = parts.filter(part => {
      const serialNumber = part.serial_number;
      const isDuplicate = serialNumber && existingSerialNumbers.has(serialNumber);
      if (isDuplicate) {
        console.log(`Skipping duplicate part with serial number: ${serialNumber}`);
      }
      return !isDuplicate;
    });
    
    console.log(`Filtered ${parts.length - newParts.length} duplicate parts, uploading ${newParts.length} new parts`);
    
    // If no new parts to add, return early
    if (newParts.length === 0) {
      return { skippedAll: true };
    }
    
    // Insert only new parts
    const { data, error } = await supabase
      .from('parts')
      .insert(newParts);
      
    if (error) {
      console.error('Error from Supabase:', error);
      throw error;
    }
    
    console.log('Upload success, response:', data);
    return { 
      data,
      skipped: parts.length - newParts.length,
      added: newParts.length
    };
  } catch (error) {
    console.error('Error uploading parts:', error);
    throw error;
  }
};

export const getParts = async () => {
  try {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .order('id', { ascending: true });
      
    if (error) throw error;
    
    // Log the raw data to see what we're actually getting
    console.log('Raw data from database:', data);
    
    // Check if data exists and return as is - skip mapping
    if (data && data.length > 0) {
      return data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching parts:', error);
    throw error;
  }
};

export const getPartById = async (partId) => {
  try {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('part_id', partId)
      .single();
      
    if (error) throw error;
    
    // Map to UI field names if needed
    const mappedData = {
      id: data.id,
      name: data.name,
      serial_number: data.serial_number,
      status: data.status,
      price: data.price,
      stock: data.stock
    };
    
    return mappedData;
  } catch (error) {
    console.error('Error fetching part:', error);
    throw error;
  }
};

// ===== User Parts Entry APIs =====
export const enterPart = async (userId, partId) => {
  try {
    // Format the part ID but preserve spaces
    // First trim leading/trailing spaces and normalize internal spaces
    const formattedPartId = partId.toString().trim().replace(/\s+/g, ' ');
    
    // Check if partId is empty after formatting
    if (!formattedPartId) {
      throw new Error('Part ID cannot be empty or contain only spaces');
    }
    
    console.log('Submitting part ID (formatted):', formattedPartId);
    
    // First, check if the part exists with the EXACT formatted ID (with spaces)
    let { data: partData, error: partError } = await supabase
      .from('parts')
      .select('*')
      .eq('serial_number', formattedPartId);
    
    // If not found with spaces, try also without spaces as fallback
    if ((!partData || partData.length === 0) && !partError) {
      console.log('Part not found with spaces, trying without spaces');
      const noSpacesId = formattedPartId.replace(/\s+/g, '');
      
      const result = await supabase
        .from('parts')
        .select('*')
        .eq('serial_number', noSpacesId);
        
      partData = result.data;
      partError = result.error;
    }
      
    if (partError) throw partError;
    
    // Check if part exists
    if (!partData || partData.length === 0) {
      throw new Error(`Part with ID "${formattedPartId}" was not found`);
    }
    
    // Get the actual part record and ID
    const partRecord = partData[0];
    const actualPartId = partRecord.id;
    
    console.log('Found part:', partRecord);
    
    // If part is already entered (status is true), throw an error
    if (partRecord.status === true) {
      throw new Error('This part has already been entered');
    }
    
    // Check if this user has already entered this part
    const { data: existingEntry, error: existingEntryError } = await supabase
      .from('enteredparts')
      .select('id')
      .eq('user_id', userId)
      .eq('part_id', actualPartId);
      
    if (existingEntryError) throw existingEntryError;
    
    if (existingEntry && existingEntry.length > 0) {
      throw new Error('You have already entered this part');
    }
    
    // Insert into enteredparts using the database part ID and explicitly request the data back
    const { data, error } = await supabase
      .from('enteredparts')
      .insert([{ user_id: userId, part_id: actualPartId }])
      .select(); // Add select() to return the inserted data
      
    if (error) throw error;
    
    // Don't throw an error if data is empty, this can happen with some Supabase configurations
    // Just log it and continue if there's no error
    if (!data || data.length === 0) {
      console.warn('No data returned from insert operation, but no error occurred');
    }
    
    // Update the part status to true (entered)
    const { error: updateError } = await supabase
      .from('parts')
      .update({ status: true })
      .eq('id', actualPartId);
      
    if (updateError) throw updateError;
    
    return {
      success: true,
      message: 'Part successfully entered',
      partId: formattedPartId,
      partRecord
    };
  } catch (error) {
    console.error('Error entering part:', error);
    throw error;
  }
};

export const getUserParts = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('enteredparts')
      .select(`
        *,
        profiles:user_id (firstName, lastName),
        parts:part_id (name, status, serial_number)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error in getUserParts:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user parts:', error);
    return [];
  }
};

export const getAllUserParts = async () => {
  try {
    const { data, error } = await supabase
      .from('enteredparts')
      .select(`
        *,
        profiles:user_id (firstName, lastName),
        parts:part_id (name, status, serial_number)
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error in getAllUserParts:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching all user parts:', error);
    return [];
  }
};

// ===== Bonus Management APIs =====
export const getUserBonus = async (userId) => {
  try {
    // Get user's entered parts with payment status
    const { data: userParts, error: userPartsError } = await supabase
      .from('enteredparts')
      .select('id, paid')
      .eq('user_id', userId);
      
    if (userPartsError) {
      console.error('Error fetching user parts:', userPartsError);
      return { totalBonus: 0, pendingBonus: 0, paidBonus: 0 };
    }
    
    if (!userParts) {
      return { totalBonus: 0, pendingBonus: 0, paidBonus: 0 };
    }
    
    // Calculate total bonus ($1 per part)
    const totalBonus = userParts.length;
    
    // Calculate paid and pending bonuses
    const paidBonusCount = userParts.filter(part => part.paid === true).length;
    const pendingBonusCount = totalBonus - paidBonusCount;
    
    return {
      totalBonus,
      pendingBonus: pendingBonusCount,
      paidBonus: paidBonusCount
    };
  } catch (error) {
    console.error('Error calculating user bonus:', error);
    return { totalBonus: 0, pendingBonus: 0, paidBonus: 0 };
  }
};

// Get bonus data for all users
export const getAllUserBonuses = async () => {
  try {
    console.log('Getting all user bonuses');
    
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, firstName, lastName, email, role');
      
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return [];
    }
    
    // Simplify the approach - just get all parts and count them per user in JavaScript
    // This is more reliable than trying to use PostgreSQL aggregations
    const { data: allParts, error: partsError } = await supabase
      .from('enteredparts')
      .select('id, user_id, created_at');
      
    if (partsError) {
      console.error('Error fetching parts:', partsError);
      return [];
    }
    
    console.log('Got all parts:', { count: allParts?.length });
    
    // Count parts per user
    const userPartCounts = {};
    allParts.forEach(part => {
      if (!part.user_id) return;
      
      if (!userPartCounts[part.user_id]) {
        userPartCounts[part.user_id] = 0;
      }
      
      userPartCounts[part.user_id]++;
    });
    
    console.log('Counted parts per user:', userPartCounts);
    
    // Calculate bonus for each user
    const bonusData = users.map(user => {
      const totalParts = userPartCounts[user.id] || 0;
      
      return {
        userId: user.id,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        email: user.email || 'N/A',
        role: user.role || 'user',
        totalParts,
        totalBonus: totalParts,
        pendingBonus: totalParts,
        paidBonus: 0
      };
    });
    
    console.log('Generated bonus data:', bonusData);
    return bonusData;
  } catch (error) {
    console.error('Error calculating all user bonuses:', error);
    return [];
  }
};

// We'll replace the bonus_payments functions with stubs since we don't have that table
export const getBonusPayments = async (userId = null) => {
  console.log('getBonusPayments called, but no bonus_payments table exists yet');
  return [];
};

export const createBonusPayment = async (paymentData) => {
  console.log('createBonusPayment called, but no bonus_payments table exists yet', paymentData);
  return null;
};

/**
 * Updates the payment status for a bonus record
 * 
 * @param {string} bonusId - The identifier for the bonus entry (userId_quarter)
 * @param {boolean} paid - Whether the bonus has been paid
 * @param {string} paymentDate - The date when payment was made (YYYY-MM-DD format)
 * @returns {Object} The updated bonus record
 */
export const updateBonusPaymentStatus = async (bonusId, paid, paymentDate) => {
  console.log('Updating payment status for bonus:', { bonusId, paid, paymentDate });
  
  try {
    // Extract userId and quarter from the composite ID
    const [userId, quarter] = bonusId.split('_');
    
    if (!userId) {
      throw new Error('Invalid bonus ID format');
    }
    
    // In a real implementation, we would have a bonus_payments table to update
    // For now, we'll just simulate the update
    
    // First, check if this payment already exists
    const { data: existingPayments, error: fetchError } = await supabase
      .from('enteredparts')
      .select('id, payment_status, payment_date')
      .eq('user_id', userId)
      .is('payment_status', null); // Only get unpaid entries
      
    if (fetchError) {
      console.error('Error fetching existing payments:', fetchError);
      throw fetchError;
    }
    
    // For now, we're updating the enteredparts table directly
    // In a real application, you would have a separate bonus_payments table
    if (paid && existingPayments && existingPayments.length > 0) {
      // Get the IDs to update
      const idsToUpdate = existingPayments.map(payment => payment.id);
      
      // Update the payment status
      const { data, error } = await supabase
        .from('enteredparts')
        .update({ 
          payment_status: 'paid',
          payment_date: paymentDate 
        })
        .in('id', idsToUpdate);
        
      if (error) {
        console.error('Error updating payment status:', error);
        throw error;
      }
      
      console.log(`Updated ${idsToUpdate.length} entries with payment status`);
      
      // Return the updated records
      return {
        success: true,
        updatedCount: idsToUpdate.length,
        paymentDate,
        bonusId
      };
    }
    
    // If we're here, either there were no entries to update or we're unsetting paid status
    return {
      success: true,
      updatedCount: 0,
      message: 'No entries needed updating or paid status was set to false'
    };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return {
      success: false,
      error: error.message,
      bonusId
    };
  }
};

// ===== Dashboard APIs =====
export const getDashboardStats = async () => {
  try {
    console.log('==========================================');
    console.log('STARTING getDashboardStats FUNCTION');
    console.log('==========================================');
    
    // Check if supabase client is properly initialized
    if (!supabase) {
      console.error('CRITICAL ERROR: Supabase client is not initialized');
      return {
        totalParts: 0,
        partsEnteredToday: 0,
        totalUsers: 0,
        totalBonuses: 0,
        error: 'Database connection not initialized'
      };
    }
    
    // PARTS COUNT
    console.log('Fetching parts count...');
    let totalParts = 0;
    
    try {
      // Try multiple approaches to get parts count
      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .select('id');
        
      console.log('Parts data query result:', { 
        dataReceived: !!partsData, 
        count: partsData ? partsData.length : 0, 
        error: partsError
      });
      
      if (!partsError && partsData) {
        totalParts = partsData.length;
        console.log('Got parts count from data length:', totalParts);
      } else {
        console.error('Failed to get parts count:', partsError);
      }
    } catch (partsErr) {
      console.error('Exception when fetching parts:', partsErr);
    }
    
    // ACTIVE USERS COUNT
    console.log('Fetching users count...');
    let activeUsersCount = 0;
    
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id');
        
      console.log('Profiles query result:', { 
        dataReceived: !!profiles, 
        count: profiles ? profiles.length : 0, 
        error: profilesError
      });
      
      if (!profilesError && profiles) {
        activeUsersCount = profiles.length;
        console.log('Got active users count:', activeUsersCount);
      } else {
        console.error('Failed to get profiles:', profilesError);
      }
    } catch (usersErr) {
      console.error('Exception when fetching users:', usersErr);
    }
    
    // TODAY'S PARTS COUNT
    console.log('Fetching today\'s parts count...');
    let partsEnteredToday = 0;
    
    try {
      // Get today's date in ISO format (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      console.log('Today\'s date for filtering:', today);
      
      const { data: todaysParts, error: todaysPartsError } = await supabase
        .from('enteredparts')
        .select('id')
        .gte('created_at', today);
        
      console.log('Today\'s parts query result:', { 
        dataReceived: !!todaysParts, 
        count: todaysParts ? todaysParts.length : 0, 
        error: todaysPartsError
      });
      
      if (!todaysPartsError && todaysParts) {
        partsEnteredToday = todaysParts.length;
        console.log('Got today\'s parts count:', partsEnteredToday);
      } else {
        console.error('Failed to get today\'s parts:', todaysPartsError);
      }
    } catch (todayErr) {
      console.error('Exception when fetching today\'s parts:', todayErr);
    }
    
    // TOTAL BONUSES - calculated as $1 per entered part
    console.log('Calculating total bonuses based on entered parts...');
    let totalBonuses = 0;
    
    try {
      // Calculate from entered parts ($1 per part)
      const { data: allParts, error: allPartsError } = await supabase
        .from('enteredparts')
        .select('id');
        
      console.log('All parts query result for bonus calculation:', { 
        dataReceived: !!allParts, 
        count: allParts ? allParts.length : 0, 
        error: allPartsError
      });
      
      if (!allPartsError && allParts) {
        totalBonuses = allParts.length; // $1 per part
        console.log('Calculated total bonuses from parts count:', totalBonuses);
      } else {
        console.error('Failed to calculate bonuses:', allPartsError);
      }
    } catch (bonusErr) {
      console.error('Exception when calculating bonuses:', bonusErr);
    }
    
    // Return all stats
    const stats = {
      totalParts,
      partsEnteredToday,
      totalUsers: activeUsersCount,
      totalBonuses
    };
    
    console.log('==========================================');
    console.log('FINAL DASHBOARD STATS:', stats);
    console.log('==========================================');
    
    return stats;
  } catch (error) {
    console.error('CRITICAL ERROR in getDashboardStats:', error);
    // Return default values on error
    return {
      totalParts: 0,
      partsEnteredToday: 0,
      totalUsers: 0,
      totalBonuses: 0,
      error: error.message
    };
  }
};

export const getRecentActivity = async (limit = 5) => {
  try {
    console.log('Getting recent activity, limit:', limit);
    
    // Get recent parts entered
    const { data: recentParts, error: partsError } = await supabase
      .from('enteredparts')
      .select(`
        id,
        created_at,
        user_id,
        part_id,
        profiles:user_id (firstName, lastName),
        parts:part_id (name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (partsError) {
      console.error('Error fetching recent parts:', partsError);
      return [];
    }
    
    // Get recent parts uploads
    const { data: recentUploads, error: uploadsError } = await supabase
      .from('parts')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (uploadsError) {
      console.error('Error fetching recent uploads:', uploadsError);
      return [];
    }
    
    console.log('Recent parts:', recentParts);
    console.log('Recent uploads:', recentUploads);
    
    // Combine and format all activities
    const activities = [
      ...(recentParts || []).map(part => {
        // Get user name from joined data or set default
        const firstName = part.profiles?.firstName || 'Unknown';
        const lastName = part.profiles?.lastName || 'User';
        
        return {
          id: `part_${part.id}`,
          title: `${firstName} ${lastName} entered ${part.parts?.name || 'Unknown Part'}`,
          timestamp: part.created_at,
          time: formatTimeAgo(new Date(part.created_at)),
          type: 'part_entry'
        };
      }),
      ...(recentUploads || []).filter(upload => upload.created_at).map(upload => ({
        id: `upload_${upload.id}`,
        title: `New part uploaded: ${upload.name || 'Unknown'}`,
        timestamp: upload.created_at,
        time: formatTimeAgo(new Date(upload.created_at)),
        type: 'part_upload'
      }))
    ];
    
    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Return only the requested number of items
    return activities.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

// Helper function to format timestamps as "X time ago"
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
};

// Check and create necessary database tables if they don't exist
export const createDatabaseTables = async () => {
  console.log('Starting database tables check and creation...');
  
  try {
    // First, check if the tables exist by trying to select from them
    const tableResults = {};
    
    // Check profiles table
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      console.log('Profiles table check:', { exists: !profileError, error: profileError });
      tableResults.profiles = !profileError;
      
      // If no profiles exist, add test profiles
      if (!profileError && (!profileData || profileData.length === 0)) {
        console.log('No profiles found, adding test profiles');
        await seedTestProfiles();
      }
    } catch (e) {
      console.error('Error checking profiles table:', e);
      tableResults.profiles = false;
    }
    
    // Check parts table
    try {
      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .select('id')
        .limit(1);
      
      console.log('Parts table check:', { exists: !partsError, error: partsError });
      tableResults.parts = !partsError;
      
      // If no parts exist, add test parts
      if (!partsError && (!partsData || partsData.length === 0)) {
        console.log('No parts found, adding test parts');
        const sampleParts = [
          { name: 'Turbocharger', serial_number: 'TC-10001', description: 'High-performance turbocharger' },
          { name: 'Fuel Injector', serial_number: 'FI-20002', description: 'Precision fuel injector' },
          { name: 'Air Filter', serial_number: 'AF-30003', description: 'High-flow air filter' },
          { name: 'Spark Plug', serial_number: 'SP-40004', description: 'Long-life spark plug' },
          { name: 'Oil Filter', serial_number: 'OF-50005', description: 'Advanced oil filtration' }
        ];
        
        const { error: insertError } = await supabase.from('parts').insert(sampleParts);
        console.log('Sample parts insert result:', { error: insertError });
      }
    } catch (e) {
      console.error('Error checking parts table:', e);
      tableResults.parts = false;
    }
    
    // Check enteredparts table
    try {
      const { data: enteredPartsData, error: enteredPartsError } = await supabase
        .from('enteredparts')
        .select('id')
        .limit(1);
      
      console.log('Enteredparts table check:', { exists: !enteredPartsError, error: enteredPartsError });
      tableResults.enteredParts = !enteredPartsError;
    } catch (e) {
      console.error('Error checking enteredparts table:', e);
      tableResults.enteredParts = false;
    }
    
    // If all tables exist, we're good to go
    const allTablesExist = 
      tableResults.profiles && 
      tableResults.parts && 
      tableResults.enteredParts;
    
    console.log('Database table check results:', tableResults);
    console.log('All tables exist:', allTablesExist);
    
    return allTablesExist;
  } catch (error) {
    console.error('Error in database tables check:', error);
    return false;
  }
};

// New function to synchronize the status field in parts table with enteredparts records
export const syncPartsStatus = async () => {
  try {
    console.log('Starting parts status synchronization');
    
    // Get all parts that exist in enteredparts table
    const { data: enteredParts, error: fetchError } = await supabase
      .from('enteredparts')
      .select('part_id')
      .order('part_id');
      
    if (fetchError) {
      console.error('Error fetching entered parts:', fetchError);
      throw fetchError;
    }
    
    // Get all unique part IDs that have been entered
    const enteredPartIds = [...new Set(enteredParts.map(entry => entry.part_id))];
    console.log(`Found ${enteredPartIds.length} unique parts that have been entered`);
    
    if (enteredPartIds.length === 0) {
      // If no parts have been entered, set all parts to status=false
      const { data: resetAllData, error: resetAllError } = await supabase
        .from('parts')
        .update({ status: false })
        .not('status', 'is', false);  // Only update those that aren't already false
        
      if (resetAllError) {
        console.error('Error resetting all parts status:', resetAllError);
        throw resetAllError;
      }
      
      return { 
        updated: 0, 
        resetCount: resetAllData?.length || 0,
        message: 'No entered parts found, all parts set to not entered',
        success: true 
      };
    }
    
    // Update all these parts to have status = true
    const { data, error: updateError } = await supabase
      .from('parts')
      .update({ status: true })
      .in('id', enteredPartIds);
      
    if (updateError) {
      console.error('Error updating parts status:', updateError);
      throw updateError;
    }
    
    // Now set all other parts to status = false if not already
    const { data: resetData, error: resetError } = await supabase
      .from('parts')
      .update({ status: false })
      .not('id', 'in', `(${enteredPartIds.join(',')})`)
      .not('status', 'is', false);  // Only update those that aren't already false
      
    if (resetError) {
      console.error('Error resetting status for other parts:', resetError);
      // Continue even if this fails
    }
    
    console.log(`Successfully synchronized status for ${enteredPartIds.length} parts`);
    return { 
      updated: enteredPartIds.length,
      resetCount: resetData?.length || 0,
      success: true 
    };
  } catch (error) {
    console.error('Error synchronizing parts status:', error);
    return { 
      error: error.message,
      success: false 
    };
  }
};

// Test function to verify that the status field is correctly synchronized
export const testPartsStatusSync = async () => {
  try {
    console.log('Starting status synchronization test');
    
    // Get all entered parts
    const { data: enteredParts, error: enteredPartsError } = await supabase
      .from('enteredparts')
      .select('part_id');
      
    if (enteredPartsError) {
      console.error('Error fetching enteredParts:', enteredPartsError);
      return { success: false, error: enteredPartsError.message };
    }
    
    // Get unique part IDs that have been entered
    const enteredPartIds = [...new Set(enteredParts.map(entry => entry.part_id))];
    
    // Get all parts with status=true
    const { data: partsWithStatusTrue, error: statusTrueError } = await supabase
      .from('parts')
      .select('id')
      .eq('status', true);
      
    if (statusTrueError) {
      console.error('Error fetching parts with status=true:', statusTrueError);
      return { success: false, error: statusTrueError.message };
    }
    
    const partIdsWithStatusTrue = partsWithStatusTrue.map(part => part.id);
    
    // Check for mismatches
    const missingStatusTrue = enteredPartIds.filter(id => !partIdsWithStatusTrue.includes(id));
    const extraStatusTrue = partIdsWithStatusTrue.filter(id => !enteredPartIds.includes(id));
    
    const result = {
      success: missingStatusTrue.length === 0 && extraStatusTrue.length === 0,
      enteredPartsCount: enteredPartIds.length,
      statusTrueCount: partIdsWithStatusTrue.length,
      missingStatusTrue,
      extraStatusTrue,
      mismatchCount: missingStatusTrue.length + extraStatusTrue.length
    };
    
    console.log('Status sync test results:', result);
    return result;
  } catch (error) {
    console.error('Error testing parts status sync:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets the count of entered parts and calculates bonus for a specific user
 * @param {string|number} userId - The user's ID
 * @returns {Promise<Object>} Object containing entries count and bonus
 */
export const getUserEntriesAndBonus = async (userId) => {
  try {
    // Count this user's entries in the enteredparts table
    const { data, error } = await supabase
      .from('enteredparts')
      .select('id')
      .eq('user_id', userId);
      
    if (error) {
      console.error(`Error getting entries for user ${userId}:`, error);
      return { entriesCount: 0, bonusAmount: '$0.00' };
    }
    
    const entriesCount = data?.length || 0;
    const bonusAmount = entriesCount > 0 ? `$${entriesCount.toFixed(2)}` : '$0.00';
    
    return { entriesCount, bonusAmount };
  } catch (error) {
    console.error(`Error getting entries and bonus for user ${userId}:`, error);
    return { entriesCount: 0, bonusAmount: '$0.00' };
  }
};

/**
 * Gets entries and bonus data for all users
 * @returns {Promise<Object>} Map of user IDs to their entries and bonus data
 */
export const getAllUsersEntriesAndBonus = async () => {
  try {
    // Get all entries from the enteredparts table
    const { data, error } = await supabase
      .from('enteredparts')
      .select('id, user_id')
      .order('user_id');
      
    if (error) {
      console.error('Error getting all entries:', error);
      return {};
    }
    
    // Count entries per user and calculate bonus
    const entriesMap = {};
    
    data.forEach(entry => {
      const userId = entry.user_id;
      if (!userId) return;
      
      if (!entriesMap[userId]) {
        entriesMap[userId] = {
          entriesCount: 0,
          bonusAmount: '$0.00'
        };
      }
      
      entriesMap[userId].entriesCount++;
      entriesMap[userId].bonusAmount = `$${entriesMap[userId].entriesCount.toFixed(2)}`;
    });
    
    return entriesMap;
  } catch (error) {
    console.error('Error getting all user entries and bonuses:', error);
    return {};
  }
};

// Get count of parts that haven't been entered yet (remaining parts)
export const getPartsRemainingCount = async () => {
  try {
    // Count parts where status is false or null (not entered yet)
    const { count, error } = await supabase
      .from('parts')
      .select('id', { count: 'exact', head: true })
      .eq('status', false);
      
    if (error) {
      console.error('Error fetching remaining parts count:', error);
      throw error;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error in getPartsRemainingCount:', error);
    return 0;
  }
};

/**
 * Get the quarter number (1-4) for a given date
 * @param {Date} date - The date to get the quarter for
 * @returns {number} - Quarter number (1-4)
 */
export const getQuarterFromDate = (date) => {
  const month = date.getMonth();
  if (month < 3) return 1; // Jan, Feb, Mar
  if (month < 6) return 2; // Apr, May, Jun
  if (month < 9) return 3; // Jul, Aug, Sep
  return 4; // Oct, Nov, Dec
};

/**
 * Get the quarter label for a given date (e.g., 'Q1 2023')
 * @param {Date} date - The date to get the quarter label for
 * @returns {string} - Quarter label (e.g., 'Q1 2023')
 */
export const getQuarterLabel = (date) => {
  const quarter = getQuarterFromDate(date);
  const year = date.getFullYear();
  return `Q${quarter} ${year}`;
};

/**
 * Calculate bonus amounts by quarter for a specific user
 * @param {string} userId - The user ID to calculate bonuses for
 * @returns {Promise<Array>} - Array of quarterly bonus data
 */
export const getUserBonusesByQuarter = async (userId) => {
  try {
    // Get all parts entered by the user
    const { data: userParts, error } = await supabase
      .from('enteredparts')
      .select('*, parts:part_id (serial_number)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    if (!userParts || userParts.length === 0) {
      return [];
    }
    
    // Group parts by quarter
    const quarterMap = {};
    
    userParts.forEach(part => {
      const created = new Date(part.created_at);
      const quarter = getQuarterFromDate(created);
      const year = created.getFullYear();
      const quarterKey = `${quarter}_${year}`;
      
      if (!quarterMap[quarterKey]) {
        quarterMap[quarterKey] = {
          quarter,
          year,
          quarterLabel: `Q${quarter} ${year}`,
          parts: [],
          total: 0,
          paidCount: 0,
          pendingCount: 0,
          paymentDate: null
        };
      }
      
      quarterMap[quarterKey].parts.push(part);
      quarterMap[quarterKey].total += 1; // $1 per part
      
      // Check if this part is marked as paid
      if (part.paid) {
        quarterMap[quarterKey].paidCount += 1;
        // Use the most recent payment date
        if (part.payment_date && (!quarterMap[quarterKey].paymentDate || 
            new Date(part.payment_date) > new Date(quarterMap[quarterKey].paymentDate))) {
          quarterMap[quarterKey].paymentDate = part.payment_date;
        }
      } else {
        quarterMap[quarterKey].pendingCount += 1;
      }
    });
    
    // Convert map to array
    const quarterlyBonuses = Object.values(quarterMap).map(q => {
      // Determine payment status - if all parts are paid, status is "paid"
      // if some parts are paid, status is "partial", otherwise "pending"
      let paymentStatus = "pending";
      if (q.paidCount === q.parts.length) {
        paymentStatus = "paid";
      } else if (q.paidCount > 0) {
        paymentStatus = "partial";
      }
      
      return {
        userId,
        quarter: q.quarter,
        year: q.year,
        quarterLabel: q.quarterLabel,
        partCount: q.parts.length,
        bonusAmount: q.total,
        paymentStatus: paymentStatus,
        paymentDate: q.paymentDate,
        parts: q.parts
      };
    });
    
    return quarterlyBonuses;
  } catch (error) {
    console.error('Error calculating user bonuses by quarter:', error);
    throw error;
  }
};

/**
 * Calculate bonus amounts by quarter for all users
 * @returns {Promise<Array>} - Array of quarterly bonus data for all users
 */
export const getAllUserBonusesByQuarter = async () => {
  try {
    console.log('Starting getAllUserBonusesByQuarter...');
    
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, firstName, lastName, email, role');
      
    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }
    
    console.log(`Found ${users?.length || 0} users in the system`);
    
    if (!users || users.length === 0) {
      console.warn('No users found in the system');
      return [];
    }
    
    // Get all entered parts
    const { data: allParts, error: partsError } = await supabase
      .from('enteredparts')
      .select('*, profiles:user_id (firstName, lastName, email), parts:part_id (serial_number)')
      .order('created_at', { ascending: true });
      
    if (partsError) {
      console.error('Error fetching entered parts:', partsError);
      throw partsError;
    }
    
    console.log(`Found ${allParts?.length || 0} entered parts in the system`);
    
    if (!allParts || allParts.length === 0) {
      console.warn('No entered parts found in the system');
      return [];
    }
    
    // Debug output to check enteredparts structure
    console.log('First entered part record:', JSON.stringify(allParts[0]));
    
    // Check if the required columns exist in the enteredparts table
    const firstPart = allParts[0];
    const hasPaidColumn = 'paid' in firstPart;
    const hasPaymentDateColumn = 'payment_date' in firstPart;
    
    console.log(`Schema check - paid column: ${hasPaidColumn ? 'exists' : 'MISSING'}, payment_date column: ${hasPaymentDateColumn ? 'exists' : 'MISSING'}`);
    
    // If columns are missing, let's log the available columns
    if (!hasPaidColumn || !hasPaymentDateColumn) {
      console.warn('Available columns in enteredparts:', Object.keys(firstPart).join(', '));
      
      // Check if we need to alter the table
      console.warn('Missing required columns in enteredparts table. Need to add: ' + 
        (!hasPaidColumn ? 'paid (boolean)' : '') + 
        (!hasPaidColumn && !hasPaymentDateColumn ? ' and ' : '') +
        (!hasPaymentDateColumn ? 'payment_date (timestamp)' : ''));
    }
    
    // Group parts by user and quarter
    const userQuarterMap = {};
    
    allParts.forEach(part => {
      if (!part.user_id || !part.created_at) {
        console.warn('Skipping part with missing data:', part);
        return;
      }
      
      const userId = part.user_id;
      const created = new Date(part.created_at);
      const quarter = getQuarterFromDate(created);
      const year = created.getFullYear();
      const quarterKey = `${userId}_${quarter}_${year}`;
      
      if (!userQuarterMap[quarterKey]) {
        // Extract user info safely
        let userName = 'Unknown User';
        let email = 'N/A';
        
        if (part.profiles) {
          const firstName = part.profiles.firstName || '';
          const lastName = part.profiles.lastName || '';
          userName = `${firstName} ${lastName}`.trim() || 'Unknown User';
          email = part.profiles.email || 'N/A';
          console.log(`Found user profile for ${userId}: ${userName}`);
        } else {
          console.warn(`User profile not found for part ${part.id}, user_id ${userId}`);
        }
        
        userQuarterMap[quarterKey] = {
          userId,
          userName,
          email,
          quarter,
          year,
          quarterLabel: `Q${quarter} ${year}`,
          parts: [],
          total: 0,
          paidCount: 0,
          pendingCount: 0,
          paymentDate: null
        };
      }
      
      userQuarterMap[quarterKey].parts.push(part);
      userQuarterMap[quarterKey].total += 1; // $1 per part
      
      // Check if this part is marked as paid - if paid column exists
      if (hasPaidColumn && part.paid === true) {
        userQuarterMap[quarterKey].paidCount += 1;
        // Use the most recent payment date if available
        if (hasPaymentDateColumn && part.payment_date && (!userQuarterMap[quarterKey].paymentDate || 
            new Date(part.payment_date) > new Date(userQuarterMap[quarterKey].paymentDate))) {
          userQuarterMap[quarterKey].paymentDate = part.payment_date;
        }
      } else {
        userQuarterMap[quarterKey].pendingCount += 1;
      }
    });
    
    console.log(`Grouped ${allParts.length} parts into ${Object.keys(userQuarterMap).length} user-quarter combinations`);
    
    // Convert map to array with safety checks
    const allQuarterlyBonuses = Object.values(userQuarterMap).map(q => {
      // Determine payment status - if all parts are paid, status is "paid"
      // if some parts are paid, status is "partial", otherwise "pending"
      let paymentStatus = "pending";
      
      if (hasPaidColumn) {
        if (q.paidCount === q.parts.length && q.parts.length > 0) {
          paymentStatus = "paid";
        } else if (q.paidCount > 0) {
          paymentStatus = "partial";
        }
      }
      
      return {
        userId: q.userId,
        userName: q.userName,
        email: q.email,
        quarter: q.quarter,
        year: q.year,
        quarterLabel: q.quarterLabel,
        partCount: q.parts.length,
        bonusAmount: q.total,
        paymentStatus: paymentStatus,
        paymentDate: q.paymentDate,
        parts: q.parts.map(p => p.id) // Just store IDs to reduce size
      };
    });
    
    console.log(`Returning ${allQuarterlyBonuses.length} quarterly bonus records`);
    return allQuarterlyBonuses;
  } catch (error) {
    console.error('Error calculating all user bonuses by quarter:', error);
    return []; // Return empty array instead of throwing to prevent UI crashes
  }
};

/**
 * Get bonuses for a specific quarter
 * @param {number} quarter - Quarter number (1-4)
 * @param {number} year - Year (e.g., 2023)
 * @returns {Promise<Array>} - Array of user bonuses for the specified quarter
 */
export const getBonusesByQuarter = async (quarter, year) => {
  try {
    const allBonuses = await getAllUserBonusesByQuarter();
    return allBonuses.filter(b => b.quarter === quarter && b.year === year);
  } catch (error) {
    console.error('Error getting bonuses by quarter:', error);
    throw error;
  }
};

/**
 * Mark a quarterly bonus as paid or pending
 * @param {object} paymentData - Object containing payment information
 * @param {string} paymentData.userId - User ID
 * @param {number} paymentData.quarter - Quarter number (1-4)
 * @param {number} paymentData.year - Year (e.g., 2023)
 * @param {number} paymentData.amount - Bonus amount
 * @param {string} paymentData.status - Payment status ('pending', 'approved', or 'paid')
 * @param {string} paymentData.paymentDate - Payment date (optional, for 'paid' status)
 * @returns {Promise<object>} - The created or updated payment record
 */
export const updateBonusPayment = async (paymentData) => {
  try {
    const { userId, quarter, year, amount, status, paymentDate } = paymentData;
    
    // Find all parts for this user in the specified quarter and year
    const startDate = new Date(year, (quarter - 1) * 3, 1); // First day of the quarter
    const endDate = new Date(year, quarter * 3, 0);  // Last day of the quarter
    
    console.log('Finding parts for payment between:', startDate, 'and', endDate, 'for user:', userId);
    
    // Get all parts entered by this user in this quarter
    const { data: partsToUpdate, error: fetchError } = await supabase
      .from('enteredparts')
      .select('id, created_at, paid, payment_date')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
      
    if (fetchError) {
      console.error('Error fetching parts to update:', fetchError);
      throw fetchError;
    }
    
    console.log('Found parts to update:', partsToUpdate);
    
    if (!partsToUpdate || partsToUpdate.length === 0) {
      console.log('No parts found for this quarter');
      return { 
        success: false, 
        error: 'No parts found for this quarter',
        updatedCount: 0
      };
    }
    
    // Get IDs of parts to update
    const partIds = partsToUpdate.map(part => part.id);
    
    // If marking as paid, set both paid=true and payment_date
    if (status === 'paid') {
      const { data, error: updateError } = await supabase
        .from('enteredparts')
        .update({ 
          paid: true, 
          payment_date: paymentDate 
        })
        .in('id', partIds);
        
      if (updateError) {
        console.error('Error updating payment status:', updateError);
        throw updateError;
      }
      
      console.log(`Marked ${partIds.length} parts as paid with date ${paymentDate}`);
      
      return {
        success: true,
        updatedCount: partIds.length,
        status: 'paid',
        paymentDate
      };
    } 
    // If marking as pending, set paid=false and clear payment_date
    else if (status === 'pending') {
      const { data, error: updateError } = await supabase
        .from('enteredparts')
        .update({ 
          paid: false, 
          payment_date: null 
        })
        .in('id', partIds);
        
      if (updateError) {
        console.error('Error updating payment status:', updateError);
        throw updateError;
      }
      
      console.log(`Marked ${partIds.length} parts as pending (unpaid)`);
      
      return {
        success: true,
        updatedCount: partIds.length,
        status: 'pending',
        paymentDate: null
      };
    }
    
    return {
      success: false,
      error: `Invalid status: ${status}`,
      updatedCount: 0
    };
  } catch (error) {
    console.error('Error updating bonus payment:', error);
    throw error;
  }
};

/**
 * Get quarterly trends for bonus data
 * Shows totals for each quarter across all users
 * @returns {Promise<Array>} - Array of quarterly trend data
 */
export const getQuarterlyBonusTrends = async () => {
  try {
    const allBonuses = await getAllUserBonusesByQuarter();
    
    // Group by quarter
    const quarterMap = {};
    
    allBonuses.forEach(bonus => {
      const key = `${bonus.quarter}_${bonus.year}`;
      
      if (!quarterMap[key]) {
        quarterMap[key] = {
          quarter: bonus.quarterLabel,
          quarterNum: bonus.quarter,
          year: bonus.year,
          partsCount: 0,
          bonusTotal: 0,
          paidAmount: 0,
          pendingAmount: 0,
          userCount: new Set()
        };
      }
      
      quarterMap[key].partsCount += bonus.partCount;
      quarterMap[key].bonusTotal += bonus.bonusAmount;
      quarterMap[key].userCount.add(bonus.userId);
      
      // Calculate paid and pending amounts based on payment status
      if (bonus.paymentStatus === 'paid') {
        quarterMap[key].paidAmount += bonus.bonusAmount;
      } else if (bonus.paymentStatus === 'partial') {
        // For partial payments, we don't have the exact breakdown
        // We'll estimate based on the ratio of paid to total parts
        const paidRatio = bonus.paidCount / bonus.partCount;
        const paidAmount = bonus.bonusAmount * paidRatio;
        quarterMap[key].paidAmount += paidAmount;
        quarterMap[key].pendingAmount += (bonus.bonusAmount - paidAmount);
      } else {
        quarterMap[key].pendingAmount += bonus.bonusAmount;
      }
    });
    
    // Convert to array and sort by date
    return Object.values(quarterMap)
      .map(q => ({
        ...q,
        userCount: q.userCount.size
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.quarterNum - b.quarterNum;
      });
  } catch (error) {
    console.error('Error getting quarterly bonus trends:', error);
    return [];
  }
}; 