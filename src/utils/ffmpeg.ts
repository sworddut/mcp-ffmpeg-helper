import { spawn } from "child_process";
import { validatePath } from "./file.js";

function runProcess(
  command: string,
  args: string[],
  useShell = false
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      shell: useShell,
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ stdout, stderr, code: code ?? 0 });
    });
  });
}

/**
 * Helper function to run FFmpeg commands with better error handling
 */
export async function runFFmpegCommand(command: string): Promise<string> {
  try {
    console.error(`Running FFmpeg command: ffmpeg ${command}`);
    const { stdout, stderr, code } = await runProcess(
      `ffmpeg ${command}`,
      [],
      true
    );
    if (code === 0) {
      return stdout || stderr;
    }
    if (stderr) {
      return stderr;
    }
    throw new Error(`FFmpeg exited with code ${code}`);
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
    console.error(`Getting video info for: ${filePath}`);
    const { stdout, stderr, code } = await runProcess("ffprobe", [
      "-v",
      "error",
      "-show_format",
      "-show_streams",
      "-print_format",
      "json",
      filePath,
    ]);
    if (code === 0) {
      return stdout || stderr;
    }
    if (stderr) {
      return stderr;
    }
    throw new Error(`FFprobe exited with code ${code}`);
  } catch (error: any) {
    console.error("FFprobe error:", error.message);
    if (error.stderr) {
      return error.stderr;
    }
    throw new Error(`FFprobe error: ${error.message}`);
  }
}
