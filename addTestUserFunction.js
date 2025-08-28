
// Add this to your functions/index.js
exports.addTestUser = onCall(async (request) => {
  try {
    const { email } = request.data;
    
    if (!email) {
      throw new Error('Email is required');
    }

    console.log(`Adding ${email} to test users...`);

    // Use Google Cloud API to add test user
    const response = await fetch(`https://oauth2.googleapis.com/oauth2/v1/projects/mwl-impact/consent/testUsers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email
      })
    });

    if (response.ok) {
      console.log(`Successfully added ${email} to test users`);
      return { success: true, message: 'User added to test users' };
    } else {
      console.error('Failed to add test user:', response.statusText);
      return { success: false, message: 'Failed to add test user' };
    }

  } catch (error) {
    console.error('Error adding test user:', error);
    throw new Error('Failed to add test user');
  }
});
