require('dotenv').config();
const admin = require('firebase-admin');

try {
  const sa = require('./firebase-service-account.json');
  admin.initializeApp({ credential: admin.credential.cert(sa) });
  console.log('✅ Firebase Admin SDK initialized OK');
  console.log('   Project:', sa.project_id);
  console.log('   Client email:', sa.client_email);
  process.exit(0);
} catch (e) {
  console.error('❌ Firebase Admin init FAILED:', e.message);
  process.exit(1);
}
