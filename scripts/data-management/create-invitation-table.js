const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createInvitationTable() {
  console.log('=== CREATING ORGANIZATION INVITATIONS TABLE ===');
  console.log('');

  // First check if table already exists
  try {
    const { data: existing } = await supabase
      .from('organization_invitations')
      .select('id')
      .limit(1);

    console.log('✅ organization_invitations table already exists');
    console.log('Checking current structure...');

    const { data: sample } = await supabase
      .from('organization_invitations')
      .select('*')
      .limit(1);

    if (sample && sample.length > 0) {
      const fields = Object.keys(sample[0]);
      console.log('Current fields:');
      fields.forEach(field => console.log('  • ' + field));
    } else {
      console.log('Table exists but has no data');
    }

    return;
  } catch (error) {
    console.log('Table does not exist, creating...');
  }

  // Create the table using SQL
  const createTableSQL = `
    CREATE TABLE organization_invitations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
      invited_by UUID REFERENCES profiles(id),
      invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
      expires_at TIMESTAMP DEFAULT (now() + interval '7 days'),
      used_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    );

    -- Create indexes
    CREATE INDEX idx_organization_invitations_org_id ON organization_invitations(organization_id);
    CREATE INDEX idx_organization_invitations_email ON organization_invitations(email);
    CREATE INDEX idx_organization_invitations_code ON organization_invitations(invite_code);
    CREATE INDEX idx_organization_invitations_expires ON organization_invitations(expires_at);

    -- Enable RLS
    ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    CREATE POLICY "Users can view invitations for their organizations" ON organization_invitations
      FOR SELECT USING (
        organization_id IN (
          SELECT organization_id
          FROM profile_organizations
          WHERE profile_id = auth.uid() AND role IN ('admin', 'owner')
        )
      );

    CREATE POLICY "Organization admins can insert invitations" ON organization_invitations
      FOR INSERT WITH CHECK (
        organization_id IN (
          SELECT organization_id
          FROM profile_organizations
          WHERE profile_id = auth.uid() AND role IN ('admin', 'owner')
        )
      );

    CREATE POLICY "Organization admins can update invitations" ON organization_invitations
      FOR UPDATE USING (
        organization_id IN (
          SELECT organization_id
          FROM profile_organizations
          WHERE profile_id = auth.uid() AND role IN ('admin', 'owner')
        )
      );

    CREATE POLICY "Organization admins can delete invitations" ON organization_invitations
      FOR DELETE USING (
        organization_id IN (
          SELECT organization_id
          FROM profile_organizations
          WHERE profile_id = auth.uid() AND role IN ('admin', 'owner')
        )
      );
  `;

  try {
    // Execute the SQL via a simple RPC call
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });

    if (error) {
      console.log('❌ Error creating table:', error.message);
      return;
    }

    console.log('✅ organization_invitations table created successfully');
    console.log('✅ Indexes created');
    console.log('✅ RLS policies applied');

  } catch (error) {
    console.log('❌ Error:', error.message);

    // Fall back to checking if we can use the table anyway
    try {
      const { data } = await supabase
        .from('organization_invitations')
        .select('*')
        .limit(1);
      console.log('✅ Table appears to be accessible');
    } catch (e) {
      console.log('❌ Table creation failed completely');
    }
  }
}

createInvitationTable().catch(console.error);