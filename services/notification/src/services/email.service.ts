import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
const prisma = new PrismaClient();

const BREVO_TEMPLATES: Record<string, { subject: string }> = {
  user_registered: { subject: 'Welcome to CyberScout!' },
  payment_succeeded: { subject: 'Payment Confirmed — CyberScout' },
  badge_unlocked: { subject: 'New Badge Earned! — CyberScout' },
  level_up: { subject: 'You Leveled Up! — CyberScout' },
  payment_failed: { subject: 'Payment Failed — CyberScout' },
};

export async function sendEmail(userId: string, template: string, variables: Record<string, string>): Promise<void> {
  const config = BREVO_TEMPLATES[template];
  if (!config) return;

  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) return;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': process.env.BREVO_API_KEY!, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: [{ email: user.email, name: user.name }],
        subject: config.subject,
        htmlContent: `<p>Hi ${user.name},</p><p>${variables.message || 'Update from CyberScout'}</p>`,
      }),
    });

    if (response.ok) {
      const data = await response.json() as { messageId?: string };
      await prisma.email_log.create({
        data: { user_id: userId, template, to_email: user.email, subject: config.subject, brevo_msg_id: data.messageId, status: 'sent', sent_at: new Date() }
      });
    }
  } catch (err) {
    logger.error({ err, userId, template }, 'Email send failed');
  }
}
