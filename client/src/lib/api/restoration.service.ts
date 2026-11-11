import type { ApiResponse, RestorationResult } from './types';

const API_BASE = '/api';

export type RestorationType = 'ancient-painting' | 'mural' | 'mural-semantic' | 'calligraphy' | 'outline' | 'stele' | 'style-transfer' | 'pattern-generation' | 'semantic-segmentation' | 'super-resolution' | 'fda-chi' | 'clpotr' | 'fusion-repair' | 'multi-view' | 'text-colorization';

export interface RestorationOptions {
  algorithm?: string;
  strength?: number;
  mask?: File;     // Mask image for SGRGAN (ancient-painting, stele, calligraphy)
  sketch?: File;   // Sketch/line-art for DCADif (mural)
  [key: string]: string | number | boolean | File | undefined;
}

export interface RestorationListItem {
  id: string;
  type: string;
  status: string;
  inputFileUrl: string;
  resultUrls: string[];
  algorithm?: string;
  parameters?: Record<string, unknown>;
  createdAt: Date;
  completedAt?: Date;
}

export interface PaginatedRestorations {
  items: RestorationListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const restorationService = {
  async submitRestoration(
    type: RestorationType,
    file: File,
    options?: RestorationOptions
  ): Promise<ApiResponse<RestorationResult>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      if (options?.algorithm) {
        formData.append('algorithm', options.algorithm);
      }

      // Append mask file (for SGRGAN)
      if (options?.mask) {
        formData.append('mask', options.mask);
      }

      // Append sketch file (for DCADif)
      if (options?.sketch) {
        formData.append('sketch', options.sketch);
      }

      if (options) {
        const { algorithm, mask, sketch, ...parameters } = options;
        if (Object.keys(parameters).length > 0) {
          formData.append('parameters', JSON.stringify(parameters));
        }
      }

      const response = await fetch(`${API_BASE}/restoration`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error || error.message || 'Failed to submit restoration',
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  },

  async getRestorationStatus(id: string, signal?: AbortSignal): Promise<ApiResponse<RestorationResult>> {
    try {
      const response = await fetch(`${API_BASE}/restoration/${id}`, {
        method: 'GET',
        credentials: 'include',
        signal,
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error || error.message || 'Failed to get restoration status',
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  },

  async getUserRestorations(
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginatedRestorations>> {
    try {
      const response = await fetch(
        `${API_BASE}/restoration?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error || error.message || 'Failed to get restorations',
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  },

  // Convenience methods with proper file passing

  async restoreAncientPainting(file: File, mask?: File, options?: { algorithm?: string; strength?: number }): Promise<ApiResponse<RestorationResult>> {
    return this.submitRestoration('ancient-painting', file, {
      algorithm: options?.algorithm || 'SGRGAN',
      mask,
      strength: options?.strength
    });
  },

  async restoreMural(file: File, sketch?: File, options?: { algorithm?: string; strength?: number; clarity?: number; mode?: string }): Promise<ApiResponse<RestorationResult>> {
    return this.submitRestoration('mural', file, {
      algorithm: options?.algorithm || 'DCADif',
      sketch,
      strength: options?.strength,
      clarity: options?.clarity,
      mode: options?.mode
    });
  },

  // 壁画语义风格修复（M3SFormer, port 25565）
  // file: 破损图, mask: mask图
  async restoreMuralSemantic(file: File, mask?: File, options?: { strength?: number }): Promise<ApiResponse<RestorationResult>> {
    return this.submitRestoration('mural-semantic', file, {
      algorithm: 'M3SFormer',
      mask,
      strength: options?.strength,
    });
  },

  async generateCalligraphy(file: File, mask?: File, options?: { algorithm?: string; style?: string; text?: string }): Promise<ApiResponse<RestorationResult>> {
    return this.submitRestoration('calligraphy', file, {
      algorithm: options?.algorithm || 'SGRGAN',
      mask,
      style: options?.style,
      text: options?.text
    });
  },

  async analyzeOutline(file: File, options?: { algorithm?: string; enhancement?: string; detailLevel?: number }): Promise<ApiResponse<RestorationResult>> {
    return this.submitRestoration('outline', file, {
      algorithm: options?.algorithm || 'Relic2Contour',
      enhancement: options?.enhancement,
      detailLevel: options?.detailLevel
    });
  },

  async restoreStele(file: File, mask?: File, options?: { algorithm?: string; strength?: number; contrast?: number }): Promise<ApiResponse<RestorationResult>> {
    return this.submitRestoration('stele', file, {
      algorithm: options?.algorithm || 'SGRGAN',
      mask,
      strength: options?.strength,
      contrast: options?.contrast
    });
  },

  // 风格迁移（CE-CycleGAN, port 5007）：image（真实照片）→ 风格化图像
  async styleTransfer(file: File, options?: { style?: string; strength?: number }): Promise<ApiResponse<RestorationResult>> {
    return this.submitRestoration('style-transfer', file, {
      algorithm: 'CECycleGAN',
      style: options?.style,
      strength: options?.strength
    });
  },

  /**
   * LUO-Calli 书法生成：直接传 JSON，无需上传图片
   * poem: 诗文内容，style_wid: 书法家编号（'02'/'03'/'04'/'08'/'09'/'10'）
   * 注意：专用路由 POST /api/restoration/calligraphy
   */
  async submitCalligraphy(poem: string, styleWid: string): Promise<ApiResponse<RestorationResult>> {
    try {
      const response = await fetch(`${API_BASE}/restoration/calligraphy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ poem, style_wid: styleWid }),
      });
      return response.json();
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : '请求失败' };
    }
  },

  // 线稿上色（SGCGAN, port 5008）：content（线稿图）+ style（风格参考图）
  // file 字段 = content（线稿图），mask 字段 = style（风格参考图）
  async generatePattern(file: File, styleFile?: File, options?: { patternType?: string; complexity?: number; colorScheme?: number }): Promise<ApiResponse<RestorationResult>> {
    return this.submitRestoration('pattern-generation', file, {
      algorithm: 'SGCGAN',
      mask: styleFile,  // style image passed as mask field
      patternType: options?.patternType,
      complexity: options?.complexity,
      colorScheme: options?.colorScheme
    });
  },

  // 语义分割（YOLOv8Seg, port 5005）：file → 分割结果
  async semanticSegmentation(file: File, options?: { model?: string; detailLevel?: number }): Promise<ApiResponse<RestorationResult>> {
    return this.submitRestoration('semantic-segmentation', file, {
      algorithm: 'YOLOv8Seg',
      detailLevel: options?.detailLevel
    });
  },

  // 超分重建（ConvSRGAN, port 5006）：image + outscale → 高清图
  async superResolution(file: File, options?: { scale?: number; model?: string; denoise?: number }): Promise<ApiResponse<RestorationResult>> {
    return this.submitRestoration('super-resolution', file, {
      algorithm: 'ConvSRGAN',
      scale: options?.scale,
      denoise: options?.denoise
    });
  },

  // FHS-adapter 文本引导山水画生成（JSON only，端口 5009）
  async submitInkPainting(prompt1: string, prompt2: string, prompt3: string, prompt4: string): Promise<ApiResponse<RestorationResult>> {
    try {
      const response = await fetch(`${API_BASE}/restoration/ink-painting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ prompt1, prompt2, prompt3, prompt4 }),
      });
      return response.json();
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : '请求失败' };
    }
  },

  // FDA-Chi 图文融合中国画生成（multipart: 4 prompts + image，端口 5011）
  // prompts 需作为独立表单字段传给后端
  async submitFDAChi(file: File, prompt1: string, prompt2: string, prompt3: string, prompt4: string): Promise<ApiResponse<RestorationResult>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'fda-chi');
      formData.append('algorithm', 'FDAChi');
      formData.append('prompt1', prompt1);
      formData.append('prompt2', prompt2);
      formData.append('prompt3', prompt3);
      formData.append('prompt4', prompt4);
      const response = await fetch(`${API_BASE}/restoration`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || '请求失败' };
      }
      return response.json();
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : '请求失败' };
    }
  },

  // CalliPaint 融入书法的山水画生成（JSON only，端口 5010）
  async submitCalliPaint(texts: string, fullPrompt: string, elementPrompt: string, moodPrompt: string, stylePrompt: string): Promise<ApiResponse<RestorationResult>> {
    try {
      const response = await fetch(`${API_BASE}/restoration/callipaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          texts, full_prompt: fullPrompt, element_prompt: elementPrompt,
          mood_prompt: moodPrompt, style_prompt: stylePrompt,
        }),
      });
      return response.json();
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : '请求失败' };
    }
  },

  // CLPOTR 图像外推（multipart: image，端口 5012）
  async outpaintImage(file: File, options?: { algorithm?: string }): Promise<ApiResponse<RestorationResult>> {
    return this.submitRestoration('clpotr', file, { algorithm: 'CLPOTR' });
  },

  // Mamba/IGILR 古画融合修复（multipart: image + mask，端口 5000）
  async fusionRepair(file: File, mask: File): Promise<ApiResponse<RestorationResult>> {
    return this.submitRestoration('fusion-repair', file, {
      algorithm: 'Mamba',
      mask,
    });
  },

  // AdaMPI 多视角生成（multipart: image + disparity(mask)，远程 127.0.0.1:5000）
  // disparity map 通过 mask 字段传递
  async multiViewGenerate(file: File, disparityMap: File): Promise<ApiResponse<RestorationResult>> {
    return this.submitRestoration('multi-view', file, {
      algorithm: 'AdaMPI',
      mask: disparityMap,
    });
  },

  // M3FPainter 文本引导上色（multipart: content(file) + style(mask) + prompt，远程 127.0.0.1:8000）
  async textColorization(contentFile: File, styleFile: File, prompt?: string): Promise<ApiResponse<RestorationResult>> {
    try {
      const formData = new FormData();
      formData.append('file', contentFile);
      formData.append('mask', styleFile);
      formData.append('type', 'text-colorization');
      formData.append('algorithm', 'M3FPainter');
      if (prompt) formData.append('prompt', prompt);
      const response = await fetch(`${API_BASE}/restoration`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || '请求失败' };
      }
      return response.json();
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : '请求失败' };
    }
  },
};