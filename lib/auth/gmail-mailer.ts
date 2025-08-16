import { google } from 'googleapis';

/**
 * GmailMailer sends emails using Gmail API (OAuth2 service account or user credentials).
 * Configure environment variables before use.
 *
 * Required env vars (choose one auth strategy):
 *  1. OAuth Client:
 *    - GMAIL_CLIENT_ID
 *    - GMAIL_CLIENT_SECRET
 *    - GMAIL_REFRESH_TOKEN (offline access refresh token for the Gmail user)
 *    - GMAIL_SENDER (email address of the sender / authenticated user)
 *  2. Service Account (domain-wide delegation - requires Google Workspace):
 *    - GMAIL_SERVICE_ACCOUNT_CLIENT_EMAIL
 *    - GMAIL_SERVICE_ACCOUNT_PRIVATE_KEY (escaped newline as \n)
 *    - GMAIL_IMPERSONATE (user email to impersonate)
 */
export class GmailMailer {
  private static gmailClient: any;

  private static getClient() {
    if (this.gmailClient) return this.gmailClient;

    // Service account path
    if (process.env.GMAIL_SERVICE_ACCOUNT_CLIENT_EMAIL && process.env.GMAIL_SERVICE_ACCOUNT_PRIVATE_KEY) {
      const jwt = new google.auth.JWT({
        email: process.env.GMAIL_SERVICE_ACCOUNT_CLIENT_EMAIL,
        key: (process.env.GMAIL_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/gmail.send'],
        subject: process.env.GMAIL_IMPERSONATE,
      });
      this.gmailClient = google.gmail({ version: 'v1', auth: jwt });
      return this.gmailClient;
    }

    // OAuth client w/ refresh token
    if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
      const oAuth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET
      );
      oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
      this.gmailClient = google.gmail({ version: 'v1', auth: oAuth2Client });
      return this.gmailClient;
    }

    throw new Error('Gmail mailer not configured. Provide required environment variables.');
  }

  static async sendMail(params: { to: string; subject: string; html: string; text?: string; from?: string; }): Promise<{ success: boolean; message: string; id?: string; }> {
    try {
      const gmail = this.getClient();
      const from = params.from || process.env.GMAIL_SENDER || process.env.GMAIL_IMPERSONATE;
      if (!from) throw new Error('Sender email not configured');

      const messageParts = [
        `From: ${from}`,
        `To: ${params.to}`,
        `Subject: ${params.subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        params.html,
      ];
      const message = messageParts.join('\n');
      const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage },
      });

      return { success: true, message: 'Email sent', id: res.data.id };
    } catch (error) {
      // Enhanced diagnostics
      const err: any = error;
      const status = err?.code || err?.response?.status;
      const reason = err?.errors?.[0]?.message || err?.response?.data?.error || err?.message;
      if (process.env.NODE_ENV !== 'production') {
        console.error('Gmail sendMail error:', { status, reason, full: err });
      } else {
        console.error('Gmail sendMail error (status=%s reason=%s)', status, reason);
      }
      if (status === 401) {
        return { success: false, message: 'Gmail auth failed (401). Verify OAuth credentials / scopes.' };
      }
      if (status === 403) {
        return { success: false, message: 'Gmail API not authorized (403). Enable Gmail API or domain delegation.' };
      }
      return { success: false, message: 'Failed to send email' };
    }
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const subject = 'Your Password Reset Request';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;">
      <h2>Password Reset</h2>
      <p>You requested to reset your password. Click the button below to proceed. This link is valid for 1 hour.</p>
      <p style="text-align:center;margin:30px 0;">
        <a href="${resetLink}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Reset Password</a>
      </p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p><code>${resetLink}</code></p>
      <p>If you did not request this, you can ignore this email.</p>
      <p style="margin-top:40px;font-size:12px;color:#888;">© ${new Date().getFullYear()} QuantCal. All rights reserved.</p>
    </div>
  `;
  return GmailMailer.sendMail({ to, subject, html });
}
