import * as XLSX from 'xlsx';

const HOME_SERVER = 249;

// Helper functions (these would need to be imported from the main file or duplicated)
const REQUIRED_COLUMNS_FORMAT_1 = {
  0: 'Lord ID',
  1: 'Name',
  5: 'Current Power',
  6: 'Power',
  7: 'Merits',
  8: 'Units Killed',
  9: 'Units Dead',
  10: 'Units Healed',
  15: 'T5 Kill Count',
  32: 'Mana Spent',
  34: 'Gems Spent'
};

const REQUIRED_COLUMNS_FORMAT_2 = {
  0: 'lord_id',
  1: 'name',
  7: 'power',
  9: 'units_killed',
  11: 'merits',
  12: 'highest_power',
  17: 'units_dead',
  18: 'units_healed',
  34: 'mana_spent',
  36: 'killcount_t5'
};

// Map scan format
const REQUIRED_COLUMNS_FORMAT_3 = {
  0: 'lord_id',
  1: 'name',
  6: 'power',
  12: 'highest_power',
  11: 'merits',
  7: 'units_killed',
  10: 'home_server',
  17: 'units_dead',
  18: 'units_healed',
  34: 'mana_spent',
  36: 'killcount_t5'
};


// Function to detect which format the sheet uses
function detectSheetFormat(headers) {
  // Check Format 1
  const format1Matches = Object.entries(REQUIRED_COLUMNS_FORMAT_1).filter(([index, columnName]) => headers[parseInt(index)] === columnName);
  
  // Check Format 2
  const format2Matches = Object.entries(REQUIRED_COLUMNS_FORMAT_2).filter(([index, columnName]) => headers[parseInt(index)] === columnName);
  
  // Check Format 3
  const format3Matches = Object.entries(REQUIRED_COLUMNS_FORMAT_3).filter(([index, columnName]) => headers[parseInt(index)] === columnName);
  
  // Return the format with more matches, or null if neither has enough matches
  if (format1Matches.length >= Object.keys(REQUIRED_COLUMNS_FORMAT_1).length - 1) {
    return { format: 'format1', columns: REQUIRED_COLUMNS_FORMAT_1 };
  } else if (format2Matches.length >= Object.keys(REQUIRED_COLUMNS_FORMAT_2).length - 1) {
    return { format: 'format2', columns: REQUIRED_COLUMNS_FORMAT_2 };
  } else if (format3Matches.length >= Object.keys(REQUIRED_COLUMNS_FORMAT_3).length - 1) {
    return { format: 'format3', columns: REQUIRED_COLUMNS_FORMAT_3 };
  }
  
  return null;
}

// Function to extract data based on format
function extractRowData(row, format, title) {
  if (format === 'format1') {
    return {
      name: row[1],
      homeServer: Number(row[2]),
      currentPower: Number(row[5]),
      highestPower: Number(row[6]),
      merits: title === 'start' ? 0 : Number(row[7]),
      unitsKilled: Number(row[8]),
      unitsDead: Number(row[9]),
      unitsHealed: Number(row[10]),
      t5KillCount: Number(row[15]),
      manaSpent: Number(row[32]),
      gemsSpent: Number(row[34])
    };
  } else if (format === 'format2') {
    return {
      name: row[1],
      currentPower: Number(row[7]),
      highestPower: Number(row[12]),
      merits: title === 'start' ? 0 : Number(row[11]),
      unitsKilled: Number(row[9]),
      unitsDead: Number(row[17]),
      unitsHealed: Number(row[18]),
      t5KillCount: Number(row[36]),
      manaSpent: Number(row[34]),
      homeServer: Number(row[5]),
      gemsSpent: 0 // Format 2 doesn't have gems spent column
    };
  } else if (format === 'format3') {
    return {
      name: row[1],
      currentPower: Number(row[6]),
      highestPower: Number(row[12]),
      merits: title === 'start' ? 0 : Number(row[11]),
      unitsKilled: Number(row[7]),
      unitsDead: Number(row[17]),
      unitsHealed: Number(row[18]),
      t5KillCount: Number(row[36]),
      manaSpent: Number(row[34]),
      gemsSpent: 0, // Format 3 doesn't have gems spent column
      homeServer: row[10] // Format 3 has home server
    };
  }
  
  return null;
}

/**
 * Processes uploaded file and updates user documents
 * @param {File} file - The uploaded file
 * @param {string} seasonName - Season name (for logging)
 * @param {string} title - Title for the upload (for logging)
 * @param {Object} authenticatedUser - The authenticated user
 * @param {Object} adminDb - Admin Firestore instance
 * @returns {Promise<Object>} Object containing parsedHomeData, targetSheets, and recordCount
 */
export async function processFileUpload(file, adminDb, title, validServers) {
  // Read the file
  const buffer = await file.arrayBuffer();
  let workbook;
  
  // Handle CSV files differently
  if (file.name.match(/\.csv$/i)) {
    // For CSV files, convert to workbook format with better UTF-8 handling
    let csvText;
    
    // Check for BOM and handle different encodings
    const uint8Array = new Uint8Array(buffer);
    
    // Check for UTF-8 BOM (EF BB BF)
    if (uint8Array.length >= 3 && 
        uint8Array[0] === 0xEF && 
        uint8Array[1] === 0xBB && 
        uint8Array[2] === 0xBF) {
      // Remove BOM and decode as UTF-8
      csvText = new TextDecoder('utf-8').decode(buffer.slice(3));
    } else {
      // Try UTF-8 first, fallback to other encodings if needed
      try {
        csvText = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
      } catch (error) {
        // If UTF-8 fails, try with UTF-8 non-fatal mode
        console.log('UTF-8 strict decoding failed, trying non-fatal mode');
        csvText = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
      }
    }
    
    workbook = XLSX.read(csvText, { 
      type: 'string',
      codepage: 65001, // UTF-8 codepage
      cellText: true,
      cellDates: false
    });
  } else {
    // For Excel files
    workbook = XLSX.read(buffer, { type: 'array' });
  }
  
  // Get all sheet names
  const sheetNames = workbook.SheetNames;
  console.log('Available sheets:', sheetNames);

  const targetSheets = sheetNames;
  console.log('Processing sheets:', targetSheets);

  // Get all user IDs from users collection
  const usersSnapshot = await adminDb.collection('users').get();
  const validUserIds = new Set(usersSnapshot.docs.map(doc => doc.id));
  
  // Create a map of user documents for easy lookup and updates
  const userDocsMap = new Map();
  usersSnapshot.docs.forEach(doc => {
    userDocsMap.set(doc.id, { ref: doc.ref, data: doc.data() });
  });
  
  // Parse data into the required format
  const parsedData = {};
  const userUpdates = new Map(); // Track updates for user documents
  const totalData = {};
  
  // Process each target sheet
  for (const sheetName of targetSheets) {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Validate headers and detect format
    const headers = data[0];
    console.log(`Headers for ${sheetName}:`, headers);
    
    const formatDetection = detectSheetFormat(headers);
    
    if (!formatDetection) {
      console.log(`Skipping sheet ${sheetName} - no valid format detected`);
      continue;
    }
    
    console.log(`Sheet ${sheetName} uses ${formatDetection.format}`);

    // Process rows for this sheet
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const lordId = String(row[0]); // Convert to string and ensure it's the first column

      if (lordId) {
        // Extract row data for each users
        const rowData = extractRowData(row, formatDetection.format, title);
        if (rowData && validServers.includes(rowData.homeServer)) {
          // Initialize server entry if it doesn't exist
          if (title !== 'preseason' && rowData.highestPower > 50000000) {
            if (!totalData[rowData.homeServer]) {
              totalData[rowData.homeServer] = { merits: 0, manaSpent: 0, unitsDead: 0 };
            }

            totalData[rowData.homeServer].merits += rowData.merits || 0;
            totalData[rowData.homeServer].manaSpent += rowData.manaSpent || 0;
            totalData[rowData.homeServer].unitsDead += rowData.unitsDead || 0;
          }

          if (rowData.homeServer === HOME_SERVER && validUserIds.has(lordId)) {
            parsedData[lordId] = rowData;

            const userDoc = userDocsMap.get(lordId);
            if (userDoc) {
              const currentData = userDoc.data;
              const updates = {};
              
              // Always update nickname if it exists
              if (rowData.name) {
                updates.nickname = rowData.name;
              }
              
              // Only update if new value is higher than existing
              if (!currentData.highestPower || rowData.highestPower > currentData.highestPower) {
                updates.highestPower = rowData.highestPower;
              }
              
              if (!currentData.unitsKilled || rowData.unitsKilled > currentData.unitsKilled) {
                updates.unitsKilled = rowData.unitsKilled;
              }
              
              if (!currentData.unitsDead || rowData.unitsDead > currentData.unitsDead) {
                updates.unitsDead = rowData.unitsDead;
              }
              
              if (!currentData.manaSpent || rowData.manaSpent > currentData.manaSpent) {
                updates.manaSpent = rowData.manaSpent;
              }
              
              // Only add to updates if there are fields to update
              if (Object.keys(updates).length > 0) {  
                userUpdates.set(lordId, { ref: userDoc.ref, updates });
              }
            }
          } else if (rowData.homeServer !== HOME_SERVER && rowData.highestPower > 50000000) {
            parsedData[lordId] = rowData;
          }
        }
      }
    }
  }

  console.log('Number of records parsed:', Object.keys(parsedData).length);
  console.log('Number of user documents to update:', userUpdates.size);

  // Batch update user documents
  if (userUpdates.size > 0) {
    const batch = adminDb.batch();
    
    userUpdates.forEach(({ ref, updates }) => {
      batch.update(ref, updates);
    });
    
    await batch.commit();
    console.log('User documents updated successfully');
  }

  // Return the parsed data for the route to handle database writing
  return {
    parsedData,
    totalData,
    targetSheets,
    recordCount: Object.keys(parsedData).length
  };
} 