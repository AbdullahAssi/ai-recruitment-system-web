# 📧 Email Template System - Complete Guide

## ✅ Current Status: SMTP Email Service Configured & Bulk Email Ready

- **Server**: mail.cymaxtech.com:587
- **Authentication**: Configured ✅
- **Connection**: Verified ✅
- **Status**: Ready to send real emails
- **Bulk Email**: ✅ Fully implemented on candidates page

## 🚀 **NEW: Bulk Email Functionality Available**

### **HR Candidates Page (`/hr/candidates`) - Ready to Use**

✅ **Complete Implementation**:

#### **Features:**

- **✅ Individual Selection**: Checkbox on each candidate card
- **✅ Select All**: Master checkbox for all filtered candidates
- **✅ Visual Feedback**: Selected cards highlighted with purple ring
- **✅ Bulk Actions Toolbar**: Shows selection count and email options
- **✅ Template Integration**: Choose from existing email templates
- **✅ Custom Emails**: Write custom content with variable support
- **✅ Variable Substitution**: `{{candidateName}}`, `{{candidateEmail}}`, `{{companyName}}`
- **✅ Real SMTP Delivery**: Sends actual emails via configured service
- **✅ Progress Tracking**: Loading states and success/error notifications

#### **How to Use:**

1. Go to `/hr/candidates`
2. Use checkboxes to select multiple candidates
3. Click "Send Bulk Email" from the toolbar
4. Choose template or write custom content
5. Variables are automatically replaced for each recipient

---

## 📋 How Email Templates Work

### 1. **Template Structure**

Each email template contains:

- **Name**: Unique identifier (e.g., "Application Received")
- **Subject**: Email subject line with variables
- **Body**: HTML email content with variables
- **Type**: Category (APPLICATION_RECEIVED, INTERVIEW_INVITE, etc.)
- **Status**: Active/Inactive

### 2. **Variable System**

Templates use `{{variableName}}` syntax for dynamic content:

```html
Subject: Thank you for applying - {{jobTitle}} Body:
<html>
  <body>
    <h2>Dear {{candidateName}},</h2>
    <p>
      Thank you for applying to the <strong>{{jobTitle}}</strong> position at
      {{companyName}}.
    </p>
    <p>We received your application on {{applicationDate}}.</p>
    <p>Location: {{jobLocation}}</p>
    <p>Best regards,<br />HR Team</p>
  </body>
</html>
```

### 3. **Available Variables**

| Variable              | Description                 | Example Value       |
| --------------------- | --------------------------- | ------------------- |
| `{{candidateName}}`   | Candidate's full name       | "John Doe"          |
| `{{candidateEmail}}`  | Candidate's email           | "john@example.com"  |
| `{{jobTitle}}`        | Job position title          | "Software Engineer" |
| `{{jobLocation}}`     | Job location                | "Remote"            |
| `{{companyName}}`     | Company name                | "Your Company"      |
| `{{applicationDate}}` | Application submission date | "July 23, 2025"     |

### 4. **Processing Flow**

1. **Template Selection** → Choose template from database
2. **Variable Replacement** → System replaces `{{variables}}` with actual data
3. **Email Generation** → Creates final HTML email
4. **SMTP Delivery** → Sends via configured email service
5. **History Logging** → Records delivery status and details

---

## 🚀 Email Sending Methods

### **Method 1: Bulk Email from Templates Page**

1. Go to `/hr/email/templates`
2. Click the "..." menu on any template
3. Select "Send Bulk Email"
4. Follow the instructions to send via candidates page

### **Method 2: Bulk Email from Candidates Page**

✅ **IMPLEMENTED**: Checkbox selection and bulk email functionality

1. Go to `/hr/candidates`
2. Use checkboxes to select multiple candidates
3. Click "Send Bulk Email" from the actions toolbar
4. Choose template or write custom content
5. Variables like `{{candidateName}}` and `{{jobTitle}}` are automatically replaced

### **Method 3: Bulk Email from Applications Page**

🚧 **IN PROGRESS**: Currently being implemented for job-specific applications

### **Method 4: Automated Workflow Emails**

- Triggered automatically when application status changes
- Maps status to appropriate email template:
  - `PENDING` → APPLICATION_RECEIVED
  - `REVIEWED` → APPLICATION_UNDER_REVIEW
  - `SHORTLISTED` → APPLICATION_SHORTLISTED
  - `REJECTED` → APPLICATION_REJECTED

### **Method 5: Manual Email Sending**

```bash
# Test the email service
curl http://localhost:3000/api/email/test

# Send bulk emails (requires candidate IDs and template)
POST /api/email/send
{
  "candidateIds": ["candidate-id-1", "candidate-id-2"],
  "templateId": "template-id"
}
```

---

## 📊 Email History & Tracking

### **Email Status Types**

- **PENDING**: Email queued for sending
- **SENT**: Successfully delivered via SMTP
- **FAILED**: Delivery failed (with error message)
- **BOUNCED**: Email bounced back (recipient issues)

### **History Access**

- View via `/api/email/history`
- Filter by candidate, job, or status
- Includes full email content and timestamps
- Error messages for failed deliveries

---

## 🛠️ Technical Implementation

### **Current Configuration**

```bash
# SMTP Settings (.env)
SMTP_HOST=mail.cymaxtech.com
SMTP_PORT=587
SMTP_USER=m.abdullah@cymaxtech.com
SMTP_PASS=2@allinalL
FROM_EMAIL=m.abdullah@cymaxtech.com
FROM_NAME="CymaxTech HR Team"
```

### **Email Service (lib/emailService.ts)**

- Uses `nodemailer` for SMTP
- Handles connection verification
- Provides error handling
- Supports HTML email content

### **API Endpoints**

- `GET /api/email/test` - Test SMTP connection
- `GET /api/email/templates` - List all templates
- `POST /api/email/templates` - Create new template
- `POST /api/email/send` - Send bulk emails
- `POST /api/email/workflow` - Automated workflow emails
- `GET /api/email/history` - View email history

---

## 📝 Example Email Template

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Application Received</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">Dear {{candidateName}},</h2>

      <p>
        Thank you for your interest in the
        <strong>{{jobTitle}}</strong> position at {{companyName}}.
      </p>

      <p>
        We have received your application submitted on {{applicationDate}} and
        our team will review it carefully.
      </p>

      <div
        style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;"
      >
        <h3 style="margin: 0 0 10px 0;">Application Details:</h3>
        <p style="margin: 5px 0;"><strong>Position:</strong> {{jobTitle}}</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> {{jobLocation}}</p>
        <p style="margin: 5px 0;">
          <strong>Application Date:</strong> {{applicationDate}}
        </p>
      </div>

      <p>
        We will contact you within the next few business days regarding the next
        steps in our hiring process.
      </p>

      <p>
        If you have any questions, please don't hesitate to reach out to us.
      </p>

      <p>
        Best regards,<br />
        <strong>{{companyName}} HR Team</strong>
      </p>

      <hr
        style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;"
      />
      <p style="font-size: 12px; color: #6b7280;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  </body>
</html>
```

---

## ✅ System Ready

Your email communication system is fully configured and operational:

- ✅ SMTP server connected
- ✅ Email templates created
- ✅ Variable processing working
- ✅ History tracking enabled
- ✅ Error handling implemented
- ✅ Automated workflows active

**Next Steps:**

1. Create/customize email templates
2. Test with real candidate emails
3. Monitor delivery status
4. Set up automated workflows
