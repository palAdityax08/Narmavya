// ─── Seed Script — Import mpProducts.js into MongoDB Atlas ───────────────────
// Run once with: npm run seed
// This reads the static frontend data and imports all 84 products into the DB.
// After seeding, your admin dashboard can manage them live.

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product  = require('../models/Product');

// ── Inline copy of mpProducts (avoids ES Module import issues in CJS) ──────────
// The canonical source is src/data/mpProducts.js. This script uses a CommonJS
// require-compatible version. If you add products to mpProducts.js, re-run seed.
// NOTE: We read the file as text and eval it since it uses ES module syntax.
const fs   = require('fs');
const path = require('path');

function loadMpProducts() {
  const filePath = path.resolve(__dirname, '../../src/data/mpProducts.js');
  let src = fs.readFileSync(filePath, 'utf-8');

  // Convert ES module exports to plain JS objects we can eval
  src = src
    .replace(/export const mpProducts/g, 'const mpProducts')
    .replace(/export const mpCategories/g, 'const mpCategories')
    .replace(/export const artisans/g, 'const artisans')
    .replace(/export const testimonials/g, 'const testimonials');

  // Eval in a sandboxed scope
  const fn = new Function(`${src}; return { mpProducts, mpCategories };`);
  return fn();
}

async function seed() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas…');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected');

    const { mpProducts } = loadMpProducts();
    console.log(`📦 Found ${mpProducts.length} products in mpProducts.js`);

    let created = 0;
    let skipped = 0;
    let errors  = 0;

    for (const p of mpProducts) {
      try {
        // Check if already seeded (by legacyId)
        const exists = await Product.findOne({ legacyId: p.id });
        if (exists) {
          skipped++;
          continue;
        }

        // Build the document
        const imageUrl = p.image || '';
        const doc = {
          legacyId:      p.id,
          title:         p.title,
          titleHi:       p.titleHi || '',
          category:      p.category,
          price:         p.price,
          originalPrice: p.originalPrice || null,
          // Wrap single image into the images[] array
          images:        imageUrl ? [imageUrl] : [],
          image:         imageUrl,
          description:   p.description || '',
          badge:         p.badge || '',
          origin:        p.origin || '',
          artisan:       p.artisan || '',
          rating:        p.rating || 0,
          reviewCount:   p.reviews || 0,
          inStock:       p.inStock !== false, // default true
          stock:         p.stock || null,
          isGiTagged:    (p.badge || '').toLowerCase().includes('gi') || false,
        };

        await Product.create(doc);
        created++;

        if (created % 10 === 0) {
          console.log(`  ✔ ${created} products seeded so far…`);
        }
      } catch (err) {
        console.error(`  ✗ Failed to seed product id=${p.id} "${p.title}": ${err.message}`);
        errors++;
      }
    }

    console.log('\n─────────────────────────────────────');
    console.log(`✅ Seed complete:`);
    console.log(`   Created : ${created}`);
    console.log(`   Skipped : ${skipped} (already in DB)`);
    console.log(`   Errors  : ${errors}`);
    console.log('─────────────────────────────────────\n');

    // Make yourself admin (optional – update your email here)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    if (ADMIN_EMAIL) {
      const User = require('../models/User');
      const result = await User.findOneAndUpdate(
        { email: ADMIN_EMAIL },
        { role: 'admin' },
        { new: true }
      );
      if (result) {
        console.log(`👑 Promoted ${ADMIN_EMAIL} to admin`);
      } else {
        console.log(`⚠️  Admin email ${ADMIN_EMAIL} not found in DB yet (register first, then re-run)`);
      }
    }

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();
