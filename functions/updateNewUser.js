const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { logger } = require('firebase-functions');

// Initialize Firebase Admin if it hasn't been initialized
const app = initializeApp();
const db = getFirestore(app);

exports.updateUserGameUid = onRequest(
  {
    cors: true,
    methods: ['POST']
  },
  async (req, res) => {
    // Check if the request method is POST
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. Please use POST.' });
      return;
    }

    try {
      const { user_uid, game_uid } = req.body;

      // Validate input
      if (!user_uid || !game_uid) {
        res.status(400).json({ 
          error: 'Missing required fields',
          required: ['user_uid', 'game_uid']
        });
        return;
      }

      
        const userProfile = doc(collection(FIRESTORE, 'users'), newUser.user?.uid);

        await setDoc(userProfile, {
        uid: user_uid,
        email,
        nickname,
        gameuid: game_uid,
        nationality,
        mainTroops,
        });
      logger.info(`Successfully updated game_uid for user ${user_uid}`, {
        user_uid,
        game_uid,
        timestamp: new Date().toISOString()
      }, { structuredData: true });

      res.status(200).json({
        message: 'Successfully updated user game_uid',
        user_uid,
        game_uid
      });

    } catch (error) {
      logger.error('Error updating user game_uid:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
);
