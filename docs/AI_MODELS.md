# 博物馆文物修复与展示系统 - AI 模型接口文档

> 整理自接口存档，供后端开发对接使用。
> 所有模型均运行在本地 Python 服务上，部分需要指定 conda 环境。

---

## 一、虚拟复原

### 1. 古画修复 - SGRGAN（线稿引导山水画修复）

| 项目       | 说明                                                                 |
|----------|----------------------------------------------------------------------|
| 端口       | `5002`                                                               |
| 接口       | `POST http://127.0.0.1:5002/inpaint`                                |
| 请求类型   | `multipart/form-data`                                               |
| 请求字段   | `image`（破损图）、`mask`（mask 图，白色为待修复区域）              |
| 返回       | 图片二进制流（PNG）                                                  |
| 前端类型   | `ancient-painting`                                                   |
| 后端模型ID | `SGRGAN`                                                             |
| 联系人     | 李超                                                                 |

```bash
curl -X POST \
  -F "image=@input.jpg" \
  -F "mask=@mask.png" \
  http://127.0.0.1:5002/inpaint \
  --output result.png
```

---

### 2. 壁画修复 - DCADif（结构风格解耦）

| 项目       | 说明                                                                 |
|----------|----------------------------------------------------------------------|
| 端口       | `5004`                                                               |
| 接口       | `POST http://127.0.0.1:5004/generate`                               |
| 请求类型   | `multipart/form-data`                                               |
| 请求字段   | `sketch_image`（线稿图）、`merged_image`（破损图）                  |
| 返回       | 图片二进制流（PNG）                                                  |
| 前端类型   | `mural`                                                              |
| 后端模型ID | `DCADif`                                                             |
| 联系人     | 李超                                                                 |

```bash
curl -X POST \
  -F "sketch_image=@sketch.jpg" \
  -F "merged_image=@damaged.jpg" \
  http://127.0.0.1:5004/generate \
  --output result.png
```

---

### 3. 壁画修复 - M3SFormer（语义风格修复）

| 项目       | 说明                                                                 |
|----------|----------------------------------------------------------------------|
| 主机       | `127.0.0.1`（注意：非 localhost）                                  |
| 端口       | `25565`                                                              |
| 接口       | `POST http://127.0.0.1:25565/api/inpaint`                         |
| 请求类型   | `multipart/form-data`                                               |
| 请求字段   | `image`（破损图）、`mask`（mask 图）                                |
| 返回       | 图片二进制流（PNG）                                                  |
| 前端类型   | `mural-semantic`                                                     |
| 后端模型ID | `M3SFormer`                                                          |
| conda 环境 | `M3SFormer`                                                          |
| 后端脚本   | `G:\models\gqf\server\app_new.py`                                   |

```bash
curl -X POST \
  -F "image=@input.png" \
  -F "mask=@mask.png" \
  http://127.0.0.1:25565/api/inpaint \
  --output result.png
```

---

### 4. 书法生成 - LUO-Calli

| 项目       | 说明                                                                 |
|----------|----------------------------------------------------------------------|
| 端口       | `5003`                                                               |
| 接口       | `POST http://127.0.0.1:5003/generate_poem_zip`                      |
| 请求类型   | `application/json`                                                  |
| 请求字段   | `poem`（诗文文本）、`style_wid`（风格编号）                         |
| 返回       | ZIP 文件（包含每字单独的 PNG 图片）                                 |
| 前端类型   | `calligraphy`                                                        |
| 后端模型ID | `LuoCalli`                                                           |
| 路由       | `POST /api/restoration/calligraphy`（专用路由，非通用图像路由）      |
| conda 环境 | `One-DM`                                                             |
| 后端脚本   | `G:\models\wmx\LUO-Calli\app.py`                                    |

风格编号说明：
| 编号 | 书法家   |
|------|--------|
| `02` | 管峻   |
| `03` | 弘一   |
| `04` | 柳公权 |
| `08` | 欧阳修 |
| `09` | 宋徽宗 |
| `10` | 颜真卿 |

```bash
curl -X POST http://localhost:5003/generate_poem_zip \
  -H "Content-Type: application/json" \
  -d '{"poem": "床前明月光", "style_wid": "08"}' \
  --output calligraphy.zip
```

---

### 5. 轮廓解析 - Relic2Contour

| 项目       | 说明                                                                 |
|----------|----------------------------------------------------------------------|
| 主机       | `127.0.0.1`（注意：非 localhost）                                  |
| 端口       | `5001`                                                               |
| 接口       | `POST http://127.0.0.1:5001/sketchify`                            |
| 请求类型   | `multipart/form-data`                                               |
| 请求字段   | `image`（壁画/文物图像）                                            |
| 返回       | 图片二进制流（线稿 PNG）                                             |
| 前端类型   | `outline`                                                            |
| 后端模型ID | `Relic2Contour`                                                      |
| 联系人     | 李超                                                                 |

```bash
curl -X POST \
  -F "image=@input.png" \
  http://127.0.0.1:5001/sketchify \
  -o result.png
```

---

### 6. 语义分割 - YOLOv8Seg

| 项目       | 说明                                                                 |
|----------|----------------------------------------------------------------------|
| 端口       | `5005`                                                               |
| 接口       | `POST http://127.0.0.1:5005/predict-seg`                            |
| 请求类型   | `multipart/form-data`                                               |
| 请求字段   | `file`（图像文件）                                                   |
| 返回       | 图片二进制流（分割结果 JPG）                                         |
| 前端类型   | `semantic-segmentation`                                              |
| 后端模型ID | `YOLOv8Seg`                                                          |
| conda 环境 | `yolov8seg`                                                          |
| 后端脚本   | `G:\models\bzy\segment\app.py`                                      |

```bash
curl -X POST \
  -F "file=@input.jpg" \
  http://127.0.0.1:5005/predict-seg \
  --output result.jpg
```

---

### 7. 超分重建 - ConvSRGAN

| 项目       | 说明                                                                 |
|----------|----------------------------------------------------------------------|
| 端口       | `5006`                                                               |
| 接口       | `POST http://127.0.0.1:5006/enhance`                                |
| 请求类型   | `multipart/form-data`                                               |
| 请求字段   | `image`（低分辨率图像）、`outscale`（放大倍数，如 `4`）            |
| 返回       | 图片二进制流（高清 PNG）                                             |
| 前端类型   | `super-resolution`                                                   |
| 后端模型ID | `ConvSRGAN`                                                          |
| conda 环境 | `convsrgan`                                                          |
| 后端脚本   | `G:\models\LTF\ConvSRGAN\app.py`                                    |

```bash
curl -X POST \
  -F "image=@input.jpg" \
  -F "outscale=4" \
  http://127.0.0.1:5006/enhance \
  --output enhanced.png
```

---

## 二、智绘生成

### 8. 风格迁移 - CE-CycleGAN

| 项目       | 说明                                                                 |
|----------|----------------------------------------------------------------------|
| 端口       | `5007`                                                               |
| 接口       | `POST http://127.0.0.1:5007/translate`                              |
| 请求类型   | `multipart/form-data`                                               |
| 请求字段   | `image`（真实照片）                                                  |
| 返回       | 图片二进制流（风格化 PNG）                                           |
| 前端类型   | `style-transfer`                                                     |
| 后端模型ID | `CECycleGAN`                                                         |
| conda 环境 | `pytorch-CycleGAN-and-pix2pix`                                      |
| 后端脚本   | `G:\models\syx\CE-CycleGAN\app.py`                                  |

```bash
curl -X POST \
  -F "image=@photo.jpg" \
  http://localhost:5007/translate \
  --output output.png
```

---

### 9. 线稿上色 - SGCGAN

| 项目       | 说明                                                                 |
|----------|----------------------------------------------------------------------|
| 端口       | `5008`                                                               |
| 接口       | `POST http://127.0.0.1:5008/stylize`                                |
| 请求类型   | `multipart/form-data`                                               |
| 请求字段   | `content`（线稿图）、`style`（风格参考图）                          |
| 返回       | 图片二进制流（上色结果 PNG）                                         |
| 前端类型   | `pattern-generation`                                                 |
| 后端模型ID | `SGCGAN`                                                             |
| conda 环境 | `SGCGAN`                                                             |
| 后端脚本   | `G:\models\syx\SGCGAN\app.py`                                       |

> **注意**：前端需要两个文件上传区域。`content` 通过主 `file` 字段传递，`style` 通过 `mask` 字段传递。

```bash
curl -X POST \
  -F "content=@sketch.jpg" \
  -F "style=@style_ref.png" \
  http://localhost:5008/stylize \
  --output result.png
```

---

### 10. FHS-adapter（文本引导山水画生成）

| 项目       | 说明                                                                 |
|----------|----------------------------------------------------------------------|
| 端口       | `5009`                                                               |
| 接口       | `POST http://127.0.0.1:5009/generate-fhs`                           |
| 请求类型   | `application/json`                                                  |
| 请求字段   | `prompt1`（历史背景）、`prompt2`（画面内容）、`prompt3`（意境情绪）、`prompt4`（诗句）|
| 返回       | 图片二进制流（PNG）                                                  |
| 后端模型ID | `FHSAdapter`                                                         |
| conda 环境 | `fhs`                                                                |
| 后端脚本   | `G:\models\ffq\fhs-adapter\app.py`                                  |

```bash
curl -X POST http://127.0.0.1:5009/generate-fhs \
  -H "Content-Type: application/json" \
  -d '{
    "prompt1": "历史背景描述",
    "prompt2": "画面内容描述",
    "prompt3": "意境/情绪描述",
    "prompt4": "诗句"
  }' \
  --output generated.png
```

---

### 11. CalliPaint（融入书法的山水画生成）

| 项目       | 说明                                                                 |
|----------|----------------------------------------------------------------------|
| 端口       | `5010`                                                               |
| 接口       | `POST http://localhost:5010/generate-callipaint`                    |
| 请求类型   | `application/json`                                                  |
| 请求字段   | 见下方说明                                                           |
| 返回       | 图片二进制流（PNG）                                                  |
| 后端模型ID | `CalliPaint`                                                         |
| conda 环境 | `callipaint`                                                         |
| 后端脚本   | `G:\models\ZZY\CalliPaint\CalliPaint\app.py`                        |

请求字段说明：

| 字段            | 类型             | 说明                                        |
|---------------|----------------|-------------------------------------------|
| `texts`       | `string[]`     | 诗文数组，如 `["孤舟蓑笠翁"]`                |
| `polygons`    | `number[][][]` | 每个文字的边框坐标（左上、右上、左下、右下）   |
| `full_prompt` | `string`       | 全景描述                                    |
| `element_prompt` | `string`    | 物象描述                                    |
| `mood_prompt` | `string`       | 氛围描述                                    |
| `style_prompt` | `string`      | 画风描述                                    |

```bash
curl -X POST http://localhost:5010/generate-callipaint \
  -H "Content-Type: application/json" \
  -d '{
    "texts": ["孤舟蓑笠翁"],
    "polygons": [[[30,100],[90,100],[90,470],[30,470]]],
    "full_prompt": "A traditional Chinese landscape painting...",
    "element_prompt": "Lone fisherman, straw raincoat...",
    "mood_prompt": "Solitary, peaceful, contemplative...",
    "style_prompt": "Traditional Chinese ink wash painting..."
  }' \
  --output generated.png
```

---

### 12. FDA-Chi（多模态驱动中国画生成）

| 项目       | 说明                                                                 |
|----------|----------------------------------------------------------------------|
| 端口       | `5011`                                                               |
| 接口       | `POST http://localhost:5011/generate`                               |
| 请求类型   | `multipart/form-data`                                               |
| 请求字段   | `prompt1`~`prompt4`（文本）、`image`（引导图像）                    |
| 返回       | 图片二进制流（PNG）                                                  |
| 后端模型ID | `FDAChi`                                                             |
| conda 环境 | `fhs`                                                                |
| 后端脚本   | `G:\models\ffq\fda-chi\app.py`                                      |

| 字段      | 说明     |
|---------|--------|
| `prompt1` | 历史背景 |
| `prompt2` | 内容描述 |
| `prompt3` | 情绪表达 |
| `prompt4` | 诗句     |
| `image`   | 引导图像 |

```bash
curl -X POST http://localhost:5011/generate \
  -F "prompt1=历史背景" \
  -F "prompt2=内容描述" \
  -F "prompt3=情绪表达" \
  -F "prompt4=诗句" \
  -F "image=@guide.jpg" \
  --output result.png
```

---

## 三、活化利用

### 13. 图像外推 - CLPOTR

| 项目       | 说明                                                                 |
|----------|----------------------------------------------------------------------|
| 端口       | `5012`                                                               |
| 接口       | `POST http://localhost:5012/predict`                                |
| 请求类型   | `multipart/form-data`                                               |
| 请求字段   | `image`（输入图像）                                                  |
| 返回       | 图片二进制流（PNG）                                                  |
| 后端模型ID | `CLPOTR`                                                             |
| conda 环境 | `clpotr`                                                             |
| 后端脚本   | `G:\models\LTF\CLPOTR\app.py`                                       |

> 建议从 `G:\models\LTF\CLPOTR\test0911` 目录中选取测试图像。

```bash
curl -X POST \
  -F "image=@input.jpg" \
  http://localhost:5012/predict \
  --output result.png
```

---

## 四、后端对接映射总表

| 前端 `type` 值        | 模型 ID       | 端口    | 接口路径          | 主要字段                      |
|---------------------|-------------|-------|-----------------|---------------------------|
| `ancient-painting`  | SGRGAN       | 5002  | `/inpaint`       | `image` + `mask`          |
| `mural`             | DCADif       | 5004  | `/generate`      | `sketch_image` + `merged_image` |
| `mural-semantic`    | M3SFormer    | 25565 | `/api/inpaint`   | `image` + `mask`          |
| `calligraphy`       | LuoCalli     | 5003  | `/generate_poem_zip` | JSON: `poem` + `style_wid` |
| `outline`           | Relic2Contour | 5001 | `/sketchify`     | `image`                   |
| `stele`             | SGRGAN       | 5002  | `/inpaint`       | `image` + `mask`          |
| `semantic-segmentation` | YOLOv8Seg | 5005 | `/predict-seg`  | `file`                    |
| `super-resolution`  | ConvSRGAN    | 5006  | `/enhance`       | `image` + `outscale`      |
| `style-transfer`    | CECycleGAN   | 5007  | `/translate`     | `image`                   |
| `pattern-generation` | SGCGAN      | 5008  | `/stylize`       | `content` + `style`       |

---

## 五、注意事项

1. **M3SFormer 和 Relic2Contour 运行在 `127.0.0.1`**（内网服务器），不是 localhost。
2. **LUO-Calli** 返回的是 ZIP 文件，路由单独处理（`POST /api/restoration/calligraphy`）。
3. **SGCGAN（线稿上色）** 需要两张图，后端用 `file`（content）和 `mask`（style）字段区分。
4. **ConvSRGAN** 需要额外的文本参数 `outscale`（默认 `4`），通过 `multipart/form-data` 一起发送。
5. **FHS-adapter、CalliPaint** 使用 JSON body，不上传文件。
6. **FDA-Chi** 使用 `multipart/form-data`，同时包含文本字段和图像文件。
7. **Demo 模式（当前展示）**：`ancient-painting`、`mural`、`mural-semantic`、`stele`、`outline`、`calligraphy`、`style-transfer`、`clpotr` 在后端不再调用外部 AI，优先返回 `./uploads/results`（兼容 `./upload/results`）中的预置结果图；图像类任务目录为空时回退返回本次上传原图，`calligraphy` 为纯文本任务，需确保目录中存在预置结果图。
