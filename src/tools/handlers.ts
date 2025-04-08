import { validatePath } from "../utils/file.js";
import { getVideoInfo, runFFmpegCommand } from "../utils/ffmpeg.js";
import { ensureDirectoryExists } from "../utils/file.js";
import { join } from "path";

/**
 * Handles all FFmpeg tool requests
 */
export async function handleToolCall(toolName: string, args: any) {
  switch (toolName) {
    case "get_video_info": {
      const filePath = validatePath(String(args?.filePath), true);
      const info = await getVideoInfo(filePath);
      return {
        content: [{
          type: "text",
          text: info
        }]
      };
    }

    case "convert_video": {
      const inputPath = validatePath(String(args?.inputPath), true);
      const outputPath = validatePath(String(args?.outputPath));
      const options = String(args?.options || "");
      
      await ensureDirectoryExists(outputPath);
      const command = `-i "${inputPath}" ${options} "${outputPath}" -y`;
      const result = await runFFmpegCommand(command);
      
      return {
        content: [{
          type: "text",
          text: `Video conversion completed: ${inputPath} → ${outputPath}\n\n${result}`
        }]
      };
    }

    case "extract_audio": {
      const inputPath = validatePath(String(args?.inputPath), true);
      const outputPath = validatePath(String(args?.outputPath));
      const format = String(args?.format || "mp3");
      
      await ensureDirectoryExists(outputPath);
      const command = `-i "${inputPath}" -vn -acodec ${format} "${outputPath}" -y`;
      const result = await runFFmpegCommand(command);
      
      return {
        content: [{
          type: "text",
          text: `Audio extraction completed: ${inputPath} → ${outputPath}\n\n${result}`
        }]
      };
    }

    case "create_video_from_images": {
      const inputPattern = String(args?.inputPattern);
      const outputPath = validatePath(String(args?.outputPath));
      const framerate = Number(args?.framerate || 25);
      const codec = String(args?.codec || "libx264");
      const pixelFormat = String(args?.pixelFormat || "yuv420p");
      const extraOptions = String(args?.extraOptions || "");
      
      if (!inputPattern) {
        throw new Error("Input pattern is required");
      }
      
      await ensureDirectoryExists(outputPath);
      const command = `-framerate ${framerate} -i "${inputPattern}" -c:v ${codec} -pix_fmt ${pixelFormat} ${extraOptions} "${outputPath}" -y`;
      const result = await runFFmpegCommand(command);
      
      return {
        content: [{
          type: "text",
          text: `Video creation completed: ${inputPattern} → ${outputPath}\n\n${result}`
        }]
      };
    }

    case "trim_video": {
      const inputPath = validatePath(String(args?.inputPath), true);
      const outputPath = validatePath(String(args?.outputPath));
      const startTime = String(args?.startTime || "0");
      const duration = String(args?.duration || "");
      const endTime = String(args?.endTime || "");
      
      await ensureDirectoryExists(outputPath);
      
      let command = `-i "${inputPath}" -ss ${startTime}`;
      if (duration) {
        command += ` -t ${duration}`;
      } else if (endTime) {
        command += ` -to ${endTime}`;
      }
      command += ` -c copy "${outputPath}" -y`;
      
      const result = await runFFmpegCommand(command);
      
      return {
        content: [{
          type: "text",
          text: `Video trimming completed: ${inputPath} → ${outputPath}\n\n${result}`
        }]
      };
    }

    case "add_watermark": {
      const inputPath = validatePath(String(args?.inputPath), true);
      const watermarkPath = validatePath(String(args?.watermarkPath), true);
      const outputPath = validatePath(String(args?.outputPath));
      const position = String(args?.position || "bottomright");
      const opacity = Number(args?.opacity || 0.5);
      
      await ensureDirectoryExists(outputPath);
      
      // Determine overlay position
      let overlayPosition = "";
      switch (position.toLowerCase()) {
        case "topleft":
          overlayPosition = "10:10";
          break;
        case "topright":
          overlayPosition = "W-w-10:10";
          break;
        case "bottomleft":
          overlayPosition = "10:H-h-10";
          break;
        case "center":
          overlayPosition = "(W-w)/2:(H-h)/2";
          break;
        case "bottomright":
        default:
          overlayPosition = "W-w-10:H-h-10";
          break;
      }
      
      // Improved command with better handling of watermark opacity and format
      const command = `-i "${inputPath}" -i "${watermarkPath}" -filter_complex "[1:v]format=rgba,colorchannelmixer=aa=${opacity}[watermark];[0:v][watermark]overlay=${overlayPosition}:format=auto,format=yuv420p" -codec:a copy "${outputPath}" -y`;
      const result = await runFFmpegCommand(command);
      
      return {
        content: [{
          type: "text",
          text: `Watermark added: ${inputPath} → ${outputPath}\n\n${result}`
        }]
      };
    }

    case "trim_audio": {
      const inputPath = validatePath(String(args?.inputPath), true);
      const outputPath = validatePath(String(args?.outputPath));
      const startTime = String(args?.startTime || "0");
      const duration = String(args?.duration || "");
      const endTime = String(args?.endTime || "");
      const format = String(args?.format || "");
      
      await ensureDirectoryExists(outputPath);
      
      // Build the FFmpeg command
      let command = `-i "${inputPath}" -ss ${startTime}`;
      
      // Add duration or end time if provided
      if (duration) {
        command += ` -t ${duration}`;
      } else if (endTime) {
        command += ` -to ${endTime}`;
      }
      
      // Add format if specified, otherwise use copy codec
      if (format) {
        command += ` -acodec ${format}`;
      } else {
        command += ` -acodec copy`;
      }
      
      command += ` "${outputPath}" -y`;
      
      const result = await runFFmpegCommand(command);
      
      return {
        content: [{
          type: "text",
          text: `Audio trimming completed: ${inputPath} → ${outputPath}\n\n${result}`
        }]
      };
    }

    case "extract_frames": {
      const inputPath = validatePath(String(args?.inputPath), true);
      const outputDir = String(args?.outputDir || "output");
      const frameRate = String(args?.frameRate || "1");
      const format = String(args?.format || "jpg");
      const quality = Number(args?.quality || 95);
      const startTime = args?.startTime ? String(args?.startTime) : "";
      const duration = args?.duration ? String(args?.duration) : "";
      
      // Create output directory if it doesn't exist
      await ensureDirectoryExists(join(outputDir, "dummy.txt"));
      
      // Build the FFmpeg command
      let command = `-i "${inputPath}"`;
      
      // Add start time if provided
      if (startTime) {
        command += ` -ss ${startTime}`;
      }
      
      // Add duration if provided
      if (duration) {
        command += ` -t ${duration}`;
      }
      
      // Set frame extraction rate
      command += ` -vf "fps=${frameRate}"`;
      
      // Set quality based on format
      if (format.toLowerCase() === "jpg" || format.toLowerCase() === "jpeg") {
        // For JPEG, use a better quality setting (lower values = higher quality in FFmpeg's scale)
        // Convert 1-100 scale to FFmpeg's 1-31 scale (inverted, where 1 is best quality)
        const ffmpegQuality = Math.max(1, Math.min(31, Math.round(31 - ((quality / 100) * 30))));
        command += ` -q:v ${ffmpegQuality}`;
      } else if (format.toLowerCase() === "png") {
        // For PNG, use compression level (0-9, where 0 is no compression)
        const compressionLevel = Math.min(9, Math.max(0, Math.round(9 - ((quality / 100) * 9))));
        command += ` -compression_level ${compressionLevel}`;
      }
      
      // Set output pattern with 5-digit numbering
      const outputPattern = join(outputDir, `%05d.${format}`);
      command += ` "${outputPattern}" -y`;
      
      const result = await runFFmpegCommand(command);
      
      return {
        content: [{
          type: "text",
          text: `Frames extracted from video: ${inputPath} → ${outputDir}/*.${format}\n\n${result}`
        }]
      };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
