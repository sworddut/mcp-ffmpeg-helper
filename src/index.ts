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

// Import our modularized code
import { toolDefinitions } from "./tools/definitions.js";
import { handleToolCall } from "./tools/handlers.js";

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
    tools: toolDefinitions
  };
});

/**
 * Handler for FFmpeg tools.
 * Implements various video operations using FFmpeg.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    return await handleToolCall(request.params.name, request.params.arguments);
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
