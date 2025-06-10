// For 2nd Gen, you import specific function types
const { onRequest } = require('firebase-functions/v2/https');
const { initializeAuth, getSheetMetadata, SHEET_ID } = require('./utils');
const { setGlobalOptions } = require('firebase-functions/v2');
const { logger } = require('firebase-functions'); // Using the v2 logger
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Settings } = require('firebase-admin/firestore');

// Initialize Firebase Admin if it hasn't been initialized
const app = initializeApp();
const db = getFirestore(app);
db.settings({ ignoreUndefinedProperties: true });

/**
 * 1. Initializes Firebase and google sheets
 * 2. Fetches season metadata to understand the current season. If current date is past season_end, this function will not run.
 * 3. Fetches metrics from the current season
 * 4. If season_name has changed from the metadata, it means the kingdom is in a new season. We will create a new document in the sheets collection.
 * 5. It will then update the new document with the new season_name, season_start, season_end, and inactives.
 * 6. It will then update the users collection with the new season_name, season_start, season_end, and inactives.
 */
exports.daily_update = onRequest(
  {
    cors: true,
    timeoutSeconds: 540,
    memory: '256MiB'
  },
  async (req, res) => {
    try {
      const sheets = await initializeAuth();

      // Fetch season metadata
      const { season_name, season_start, season_end, inactives } = await getSheetMetadata(sheets);

      const batch = db.batch();

      const range = req.query.range || 'db_current_metrics!B3:J';
      logger.info(`Working with data from spreadsheet ID: ${SHEET_ID}, range: ${range}`, { structuredData: true });

      // If season_name is in the 'season_start_metrics' collection, we do not need to update.
      const season_start_sheet_ref = db.collection('season_start_metrics').doc(season_name);
      const season_start_doc = await season_start_sheet_ref.get();
      let season_start_obj = {};

      if (!season_start_doc.exists) {  
        const season_start_metrics = await sheets.spreadsheets.values.get({
          spreadsheetId: SHEET_ID,
          range: 'db_season_start!C6:J',
        });

        const season_start_rows = season_start_metrics.data.values;

        for (const row of season_start_rows) {
          const gameuid = row[0];
          const season_highest_power = row[2];
          const season_deaths = row[5]
          const season_kills = row[6]
          const season_heals = row[7]

          season_start_obj[gameuid] = {
            season_highest_power,
            season_deaths,
            season_kills,
            season_heals
          }
        }

        batch.set(season_start_sheet_ref, season_start_obj);
    } else {
      season_start_obj = season_start_doc.data();
      logger.info('Retrieved season start data from Firestore:', {
        season_name,
        season_start_obj,
        timestamp: new Date().toISOString()
      }, { structuredData: true });
    }

      const current_metrics = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: range,
      });

      const sheet_dates = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'db_current_metrics!R3:R4',
      });

      const [[start], [end]] = sheet_dates.data.values;
      
      // Format the date string using Date object
      const [year, month, day] = end.split('.').map(part => part.trim());
      const key = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      const rows = current_metrics.data.values;
      const obj = {};

      const sheetRef = db.collection('sheets').doc(season_name);

      // Process rows sequentially to handle async operations
      for (const row of rows) {
        const gameuid = row[0];
        if (inactives.has(gameuid)) {
          continue;
        }

        const highest_power = row[1];
        const current_power = row[2];
        const merits = row[3];
        const total_deaths = row[4];
        const total_kills = row[5];
        const total_heals = row[6];
        const nickname = row[8];


        const season_kills = parseInt((total_kills || '0').replace(/,/g, '')) - parseInt((season_start_obj[gameuid]?.season_kills || '0').replace(/,/g, ''));
        const season_deaths = parseInt((total_deaths || '0').replace(/,/g, '')) - parseInt((season_start_obj[gameuid]?.season_deaths || '0').replace(/,/g, ''));
        const season_heals = parseInt((total_heals || '0').replace(/,/g, '')) - parseInt((season_start_obj[gameuid]?.season_heals || '0').replace(/,/g, ''));

        // Add to sheets collection object
        obj[gameuid] = {
          highest_power,
          current_power,
          merits,
          total_deaths,
          total_kills,
          total_heals,
          season_kills,
          season_deaths,
          season_heals,
          nickname
        };

        // Find the user document where uid matches
        const usersSnapshot = await db.collection('users')
          .where('gameuid', '==', gameuid)
          .limit(1)
          .get();

        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          batch.update(userDoc.ref, {
            highest_power,
            current_power,
            merits,
            total_deaths,
            total_kills,
            total_heals,
            last_updated: new Date()
          });

          const user_snapshot_data = userDoc.data();
          const user_troop_type = user_snapshot_data.mainTroops;

          obj[gameuid].user_troop_type = user_troop_type;
        }
      }

      if (rows && rows.length) {
        try {
          // First check if document exists
          const doc = await sheetRef.get();
 
          if (!doc.exists) {
            // If document doesn't exist, create it with initial data
            batch.set(sheetRef, {
              season_start,
              season_end,
              [key]: obj
            });
          } else {
            // If document exists, update it with new key-value pair
            batch.update(sheetRef, {
              [key]: obj
            });
          }

          // Commit the batch
          await batch.commit();
          
          res.status(200).json({
            message: `Successfully retrieved and stored data for season: ${season_name}`,
            rowCount: rows.length,
            data: obj,
          });
        } catch (firestoreError) {
          logger.error('Error updating Firestore:', firestoreError);
          throw firestoreError;
        }
      } else {
        logger.info('No data found for the specified range.', { structuredData: true });
        res.status(200).json({
          message: 'No data found for the specified range.',
          data: {},
        });
      }
    } catch (error) {
      logger.error('Error:', error.message, error.stack, { structuredData: true });
      const detailedError = error.response && error.response.data ? error.response.data.error : error.message;
      res.status(500).send(`Error: ${detailedError}`);
    }
  }
);