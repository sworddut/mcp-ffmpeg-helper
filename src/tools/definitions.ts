/**
 * Tool definitions for FFmpeg operations
 * Defines the available tools and their input schemas
 */
export const toolDefinitions = [
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
  },
  {
    name: "trim_audio",
    description: "Trim an audio file to a specific duration",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Path to the input audio file"
        },
        outputPath: {
          type: "string",
          description: "Path for the output audio file"
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
        },
        format: {
          type: "string",
          description: "Audio format for output (mp3, aac, etc.)"
        }
      },
      required: ["inputPath", "outputPath"]
    }
  },
  {
    name: "extract_frames",
    description: "Extract frames from a video as sequential image files",
    inputSchema: {
      type: "object",
      properties: {
        inputPath: {
          type: "string",
          description: "Path to the input video file"
        },
        outputDir: {
          type: "string",
          description: "Directory to save the extracted frames (default: 'output')"
        },
        frameRate: {
          type: "string",
          description: "Frame extraction rate (e.g., '1' for every frame, '0.5' for every 2nd frame, '1/30' for 1 frame per 30 seconds)"
        },
        format: {
          type: "string",
          description: "Output image format (jpg, png, etc., default: jpg)"
        },
        quality: {
          type: "number",
          description: "Image quality for jpg format (1-100, default: 95)"
        },
        startTime: {
          type: "string",
          description: "Start time to begin extraction (format: HH:MM:SS.mmm or seconds)"
        },
        duration: {
          type: "string",
          description: "Duration to extract frames (format: HH:MM:SS.mmm or seconds)"
        }
      },
      required: ["inputPath"]
    }
  }
];
