// /frontend/app/services/authFetch.js
// fetch() wrapper that automatically attaches Clerk Bearer token
// Returns the raw Response (so apiRequest can keep its parsing & error logic)

import { getClerkSessionToken } from "./authToken.js";

export async function authFetch(url, options = {}) {
  // Logic abstracted for showcase purposes.
}
