import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { aiHealthService } from '../services/ai-health.service.js';

export function createAIHealthRoutes(): Router {
  const router = Router();

  // GET /api/ai/health - Check health of all AI services (no auth required)
  router.get(
    '/health',
    asyncHandler(async (req: Request, res: Response) => {
      const healthStatus = await aiHealthService.checkAllServices();

      res.json({
        success: true,
        data: healthStatus,
      });
    })
  );

  return router;
}
