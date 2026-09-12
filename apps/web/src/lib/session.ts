import { headers } from 'next/headers'
import { getSession } from '@mgc/auth'

export interface SessionUser {
  id: string
  name: string
  email: string
}

/** Current signed-in user or null. Call inside server components/actions. */
export async function currentUser(): Promise<SessionUser | null> {
  const session = await getSession(await headers())
  if (!session?.user) return null
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  }
}
