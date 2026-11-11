import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  DATABASE_URL: z.string().default('./data/museum.db'),
  UPLOAD_DIR: z.string().default('./uploads'),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ACADEMIC_MODE: z.coerce.boolean().default(true),
  AI_SGRGAN_URL: z.string().default('http://127.0.0.1:5002'),
  AI_DCADIF_URL: z.string().default('http://127.0.0.1:5004'),
  AI_RELIC2CONTOUR_URL: z.string().default('http://127.0.0.1:5001'),
  // LUO-Calli 书法生成模型（conda: One-DM，脚本: app.py）
  AI_LUO_CALLI_URL: z.string().default('http://127.0.0.1:5003'),
  // M3SFormer 壁画语义风格修复（运行在内网服务器 127.0.0.1:25565）
  AI_M3SFORMER_URL: z.string().default('http://127.0.0.1:25565'),
  // YOLOv8Seg 语义分割（conda: yolov8seg）
  AI_YOLOV8SEG_URL: z.string().default('http://127.0.0.1:5005'),
  // ConvSRGAN 超分重建（conda: convsrgan）
  AI_CONVSRGAN_URL: z.string().default('http://127.0.0.1:5006'),
  // CE-CycleGAN 风格迁移（conda: pytorch-CycleGAN-and-pix2pix）
  AI_CECYCLEGGAN_URL: z.string().default('http://127.0.0.1:5007'),
  // SGCGAN 线稿上色（conda: SGCGAN）
  AI_SGCGAN_URL: z.string().default('http://127.0.0.1:5008'),
  // FHS-adapter 文本引导山水画生成（conda: fhs）
  AI_FHS_ADAPTER_URL: z.string().default('http://127.0.0.1:5009'),
  // CalliPaint 融入书法的山水画生成（conda: callipaint）
  AI_CALLIPAINT_URL: z.string().default('http://127.0.0.1:5010'),
  // FDA-Chi 多模态驱动中国画生成（conda: fhs）
  AI_FDA_CHI_URL: z.string().default('http://127.0.0.1:5011'),
  // CLPOTR 图像外推（conda: clpotr）
  AI_CLPOTR_URL: z.string().default('http://127.0.0.1:5012'),
  // Mamba/IGILR 古画融合修复（conda: xiufu_win）
  AI_MAMBA_URL: z.string().default('http://127.0.0.1:5000'),
  // AdaMPI 多视角生成（运行在内网服务器 127.0.0.1:5000）
  AI_ADAMPI_URL: z.string().default('http://127.0.0.1:5000'),
  // M3FPainter 文本引导上色（运行在内网 127.0.0.1:8000）
  AI_M3FPAINTER_URL: z.string().default('http://127.0.0.1:8000'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    result.error.issues.forEach((issue: { path: (string | number)[]; message: string }) => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();
