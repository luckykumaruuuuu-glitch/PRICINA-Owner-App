---
name: Firebase Expo compatibility
description: Firebase JavaScript SDK behavior and Expo preview constraints for this project
---

The current Firebase JavaScript SDK package does not expose the older `firebase/auth/react-native` persistence entry point. Expo Go/Web preview should use the shared `getAuth` client path and must not import that missing module.

**Why:** The expected React Native auth subpath caused a TypeScript failure in this environment even though the main Firebase SDK was installed and the Expo bundle itself was healthy.

**How to apply:** Keep Firebase client initialization platform-safe and verify with the installed SDK exports before adding native auth persistence or FCM modules.