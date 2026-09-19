---
name: Silent owner authentication
description: Authentication constraint for the direct-open PRICINA Owner experience
---

Direct-open UX does not remove the need for Firebase authentication: owner-only Firestore rules return permission-denied when no authenticated owner session exists. A safe silent session needs a server-side custom-token bridge and valid Firebase Admin credentials; public reads or client-bundled passwords are not acceptable.

**Why:** Removing the visible login route made the dashboard open but also left the listener disabled because the app had no Firebase user. The live unauthenticated Firestore request confirmed a 403.

**How to apply:** Keep the dashboard route direct, restore or mint a Firebase owner session silently, and surface the actual auth/Firestore error instead of showing a misleading empty state.