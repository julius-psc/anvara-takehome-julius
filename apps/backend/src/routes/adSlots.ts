import { Router, type Request, type Response, type IRouter } from 'express';
import { prisma } from '../db.js';
import { getParam } from '../utils/helpers.js';
import { requireAuth, type AuthRequest } from '../auth.js';

const router: IRouter = Router();

// Valid ad slot types — matches the Prisma AdSlotType enum.
const AD_SLOT_TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'] as const;
type AdSlotType = (typeof AD_SLOT_TYPES)[number];

// GET /api/ad-slots - PUBLIC marketplace listing.
// Browsing available inventory is meant to be public (no auth), so anyone can
// discover slots to advertise on.
router.get('/', async (req: Request, res: Response) => {
  try {
    const { publisherId, type, available } = req.query;

    const adSlots = await prisma.adSlot.findMany({
      where: {
        ...(publisherId && { publisherId: getParam(publisherId) }),
        ...(type && {
          type: type as string as AdSlotType,
        }),
        ...(available === 'true' && { isAvailable: true }),
      },
      include: {
        publisher: { select: { id: true, name: true, category: true, monthlyViews: true } },
        _count: { select: { placements: true } },
      },
      orderBy: { basePrice: 'desc' },
    });

    res.json(adSlots);
  } catch (error) {
    console.error('Error fetching ad slots:', error);
    res.status(500).json({ error: 'Failed to fetch ad slots' });
  }
});

// GET /api/ad-slots/mine - the authenticated publisher's OWN slots (for the dashboard).
// Must be declared before '/:id' so "mine" isn't captured as an :id param.
router.get('/mine', requireAuth, async (req: AuthRequest, res: Response) => {
  const publisherId = req.user?.publisherId;
  if (!publisherId) {
    res.status(403).json({ error: 'Only publishers can access their ad slots' });
    return;
  }

  try {
    const adSlots = await prisma.adSlot.findMany({
      where: { publisherId },
      include: { _count: { select: { placements: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(adSlots);
  } catch (error) {
    console.error('Error fetching ad slots:', error);
    res.status(500).json({ error: 'Failed to fetch ad slots' });
  }
});

// GET /api/ad-slots/:id - PUBLIC single ad slot detail (marketplace detail page).
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = getParam(req.params.id);
    const adSlot = await prisma.adSlot.findUnique({
      where: { id },
      include: {
        publisher: true,
        placements: {
          include: {
            campaign: { select: { id: true, name: true, status: true } },
          },
        },
      },
    });

    if (!adSlot) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    res.json(adSlot);
  } catch (error) {
    console.error('Error fetching ad slot:', error);
    res.status(500).json({ error: 'Failed to fetch ad slot' });
  }
});

// POST /api/ad-slots - create an ad slot for the authenticated publisher.
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const publisherId = req.user?.publisherId;
  if (!publisherId) {
    res.status(403).json({ error: 'Only publishers can create ad slots' });
    return;
  }

  try {
    const { name, description, type, basePrice } = req.body;

    if (!name || !type || basePrice === undefined) {
      res.status(400).json({ error: 'Name, type, and basePrice are required' });
      return;
    }

    if (!AD_SLOT_TYPES.includes(type)) {
      res.status(400).json({
        error: `Invalid type. Must be one of: ${AD_SLOT_TYPES.join(', ')}`,
      });
      return;
    }

    const price = Number(basePrice);
    if (Number.isNaN(price) || price <= 0) {
      res.status(400).json({ error: 'basePrice must be a positive number' });
      return;
    }

    const adSlot = await prisma.adSlot.create({
      data: {
        name,
        description,
        type: type as AdSlotType,
        basePrice: price,
        // From the session, never the request body.
        publisherId,
      },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(adSlot);
  } catch (error) {
    console.error('Error creating ad slot:', error);
    res.status(500).json({ error: 'Failed to create ad slot' });
  }
});

// POST /api/ad-slots/:id/book - book a slot as the authenticated sponsor.
// sponsorId is derived from the session, never trusted from the body; a
// non-sponsor (or logged-out) caller gets 403/401 from requireAuth.
router.post('/:id/book', requireAuth, async (req: AuthRequest, res: Response) => {
  const sponsorId = req.user?.sponsorId;
  if (!sponsorId) {
    res.status(403).json({ error: 'Only sponsors can book ad slots' });
    return;
  }

  try {
    const id = getParam(req.params.id);
    const { message } = req.body;

    // Check if slot exists and is available
    const adSlot = await prisma.adSlot.findUnique({
      where: { id },
      include: { publisher: true },
    });

    if (!adSlot) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    if (!adSlot.isAvailable) {
      res.status(400).json({ error: 'Ad slot is no longer available' });
      return;
    }

    // Mark slot as unavailable
    const updatedSlot = await prisma.adSlot.update({
      where: { id },
      data: { isAvailable: false },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    // Simplified booking: we flip availability rather than create a Placement
    // (that model is still a stub). The security-critical part — who is booking —
    // is now the authenticated sponsor from the session, not a client-supplied id.
    console.log(`Ad slot ${id} booked by sponsor ${sponsorId}. Message: ${message || 'None'}`);

    res.json({
      success: true,
      message: 'Ad slot booked successfully!',
      adSlot: updatedSlot,
    });
  } catch (error) {
    console.error('Error booking ad slot:', error);
    res.status(500).json({ error: 'Failed to book ad slot' });
  }
});

// POST /api/ad-slots/:id/unbook - reset a slot back to available.
// Only the owning publisher may do this — it's editing their own inventory's
// availability, so it uses the same ownership check as PUT/DELETE.
router.post('/:id/unbook', requireAuth, async (req: AuthRequest, res: Response) => {
  const publisherId = req.user?.publisherId;
  if (!publisherId) {
    res.status(403).json({ error: 'Only publishers can reset their ad slots' });
    return;
  }

  try {
    const id = getParam(req.params.id);

    // Verify ownership before mutating (update() only matches on the unique id).
    const existing = await prisma.adSlot.findFirst({ where: { id, publisherId } });
    if (!existing) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    const updatedSlot = await prisma.adSlot.update({
      where: { id },
      data: { isAvailable: true },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      message: 'Ad slot is now available again',
      adSlot: updatedSlot,
    });
  } catch (error) {
    console.error('Error unbooking ad slot:', error);
    res.status(500).json({ error: 'Failed to unbook ad slot' });
  }
});

// PUT /api/ad-slots/:id - update an ad slot the publisher owns
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const publisherId = req.user?.publisherId;
  if (!publisherId) {
    res.status(403).json({ error: 'Only publishers can update ad slots' });
    return;
  }

  try {
    const id = getParam(req.params.id);

    // Verify ownership first (update() only takes the unique id in where).
    const existing = await prisma.adSlot.findFirst({ where: { id, publisherId } });
    if (!existing) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    const { name, description, type, basePrice, isAvailable } = req.body;

    // Validate only the fields that were provided (partial update).
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      res.status(400).json({ error: 'Name must be a non-empty string' });
      return;
    }
    if (type !== undefined && !AD_SLOT_TYPES.includes(type)) {
      res.status(400).json({
        error: `Invalid type. Must be one of: ${AD_SLOT_TYPES.join(', ')}`,
      });
      return;
    }
    if (basePrice !== undefined && (Number.isNaN(Number(basePrice)) || Number(basePrice) <= 0)) {
      res.status(400).json({ error: 'basePrice must be a positive number' });
      return;
    }
    if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
      res.status(400).json({ error: 'isAvailable must be a boolean' });
      return;
    }

    const adSlot = await prisma.adSlot.update({
      where: { id },
      data: {
        // publisherId is deliberately absent — ownership can't be reassigned.
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type: type as AdSlotType }),
        ...(basePrice !== undefined && { basePrice: Number(basePrice) }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
      include: {
        publisher: { select: { id: true, name: true } },
      },
    });

    res.json(adSlot);
  } catch (error) {
    console.error('Error updating ad slot:', error);
    res.status(500).json({ error: 'Failed to update ad slot' });
  }
});

// DELETE /api/ad-slots/:id - delete an ad slot the publisher owns
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const publisherId = req.user?.publisherId;
  if (!publisherId) {
    res.status(403).json({ error: 'Only publishers can delete ad slots' });
    return;
  }

  try {
    const id = getParam(req.params.id);

    const existing = await prisma.adSlot.findFirst({ where: { id, publisherId } });
    if (!existing) {
      res.status(404).json({ error: 'Ad slot not found' });
      return;
    }

    await prisma.adSlot.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ad slot:', error);
    res.status(500).json({ error: 'Failed to delete ad slot' });
  }
});

export default router;
