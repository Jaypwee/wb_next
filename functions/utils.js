const { logger } = require('firebase-functions'); // Using the v2 logger
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

const SHEET_ID = '1I02FF5o8gKLb7SjbVk7rZHaZGs8sqlje2un1nnA6Yak';

exports.SHEET_ID = SHEET_ID;

exports.getSheetMetadata = async (sheets) => {
    const res_season_meta = await sheets.spreadsheets.values.get({ 
        spreadsheetId: SHEET_ID, 
        range: 'db_metadata!B2:B' 
    });
    
    const values = res_season_meta.data.values;
    if (!values || values.length === 0) {
        throw new Error('No data found in the specified range');
    }

    const [[season_name], [season_start], [season_end], ...inactives] = values;
    
    // Debug logging
    logger.info('Raw inactives data:', {
        inactives,
        length: inactives.length,
        firstRow: inactives[0]
    }, { structuredData: true });
    
    // Convert inactives to a Set of UIDs
    const inactiveSet = new Set(inactives.map(row => row[0]).filter(Boolean));
    
    // Debug logging for Set
    logger.info('Processed inactives Set:', {
        size: inactiveSet.size,
        values: Array.from(inactiveSet)
    }, { structuredData: true });
    
    return {
        season_name,
        season_start,
        season_end,
        inactives: inactiveSet,
    };
};

exports.initializeAuth = async () => {
    try {
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const authClient = await auth.getClient();
        return google.sheets({ version: 'v4', auth: authClient });
    } catch (error) {
        logger.error('Error initializing auth:', error);
        throw error;
    }
}
