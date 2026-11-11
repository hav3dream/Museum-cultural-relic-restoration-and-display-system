# Academic Papers & Models - Museum Platform

This document summarizes the academic papers and AI models featured in each restoration module of the Museum (博物馆文物修复与展示系统) platform.

---

## 1. Ancient Painting Restoration (古画修复)
**Page**: `AncientPaintingRestoration.tsx`

### Paper Information
- **Title**: SGRGAN: Sketch-Guided Restoration GAN for Chinese Landscape Painting
- **Authors**: 作者团队
- **Venue**: 学术会议/期刊
- **Year**: 2024

### Abstract
本文提出了一种基于线稿引导的生成对抗网络（SGRGAN），用于中国山水画的智能修复。该方法通过引入线稿作为结构引导信息，结合对抗训练策略，实现了对破损古画的高质量修复。

### Technical Details
- **Model**: SGRGAN
- **API Endpoint**: http://127.0.0.1:5002/inpaint
- **Input**: 原始图像 + Mask遮罩
- **Output**: 修复后的图像

---

## 2. Mural Restoration (壁画修复)
**Page**: `MuralRestoration.tsx`

### Paper Information
- **Title**: DCADif: Decoupled Conditional Adaptive Diffusion for Mural Restoration
- **Authors**: 作者团队
- **Venue**: 学术会议/期刊
- **Year**: 2024

### Abstract
本文提出了一种解耦条件自适应扩散模型（DCADif），专门用于壁画修复任务。通过将条件信息解耦为结构和纹理两部分，实现了对严重破损壁画的高保真修复。

### Technical Details
- **Model**: DCADif
- **API Endpoint**: http://127.0.0.1:5004/generate
- **Input**: 线稿图 + 破损壁画
- **Output**: 修复后的壁画

---

## 3. Outline Analysis (轮廓分析)
**Page**: `OutlineAnalysis.tsx`

### Paper Information
- **Title**: Relic2Contour: Semi-supervised Mural Contour Extraction
- **Authors**: 作者团队
- **Venue**: 学术会议/期刊
- **Year**: 2024

### Abstract
本文提出了一种半监督壁画轮廓提取方法（Relic2Contour），能够从古代壁画中自动提取清晰的轮廓线稿。该方法利用少量标注数据和大量未标注数据，实现了高精度的轮廓提取。

### Technical Details
- **Model**: Relic2Contour
- **API Endpoint**: http://127.0.0.1:5001/sketchify
- **Input**: 壁画图像
- **Output**: 轮廓线稿

---

## 4. Stele Restoration (碑刻修复)
**Page**: `SteleRestoration.tsx`

### Paper Information
- **Title**: SGRGAN: 碑刻拓片智能修复与增强
- **Authors**: 作者团队
- **Venue**: 学术会议/期刊
- **Year**: 2024

### Abstract
利用SGRGAN模型对碑刻拓片进行智能修复和增强处理，恢复因风化侵蚀而模糊不清的碑文内容。

### Technical Details
- **Model**: SGRGAN
- **API Endpoint**: http://127.0.0.1:5002/inpaint
- **Input**: 碑刻拓片图像
- **Output**: 修复后的碑刻图像

---

## 5. Calligraphy Generation (书法生成)
**Page**: `CalligraphyGeneration.tsx`

### Paper Information
- **Title**: SGRGAN: 基于生成对抗网络的书法风格迁移
- **Authors**: 作者团队
- **Venue**: 学术会议/期刊
- **Year**: 2024

### Abstract
利用SGRGAN模型实现书法风格的智能生成，支持楷书、行书、草书、隶书等多种书体的风格迁移和创作。

### Technical Details
- **Model**: SGRGAN
- **API Endpoint**: http://127.0.0.1:5002/inpaint
- **Input**: 文本内容 + 书法风格
- **Output**: 生成的书法作品

---

## Model Architecture Summary

### SGRGAN (Sketch-Guided Restoration GAN)
Used in:
- Ancient Painting Restoration
- Stele Restoration  
- Calligraphy Generation

Key Features:
- GAN-based architecture
- Sketch/structure guidance
- Suitable for restoration and style transfer tasks

### DCADif (Decoupled Conditional Adaptive Diffusion)
Used in:
- Mural Restoration

Key Features:
- Diffusion model architecture
- Decoupled structure and texture processing
- Designed for severely damaged artworks

### Relic2Contour
Used in:
- Outline Analysis

Key Features:
- Semi-supervised learning
- Contour extraction specialized
- Works with limited labeled data

---

## API Endpoints

| Service | Port | Endpoint | Purpose |
|---------|------|----------|---------|
| Relic2Contour | 5001 | /sketchify | Outline extraction |
| SGRGAN | 5002 | /inpaint | Restoration & generation |
| DCADif | 5004 | /generate | Mural restoration |

---

## Implementation Notes

All paper information is displayed in a collapsible section on each restoration page with:
- Full paper title
- Abstract in Chinese
- Model name
- API endpoint
- Input/output format specifications

The UI uses the Museum design system colors (brown, beige, gold) and includes smooth animations for expand/collapse interactions.
