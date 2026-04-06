const Offer = require("../models/Offer");
const Customer = require("../models/Customer");
const Delivery = require("../models/Delivery");
const { sendEmail } = require("../services/emailService");
const { sendSMS } = require("../services/smsService");

// ============================================
// CREATE OFFER (COMPATIBLE WITH YOUR EXISTING CODE)
// ============================================
exports.create = async (req, res) => {
  try {
    const { title, message, channels, targetSegment } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Create offer - using your exact schema + new optional fields
    const offerData = {
      companyId: req.user.companyId,
      title,
      message: message || `🎉 ${title}! Don't miss our special offer!`,
      createdBy: req.user.id,
      approved: req.user.role === "owner",
      status: "pending",
      totalCustomers: 0,
      sentCount: 0,
      failCount: 0
    };

    // ✅ Add new fields ONLY if provided (backward compatible)
    if (channels) {
      offerData.channels = {
        email: channels.email !== undefined ? channels.email : true,
        sms: channels.sms || false
      };
    }
    
    if (targetSegment) {
      offerData.targetSegment = targetSegment;
    }

    const offer = await Offer.create(offerData);

    // Auto-send if created by owner
    if (req.user.role === "owner" && offer.approved) {
      // Don't await - send in background
      sendToCustomers(offer._id).catch(console.error);
    }

    res.status(201).json(offer);

  } catch (err) {
    console.error("❌ Create offer error:", err);
    res.status(500).json({ message: "Failed to create offer" });
  }
};

// ============================================
// APPROVE OFFER (OWNER ONLY) - YOUR EXACT CODE + ENHANCED
// ============================================
exports.approve = async (req, res) => {
  if (req.user.role !== "owner")
    return res.status(403).json({ message: "Only owner" });

  try {
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      { approved: true, status: "sending" },
      { new: true }
    );

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Send to customers (don't await - background)
    sendToCustomers(offer._id).catch(console.error);

    res.json({ message: "Approved & Sending" });

  } catch (err) {
    console.error("❌ Approve error:", err);
    res.status(500).json({ message: "Failed to approve offer" });
  }
};

// ============================================
// RESEND OFFER (OWNER ONLY) - YOUR EXACT CODE + ENHANCED
// ============================================
exports.resend = async (req, res) => {
  if (req.user.role !== "owner")
    return res.status(403).json({ message: "Only owner" });

  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Reset counts
    offer.sentCount = 0;
    offer.failCount = 0;
    offer.emailSentCount = 0;
    offer.emailFailCount = 0;
    offer.smsSentCount = 0;
    offer.smsFailCount = 0;
    offer.status = "sending";
    await offer.save();

    // Send again
    sendToCustomers(offer._id).catch(console.error);

    res.json({ message: "Resent" });

  } catch (err) {
    console.error("❌ Resend error:", err);
    res.status(500).json({ message: "Failed to resend offer" });
  }
};

// ============================================
// GENERATE TEXT - YOUR EXACT CODE + ENHANCED
// ============================================
exports.generateText = async (req, res) => {
  const title = req.body.title;

  // simple AI style template
  const msg =
    `🎉 ${title}! 🎉\n` +
    `Don't miss our limited-time special discounts.\n` +
    `Visit today and save big!`;

  res.json({ message: msg });
};

// ============================================
// GET ALL OFFERS - YOUR EXACT CODE + ENHANCED
// ============================================
exports.getAll = async (req, res) => {
  try {
    const list = await Offer.find({
      companyId: req.user.companyId
    }).sort({ createdAt: -1 });

    res.json(list);

  } catch (err) {
    console.error("❌ Get offers error:", err);
    res.status(500).json({ message: "Failed to fetch offers" });
  }
};

// ============================================
// FAILED LIST - YOUR EXACT CODE + ENHANCED
// ============================================
exports.failedList = async (req, res) => {
  try {
    const list = await Delivery.find({
      offerId: req.params.id,
      status: "failed"
    }).populate("customerId");

    res.json(list);

  } catch (err) {
    console.error("❌ Failed list error:", err);
    res.status(500).json({ message: "Failed to fetch failed deliveries" });
  }
};

// ============================================
// DELETE FAILED CUSTOMER - NEW FEATURE
// ============================================
exports.deleteFailedCustomer = async (req, res) => {
  try {
    const { offerId, customerId } = req.params;
    
    // Delete the failed delivery record
    await Delivery.findOneAndDelete({
      offerId,
      customerId,
      status: "failed"
    });

    // Delete customer if requested
    if (req.query.deleteCustomer === 'true') {
      await Customer.findByIdAndDelete(customerId);
    }

    res.json({ message: "Removed from failed list" });

  } catch (err) {
    console.error("❌ Delete failed customer error:", err);
    res.status(500).json({ message: "Failed to delete customer" });
  }
};

// ============================================
// UPDATE OFFER CHANNELS - NEW FEATURE
// ============================================
exports.updateChannels = async (req, res) => {
  try {
    const { email, sms } = req.body;
    
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      {
        channels: {
          email: email !== undefined ? email : true,
          sms: sms || false
        }
      },
      { new: true }
    );

    res.json(offer);

  } catch (err) {
    console.error("❌ Update channels error:", err);
    res.status(500).json({ message: "Failed to update channels" });
  }
};

// ============================================
// PRIVATE: SEND TO CUSTOMERS - ENHANCED WITH VALIDATION
// ============================================
const sendToCustomers = async (offerId) => {
  try {
    const offer = await Offer.findById(offerId);
    if (!offer) throw new Error("Offer not found");

    console.log(`\n📨 Sending offer: ${offer.title}`);
    
    // Get customers
    const customers = await Customer.find({ companyId: offer.companyId });
    
    console.log(`👥 Found ${customers.length} customers`);

    // Update offer with total customers
    offer.totalCustomers = customers.length;
    offer.status = "sending";
    await offer.save();

    let emailSent = 0;
    let emailFail = 0;
    let smsSent = 0;
    let smsFail = 0;

    // Default channels if not set
    const channels = offer.channels || { email: true, sms: false };

    // Process each customer
    for (const customer of customers) {
      let deliveryStatus = "failed";
      let deliveryReason = "";
      const attempts = [];

      // Try EMAIL if enabled
      if (channels.email && customer.email) {
        const emailResult = await sendEmail(
          customer.email,
          offer.title,
          offer.message
        );

        if (emailResult.success) {
          emailSent++;
          deliveryStatus = "sent";
          attempts.push({
            channel: "email",
            status: "sent",
            timestamp: new Date()
          });
        } else {
          emailFail++;
          attempts.push({
            channel: "email",
            status: "failed",
            reason: emailResult.reason,
            timestamp: new Date()
          });
          deliveryReason = emailResult.reason;
        }
      }

      // Try SMS if enabled and email failed/no email
      if (channels.sms && customer.mobile) {
        const smsResult = await sendSMS(
          customer.mobile,
          offer.message
        );

        if (smsResult.success) {
          smsSent++;
          deliveryStatus = "sent";
          attempts.push({
            channel: "sms",
            status: "sent",
            timestamp: new Date()
          });
        } else {
          smsFail++;
          attempts.push({
            channel: "sms",
            status: "failed",
            reason: smsResult.reason,
            timestamp: new Date()
          });
          deliveryReason = smsResult.reason;
        }
      }

      // If no channels selected
      if (!channels.email && !channels.sms) {
        deliveryReason = "No communication channels selected";
      }

      // Create delivery record
      await Delivery.create({
        offerId: offer._id,
        customerId: customer._id,
        email: customer.email,
        mobile: customer.mobile,
        status: deliveryStatus,
        reason: deliveryReason,
        attempts
      });
    }

    // Update offer statistics
    offer.sentCount = emailSent + smsSent;
    offer.failCount = emailFail + smsFail;
    offer.emailSentCount = emailSent;
    offer.emailFailCount = emailFail;
    offer.smsSentCount = smsSent;
    offer.smsFailCount = smsFail;
    offer.status = "sent";
    offer.sentAt = new Date();
    
    await offer.save();

    console.log(`📊 Summary: Email: ${emailSent} sent, ${emailFail} failed | SMS: ${smsSent} sent, ${smsFail} failed`);

    return {
      emailSent,
      emailFail,
      smsSent,
      smsFail
    };

  } catch (err) {
    console.error("❌ Send to customers error:", err);
    
    // Update offer status to failed
    await Offer.findByIdAndUpdate(offerId, {
      status: "failed"
    });
    
    throw err;
  }
};