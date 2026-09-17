import { Router, type Request, type Response, type IRouter } from 'express';
import { prisma, Prisma } from '../db.js';
import { getParam, isValidEmail } from '../utils/helpers.js';
import { requireAuth, type AuthRequest } from '../auth.js';

const router: IRouter = Router();

// GET /api/sponsors - List all sponsors
router.get('/', async (_req: Request, res: Response) => {
  try {
    const sponsors = await prisma.sponsor.findMany({
      include: {
        _count: {
          select: { campaigns: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(sponsors);
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});

// GET /api/sponsors/:id - Get single sponsor with campaigns
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const sponsor = await prisma.sponsor.findUnique({
      where: { id },
      include: {
        campaigns: {
          include: {
            _count: { select: { placements: true } },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!sponsor) {
      res.status(404).json({ error: 'Sponsor not found' });
      return;
    }

    res.json(sponsor);
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    res.status(500).json({ error: 'Failed to fetch sponsor' });
  }
});

// POST /api/sponsors - Create new sponsor
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, website, logo, description, industry } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const sponsor = await prisma.sponsor.create({
      data: { name, email, website, logo, description, industry },
    });

    res.status(201).json(sponsor);
  } catch (error) {
    console.error('Error creating sponsor:', error);
    res.status(500).json({ error: 'Failed to create sponsor' });
  }
});

// PUT /api/sponsors/:id - update the authenticated sponsor's own profile.
// Per-route auth: the GET/POST above stay public (browsing/onboarding), but
// editing a profile requires a session and is scoped to the owner.
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const sponsorId = req.user?.sponsorId;
  if (!sponsorId) {
    res.status(403).json({ error: 'Only sponsors can update a sponsor profile' });
    return;
  }

  try {
    const id = getParam(req.params.id);

    // A sponsor may only edit their own profile. Any other id — missing or
    // someone else's — is a 404, so we never reveal that another sponsor exists.
    if (id !== sponsorId) {
      res.status(404).json({ error: 'Sponsor not found' });
      return;
    }

    const { name, email, website, logo, description, industry } = req.body;

    // Validate only the fields that were actually provided (partial update).
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      res.status(400).json({ error: 'Name must be a non-empty string' });
      return;
    }
    if (email !== undefined && (typeof email !== 'string' || !isValidEmail(email))) {
      res.status(400).json({ error: 'A valid email is required' });
      return;
    }
    // The remaining fields are optional strings (or null to clear them).
    for (const [field, value] of Object.entries({ website, logo, description, industry })) {
      if (value !== undefined && value !== null && typeof value !== 'string') {
        res.status(400).json({ error: `${field} must be a string` });
        return;
      }
    }

    const sponsor = await prisma.sponsor.update({
      where: { id },
      data: {
        // Only the provided fields change. userId (the Better Auth account link)
        // is deliberately absent — a profile edit can never reassign ownership.
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(website !== undefined && { website }),
        ...(logo !== undefined && { logo }),
        ...(description !== undefined && { description }),
        ...(industry !== undefined && { industry }),
      },
    });

    res.json(sponsor);
  } catch (error) {
    // email is @unique — a collision surfaces as Prisma's P2002 (unique
    // constraint) error, which is a client problem (409), not a 500.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({ error: 'A sponsor with that email already exists' });
      return;
    }
    console.error('Error updating sponsor:', error);
    res.status(500).json({ error: 'Failed to update sponsor' });
  }
});

export default router;
