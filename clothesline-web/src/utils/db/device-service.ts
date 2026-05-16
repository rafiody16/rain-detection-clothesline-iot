import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import app from "../firebase";

const db = getFirestore(app);

export interface UserDevice {
  deviceId: string;
  name: string;
  addedAt: string;
}

/**
 * Get all devices for a user by email
 */
export async function getUserDevices(email: string): Promise<UserDevice[]> {
  const q = query(collection(db, "users"), where("email", "==", email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return [];

  const userData = snapshot.docs[0].data();
  return (userData.devices as UserDevice[]) || [];
}

/**
 * Add a device to a user's account
 */
export async function addDeviceToUser(
  email: string,
  deviceId: string,
  name: string
): Promise<{ success: boolean; message: string }> {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, message: "User not found" };
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const devices: UserDevice[] = userData.devices || [];

    // Check if device already exists for this user
    if (devices.some((d) => d.deviceId === deviceId)) {
      return { success: false, message: "Device already added to your account" };
    }

    const newDevice: UserDevice = {
      deviceId,
      name,
      addedAt: new Date().toISOString(),
    };

    await updateDoc(doc(db, "users", userDoc.id), {
      devices: [...devices, newDevice],
    });

    return { success: true, message: "Device added successfully" };
  } catch (error: any) {
    console.error("Error adding device:", error);
    return { success: false, message: error.message || "Failed to add device" };
  }
}

/**
 * Remove a device from a user's account
 */
export async function removeDeviceFromUser(
  email: string,
  deviceId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, message: "User not found" };
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const devices: UserDevice[] = userData.devices || [];

    const filtered = devices.filter((d) => d.deviceId !== deviceId);

    await updateDoc(doc(db, "users", userDoc.id), {
      devices: filtered,
    });

    return { success: true, message: "Device removed successfully" };
  } catch (error: any) {
    console.error("Error removing device:", error);
    return {
      success: false,
      message: error.message || "Failed to remove device",
    };
  }
}

/**
 * Update a device name for a user
 */
export async function updateDeviceName(
  email: string,
  deviceId: string,
  newName: string
): Promise<{ success: boolean; message: string }> {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, message: "User not found" };
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const devices: UserDevice[] = userData.devices || [];

    const updated = devices.map((d) =>
      d.deviceId === deviceId ? { ...d, name: newName } : d
    );

    await updateDoc(doc(db, "users", userDoc.id), {
      devices: updated,
    });

    return { success: true, message: "Device name updated successfully" };
  } catch (error: any) {
    console.error("Error updating device name:", error);
    return {
      success: false,
      message: error.message || "Failed to update device name",
    };
  }
}
