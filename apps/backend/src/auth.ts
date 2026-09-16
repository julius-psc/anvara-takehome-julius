import { type Request, type Response, type NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './lib/auth.js';
import { prisma } from './db.js';

// The authenticated user we attach to the request. `role`/`sponsorId`/
// `publisherId` are derived from the Sponsor/Publisher records, which is how we
// scope every query to the user's own data.
export interface AuthUser {
  id: string;
  email: string;
  role: 'SPONSOR' | 'PUBLISHER' | null;
  sponsorId?: string;
  publisherId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// requireAuth: validate the Better Auth session on the incoming request.
// - 401 if there is no valid session
// - otherwise attach req.user (with role + ownership ids) and continue
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // A user is either a sponsor or a publisher (or neither). Look up both to
    // determine their role and the id we scope their data by.
    const [sponsor, publisher] = await Promise.all([
      prisma.sponsor.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      }),
      prisma.publisher.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      }),
    ]);

    req.user = {
      id: session.user.id,
      email: session.user.email,
      role: sponsor ? 'SPONSOR' : publisher ? 'PUBLISHER' : null,
      sponsorId: sponsor?.id,
      publisherId: publisher?.id,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// requireRole: gate a route to specific role(s). Assumes requireAuth ran first.
export function requireRole(...allowedRoles: Array<'SPONSOR' | 'PUBLISHER'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
