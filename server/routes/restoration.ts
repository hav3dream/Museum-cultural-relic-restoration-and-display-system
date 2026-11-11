import { Router, Request, Response } from 'express';
import path from 'path';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { restorationService, RestorationType } from '../services/restoration.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';

/** Safely parse JSON stored in DB, return fallback on failure */
function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value); }
  catch { return fallback; }
}

// Multi-file upload:
// - file: main image (required for all types)
// - mask: mask image (for SGRGAN: ancient-painting, stele, calligraphy)
// - sketch: sketch/line-art (for DCADif: mural)
const multiUpload = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'mask', maxCount: 1 },
  { name: 'sketch', maxCount: 1 },
]);

export function createRestorationRoutes(): Router {
  const router = Router();

  /**
   * POST /calligraphy — 书法生成专用路由（JSON body，无文件上传）
   * body: { type: 'calligraphy', poem: string, style_wid: string }
   * 使用 LUO-Calli 模型（conda One-DM, port 5003）
   */
  router.post(
    '/calligraphy',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const { poem, style_wid } = req.body;

      if (!poem || !String(poem).trim()) {
        throw new AppError('poem is required', 400);
      }
      if (!style_wid) {
        throw new AppError('style_wid is required', 400);
      }

      // ACADEMIC_MODE 下跳过积分扣除
      await restorationService.deductCredit(req.user.userId);

      const restoration = await restorationService.createRestoration({
        userId: req.user.userId,
        type: 'calligraphy',
        inputFileUrl: '',
        algorithm: 'LuoCalli',
        parameters: { poem, style_wid },
        files: {},
        aiParams: { poem: String(poem), style_wid: String(style_wid) },
      });

      console.log(`Calligraphy job created: id=${restoration.id}, poem="${poem}", style_wid="${style_wid}"`);

      res.status(201).json({
        success: true,
        data: {
          id: restoration.id.toString(),
          status: restoration.status,
          type: restoration.type,
        },
      });
    })
  );

  /**
   * POST /ink-painting — FHS-adapter（文本引导山水画生成，端口 5009）
   * body: { prompt1, prompt2, prompt3, prompt4 }  — JSON，无文件上传
   */
  router.post(
    '/ink-painting',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) throw new AppError('Authentication required', 401);
      const { prompt1, prompt2, prompt3, prompt4 } = req.body;
      if (!prompt1 || !prompt2 || !prompt3 || !prompt4) {
        throw new AppError('prompt1, prompt2, prompt3, prompt4 are required', 400);
      }
      await restorationService.deductCredit(req.user.userId);
      const restoration = await restorationService.createRestoration({
        userId: req.user.userId,
        type: 'fhs-adapter',
        inputFileUrl: '',
        algorithm: 'FHSAdapter',
        parameters: { prompt1, prompt2, prompt3, prompt4 },
        files: {},
        aiParams: {
          prompt1: String(prompt1), prompt2: String(prompt2),
          prompt3: String(prompt3), prompt4: String(prompt4),
        },
      });
      res.status(201).json({ success: true, data: { id: restoration.id.toString(), status: restoration.status, type: restoration.type } });
    })
  );

  /**
   * POST /callipaint — CalliPaint（融入书法的山水画生成，端口 5010）
   * body: { texts, full_prompt, element_prompt, mood_prompt, style_prompt } — JSON
   * texts: string（每行一个字，后端 split）
   */
  router.post(
    '/callipaint',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) throw new AppError('Authentication required', 401);
      const { texts, full_prompt, element_prompt, mood_prompt, style_prompt } = req.body;
      if (!texts || !full_prompt) {
        throw new AppError('texts and full_prompt are required', 400);
      }
      const textsArray: string[] = String(texts).split('').filter(c => c.trim());
      if (textsArray.length === 0) throw new AppError('texts must be non-empty', 400);
      await restorationService.deductCredit(req.user.userId);
      const restoration = await restorationService.createRestoration({
        userId: req.user.userId,
        type: 'callipaint',
        inputFileUrl: '',
        algorithm: 'CalliPaint',
        parameters: { texts, full_prompt, element_prompt, mood_prompt, style_prompt },
        files: {},
        aiParams: {
          texts: JSON.stringify(textsArray),
          full_prompt: String(full_prompt),
          element_prompt: String(element_prompt || ''),
          mood_prompt: String(mood_prompt || ''),
          style_prompt: String(style_prompt || ''),
        },
      });
      res.status(201).json({ success: true, data: { id: restoration.id.toString(), status: restoration.status, type: restoration.type } });
    })
  );

  // POST / - Upload file(s) + create restoration job（图像修复类）
  router.post(
    '/',
    requireAuth,
    multiUpload,
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const uploadedFiles = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const mainFile = uploadedFiles?.file?.[0];

      const { type, algorithm, parameters } = req.body;

      if (!type) {
        throw new AppError('Restoration type is required', 400);
      }

      const validTypes: RestorationType[] = [
        'ancient-painting', 'mural', 'mural-semantic', 'outline', 'stele',
        'semantic-segmentation', 'super-resolution', 'style-transfer', 'pattern-generation',
        'fda-chi', 'clpotr', 'fusion-repair', 'multi-view', 'text-colorization',
      ];
      if (!validTypes.includes(type as RestorationType)) {
        throw new AppError(`Invalid restoration type: ${type}. Use POST /restoration/calligraphy for calligraphy.`, 400);
      }

      if (!mainFile) {
        throw new AppError('No file uploaded', 400);
      }

      let parsedParameters: Record<string, unknown> | undefined;
      if (parameters) {
        try { parsedParameters = JSON.parse(parameters); }
        catch { throw new AppError('Invalid parameters format', 400); }
      }

      const maskFile = uploadedFiles?.mask?.[0];
      const sketchFile = uploadedFiles?.sketch?.[0];

      // Check and deduct credits
      await restorationService.deductCredit(req.user.userId);

      // Build absolute file paths for AI service
      const uploadDir = path.resolve(env.UPLOAD_DIR);
      const files: Record<string, string> = {
        image: path.join(uploadDir, mainFile.filename),
      };
      if (maskFile) {
        files.mask = path.join(uploadDir, maskFile.filename);
      }
      if (sketchFile) {
        files.sketch = path.join(uploadDir, sketchFile.filename);
      }

      const inputFileUrl = `/uploads/${mainFile.filename}`;

      // 为需要文本参数的模型构建 aiParams
      let aiParams: Record<string, string> | undefined;
      if (type === 'super-resolution' && parsedParameters) {
        // 将前端 scale (0-100) 映射到 outscale (2-8)，默认 4x
        const scaleValue = Number(parsedParameters.scale ?? 50);
        const outscale = Math.max(2, Math.min(8, Math.round(2 + (scaleValue / 100) * 6))).toString();
        aiParams = { outscale };
      }
      if (type === 'text-colorization') {
        // M3FPainter: prompt 来自 multipart 文本字段
        const { prompt = '' } = req.body;
        aiParams = { prompt: String(prompt) };
      }
      if (type === 'fda-chi') {
        // FDA-Chi: prompt1-4 来自 multipart 文本字段
        const { prompt1 = '', prompt2 = '', prompt3 = '', prompt4 = '' } = req.body;
        aiParams = {
          prompt1: String(prompt1), prompt2: String(prompt2),
          prompt3: String(prompt3), prompt4: String(prompt4),
        };
      }

      const restoration = await restorationService.createRestoration({
        userId: req.user.userId,
        type,
        inputFileUrl,
        algorithm,
        parameters: parsedParameters,
        files,
        aiParams,
      });

      res.status(201).json({
        success: true,
        data: {
          id: restoration.id.toString(),
          status: restoration.status,
          type: restoration.type,
        },
      });
    })
  );

  // GET /:id - Get restoration status/result
  router.get(
    '/:id',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid restoration ID', 400);
      }

      const restoration = await restorationService.getRestoration(id);

      if (!restoration) {
        throw new AppError('Restoration not found', 404);
      }

      if (restoration.user_id !== req.user.userId) {
        throw new AppError('Forbidden', 403);
      }

      res.json({
        success: true,
        data: {
          id: restoration.id.toString(),
          type: restoration.type,
          status: restoration.status,
          inputFileUrl: restoration.input_file_url,
          resultUrls: safeJsonParse<string[]>(restoration.result_urls, []),
          algorithm: restoration.algorithm,
          parameters: safeJsonParse<Record<string, unknown> | null>(restoration.parameters, null),
          errorMessage: restoration.error_message,
          createdAt: restoration.created_at,
          completedAt: restoration.completed_at,
        },
      });
    })
  );

  // GET / - List user's restorations with pagination
  router.get(
    '/',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      if (page < 1 || limit < 1 || limit > 100) {
        throw new AppError('Invalid pagination parameters', 400);
      }

      const result = await restorationService.getUserRestorations(
        req.user.userId,
        page,
        limit
      );

      const formattedItems = result.items.map(item => ({
        id: item.id.toString(),
        type: item.type,
        status: item.status,
        inputFileUrl: item.input_file_url,
        resultUrls: safeJsonParse<string[]>(item.result_urls, []),
        algorithm: item.algorithm,
        parameters: safeJsonParse<Record<string, unknown> | null>(item.parameters, null),
        errorMessage: item.error_message,
        createdAt: item.created_at,
        completedAt: item.completed_at,
      }));

      res.json({
        success: true,
        data: {
          items: formattedItems,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    })
  );

  return router;
}
