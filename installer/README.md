# One-Tap Deploy Installer

A revolutionary one-click deployment system for cloud applications. This installer provides a beautiful, user-friendly interface for deploying applications to Google Cloud with minimal technical knowledge required.

## 🚀 Features

- **One-click deployment** - No terminal commands required
- **Beautiful UI** - Modern, responsive interface
- **Google Cloud integration** - Automatic project creation and setup
- **Firebase support** - Hosting, Firestore, and Functions
- **Progress tracking** - Real-time deployment status
- **Error handling** - Clear error messages and recovery options

## 🏗️ Architecture

The installer uses a browser-based approach with OAuth PKCE for security:

1. **DeployPack** - YAML configuration describing the application
2. **OAuth Flow** - Secure Google Cloud authentication
3. **API Calls** - Direct Google Cloud API calls from the browser
4. **Cloud Build** - Automated deployment via Google Cloud Build

## 🛠️ Setup

### Prerequisites

1. **Google Cloud Project** - For OAuth credentials
2. **Node.js 18+** - For running the installer
3. **GitHub Repository** - With a `deploypack.yaml` file

### Installation

1. **Clone the installer:**
   ```bash
   cd installer
   npm install
   ```

2. **Set up Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable the Google+ API
   - Create OAuth 2.0 credentials
   - Add `http://localhost:3000/auth/callback` to authorized redirect URIs

3. **Environment variables:**
   Create `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_oauth_client_id
   ```

4. **Run the installer:**
   ```bash
   npm run dev
   ```

5. **Access the installer:**
   Open http://localhost:3000

## 📝 DeployPack Format

The `deploypack.yaml` file describes your application:

```yaml
name: my-app
version: 1.0
ui:
  productName: My Application
  description: A great application
  icon: 🚀
defaults:
  region: europe-west2
  budgetMonthlyGBP: 15
  auth: email_link
parameters:
  - key: adminEmail
    label: Admin email
    required: true
    type: email
services:
  - kind: web
    runtime: node18
    entry: ./
    hosting: static
    build: npm run build
  - kind: db
    type: firestore
    tier: serverless
```

## 🔧 Development

### Project Structure

```
installer/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main installer page
│   ├── auth/callback/     # OAuth callback handler
│   └── globals.css        # Global styles
├── lib/                   # Core libraries
│   ├── deploypack.ts      # DeployPack parser
│   └── google-cloud.ts    # Google Cloud API client
├── package.json           # Dependencies
└── README.md             # This file
```

### Key Components

- **DeployPack Parser** - Reads and validates YAML configuration
- **Google Cloud Manager** - Handles OAuth and API calls
- **Installer UI** - React components for user interaction
- **OAuth Callback** - Handles authentication response

## 🚀 Deployment

### Production Setup

1. **Deploy to Vercel:**
   ```bash
   npm run build
   vercel --prod
   ```

2. **Update OAuth redirect URIs:**
   Add your production domain to Google OAuth settings

3. **Environment variables:**
   Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in your hosting platform

### Security Considerations

- **OAuth PKCE** - Prevents authorization code interception
- **Browser-only** - No server-side token storage
- **Time-limited tokens** - Automatic token expiration
- **Least privilege** - Minimal required permissions

## 🎯 Usage

1. **User clicks "Install"** - Opens the installer
2. **Google OAuth** - User authorizes with their Google account
3. **Configuration** - User fills in required parameters
4. **Deployment** - Automatic project creation and app deployment
5. **Completion** - User gets live application URLs

## 🔮 Future Enhancements

- **Multi-cloud support** - AWS, Azure integration
- **Templates** - Pre-built application templates
- **Custom domains** - Automatic DNS configuration
- **Monitoring** - Built-in application monitoring
- **Backup/restore** - Automated backup solutions

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the DeployPack examples

---

**One-Tap Deploy** - Making cloud deployment accessible to everyone! 🚀
