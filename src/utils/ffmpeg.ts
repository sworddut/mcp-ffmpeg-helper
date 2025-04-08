import { exec } from "child_process";
import { promisify } from "util";
import { validatePath } from "./file.js";

const execPromise = promisify(exec);

/**
 * Helper function to run FFmpeg commands with better error handling
 */
export async function runFFmpegCommand(command: string): Promise<string> {
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
export async function getVideoInfo(filePath: string): Promise<string> {
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
