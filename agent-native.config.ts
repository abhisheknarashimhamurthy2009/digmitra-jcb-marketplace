import { defineAgentNativeConfig } from "@agent-native/core/config";

export default defineAgentNativeConfig({
  changelog: { enabled: false },
  harness: false,
  onboarding: { firstRun: "off" },
  runtime: {
    auth: { enabled: false },
  },
});
