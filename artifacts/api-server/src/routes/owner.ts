import { Router, type IRouter } from "express";
import { getFirebaseAdmin, ownerUid } from "../lib/firebase-admin";

const ownerRouter: IRouter = Router();

ownerRouter.post("/owner/session", async (_request, response) => {
  try {
    const { adminAuth, adminFirestore, firebaseAdminProjectId } = getFirebaseAdmin();
    await adminFirestore.collection("users").doc(ownerUid).set(
      {
        role: "owner",
        updatedAt: new Date(),
      },
      { merge: true },
    );
    const token = await adminAuth.createCustomToken(ownerUid, { role: "owner" });
    response.setHeader("Cache-Control", "no-store");
    response.json({
      token,
      projectId: firebaseAdminProjectId,
      uid: ownerUid,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create owner session.";
    response.status(500).json({ error: message });
  }
});

export default ownerRouter;