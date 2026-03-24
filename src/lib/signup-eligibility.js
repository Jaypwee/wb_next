export const SIGNUP_ALLOWLIST_HOME_SERVER = 249;
export const SIGNUP_ALLOWLIST_MIN_HIGHEST_POWER = 50000000;

export const SIGNUP_ELIGIBILITY_SOURCE = {
  MANUAL: 'manual',
  UPLOAD: 'upload',
};

function normalizeNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function isAutoSignupEligible(userData) {
  return (
    normalizeNumber(userData?.homeServer) === SIGNUP_ALLOWLIST_HOME_SERVER &&
    normalizeNumber(userData?.highestPower) > SIGNUP_ALLOWLIST_MIN_HIGHEST_POWER
  );
}

export function isSignupAllowed(userData) {
  const signupEligibility = userData?.signupEligibility;

  if (typeof signupEligibility?.allowed === 'boolean') {
    return signupEligibility.allowed;
  }

  // Legacy placeholder documents allowed signup implicitly by existing.
  return true;
}

export function buildSignupEligibility({
  allowed,
  managed,
  source,
  seasonName,
  title,
  type,
  updatedAt,
}) {
  return {
    allowed,
    managed,
    source,
    updatedAt,
    ...(seasonName ? { seasonName } : {}),
    ...(title ? { title } : {}),
    ...(type ? { type } : {}),
  };
}

export function buildManagedUploadEligibility({
  allowed,
  seasonName,
  title,
  type,
  updatedAt,
}) {
  return buildSignupEligibility({
    allowed,
    managed: true,
    source: SIGNUP_ELIGIBILITY_SOURCE.UPLOAD,
    seasonName,
    title,
    type,
    updatedAt,
  });
}

export function buildManualSignupEligibility(updatedAt) {
  return buildSignupEligibility({
    allowed: true,
    managed: false,
    source: SIGNUP_ELIGIBILITY_SOURCE.MANUAL,
    updatedAt,
  });
}

function buildSpreadsheetUserFields(userId, userData) {
  return {
    gameuid: userId,
    nickname: userData?.name || null,
    highestPower: normalizeNumber(userData?.highestPower),
    unitsKilled: normalizeNumber(userData?.unitsKilled),
    unitsDead: normalizeNumber(userData?.unitsDead),
    manaSpent: normalizeNumber(userData?.manaSpent),
    homeServer: normalizeNumber(userData?.homeServer),
  };
}

async function commitUserBatches(adminDb, operations) {
  if (operations.length === 0) {
    return;
  }

  const batchSize = 500;

  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = adminDb.batch();
    const currentBatch = operations.slice(i, i + batchSize);

    currentBatch.forEach(({ ref, data }) => {
      batch.set(ref, data, { merge: true });
    });

    await batch.commit();
  }
}

export async function syncSignupEligibilityFromUpload({
  adminDb,
  eligibleUsersById,
  seasonName,
  title,
  type,
}) {
  const syncedAt = new Date().toISOString();
  const usersSnapshot = await adminDb.collection('users').get();
  const existingUserIds = new Set(usersSnapshot.docs.map((doc) => doc.id));
  const operations = [];

  usersSnapshot.docs.forEach((doc) => {
    const userData = doc.data();
    const hasSignedUp = Boolean(userData.uid);
    const hasPrivilegedRole = Boolean(userData.role);

    if (hasSignedUp || hasPrivilegedRole) {
      return;
    }

    const matchedUploadUser = eligibleUsersById[doc.id];

    if (matchedUploadUser) {
      operations.push({
        ref: doc.ref,
        data: {
          ...buildSpreadsheetUserFields(doc.id, matchedUploadUser),
          signupEligibility: buildManagedUploadEligibility({
            allowed: true,
            seasonName,
            title,
            type,
            updatedAt: syncedAt,
          }),
          updatedAt: syncedAt,
        },
      });
      return;
    }

    operations.push({
      ref: doc.ref,
      data: {
        signupEligibility: buildManagedUploadEligibility({
          allowed: false,
          seasonName,
          title,
          type,
          updatedAt: syncedAt,
        }),
        updatedAt: syncedAt,
      },
    });
  });

  Object.entries(eligibleUsersById).forEach(([userId, userData]) => {
    if (existingUserIds.has(userId)) {
      return;
    }

    operations.push({
      ref: adminDb.collection('users').doc(userId),
      data: {
        ...buildSpreadsheetUserFields(userId, userData),
        createdAt: syncedAt,
        updatedAt: syncedAt,
        signupEligibility: buildManagedUploadEligibility({
          allowed: true,
          seasonName,
          title,
          type,
          updatedAt: syncedAt,
        }),
      },
    });
  });

  await commitUserBatches(adminDb, operations);

  return {
    syncedAt,
    allowedCount: Object.keys(eligibleUsersById).length,
    updatedCount: operations.length,
  };
}
