const functions = require("firebase-functions");
const admin = require("firebase-admin");
const xlsx = require("xlsx");
const path = require("path");
const os = require("os");
const fs = require("fs");

admin.initializeApp();
const db = admin.firestore();

/**
 * Helper: Parse File (Exact copy from server.js)
 * Robust Encoding Handling for CSV files
 */
const parseFile = (filePath) => {
    try {
        const isCsv = filePath.toLowerCase().endsWith('.csv');
        let workbook;

        if (isCsv) {
            const fileBuffer = fs.readFileSync(filePath);
            let fileContent;

            // [SMART ENCODING DETECTION v2.1]
            try {
                // 1. Try UTF-8 first (Strict)
                const utfDecoder = new TextDecoder('utf-8', { fatal: true });
                fileContent = utfDecoder.decode(fileBuffer);
            } catch (e) {
                // 2. Fallback to EUC-KR (Common for Korean Excel CSVs)
                try {
                    const eucDecoder = new TextDecoder('euc-kr', { fatal: true });
                    fileContent = eucDecoder.decode(fileBuffer);
                } catch (e2) {
                    // 3. Fallback to Latin-1
                    console.warn(`[Parser] Encoding detection failed for ${path.basename(filePath)}. Falling back to Latin1.`);
                    fileContent = fileBuffer.toString('latin1');
                }
            }

            workbook = xlsx.read(fileContent, { type: 'string' });
        } else {
            // Binary read for Excel (xlsx, xls)
            const fileBuffer = fs.readFileSync(filePath);
            workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 1. Read as 2D Array first
        const rawRows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        if (!rawRows || rawRows.length === 0) return [];

        // 2. Find Header Row
        // [UPDATED] Added '성명' to keywords
        const keywords = ['이름', 'Name', '학생', '성명', '담당', '점수', 'Score', '과제', 'Title', '날짜'];
        let headerRowIndex = 0;

        for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
            const rowStr = JSON.stringify(rawRows[i]);
            const matchCount = keywords.filter(k => rowStr.includes(k)).length;
            if (matchCount >= 1) {
                headerRowIndex = i;
                break;
            }
        }

        // 3. Convert to Object Array
        const headers = rawRows[headerRowIndex].map(h => String(h || '').trim());
        const dataRows = rawRows.slice(headerRowIndex + 1);

        const jsonData = dataRows.map(row => {
            let obj = {};
            headers.forEach((h, idx) => {
                if (h) obj[h] = row[idx];
            });
            return obj;
        });

        return jsonData;

    } catch (err) {
        console.error(`[Parse Error] Failed to parse ${path.basename(filePath)}:`, err.message);
        return [];
    }
};

/**
 * Trigger: When a file is uploaded to Firebase Storage.
 * Goal: Parse Excel/CSV and save rows to Firestore 'records' collection.
 * Logic: Exact copy from server.js loadDataAsync()
 */
exports.processFileUpload = functions.storage.object().onFinalize(async (object) => {
    const fileBucket = object.bucket;
    const storagePath = object.name; // File path in the bucket
    const contentType = object.contentType;

    console.log(`[Processing] File: ${storagePath}, Type: ${contentType}`);

    // Verify file type
    if (!storagePath.match(/\.(xlsx|xls|csv)$/i)) {
        return console.log("[Skip] Not an Excel/CSV file.");
    }

    const fileName = path.basename(storagePath);
    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);

    // 1. Download file to temp
    await bucket.file(storagePath).download({ destination: tempFilePath });
    console.log("[Download] File downloaded locally to", tempFilePath);

    // 2. Parse File (Exact same as server.js)
    let records = [];
    try {
        const data = parseFile(tempFilePath);

        if (data.length > 0) {
            // Get folder path from storage path (same logic as server.js)
            // e.g., "uploads/공통반/file.xlsx" -> "공통반"
            const folderPath = path.dirname(storagePath).replace(/^uploads\/?/, '') || '.';

            // Add metadata (Exact same as server.js lines 326-333)
            const nameFromFilename = fileName.split('_')[0];
            records = data.map(row => {
                // Filter out undefined values (Firestore requirement)
                const cleanRow = {};
                Object.keys(row).forEach(key => {
                    if (row[key] !== undefined && row[key] !== null) {
                        cleanRow[key] = row[key];
                    }
                });

                return {
                    ...cleanRow,
                    sourceFile: fileName,
                    folderPath: folderPath,
                    // [FIX] Ensure name exists (from file content OR filename) and Normalize
                    name: String(cleanRow.이름 || cleanRow.Name || cleanRow.학생 || cleanRow.성명 || cleanRow.name || nameFromFilename || "").trim(),
                    _uploadedAt: admin.firestore.FieldValue.serverTimestamp()
                };
            });
        }

        console.log(`[Parse] Extracted ${records.length} records.`);

    } catch (e) {
        console.error("[Error] Parsing failed", e);
        return;
    } finally {
        fs.unlinkSync(tempFilePath); // Cleanup
    }

    // 3. Save to Firestore (Batch write)
    if (records.length > 0) {
        const batchSize = 500;
        let batch = db.batch();
        let count = 0;

        for (const record of records) {
            const docRef = db.collection("records").doc();
            batch.set(docRef, record);
            count++;

            if (count === batchSize) {
                await batch.commit();
                batch = db.batch();
                count = 0;
            }
        }
        if (count > 0) {
            await batch.commit();
        }
        console.log("[Firestore] Save completed.");
    }
});
