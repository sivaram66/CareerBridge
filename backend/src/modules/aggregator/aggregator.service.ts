// src/modules/aggregator/aggregator.service.ts

export const fetchGreenhouseJobs = async (boardToken: string) => {
  // 1. Construct the target URL dynamically
  const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs`;

  try {
    // 2. Make the HTTP request to the ATS
    const response = await fetch(url);

    // 3. Handle 404s or API errors safely
    if (!response.ok) {
      throw new Error(`Greenhouse API returned ${response.status} for ${boardToken}`);
    }

    // 4. Parse the raw JSON data
    const data = await response.json();

    // 5. Clean and format the data
    // 5. Clean, format, and FILTER the data
    const formattedJobs = data.jobs
      .map((job: any) => ({
        title: job.title,
        applyUrl: job.absolute_url,
        externalId: job.id.toString(),
        location: job.location.name,
      }))
      .filter((job: any) => {
        // Convert to lowercase for easy text searching
        const titleLower = job.title.toLowerCase();
        const locLower = job.location.toLowerCase();

        // 1. Must be an engineering/tech role
        const isTechRole = titleLower.includes('engineer') || 
                           titleLower.includes('developer') || 
                           titleLower.includes('backend') ||
                           titleLower.includes('frontend');

        // 2. Must be remote-friendly or specifically in India
        const isRemote = locLower.includes('remote') || 
                         locLower.includes('india') || 
                         locLower.includes('anywhere') ||
                         locLower.includes('global');

        // Only keep the job if BOTH conditions are true
        return isTechRole && isRemote;
      });

    return formattedJobs;

  } catch (error) {
    console.error(`Failed to fetch from Greenhouse (${boardToken}):`, error);
    return []; // Return an empty array so our server doesn't crash if one company goes offline
  }
};