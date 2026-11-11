import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { db } from '../db/connection.js';
import { gallery_items } from '../db/schema.js';
import { eq, like, or } from 'drizzle-orm';
import { galleries, categoryMeta, type GalleryCategory } from '../../shared/galleries.js';

export function createGalleryRoutes() {
  const router = Router();

  // GET /:category - Get gallery items by category
  router.get(
    '/:category',
    optionalAuth,
    asyncHandler(async (req, res) => {
      const { category } = req.params;

      // Get static gallery data
      const staticImages = galleries[category as GalleryCategory] || [];
      const meta = categoryMeta[category as GalleryCategory];

      // Get user-submitted gallery items from database (only public ones)
      const dbItems = await db
        .select()
        .from(gallery_items)
        .where(eq(gallery_items.category, category));

      // Filter to only public items unless it's the user's own items
      const filteredDbItems = dbItems.filter(
        (item) => item.is_public || (req.user && item.user_id === req.user.userId)
      );

      // Transform DB items to match expected format
      const userItems = filteredDbItems.map((item) => ({
        id: item.id,
        url: item.image_url,
        title: item.title,
        description: item.description,
        isUserSubmitted: true,
      }));

      // Combine static and user items
      const allItems = [
        ...staticImages.map((url, index) => ({
          id: `static-${index}`,
          url,
          isUserSubmitted: false,
        })),
        ...userItems,
      ];

      res.json({
        category,
        meta,
        items: allItems,
        total: allItems.length,
      });
    })
  );

  // GET /search - Search gallery items
  router.get(
    '/search',
    optionalAuth,
    asyncHandler(async (req, res) => {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Missing search query' });
      }

      // Limit query length and escape LIKE wildcards
      const sanitized = q.slice(0, 100).replace(/[%_\\]/g, '\\$&');
      const searchPattern = `%${sanitized}%`;
      const dbItems = await db
        .select()
        .from(gallery_items)
        .where(
          or(
            like(gallery_items.title, searchPattern),
            like(gallery_items.description, searchPattern),
            like(gallery_items.category, searchPattern)
          )
        );

      // Filter to only public items unless it's the user's own items
      const filteredDbItems = dbItems.filter(
        (item) => item.is_public || (req.user && item.user_id === req.user.userId)
      );

      // Transform results
      const results = filteredDbItems.map((item) => ({
        id: item.id,
        url: item.image_url,
        title: item.title,
        description: item.description,
        category: item.category,
        isUserSubmitted: true,
      }));

      res.json({
        query: q,
        results,
        total: results.length,
      });
    })
  );

  return router;
}
