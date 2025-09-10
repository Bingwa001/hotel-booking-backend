import express from 'express';
import User from "../models/User.js";
import { Webhook } from "svix";

const router = express.Router();

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    let payload;
    try {
      payload = whook.verify(req.body.toString(), headers); // convert Buffer to string
    } catch (verifyError) {
      console.log("Webhook verification failed:", verifyError.message);
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const { data, type } = payload;

    const email = data.email_addresses?.[0]?.email_address;
    const firstName = data.first_name || '';
    const lastName = data.last_name || '';
    const username = `${firstName} ${lastName}`.trim() || email?.split('@')[0] || 'User';

    const userData = {
      _id: data.id,
      email,
      username,
      image: data.image_url || 'https://yourapp.com/default-avatar.png',
      recentSearchedCities: []
    };

    switch (type) {
      case "user.created":
        await User.findByIdAndUpdate(data.id, userData, { upsert: true, new: true });
        console.log(`User upserted: ${userData.email}`);
        break;
      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData, { new: true });
        console.log(`User updated: ${userData.email}`);
        break;
      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        console.log(`User deleted: ${data.id}`);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
        break;
    }

    res.status(200).json({ success: true, message: "Webhook processed successfully" });

  } catch (error) {
    console.error("Webhook processing error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
