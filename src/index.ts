#!/usr/bin/env node

/**
 * FFmpeg Helper MCP Server
 * A simple MCP server that provides FFmpeg functionality through tools.
 * It allows video operations like:
 * - Getting video information
 * - Converting video formats
 * - Extracting audio from video
 * - Creating video from image sequences
 * - Trimming videos
 * - Adding watermarks
 * - Applying filters
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import { dirname } from "path";
import { mkdir } from "fs/promises";

const execPromise = promisify(exec);

/**
 * Helper function to ensure a directory exists
 */
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = dirname(filePath);
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory already exists or cannot be created
    if ((error as any).code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Helper function to validate file path
 */
function validatePath(path: string, isInput: boolean = false): string {
  if (!path) {
    throw new Error("File path is required");
  }
  
  if (isInput && !existsSync(path)) {
    throw new Error(`Input file does not exist: ${path}`);
  }
  
  return path;
}

/**
 * Helper function to run FFmpeg commands with better error handling
 */
async function runFFmpegCommand(command: string): Promise<string> {
  try {
    console.log(`Running FFmpeg command: ffmpeg ${command}`);
    const { stdout, stderr } = await execPromise(`ffmpeg ${command}`);
    return stdout || stderr;
  } catch (error: any) {
    console.error("FFmpeg error:", error.message);
    if (error.stderr) {
      return error.stderr;
    }
    throw new Error(`FFmpeg error: ${error.message}`);
  }
}

/**
 * Helper function to get information about a video file
 */
async function getVideoInfo(filePath: string): Promise<string> {
  try {
    validatePath(filePath, true);
    console.log(`Getting video info for: ${filePath}`);
    const { stdout, stderr } = await execPromise(`ffprobe -v error -show_format -show_streams -print_format json "${filePath}"`);
    return stdout || stderr;
  } catch (error: any) {
    console.error("FFprobe error:", error.message);
    if (error.stderr) {
      return error.stderr;
    }
    throw new Error(`FFprobe error: ${error.message}`);
  }
}

/**
 * Create an MCP server with capabilities for tools to interact with FFmpeg
 */
const server = new Server(
  {
    name: "mcp-ffmpeg-helper",
    version: "0.2.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler that lists available tools.
 * Exposes FFmpeg-related tools for video operations.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_video_info",
        description: "Get detailed information about a video file",
        inputSchema: {
          type: "object",
          properties: {
            filePath: {
              type: "string",
              description: "Path to the video file"
            }
          },
          required: ["filePath"]
        }
      },
      {
        name: "convert_video",
        description: "Convert a video file to a different format",
        inputSchema: {
          type: "object",
          properties: {
            inputPath: {
              type: "string",
              description: "Path to the input video file"
            },
            outputPath: {
              type: "string",
              description: "Path for the output video file"
            },
            options: {
              type: "string",
              description: "Additional FFmpeg options (optional)"
            }
          },
          required: ["inputPath", "outputPath"]
        }
      },
      {
        name: "extract_audio",
        description: "Extract audio from a video file",
        inputSchema: {
          type: "object",
          properties: {
            inputPath: {
              type: "string",
              description: "Path to the input video file"
            },
            outputPath: {
              type: "string",
              description: "Path for the output audio file"
            },
            format: {
              type: "string",
              description: "Audio format (mp3, aac, etc.)"
            }
          },
          required: ["inputPath", "outputPath", "format"]
        }
      },
      {
        name: "create_video_from_images",
        description: "Create a video from a sequence of images",
        inputSchema: {
          type: "object",
          properties: {
            inputPattern: {
              type: "string",
              description: "Pattern for input images (e.g., 'img%03d.jpg' or 'folder/*.png')"
            },
            outputPath: {
              type: "string",
              description: "Path for the output video file"
            },
            framerate: {
              type: "number",
              description: "Frames per second (default: 25)"
            },
            codec: {
              type: "string",
              description: "Video codec to use (default: libx264)"
            },
            pixelFormat: {
              type: "string",
              description: "Pixel format (default: yuv420p)"
            },
            extraOptions: {
              type: "string",
              description: "Additional FFmpeg options"
            }
          },
          required: ["inputPattern", "outputPath"]
        }
      },
      {
        name: "trim_video",
        description: "Trim a video to a specific duration",
        inputSchema: {
          type: "object",
          properties: {
            inputPath: {
              type: "string",
              description: "Path to the input video file"
            },
            outputPath: {
              type: "string",
              description: "Path for the output video file"
            },
            startTime: {
              type: "string",
              description: "Start time (format: HH:MM:SS.mmm or seconds)"
            },
            duration: {
              type: "string",
              description: "Duration (format: HH:MM:SS.mmm or seconds)"
            },
            endTime: {
              type: "string",
              description: "End time (format: HH:MM:SS.mmm or seconds)"
            }
          },
          required: ["inputPath", "outputPath"]
        }
      },
      {
        name: "add_watermark",
        description: "Add a watermark to a video",
        inputSchema: {
          type: "object",
          properties: {
            inputPath: {
              type: "string",
              description: "Path to the input video file"
            },
            watermarkPath: {
              type: "string",
              description: "Path to the watermark image"
            },
            outputPath: {
              type: "string",
              description: "Path for the output video file"
            },
            position: {
              type: "string",
              description: "Position of watermark (topleft, topright, bottomleft, bottomright, center)"
            },
            opacity: {
              type: "number",
              description: "Opacity of watermark (0.0-1.0)"
            }
          },
          required: ["inputPath", "watermarkPath", "outputPath"]
        }
      }
    ]
  };
});

/**
 * Handler for FFmpeg tools.
 * Implements various video operations using FFmpeg.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "get_video_info": {
        const filePath = validatePath(String(request.params.arguments?.filePath), true);
        const info = await getVideoInfo(filePath);
        return {
          content: [{
            type: "text",
            text: info
          }]
        };
      }

      case "convert_video": {
        const inputPath = validatePath(String(request.params.arguments?.inputPath), true);
        const outputPath = validatePath(String(request.params.arguments?.outputPath));
        const options = String(request.params.arguments?.options || "");
        
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
        const inputPath = validatePath(String(request.params.arguments?.inputPath), true);
        const outputPath = validatePath(String(request.params.arguments?.outputPath));
        const format = String(request.params.arguments?.format || "mp3");
        
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
        const inputPattern = String(request.params.arguments?.inputPattern);
        const outputPath = validatePath(String(request.params.arguments?.outputPath));
        const framerate = Number(request.params.arguments?.framerate || 25);
        const codec = String(request.params.arguments?.codec || "libx264");
        const pixelFormat = String(request.params.arguments?.pixelFormat || "yuv420p");
        const extraOptions = String(request.params.arguments?.extraOptions || "");
        
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
        const inputPath = validatePath(String(request.params.arguments?.inputPath), true);
        const outputPath = validatePath(String(request.params.arguments?.outputPath));
        const startTime = String(request.params.arguments?.startTime || "0");
        const duration = String(request.params.arguments?.duration || "");
        const endTime = String(request.params.arguments?.endTime || "");
        
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
        const inputPath = validatePath(String(request.params.arguments?.inputPath), true);
        const watermarkPath = validatePath(String(request.params.arguments?.watermarkPath), true);
        const outputPath = validatePath(String(request.params.arguments?.outputPath));
        const position = String(request.params.arguments?.position || "bottomright");
        const opacity = Number(request.params.arguments?.opacity || 0.5);
        
        await ensureDirectoryExists(outputPath);
        
        // Determine overlay position
        let overlayPosition = "";
        switch (position.toLowerCase()) {
          case "topleft":
            overlayPosition = "10:10";
            break;
          case "topright":
            overlayPosition = "main_w-overlay_w-10:10";
            break;
          case "bottomleft":
            overlayPosition = "10:main_h-overlay_h-10";
            break;
          case "center":
            overlayPosition = "(main_w-overlay_w)/2:(main_h-overlay_h)/2";
            break;
          case "bottomright":
          default:
            overlayPosition = "main_w-overlay_w-10:main_h-overlay_h-10";
            break;
        }
        
        const command = `-i "${inputPath}" -i "${watermarkPath}" -filter_complex "[1:v]format=rgba,colorchannelmixer=aa=${opacity}[watermark];[0:v][watermark]overlay=${overlayPosition}" "${outputPath}" -y`;
        const result = await runFFmpegCommand(command);
        
        return {
          content: [{
            type: "text",
            text: `Watermark added: ${inputPath} → ${outputPath}\n\n${result}`
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error: any) {
    console.error("Tool execution error:", error.message);
    return {
      content: [{
        type: "text",
        text: `Error: ${error.message}`
      }]
    };
  }
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  console.log("Starting MCP FFmpeg Helper server...");
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("MCP FFmpeg Helper server connected and ready");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
