const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  const { receiver, text } = req.body;

  await Message.create({
    companyId: req.user.companyId,
    sender: req.user.id,
    receiver,
    text
  });

  res.json({ message: "Sent" });
};

exports.getMessages = async (req, res) => {
  const other = req.params.userId;

  const msgs = await Message.find({
    companyId: req.user.companyId,
    $or: [
      { sender: req.user.id, receiver: other },
      { sender: other, receiver: req.user.id }
    ]
  }).sort({ createdAt: 1 });

  res.json(msgs);
};

exports.markSeen = async (req, res) => {
  await Message.updateMany(
    { sender: req.params.userId, receiver: req.user.id },
    { seen: true }
  );

  res.json({ message: "Seen updated" });
};




exports.sendFile = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file" });

    const msg = await Message.create({
      sender: req.user.id,
      receiver: req.body.receiver,
      file: req.file.filename,
      type: req.file.mimetype.startsWith("image") ? "image" : "file",
      seen: false
    });

    res.json(msg);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "File send failed" });
  }
};
