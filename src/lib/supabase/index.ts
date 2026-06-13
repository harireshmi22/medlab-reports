/**
 * @deprecated This file is deprecated. Use ONLY client-side access factories 
 * from `@/lib/supabase/client` or server-side access factories from `@/lib/supabase/server`.
 * 
 * Do NOT use localStorage-based clients or standard createClient direct invocations 
 * to avoid session desynchronization.
 */

import { createClient as createBrowserClient } from "./client";
import { createClient as createServerClient } from "./server";

export { createBrowserClient, createServerClient };
