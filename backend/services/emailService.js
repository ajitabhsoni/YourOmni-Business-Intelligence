const axios = require("axios");

// ✅ STRICT email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ✅ Free email domains that often bounce
const TEMP_EMAIL_DOMAINS = [
  'tempmail.com', 'throwaway.com', 'mailinator.com', 'guerrillamail.com',
  '10minutemail.com', 'yopmail.com', 'temp-mail.org', 'fakeinbox.com'
];

// ✅ Known invalid email patterns
const INVALID_PATTERNS = [
  /^test/i,
  /^example/i,
  /^user@/i,
  /^admin@localhost/i,
  /@example\./i,
  /@test\./i,
  /\.test$/i,
  /no-?email/i
];

/**
 * Validate email before sending
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email is empty' };
  }

  email = email.trim().toLowerCase();

  // Check format
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, reason: 'Invalid email format' };
  }

  // Check length
  if (email.length > 254) {
    return { valid: false, reason: 'Email too long' };
  }

  // Check for temp domains
  const domain = email.split('@')[1];
  if (TEMP_EMAIL_DOMAINS.includes(domain)) {
    return { valid: false, reason: 'Temporary email domain' };
  }

  // Check invalid patterns
  for (const pattern of INVALID_PATTERNS) {
    if (pattern.test(email)) {
      return { valid: false, reason: 'Invalid test email pattern' };
    }
  }

  return { valid: true };
};

/**
 * Send email using Brevo API
 */
exports.sendEmail = async (to, subject, text) => {
  try {
    // ✅ STEP 1: Validate email before ANY attempt
    const validation = validateEmail(to);
    
    if (!validation.valid) {
      console.log(`❌ Email validation failed for ${to}: ${validation.reason}`);
      return {
        success: false,
        reason: validation.reason
      };
    }

    // ✅ STEP 2: Check if API key is configured
    if (!process.env.BREVO_KEY) {
      console.log("❌ Brevo API key not configured");
      return {
        success: false,
        reason: 'Email service not configured'
      };
    }

    if (!process.env.SENDER_EMAIL) {
      console.log("❌ Sender email not configured");
      return {
        success: false,
        reason: 'Sender email not configured'
      };
    }

    // ✅ STEP 3: Send email
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { 
          name: "Youromni AI",
          email: process.env.SENDER_EMAIL 
        },
        to: [{ email: to }],
        subject: subject,
        textContent: text
      },
      {
        headers: {
          "api-key": process.env.BREVO_KEY,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    // ✅ STEP 4: Check response
    const isSuccess = response.status === 200 || response.status === 201;
    
    if (isSuccess) {
      console.log(`✅ Email sent successfully to ${to}`);
      return {
        success: true,
        messageId: response.data?.messageId
      };
    } else {
      return {
        success: false,
        reason: `API returned status ${response.status}`
      };
    }

  } catch (err) {
    console.error(`❌ Email error for ${to}:`, err.message);
    
    // Handle specific Brevo error codes
    if (err.response) {
      if (err.response.status === 401 || err.response.status === 403) {
        return { success: false, reason: 'Invalid API key' };
      }
      if (err.response.status === 400) {
        return { success: false, reason: 'Invalid email address' };
      }
      if (err.response.status === 429) {
        return { success: false, reason: 'Rate limit exceeded' };
      }
    }

    return {
      success: false,
      reason: err.message || 'Unknown error'
    };
  }
};

// ✅ Export validator for testing
exports.validateEmail = validateEmail;