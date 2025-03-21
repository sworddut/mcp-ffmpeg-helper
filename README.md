# MCP FFmpeg Helper

一个基于 Model Context Protocol (MCP) 的 FFmpeg 辅助工具，提供视频处理功能。

## 功能概述

MCP FFmpeg Helper 是一个轻量级服务器，它通过 MCP 协议将 FFmpeg 的强大功能暴露给 AI 助手。它支持以下视频处理操作：

- 获取视频文件详细信息
- 转换视频格式
- 从视频中提取音频
- 从图像序列创建视频
- 裁剪视频
- 为视频添加水印

## 安装与配置

### 前提条件

- Node.js (v14+)
- FFmpeg (需要安装在系统中并可通过命令行访问)
  [FFmpeg 官方下载页面](https://ffmpeg.org/download.html) 获取
  可以使用
  ```bash
  ffmpeg -version
  ```
  检查是否安装成功

### 安装步骤

1. 克隆或下载此仓库
2. 安装依赖：
   ```bash
   npm install
   ```
3. 构建项目：
   ```bash
   npm run build
   ```

### 配置 MCP

要在 Windsurf 或其他支持 MCP 的应用程序中使用此工具，请将以下配置添加到 MCP 配置文件中：
1.本地配置node服务器

windows:
```json
{
  "mcp-ffmpeg-helper": {
    "command": "cmd",
    "args": [
      "/c",
      "node",
      "路径/到/mcp-ffmpeg-helper/build/index.js"
    ]
  }
}
```

对于 Windows 用户，配置文件通常位于：`%APPDATA%/.codeium/windsurf/mcp_config.json`

macos:
```json
{
  "mcp-ffmpeg-helper": {
    "command": "node",
    "args": [
      "路径/到/mcp-ffmpeg-helper/build/index.js"
    ]
  }
}
```

2.使用npm包的方式配置mcp服务器（推荐使用,不需要手动构建node服务器，不用克隆仓库到本地）

windows:
```json
{
  "mcp-ffmpeg-helper": {
    "command": "cmd",
    "args": [
      "/c",
      "npx",
      "@sworddut/mcp-ffmpeg-helper"
    ]
  }
}
```

macos:
```json
{
  "mcp-ffmpeg-helper": {
    "command": "npx",
    "args": [
      "@sworddut/mcp-ffmpeg-helper"
    ]
  }
}
```

## 使用示例

### 获取视频信息
直接在windsurf控制台输入：
请帮我查看"path/to/video.mp4"视频信息

### 转换视频
直接在windsurf控制台输入：
请帮我将"path/to/input.avi"转换为"path/to/output.mp4"

### 提取音频
直接在windsurf控制台输入：
请帮我从"path/to/video.mp4"提取音频到"path/to/audio.mp3"

### 从图像创建视频
直接在windsurf控制台输入：
请帮我从"path/to/images/%05d.jpg"创建视频到"path/to/output.mp4"

### 裁剪视频
直接在windsurf控制台输入：
请帮我裁剪"path/to/input.mp4"到"path/to/output.mp4"，从00:00:00开始，到00:01:00结束

### 添加水印
直接在windsurf控制台输入：
请帮我为"path/to/input.mp4"添加水印到"path/to/output.mp4"，使用"path/to/watermark.png"作为水印，位置在[右下角/左上角/中心等]，透明度[0-1之间的值]

## 可用工具

### 1. 获取视频信息 (get_video_info)

获取视频文件的详细信息，包括格式、编解码器、分辨率、帧率等。

**参数：**
- `filePath`: 视频文件路径

**示例：**
```javascript
get_video_info({
  filePath: "path/to/video.mp4"
})
```

### 2. 转换视频 (convert_video)

将视频转换为不同格式或应用特定编码选项。

**参数：**
- `inputPath`: 输入视频文件路径
- `outputPath`: 输出视频文件路径
- `options`: 附加的 FFmpeg 选项（可选）

**示例：**
```javascript
convert_video({
  inputPath: "path/to/input.avi",
  outputPath: "path/to/output.mp4",
  options: "-c:v libx264 -crf 23 -preset medium"
})
```

### 3. 提取音频 (extract_audio)

从视频文件中提取音频轨道。

**参数：**
- `inputPath`: 输入视频文件路径
- `outputPath`: 输出音频文件路径
- `format`: 音频格式（如 mp3, aac 等）

**示例：**
```javascript
extract_audio({
  inputPath: "path/to/video.mp4",
  outputPath: "path/to/audio.mp3",
  format: "mp3"
})
```

### 4. 从图像创建视频 (create_video_from_images)

从图像序列创建视频文件。

**参数：**
- `inputPattern`: 输入图像模式（如 'img%03d.jpg' 或 'folder/*.png'）
- `outputPath`: 输出视频文件路径
- `framerate`: 帧率（默认：25）
- `codec`: 视频编解码器（默认：libx264）
- `pixelFormat`: 像素格式（默认：yuv420p）
- `extraOptions`: 附加的 FFmpeg 选项（可选）

**示例：**
```javascript
create_video_from_images({
  inputPattern: "images/%05d.jpg",
  outputPath: "output.mp4",
  framerate: 30,
  codec: "libx264",
  pixelFormat: "yuv420p"
})
```

### 5. 裁剪视频 (trim_video)

将视频裁剪到指定的时间段。

**参数：**
- `inputPath`: 输入视频文件路径
- `outputPath`: 输出视频文件路径
- `startTime`: 开始时间（格式：HH:MM:SS.mmm 或秒数）
- `duration`: 持续时间（可选，格式同上）
- `endTime`: 结束时间（可选，格式同上）

**示例：**
```javascript
trim_video({
  inputPath: "path/to/video.mp4",
  outputPath: "path/to/trimmed.mp4",
  startTime: "00:00:10",
  duration: "00:00:30"
})
```

### 6. 添加水印 (add_watermark)

为视频添加图像水印。

**参数：**
- `inputPath`: 输入视频文件路径
- `watermarkPath`: 水印图像路径
- `outputPath`: 输出视频文件路径
- `position`: 水印位置（topleft, topright, bottomleft, bottomright, center）
- `opacity`: 水印不透明度（0.0-1.0）

**示例：**
```javascript
add_watermark({
  inputPath: "path/to/video.mp4",
  watermarkPath: "path/to/logo.png",
  outputPath: "path/to/watermarked.mp4",
  position: "bottomright",
  opacity: 0.7
})
```

## 实际使用案例

### 从图像序列创建 30fps 的 H.264 视频

```javascript
create_video_from_images({
  inputPattern: "C:/Users/username/images/bear/%05d.jpg",
  outputPath: "C:/Users/username/videos/bear.mp4",
  framerate: 30,
  codec: "libx264",
  pixelFormat: "yuv420p"
})
```

### 将视频的前 10 秒裁剪出来

```javascript
trim_video({
  inputPath: "C:/Users/username/videos/long_video.mp4",
  outputPath: "C:/Users/username/videos/clip.mp4",
  startTime: "0",
  duration: "10"
})
```

## 故障排除

- 确保 FFmpeg 已正确安装并添加到系统 PATH 中
- 检查文件路径是否正确，特别是在 Windows 系统中使用反斜杠（\\）时
- 如果遇到权限问题，请确保应用程序有权访问指定的文件和目录
- 对于复杂的 FFmpeg 命令，可以使用 `options` 或 `extraOptions` 参数传递额外的命令行选项

## 开发

### 调试

由于 MCP 服务器通过标准输入/输出进行通信，调试可能比较困难。建议使用控制台日志进行调试：

```javascript
console.log("调试信息");
```

### 扩展功能

要添加新的 FFmpeg 功能，请修改以下文件：

1. 在 `ListToolsRequestSchema` 处理程序中添加新工具的定义
2. 在 `CallToolRequestSchema` 处理程序中添加相应的实现

## 许可证

[MIT License](LICENSE)
