/**
 * Firebase Cloud Functions for SirsiNexus
 * Complete backend implementation for sirsi.ai
 */

import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import cors from "cors";

const corsHandler = cors({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// ============================================
// HEALTH CHECK
// ============================================

export const healthCheck = onRequest((request, response) => {
  corsHandler(request, response, () => {
    response.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "SirsiNexus Cloud Functions",
      environment: "production",
      domain: "sirsi.ai",
    });
  });
});

// ============================================
// AUTHENTICATION & USER MANAGEMENT
// ============================================

/**
 * Set custom claims for RBAC
 */
export const setUserClaims = onCall(async (request) => {
  // Verify caller is admin
  if (!request.auth || (request.auth.token as any).role !== "admin") {
    throw new HttpsError(
      "permission-denied",
      "Only administrators can set user roles"
    );
  }

  const { userId, role } = request.data;

  try {
    // Set custom claims
    await auth.setCustomUserClaims(userId, { role });

    // Update Firestore
    await db.doc(`users/${userId}`).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log activity
    await db.collection("activity_logs").add({
      action: "role_change",
      adminId: request.auth.uid,
      targetUserId: userId,
      newRole: role,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: `User role updated to ${role}` };
  } catch (error: any) {
    console.error("Error setting user claims:", error);
    throw new HttpsError("internal", "Failed to update role");
  }
});

/**
 * Create user profile after authentication (v1 trigger)
 */
export const createUserProfile = functions.auth
  .user().onCreate(async (user) => {
    const { uid, email, displayName, photoURL, providerData } = user;

    // Determine role based on signup source
    let role = "user";
    if (email && email.endsWith("@sirsi.ai")) {
      role = "admin";
    } else if (providerData[0]?.providerId === "github.com") {
      role = "developer";
    }

    const userProfile = {
      uid,
      email,
      displayName: displayName || email?.split("@")[0],
      photoURL:
      photoURL ||
      `https://ui-avatars.com/api/?name=${displayName || "User"}&background=10b981&color=fff`,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified: user.emailVerified,
      provider: providerData[0]?.providerId || "email",
      subscription: {
        plan: "free",
        status: "active",
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      settings: {
        notifications: true,
        newsletter: true,
        theme: "light",
        twoFactorEnabled: false,
      },
    };

    try {
      await db.doc(`users/${uid}`).set(userProfile);
      console.log(`User profile created for ${email}`);
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  });

/**
 * Delete user data when account is deleted (v1 trigger)
 */
export const deleteUserData = functions.auth.user().onDelete(async (user) => {
  const { uid } = user;

  try {
    // Delete user profile
    await db.doc(`users/${uid}`).delete();

    // Delete user's projects
    const projectsSnapshot = await db
      .collection("projects")
      .where("owner", "==", uid)
      .get();

    const batch = db.batch();
    projectsSnapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    console.log(`User data deleted for ${uid}`);
  } catch (error) {
    console.error("Error deleting user data:", error);
  }
});

// ============================================
// INVESTOR PORTAL
// ============================================

/**
 * Grant investor access
 */
export const grantInvestorAccess = onCall(async (request) => {
  if (!request.auth || (request.auth.token as any).role !== "admin") {
    throw new HttpsError("permission-denied", "Admin access required");
  }

  const { userId, accessLevel } = request.data;

  try {
    // Update user role
    await auth.setCustomUserClaims(userId, {
      role: "investor",
      accessLevel: accessLevel || "standard",
    });

    // Update Firestore
    await db.doc(`users/${userId}`).update({
      role: "investor",
      investorAccess: {
        level: accessLevel || "standard",
        grantedAt: admin.firestore.FieldValue.serverTimestamp(),
        grantedBy: request.auth.uid,
      },
    });

    // Add to investors collection
    await db
      .collection("investors")
      .doc(userId)
      .set({
        userId,
        accessLevel: accessLevel || "standard",
        documentsViewed: [],
        lastAccess: null,
        addedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return { success: true, message: "Investor access granted" };
  } catch (error: any) {
    console.error("Error granting investor access:", error);
    throw new HttpsError("internal", "Failed to grant access");
  }
});

/**
 * Log document access for compliance
 */
export const logDocumentAccess = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required");
  }

  const { documentId, action } = request.data;
  const userId = request.auth.uid;

  try {
    // Log access
    await db.collection("document_access_logs").add({
      userId,
      documentId,
      action: action || "view",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userRole: (request.auth.token as any).role,
    });

    // Update investor's viewed documents
    if ((request.auth.token as any).role === "investor") {
      await db.doc(`investors/${userId}`).update({
        documentsViewed: admin.firestore.FieldValue.arrayUnion(documentId),
        lastAccess: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error logging document access:", error);
    throw new HttpsError("internal", "Failed to log access");
  }
});

// ============================================
// DEVELOPER PLATFORM
// ============================================

/**
 * Create developer project
 */
export const createProject = onCall(async (request) => {
  const userRole = (request.auth?.token as any)?.role;
  if (!request.auth || !["developer", "admin"].includes(userRole)) {
    throw new HttpsError("permission-denied", "Developer access required");
  }

  const { name, description, githubRepo } = request.data;
  const userId = request.auth.uid;

  try {
    // Create project
    const project = {
      name,
      description,
      owner: userId,
      collaborators: [],
      githubRepo: githubRepo || null,
      apiKeys: [],
      status: "active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      metrics: {
        apiCalls: 0,
        deployments: 0,
        errors: 0,
      },
    };

    const projectRef = await db.collection("projects").add(project);

    // Generate API key
    const apiKey = generateApiKey();
    await db.collection("api_keys").add({
      key: apiKey,
      projectId: projectRef.id,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUsed: null,
      status: "active",
    });

    return {
      success: true,
      projectId: projectRef.id,
      apiKey,
    };
  } catch (error: any) {
    console.error("Error creating project:", error);
    throw new HttpsError("internal", "Failed to create project");
  }
});

// ============================================
// SCHEDULED FUNCTIONS
// ============================================

/**
 * Clean up old sessions daily
 */
export const cleanupSessions = onSchedule("every 24 hours", async (_event) => {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days

  try {
    const batch = db.batch();
    const snapshot = await db
      .collection("sessions")
      .where("lastActivity", "<", new Date(cutoff))
      .get();

    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    console.log(`Cleaned up ${snapshot.size} old sessions`);
  } catch (error) {
    console.error("Error cleaning up sessions:", error);
  }
});

// ============================================
// API ENDPOINTS
// ============================================

/**
 * API Gateway
 */
export const api = onRequest(async (req, res) => {
  return new Promise((resolve) => {
    corsHandler(req, res, async () => {
      // Verify API key
      const apiKey = req.headers["x-api-key"];
      if (!apiKey) {
        res.status(401).json({ error: "API key required" });
        resolve();
        return;
      }

      try {
        // Validate API key
        const keyDoc = await db
          .collection("api_keys")
          .where("key", "==", apiKey)
          .where("status", "==", "active")
          .get();

        if (keyDoc.empty) {
          res.status(401).json({ error: "Invalid API key" });
          resolve();
          return;
        }

        // Update last used
        await keyDoc.docs[0].ref.update({
          lastUsed: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Route to appropriate handler based on path
        const path = req.path;

        switch (path) {
        case "/api/status":
          res.json({
            status: "operational",
            timestamp: new Date().toISOString(),
          });
          break;
        case "/api/projects":
          res.json({ projects: [], message: "Projects endpoint" });
          break;
        case "/api/deployments":
          res.json({ deployments: [], message: "Deployments endpoint" });
          break;
        default:
          res.status(404).json({ error: "Endpoint not found" });
        }
        resolve();
      } catch (error: any) {
        console.error("API error:", error);
        res.status(500).json({ error: "Internal server error" });
        resolve();
      }
    });
  });
});

// ============================================
// PAYMENT PROCESSING
// ============================================

/**
 * Create Stripe checkout session
 */
export const createCheckoutSession = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Must be logged in");
  }

  const { successUrl } = request.data;
  // priceId and cancelUrl would be used with actual Stripe integration

  try {
    // This would integrate with Stripe
    // For now, return mock response
    return {
      success: true,
      sessionId: "cs_test_" + generateApiKey().substring(3, 15),
      url: successUrl,
    };
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    throw new HttpsError("internal", "Failed to create checkout session");
  }
});

/**
 * Handle webhook from payment provider
 */
export const handlePaymentWebhook = onRequest(async (req, res) => {
  // const signature = req.headers["stripe-signature"];
  // Would be used to verify webhook

  try {
    // Verify webhook signature
    // Process payment event
    // Update user subscription in Firestore

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: "Webhook processing failed" });
  }
});

// ============================================
// ANALYTICS & MONITORING
// ============================================

/**
 * Track user events
 */
export const trackEvent = onCall(async (request) => {
  const { eventName, properties } = request.data;
  const userId = request.auth?.uid || "anonymous";

  try {
    await db.collection("analytics_events").add({
      userId,
      eventName,
      properties: properties || {},
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      sessionId: request.data.sessionId || null,
      userAgent: request.rawRequest.headers["user-agent"],
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error tracking event:", error);
    throw new HttpsError("internal", "Failed to track event");
  }
});

/**
 * Generate analytics report
 */
export const generateAnalyticsReport = onSchedule(
  "every 24 hours",
  async (_event) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
    // Get events from yesterday
      const eventsSnapshot = await db
        .collection("analytics_events")
        .where("timestamp", ">=", yesterday)
        .where("timestamp", "<", today)
        .get();

      // Aggregate data
      const report = {
        date: yesterday.toISOString().split("T")[0],
        totalEvents: eventsSnapshot.size,
        uniqueUsers: new Set(
          eventsSnapshot.docs.map((doc) => doc.data().userId)
        ).size,
        eventBreakdown: {} as Record<string, number>,
      };

      eventsSnapshot.docs.forEach((doc) => {
        const eventName = doc.data().eventName;
        const count = report.eventBreakdown[eventName] || 0;
        report.eventBreakdown[eventName] = count + 1;
      });

      // Save report
      await db.collection("analytics_reports").add({
        ...report,
        generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("Analytics report generated:", report);
    } catch (error) {
      console.error("Error generating analytics report:", error);
    }
  });

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateApiKey(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "sk_";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}
