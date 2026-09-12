/**
 * Server startup hook — intentionally empty. The DATABASE_URL secret is
 * resolved per request inside @mgc/db's createDb() (process.env, with
 * getCloudflareContext() as fallback), which is guaranteed available in
 * request scope.
 */
export async function register() {}
