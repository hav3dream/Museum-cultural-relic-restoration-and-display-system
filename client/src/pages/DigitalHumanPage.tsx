import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useLocation } from 'wouter';
import StickyHeader from '@/components/StickyHeader';
import Footer from '@/components/layout/Footer';
import MobileMenu from '@/components/MobileMenu';
import { InkBrushStroke, SealStamp } from '@/components/decorative';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import DigitalHumanVideoOverlay from '@/components/DigitalHumanVideoOverlay';
import DigitalHumanDemoOverlay from '@/components/DigitalHumanDemoOverlay';

const PREMIUM_EASE = [0.5, 0, 0.3, 1] as const;

type ActivityType = 'poetry' | 'martial' | 'art' | 'music' | 'history';

interface Activity {
  name: string;
  type: ActivityType;
  icon: string;
}

interface Character {
  id: string;
  name: string;
  nameEn: string;
  dynasty: string;
  dynastyEn: string;
  title: string;
  years: string;
  description: string;
  longDesc: string;
  category: 'wenren' | 'wujiang';
  activities: Activity[];
  accentColor: string;
  bgGradient: string;
  representChar: string;
  quote: string;
}

const CHARACTERS: Character[] = [
  {
    id: 'libai',
    name: '李白',
    nameEn: 'Li Bai',
    dynasty: '唐',
    dynastyEn: 'Tang Dynasty',
    title: '诗仙',
    years: '701—762',
    description: '盛唐最伟大的浪漫主义诗人，以豪放飘逸的诗风著称于世。',
    longDesc: '李白，字太白，号青莲居士，唐代伟大的浪漫主义诗人，被后世誉为"诗仙"。其诗风豪放飘逸，想象丰富，语言流转自然，与杜甫并称"李杜"。',
    category: 'wenren',
    activities: [
      { name: '吟诵诗词', type: 'poetry', icon: '卷' },
      { name: '对月饮酒', type: 'art', icon: '月' },
      { name: '剑舞狂歌', type: 'martial', icon: '剑' },
      { name: '口播讲解', type: 'history', icon: '声' },
    ],
    accentColor: '#D4A76A',
    bgGradient: 'linear-gradient(135deg, #1a0e00 0%, #2d1800 60%, #1a0e00 100%)',
    representChar: '仙',
    quote: '举杯邀明月，对影成三人',
  },
  {
    id: 'dufu',
    name: '杜甫',
    nameEn: 'Du Fu',
    dynasty: '唐',
    dynastyEn: 'Tang Dynasty',
    title: '诗圣',
    years: '712—770',
    description: '现实主义诗歌的代表，以忧国忧民之情贯穿其一生创作。',
    longDesc: '杜甫，字子美，号少陵野老，唐代著名现实主义诗人，被后世誉为"诗圣"。其诗深刻反映社会现实，忧国忧民，被称为"诗史"。',
    category: 'wenren',
    activities: [
      { name: '吟诗忧国', type: 'poetry', icon: '吟' },
      { name: '讲史论道', type: 'history', icon: '史' },
      { name: '口播解析', type: 'history', icon: '声' },
      { name: '草堂讲学', type: 'art', icon: '学' },
    ],
    accentColor: '#7BA87B',
    bgGradient: 'linear-gradient(135deg, #081408 0%, #152015 60%, #081408 100%)',
    representChar: '圣',
    quote: '烽火连三月，家书抵万金',
  },
  {
    id: 'sushi',
    name: '苏轼',
    nameEn: 'Su Shi',
    dynasty: '宋',
    dynastyEn: 'Song Dynasty',
    title: '东坡居士',
    years: '1037—1101',
    description: '宋代文学艺术的全才巨匠，诗词书画无所不精。',
    longDesc: '苏轼，字子瞻，号东坡居士，宋代文学家、书画家。诗词文书画俱佳，是中国文化史上罕见的全才，代表豪放词风。',
    category: 'wenren',
    activities: [
      { name: '豪放词赋', type: 'poetry', icon: '词' },
      { name: '书法挥毫', type: 'art', icon: '书' },
      { name: '品茗论道', type: 'music', icon: '茶' },
      { name: '赤壁口播', type: 'history', icon: '声' },
    ],
    accentColor: '#C8A96E',
    bgGradient: 'linear-gradient(135deg, #130d00 0%, #241800 60%, #130d00 100%)',
    representChar: '豪',
    quote: '大江东去，浪淘尽，千古风流人物',
  },
  {
    id: 'wangwei',
    name: '王维',
    nameEn: 'Wang Wei',
    dynasty: '唐',
    dynastyEn: 'Tang Dynasty',
    title: '诗佛',
    years: '699—759',
    description: '山水田园诗派代表，诗画合一，禅意深远。',
    longDesc: '王维，字摩诘，号摩诘居士，唐代诗人、画家，被誉为"诗佛"。其诗画禅意深厚，意境空灵，有"诗中有画，画中有诗"之誉。',
    category: 'wenren',
    activities: [
      { name: '山水作画', type: 'art', icon: '画' },
      { name: '禅意吟诗', type: 'poetry', icon: '禅' },
      { name: '弹琴奏乐', type: 'music', icon: '琴' },
      { name: '田园讲述', type: 'history', icon: '声' },
    ],
    accentColor: '#8BAABB',
    bgGradient: 'linear-gradient(135deg, #020a10 0%, #071525 60%, #020a10 100%)',
    representChar: '禅',
    quote: '行到水穷处，坐看云起时',
  },
  {
    id: 'xinqiji',
    name: '辛弃疾',
    nameEn: 'Xin Qiji',
    dynasty: '宋',
    dynastyEn: 'Song Dynasty',
    title: '词宗·豪侠',
    years: '1140—1207',
    description: '文武双全的豪放派词人，一生抗金报国，词风豪迈。',
    longDesc: '辛弃疾，字幼安，号稼轩，宋代词人，与苏轼并称"苏辛"。文武兼备，既是豪放派词宗，又亲历抗金战场，词中充满家国情怀。',
    category: 'wenren',
    activities: [
      { name: '豪气填词', type: 'poetry', icon: '词' },
      { name: '弓马练武', type: 'martial', icon: '弓' },
      { name: '抗金故事', type: 'history', icon: '声' },
      { name: '骑马驰骋', type: 'martial', icon: '骑' },
    ],
    accentColor: '#A0B8D0',
    bgGradient: 'linear-gradient(135deg, #040810 0%, #0a1020 60%, #040810 100%)',
    representChar: '志',
    quote: '醉里挑灯看剑，梦回吹角连营',
  },
  {
    id: 'liqingzhao',
    name: '李清照',
    nameEn: 'Li Qingzhao',
    dynasty: '宋',
    dynastyEn: 'Song Dynasty',
    title: '千古第一才女',
    years: '1084—约1155',
    description: '宋代最伟大的女词人，婉约词派的代表人物。',
    longDesc: '李清照，号易安居士，宋代女词人，婉约词派的代表。其词风格清丽婉约，前期明快，后期多写漂泊流亡之苦，被誉为"千古第一才女"。',
    category: 'wenren',
    activities: [
      { name: '婉约填词', type: 'poetry', icon: '词' },
      { name: '品茶赏花', type: 'music', icon: '花' },
      { name: '吟诵诗词', type: 'poetry', icon: '吟' },
      { name: '讲述生平', type: 'history', icon: '声' },
    ],
    accentColor: '#D4A0B0',
    bgGradient: 'linear-gradient(135deg, #120508 0%, #200a10 60%, #120508 100%)',
    representChar: '婉',
    quote: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚',
  },
  {
    id: 'yuefei',
    name: '岳飞',
    nameEn: 'Yue Fei',
    dynasty: '宋',
    dynastyEn: 'Song Dynasty',
    title: '精忠报国',
    years: '1103—1142',
    description: '南宋著名抗金名将，精忠报国的民族英雄。',
    longDesc: '岳飞，字鹏举，南宋抗金名将，中国历史上著名的军事家、战略家，背刺"精忠报国"，是中华民族英雄精神的代表。',
    category: 'wujiang',
    activities: [
      { name: '骑马征战', type: 'martial', icon: '骑' },
      { name: '弓箭射击', type: 'martial', icon: '射' },
      { name: '点兵阅阵', type: 'martial', icon: '兵' },
      { name: '精忠故事', type: 'history', icon: '声' },
    ],
    accentColor: '#C84040',
    bgGradient: 'linear-gradient(135deg, #100000 0%, #200505 60%, #100000 100%)',
    representChar: '忠',
    quote: '壮志饥餐胡虏肉，笑谈渴饮匈奴血',
  },
  {
    id: 'huoqubing',
    name: '霍去病',
    nameEn: 'Huo Qubing',
    dynasty: '汉',
    dynastyEn: 'Han Dynasty',
    title: '骠骑将军',
    years: '140—117 BC',
    description: '西汉少年名将，纵横漠北，封狼居胥，开疆拓土。',
    longDesc: '霍去病，西汉著名将领，18岁从军，多次出击匈奴，深入漠北，打通河西走廊，留下"匈奴未灭，何以家为"的千古豪言。',
    category: 'wujiang',
    activities: [
      { name: '骑射训练', type: 'martial', icon: '射' },
      { name: '铁骑驰骋', type: 'martial', icon: '骑' },
      { name: '漠北征战', type: 'martial', icon: '征' },
      { name: '讲述传奇', type: 'history', icon: '声' },
    ],
    accentColor: '#C87A30',
    bgGradient: 'linear-gradient(135deg, #100800 0%, #201200 60%, #100800 100%)',
    representChar: '驰',
    quote: '匈奴未灭，何以家为',
  },
  {
    id: 'mulan',
    name: '花木兰',
    nameEn: 'Hua Mulan',
    dynasty: '北魏',
    dynastyEn: 'Northern Wei',
    title: '代父从军',
    years: '约386—557',
    description: '中国历史上传奇的女性英雄，女扮男装代父从军。',
    longDesc: '花木兰，中国古代传说中的女英雄，女扮男装，代替父亲征战沙场十二年，立下赫赫战功，是中华文化中巾帼英雄精神的象征。',
    category: 'wujiang',
    activities: [
      { name: '骑马射箭', type: 'martial', icon: '骑' },
      { name: '武艺展示', type: 'martial', icon: '武' },
      { name: '从军故事', type: 'history', icon: '声' },
      { name: '铁骑演练', type: 'martial', icon: '练' },
    ],
    accentColor: '#9060B0',
    bgGradient: 'linear-gradient(135deg, #080010 0%, #100025 60%, #080010 100%)',
    representChar: '勇',
    quote: '万里赴戎机，关山度若飞',
  },
  {
    id: 'guanyu',
    name: '关羽',
    nameEn: 'Guan Yu',
    dynasty: '三国',
    dynastyEn: 'Three Kingdoms',
    title: '武圣',
    years: '约160—220',
    description: '三国蜀汉名将，忠义化身，后世尊为"武圣"。',
    longDesc: '关羽，字云长，三国时期蜀汉名将，以忠义著称于世。后被历代朝廷奉为关圣帝君，是中国文化中忠义精神的最高化身。',
    category: 'wujiang',
    activities: [
      { name: '青龙偃月', type: 'martial', icon: '刀' },
      { name: '骑马驰骋', type: 'martial', icon: '骑' },
      { name: '赤兔奔腾', type: 'martial', icon: '马' },
      { name: '义薄云天', type: 'history', icon: '声' },
    ],
    accentColor: '#4A8A5A',
    bgGradient: 'linear-gradient(135deg, #001008 0%, #002015 60%, #001008 100%)',
    representChar: '义',
    quote: '忠义两字，传颂万年',
  },
];

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  poetry: '#D4A76A',
  martial: '#C84040',
  art: '#7BA87B',
  music: '#8BAABB',
  history: '#A09070',
};

const FILTER_TABS = [
  { key: 'all', label: '全部人物' },
  { key: 'wenren', label: '文人墨客' },
  { key: 'wujiang', label: '豪侠武将' },
];

// SVG character portrait for literary figure
function LiteraryFigureSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Flowing robe silhouette */}
      <ellipse cx="100" cy="38" rx="22" ry="26" fill={color} opacity="0.55" />
      {/* Scholar cap */}
      <path d="M82 22 L100 8 L118 22 L114 28 L86 28 Z" fill={color} opacity="0.45" />
      <rect x="88" y="6" width="24" height="4" rx="2" fill={color} opacity="0.35" />
      {/* Body with long robes */}
      <path d="M74 64 L58 100 L48 185 L62 188 L76 130 L100 148 L124 130 L138 188 L152 185 L142 100 L126 64 Z"
        fill={color} opacity="0.40" />
      {/* Wide sleeve left - flowing */}
      <path d="M74 72 Q38 88 18 98 Q28 118 50 112 L74 102 Z" fill={color} opacity="0.32" />
      {/* Wide sleeve right - flowing */}
      <path d="M126 72 Q162 88 182 98 Q172 118 150 112 L126 102 Z" fill={color} opacity="0.32" />
      {/* Collar/chest detail */}
      <path d="M88 64 L100 80 L112 64" stroke={color} strokeWidth="1.5" opacity="0.5" fill="none" />
      {/* Hand holding scroll */}
      <rect x="14" y="92" width="7" height="28" rx="3" fill={color} opacity="0.50" />
      <path d="M18 95 Q32 76 48 88" stroke={color} strokeWidth="1.8" opacity="0.35" fill="none" />
      {/* Robe hem flare */}
      <path d="M48 185 Q38 220 30 250 Q60 240 75 210 L62 188 Z" fill={color} opacity="0.22" />
      <path d="M152 185 Q162 220 170 250 Q140 240 125 210 L138 188 Z" fill={color} opacity="0.22" />
    </svg>
  );
}

// SVG character portrait for martial figure
function MartialFigureSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Head */}
      <ellipse cx="100" cy="36" rx="24" ry="28" fill={color} opacity="0.55" />
      {/* Helmet/crown */}
      <path d="M78 22 Q100 2 122 22 L118 30 L82 30 Z" fill={color} opacity="0.50" />
      <path d="M92 2 L100 -4 L108 2" stroke={color} strokeWidth="2" opacity="0.40" fill="none" />
      {/* Armored body */}
      <path d="M76 64 L58 92 L52 170 L68 175 L82 120 L100 138 L118 120 L132 175 L148 170 L142 92 L124 64 Z"
        fill={color} opacity="0.45" />
      {/* Shoulder armor */}
      <ellipse cx="62" cy="72" rx="18" ry="12" fill={color} opacity="0.38" transform="rotate(-15 62 72)" />
      <ellipse cx="138" cy="72" rx="18" ry="12" fill={color} opacity="0.38" transform="rotate(15 138 72)" />
      {/* Armor chest plate */}
      <path d="M82 70 L100 90 L118 70 L112 64 L100 72 L88 64 Z" fill={color} opacity="0.30" />
      {/* Right arm raised with weapon */}
      <path d="M124 68 L158 42 L168 20 L155 14 L140 35 L118 62 Z" fill={color} opacity="0.38" />
      {/* Weapon - spear/sword */}
      <line x1="160" y1="6" x2="100" y2="50" stroke={color} strokeWidth="3" opacity="0.55" />
      <path d="M162 2 L168 8 L158 12 Z" fill={color} opacity="0.60" />
      {/* Left arm guard */}
      <path d="M76 68 L42 80 L38 100 L52 104 L76 90 Z" fill={color} opacity="0.32" />
      {/* Cape/armor flaps */}
      <path d="M52 170 Q38 210 35 245 Q62 230 72 200 L68 175 Z" fill={color} opacity="0.25" />
      <path d="M148 170 Q162 210 165 245 Q138 230 128 200 L132 175 Z" fill={color} opacity="0.25" />
      {/* Belt/waist armor */}
      <rect x="72" y="128" width="56" height="10" rx="3" fill={color} opacity="0.35" />
    </svg>
  );
}

// Ink wash glow background for character card portrait
function InkPortrait({ char }: { char: Character }) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: char.bgGradient }}>
      {/* Ink splash glow layers */}
      <svg
        viewBox="0 0 400 500"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <filter id={`ink-${char.id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="30" />
          </filter>
          <filter id={`ink-sm-${char.id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="15" />
          </filter>
        </defs>
        <ellipse cx="200" cy="260" rx="140" ry="180" fill={char.accentColor} opacity="0.10"
          filter={`url(#ink-${char.id})`} />
        <ellipse cx="130" cy="160" rx="80" ry="90" fill={char.accentColor} opacity="0.07"
          filter={`url(#ink-${char.id})`} />
        <ellipse cx="280" cy="380" rx="90" ry="70" fill={char.accentColor} opacity="0.06"
          filter={`url(#ink-${char.id})`} />
        <ellipse cx="200" cy="180" rx="60" ry="80" fill={char.accentColor} opacity="0.12"
          filter={`url(#ink-sm-${char.id})`} />
      </svg>
      {/* Large background character */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
        style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
      >
        <span
          className="text-[200px] leading-none"
          style={{ color: char.accentColor, opacity: 0.06 }}
        >
          {char.representChar}
        </span>
      </div>
      {/* Character silhouette */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[65%] h-[78%]">
        {char.category === 'wenren'
          ? <LiteraryFigureSVG color={char.accentColor} />
          : <MartialFigureSVG color={char.accentColor} />
        }
      </div>
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}

function CharacterCard({
  char,
  onClick,
  isActive,
}: {
  char: Character;
  onClick: () => void;
  isActive: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative cursor-pointer rounded-2xl overflow-hidden select-none"
      style={{ aspectRatio: '3/4', boxShadow: isActive ? `0 0 0 2px ${char.accentColor}, 0 8px 40px ${char.accentColor}30` : '0 4px 20px rgba(0,0,0,0.4)' }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: PREMIUM_EASE }}
      whileHover={{ y: -6, transition: { duration: 0.3, ease: PREMIUM_EASE } }}
    >
      {/* Portrait background */}
      <InkPortrait char={char} />

      {/* Dynasty badge */}
      <div className="absolute top-3 right-3 z-10">
        <div
          className="px-2.5 py-0.5 rounded-full text-[10px] tracking-widest border"
          style={{
            borderColor: `${char.accentColor}60`,
            color: char.accentColor,
            backgroundColor: 'rgba(0,0,0,0.45)',
            fontFamily: "'LXGW WenKai', serif",
          }}
        >
          {char.dynasty}朝
        </div>
      </div>

      {/* Center representative character */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <motion.div
          className="text-8xl font-normal"
          style={{
            fontFamily: "'Ma Shan Zheng', cursive",
            color: char.accentColor,
            textShadow: `0 0 40px ${char.accentColor}80, 0 0 80px ${char.accentColor}30`,
            opacity: hovered ? 0.25 : 0.40,
          }}
          animate={{ opacity: hovered ? 0.20 : 0.38 }}
          transition={{ duration: 0.4 }}
        >
          {char.representChar}
        </motion.div>
      </div>

      {/* Bottom info panel */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)' }}>
        <div className="flex items-end justify-between mb-2">
          <div>
            <div
              className="text-2xl font-normal text-white leading-none mb-1"
              style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
            >
              {char.name}
            </div>
            <div
              className="text-xs tracking-widest"
              style={{ color: char.accentColor, fontFamily: "'LXGW WenKai', serif" }}
            >
              {char.title}
            </div>
          </div>
          <div
            className="text-[10px] text-white/40 tracking-wider"
            style={{ fontFamily: "'LXGW WenKai', serif" }}
          >
            {char.years}
          </div>
        </div>

        {/* Activity tags - show on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-1.5 mt-2">
                {char.activities.slice(0, 3).map(act => (
                  <span
                    key={act.name}
                    className="px-2 py-0.5 rounded-full text-[10px] tracking-wide"
                    style={{
                      backgroundColor: `${ACTIVITY_COLORS[act.type]}20`,
                      border: `1px solid ${ACTIVITY_COLORS[act.type]}50`,
                      color: ACTIVITY_COLORS[act.type],
                      fontFamily: "'LXGW WenKai', serif",
                    }}
                  >
                    {act.name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active indicator ring */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 2px ${char.accentColor}` }}
          layoutId="active-ring"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </motion.div>
  );
}

// Detail panel shown for selected character
function CharacterDetail({
  char,
  onClose,
  onWake,
}: {
  char: Character;
  onClose: () => void;
  onWake: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: PREMIUM_EASE }}
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: char.bgGradient,
        border: `1px solid ${char.accentColor}30`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px ${char.accentColor}20`,
      }}
    >
      {/* Ink glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
          <defs>
            <filter id="det-blur">
              <feGaussianBlur stdDeviation="50" />
            </filter>
          </defs>
          <ellipse cx="650" cy="200" rx="250" ry="300" fill={char.accentColor} opacity="0.08" filter="url(#det-blur)" />
          <ellipse cx="150" cy="100" rx="150" ry="200" fill={char.accentColor} opacity="0.05" filter="url(#det-blur)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-0">
        {/* Left: portrait */}
        <div className="relative w-full lg:w-[300px] shrink-0 h-[320px] lg:h-auto lg:min-h-[460px] overflow-hidden">
          <InkPortrait char={char} />
          {/* Seal stamp */}
          <div className="absolute top-4 left-4 w-16 h-16 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: `${char.accentColor}50`, backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <span className="text-xl" style={{ fontFamily: "'Ma Shan Zheng', cursive", color: char.accentColor }}>
              {char.representChar}
            </span>
          </div>
        </div>

        {/* Right: info */}
        <div className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-xs px-3 py-1 rounded-full border"
                style={{ borderColor: `${char.accentColor}50`, color: char.accentColor, fontFamily: "'LXGW WenKai', serif" }}
              >
                {char.dynasty}朝 · {char.dynastyEn}
              </span>
              <span className="text-xs text-white/40 tracking-widest" style={{ fontFamily: "'LXGW WenKai', serif" }}>
                {char.years}
              </span>
            </div>

            <h2
              className="text-5xl md:text-6xl font-normal text-white mb-1"
              style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
            >
              {char.name}
            </h2>
            <div
              className="text-lg mb-4"
              style={{ color: char.accentColor, fontFamily: "'LXGW WenKai', serif" }}
            >
              {char.title}
            </div>

            {/* Quote */}
            <div
              className="relative pl-4 mb-5 italic"
              style={{ borderLeft: `2px solid ${char.accentColor}60` }}
            >
              <p
                className="text-base text-white/60 leading-relaxed"
                style={{ fontFamily: "'LXGW WenKai', serif" }}
              >
                「{char.quote}」
              </p>
            </div>

            <p
              className="text-sm text-white/50 leading-relaxed mb-6"
              style={{ fontFamily: "'LXGW WenKai', serif" }}
            >
              {char.longDesc}
            </p>
          </div>

          {/* Activities */}
          <div>
            <div
              className="text-xs text-white/40 tracking-[0.3em] mb-3 uppercase"
              style={{ fontFamily: "'LXGW WenKai', serif" }}
            >
              互动场景
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {char.activities.map((act, i) => (
                <motion.button
                  type="button"
                  key={act.name}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all"
                  style={{
                    borderColor: `${ACTIVITY_COLORS[act.type]}35`,
                    backgroundColor: `${ACTIVITY_COLORS[act.type]}10`,
                  }}
                  whileHover={{
                    backgroundColor: `${ACTIVITY_COLORS[act.type]}20`,
                    borderColor: `${ACTIVITY_COLORS[act.type]}60`,
                    x: 4,
                    transition: { duration: 0.2 },
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <span
                    className="text-lg w-8 h-8 flex items-center justify-center rounded-lg shrink-0"
                    style={{
                      backgroundColor: `${ACTIVITY_COLORS[act.type]}20`,
                      color: ACTIVITY_COLORS[act.type],
                      fontFamily: "'Ma Shan Zheng', cursive",
                      fontSize: '18px',
                    }}
                  >
                    {act.icon}
                  </span>
                  <span
                    className="text-sm text-white/70"
                    style={{ fontFamily: "'LXGW WenKai', serif" }}
                  >
                    {act.name}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* CTA Button */}
            <motion.button
              type="button"
              onClick={onWake}
              className="mt-6 w-full py-4 rounded-2xl text-center font-normal relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${char.accentColor}30, ${char.accentColor}15)`,
                border: `1px solid ${char.accentColor}50`,
                color: char.accentColor,
                fontFamily: "'LXGW WenKai', serif",
                fontSize: '16px',
                letterSpacing: '0.2em',
              }}
              whileHover={{
                backgroundColor: `${char.accentColor}25`,
                boxShadow: `0 4px 20px ${char.accentColor}30`,
                transition: { duration: 0.3 },
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">唤醒 · 生成视频</span>
              <motion.div
                className="absolute inset-0"
                style={{ background: `linear-gradient(90deg, transparent, ${char.accentColor}20, transparent)` }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Floating particle for hero section
function HeroParticles({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: i % 3 === 0 ? '#D4A76A' : i % 3 === 1 ? '#C85840' : '#E8E3D1',
            opacity: 0.3 + Math.random() * 0.4,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function DigitalHumanPage() {
  useDocumentTitle('数字人');

  const [, navigate] = useLocation();
  const [activeFilter, setActiveFilter] = useState<'all' | 'wenren' | 'wujiang'>('all');
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [overlayChar, setOverlayChar] = useState<Character | null>(null);
  const [videoOverlayChar, setVideoOverlayChar] = useState<Character | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const isGridInView = useInView(gridRef, { once: true });

  const filteredChars = CHARACTERS.filter(c =>
    activeFilter === 'all' || c.category === activeFilter
  );

  const handleCharClick = (char: Character) => {
    if (selectedChar?.id === char.id) {
      setSelectedChar(null);
    } else {
      setSelectedChar(char);
      // Scroll detail panel into view
      setTimeout(() => {
        document.getElementById('char-detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0603', color: '#E8E3D1' }}>
      <StickyHeader onMobileMenuOpen={() => setIsMobileMenuOpen(true)} theme="dark" title="数字人" />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* ==================== HERO SECTION ==================== */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #1a0e00 0%, #0a0603 60%, #050301 100%)',
        }}
      >
        <HeroParticles color="#D4A76A" />

        {/* Background ink wash */}
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
            <defs>
              <filter id="hero-blur">
                <feGaussianBlur stdDeviation="60" />
              </filter>
            </defs>
            <ellipse cx="600" cy="400" rx="500" ry="350" fill="#7F3222" opacity="0.3" filter="url(#hero-blur)" />
            <ellipse cx="200" cy="200" rx="200" ry="250" fill="#D4A76A" opacity="0.2" filter="url(#hero-blur)" />
            <ellipse cx="1000" cy="600" rx="250" ry="200" fill="#C85840" opacity="0.15" filter="url(#hero-blur)" />
          </svg>
        </div>

        {/* Vertical decorative lines */}
        {[0.2, 0.8].map((x, i) => (
          <motion.div
            key={i}
            className="absolute top-0 bottom-0 w-[1px]"
            style={{ left: `${x * 100}%`, background: 'linear-gradient(to bottom, transparent, rgba(212,167,106,0.15), transparent)' }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: PREMIUM_EASE }}
          />
        ))}

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Top label */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-8 flex items-center justify-center gap-4"
          >
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-[#D4A76A]/60" />
            <span
              className="text-xs tracking-[0.5em] text-[#D4A76A]/70 uppercase"
              style={{ fontFamily: "'LXGW WenKai', serif" }}
            >
              华韵新生 · 活化利用
            </span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-[#D4A76A]/60" />
          </motion.div>

          {/* Main title */}
          <div
            className="flex items-center justify-center gap-4 md:gap-6 mb-6"
            style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
          >
            {['数', '字', '人'].map((char, i) => (
              <motion.span
                key={char}
                className="inline-block font-normal"
                style={{
                  fontSize: 'clamp(4rem, 15vw, 10rem)',
                  color: '#E8E3D1',
                  textShadow: '0 4px 40px rgba(212,167,106,0.3), 0 2px 8px rgba(0,0,0,0.5)',
                  lineHeight: 1,
                }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.15, duration: 0.9, ease: PREMIUM_EASE }}
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* Subtitle */}
          <motion.p
            className="text-lg md:text-2xl text-[#E8E3D1]/60 mb-4 tracking-[0.15em]"
            style={{ fontFamily: "'LXGW WenKai', serif" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8, ease: PREMIUM_EASE }}
          >
            千年文化，今日重生
          </motion.p>
          <motion.p
            className="text-sm md:text-base text-[#E8E3D1]/35 mb-12 tracking-[0.1em]"
            style={{ fontFamily: "'LXGW WenKai', serif" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            Digital Humans · Ancient Wisdom Reborn
          </motion.p>

          {/* Stats row */}
          <motion.div
            className="flex justify-center gap-8 md:gap-16 mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.8 }}
          >
            {[
              { num: '10', label: '历史人物' },
              { num: '6', label: '文人墨客' },
              { num: '4', label: '豪侠武将' },
              { num: '40+', label: '互动场景' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-2xl md:text-3xl font-normal text-[#D4A76A] mb-1"
                  style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
                >
                  {stat.num}
                </div>
                <div
                  className="text-[10px] text-[#E8E3D1]/40 tracking-widest"
                  style={{ fontFamily: "'LXGW WenKai', serif" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA Button */}
          <motion.button
            type="button"
            className="px-12 py-4 rounded-full text-base tracking-[0.25em] relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #7F3222, #C85840)',
              color: '#E8E3D1',
              fontFamily: "'LXGW WenKai', serif",
              boxShadow: '0 8px 30px rgba(127, 50, 34, 0.35)',
            }}
            onClick={() => gridRef.current?.scrollIntoView({ behavior: 'smooth' })}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.9, duration: 0.8 }}
            whileHover={{ scale: 1.04, y: -2, boxShadow: '0 12px 40px rgba(127, 50, 34, 0.5)' }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative z-10">唤醒历史人物</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            />
          </motion.button>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <span
            className="text-[10px] tracking-[0.4em] text-[#E8E3D1]/30 uppercase"
            style={{ fontFamily: "'LXGW WenKai', serif" }}
          >
            Scroll to Meet
          </span>
          <motion.div
            className="w-[1px] h-10 bg-gradient-to-b from-[#D4A76A]/50 to-transparent"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'top' }}
          />
        </motion.div>
      </section>

      {/* ==================== CHARACTER GRID SECTION ==================== */}
      <section
        ref={gridRef}
        className="relative py-20 md:py-28"
        style={{ background: 'linear-gradient(180deg, #0a0603 0%, #0f0906 50%, #0a0603 100%)' }}
      >
        {/* Section background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,167,106,0.2), transparent)' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,167,106,0.15), transparent)' }}
          />
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
          {/* Section title */}
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: PREMIUM_EASE }}
          >
            <h2
              className="text-4xl md:text-6xl font-normal text-[#E8E3D1] mb-4"
              style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
            >
              历史人物
            </h2>
            <p
              className="text-sm text-[#E8E3D1]/40 tracking-[0.3em]"
              style={{ fontFamily: "'LXGW WenKai', serif" }}
            >
              选择一位历史人物，开始跨越时空的对话
            </p>
          </motion.div>

          {/* Filter tabs */}
          <motion.div
            className="flex justify-center mb-10 md:mb-14"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div
              className="flex gap-1 p-1 rounded-2xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,167,106,0.15)' }}
            >
              {FILTER_TABS.map((tab) => (
                <button
                  type="button"
                  key={tab.key}
                  onClick={() => {
                    setActiveFilter(tab.key as typeof activeFilter);
                    setSelectedChar(null);
                  }}
                  className="relative px-6 md:px-8 py-2.5 rounded-xl text-sm tracking-widest transition-all duration-300"
                  style={{
                    fontFamily: "'LXGW WenKai', serif",
                    color: activeFilter === tab.key ? '#E8E3D1' : 'rgba(232,227,209,0.4)',
                  }}
                >
                  {activeFilter === tab.key && (
                    <motion.div
                      layoutId="filter-bg"
                      className="absolute inset-0 rounded-xl"
                      style={{ backgroundColor: '#7F3222' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Characters grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredChars.map((char) => (
                <CharacterCard
                  key={char.id}
                  char={char}
                  onClick={() => handleCharClick(char)}
                  isActive={selectedChar?.id === char.id}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Character detail panel */}
          <div id="char-detail" className="mt-10 md:mt-14">
            <AnimatePresence mode="wait">
              {selectedChar && (
                <CharacterDetail
                  key={selectedChar.id}
                  char={selectedChar}
                  onClose={() => setSelectedChar(null)}
                  onWake={() => setOverlayChar(selectedChar)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ==================== INTERACTION MODES SECTION ==================== */}
      <section
        className="relative py-20 md:py-28"
        style={{ background: 'linear-gradient(180deg, #0a0603 0%, #120a05 100%)' }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 xl:px-12">
          {/* Section title */}
          <motion.div
            className="text-center mb-14 md:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: PREMIUM_EASE }}
          >
            <div
              className="text-xs text-[#D4A76A]/60 tracking-[0.5em] uppercase mb-4"
              style={{ fontFamily: "'LXGW WenKai', serif" }}
            >
              互动形式 · Interaction Modes
            </div>
            <h2
              className="text-4xl md:text-5xl font-normal text-[#E8E3D1] mb-4"
              style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
            >
              与历史对话
            </h2>
            <p
              className="text-sm text-[#E8E3D1]/40 tracking-[0.15em] max-w-lg mx-auto"
              style={{ fontFamily: "'LXGW WenKai', serif" }}
            >
              通过多种互动方式，感受古代文人武将的风采
            </p>
          </motion.div>

          {/* Interaction mode cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {[
              {
                icon: '吟',
                title: '诗词吟诵',
                subtitle: 'Poetry Recitation',
                desc: '聆听李白、杜甫、苏轼等文人亲口吟诵经典诗词，感受千年诗韵',
                color: '#D4A76A',
                chars: ['李白', '杜甫', '苏轼', '王维', '辛弃疾'],
              },
              {
                icon: '讲',
                title: '口播讲解',
                subtitle: 'Oral Narrative',
                desc: '以第一人称讲述历史事件、个人故事，让历史鲜活生动',
                color: '#8BAABB',
                chars: ['所有人物'],
              },
              {
                icon: '武',
                title: '武艺展示',
                subtitle: 'Martial Arts',
                desc: '观看岳飞、霍去病、花木兰等武将演示骑马射箭、刀法剑术',
                color: '#C84040',
                chars: ['岳飞', '霍去病', '花木兰', '关羽', '辛弃疾'],
              },
              {
                icon: '艺',
                title: '文艺创作',
                subtitle: 'Cultural Creation',
                desc: '欣赏数字人实时书法、绘画创作过程，感受传统艺术的魅力',
                color: '#7BA87B',
                chars: ['苏轼', '王维', '李清照'],
              },
            ].map((mode, i) => (
              <motion.div
                key={mode.title}
                className="relative p-6 md:p-8 rounded-2xl border overflow-hidden group cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                  borderColor: `${mode.color}25`,
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: PREMIUM_EASE }}
                whileHover={{ borderColor: `${mode.color}55`, y: -4 }}
              >
                {/* Background glow */}
                <div
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle, ${mode.color}15, transparent 70%)` }}
                />

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 text-2xl"
                  style={{
                    backgroundColor: `${mode.color}15`,
                    border: `1px solid ${mode.color}30`,
                    fontFamily: "'Ma Shan Zheng', cursive",
                    color: mode.color,
                  }}
                >
                  {mode.icon}
                </div>

                <h3
                  className="text-xl font-normal mb-1"
                  style={{ fontFamily: "'Ma Shan Zheng', cursive", color: '#E8E3D1' }}
                >
                  {mode.title}
                </h3>
                <div
                  className="text-xs mb-4 tracking-wider"
                  style={{ color: mode.color, fontFamily: "'LXGW WenKai', serif" }}
                >
                  {mode.subtitle}
                </div>
                <p
                  className="text-sm text-[#E8E3D1]/45 leading-relaxed mb-5"
                  style={{ fontFamily: "'LXGW WenKai', serif" }}
                >
                  {mode.desc}
                </p>

                {/* Applicable characters */}
                <div className="flex flex-wrap gap-1.5">
                  {mode.chars.map(c => (
                    <span
                      key={c}
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${mode.color}10`,
                        border: `1px solid ${mode.color}25`,
                        color: `${mode.color}80`,
                        fontFamily: "'LXGW WenKai', serif",
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TECH SECTION ==================== */}
      <section
        className="relative py-20 md:py-28 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #120a05 0%, #0a0603 100%)' }}
      >
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left: text */}
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: PREMIUM_EASE }}
            >
              <div
                className="text-xs text-[#D4A76A]/60 tracking-[0.5em] uppercase mb-5"
                style={{ fontFamily: "'LXGW WenKai', serif" }}
              >
                技术支撑 · Technology
              </div>
              <h2
                className="text-4xl md:text-5xl font-normal text-[#E8E3D1] mb-6 leading-tight"
                style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
              >
                AI驱动
                <br />
                <span style={{ color: '#D4A76A' }}>古今重生</span>
              </h2>
              <p
                className="text-base text-[#E8E3D1]/50 leading-relaxed mb-8"
                style={{ fontFamily: "'LXGW WenKai', serif" }}
              >
                融合大语言模型、数字人生成、3D动作捕捉等前沿AI技术，
                将历史文献中的人物形象转化为可交互的数字生命。
              </p>

              <div className="space-y-4">
                {[
                  { label: 'LLM·语言模型', desc: '基于历史文献训练，让数字人以当代语言讲古代故事', pct: 90 },
                  { label: '数字人生成', desc: '高保真3D数字人形象，忠实还原历史人物面貌风采', pct: 85 },
                  { label: '动作捕捉', desc: '骑马、射箭、书法等动作，精准还原历史场景', pct: 80 },
                ].map((tech, i) => (
                  <motion.div
                    key={tech.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span
                        className="text-sm text-[#E8E3D1]/70"
                        style={{ fontFamily: "'LXGW WenKai', serif" }}
                      >
                        {tech.label}
                      </span>
                      <span
                        className="text-xs text-[#D4A76A]/60"
                        style={{ fontFamily: "'LXGW WenKai', serif" }}
                      >
                        {tech.pct}%
                      </span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #7F3222, #D4A76A)' }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${tech.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 1, ease: PREMIUM_EASE }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: decorative character showcase */}
            <motion.div
              className="flex-1 flex justify-center"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: PREMIUM_EASE }}
            >
              <div
                className="relative w-72 h-96 rounded-3xl overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1a0e00, #2d1800)',
                  border: '1px solid rgba(212,167,106,0.25)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                }}
              >
                {/* Li Bai showcase */}
                <div className="absolute inset-0">
                  <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
                    <defs>
                      <filter id="tech-blur"><feGaussianBlur stdDeviation="30" /></filter>
                    </defs>
                    <ellipse cx="200" cy="260" rx="160" ry="200" fill="#D4A76A" opacity="0.12" filter="url(#tech-blur)" />
                    <ellipse cx="100" cy="150" rx="80" ry="100" fill="#D4A76A" opacity="0.07" filter="url(#tech-blur)" />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-[160px] leading-none select-none"
                    style={{ fontFamily: "'Ma Shan Zheng', cursive", color: '#D4A76A', opacity: 0.08 }}
                  >
                    仙
                  </span>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[80%]">
                  <LiteraryFigureSVG color="#D4A76A" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#1a0e00] to-transparent" />
                <div className="absolute bottom-5 left-0 right-0 text-center">
                  <div
                    className="text-2xl text-white font-normal mb-0.5"
                    style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
                  >
                    李白
                  </div>
                  <div
                    className="text-xs text-[#D4A76A]/70 tracking-widest"
                    style={{ fontFamily: "'LXGW WenKai', serif" }}
                  >
                    诗仙 · Tang Dynasty
                  </div>
                </div>
                {/* Pulsing ring */}
                <motion.div
                  className="absolute top-4 right-4 w-10 h-10 rounded-full border"
                  style={{ borderColor: 'rgba(212,167,106,0.4)' }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Static demo overlay — instant, zero AI */}
      <AnimatePresence>
        {overlayChar && (
          <DigitalHumanDemoOverlay
            characterId={overlayChar.id}
            onClose={() => setOverlayChar(null)}
            onGenerateVideo={() => setVideoOverlayChar(overlayChar)}
          />
        )}
      </AnimatePresence>

      {/* AI video generation overlay — Google Veo 3.1, with audio */}
      <AnimatePresence>
        {videoOverlayChar && (
          <DigitalHumanVideoOverlay
            characterId={videoOverlayChar.id}
            characterName={videoOverlayChar.name}
            characterTitle={videoOverlayChar.title}
            dynasty={videoOverlayChar.dynasty}
            quote={videoOverlayChar.quote}
            accentColor={videoOverlayChar.accentColor}
            bgGradient={videoOverlayChar.bgGradient}
            representChar={videoOverlayChar.representChar}
            onClose={() => setVideoOverlayChar(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
