/**
 * Email Debugging Script
 * Run this to test your SMTP connection and diagnose email issues
 * 
 * Usage: node debug-email.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

const config = {
  EMAIL_ENABLED: process.env.EMAIL_ENABLED,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET',
  EMAIL_FROM: process.env.EMAIL_FROM,
  APP_BASE_URL: process.env.APP_BASE_URL,
};

console.log('\n📧 EMAIL CONFIGURATION CHECK\n');
console.log('================================');
Object.entries(config).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  console.log(`${status} ${key}: ${value || 'NOT SET'}`);
});
console.log('================================\n');

// Check for common issues
const issues = [];

if (process.env.EMAIL_ENABLED !== 'true') {
  issues.push('❌ EMAIL_ENABLED is not set to "true"');
}

if (!process.env.SMTP_HOST) {
  issues.push('❌ SMTP_HOST is not configured');
}

if (!process.env.SMTP_USER) {
  issues.push('❌ SMTP_USER is not configured');
}

if (!process.env.SMTP_PASS) {
  issues.push('❌ SMTP_PASS is not configured');
}

if (process.env.SMTP_PASS && process.env.SMTP_PASS.includes(' ')) {
  issues.push('⚠️  WARNING: SMTP_PASS contains spaces - remove them! (e.g., "tcpj rpqw japo zeui" → "tcpjrpqwjapozeui")');
}

if (!process.env.EMAIL_FROM) {
  issues.push('❌ EMAIL_FROM is not configured');
}

if (issues.length > 0) {
  console.log('🚨 CONFIGURATION ISSUES FOUND:\n');
  issues.forEach(issue => console.log(issue));
  console.log('\n');
}

// Test SMTP connection
async function testSMTPConnection() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ Cannot test SMTP: Missing required configuration');
    return;
  }

  console.log('🔌 Testing SMTP Connection...\n');

  try {
    // Remove spaces from password
    const cleanPassword = process.env.SMTP_PASS.replace(/\s/g, '');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: cleanPassword,
      },
      debug: true,
    });

    // Verify connection
    console.log('⏳ Verifying SMTP credentials...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    // Send test email
    console.log('📨 Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'MyClean Email Test ✅',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb;">
            <h1 style="color: #2563eb; margin: 0 0 16px 0;">✅ Email Test Successful!</h1>
            <p style="color: #111827; line-height: 1.6;">Your MyClean email system is working correctly!</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
              Sent from: ${process.env.SMTP_USER}<br>
              Timestamp: ${new Date().toISOString()}
            </p>
          </div>
        </div>
      `,
      text: '✅ Email Test Successful! Your MyClean email system is working correctly!',
    });

    console.log('✅ Test email sent successfully!');
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`📧 Check your inbox: ${process.env.SMTP_USER}\n`);

    return true;
  } catch (error) {
    console.log('❌ SMTP Connection Failed!\n');
    console.error('Error details:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 SOLUTION:');
      console.log('1. Make sure you\'re using an App Password, not your regular Gmail password');
      console.log('2. Generate one at: https://myaccount.google.com/apppasswords');
      console.log('3. Enable 2-Factor Authentication if not already enabled');
      console.log('4. Remove all spaces from the password in .env');
    }
    
    if (error.message.includes('EAUTH') || error.message.includes('Username and Password not accepted')) {
      console.log('\n💡 SOLUTION:');
      console.log('Your SMTP credentials are invalid. Double-check:');
      console.log('- SMTP_USER is correct');
      console.log('- SMTP_PASS is an App Password (16 characters, no spaces)');
      console.log('- You\'ve enabled "Less secure app access" or using App Password');
    }

    return false;
  }
}

// Check database for queued emails
async function checkEmailQueue() {
  console.log('\n📊 Checking Email Queue...\n');
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const emailStats = await prisma.emailJob.groupBy({
      by: ['status'],
      _count: true,
    });

    console.log('Email Queue Status:');
    console.log('-------------------');
    
    if (emailStats.length === 0) {
      console.log('⚠️  No emails in queue - emails might not be getting queued');
      console.log('   This means the queueWelcomeEmail function might not be called');
    } else {
      emailStats.forEach(stat => {
        console.log(`${stat.status}: ${stat._count}`);
      });
    }

    // Check recent emails
    const recentEmails = await prisma.emailJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        to: true,
        template: true,
        status: true,
        lastError: true,
        createdAt: true,
        sentAt: true,
      },
    });

    if (recentEmails.length > 0) {
      console.log('\nRecent Emails:');
      console.log('-------------------');
      recentEmails.forEach(email => {
        console.log(`#${email.id} | ${email.template} → ${email.to}`);
        console.log(`   Status: ${email.status} | Created: ${email.createdAt.toISOString()}`);
        if (email.lastError) {
          console.log(`   ❌ Error: ${email.lastError}`);
        }
        if (email.sentAt) {
          console.log(`   ✅ Sent: ${email.sentAt.toISOString()}`);
        }
        console.log('');
      });
    }

    await prisma.$disconnect();
  } catch (error) {
    console.log('⚠️  Could not check database:', error.message);
    console.log('   Make sure you\'re running this from the backend directory');
  }
}

// Main execution
async function main() {
  console.clear();
  console.log('🔍 MyClean Email Diagnostic Tool\n');
  
  const smtpSuccess = await testSMTPConnection();
  
  if (smtpSuccess) {
    await checkEmailQueue();
    
    console.log('\n✅ SMTP is working! If you\'re still not receiving emails:');
    console.log('   1. Check if emails are being queued in database');
    console.log('   2. Check Railway logs for "Email queue worker started"');
    console.log('   3. Make sure EMAIL_ENABLED=true (no quotes) in Railway');
    console.log('   4. Verify the email queue worker is running');
    console.log('   5. Check spam folder');
  } else {
    console.log('\n❌ Fix SMTP configuration first, then re-run this script');
  }

  console.log('\n📚 For more help, see: EMAIL_AUTOMATION_GUIDE.md\n');
}

main().catch(console.error);

