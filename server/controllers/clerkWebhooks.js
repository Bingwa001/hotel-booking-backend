import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // Handle raw body for webhook verification
        const payload = req.body;
        await whook.verify(payload, headers);

        // Parse the JSON after verification
        const { data, type } = JSON.parse(payload.toString());

        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
            image: data.image_url,
            recentSearchedCities: []
        };

        console.log('Webhook event:', type);
        console.log('User data:', userData);

        switch (type) {
            case "user.created": {
                const newUser = await User.create(userData);
                console.log('User created successfully:', newUser);
                break;
            }
            case "user.updated": {
                const updatedUser = await User.findByIdAndUpdate(data.id, userData, { new: true });
                console.log('User updated successfully:', updatedUser);
                break;
            }
            case "user.deleted": {
                const deletedUser = await User.findByIdAndDelete(data.id);
                console.log('User deleted successfully:', deletedUser);
                break;
            }
            default:
                console.log('Unhandled webhook event:', type);
                break;
        }

        res.json({ success: true, message: "Webhook Received" });

    } catch (error) {
        console.error('Webhook error:', error.message);
        console.error('Full error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export default clerkWebhooks;