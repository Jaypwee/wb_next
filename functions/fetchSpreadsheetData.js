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

      const sheet_actives = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'S5 조사 대상 선정!B6:D',
      });

      const actives = sheet_actives.data.values;

      // Process actives data and write to user database
      for (const row of actives) {
        // Skip if row is empty or user is inactive
        if (!row || row.length < 3 || row[2] === '비활동') {
          continue;
        }

        const nickname = row[0];
        const gameuid = row[1];

        // Create or update user document
        const userRef = db.collection('users').doc(gameuid);
        
        try {
          await userRef.set({
            nickname,
            gameuid,
            last_updated: new Date()
          }, { merge: true });
          
          logger.info(`Successfully processed user: ${nickname} (${gameuid})`, { structuredData: true });
        } catch (error) {
          logger.error(`Error processing user ${gameuid}:`, error, { structuredData: true });
        }
      }

      // Commit the batch
      await batch.commit();
      
      res.status(200).json({
        message: `Successfully retrieved and stored data for season: ${season_name}`,
        rowCount: actives.length
      });

    } catch (error) {
      logger.error('Error:', error.message, error.stack, { structuredData: true });
      const detailedError = error.response && error.response.data ? error.response.data.error : error.message;
      res.status(500).send(`Error: ${detailedError}`);
    }
  }
);