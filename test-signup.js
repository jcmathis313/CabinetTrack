// Test script to debug organization creation
// Run this in your browser console or as a Node.js script

const testSignup = async () => {
  const supabaseUrl = 'https://oxkdjossstzpiewqncni.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94a2Rqb3Nzc3R6cGlld3FuY25pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NzE5MjAsImV4cCI6MjA3MDM0NzkyMH0.AaNByPLw37pgjBmOXx7_mIoPZ2KsCO3lCtoC1m8uExE';

  // Create Supabase client
  const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Testing organization creation...');

  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Connection test failed:', testError);
      return;
    }
    console.log('✓ Connection successful');

    // Test 2: Check if organization slug is available
    const testSlug = 'test-org-' + Date.now();
    console.log('2. Testing slug availability for:', testSlug);
    
    const { data: existingOrg, error: slugError } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', testSlug)
      .single();

    if (slugError && slugError.code !== 'PGRST116') {
      console.error('Slug check failed:', slugError);
      return;
    }
    console.log('✓ Slug check successful');

    // Test 3: Try to create organization
    console.log('3. Testing organization creation...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: 'Test Organization',
        slug: testSlug,
        plan: 'free',
        is_active: true
      })
      .select()
      .single();

    if (orgError) {
      console.error('❌ Organization creation failed:', orgError);
      console.error('Error details:', {
        code: orgError.code,
        message: orgError.message,
        details: orgError.details,
        hint: orgError.hint
      });
      return;
    }
    console.log('✓ Organization created successfully:', org);

    // Test 4: Try to create user
    console.log('4. Testing user creation...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        organization_id: org.id,
        email: 'test@example.com',
        username: 'testuser',
        password_hash: 'testpassword',
        first_name: 'Test',
        last_name: 'User',
        role: 'admin',
        is_active: true,
        email_verified: true
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ User creation failed:', userError);
      console.error('Error details:', {
        code: userError.code,
        message: userError.message,
        details: userError.details,
        hint: userError.hint
      });
      return;
    }
    console.log('✓ User created successfully:', user);

    // Test 5: Try to create organizational settings
    console.log('5. Testing organizational settings creation...');
    const { data: settings, error: settingsError } = await supabase
      .from('organizational_settings')
      .insert({
        organization_id: org.id,
        company_name: 'Test Organization',
        company_address: '',
        company_phone: ''
      })
      .select()
      .single();

    if (settingsError) {
      console.error('❌ Organizational settings creation failed:', settingsError);
      console.error('Error details:', {
        code: settingsError.code,
        message: settingsError.message,
        details: settingsError.details,
        hint: settingsError.hint
      });
      return;
    }
    console.log('✓ Organizational settings created successfully:', settings);

    console.log('🎉 All tests passed! Organization creation should work.');

    // Cleanup: Delete test data
    console.log('6. Cleaning up test data...');
    await supabase.from('organizational_settings').delete().eq('organization_id', org.id);
    await supabase.from('users').delete().eq('organization_id', org.id);
    await supabase.from('organizations').delete().eq('id', org.id);
    console.log('✓ Test data cleaned up');

  } catch (error) {
    console.error('❌ Test failed with unexpected error:', error);
  }
};

// Run the test
testSignup();
