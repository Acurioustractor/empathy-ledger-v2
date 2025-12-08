const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yvnuayzslukamizrlhwb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bnVheXpzbHVrYW1penJsaHdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI0NDg1MCwiZXhwIjoyMDcxODIwODUwfQ.natmxpGJM9oZNnCAeMKo_D3fvkBz9spwwzhw7vbkT0k';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAnotherOrganizationWithPhotos() {
  try {
    console.log('🏢 Setting up another organization with photo galleries...\n');
    
    // Generate UUIDs for new entities
    function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    
    const ORG_ID = generateUUID();
    const TENANT_ID = 'bf17d0a9-2b12-4e4a-982e-09a8b1952ec6'; // Use existing Oonchiumpa tenant
    const PROJECT_ID = generateUUID();
    const STORYTELLER_ID = 'd0a162d2-282e-4653-9d12-aa934c9dfa4e'; // Benjamin Knight
    const GALLERY_ID = generateUUID();
    
    // 1. Create a new organization
    console.log('📋 Creating new organization...');
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        id: ORG_ID,
        name: 'Cultural Healing Center',
        type: 'community_center',
        location: 'Traditional Territory',
        website_url: 'https://culturalhealingcenter.org',
        contact_email: 'info@culturalhealingcenter.org',
        description: 'A community center focused on cultural healing practices and traditional knowledge preservation',
        cultural_significance: 'Center for traditional healing and cultural education',
        tenant_id: TENANT_ID
      })
      .select()
      .single();
    
    if (orgError) {
      console.error('❌ Organization error:', orgError.message);
      return;
    }
    console.log('✅ Created organization:', organization.name);
    
    // 2. Create a project for this organization
    console.log('\n📂 Creating project...');
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        id: PROJECT_ID,
        name: 'Traditional Healing Gardens',
        description: 'Documenting traditional medicinal plants and healing practices in our community gardens',
        organization_id: ORG_ID,
        status: 'active',
        start_date: '2024-03-01',
        tenant_id: TENANT_ID
      })
      .select()
      .single();
    
    if (projectError) {
      console.error('❌ Project error:', projectError.message);
      return;
    }
    console.log('✅ Created project:', project.name);
    
    // 3. Create a photo gallery
    console.log('\n🖼️ Creating photo gallery...');
    const { data: gallery, error: galleryError } = await supabase
      .from('photo_galleries')
      .insert({
        id: GALLERY_ID,
        title: 'Traditional Healing Gardens Collection',
        description: 'Photos documenting traditional medicinal plants, garden practices, and healing ceremonies',
        gallery_type: 'project',
        storyteller_id: STORYTELLER_ID,
        organization_id: ORG_ID,
        project_id: PROJECT_ID,
        privacy_level: 'organization',
        cultural_sensitivity_level: 'standard',
        requires_elder_approval: true,
        auto_organize_enabled: true,
        face_grouping_enabled: false,
        location_grouping_enabled: true,
        tenant_id: TENANT_ID,
        created_by: STORYTELLER_ID
      })
      .select()
      .single();
    
    if (galleryError) {
      console.error('❌ Gallery error:', galleryError.message);
      return;
    }
    console.log('✅ Created gallery:', gallery.title);
    
    // 4. Create some media assets and link them to the gallery
    console.log('\n📸 Creating media assets and linking to gallery...');
    
    const mediaAssets = [];
    const photoData = [
      {
        filename: 'medicinal_plants_elder_teachings.jpg',
        title: 'Elder Teaching About Medicinal Plants',
        description: 'Elder Mary demonstrates traditional plant identification and harvesting techniques in the healing garden'
      },
      {
        filename: 'traditional_garden_ceremony.jpg',
        title: 'Garden Blessing Ceremony',
        description: 'Community gathering for the annual garden blessing ceremony before planting season'
      },
      {
        filename: 'healing_plant_collection.jpg',
        title: 'Traditional Healing Plant Collection',
        description: 'Collection of traditional medicinal plants cultivated in the community healing garden'
      },
      {
        filename: 'plant_preparation_workshop.jpg',
        title: 'Plant Medicine Preparation Workshop',
        description: 'Community members learning traditional methods of preparing plant medicines'
      },
      {
        filename: 'garden_harvest_celebration.jpg',
        title: 'Garden Harvest Celebration',
        description: 'Annual celebration of the healing garden harvest with traditional foods and medicines'
      },
      {
        filename: 'elder_plant_knowledge_sharing.jpg',
        title: 'Elder Sharing Plant Knowledge',
        description: 'Elder Joseph sharing traditional knowledge about the spiritual properties of healing plants'
      },
      {
        filename: 'traditional_drying_methods.jpg',
        title: 'Traditional Plant Drying Methods',
        description: 'Demonstration of traditional methods for drying and preserving medicinal plants'
      },
      {
        filename: 'community_plant_walk.jpg',
        title: 'Community Plant Walk',
        description: 'Guided walk through the healing gardens with community members learning plant identification'
      }
    ];
    
    for (let i = 0; i < photoData.length; i++) {
      const photo = photoData[i];
      const mediaAssetId = generateUUID();
      
      console.log(`   Creating media asset ${i + 1}/${photoData.length}: ${photo.filename}`);
      
      // Create media asset
      const { data: mediaAsset, error: assetError } = await supabase
        .from('media_assets')
        .insert({
          id: mediaAssetId,
          filename: photo.filename,
          original_filename: photo.filename,
          file_type: 'image',
          file_path: `healing-gardens/${photo.filename}`,
          title: photo.title,
          description: photo.description,
          organization_id: ORG_ID,
          storage_bucket: 'media',
          storage_path: `healing-gardens/${photo.filename}`,
          tenant_id: TENANT_ID,
          uploader_id: STORYTELLER_ID,
          file_size: 2500000 + (i * 300000), // 2.5MB - 4.9MB
          mime_type: 'image/jpeg',
          url: `https://yvnuayzslukamizrlhwb.supabase.co/storage/v1/object/public/media/healing-gardens/${photo.filename}`,
          created_at: new Date(Date.now() - (i * 86400000)).toISOString(), // Spread over last 8 days
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (assetError) {
        console.error(`     ❌ Error creating media asset: ${assetError.message}`);
        continue;
      }
      
      mediaAssets.push(mediaAssetId);
      
      // Link to gallery
      const { data: galleryItem, error: galleryItemError } = await supabase
        .from('photo_gallery_items')
        .insert({
          gallery_id: GALLERY_ID,
          media_asset_id: mediaAssetId,
          added_by: STORYTELLER_ID,
          display_order: i,
          is_featured: i === 0, // Make first photo featured
          caption: photo.title
        })
        .select()
        .single();
      
      if (galleryItemError) {
        console.error(`     ❌ Error linking to gallery: ${galleryItemError.message}`);
      }
    }
    
    console.log(`✅ Created and linked ${mediaAssets.length} media assets to gallery`);
    
    // 5. Update the gallery photo count
    console.log('\n📊 Updating gallery photo count...');
    const { data: updatedGallery, error: updateError } = await supabase
      .from('photo_galleries')
      .update({
        photo_count: mediaAssets.length,
        total_size_bytes: mediaAssets.length * 3000000, // Approximate total size
        last_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', GALLERY_ID)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Error updating gallery:', updateError.message);
    } else {
      console.log('✅ Updated gallery photo count:', updatedGallery.photo_count);
    }
    
    // 6. Summary
    console.log('\n🎉 Setup Summary:');
    console.log(`   🏢 Organization: ${organization.name} (${organization.id})`);
    console.log(`   📂 Project: ${project.name} (${project.id})`);
    console.log(`   🖼️ Gallery: ${gallery.title} (${gallery.id})`);
    console.log(`   📸 Photos: ${mediaAssets.length} media assets created and linked`);
    console.log(`   🌐 Test URL: http://localhost:3001/organizations/${organization.id}/galleries`);
    
    console.log('\n🔗 URLs to test:');
    console.log(`   • Organization: http://localhost:3001/organizations/${organization.id}`);
    console.log(`   • Galleries: http://localhost:3001/organizations/${organization.id}/galleries`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupAnotherOrganizationWithPhotos();