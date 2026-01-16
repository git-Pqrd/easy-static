# 🚀 Easy Static

> Deploy a beautiful, production-ready static website to AWS S3 + CloudFront in minutes with automatic CI/CD.

[![Deploy to AWS](https://img.shields.io/badge/Deploy-AWS-orange?logo=amazon-aws)](https://aws.amazon.com/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?logo=github)](.github/workflows/deploy.yml)

**Easy Static** is a modern, zero-config static site template that gets your site live on AWS with SSL, CDN, and automatic deployments in under 10 minutes.

## ✨ Features

- 🔒 **SSL Certificate** - Automatic HTTPS with AWS Certificate Manager
- 🚀 **Global CDN** - Fast worldwide delivery with CloudFront
- 📦 **S3 Hosting** - Scalable, reliable object storage
- 🔄 **Auto Deploy** - Deploy on every push to `main` via GitHub Actions
- 🔐 **OIDC Auth** - Secure AWS authentication (no access keys needed!)
- 🌙 **Dark Mode** - Beautiful dark theme support
- 📱 **Responsive** - Mobile-first design that works everywhere
- ⚡ **Fast** - Optimized with Tailwind CSS and modern tooling

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js** 20+ installed ([download](https://nodejs.org/))
- **AWS Account** with permissions to create:
  - S3 buckets
  - CloudFront distributions
  - ACM certificates
  - IAM roles
  - CloudFormation stacks
- **GitHub Account** for repository hosting
- **Domain Name** ready to use (e.g., `example.com`)

## 🛠️ Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

This will:

- Start a Vite dev server (usually at `http://localhost:5173`)
- Watch for changes and auto-reload
- Compile Tailwind CSS in watch mode

Open your browser and start editing! The site will hot-reload as you make changes.

### 4. Build for Production

When you're ready to build:

```bash
npm run build
```

This generates optimized CSS in `dist/output.css` ready for deployment.

> 💡 **Tip**: Your `index.html` and other assets stay at the root. Only CSS is compiled.

## 🌐 AWS Deployment Guide

This project includes an **interactive setup guide** in `index.html`. Open it in your browser and follow along!

### Step-by-Step Overview

#### 1. 🔒 Create SSL Certificate (5 minutes)

1. Open [AWS Certificate Manager (us-east-1)](https://us-east-1.console.aws.amazon.com/acm/home?region=us-east-1#/certificates/request/public)
2. Request a **public certificate**
3. Add **both** domain names:
   - `example.com`
   - `www.example.com`
4. Choose **DNS validation**
5. Copy the CNAME records from ACM
6. Add CNAME records to your domain registrar (Namecheap, GoDaddy, etc.)
7. **Wait for validation** - This can take up to 30 minutes ⏳
8. Once status shows **"Issued"**, copy the certificate ARN

> ⚠️ **Important**: The certificate **must** be in `us-east-1` region for CloudFront!

#### 2. ⏳ Wait for Certificate Issuance

Before proceeding, verify your certificate status is **"Issued"** (not "Pending validation"). This typically takes 15-30 minutes after DNS validation is complete.

Check status: [ACM Certificates List](https://us-east-1.console.aws.amazon.com/acm/home?region=us-east-1#/certificates/list)

#### 3. 📦 Deploy Infrastructure with CloudFormation (5 minutes)

1. Open the [CloudFormation Console (us-east-1)](https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review)
2. Create a new stack
3. **Upload template**: Use `assets/cloudformation.yaml` from this repo
4. Fill in the parameters:
   - **DomainName**: `example.com` (your domain)
   - **AcmCertificateArn**: The ARN you copied from step 1
   - **GitHubRepo**: `YOUR_USERNAME/YOUR_REPO` (format: `username/repo`)
   - **GitHubBranch**: `main` (default)
5. Review and create the stack
6. Wait for stack creation to complete (~2-3 minutes)
7. **Copy the Outputs** - You'll need these for GitHub:
   - `GitHubRoleARN` → `AWS_ROLE_ARN`
   - `SiteBucketName` → `S3_BUCKET`
   - `CloudFrontId` → `CLOUDFRONT_ID`

#### 4. 🔐 Configure GitHub Variables

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/variables/actions`
2. Click **"New repository variable"**
3. Add these **3 variables** (not secrets - they're just identifiers):

   | Variable Name   | Value                  | From CloudFormation Output |
   | --------------- | ---------------------- | -------------------------- |
   | `AWS_ROLE_ARN`  | `arn:aws:iam::...`     | `GitHubRoleARN`            |
   | `S3_BUCKET`     | `example.com-site-...` | `SiteBucketName`           |
   | `CLOUDFRONT_ID` | `E1234567890ABC`       | `CloudFrontId`             |

> ✅ These are **variables**, not secrets - they're just resource identifiers.

#### 5. 🌍 Configure DNS

Point your domain to CloudFront:

1. In CloudFormation outputs, find `CloudFrontDomainName` (e.g., `d1234567890abc.cloudfront.net`)
2. Go to your domain registrar
3. Add a **CNAME** or **ALIAS** record:
   - **Type**: `CNAME` (or `ALIAS` if your registrar supports it)
   - **Name**: `@` (or root domain)
   - **Value**: `d1234567890abc.cloudfront.net`

The CloudFormation template automatically handles `www` → root domain redirects via CloudFront Functions.

#### 6. 🚀 Deploy!

Once everything is set up:

1. **Push to `main` branch** - GitHub Actions will automatically:

   - Install dependencies
   - Build the site
   - Sync to S3
   - Invalidate CloudFront cache

2. **Or manually trigger**: Go to Actions tab → "Deploy to S3 + CloudFront" → "Run workflow"

That's it! Your site should be live at `https://example.com` in about 2-3 minutes. 🎉

## 📁 Project Structure

```
easy-static/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── assets/
│   └── cloudformation.yaml     # AWS infrastructure template
├── dist/
│   └── output.css              # Compiled CSS (generated)
├── src/
│   ├── input.css               # Tailwind source
│   └── main.js                 # Your JavaScript
├── index.html                  # Main HTML file
├── tailwind.config.js          # Tailwind configuration
└── package.json                # Dependencies
```

## 🔧 Customization

### Adding Your Content

- Edit `index.html` to customize your site
- Styles are managed with Tailwind CSS (see `src/input.css`)
- JavaScript goes in `src/main.js`

### Tailwind Configuration

Modify `tailwind.config.js` to customize colors, fonts, breakpoints, etc.

```js
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts}"],
  theme: {
    extend: {
      // Add your custom theme here
    },
  },
  plugins: [],
};
```

### Build Process

The build process is simple:

- **Development**: `npm run dev` - Watches files and hot-reloads
- **Production**: `npm run build` - Compiles Tailwind CSS to `dist/output.css`

The GitHub Action handles the rest automatically!

## 🔍 Troubleshooting

### Certificate Not Issued

- Verify DNS CNAME records are correctly added
- Wait up to 30 minutes for DNS propagation
- Check ACM console for validation errors

### CloudFormation Fails

- Ensure certificate is in `us-east-1` region
- Verify certificate status is "Issued"
- Check IAM permissions for stack creation

### GitHub Actions Fails

- Verify all 3 repository variables are set correctly
- Check that the IAM role exists and trusts GitHub OIDC
- Ensure the branch name matches (default: `main`)

### Site Not Loading

- Verify DNS is pointing to CloudFront domain
- Check CloudFront distribution status (should be "Deployed")
- Wait 5-10 minutes for DNS propagation
- Clear browser cache

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Piquard**

- 🌐 Website: [piquard.codes](https://piquard.codes)
- 🐦 Twitter: [@\_\_pqrd](https://twitter.com/__pqrd)

Have questions or need help? Feel free to reach out on Twitter or visit my website!

## 🙏 Acknowledgments

- Built with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [Vite](https://vitejs.dev/)
- Deployed on [AWS](https://aws.amazon.com/)
- CI/CD by [GitHub Actions](https://github.com/features/actions)

---
