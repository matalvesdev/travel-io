import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test@travelio.dev';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'Test1234!';

async function globalSetup() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('⚠️  Skipping E2E setup: missing Supabase env vars');
    return;
  }

  const admin = createClient(supabaseUrl, supabaseServiceKey);

  const { data: existing } = await admin.auth.admin.listUsers();
  const user = existing?.users?.find((u) => u.email === TEST_EMAIL);

  if (user) {
    console.log(`✅ Test user exists: ${TEST_EMAIL}`);
    return;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });

  if (error) {
    console.error('❌ Failed to create test user:', error.message);
    return;
  }

  console.log(`✅ Test user created: ${TEST_EMAIL} (id: ${data.user.id})`);
}

export default globalSetup;
