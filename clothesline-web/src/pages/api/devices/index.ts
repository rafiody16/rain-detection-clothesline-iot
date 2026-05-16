import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import {
  getUserDevices,
  addDeviceToUser,
  removeDeviceFromUser,
  updateDeviceName,
} from "@/utils/db/device-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const email = session.user.email;

  try {
    // GET — List all devices for current user
    if (req.method === "GET") {
      const devices = await getUserDevices(email);
      return res.status(200).json(devices);
    }

    // POST — Add a new device
    if (req.method === "POST") {
      const { deviceId, name } = req.body;

      if (!deviceId || !name) {
        return res
          .status(400)
          .json({ error: "deviceId and name are required" });
      }

      // Validate device ID format (12 hex characters = MAC address)
      if (!/^[A-Fa-f0-9]{12}$/.test(deviceId)) {
        return res.status(400).json({
          error: "Invalid device ID format. Must be 12 hex characters.",
        });
      }

      const result = await addDeviceToUser(email, deviceId.toUpperCase(), name);
      return res.status(result.success ? 200 : 400).json(result);
    }

    // DELETE — Remove a device
    if (req.method === "DELETE") {
      const { deviceId } = req.body;

      if (!deviceId) {
        return res.status(400).json({ error: "deviceId is required" });
      }

      const result = await removeDeviceFromUser(email, deviceId);
      return res.status(result.success ? 200 : 400).json(result);
    }

    // PATCH — Update device name
    if (req.method === "PATCH") {
      const { deviceId, name } = req.body;

      if (!deviceId || !name) {
        return res
          .status(400)
          .json({ error: "deviceId and name are required" });
      }

      const result = await updateDeviceName(email, deviceId, name);
      return res.status(result.success ? 200 : 400).json(result);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Device API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
