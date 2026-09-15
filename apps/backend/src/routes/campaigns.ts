import { Router, type Response, type IRouter } from 'express';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';
import { requireAuth, type AuthRequest } from '../auth.js';

const router: IRouter = Router();

// Every campaign route requires an authenticated user.
router.use(requireAuth);

// GET /api/campaigns - list the authenticated sponsor's own campaigns
router.get('/', async (req: AuthRequest, res: Response) => {
  const sponsorId = req.user?.sponsorId;
  if (!sponsorId) {
    res.status(403).json({ error: 'Only sponsors can access campaigns' });
    return;
  }

  try {
    const { status } = req.query;

    const campaigns = await prisma.campaign.findMany({
      where: {
        // Scoped to the session's sponsor — the client cannot widen this.
        sponsorId,
        ...(status && { status: status as string as 'ACTIVE' | 'PAUSED' | 'COMPLETED' }),
      },
      include: {
        sponsor: { select: { id: true, name: true, logo: true } },
        _count: { select: { creatives: true, placements: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// GET /api/campaigns/:id - get a single campaign the sponsor owns
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const sponsorId = req.user?.sponsorId;
  if (!sponsorId) {
    res.status(403).json({ error: 'Only sponsors can access campaigns' });
    return;
  }

  try {
    const id = getParam(req.params.id);

    // Ownership is baked into the query: a campaign this sponsor doesn't own is
    // simply "not found". Returning 404 for both missing AND not-owned means we
    // never reveal that another sponsor's campaign exists.
    const campaign = await prisma.campaign.findFirst({
      where: { id, sponsorId },
      include: {
        sponsor: true,
        creatives: true,
        placements: {
          include: {
            adSlot: true,
            publisher: { select: { id: true, name: true, category: true } },
          },
        },
      },
    });

    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// POST /api/campaigns - create a campaign for the authenticated sponsor
router.post('/', async (req: AuthRequest, res: Response) => {
  const sponsorId = req.user?.sponsorId;
  if (!sponsorId) {
    res.status(403).json({ error: 'Only sponsors can create campaigns' });
    return;
  }

  try {
    const {
      name,
      description,
      budget,
      cpmRate,
      cpcRate,
      startDate,
      endDate,
      targetCategories,
      targetRegions,
    } = req.body;

    if (!name || !budget || !startDate || !endDate) {
      res.status(400).json({
        error: 'Name, budget, startDate, and endDate are required',
      });
      return;
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        budget,
        cpmRate,
        cpcRate,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        targetCategories: targetCategories || [],
        targetRegions: targetRegions || [],
        // From the session, never from the request body — a client cannot create
        // a campaign under someone else's sponsor.
        sponsorId,
      },
      include: {
        sponsor: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// TODO: Add PUT /api/campaigns/:id endpoint (Challenge 4)
// TODO: Add DELETE /api/campaigns/:id endpoint (Challenge 4)

export default router;
