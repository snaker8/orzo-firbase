import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// [INSTRUCTION]
// 1. Download your Service Account Key JSON from Firebase Console -> Project Settings -> Service accounts.
// 2. Save it as 'serviceAccountKey.json' in this folder or set GOOGLE_APPLICATION_CREDENTIALS environment variable.
// 3. Run: `node scripts/migrate_users.js`

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
    // Read JSON file using fs since 'require' is not available in ESM for dynamic imports easily without flags
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} else {
    // Fallback to default credentials (if env var set)
    admin.initializeApp();
    console.log("No serviceAccountKey.json found. Using default application credentials.");
}

const db = admin.firestore();
const usersFilePath = path.join(__dirname, '../users.json');

async function migrateUsers() {
    if (!fs.existsSync(usersFilePath)) {
        console.error("users.json not found!");
        return;
    }

    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    console.log(`Found ${usersData.length} users to migrate.`);

    let successCount = 0;
    let failCount = 0;

    for (const user of usersData) {
        try {
            const email = user.id.includes('@') ? user.id : `${user.id}@orzo.edu`;
            const uid = user.id; // Use ID as UID or let Firebase generate?
            // Let's rely on email as unique identifier for Auth.

            // 1. Create Auth User
            let userRecord;
            try {
                userRecord = await admin.auth().getUserByEmail(email);
                console.log(`[Skip] Auth user already exists: ${email}`);
            } catch (e) {
                if (e.code === 'auth/user-not-found') {
                    let password = user.pw || '123456';
                    if (password.length < 6) {
                        console.log(`[Warning] Password for ${user.name} is too short (${password}). Setting to '123456'.`);
                        password = '123456';
                    }

                    userRecord = await admin.auth().createUser({
                        email: email,
                        password: password,
                        displayName: user.name,
                        uid: user.id // Optional: force UID to match existing ID if compatible
                    });
                    console.log(`[Auth] Created user: ${email}`);
                } else {
                    throw e;
                }
            }

            // 2. Create Firestore Doc
            await db.collection('users').doc(user.id).set({
                id: user.id,
                uid: userRecord.uid,
                email: email,
                name: user.name,
                role: user.role || 'student',
                center: user.center || '전체',
                approved: true,
                migratedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log(`[Firestore] Synced doc for: ${user.name}`);
            successCount++;

        } catch (error) {
            console.error(`[Error] Failed to migrate ${user.name}:`, error.message);
            failCount++;
        }
    }

    console.log(`Migration Complete. Success: ${successCount}, Failed: ${failCount}`);
}

migrateUsers().catch(console.error);
