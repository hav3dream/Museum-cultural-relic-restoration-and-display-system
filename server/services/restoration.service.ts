import fs from 'fs';
import path from 'path';
import { db } from '../db/connection.js';
import { restorations, credits } from '../db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { AppError } from '../middleware/errorHandler.js';
import { processRestoration, type AIModel } from './ai-proxy.service.js';
import { env } from '../config/env.js';

export type RestorationType =
  | 'ancient-painting'
  | 'mural'
  | 'mural-semantic'
  | 'calligraphy'
  | 'outline'
  | 'stele'
  | 'semantic-segmentation'
  | 'super-resolution'
  | 'style-transfer'
  | 'pattern-generation'
  | 'fhs-adapter'
  | 'callipaint'
  | 'fda-chi'
  | 'clpotr'
  | 'fusion-repair'
  | 'multi-view'
  | 'text-colorization';
export type RestorationStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Map restoration types to AI models
const TYPE_TO_MODEL: Record<RestorationType, AIModel> = {
  'ancient-painting': 'SGRGAN',
  'mural': 'DCADif',
  'mural-semantic': 'M3SFormer',
  // LUO-Calli 书法生成模型（端口 5003），接受诗文 + 风格编号，返回单字 ZIP
  'calligraphy': 'LuoCalli',
  'outline': 'Relic2Contour',
  'stele': 'SGRGAN',
  'semantic-segmentation': 'YOLOv8Seg',
  'super-resolution': 'ConvSRGAN',
  'style-transfer': 'CECycleGAN',
  'pattern-generation': 'SGCGAN',
  'fhs-adapter': 'FHSAdapter',
  'callipaint': 'CalliPaint',
  'fda-chi': 'FDAChi',
  'clpotr': 'CLPOTR',
  'fusion-repair': 'Mamba',
  'multi-view': 'AdaMPI',
  'text-colorization': 'M3FPainter',
};

interface CreateRestorationParams {
  userId: number;
  type: RestorationType;
  inputFileUrl: string;
  algorithm?: string;
  parameters?: Record<string, any>;
  files: Record<string, string>; // 图像类模型的绝对文件路径
  aiParams?: Record<string, string>; // 文本类模型（如 LuoCalli）的额外参数
}

interface RestorationRecord {
  id: number;
  user_id: number;
  type: string;
  status: string;
  input_file_url: string | null;
  result_urls: string | null;
  algorithm: string | null;
  parameters: string | null;
  error_message: string | null;
  created_at: Date;
  completed_at: Date | null;
}

const DEMO_RESULT_DIR_UPLOADS = path.resolve(env.UPLOAD_DIR, 'results');
const DEMO_RESULT_DIR_UPLOAD = path.resolve(process.cwd(), 'upload', 'results');
const DEMO_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

interface DemoResultCandidate {
  publicUrl: string;
  mtimeMs: number;
}

function collectDemoResultCandidates(): DemoResultCandidate[] {
  const dirToPublicBase: Array<{ dir: string; publicBase: string }> = [
    { dir: DEMO_RESULT_DIR_UPLOADS, publicBase: '/uploads/results' },
    { dir: DEMO_RESULT_DIR_UPLOAD, publicBase: '/upload/results' },
  ];
  const candidates: DemoResultCandidate[] = [];

  for (const { dir, publicBase } of dirToPublicBase) {
    if (!fs.existsSync(dir)) {
      continue;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (!DEMO_IMAGE_EXTENSIONS.has(ext)) {
        continue;
      }

      const absolutePath = path.join(dir, entry.name);
      const stat = fs.statSync(absolutePath);
      candidates.push({
        publicUrl: `${publicBase}/${entry.name}`,
        mtimeMs: stat.mtimeMs,
      });
    }
  }

  return candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
}

function pickDemoResultUrl(): string {
  const candidates = collectDemoResultCandidates();
  if (candidates.length === 0) {
    return '';
  }
  return candidates[0].publicUrl;
}

function toUploadPublicUrl(absoluteFilePath: string): string {
  const uploadRoot = path.resolve(env.UPLOAD_DIR);
  const normalizedRoot = `${uploadRoot}${path.sep}`;
  if (!absoluteFilePath.startsWith(normalizedRoot)) {
    return '';
  }
  const relativePath = absoluteFilePath.slice(normalizedRoot.length).replace(/\\/g, '/');
  if (!relativePath) {
    return '';
  }
  return `/uploads/${relativePath}`;
}

function pickDemoResultUrlOrFallback(imagePath?: string): string {
  const demoUrl = pickDemoResultUrl();
  if (demoUrl) {
    return demoUrl;
  }
  if (imagePath) {
    const fallbackUrl = toUploadPublicUrl(imagePath);
    if (fallbackUrl) {
      return fallbackUrl;
    }
  }
  throw new Error(
    `Demo result not found. Put at least one image in ${DEMO_RESULT_DIR_UPLOADS} or ${DEMO_RESULT_DIR_UPLOAD}.`
  );
}

export const restorationService = {
  async checkCredits(userId: number): Promise<number> {
    const result = await db.select({ amount: credits.amount })
      .from(credits)
      .where(eq(credits.user_id, userId))
      .limit(1);

    if (result.length === 0) {
      // Create credits record with 0 credits for new user
      await db.insert(credits).values({
        user_id: userId,
        amount: 0,
      });
      return 0;
    }

    return result[0].amount;
  },

  async deductCredit(userId: number): Promise<void> {
    // In academic mode, skip credit check to allow free usage for demonstration purposes
    if (env.ACADEMIC_MODE) {
      return;
    }

    const currentCredits = await this.checkCredits(userId);

    if (currentCredits < 1) {
      throw new AppError('Insufficient credits', 402);
    }

    await db.update(credits)
      .set({ amount: sql`${credits.amount} - 1` })
      .where(eq(credits.user_id, userId));
  },

  async createRestoration(params: CreateRestorationParams): Promise<RestorationRecord> {
    const { userId, type, inputFileUrl, algorithm, parameters, files, aiParams } = params;

    // Insert restoration record with pending status
    const result = await db.insert(restorations).values({
      user_id: userId,
      type,
      status: 'pending',
      input_file_url: inputFileUrl,
      algorithm: algorithm || null,
      parameters: parameters ? JSON.stringify(parameters) : null,
    }).returning();

    const restoration = result[0];

    // Start async AI processing
    const restorationType = type as RestorationType;
    const model = TYPE_TO_MODEL[restorationType] || 'SGRGAN';
    this.runAIProcessing(restoration.id, restorationType, model, files, aiParams);

    return restoration as RestorationRecord;
  },

  async runAIProcessing(
    restorationId: number,
    restorationType: RestorationType,
    model: AIModel,
    files: Record<string, string>,
    aiParams?: Record<string, string>,
  ): Promise<void> {
    try {
      // Mark as processing
      await db.update(restorations)
        .set({ status: 'processing' })
        .where(eq(restorations.id, restorationId));

      const isDemoType =
        restorationType === 'ancient-painting' ||
        restorationType === 'mural' ||
        restorationType === 'mural-semantic' ||
        restorationType === 'stele' ||
        restorationType === 'outline' ||
        restorationType === 'calligraphy' ||
        restorationType === 'style-transfer' ||
        restorationType === 'clpotr';
      const resultUrls = isDemoType
        ? [pickDemoResultUrlOrFallback(files.image)]
        : await processRestoration(model, files, aiParams);

      // Mark as completed with result URL(s)
      await db.update(restorations)
        .set({
          status: 'completed',
          result_urls: JSON.stringify(resultUrls),
          completed_at: sql`(unixepoch())`,
        })
        .where(eq(restorations.id, restorationId));

      if (isDemoType) {
        console.log(`Restoration ${restorationId} completed with demo image: ${resultUrls[0]}`);
      }
      console.log(`Restoration ${restorationId} completed: ${resultUrls.join(', ')}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Restoration ${restorationId} failed:`, error);

      // Mark as failed with error message
      await db.update(restorations)
        .set({
          status: 'failed',
          error_message: errorMessage,
        })
        .where(eq(restorations.id, restorationId));
    }
  },

  async getRestoration(id: number): Promise<RestorationRecord | null> {
    const result = await db.select()
      .from(restorations)
      .where(eq(restorations.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return result[0] as RestorationRecord;
  },

  async getUserRestorations(userId: number, page = 1, limit = 10): Promise<{
    items: RestorationRecord[];
    total: number;
    page: number;
    limit: number;
  }> {
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(restorations)
      .where(eq(restorations.user_id, userId));

    const total = countResult[0].count;

    // Get paginated items
    const items = await db.select()
      .from(restorations)
      .where(eq(restorations.user_id, userId))
      .orderBy(desc(restorations.created_at))
      .limit(limit)
      .offset(offset);

    return {
      items: items as RestorationRecord[],
      total,
      page,
      limit,
    };
  },
};
