import React from "react";
import ArtCard from "./ArtCard";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { galleries } from "@shared/galleries";
import { InkBrushStroke } from "@/components/decorative";

const artworks = [
    [{
        id: 1,
        title: "碑刻书法",
        description: "",
        imageUrl: "/images/left_1.png",
        position: "left"
    }, {
        id: 6,
        title: "碑刻书法",
        description: "",
        imageUrl: "/images/left_2.png",
        position: "left"
    }],
    [{
        id: 2,
        title: "国画",
        description: "",
        imageUrl: "/images/guohua_1.png",
        position: "center"
    }, {
        id: 7,
        title: "国画",
        description: "",
        imageUrl: "/images/guohua_2.png",
        position: "center"
    }],
    [{
        id: 3,
        title: "壁画",
        description: "",
        imageUrl: "/images/bihua-76.jpg",
        position: "middle"
    }, {
        id: 8,
        title: "壁画",
        description: "",
        imageUrl: "/images/bihua-30.jpg",
        position: "middle"
    }],
    [{
        id: 4,
        title: "青铜",
        description: "",
        imageUrl: "/images/qingtong-1.jpeg",
        position: "center"
    }, {
        id: 9,
        title: "青铜",
        description: "",
        imageUrl: "/images/qingtong-2.jpeg",
        position: "center"
    }],
    [{
        id: 5,
        title: "剪纸",
        description: "",
        imageUrl: "/images/jianzhi-1.jpg",
        position: "right"
    }, {
        id: 10,
        title: "剪纸",
        description: "",
        imageUrl: "/images/jianzhi-11.jpg",
        position: "right"
    }]
];

const categoryByGroupIndex = [
    "beike-shufa",
    "guohua",
    "bihua",
    "qingtong",
    "jianzhi",
] as const;

const PREMIUM_EASE = [0.5, 0, 0.3, 1] as const;

const ArtGallery: React.FC = () => {
    const [, navigate] = useLocation();

    return (
        <div className="px-5 sm:px-8 lg:px-12 xl:px-16 py-16 lg:py-24 max-w-[1400px] mx-auto">
            {/* Section Header */}
            <motion.div
                className="text-center mb-14 lg:mb-20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, ease: PREMIUM_EASE }}
            >
                <h2
                    className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-[#3d3027] tracking-[0.06em] mb-5"
                    style={{ fontFamily: "'Ma Shan Zheng', 'LXGW WenKai', cursive" }}
                >
                    艺术瑰宝
                </h2>
                <div className="flex justify-center mb-5">
                    <InkBrushStroke
                        width={80}
                        color="#7F3222"
                        variant="divider"
                        duration={1.5}
                        delay={0.3}
                    />
                </div>
                <p
                    className="text-base md:text-lg text-[#7F3222]/50 tracking-[0.15em]"
                    style={{ fontFamily: "'LXGW WenKai', 'Noto Sans SC', sans-serif" }}
                >
                    五大门类，千年传承
                </p>
            </motion.div>

            {/* Asymmetric layout - 博物馆 "镇馆之宝" inspired */}
            {/* Hero row: 1 large + 2 stacked */}
            <div className="flex flex-col lg:flex-row gap-5 md:gap-6 lg:gap-8 mb-5 md:mb-6 lg:mb-8">
                {/* Large hero card */}
                <motion.div
                    className="w-full lg:w-[58%] cursor-pointer"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.7, ease: PREMIUM_EASE }}
                    whileHover={{ y: -6, transition: { duration: 0.4, ease: PREMIUM_EASE } }}
                    onClick={() => navigate(`/gallery/${categoryByGroupIndex[1]}`)}
                >
                    <div className="relative h-[320px] md:h-[420px] lg:h-[500px] rounded-[20px] overflow-hidden group">
                        <ArtCard artworks={artworks[1]} count={galleries[categoryByGroupIndex[1]]?.length || 0} />
                    </div>
                    <p className="mt-3 text-[#7F3222] text-lg font-medium tracking-wide" style={{ fontFamily: "'LXGW WenKai', serif" }}>
                        国画 <span className="text-[#7F3222]/40 text-sm ml-2">{galleries[categoryByGroupIndex[1]]?.length || 0} 件</span>
                    </p>
                </motion.div>

                {/* Two stacked cards */}
                <div className="w-full lg:w-[42%] flex flex-row lg:flex-col gap-5 md:gap-6 lg:gap-8">
                    {[0, 2].map((idx, i) => {
                        const category = categoryByGroupIndex[idx];
                        const imageCount = galleries[category]?.length || 0;
                        return (
                            <motion.div
                                key={category}
                                className="flex-1 cursor-pointer"
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: PREMIUM_EASE }}
                                whileHover={{ y: -6, transition: { duration: 0.4, ease: PREMIUM_EASE } }}
                                onClick={() => navigate(`/gallery/${category}`)}
                            >
                                <div className="relative h-[200px] md:h-[200px] lg:h-[234px] rounded-[16px] overflow-hidden group">
                                    <ArtCard artworks={artworks[idx]} count={imageCount} />
                                </div>
                                <p className="mt-3 text-[#7F3222] text-base font-medium tracking-wide" style={{ fontFamily: "'LXGW WenKai', serif" }}>
                                    {artworks[idx][0].title} <span className="text-[#7F3222]/40 text-sm ml-2">{imageCount} 件</span>
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom row: 2 equal cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 lg:gap-8">
                {[3, 4].map((idx, i) => {
                    const category = categoryByGroupIndex[idx];
                    const imageCount = galleries[category]?.length || 0;
                    return (
                        <motion.div
                            key={category}
                            className="cursor-pointer"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.7, delay: 0.2 + i * 0.08, ease: PREMIUM_EASE }}
                            whileHover={{ y: -6, transition: { duration: 0.4, ease: PREMIUM_EASE } }}
                            onClick={() => navigate(`/gallery/${category}`)}
                        >
                            <div className="relative h-[220px] md:h-[280px] rounded-[16px] overflow-hidden group">
                                <ArtCard artworks={artworks[idx]} count={imageCount} />
                            </div>
                            <p className="mt-3 text-[#7F3222] text-base font-medium tracking-wide" style={{ fontFamily: "'LXGW WenKai', serif" }}>
                                {artworks[idx][0].title} <span className="text-[#7F3222]/40 text-sm ml-2">{imageCount} 件</span>
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default ArtGallery;
