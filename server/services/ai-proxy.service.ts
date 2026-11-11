import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { env } from '../config/env.js';

const RESULT_DIR = path.resolve(env.UPLOAD_DIR, 'results');
if (!fs.existsSync(RESULT_DIR)) {
  fs.mkdirSync(RESULT_DIR, { recursive: true });
}

// 内网 AI 调用可配置超时（默认 5 分钟）
const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || '300000', 10);
// 网络抖动重试配置
const AI_MAX_RETRIES = parseInt(process.env.AI_MAX_RETRIES || '2', 10);
const AI_RETRY_DELAY_MS = 3000;

function generateResultFilename(prefix: string, ext = 'png'): string {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 向图像类 AI 服务发送 multipart/form-data 请求，返回结果图片 URL（单张）
 * textFields：额外的纯文本字段（如 ConvSRGAN 的 outscale）
 */
async function forwardToAI(
  url: string,
  formFields: Array<{ name: string; filePath: string; filename: string }>,
  textFields?: Record<string, string>,
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= AI_MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`AI call retry ${attempt}/${AI_MAX_RETRIES} for ${url}`);
        await sleep(AI_RETRY_DELAY_MS);
      }

      const formData = new FormData();
      for (const field of formFields) {
        const fileBuffer = fs.readFileSync(field.filePath);
        const blob = new Blob([fileBuffer]);
        formData.append(field.name, blob, field.filename);
      }
      if (textFields) {
        for (const [key, value] of Object.entries(textFields)) {
          formData.append(key, value);
        }
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text().catch(() => 'Unknown error');
        throw new Error(`AI service error (${response.status}): ${text}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const arrayBuffer = await response.arrayBuffer();

      if (arrayBuffer.byteLength === 0) {
        throw new Error('AI service returned empty response');
      }

      const resultFilename = generateResultFilename('ai-result');
      const resultPath = path.join(RESULT_DIR, resultFilename);
      fs.writeFileSync(resultPath, Buffer.from(arrayBuffer));

      console.log(`AI result saved: ${resultFilename} (${arrayBuffer.byteLength} bytes, type: ${contentType})`);

      return `/uploads/results/${resultFilename}`;
    } catch (error: any) {
      lastError = error;

      if (error.message?.includes('(4')) break;

      if (error.cause?.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        if (attempt >= AI_MAX_RETRIES) {
          throw new Error(`AI模型服务未启动或无法连接 (${url})，请检查内网服务状态`);
        }
        continue;
      }

      if (error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
        if (attempt >= AI_MAX_RETRIES) {
          throw new Error(`AI模型处理超时 (${AI_TIMEOUT_MS / 1000}秒)，图片可能过大或模型负载过高`);
        }
        continue;
      }

      if (error.cause?.code === 'ENETUNREACH' || error.cause?.code === 'EHOSTUNREACH') {
        if (attempt >= AI_MAX_RETRIES) {
          throw new Error(`无法访问AI模型服务器 (${url})，请检查内网连接`);
        }
        continue;
      }

      break;
    }
  }

  throw lastError || new Error('AI service call failed');
}

/**
 * 向文本类 AI 服务发送 JSON body 请求，返回结果图片 URL（单张）
 * 适用于 FHS-adapter（5009）、CalliPaint（5010）等 JSON-only 接口
 */
async function forwardToAIJson(
  url: string,
  body: Record<string, unknown>,
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= AI_MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`AI JSON call retry ${attempt}/${AI_MAX_RETRIES} for ${url}`);
        await sleep(AI_RETRY_DELAY_MS);
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text().catch(() => 'Unknown error');
        throw new Error(`AI service error (${response.status}): ${text}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        throw new Error('AI service returned empty response');
      }

      const resultFilename = generateResultFilename('ai-result');
      const resultPath = path.join(RESULT_DIR, resultFilename);
      fs.writeFileSync(resultPath, Buffer.from(arrayBuffer));

      return `/uploads/results/${resultFilename}`;
    } catch (error: any) {
      lastError = error;
      if (error.message?.includes('(4')) break;
      if (error.cause?.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        if (attempt >= AI_MAX_RETRIES) throw new Error(`AI模型服务未启动或无法连接 (${url})`);
        continue;
      }
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        if (attempt >= AI_MAX_RETRIES) throw new Error(`AI模型处理超时 (${AI_TIMEOUT_MS / 1000}秒)`);
        continue;
      }
      break;
    }
  }

  throw lastError || new Error('AI service JSON call failed');
}

/**
 * SGRGAN: 线稿引导的中国传统山水画修复
 * POST /inpaint — input: image + mask → output: PNG
 */
export async function callSGRGAN(imagePath: string, maskPath: string): Promise<string[]> {
  const url = `${env.AI_SGRGAN_URL}/inpaint`;
  const resultUrl = await forwardToAI(url, [
    { name: 'image', filePath: imagePath, filename: 'image.jpg' },
    { name: 'mask', filePath: maskPath, filename: 'mask.png' },
  ]);
  return [resultUrl];
}

/**
 * DCADif: 中国传统壁画解耦条件自适应扩散模型
 * POST /generate — input: sketch_image + merged_image → output: PNG
 */
export async function callDCADif(sketchPath: string, mergedPath: string): Promise<string[]> {
  const url = `${env.AI_DCADIF_URL}/generate`;
  const resultUrl = await forwardToAI(url, [
    { name: 'sketch_image', filePath: sketchPath, filename: 'sketch.jpg' },
    { name: 'merged_image', filePath: mergedPath, filename: 'merged.jpg' },
  ]);
  return [resultUrl];
}

/**
 * Relic2Contour: 半监督壁画轮廓提取网络
 * POST /sketchify — input: image → output: PNG
 */
export async function callRelic2Contour(imagePath: string): Promise<string[]> {
  const url = `${env.AI_RELIC2CONTOUR_URL}/sketchify`;
  const resultUrl = await forwardToAI(url, [
    { name: 'image', filePath: imagePath, filename: 'image.png' },
  ]);
  return [resultUrl];
}

/**
 * LUO-Calli: 书法风格生成模型（conda: One-DM）
 * POST /generate_poem_zip
 *   body: { poem: string, style_wid: string }
 *   response: ZIP 文件，内含多张单字 PNG 图片（按输入文字顺序命名）
 *
 * style_wid 对应关系：
 *   02=管峻  03=弘一  04=柳公权  08=欧阳询  09=宋徽宗  10=颜真卿
 */
export async function callLuoCalli(poem: string, styleWid: string): Promise<string[]> {
  const url = `${env.AI_LUO_CALLI_URL}/generate_poem_zip`;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= AI_MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`LuoCalli retry ${attempt}/${AI_MAX_RETRIES}`);
        await sleep(AI_RETRY_DELAY_MS);
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poem, style_wid: styleWid }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text().catch(() => 'Unknown error');
        throw new Error(`LuoCalli service error (${response.status}): ${text}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        throw new Error('LuoCalli service returned empty ZIP');
      }

      // 解压 ZIP，提取各单字图片
      const zip = new AdmZip(Buffer.from(arrayBuffer));
      const entries = zip.getEntries().filter(e =>
        !e.isDirectory && /\.(png|jpg|jpeg)$/i.test(e.entryName)
      );

      if (entries.length === 0) {
        throw new Error('LuoCalli ZIP contains no image files');
      }

      // 按文件名排序（模型按诗文字序命名），确保展示顺序与输入一致
      entries.sort((a, b) => a.entryName.localeCompare(b.entryName));

      const resultUrls: string[] = [];
      for (const entry of entries) {
        const filename = generateResultFilename('calli-char');
        const filePath = path.join(RESULT_DIR, filename);
        fs.writeFileSync(filePath, entry.getData());
        resultUrls.push(`/uploads/results/${filename}`);
      }

      console.log(`LuoCalli: extracted ${resultUrls.length} character images from ZIP`);
      return resultUrls;

    } catch (error: any) {
      lastError = error;

      if (error.message?.includes('(4')) break;

      if (error.cause?.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        if (attempt >= AI_MAX_RETRIES) {
          throw new Error(`书法模型服务未启动或无法连接 (${url})，请激活 conda One-DM 环境并运行 app.py`);
        }
        continue;
      }

      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        if (attempt >= AI_MAX_RETRIES) {
          throw new Error(`书法生成超时 (${AI_TIMEOUT_MS / 1000}秒)，请检查模型负载`);
        }
        continue;
      }

      if (error.cause?.code === 'ENETUNREACH' || error.cause?.code === 'EHOSTUNREACH') {
        if (attempt >= AI_MAX_RETRIES) {
          throw new Error(`无法访问书法模型服务 (${url})，请检查网络连接`);
        }
        continue;
      }

      break;
    }
  }

  throw lastError || new Error('LuoCalli service call failed');
}

/**
 * M3SFormer: 壁画语义风格修复（运行在内网 127.0.0.1:25565）
 * POST /api/inpaint — input: image + mask → output: PNG
 */
export async function callM3SFormer(imagePath: string, maskPath: string): Promise<string[]> {
  const url = `${env.AI_M3SFORMER_URL}/api/inpaint`;
  const resultUrl = await forwardToAI(url, [
    { name: 'image', filePath: imagePath, filename: 'image.png' },
    { name: 'mask', filePath: maskPath, filename: 'mask.png' },
  ]);
  return [resultUrl];
}

/**
 * YOLOv8Seg: 语义分割（conda: yolov8seg）
 * POST /predict-seg — input: file → output: JPG
 */
export async function callYOLOv8Seg(imagePath: string): Promise<string[]> {
  const url = `${env.AI_YOLOV8SEG_URL}/predict-seg`;
  const resultUrl = await forwardToAI(url, [
    { name: 'file', filePath: imagePath, filename: 'image.jpg' },
  ]);
  return [resultUrl];
}

/**
 * ConvSRGAN: 超分重建（conda: convsrgan）
 * POST /enhance — input: image + outscale → output: PNG
 */
export async function callConvSRGAN(imagePath: string, outscale = '4'): Promise<string[]> {
  const url = `${env.AI_CONVSRGAN_URL}/enhance`;
  const resultUrl = await forwardToAI(
    url,
    [{ name: 'image', filePath: imagePath, filename: 'image.jpg' }],
    { outscale },
  );
  return [resultUrl];
}

/**
 * CE-CycleGAN: 风格迁移（conda: pytorch-CycleGAN-and-pix2pix）
 * POST /translate — input: image → output: PNG
 */
export async function callCECycleGAN(imagePath: string): Promise<string[]> {
  const url = `${env.AI_CECYCLEGGAN_URL}/translate`;
  const resultUrl = await forwardToAI(url, [
    { name: 'image', filePath: imagePath, filename: 'image.jpg' },
  ]);
  return [resultUrl];
}

/**
 * SGCGAN: 线稿上色（conda: SGCGAN）
 * POST /stylize — input: content（线稿图）+ style（风格参考图）→ output: PNG
 * 前端用 file 字段传 content，用 mask 字段传 style
 */
export async function callSGCGAN(contentPath: string, stylePath: string): Promise<string[]> {
  const url = `${env.AI_SGCGAN_URL}/stylize`;
  const resultUrl = await forwardToAI(url, [
    { name: 'content', filePath: contentPath, filename: 'content.jpg' },
    { name: 'style', filePath: stylePath, filename: 'style.png' },
  ]);
  return [resultUrl];
}

/**
 * FHS-adapter: 文本引导山水画生成（conda: fhs）
 * POST /generate-fhs — body: {prompt1,prompt2,prompt3,prompt4} → PNG
 */
export async function callFHSAdapter(prompt1: string, prompt2: string, prompt3: string, prompt4: string): Promise<string[]> {
  const url = `${env.AI_FHS_ADAPTER_URL}/generate-fhs`;
  const resultUrl = await forwardToAIJson(url, { prompt1, prompt2, prompt3, prompt4 });
  return [resultUrl];
}

/**
 * CalliPaint: 融入书法的山水画生成（conda: callipaint）
 * POST /generate-callipaint — body: {texts, polygons, full_prompt, element_prompt, mood_prompt, style_prompt} → PNG
 * 后端自动根据 texts 长度生成等分列式 polygons（512×512 画布，文字纵向排列在左侧）
 */
export async function callCalliPaint(
  texts: string[],
  fullPrompt: string,
  elementPrompt: string,
  moodPrompt: string,
  stylePrompt: string,
): Promise<string[]> {
  const url = `${env.AI_CALLIPAINT_URL}/generate-callipaint`;
  const n = texts.length;
  const canvasH = 512;
  const margin = 20;
  const slotH = Math.floor((canvasH - margin * 2) / Math.max(n, 1));
  const polygons: number[][][] = texts.map((_, i) => {
    const y0 = margin + i * slotH;
    const y1 = y0 + slotH - 5;
    return [[30, y0], [90, y0], [90, y1], [30, y1]];
  });
  const resultUrl = await forwardToAIJson(url, {
    texts,
    polygons,
    full_prompt: fullPrompt,
    element_prompt: elementPrompt,
    mood_prompt: moodPrompt,
    style_prompt: stylePrompt,
  });
  return [resultUrl];
}

/**
 * FDA-Chi: 多模态驱动中国画生成（conda: fhs）
 * POST /generate — multipart: prompt1-4 + image → PNG
 */
export async function callFDAChi(
  imagePath: string,
  prompt1: string,
  prompt2: string,
  prompt3: string,
  prompt4: string,
): Promise<string[]> {
  const url = `${env.AI_FDA_CHI_URL}/generate`;
  const resultUrl = await forwardToAI(
    url,
    [{ name: 'image', filePath: imagePath, filename: 'guide.jpg' }],
    { prompt1, prompt2, prompt3, prompt4 },
  );
  return [resultUrl];
}

/**
 * CLPOTR: 图像外推（conda: clpotr）
 * POST /predict — input: image → output: PNG（扩展边界的新画面）
 */
export async function callCLPOTR(imagePath: string): Promise<string[]> {
  const url = `${env.AI_CLPOTR_URL}/predict`;
  const resultUrl = await forwardToAI(url, [
    { name: 'image', filePath: imagePath, filename: 'image.jpg' },
  ]);
  return [resultUrl];
}

/**
 * Mamba/IGILR: 古画融合修复（conda: xiufu_win）
 * POST /predict — input: image + mask → output: PNG
 */
export async function callMamba(imagePath: string, maskPath: string): Promise<string[]> {
  const url = `${env.AI_MAMBA_URL}/predict`;
  const resultUrl = await forwardToAI(url, [
    { name: 'image', filePath: imagePath, filename: 'image.jpg' },
    { name: 'mask', filePath: maskPath, filename: 'mask.png' },
  ]);
  return [resultUrl];
}

/**
 * AdaMPI: 多视角生成（运行在内网 127.0.0.1:5000）
 * POST /render — input: image + disparity → output: MP4 视频
 */
export async function callAdaMPI(imagePath: string, disparityPath: string): Promise<string[]> {
  const url = `${env.AI_ADAMPI_URL}/render`;
  const resultUrl = await forwardToAI(url, [
    { name: 'image', filePath: imagePath, filename: 'image.png' },
    { name: 'disparity', filePath: disparityPath, filename: 'disparity.png' },
  ]);
  return [resultUrl];
}

/**
 * M3FPainter: 文本引导上色（运行在内网 127.0.0.1:8000）
 * POST /generate — multipart: content（线稿）+ style（风格图）+ prompt（文本描述）→ output: PNG
 */
export async function callM3FPainter(
  contentPath: string,
  stylePath: string,
  prompt?: string,
): Promise<string[]> {
  const url = `${env.AI_M3FPAINTER_URL}/generate`;
  const resultUrl = await forwardToAI(
    url,
    [
      { name: 'content', filePath: contentPath, filename: 'content.png' },
      { name: 'style', filePath: stylePath, filename: 'style.png' },
    ],
    prompt ? { prompt } : undefined,
  );
  return [resultUrl];
}

export type AIModel = 'SGRGAN' | 'DCADif' | 'Relic2Contour' | 'LuoCalli' | 'M3SFormer' | 'YOLOv8Seg' | 'ConvSRGAN' | 'CECycleGAN' | 'SGCGAN' | 'FHSAdapter' | 'CalliPaint' | 'FDAChi' | 'CLPOTR' | 'Mamba' | 'AdaMPI' | 'M3FPainter';

/**
 * 检查 AI 服务可达性
 */
export async function checkAIHealth(model: AIModel): Promise<{ ok: boolean; latency?: number; error?: string }> {
  const urlMap: Record<AIModel, string> = {
    SGRGAN: env.AI_SGRGAN_URL,
    DCADif: env.AI_DCADIF_URL,
    Relic2Contour: env.AI_RELIC2CONTOUR_URL,
    LuoCalli: env.AI_LUO_CALLI_URL,
    M3SFormer: env.AI_M3SFORMER_URL,
    YOLOv8Seg: env.AI_YOLOV8SEG_URL,
    ConvSRGAN: env.AI_CONVSRGAN_URL,
    CECycleGAN: env.AI_CECYCLEGGAN_URL,
    SGCGAN: env.AI_SGCGAN_URL,
    FHSAdapter: env.AI_FHS_ADAPTER_URL,
    CalliPaint: env.AI_CALLIPAINT_URL,
    FDAChi: env.AI_FDA_CHI_URL,
    CLPOTR: env.AI_CLPOTR_URL,
    Mamba: env.AI_MAMBA_URL,
    AdaMPI: env.AI_ADAMPI_URL,
    M3FPainter: env.AI_M3FPAINTER_URL,
  };

  const baseUrl = urlMap[model];
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(baseUrl, {
      method: 'GET',
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeout);
    const latency = Date.now() - start;

    // 4xx 也算服务可达
    if (response) {
      return { ok: true, latency };
    }

    return { ok: false, error: '服务无响应' };
  } catch (error: any) {
    if (error.cause?.code === 'ECONNREFUSED') {
      return { ok: false, error: '服务未启动' };
    }
    if (error.name === 'AbortError') {
      return { ok: false, error: '连接超时' };
    }
    return { ok: false, error: error.message || '未知错误' };
  }
}

/**
 * 将修复/生成请求路由到对应的 AI 模型
 * 返回结果图片 URL 数组（图像修复类为单张，书法生成为多张单字图）
 */
export async function processRestoration(
  model: AIModel,
  files: Record<string, string>,
  params?: Record<string, string>,
): Promise<string[]> {
  switch (model) {
    case 'SGRGAN':
      if (!files.image) {
        throw new Error('SGRGAN requires an image file');
      }
      // mask 未提供时以原图作为 mask（修复整张图）
      if (!files.mask) {
        files.mask = files.image;
      }
      return callSGRGAN(files.image, files.mask);

    case 'DCADif':
      if (!files.sketch || !files.image) {
        throw new Error('DCADif requires sketch and image files');
      }
      return callDCADif(files.sketch, files.image);

    case 'Relic2Contour':
      if (!files.image) {
        throw new Error('Relic2Contour requires an image file');
      }
      return callRelic2Contour(files.image);

    case 'LuoCalli': {
      const poem = params?.poem;
      const styleWid = params?.style_wid;
      if (!poem || !styleWid) {
        throw new Error('LuoCalli requires poem and style_wid params');
      }
      return callLuoCalli(poem, styleWid);
    }

    case 'M3SFormer':
      // 壁画语义风格修复：image（破损图）+ mask（mask图）
      if (!files.image) {
        throw new Error('M3SFormer requires an image file');
      }
      if (!files.mask) {
        throw new Error('M3SFormer requires a mask file');
      }
      return callM3SFormer(files.image, files.mask);

    case 'YOLOv8Seg':
      // 语义分割：file字段作为输入
      if (!files.image) {
        throw new Error('YOLOv8Seg requires an image file');
      }
      return callYOLOv8Seg(files.image);

    case 'ConvSRGAN':
      // 超分重建：image + outscale（从 params 获取，默认 4）
      if (!files.image) {
        throw new Error('ConvSRGAN requires an image file');
      }
      return callConvSRGAN(files.image, params?.outscale || '4');

    case 'CECycleGAN':
      // 风格迁移：image（真实照片）
      if (!files.image) {
        throw new Error('CECycleGAN requires an image file');
      }
      return callCECycleGAN(files.image);

    case 'SGCGAN':
      // 线稿上色：content（线稿图）+ style（风格参考图）
      // 前端用 file 字段传 content，用 mask 字段传 style
      if (!files.image) {
        throw new Error('SGCGAN requires a content image (file field)');
      }
      if (!files.mask) {
        throw new Error('SGCGAN requires a style image (mask field)');
      }
      return callSGCGAN(files.image, files.mask);

    case 'FHSAdapter': {
      const { prompt1, prompt2, prompt3, prompt4 } = params || {};
      if (!prompt1 || !prompt2 || !prompt3 || !prompt4) {
        throw new Error('FHSAdapter requires prompt1, prompt2, prompt3, prompt4');
      }
      return callFHSAdapter(prompt1, prompt2, prompt3, prompt4);
    }

    case 'CalliPaint': {
      const textsRaw = params?.texts;
      if (!textsRaw) throw new Error('CalliPaint requires texts param');
      const texts = JSON.parse(textsRaw) as string[];
      return callCalliPaint(
        texts,
        params?.full_prompt || '',
        params?.element_prompt || '',
        params?.mood_prompt || '',
        params?.style_prompt || '',
      );
    }

    case 'FDAChi': {
      if (!files.image) throw new Error('FDAChi requires an image file');
      const { prompt1 = '', prompt2 = '', prompt3 = '', prompt4 = '' } = params || {};
      return callFDAChi(files.image, prompt1, prompt2, prompt3, prompt4);
    }

    case 'CLPOTR':
      if (!files.image) throw new Error('CLPOTR requires an image file');
      return callCLPOTR(files.image);

    case 'Mamba':
      if (!files.image) throw new Error('Mamba requires an image file');
      if (!files.mask) throw new Error('Mamba requires a mask file');
      return callMamba(files.image, files.mask);

    case 'AdaMPI':
      if (!files.image) throw new Error('AdaMPI requires an image file');
      if (!files.mask) throw new Error('AdaMPI requires a disparity map (mask field)');
      return callAdaMPI(files.image, files.mask);

    case 'M3FPainter':
      // content（线稿）= image, style（风格图）= mask, prompt = 文本描述
      if (!files.image) throw new Error('M3FPainter requires a content image (file field)');
      if (!files.mask) throw new Error('M3FPainter requires a style image (mask field)');
      return callM3FPainter(files.image, files.mask, params?.prompt);

    default:
      throw new Error(`Unknown AI model: ${model}`);
  }
}
