import { rateLimit } from 'express-rate-limit'

/** Call after requireUser: the server-resolved account, never a client header, owns the quota. */
export function createPublishingLimit() {
  return rateLimit({
    windowMs: 60_000,
    limit: 30,
    keyGenerator: (_request, response) => response.locals.user.id as string,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Publishing limit reached. Please wait a minute before posting again.' },
  })
}
