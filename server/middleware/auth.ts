import { defineEventHandler } from "h3";

export default defineEventHandler(async () => {
  // Mobile app uses its own phone + OTP authentication in client routes.
  // Bypass all framework auth guards.
  return;
});
