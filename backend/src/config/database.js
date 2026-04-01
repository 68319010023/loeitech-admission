const { createClient } = require('@supabase/supabase-js');
const { mockStudents, mockDepartments, mockCourses, mockInventory } = require('./mockData');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if using mock data (development)
const isUsingMock = supabaseUrl?.includes('mock.supabase.co');

let supabase, supabaseAdmin;

if (isUsingMock) {
  // Mock database operations for development
  supabase = {
    from: (table) => ({
      select: () => ({
        eq: () => ({
          data: table === 'students' ? mockStudents : 
                table === 'departments' ? mockDepartments : 
                table === 'courses' ? mockCourses :
                table === 'inventory' ? mockInventory : [],
          error: null
        }),
        data: table === 'students' ? mockStudents : 
              table === 'departments' ? mockDepartments : 
              table === 'courses' ? mockCourses :
              table === 'inventory' ? mockInventory : [],
        error: null
      }),
      insert: (data) => ({
        select: () => ({
          single: () => ({
            data: { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() },
            error: null
          })
        })
      }),
      update: (data) => ({
        eq: () => ({
          select: () => ({
            single: () => ({
              data: { ...data, updatedAt: new Date().toISOString() },
              error: null
            })
          })
        })
      }),
      delete: () => ({
        eq: () => ({
          error: null
        })
      })
    })
  };
  
  supabaseAdmin = supabase;
} else {
  // Real Supabase client
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration. Please check your .env file.');
  }
  
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

module.exports = {
  supabase,
  supabaseAdmin,
  isUsingMock
};
