import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { useLocation } from 'wouter';
import { SealStamp } from '@/components/decorative';

// Import distinct images for each of the 10 paintings
import img1 from '@/assets/2675-1190.webp';
import img2 from '@/assets/2675-1200.webp';
import img3 from '@/assets/2675-1206.webp';
import img4 from '@/assets/2637-77.webp';
import img5 from '@/assets/2637-78.webp';
import img6 from '@/assets/2637-79.webp';
import img7 from '@/assets/2661-575.webp';
import img8 from '@/assets/2661-577.webp';
import img9 from '@/assets/2549-496.webp';
import img10 from '@/assets/2549-497.webp';

function MasterpiecesScroll() {
    const targetRef = useRef<HTMLDivElement>(null);
    const [, navigate] = useLocation();
    const { scrollYProgress } = useScroll({
        target: targetRef,
    });

    // Transform vertical scroll to horizontal movement
    // Adjust the range based on the number of items
    const xRaw = useTransform(scrollYProgress, [0, 1], ['0%', '-85%']);

    // Add spring physics for smoother movement
    const x = useSpring(xRaw, {
        stiffness: 100,
        damping: 30,
        mass: 0.5
    });

    const masterpieces = [
        {
            title: '千里江山图',
            artist: '王希孟',
            era: '北宋',
            desc: '绘于1113年，是18岁天才画家王希孟的唯一传世作品。全卷以青绿重彩描绘山河壮丽景色，构图宏大，气势磅礴，是中国青绿山水画的巅峰之作。',
            dimensions: '纵51.5cm 横1191.5cm',
            material: '绢本设色',
            collection: '北京故宫博物院',
            img: img1
        },
        {
            title: '清明上河图',
            artist: '张择端',
            era: '北宋',
            desc: '创作于12世纪初，是中国绘画史上最著名的作品之一。以全景式构图生动记录了北宋都城汴京（今河南开封）的城市面貌和各阶层人民的生活状况。',
            dimensions: '纵24.8cm 横528.7cm',
            material: '绢本设色',
            collection: '北京故宫博物院',
            img: img2
        },
        {
            title: '富春山居图',
            artist: '黄公望',
            era: '元代',
            desc: '元代画家黄公望为无用师所绘，历时数年完成。画面表现富春江两岸的秋季景色，笔墨简淡，意境深远，被誉为"画中之兰亭"。后因火烧成两段，分藏海峡两岸。',
            dimensions: '纵33cm 横636.9cm',
            material: '纸本水墨',
            collection: '台北故宫博物院、浙江省博物馆',
            img: img3
        },
        {
            title: '汉宫春晓图',
            artist: '仇英',
            era: '明代',
            desc: '明代画家仇英的工笔重彩杰作，描绘了汉代宫廷嫔妃的生活场景。画卷中人物众多，宫殿楼阁富丽堂皇，展现了画家高超的人物画技法和对古典建筑的精准描绘。',
            dimensions: '纵30.6cm 横574.1cm',
            material: '绢本设色',
            collection: '台北故宫博物院',
            img: img4
        },
        {
            title: '百骏图',
            artist: '郎世宁',
            era: '清代',
            desc: '意大利传教士画家郎世宁在清宫所绘，融合中西画法。画中描绘了百匹骏马在草原和河流边自由奔驰、憩息的场景，骏马神态各异，姿态生动。',
            dimensions: '纵94.5cm 横776.2cm',
            material: '绢本设色',
            collection: '台北故宫博物院',
            img: img5
        },
        {
            title: '步辇图',
            artist: '阎立本',
            era: '唐代',
            desc: '唐代画家阎立本所绘，描绘了唐太宗李世民接见吐蕃使臣禄东赞的情景。作为现存最早的历史画卷，它见证了汉藏友好交流的历史，具有重要的历史和艺术价值。',
            dimensions: '纵38.5cm 横129.6cm',
            material: '绢本设色',
            collection: '北京故宫博物院',
            img: img6
        },
        {
            title: '唐宫仕女图',
            artist: '张萱/周昉',
            era: '唐代',
            desc: '包括《虢国夫人游春图》《捣练图》《簪花仕女图》等多幅作品的统称。这些画作以精湛的技法展现了唐代贵族妇女雍容华贵的气质和悠闲的生活情态，是研究唐代社会风俗的重要资料。',
            dimensions: '各卷尺寸不同',
            material: '绢本设色',
            collection: '北京故宫博物院、辽宁省博物馆',
            img: img7
        },
        {
            title: '五牛图',
            artist: '韩滉',
            era: '唐代',
            desc: '唐代宰相韩滉所绘，是现存最古老的纸本中国画。画中五头黄牛形态各异，或俯首、或昂头、或行走、或回顾，刻画生动传神，体现了画家对农耕文化的深厚情感和对牛的细致观察。',
            dimensions: '纵20.8cm 横139.8cm',
            material: '纸本设色',
            collection: '北京故宫博物院',
            img: img8
        },
        {
            title: '韩熙载夜宴图',
            artist: '顾闳中',
            era: '五代',
            desc: '五代十国时期南唐画家顾闳中所绘，描绘了南唐大臣韩熙载家中夜宴宾客的场景。画卷采用连环画式构图，分为五段，以工笔重彩展现人物的神态举止，是研究唐五代绘画艺术和社会生活的珍贵资料。',
            dimensions: '纵28.7cm 横335.5cm',
            material: '绢本设色',
            collection: '北京故宫博物院',
            img: img9
        },
        {
            title: '洛神赋图',
            artist: '顾恺之',
            era: '东晋',
            desc: '东晋画家顾恺之根据曹植的名篇《洛神赋》创作而成。画卷以连续性的构图描绘了曹植与洛水女神相遇相恋的故事，人物线条流畅，意境飘逸，体现了"以形写神"的艺术理念，是中国绘画史上的艺术瑰宝。',
            dimensions: '纵27.1cm 横572.8cm',
            material: '绢本设色',
            collection: '北京故宫博物院、辽宁省博物馆',
            img: img10
        },
    ];

    return (
        <section ref={targetRef} className="relative h-[400vh] bg-[#1a1613]">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">

                {/* Progress Bar */}
                <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-[#D4A76A]"
                    style={{ width: useTransform(scrollYProgress, [0, 1], ['0%', '100%']) }}
                />

                {/* Section Title */}
                <div className="absolute top-12 left-12 z-20">
                    <h2 className="text-4xl md:text-[60px] font-normal text-[#E8E3D1] mb-2" style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}>
                        传世名画
                    </h2>
                    <div className="w-20 h-1 bg-[#7F3222] mb-4"></div>
                    <p className="text-[#7F3222] text-xl max-w-md">
                        中国美术史上的十座丰碑，跨越千年的艺术对话
                    </p>
                </div>

                {/* Horizontal Scroll Container */}
                <motion.div style={{ x }} className="flex gap-12 pl-[5vw] items-center">

                    {/* Intro Card */}
                    <div className="w-[30vw] min-w-[400px] h-[70vh] flex flex-col justify-center shrink-0 px-12">
                        <div className="text-[#7F3222]/60 text-lg mb-4">SCROLL TO EXPLORE</div>
                        <ArrowRight className="w-12 h-12 text-[#E8E3D1] animate-bounce" />
                    </div>

                    {masterpieces.map((item, index) => (
                            <motion.div
                                key={index}
                                className="group relative h-[70vh] w-[50vw] min-w-[600px] shrink-0 overflow-hidden rounded-[4px] bg-[#2c241b] shadow-2xl border border-[#7F3222]/20 transition-all duration-500 hover:scale-[1.02]"
                            >
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                                />

                                {/* Overlay Content */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-10 flex flex-col justify-end">
                                    <div className="flex justify-between items-end pb-6 mb-6 relative">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-200px" }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <h3 className="text-[#E8E3D1] text-[40px] font-bold mb-2" style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}>
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center gap-4 text-[#7F3222]">
                                                <span className="text-xl">{item.era}</span>
                                                <span className="w-1 h-1 rounded-full bg-[#7F3222]"></span>
                                                <span className="text-xl">{item.artist}</span>
                                            </div>
                                        </motion.div>
                                        <div className="text-[#D4A76A]/60 text-[60px] font-bold leading-none" style={{ fontFamily: "'Ma Shan Zheng', cursive" }}>
                                            {(index + 1).toString().padStart(2, '0')}
                                        </div>
                                        {/* Horizontal line */}
                                        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#7F3222]/30"></div>
                                    </div>

                                    <motion.div
                                        className="space-y-4"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-200px" }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <p className="text-white/80 text-lg font-light" style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}>
                                            {item.desc}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm text-[#7F3222]">
                                            <div><span className="text-white/60">尺寸：</span>{item.dimensions}</div>
                                            <div><span className="text-white/60">材质：</span>{item.material}</div>
                                        </div>
                                        <div className="text-sm text-[#7F3222]">
                                            <span className="text-white/60">收藏：</span>{item.collection}
                                        </div>
                                        <button
                                            onClick={() => navigate('/gallery/masterpieces')}
                                            className="w-14 h-14 rounded-full bg-[#7F3222]/20 border border-[#7F3222]/50 flex items-center justify-center hover:bg-[#7F3222] hover:text-[#E8E3D1] transition-all duration-300 group/btn mt-4"
                                        >
                                            <ExternalLink className="w-6 h-6 text-[#E8E3D1] group-hover/btn:scale-110 transition-transform" />
                                        </button>
                                    </motion.div>
                                </div>
                            </motion.div>
                    ))}

                    {/* End Card */}
                    <div className="w-[30vw] min-w-[400px] h-[70vh] flex flex-col justify-center items-center shrink-0 relative">
                        <motion.h3
                            className="text-[#E8E3D1] text-3xl mb-8"
                            style={{ fontFamily: "'LXGW WenKai', 'Noto Serif SC', serif" }}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {"探索更多艺术瑰宝".split("").map((char, i) => (
                                <motion.span
                                    key={i}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </motion.h3>
                        <motion.button
                            onClick={() => navigate('/gallery/masterpieces')}
                            className="relative px-8 py-3 bg-[#7F3222] text-[#E8E3D1] rounded-full text-lg hover:bg-[#7a6250] transition-colors"
                            whileHover="hover"
                        >
                            <motion.span
                                className="absolute inset-0 rounded-full border-2 border-[#D4A76A]"
                                variants={{
                                    hover: {
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0, 0]
                                    }
                                }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                            进入数字展厅
                        </motion.button>
                        <div className="absolute -bottom-12 right-8">
                            <SealStamp size={64} />
                        </div>
                    </div>

                </motion.div>
            </div>
        </section>
    );
}

export default React.memo(MasterpiecesScroll);
