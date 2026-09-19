import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

export const ownerUid = process.env["PRICINA_OWNER_UID"] ?? "pricina-owner-portal";

let adminAuth: ReturnType<typeof getAuth> | undefined;
let adminFirestore: ReturnType<typeof getFirestore> | undefined;
let firebaseAdminProjectId: string | undefined;

function parseServiceAccount(rawValue: string): ServiceAccount {
  const raw = rawValue.trim();
  const candidates = [raw];
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'")) ||
    (raw.startsWith("`") && raw.endsWith("`"))
  ) {
    candidates.push(raw.slice(1, -1));
  }
  try {
    candidates.push(Buffer.from(raw, "base64").toString("utf8"));
  } catch {
    // Ignore non-base64 input and continue with JSON candidates.
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      const value =
        typeof parsed === "string" ? (JSON.parse(parsed) as unknown) : parsed;
      if (
        value &&
        typeof value === "object" &&
        "project_id" in value &&
        "client_email" in value &&
        "private_key" in value &&
        typeof value.project_id === "string" &&
        typeof value.client_email === "string" &&
        typeof value.private_key === "string"
      ) {
        return value as ServiceAccount;
      }
    } catch {
      // Try the next supported representation without logging the secret.
    }
  }
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT_JSON must contain valid Firebase service-account JSON.",
  );
}

function initializeFirebaseAdmin() {
  if (adminAuth && adminFirestore && firebaseAdminProjectId) {
    return { adminAuth, adminFirestore, firebaseAdminProjectId };
  }
  const serviceAccountJson = process.env["FIREBASE_SERVICE_ACCOUNT_JSON"];
  if (!serviceAccountJson) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is required for the owner session bridge.");
  }
  const serviceAccount = parseServiceAccount(serviceAccountJson);
  const firebaseAdminApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: serviceAccount.project_id,
          clientEmail: serviceAccount.client_email,
          privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
        }),
        projectId: serviceAccount.project_id,
      });
  adminAuth = getAuth(firebaseAdminApp);
  adminFirestore = getFirestore(firebaseAdminApp);
  firebaseAdminProjectId = serviceAccount.project_id;
  return { adminAuth, adminFirestore, firebaseAdminProjectId };
}

export function getFirebaseAdmin() {
  return initializeFirebaseAdmin();
}