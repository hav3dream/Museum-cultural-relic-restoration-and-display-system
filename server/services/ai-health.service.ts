import { checkAIHealth, type AIModel } from './ai-proxy.service.js';
import { env } from '../config/env.js';

export interface AIServiceStatus {
  url: string;
  status: 'online' | 'offline';
  latency?: number;
  error?: string;
}

export interface AIHealthCheckResult {
  services: Record<AIModel, AIServiceStatus>;
}

const URL_MAP: Record<AIModel, string> = {
  SGRGAN: env.AI_SGRGAN_URL,
  DCADif: env.AI_DCADIF_URL,
  Relic2Contour: env.AI_RELIC2CONTOUR_URL,
  // LUO-Calli 书法生成模型
  LuoCalli: env.AI_LUO_CALLI_URL,
};

export const aiHealthService = {
  async checkAllServices(): Promise<AIHealthCheckResult> {
    const models: AIModel[] = ['SGRGAN', 'DCADif', 'Relic2Contour', 'LuoCalli'];

    const results = await Promise.all(
      models.map(async (model) => {
        const health = await checkAIHealth(model);
        return {
          model,
          status: {
            url: URL_MAP[model],
            status: health.ok ? 'online' : 'offline',
            latency: health.latency,
            error: health.error,
          } as AIServiceStatus,
        };
      })
    );

    const services = {} as Record<AIModel, AIServiceStatus>;
    for (const r of results) {
      services[r.model] = r.status;
    }

    return { services };
  },
};
