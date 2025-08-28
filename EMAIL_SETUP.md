# Email Setup Guide for IMPACT Course System

## Overview
The IMPACT Course system uses **Resend.com** as the email service provider for sending automated emails to candidates, faculty, and administrators.

## Why Resend.com?
- **Free Tier**: 3,000 emails/month free
- **Excellent Deliverability**: 99.9% delivery rate
- **Simple Setup**: Easy API integration
- **Professional**: Used by many production applications
- **No App Passwords Required**: Unlike Gmail

## Setup Instructions

### Step 1: Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Get API Key
1. After verification, go to the dashboard
2. Click "API Keys" in the sidebar
3. Click "Create API Key"
4. Give it a name (e.g., "IMPACT Course System")
5. Copy the API key (starts with `re_`)

### Step 3: Set Up Firebase Environment Variables

#### Option A: Using Firebase CLI (Recommended)
```bash
# Set the Resend API key
firebase functions:config:set resend.api_key="your-resend-api-key-here"

# Set the from email address
firebase functions:config:set email.from="IMPACT Course <noreply@mwl-impact.web.app>"
```

#### Option B: Using Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Functions > Configuration
4. Add the following environment variables:
   - `RESEND_API_KEY`: Your Resend API key
   - `FROM_EMAIL`: `IMPACT Course <noreply@mwl-impact.web.app>`

### Step 4: Update Functions Code
The functions code has already been updated to use Resend. The configuration is now:
```javascript
const transporter = nodemailer.createTransporter({
  host: 'smtp.resend.com',
  port: 465,
  secure: true,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY
  }
});
```

### Step 5: Deploy Functions
```bash
firebase deploy --only functions
```

## Email Templates Available

The system includes the following email templates:

1. **Welcome Email**: Sent when candidates are activated
2. **Payment Reminder**: Sent to candidates with pending payments
3. **E-Learning Reminder**: Reminds candidates to complete e-learning modules
4. **Course Reminder**: Final reminder before the course
5. **New Application**: Notification to general office about new applications
6. **Supervisor Notification**: Notifies supervisors about candidate assessment updates

## Testing Email Setup

### Test the Email Function
1. Go to the Admin Panel
2. Navigate to "Communications"
3. Select "Welcome Email" from the dropdown
4. Select a candidate
5. Click "Send Email to Selected Candidates"

### Check Email Delivery
- Check the candidate's email inbox
- Check the Firebase Functions logs for any errors
- Monitor the Resend dashboard for delivery status

## Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**
   - Verify the API key is correct
   - Ensure the API key is properly set in Firebase environment variables

2. **"Authentication Failed" Error**
   - Check that the API key is valid and active
   - Verify the Resend account is verified

3. **Emails Not Sending**
   - Check Firebase Functions logs
   - Verify the `FROM_EMAIL` environment variable is set
   - Ensure the candidate email addresses are valid

4. **Emails Going to Spam**
   - This is normal for new email setups
   - Consider setting up a custom domain for better deliverability
   - Monitor the Resend dashboard for delivery metrics

### Getting Help
- Check [Resend Documentation](https://resend.com/docs)
- Review Firebase Functions logs
- Contact the development team

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Regularly rotate API keys
- Monitor email usage in the Resend dashboard

## Cost Considerations

- **Free Tier**: 3,000 emails/month
- **Paid Plans**: Start at $20/month for 50,000 emails
- Monitor usage in the Resend dashboard to avoid unexpected charges

## Next Steps

1. Set up the Resend account and get the API key
2. Configure Firebase environment variables
3. Deploy the updated functions
4. Test email functionality
5. Monitor email delivery and adjust as needed
