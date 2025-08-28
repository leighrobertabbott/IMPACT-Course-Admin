
// Add this to your functions/index.js
exports.provisionFirebaseProjectSimple = onCall(async (request) => {
  try {
    const { siteSlug, userEmail } = request.data;

    if (!siteSlug || !userEmail) {
      throw new Error('Site slug and user email are required');
    }

    // Generate unique project ID
    const projectId = `${siteSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-")}-${crypto.randomBytes(4).toString("hex")}`;
    const displayName = `IMPACT - ${siteSlug}`;
    const region = process.env.FIRESTORE_REGION || "europe-west2";

    console.log(`Starting provisioning for project: ${projectId} for user: ${userEmail}`);

    // Use your service account to create the project
    // This bypasses the need for user OAuth
    const project = await gapi("https://cloudresourcemanager.googleapis.com/v1/projects", "POST", null, {
      projectId,
      name: displayName,
    });

    // Continue with the rest of your provisioning logic...
    // (same as before, but using service account instead of user OAuth)

    const url = `https://${projectId}.web.app`;

    return {
      success: true,
      url,
      projectId,
      message: `Your IMPACT system is ready at: ${url}`
    };

  } catch (error) {
    console.error('Provisioning error:', error);
    throw new Error(error.message || 'Failed to provision Firebase project');
  }
});
