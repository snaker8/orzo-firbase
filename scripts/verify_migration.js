import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} else {
    console.error("No serviceAccountKey.json found!");
    process.exit(1);
}

async function verifyUsers() {
    console.log("Checking User Migration Status...");

    // Check key users from users.json to see if they exist in Auth
    const keyUsers = ['admin', 'student1', 'student2'];

    for (const uid of keyUsers) {
        const email = `${uid}@orzo.edu`;
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            console.log(`[OK] User '${uid}' exists (uid: ${userRecord.uid})`);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log(`[MISSING] User '${uid}' (${email}) NOT FOUND in Auth.`);
            } else {
                console.error(`[ERROR] checking ${uid}:`, error.message);
            }
        }
    }
}

verifyUsers().then(() => process.exit(0));
