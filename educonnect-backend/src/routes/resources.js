const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const resourceQuerySchema = Joi.object({
  type: Joi.string().valid('COURSE', 'CERTIFICATE', 'SOFTWARE', 'GRANT').optional(),
  category: Joi.string().optional(),
  isFree: Joi.boolean().optional(),
  search: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// Get all resources with filtering
router.get('/', async (req, res, next) => {
  try {
    const { error, value } = resourceQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { type, category, isFree, search, page, limit } = value;
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    if (type) where.type = type;
    if (category) where.category = category;
    if (isFree !== undefined) where.isFree = isFree;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { provider: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [resources, totalCount] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tags: true,
          savedBy: {
            select: { id: true },
            where: req.user ? { id: req.user.userId } : {},
          },
        },
      }),
      prisma.resource.count({ where }),
    ]);

    // Transform resources to include saved status
    const transformedResources = resources.map(resource => ({
      ...resource,
      saved: resource.savedBy.length > 0,
      savedBy: undefined,
    }));

    res.json({
      resources: transformedResources,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get resource by ID
router.get('/:id', async (req, res, next) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id },
      include: {
        tags: true,
        savedBy: {
          select: { id: true },
          where: req.user ? { id: req.user.userId } : {},
        },
        applications: {
          where: req.user ? { userId: req.user.userId } : {},
          select: { id: true, status: true },
        },
      },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Increment view count
    await prisma.resource.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } },
    });

    // Transform resource to include saved and applied status
    const transformedResource = {
      ...resource,
      saved: resource.savedBy.length > 0,
      applied: resource.applications.length > 0,
      applicationStatus: resource.applications[0]?.status || null,
      savedBy: undefined,
      applications: undefined,
    };

    res.json(transformedResource);
  } catch (error) {
    next(error);
  }
});

// Save/unsave resource
router.post('/:id/save', authenticateToken, async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user.userId;

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        savedBy: {
          where: { id: userId },
          select: { id: true },
        },
      },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const isSaved = resource.savedBy.length > 0;

    if (isSaved) {
      // Unsave resource
      await prisma.resource.update({
        where: { id: resourceId },
        data: {
          savedBy: {
            disconnect: { id: userId },
          },
          saveCount: { decrement: 1 },
        },
      });
      res.json({ message: 'Resource unsaved', saved: false });
    } else {
      // Save resource
      await prisma.resource.update({
        where: { id: resourceId },
        data: {
          savedBy: {
            connect: { id: userId },
          },
          saveCount: { increment: 1 },
        },
      });
      res.json({ message: 'Resource saved', saved: true });
    }
  } catch (error) {
    next(error);
  }
});

// Apply for resource
router.post('/:id/apply', authenticateToken, async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const userId = req.user.userId;
    const { notes, documents } = req.body;

    // Check if resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check if user already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
    });

    if (existingApplication) {
      return res.status(409).json({ error: 'Already applied for this resource' });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId,
        resourceId,
        notes,
        documents: documents || [],
      },
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
});

// Get user's saved resources
router.get('/saved', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [resources, totalCount] = await Promise.all([
      prisma.resource.findMany({
        where: {
          savedBy: {
            some: { id: userId },
          },
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          tags: true,
        },
      }),
      prisma.resource.count({
        where: {
          savedBy: {
            some: { id: userId },
          },
        },
      }),
    ]);

    res.json({
      resources: resources.map(resource => ({ ...resource, saved: true })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user's applications
router.get('/applications', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const [applications, totalCount] = await Promise.all([
      prisma.application.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          resource: {
            include: {
              tags: true,
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);

    res.json({
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.resource.findMany({
      select: { category: true },
      distinct: ['category'],
    });

    res.json(categories.map(c => c.category));
  } catch (error) {
    next(error);
  }
});

module.exports = router;