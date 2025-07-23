# Email Service Configuration Guide

The email communication system is currently in **simulation mode**. To send real emails, you need to configure an email service provider.

## 🔧 Supported Email Services

### 1. SendGrid (Recommended)

**Best for**: Production use, high deliverability, detailed analytics

```bash
# Environment Variables (.env)
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourcompany.com
FROM_NAME="Your Company HR Team"
```

**Setup Steps:**

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key with mail send permissions
3. Verify your sender domain/email
4. Add the configuration above to your `.env` file

### 2. AWS SES

**Best for**: AWS infrastructure, cost-effective at scale

```bash
# Environment Variables (.env)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
FROM_EMAIL=noreply@yourcompany.com
FROM_NAME="Your Company HR Team"
```

### 3. Nodemailer with SMTP

**Best for**: Using existing email providers (Gmail, Outlook, etc.)

```bash
# Environment Variables (.env)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME="Your Company HR Team"
```

**Gmail Setup:**

1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use the app password in SMTP_PASS

### 4. Mailgun

**Best for**: Developer-friendly API, good for transactional emails

```bash
# Environment Variables (.env)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_domain.mailgun.org
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME="Your Company HR Team"
```

## 🛠️ Implementation Steps

### Step 1: Choose Your Service

Pick one of the services above and complete the setup process.

### Step 2: Install Required Packages

```bash
# For SendGrid
npm install @sendgrid/mail

# For AWS SES
npm install aws-sdk

# For Nodemailer (SMTP)
npm install nodemailer
npm install @types/nodemailer --save-dev

# For Mailgun
npm install mailgun-js
```

### Step 3: Update Email Send API

Replace the simulation code in `/app/api/email/send/route.ts`:

#### SendGrid Example:

```typescript
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// In your email sending function:
const msg = {
  to: candidate.email,
  from: {
    email: process.env.FROM_EMAIL!,
    name: process.env.FROM_NAME!,
  },
  subject: processedSubject,
  html: processedBody,
};

await sgMail.send(msg);
```

#### Nodemailer Example:

```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// In your email sending function:
await transporter.sendMail({
  from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
  to: candidate.email,
  subject: processedSubject,
  html: processedBody,
});
```

### Step 4: Update Email History Status

Replace the simulation timeout with real email sending:

```typescript
// Before sending
const emailRecord = await prisma.emailHistory.create({
  data: {
    // ... email data
    status: "PENDING",
  },
});

try {
  // Send actual email here
  await sendActualEmail(emailData);

  // Update to sent
  await prisma.emailHistory.update({
    where: { id: emailRecord.id },
    data: {
      status: "SENT",
      sentAt: new Date(),
    },
  });
} catch (error) {
  // Update to failed
  await prisma.emailHistory.update({
    where: { id: emailRecord.id },
    data: {
      status: "FAILED",
      errorMessage: error.message,
    },
  });
}
```

## 🔍 Testing Your Setup

1. **Test Configuration**: Create a simple test endpoint to verify your email service works
2. **Send Test Email**: Send a test email to yourself first
3. **Monitor Delivery**: Check your email service dashboard for delivery status
4. **Handle Errors**: Implement proper error handling for bounced/failed emails

## 📋 Email Service Comparison

| Service        | Pros                                      | Cons                        | Best For             |
| -------------- | ----------------------------------------- | --------------------------- | -------------------- |
| **SendGrid**   | High deliverability, great API, analytics | Paid service                | Production apps      |
| **AWS SES**    | Very cost-effective, scalable             | More complex setup          | AWS ecosystem        |
| **SMTP/Gmail** | Free for low volume, familiar             | Gmail limits, less reliable | Development/testing  |
| **Mailgun**    | Developer-friendly, good docs             | Paid service                | Transactional emails |

## 🚀 Current System Status

**✅ Implemented Features:**

- Email template management
- Variable substitution
- Bulk email interface
- Email history tracking
- Automated workflow triggers
- Template preview with sample data

**🔄 Simulation Mode:**

- All emails are marked as "SENT" without actual delivery
- Email history is recorded correctly
- All functionality works except actual email sending

**🎯 Next Steps:**

1. Choose your email service provider
2. Add environment variables
3. Install required packages
4. Update the email sending logic
5. Test with real email delivery

---

**Need Help?**

- Check your email service provider's documentation
- Test with a simple email first
- Monitor email delivery status
- Implement proper error handling
