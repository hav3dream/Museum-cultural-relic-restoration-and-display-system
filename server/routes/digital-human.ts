import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';

const AI_GATEWAY_BASE = process.env.AI_GATEWAY_BASE_URL;

// Prompts for Google Veo 3.1 — designed to generate video WITH synchronized audio/voice
// Veo 3.1 supports ambient sound, music, and character speech when described in the prompt
const CHARACTER_PROMPTS: Record<string, string> = {
  libai: 'A Tang Dynasty Chinese male poet named Li Bai, wearing flowing white silk robes, stands on a moonlit mountain cliff. He raises a jade wine cup toward the bright full moon and recites aloud in classical Chinese: "举杯邀明月，对影成三人". His voice is deep and resonant, filled with poetic emotion. Pine trees sway in the mountain breeze. Ambient sound: wind through pines, distant flowing water. Ink wash painting aesthetic, cinematic lighting, slow camera drift.',
  dufu: 'A Tang Dynasty Chinese male scholar poet named Du Fu, wearing worn brown robes, sits at a wooden writing desk inside a simple thatched cottage. Candlelight flickers as fallen autumn leaves drift past the window. He dips his brush and speaks sorrowfully: "烽火连三月，家书抵万金". His voice trembles with grief and worry. Ambient sound: autumn wind, crackling candle. Ink wash painting aesthetic, melancholic mood.',
  sushi: 'A Song Dynasty Chinese male poet-statesman named Su Shi (Su Dongpo), wearing indigo silk robes, stands at the bow of a river boat passing dramatic red cliffs. He raises his arms wide and declaims in a bold resonant voice: "大江东去，浪淘尽，千古风流人物！". River mist rises around the boat. Ambient sound: rushing river, wind, echoing voice. Ink wash painting aesthetic, heroic atmosphere, golden light.',
  wangwei: 'A Tang Dynasty Chinese male poet-painter named Wang Wei, in simple grey robes, meditates peacefully in a misty bamboo forest. Soft light filters through leaves. He murmurs gently: "独坐幽篁里，弹琴复长啸". He plucks a guqin zither resting on his lap. Ambient sound: guqin music, bamboo rustling, bird calls. Ink wash painting aesthetic, serene and spiritual.',
  xinqiji: 'A Song Dynasty Chinese male warrior-poet named Xin Qiji, in armored robes, stands atop a fortress wall gazing at distant mountains. Wind sweeps his cape. He calls out with patriotic passion: "醉里挑灯看剑，梦回吹角连营！". Ambient sound: battle horns in the distance, wind on the battlements. Ink wash painting aesthetic, dramatic cloudy sky.',
  liqingzhao: 'A Song Dynasty Chinese female poet named Li Qingzhao, in elegant embroidered silk dress, sits by a garden pavilion window. Autumn chrysanthemums glow in candlelight. She writes poetry and recites softly with melancholy grace: "莫道不消魂，帘卷西风，人比黄花瘦". Ambient sound: autumn wind, rustling silk, writing brush strokes. Ink wash painting aesthetic, gentle warm lighting.',
  yuefei: 'A Song Dynasty Chinese male general named Yue Fei, in gleaming battle armor, rides a black warhorse leading cavalry troops. He raises his sword and cries with fierce patriotism: "壮志饥餐胡虏肉，笑谈渴饮匈奴血！". Battle banners stream in the wind. Ambient sound: thundering hooves, battle horns, wind. Ink wash painting aesthetic, dramatic smoke and dust.',
  huoqubing: 'A Han Dynasty Chinese young male general named Huo Qubing, in silver battle armor, gallops on a white horse across the vast Gobi desert at sunrise. He shouts triumphantly: "匈奴未灭，何以家为！". An army of cavalry follows behind raising dust. Ambient sound: galloping hooves, desert wind, triumphant shout. Ink wash painting aesthetic, epic military scene.',
  mulan: 'A Northern Wei Dynasty Chinese female warrior named Hua Mulan, in military armor, rides a swift horse through misty mountain passes. Her black hair streams behind her. She speaks with determined courage: "万里赴戎机，关山度若飞". Ambient sound: horse hooves on mountain path, mountain wind, echoing voice. Ink wash painting aesthetic, dynamic action.',
  guanyu: 'A Three Kingdoms period Chinese male general named Guan Yu, in green armor with red dramatic cape and long flowing beard, holds the Green Dragon Crescent Blade. He stands in divine godlike presence amid swirling clouds and declares: "忠义两字，传颂万年！". Ambient sound: dramatic wind, thunder in the distance, divine resonant voice. Ink wash painting aesthetic, god-like atmospheric lighting.',
};

export function createDigitalHumanRoutes(): Router {
  const router = Router();

  // POST /api/digital-human/generate-video
  // Submits a video generation job and returns the video ID immediately
  router.post(
    '/generate-video',
    asyncHandler(async (req: Request, res: Response) => {
      const { characterId } = req.body as { characterId?: string };

      if (!characterId || !CHARACTER_PROMPTS[characterId]) {
        throw new AppError('Invalid character ID', 400);
      }

      const apiKey = process.env.AI_GATEWAY_API_KEY;
      if (!AI_GATEWAY_BASE || !apiKey) {
        throw new AppError('AI Gateway not configured', 503);
      }

      const prompt = CHARACTER_PROMPTS[characterId];

      const response = await fetch(`${AI_GATEWAY_BASE}/api/v1/videos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/veo-3.1-fast-generate-preview',
          prompt,
          duration: 8,
          aspectRatio: '16:9',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[digital-human] AI Gateway error:', response.status, errorText);
        throw new AppError('Failed to start video generation', 502);
      }

      const data = (await response.json()) as { id: string; status: string };
      res.json({ videoId: data.id, status: data.status });
    })
  );

  // GET /api/digital-human/video-status/:videoId
  // Polls the AI Gateway for the status of a video generation job
  router.get(
    '/video-status/:videoId',
    asyncHandler(async (req: Request, res: Response) => {
      const { videoId } = req.params;

      const apiKey = process.env.AI_GATEWAY_API_KEY;
      if (!AI_GATEWAY_BASE || !apiKey) {
        throw new AppError('AI Gateway not configured', 503);
      }

      const response = await fetch(`${AI_GATEWAY_BASE}/api/v1/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[digital-human] Status poll error:', response.status, errorText);
        throw new AppError('Failed to check video status', 502);
      }

      const data = (await response.json()) as {
        id: string;
        status: string;
        url?: string;
        error?: string;
      };

      res.json({
        videoId: data.id,
        status: data.status, // 'pending' | 'processing' | 'succeeded' | 'failed'
        url: data.url ?? null,
        error: data.error ?? null,
      });
    })
  );

  return router;
}
