/**
 * Fetches season information including total seasons and current season
 * @returns {Promise<{total_seasons: string[], current_season: string}>}
 */
export async function fetchSeasonInfo() {
  const response = await fetch('/api/season/names');
  if (!response.ok) {
    throw new Error('Failed to fetch season info');
  }

  return response.json();
}

/**
 * Fetches dates for a specific season
 * @param {string} seasonName - The name of the season to fetch dates for
 * @returns {Promise<string[]>} Array of formatted strings like "Week x (YYYY-MM-DD)"
 */
export async function fetchSeasonDates(seasonName) {
  const response = await fetch(`/api/season/dates?season_name=${seasonName}`);
  if (!response.ok) {
    throw new Error('Failed to fetch season dates');
  }
  
  const data = await response.json();
  
  // Transform the object into an array of formatted strings
  const formattedDates = Object.entries(data)
    .map(([date, week]) => ({
      date,
      week,
      timestamp: new Date(date).getTime()
    }))
    .sort((a, b) => b.timestamp - a.timestamp) // Sort in descending order
    .map(({ date, week }) => `${week} (${date})`);

    console.log(formattedDates);

  return formattedDates;
} 