// utils/activityLogger.js
import { getSession } from "next-auth/react";

export const logActivity = async (action, metadata = {}) => {
  try {
    // Get the current user session (client-side)
    const session = await getSession();
    const userEmail = session?.user?.email || "anonymous";

    const activityData = {
      userEmail,
      action,
      metadata,
      timestamp: new Date().toISOString(),
    };

    await fetch("/api/activity/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activityData),
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};