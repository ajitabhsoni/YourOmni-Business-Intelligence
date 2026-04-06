const axios = require("axios");

// ✅ Indian mobile number validation
const MOBILE_REGEX = /^[6-9]\d{9}$/;

/**
 * Validate mobile number before sending
 */
const validateMobile = (number) => {
  if (!number || typeof number !== 'string') {
    return { valid: false, reason: 'Mobile number is empty' };
  }

  // Remove any non-digit characters
  const clean = number.replace(/\D/g, '');
  
  // Check if it's a valid Indian mobile number
  if (!MOBILE_REGEX.test(clean)) {
    return { valid: false, reason: 'Invalid Indian mobile number format' };
  }

  return { valid: true, clean };
};

/**
 * Send SMS using Fast2SMS API
 */
exports.sendSMS = async (number, message) => {
  try {
    // ✅ STEP 1: Validate mobile number
    const validation = validateMobile(number);
    
    if (!validation.valid) {
      console.log(`❌ SMS validation failed for ${number}: ${validation.reason}`);
      return {
        success: false,
        reason: validation.reason
      };
    }

    // ✅ STEP 2: Check API key
    if (!process.env.FAST2SMS_KEY) {
      console.log("❌ Fast2SMS API key not configured");
      return {
        success: false,
        reason: 'SMS service not configured'
      };
    }

    // ✅ STEP 3: Check message length
    if (message.length > 160) {
      console.log(`❌ SMS too long: ${message.length} characters`);
      return {
        success: false,
        reason: 'Message exceeds 160 characters'
      };
    }

    // ✅ STEP 4: Send SMS
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message: message,
        language: "english",
        flash: 0,
        numbers: validation.clean
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_KEY
        },
        timeout: 10000
      }
    );

    // ✅ STEP 5: Check response
    if (response.data?.return === true) {
      console.log(`✅ SMS sent successfully to ${validation.clean}`);
      return {
        success: true,
        requestId: response.data?.request_id
      };
    } else {
      return {
        success: false,
        reason: response.data?.message || 'SMS provider error'
      };
    }

  } catch (err) {
    console.error("❌ SMS error:", err.response?.data || err.message);
    
    // Handle specific Fast2SMS error codes
    if (err.response?.data?.message?.includes('insufficient')) {
      return { success: false, reason: 'Insufficient SMS balance' };
    }
    
    return {
      success: false,
      reason: err.response?.data?.message || err.message || 'Unknown error'
    };
  }
};

// ✅ Export validator for testing
exports.validateMobile = validateMobile;