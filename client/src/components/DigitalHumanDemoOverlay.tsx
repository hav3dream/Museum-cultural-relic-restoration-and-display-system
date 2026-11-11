/**
 * DigitalHumanDemoOverlay — 完全静态内置，零 AI 调用
 * 点击唤醒后立即呈现沉浸式数字人展示体验
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

// ─── 预生成的 AI 视频 URL（Google Veo 3.1 / Seedance，含音效）────────────────────
// 生成时间: 2026-03-24，视频由 AI 自动生成
const PREGENERATED_VIDEOS: Record<string, string> = {
  libai: 'https://ai-gateway-resource.trickle-lab.tech/videos/1774365126531-243dee59-618f-4aa4-9b24-ae8a5a42769f.mp4',
  dufu: 'https://ai-gateway-resource.trickle-lab.tech/videos/1774365131320-79e823bb-a2c8-4f30-be82-870854bb25be.mp4',
  sushi: 'https://ai-gateway-resource.trickle-lab.tech/videos/1774365120000-a201de57-d36e-46ed-b99f-d07d4de10ab2.mp4',
  yuefei: 'https://ai-gateway-resource.trickle-lab.tech/videos/1774365115695-e72b91ba-e82e-4c94-bd6b-1a131928fea6.mp4',
  mulan: 'https://ai-gateway-resource.trickle-lab.tech/videos/1774365454729-e875236a-0c3e-4120-9098-d80dba5cd5a7.mp4',
  guanyu: 'https://ai-gateway-resource.trickle-lab.tech/videos/1774365135679-0b44bb00-a47a-4192-b5d6-49a806631fdd.mp4',
};

// ─── 每个角色的内置内容 ────────────────────────────────────────────────────────

interface ActivityContent {
  label: string;
  icon: string;
  lines: string[]; // 诗句 / 台词
  caption: string; // 活动描述
}

interface CharacterContent {
  id: string;
  name: string;
  nameEn: string;
  dynasty: string;
  title: string;
  years: string;
  representChar: string;
  accentColor: string;
  bgGradient: string;
  category: 'wenren' | 'wujiang';
  scene: 'moon' | 'cottage' | 'river' | 'battle' | 'mountain' | 'divine';
  activities: ActivityContent[];
}

const DEMO_CHARACTERS: CharacterContent[] = [
  {
    id: 'libai',
    name: '李白',
    nameEn: 'Li Bai',
    dynasty: '唐',
    title: '诗仙',
    years: '701—762',
    representChar: '仙',
    accentColor: '#D4A76A',
    bgGradient: 'linear-gradient(160deg, #0a0500 0%, #1a0d00 50%, #0d0800 100%)',
    category: 'wenren',
    scene: 'moon',
    activities: [
      {
        label: '吟诵诗词',
        icon: '卷',
        lines: ['举杯邀明月，', '对影成三人。', '我歌月徘徊，', '我舞影零乱。'],
        caption: '静夜邀月，独酌长歌',
      },
      {
        label: '对月饮酒',
        icon: '月',
        lines: ['床前明月光，', '疑是地上霜。', '举头望明月，', '低头思故乡。'],
        caption: '月色如霜，思绪万千',
      },
      {
        label: '剑舞狂歌',
        icon: '剑',
        lines: ['长风几万里，', '吹度玉门关。', '十步杀一人，', '千里不留行。'],
        caption: '仗剑天涯，豪气干云',
      },
      {
        label: '口播讲解',
        icon: '声',
        lines: ['吾乃李白，', '字太白，号青莲居士。', '诗酒逍遥，', '山河万里入吾怀。'],
        caption: '穿越千年，共叙盛唐',
      },
    ],
  },
  {
    id: 'dufu',
    name: '杜甫',
    nameEn: 'Du Fu',
    dynasty: '唐',
    title: '诗圣',
    years: '712—770',
    representChar: '圣',
    accentColor: '#7BA87B',
    bgGradient: 'linear-gradient(160deg, #020802 0%, #091409 50%, #020802 100%)',
    category: 'wenren',
    scene: 'cottage',
    activities: [
      {
        label: '吟诗忧国',
        icon: '吟',
        lines: ['国破山河在，', '城春草木深。', '感时花溅泪，', '恨别鸟惊心。'],
        caption: '忧国忧民，诗史千秋',
      },
      {
        label: '讲史论道',
        icon: '史',
        lines: ['烽火连三月，', '家书抵万金。', '白头搔更短，', '浑欲不胜簪。'],
        caption: '战乱离苦，字字泣血',
      },
      {
        label: '草堂讲学',
        icon: '学',
        lines: ['安得广厦千万间，', '大庇天下寒士俱欢颜！', '风雨不动安如山，', '呜呼！何时眼前突兀见此屋。'],
        caption: '草堂茅屋，心系苍生',
      },
      {
        label: '口播解析',
        icon: '声',
        lines: ['吾乃杜甫，字子美，', '世称"诗圣"。', '一生颠沛，诗逾三千，', '皆是山河之泪。'],
        caption: '穿越盛唐，见证历史',
      },
    ],
  },
  {
    id: 'sushi',
    name: '苏轼',
    nameEn: 'Su Shi',
    dynasty: '宋',
    title: '东坡居士',
    years: '1037—1101',
    representChar: '豪',
    accentColor: '#C8A96E',
    bgGradient: 'linear-gradient(160deg, #080500 0%, #150d00 50%, #0a0600 100%)',
    category: 'wenren',
    scene: 'river',
    activities: [
      {
        label: '豪放词赋',
        icon: '词',
        lines: ['大江东去，', '浪淘尽，', '千古风流人物。', '故垒西边，人道是，三国周郎赤壁。'],
        caption: '赤壁江畔，豪情万丈',
      },
      {
        label: '品茗论道',
        icon: '茶',
        lines: ['明月几时有？', '把酒问青天。', '不知天上宫阙，', '今夕是何年。'],
        caption: '举杯问天，超然物外',
      },
      {
        label: '书法挥毫',
        icon: '墨',
        lines: ['横看成岭侧成峰，', '远近高低各不同。', '不识庐山真面目，', '只缘身在此山中。'],
        caption: '笔走龙蛇，气贯长虹',
      },
      {
        label: '赤壁口播',
        icon: '声',
        lines: ['吾乃苏轼，字子瞻，', '号东坡居士。', '仕途坎坷，却笑看风雨，', '诗词书画，皆臻化境。'],
        caption: '乐观豁达，千古第一文人',
      },
    ],
  },
  {
    id: 'yuefei',
    name: '岳飞',
    nameEn: 'Yue Fei',
    dynasty: '宋',
    title: '精忠报国',
    years: '1103—1142',
    representChar: '忠',
    accentColor: '#C84040',
    bgGradient: 'linear-gradient(160deg, #0a0000 0%, #1a0000 50%, #0a0000 100%)',
    category: 'wujiang',
    scene: 'battle',
    activities: [
      {
        label: '满江红',
        icon: '词',
        lines: ['怒发冲冠，凭栏处、潇潇雨歇。', '抬望眼，仰天长啸，壮怀激烈。', '三十功名尘与土，', '八千里路云和月。'],
        caption: '精忠报国，义贯长虹',
      },
      {
        label: '点兵阅阵',
        icon: '兵',
        lines: ['莫等闲，', '白了少年头，', '空悲切！', '靖康耻，犹未雪。'],
        caption: '铁骑纵横，收复河山',
      },
      {
        label: '骑马征战',
        icon: '骑',
        lines: ['壮志饥餐胡虏肉，', '笑谈渴饮匈奴血。', '待从头、收拾旧山河，', '朝天阙！'],
        caption: '驰骋沙场，保家卫国',
      },
      {
        label: '精忠故事',
        icon: '声',
        lines: ['吾乃岳飞，字鹏举，', '相州汤阴人。', '精忠报国，驱逐金兵，', '丹心昭日月。'],
        caption: '民族英雄，千古流芳',
      },
    ],
  },
  {
    id: 'mulan',
    name: '花木兰',
    nameEn: 'Hua Mulan',
    dynasty: '北魏',
    title: '代父从军',
    years: '约386—557',
    representChar: '勇',
    accentColor: '#9060B0',
    bgGradient: 'linear-gradient(160deg, #050008 0%, #0d0018 50%, #050008 100%)',
    category: 'wujiang',
    scene: 'mountain',
    activities: [
      {
        label: '木兰辞',
        icon: '辞',
        lines: ['万里赴戎机，', '关山度若飞。', '朔气传金柝，', '寒光照铁衣。'],
        caption: '代父从军，巾帼英雄',
      },
      {
        label: '骑马射箭',
        icon: '骑',
        lines: ['愿驰千里足，', '送儿还故乡。', '将军百战死，', '壮士十年归。'],
        caption: '铁马金戈，驰骋疆场',
      },
      {
        label: '武艺展示',
        icon: '武',
        lines: ['唧唧复唧唧，', '木兰当户织。', '不闻机杼声，', '唯闻女叹息。'],
        caption: '文武兼备，内外兼修',
      },
      {
        label: '从军故事',
        icon: '声',
        lines: ['吾乃花木兰，', '女扮男装，代父从军十二载。', '战功赫赫，回归故里，', '巾帼不让须眉。'],
        caption: '传奇女英雄，千古美名',
      },
    ],
  },
  {
    id: 'guanyu',
    name: '关羽',
    nameEn: 'Guan Yu',
    dynasty: '三国',
    title: '武圣',
    years: '约160—220',
    representChar: '义',
    accentColor: '#4A8A5A',
    bgGradient: 'linear-gradient(160deg, #000a03 0%, #001a08 50%, #000a03 100%)',
    category: 'wujiang',
    scene: 'divine',
    activities: [
      {
        label: '义薄云天',
        icon: '义',
        lines: ['桃园结义，', '誓同生死。', '忠心耿耿，', '义薄云天。'],
        caption: '千古义绝，忠义化身',
      },
      {
        label: '青龙偃月',
        icon: '刀',
        lines: ['过五关，斩六将，', '千里寻兄。', '单刀赴会，', '威震华夏。'],
        caption: '青龙偃月，所向披靡',
      },
      {
        label: '赤兔奔腾',
        icon: '马',
        lines: ['赤兔马，', '日行千里。', '关云长，', '义薄云天。'],
        caption: '神驹神将，天下无双',
      },
      {
        label: '武圣讲义',
        icon: '声',
        lines: ['吾乃关羽，字云长，', '河东解良人。', '忠义仁勇，', '后世尊为关圣帝君。'],
        caption: '武圣降临，忠义永传',
      },
    ],
  },
];

// ─── 背景场景 SVG ─────────────────────────────────────────────────────────────

function SceneMoon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="moonGlow" cx="65%" cy="18%" r="25%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <filter id="blur8"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="blur3"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      {/* Sky gradient */}
      <rect width="800" height="500" fill="url(#moonGlow)" />
      {/* Moon */}
      <motion.circle cx="520" cy="90" r="55" fill={color} opacity="0.18" filter="url(#blur8)"
        animate={{ opacity: [0.12, 0.22, 0.12] }} transition={{ duration: 4, repeat: Infinity }} />
      <motion.circle cx="520" cy="90" r="40" fill={color} opacity="0.25"
        animate={{ opacity: [0.2, 0.35, 0.2] }} transition={{ duration: 4, repeat: Infinity }} />
      <circle cx="520" cy="90" r="38" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
      {/* Stars */}
      {[[120,60],[200,40],[350,30],[450,55],[620,45],[700,80],[750,30],[80,100],[300,70]].map(([x,y],i) => (
        <motion.circle key={i} cx={x} cy={y} r="1.5" fill={color} opacity="0.6"
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }} />
      ))}
      {/* Distant mountains */}
      <path d="M0 380 Q100 260 200 310 Q300 200 400 280 Q500 180 600 260 Q700 200 800 280 L800 500 L0 500Z"
        fill="rgba(0,0,0,0.55)" />
      <path d="M0 420 Q80 340 160 370 Q240 300 320 340 Q400 280 480 320 Q560 270 640 310 Q720 280 800 320 L800 500 L0 500Z"
        fill="rgba(0,0,0,0.7)" />
      {/* Pine trees */}
      {[60, 120, 680, 720, 760].map((x, i) => (
        <g key={i} transform={`translate(${x},350) scale(${0.7 + i * 0.05})`}>
          <path d="M0-60 L-18 0 L18 0Z" fill="rgba(0,0,0,0.8)" />
          <path d="M0-40 L-22 10 L22 10Z" fill="rgba(0,0,0,0.7)" />
          <path d="M0-15 L-26 20 L26 20Z" fill="rgba(0,0,0,0.65)" />
          <rect x="-4" y="20" width="8" height="18" fill="rgba(0,0,0,0.7)" />
        </g>
      ))}
      {/* Mist layer */}
      <motion.rect x="0" y="380" width="800" height="80" fill="rgba(255,255,255,0.04)" rx="0"
        animate={{ opacity: [0.03, 0.07, 0.03], y: [380, 370, 380] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
    </svg>
  );
}

function SceneCottage({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="blur6"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      {/* Background mountains */}
      <path d="M0 350 Q150 200 300 280 Q450 150 600 240 Q700 190 800 250 L800 500 L0 500Z" fill="rgba(0,0,0,0.4)" />
      {/* Falling leaves */}
      {[{x:150,d:3},{x:280,d:1},{x:420,d:4},{x:560,d:2},{x:680,d:5},{x:100,d:6},{x:350,d:2.5}].map((l,i) => (
        <motion.ellipse key={i} cx={l.x} cy={50} rx="6" ry="4" fill={color} opacity="0.4"
          animate={{ y: [0, 420], x: [0, (i%2===0?30:-30)], opacity: [0, 0.5, 0], rotate: [0, 360] }}
          transition={{ duration: l.d + 4, repeat: Infinity, delay: i * 1.2, ease: 'linear' }} />
      ))}
      {/* Simple thatched cottage outline */}
      <g transform="translate(340,300)">
        <path d="M-80 0 L0 -70 L80 0Z" fill="none" stroke={color} strokeWidth="1.5" opacity="0.3" />
        <rect x="-65" y="0" width="130" height="70" fill="none" stroke={color} strokeWidth="1.5" opacity="0.25" />
        <rect x="-15" y="25" width="30" height="45" fill="none" stroke={color} strokeWidth="1" opacity="0.2" />
        {/* Window light */}
        <motion.rect x="-50" y="10" width="25" height="20" fill={color} opacity="0.1"
          animate={{ opacity: [0.05, 0.2, 0.05] }} transition={{ duration: 2.5, repeat: Infinity }} />
      </g>
      {/* Bamboo */}
      {[200, 220, 580, 600, 620].map((x,i) => (
        <g key={i}>
          <line x1={x} y1="500" x2={x+5} y2="160" stroke={color} strokeWidth="2" opacity="0.2" />
          {[200,250,300,350,400].map(y => (
            <path key={y} d={`M${x+5} ${y} Q${x+35} ${y-15} ${x+25} ${y-35}`}
              fill="none" stroke={color} strokeWidth="1.5" opacity="0.15" />
          ))}
        </g>
      ))}
      {/* Ground mist */}
      <motion.ellipse cx="400" cy="470" rx="350" ry="40" fill="rgba(255,255,255,0.04)"
        animate={{ opacity: [0.02, 0.06, 0.02], ry: [35, 45, 35] }}
        transition={{ duration: 5, repeat: Infinity }} />
    </svg>
  );
}

function SceneRiver({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Cliffs */}
      <path d="M0 200 Q50 100 150 150 Q200 80 280 120 L280 500 L0 500Z" fill="rgba(0,0,0,0.55)" />
      <path d="M800 180 Q750 90 650 140 Q600 70 520 110 L520 500 L800 500Z" fill="rgba(0,0,0,0.5)" />
      {/* River surface */}
      {[320,340,360,380,400,420,440,460].map((y,i) => (
        <motion.path key={i}
          d={`M100 ${y} Q300 ${y-8} 500 ${y} Q650 ${y+6} 700 ${y}`}
          fill="none" stroke={color} strokeWidth="0.8" opacity="0.12"
          animate={{ d: [`M100 ${y} Q300 ${y-8} 500 ${y} Q650 ${y+6} 700 ${y}`,
                         `M100 ${y} Q300 ${y+8} 500 ${y} Q650 ${y-6} 700 ${y}`,
                         `M100 ${y} Q300 ${y-8} 500 ${y} Q650 ${y+6} 700 ${y}`] }}
          transition={{ duration: 3+i*0.2, repeat: Infinity, ease: 'easeInOut', delay: i*0.1 }} />
      ))}
      {/* Moon reflection */}
      <motion.ellipse cx="400" cy="410" rx="30" ry="60" fill={color} opacity="0.08"
        animate={{ opacity: [0.05, 0.12, 0.05], scaleX: [1, 1.3, 1] }}
        transition={{ duration: 3, repeat: Infinity }} />
      {/* Distant moon */}
      <motion.circle cx="400" cy="80" r="35" fill={color} opacity="0.2"
        animate={{ opacity: [0.15, 0.28, 0.15] }} transition={{ duration: 4, repeat: Infinity }} />
      {/* Boat silhouette */}
      <g transform="translate(320,370)">
        <motion.g animate={{ y: [-4, 4, -4] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
          <path d="M-60 0 Q0 15 60 0 L50 -15 L-50 -15Z" fill="rgba(0,0,0,0.7)" />
          <line x1="0" y1="-15" x2="0" y2="-70" stroke="rgba(0,0,0,0.6)" strokeWidth="2" />
          <path d="M0 -70 L-30 -40 L0 -45 Z" fill="rgba(0,0,0,0.5)" />
        </motion.g>
      </g>
    </svg>
  );
}

function SceneBattle({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="blurBig"><feGaussianBlur stdDeviation="15" /></filter>
      </defs>
      {/* Dramatic sky */}
      {[{cx:200,cy:150,r:120},{cx:600,cy:100,r:100},{cx:400,cy:200,r:80}].map((c,i) => (
        <motion.ellipse key={i} cx={c.cx} cy={c.cy} rx={c.r} ry={c.r*0.6}
          fill={color} opacity="0.07" filter="url(#blurBig)"
          animate={{ opacity: [0.04, 0.12, 0.04], scale: [1, 1.1, 1] }}
          transition={{ duration: 3+i, repeat: Infinity, delay: i*0.5 }} />
      ))}
      {/* Battle flags */}
      {[120,200,580,660].map((x,i) => (
        <g key={i} transform={`translate(${x},200)`}>
          <motion.g animate={{ skewX: [-3, 3, -3] }} transition={{ duration: 1.5+i*0.3, repeat: Infinity }}>
            <line x1="0" y1="0" x2="0" y2="150" stroke="rgba(0,0,0,0.6)" strokeWidth="3" />
            <path d={`M0 0 L${i%2===0?40:-40} 20 L0 40Z`} fill={color} opacity="0.3" />
          </motion.g>
        </g>
      ))}
      {/* Horse silhouettes */}
      {[{x:150,s:1},{x:600,s:-1}].map((h,i) => (
        <motion.g key={i} transform={`translate(${h.x},380) scale(${h.s},1)`}
          animate={{ x: [-8, 8, -8] }} transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}>
          <path d="M0-50 Q20-60 40-45 Q55-35 55-20 L50 0 L35 0 Q30-10 20-10 Q10-10 5 0 L-10 0 Z"
            fill="rgba(0,0,0,0.7)" />
          <line x1="-10" y1="0" x2="-18" y2="30" stroke="rgba(0,0,0,0.6)" strokeWidth="5" />
          <line x1="5" y1="0" x2="0" y2="32" stroke="rgba(0,0,0,0.6)" strokeWidth="5" />
          <line x1="35" y1="0" x2="40" y2="32" stroke="rgba(0,0,0,0.6)" strokeWidth="5" />
          <line x1="50" y1="0" x2="58" y2="30" stroke="rgba(0,0,0,0.6)" strokeWidth="5" />
        </motion.g>
      ))}
      {/* Ground */}
      <path d="M0 430 Q200 410 400 425 Q600 415 800 430 L800 500 L0 500Z" fill="rgba(0,0,0,0.6)" />
    </svg>
  );
}

function SceneMountain({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="blurMist"><feGaussianBlur stdDeviation="20" /></filter>
      </defs>
      {/* Layered mountains */}
      <path d="M0 300 Q100 180 200 240 Q300 120 400 200 Q500 100 600 180 Q700 130 800 190 L800 500 L0 500Z"
        fill="rgba(0,0,0,0.3)" />
      <path d="M0 350 Q100 250 180 290 Q280 200 360 260 Q460 190 540 240 Q640 200 720 250 L800 270 L800 500 L0 500Z"
        fill="rgba(0,0,0,0.5)" />
      <path d="M0 400 Q80 360 160 380 Q240 340 320 370 Q400 330 480 360 Q560 320 640 355 Q720 335 800 360 L800 500 L0 500Z"
        fill="rgba(0,0,0,0.65)" />
      {/* Mist layers */}
      {[280, 340, 400].map((y, i) => (
        <motion.rect key={i} x="0" y={y} width="800" height="40" fill="rgba(255,255,255,0.04)"
          animate={{ opacity: [0.02, 0.06, 0.02], x: [-20, 20, -20] }}
          transition={{ duration: 6+i*2, repeat: Infinity, delay: i*0.8, ease: 'easeInOut' }} />
      ))}
      {/* Stars */}
      {[[100,50],[200,30],[350,60],[500,40],[650,55],[750,25]].map(([x,y],i) => (
        <motion.circle key={i} cx={x} cy={y} r="1.5" fill={color} opacity="0.5"
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2.5+i*0.3, repeat: Infinity, delay: i*0.4 }} />
      ))}
      {/* Crescent moon */}
      <motion.path d="M680 60 A30 30 0 1 1 680 61Z" fill={color} opacity="0"
        animate={{ opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 4, repeat: Infinity }} />
      <circle cx="680" cy="70" r="28" fill="none" stroke={color} strokeWidth="1.5" opacity="0.25" />
      <circle cx="694" cy="64" r="22" fill="rgba(0,0,0,0.9)" />
    </svg>
  );
}

function SceneDivine({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 800 500" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="divineGlow" cx="50%" cy="40%" r="45%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <filter id="blurD"><feGaussianBlur stdDeviation="12" /></filter>
      </defs>
      <rect width="800" height="500" fill="url(#divineGlow)" />
      {/* Divine light rays */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((angle,i) => (
        <motion.line key={i}
          x1="400" y1="200"
          x2={400+Math.cos(angle*Math.PI/180)*400}
          y2={200+Math.sin(angle*Math.PI/180)*400}
          stroke={color} strokeWidth="1" opacity="0.06"
          animate={{ opacity: [0.03, 0.1, 0.03] }}
          transition={{ duration: 2, repeat: Infinity, delay: i*0.1 }} />
      ))}
      {/* Glowing orb */}
      <motion.circle cx="400" cy="200" r="60" fill={color} opacity="0.08" filter="url(#blurD)"
        animate={{ r: [55, 70, 55], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 3, repeat: Infinity }} />
      <motion.circle cx="400" cy="200" r="30" fill={color} opacity="0.15"
        animate={{ r: [28, 35, 28] }} transition={{ duration: 3, repeat: Infinity }} />
      {/* Cloud wisps */}
      {[{x:100,y:300},{x:350,y:380},{x:580,y:320},{x:700,y:400}].map((c,i) => (
        <motion.ellipse key={i} cx={c.x} cy={c.y} rx="80" ry="20"
          fill="rgba(255,255,255,0.05)"
          animate={{ x: [-10, 10, -10], opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 5+i, repeat: Infinity, delay: i*0.7 }} />
      ))}
      {/* Ground */}
      <path d="M0 440 Q400 410 800 440 L800 500 L0 500Z" fill="rgba(0,0,0,0.6)" />
    </svg>
  );
}

const SCENE_MAP = { moon: SceneMoon, cottage: SceneCottage, river: SceneRiver, battle: SceneBattle, mountain: SceneMountain, divine: SceneDivine };

// ─── 角色剪影 SVG ──────────────────────────────────────────────────────────────

function CharacterSilhouette({ category, color }: { category: 'wenren' | 'wujiang'; color: string }) {
  if (category === 'wujiang') {
    return (
      <motion.svg viewBox="0 0 200 300" fill="none" className="w-full h-full"
        animate={{ y: [-4, 4, -4] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        {/* Helmet */}
        <path d="M78 22 Q100 2 122 22 L118 30 L82 30Z" fill={color} opacity="0.55" />
        <ellipse cx="100" cy="36" rx="24" ry="28" fill={color} opacity="0.55" />
        {/* Armor body */}
        <path d="M76 64 L58 92 L52 170 L68 175 L82 120 L100 138 L118 120 L132 175 L148 170 L142 92 L124 64Z" fill={color} opacity="0.45" />
        <ellipse cx="62" cy="72" rx="18" ry="12" fill={color} opacity="0.38" transform="rotate(-15 62 72)" />
        <ellipse cx="138" cy="72" rx="18" ry="12" fill={color} opacity="0.38" transform="rotate(15 138 72)" />
        {/* Weapon */}
        <motion.g animate={{ rotate: [-3, 3, -3] }} style={{ originX: '124px', originY: '68px' }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <path d="M124 68 L158 42 L168 20 L155 14 L140 35 L118 62Z" fill={color} opacity="0.42" />
          <line x1="160" y1="6" x2="100" y2="50" stroke={color} strokeWidth="3" opacity="0.55" />
          <path d="M162 2 L168 8 L158 12Z" fill={color} opacity="0.65" />
        </motion.g>
        {/* Legs */}
        <path d="M52 170 Q38 210 35 250 Q62 235 72 205 L68 175Z" fill={color} opacity="0.28" />
        <path d="M148 170 Q162 210 165 250 Q138 235 128 205 L132 175Z" fill={color} opacity="0.28" />
      </motion.svg>
    );
  }
  return (
    <motion.svg viewBox="0 0 200 300" fill="none" className="w-full h-full"
      animate={{ y: [-4, 4, -4] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}>
      <ellipse cx="100" cy="38" rx="22" ry="26" fill={color} opacity="0.55" />
      {/* Scholar cap */}
      <path d="M82 22 L100 8 L118 22 L114 28 L86 28Z" fill={color} opacity="0.45" />
      {/* Robe */}
      <path d="M74 64 L58 100 L48 185 L62 188 L76 130 L100 148 L124 130 L138 188 L152 185 L142 100 L126 64Z" fill={color} opacity="0.40" />
      {/* Wide sleeves */}
      <motion.path d="M74 72 Q38 88 18 98 Q28 118 50 112 L74 102Z" fill={color} opacity="0.32"
        animate={{ d: ['M74 72 Q38 88 18 98 Q28 118 50 112 L74 102Z',
                        'M74 72 Q30 92 12 102 Q22 122 44 116 L74 102Z',
                        'M74 72 Q38 88 18 98 Q28 118 50 112 L74 102Z'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.path d="M126 72 Q162 88 182 98 Q172 118 150 112 L126 102Z" fill={color} opacity="0.32"
        animate={{ d: ['M126 72 Q162 88 182 98 Q172 118 150 112 L126 102Z',
                        'M126 72 Q170 84 188 94 Q178 114 156 108 L126 102Z',
                        'M126 72 Q162 88 182 98 Q172 118 150 112 L126 102Z'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }} />
      {/* Scroll */}
      <rect x="14" y="92" width="7" height="28" rx="3" fill={color} opacity="0.55" />
      {/* Hem */}
      <path d="M48 185 Q38 220 30 250 Q60 240 75 210 L62 188Z" fill={color} opacity="0.22" />
      <path d="M152 185 Q162 220 170 250 Q140 240 125 210 L138 188Z" fill={color} opacity="0.22" />
    </motion.svg>
  );
}

// ─── 打字机文字 ────────────────────────────────────────────────────────────────

function TypewriterText({ lines, color, key: _key }: { lines: string[]; color: string; key: string }) {
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    setDisplayed([]);
    setCurrentLine(0);
    setCurrentChar(0);
  }, [_key]);

  useEffect(() => {
    if (currentLine >= lines.length) return;
    const line = lines[currentLine];
    if (currentChar < line.length) {
      const t = setTimeout(() => {
        setDisplayed(prev => {
          const next = [...prev];
          next[currentLine] = (next[currentLine] || '') + line[currentChar];
          return next;
        });
        setCurrentChar(c => c + 1);
      }, 80);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setCurrentLine(l => l + 1);
        setCurrentChar(0);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [currentLine, currentChar, lines, _key]);

  return (
    <div className="space-y-2">
      {lines.map((_, i) => (
        <motion.div
          key={i}
          className="text-xl md:text-2xl leading-relaxed"
          style={{
            fontFamily: "'Ma Shan Zheng', cursive",
            color: i < currentLine ? color : i === currentLine ? color : 'transparent',
            textShadow: `0 0 20px ${color}60`,
            minHeight: '2rem',
          }}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: i <= currentLine ? 1 : 0, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          {displayed[i] || (i < currentLine ? lines[i] : '')}
          {i === currentLine && displayed[i] && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              style={{ color }}
            >
              |
            </motion.span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── 主体组件 ─────────────────────────────────────────────────────────────────

interface DigitalHumanDemoOverlayProps {
  characterId: string;
  onClose: () => void;
  onGenerateVideo?: () => void; // 触发 AI 视频生成（可选）
}

export default function DigitalHumanDemoOverlay({ characterId, onClose, onGenerateVideo }: DigitalHumanDemoOverlayProps) {
  const char = DEMO_CHARACTERS.find(c => c.id === characterId) ?? DEMO_CHARACTERS[0];
  const [activeActivity, setActiveActivity] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [muted, setMuted] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const pregenVideo = PREGENERATED_VIDEOS[characterId] ?? null;
  const Scene = SCENE_MAP[char.scene];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Reset activity when character changes
  useEffect(() => { setActiveActivity(0); }, [characterId]);

  const activity = char.activities[activeActivity];

  return (
    <motion.div
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{ background: char.bgGradient }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background scene */}
      <div className="absolute inset-0 pointer-events-none">
        <Scene color={char.accentColor} />
      </div>

      {/* Ambient overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 70% 60% at 50% 80%, ${char.accentColor}08 0%, transparent 70%)` }} />

      {/* Close button */}
      <motion.button
        className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center rounded-full border text-white/50"
        style={{ borderColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.3)' }}
        onClick={onClose}
        whileHover={{ borderColor: 'rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.9)' }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <X size={16} />
      </motion.button>

      {/* Main content layout */}
      <div className="relative z-10 h-full flex flex-col lg:flex-row">

        {/* ── Left: Character silhouette + info ── */}
        <motion.div
          className="flex flex-col items-center justify-center lg:w-[380px] shrink-0 p-8 pt-12 lg:pt-8"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Dynasty badge */}
          <div
            className="mb-4 px-4 py-1 rounded-full border text-xs tracking-[0.4em]"
            style={{
              borderColor: `${char.accentColor}50`,
              color: char.accentColor,
              backgroundColor: `${char.accentColor}10`,
              fontFamily: "'LXGW WenKai', serif",
            }}
          >
            {char.dynasty}朝 · {char.dynastyEn}
          </div>

          {/* Video / Silhouette display */}
          <div className="relative mb-4 w-full max-w-[320px]">
            <AnimatePresence mode="wait">
              {pregenVideo && showVideo ? (
                /* ── AI 预生成视频 ── */
                <motion.div
                  key="video"
                  className="relative rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${char.accentColor}40`, boxShadow: `0 0 30px ${char.accentColor}25` }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <video
                    ref={videoRef}
                    src={pregenVideo}
                    autoPlay
                    loop
                    playsInline
                    muted={muted}
                    className="w-full block"
                  />
                  {/* Mute toggle */}
                  <button
                    onClick={() => { setMuted(m => !m); if (videoRef.current) videoRef.current.muted = !muted; }}
                    className="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center rounded-full text-white/70 text-xs"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                  >
                    {muted ? '🔇' : '🔊'}
                  </button>
                </motion.div>
              ) : (
                /* ── SVG 剪影动画 ── */
                <motion.div
                  key="silhouette"
                  className="relative w-40 h-56 lg:w-48 lg:h-64 mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full blur-3xl"
                    style={{ backgroundColor: `${char.accentColor}20` }}
                    animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <CharacterSilhouette category={char.category} color={char.accentColor} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle: switch between video and silhouette */}
            {pregenVideo && (
              <motion.button
                type="button"
                onClick={() => setShowVideo(v => !v)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-full text-xs tracking-widest border"
                style={{
                  borderColor: `${char.accentColor}35`,
                  color: showVideo ? char.accentColor : `${char.accentColor}70`,
                  background: showVideo ? `${char.accentColor}15` : 'transparent',
                  fontFamily: "'LXGW WenKai', serif",
                }}
                whileHover={{ borderColor: char.accentColor }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {showVideo ? '● 视频播放中' : '▶ 播放 AI 生成视频'}
              </motion.button>
            )}
          </div>

          {/* Name */}
          <h1
            className="text-5xl lg:text-6xl font-normal text-white mb-1 text-center"
            style={{ fontFamily: "'Ma Shan Zheng', cursive", textShadow: `0 0 30px ${char.accentColor}60` }}
          >
            {char.name}
          </h1>
          <div
            className="text-base mb-1 text-center"
            style={{ color: char.accentColor, fontFamily: "'LXGW WenKai', serif" }}
          >
            {char.title}
          </div>
          <div
            className="text-xs text-white/30 tracking-widest text-center"
            style={{ fontFamily: "'LXGW WenKai', serif" }}
          >
            {char.years}
          </div>

          {/* Seal stamp */}
          <motion.div
            className="mt-5 w-14 h-14 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: `${char.accentColor}50`, background: `${char.accentColor}10` }}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            <span
              className="text-2xl font-normal"
              style={{ fontFamily: "'Ma Shan Zheng', cursive", color: char.accentColor }}
            >
              {char.representChar}
            </span>
          </motion.div>
        </motion.div>

        {/* ── Right: Content area ── */}
        <motion.div
          className="flex-1 flex flex-col justify-center p-6 lg:p-12 lg:pl-8"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {/* Activity tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {char.activities.map((act, i) => (
              <motion.button
                key={act.label}
                type="button"
                onClick={() => setActiveActivity(i)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all relative overflow-hidden"
                style={{
                  border: `1px solid ${i === activeActivity ? char.accentColor : `${char.accentColor}30`}`,
                  background: i === activeActivity ? `${char.accentColor}20` : 'rgba(0,0,0,0.3)',
                  color: i === activeActivity ? char.accentColor : 'rgba(255,255,255,0.45)',
                  fontFamily: "'LXGW WenKai', serif",
                  backdropFilter: 'blur(8px)',
                }}
                whileHover={{ borderColor: char.accentColor, color: char.accentColor }}
                whileTap={{ scale: 0.97 }}
              >
                <span
                  className="w-6 h-6 flex items-center justify-center rounded-md text-sm shrink-0"
                  style={{
                    background: `${char.accentColor}20`,
                    fontFamily: "'Ma Shan Zheng', cursive",
                    fontSize: '14px',
                    color: char.accentColor,
                  }}
                >
                  {act.icon}
                </span>
                <span className="text-xs tracking-wide">{act.label}</span>
                {i === activeActivity && (
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(90deg, transparent, ${char.accentColor}10, transparent)` }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Poem / lines area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${characterId}-${activeActivity}`}
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {/* Decorative top line */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${char.accentColor}40, transparent)` }} />
                <span className="text-xs tracking-[0.4em]" style={{ color: `${char.accentColor}70`, fontFamily: "'LXGW WenKai', serif" }}>
                  {activity.caption}
                </span>
                <div className="h-px flex-1" style={{ background: `linear-gradient(to left, ${char.accentColor}40, transparent)` }} />
              </div>

              {/* Typewriter poem */}
              <TypewriterText
                key={`${characterId}-${activeActivity}`}
                lines={activity.lines}
                color={char.accentColor}
              />
            </motion.div>
          </AnimatePresence>

          {/* Character speaking indicator */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex gap-1 items-end h-5">
              {[0, 0.1, 0.2, 0.3, 0.4].map((d, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full"
                  style={{ backgroundColor: char.accentColor }}
                  animate={{ height: [4, 16, 4] }}
                  transition={{ duration: 0.6, delay: d, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </div>
            <span
              className="text-xs tracking-[0.3em]"
              style={{ color: `${char.accentColor}70`, fontFamily: "'LXGW WenKai', serif" }}
            >
              {char.name} · 正在吟诵
            </span>
          </div>

          {/* AI video generation CTA */}
          {onGenerateVideo && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <div
                className="text-[10px] text-white/25 tracking-widest mb-3 text-center"
                style={{ fontFamily: "'LXGW WenKai', serif" }}
              >
                — 当前为静态预览 —
              </div>
              <motion.button
                type="button"
                onClick={() => { onClose(); setTimeout(onGenerateVideo, 200); }}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm tracking-[0.15em] relative overflow-hidden border"
                style={{
                  borderColor: `${char.accentColor}50`,
                  background: `linear-gradient(135deg, ${char.accentColor}20, ${char.accentColor}08)`,
                  color: char.accentColor,
                  fontFamily: "'LXGW WenKai', serif",
                  backdropFilter: 'blur(8px)',
                }}
                whileHover={{
                  borderColor: char.accentColor,
                  background: `linear-gradient(135deg, ${char.accentColor}35, ${char.accentColor}15)`,
                  boxShadow: `0 0 20px ${char.accentColor}30`,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles size={14} />
                <span>AI 生成真实视频（含音效）</span>
                <motion.div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(90deg, transparent, ${char.accentColor}15, transparent)` }}
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                />
              </motion.button>
              <div
                className="text-[10px] text-white/20 tracking-widest mt-2 text-center"
                style={{ fontFamily: "'LXGW WenKai', serif" }}
              >
                Google Veo 3.1 · 有声有像 · 约 1-3 分钟
              </div>
            </motion.div>
          )}

          {/* Bottom brand */}
          <motion.div
            className="mt-6 text-[10px] text-white/15 tracking-[0.5em] uppercase"
            style={{ fontFamily: "'LXGW WenKai', serif" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            数字人 · AI数字文化 · 华韵新生
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
