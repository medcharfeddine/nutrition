# Email Integration Guide

This guide shows how to enable email notifications in the appointment system.

## Option 1: SendGrid (Recommended)

### Step 1: Install SendGrid Package
```bash
npm install @sendgrid/mail
```

### Step 2: Get API Key
1. Go to https://sendgrid.com
2. Create account or login
3. Navigate to Settings → API Keys
4. Create new API key
5. Copy the key

### Step 3: Add to Environment
Create/Update `.env.local`:
```env
SENDGRID_API_KEY=SG.your_actual_api_key_here
FROM_EMAIL=noreply@yourdomain.com
APPOINTMENT_NOTIFICATION_EMAIL=appointments@yourdomain.com
```

### Step 4: Update Email Function
Replace the `sendAppointmentEmail()` function in `app/api/appointments/route.ts`:

```typescript
import sgMail from '@sendgrid/mail';

// Initialize at the top of the file
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendAppointmentEmail(
  to: string,
  subject: string,
  type: 'booking' | 'confirmation' | 'rejection' | 'reminder',
  data: any
) {
  try {
    const html = getEmailTemplate(type, data);
    
    await sgMail.send({
      to,
      from: process.env.FROM_EMAIL || 'noreply@nutrited.com',
      subject,
      html,
      replyTo: process.env.APPOINTMENT_NOTIFICATION_EMAIL,
    });

    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw - let appointment be created even if email fails
  }
}

function getEmailTemplate(
  type: 'booking' | 'confirmation' | 'rejection' | 'reminder',
  data: any
): string {
  const { specialistName, appointmentDate, startTime, meetingLink, reason } = data;

  const baseStyles = `
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
  `;

  switch (type) {
    case 'booking':
      return `
        <div style="${baseStyles}">
          <h2>New Appointment Request</h2>
          <p>Hello ${specialistName},</p>
          <p>You have received a new appointment request.</p>
          <p>
            <strong>Date:</strong> ${appointmentDate}<br>
            <strong>Time:</strong> ${startTime}
          </p>
          <p>Please log in to your admin panel to approve or reject this request.</p>
          <p>Best regards,<br>NutriÉd Team</p>
        </div>
      `;

    case 'confirmation':
      return `
        <div style="${baseStyles}">
          <h2>Appointment Confirmed!</h2>
          <p>Hello,</p>
          <p>Your appointment has been confirmed!</p>
          <p>
            <strong>Specialist:</strong> ${specialistName}<br>
            <strong>Date:</strong> ${appointmentDate}<br>
            <strong>Time:</strong> ${startTime}
          </p>
          ${meetingLink ? `
            <p>
              <strong>Meeting Link:</strong><br>
              <a href="${meetingLink}">${meetingLink}</a>
            </p>
          ` : ''}
          <p>Please join a few minutes early.</p>
          <p>Best regards,<br>NutriÉd Team</p>
        </div>
      `;

    case 'rejection':
      return `
        <div style="${baseStyles}">
          <h2>Appointment Request Rejected</h2>
          <p>Hello,</p>
          <p>Unfortunately, your appointment request has been rejected.</p>
          ${reason ? `
            <p>
              <strong>Reason:</strong><br>
              ${reason}
            </p>
          ` : ''}
          <p>Please try booking another time slot.</p>
          <p>Best regards,<br>NutriÉd Team</p>
        </div>
      `;

    case 'reminder':
      return `
        <div style="${baseStyles}">
          <h2>Appointment Reminder</h2>
          <p>Hello,</p>
          <p>This is a reminder about your upcoming appointment!</p>
          <p>
            <strong>Specialist:</strong> ${specialistName}<br>
            <strong>Date:</strong> ${appointmentDate}<br>
            <strong>Time:</strong> ${startTime}
          </p>
          ${meetingLink ? `
            <p>
              <strong>Join Meeting:</strong><br>
              <a href="${meetingLink}">${meetingLink}</a>
            </p>
          ` : ''}
          <p>We look forward to seeing you!</p>
          <p>Best regards,<br>NutriÉd Team</p>
        </div>
      `;

    default:
      return '<p>Appointment notification</p>';
  }
}
```

### Step 5: Test Email Sending
After updating the function, create a test appointment and verify:
1. Book an appointment as user
2. Check admin email inbox (should receive booking notification)
3. Approve appointment as admin
4. Check user email inbox (should receive confirmation with meeting link)

---

## Option 2: AWS SES (Amazon Simple Email Service)

### Step 1: Install AWS SDK
```bash
npm install @aws-sdk/client-ses
```

### Step 2: Setup AWS SES
1. Go to AWS Console → SES
2. Verify domain or email address
3. Create SMTP credentials or use IAM credentials
4. Note your region (e.g., us-east-1)

### Step 3: Add to Environment
```env
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
FROM_EMAIL=noreply@yourdomain.com
```

### Step 4: Update Email Function
```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function sendAppointmentEmail(
  to: string,
  subject: string,
  type: 'booking' | 'confirmation' | 'rejection' | 'reminder',
  data: any
) {
  try {
    const html = getEmailTemplate(type, data);

    const command = new SendEmailCommand({
      Source: process.env.FROM_EMAIL || 'noreply@nutrited.com',
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: html } },
      },
    });

    await sesClient.send(command);
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw - let appointment be created even if email fails
  }
}

// Use same getEmailTemplate function as above
```

---

## Option 3: Gmail (Development/Small Scale)

### Step 1: Setup Gmail
1. Enable 2-Factor Authentication on your Gmail account
2. Create an App Password: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Generate and copy the 16-character password

### Step 2: Install Package
```bash
npm install nodemailer
```

### Step 3: Add to Environment
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
FROM_EMAIL=your-email@gmail.com
```

### Step 4: Update Email Function
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendAppointmentEmail(
  to: string,
  subject: string,
  type: 'booking' | 'confirmation' | 'rejection' | 'reminder',
  data: any
) {
  try {
    const html = getEmailTemplate(type, data);

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@nutrited.com',
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw - let appointment be created even if email fails
  }
}

// Use same getEmailTemplate function as above
```

---

## Email Template Customization

You can customize the email templates for your brand. Example enhanced template:

```typescript
function getEmailTemplate(
  type: 'booking' | 'confirmation' | 'rejection' | 'reminder',
  data: any
): string {
  const brandColor = '#6366f1'; // Indigo
  const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: #333;
  `;

  const containerStyle = `
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background: #f9fafb;
  `;

  const headerStyle = `
    background: ${brandColor};
    color: white;
    padding: 30px;
    text-align: center;
    border-radius: 8px 8px 0 0;
  `;

  const contentStyle = `
    background: white;
    padding: 30px;
    border-radius: 0 0 8px 8px;
  `;

  const buttonStyle = `
    display: inline-block;
    background: ${brandColor};
    color: white;
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: bold;
  `;

  // Build your custom template here
  // ...
}
```

---

## Testing Email Sending

### Test in Development
```javascript
// Add this to a test endpoint temporarily
import { sendAppointmentEmail } from '@/lib/email';

export async function GET() {
  await sendAppointmentEmail(
    'your-email@example.com',
    'Test Email',
    'confirmation',
    {
      specialistName: 'Dr. Smith',
      appointmentDate: '2024-01-15',
      startTime: '10:00 AM',
      meetingLink: 'https://zoom.us/test'
    }
  );
  
  return Response.json({ message: 'Email sent' });
}
```

Visit `http://localhost:3000/api/test-email` to test.

### Verify Emails Are Being Sent
1. Check email inbox (including spam folder)
2. Check console logs for "Email sent to..." messages
3. If using SendGrid: Check SendGrid dashboard for activity
4. If using SES: Check CloudWatch logs

---

## Troubleshooting

### Email not sending?

1. **Check credentials**
   ```bash
   # Verify API key is in .env.local
   echo $SENDGRID_API_KEY
   ```

2. **Check logs**
   - Look for "Email sent to..." in console
   - Check for error messages in terminal

3. **Verify email address**
   - Make sure recipient email is valid
   - Check that FROM_EMAIL is verified in email service

4. **Check spam folder**
   - Email might be filtered as spam
   - Add "NutriÉd" as a trusted sender

5. **Test with provider's tools**
   - SendGrid: Use API testing tool
   - AWS SES: Use Console
   - Gmail: Send test manually first

---

## Production Checklist

- [ ] Chosen email service provider
- [ ] Installed required package
- [ ] Created/verified API key or credentials
- [ ] Added all required environment variables
- [ ] Implemented `sendAppointmentEmail()` function
- [ ] Customized email templates with your branding
- [ ] Tested email sending for each type (booking, confirmation, rejection, reminder)
- [ ] Verified emails appear in inbox (not spam)
- [ ] Set up reply-to address
- [ ] Configured sender domain verification (for SendGrid/SES)

---

## Email Sending Events

The system automatically sends emails for these events:

1. **User Books Appointment** → Email to specialist
2. **Admin Approves Appointment** → Email to user with meeting link
3. **Admin Rejects Appointment** → Email to user with reason
4. **Reminder (if implemented)** → Email 24 hours before

---

## Support

If emails still aren't sending after setup:
1. Check the email service dashboard for errors
2. Verify domain/sender authentication
3. Check spam filters
4. Review API key permissions
5. Ensure correct region/endpoint is configured

For provider-specific help:
- SendGrid: https://sendgrid.com/docs/
- AWS SES: https://docs.aws.amazon.com/ses/
- Gmail: https://support.google.com/mail/
