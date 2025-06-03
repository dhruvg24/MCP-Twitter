import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { createPost } from "./mcp.tool.js";
import { create } from "node:domain";

const app = express();
app.use(express.json());

// Store active sessions
const transports = {};

app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  let transport;

  if (sessionId && transports[sessionId]) {
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        transports[sessionId] = transport;
      },
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
      }
    };

    const server = new McpServer({
      name: "example-server",
      version: "1.0.0",
    });

    server.tool(
      "addTwoNumbers",
      "Add two numbers",
      {
        a: z.number(),
        b: z.number(),
      },
      async (args) => {
        const { a, b } = args;
        return {
          content: [
            {
              type: "text",
              text: `The sum of ${a} and ${b} is ${a + b}`,
            },
          ],
        };
      }
    );

    server.tool(
      "createPost",
      "Create a post on X formerly known as Twitter",
      {
        status: z.string(),
      },
      async (arg) => {
        const { status } = arg;
        return createPost(status);
      }
    );

    await server.connect(transport);
  } else {
    res.status(400).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Bad Request: No valid session ID provided",
      },
      id: null,
    });
    return;
  }

  await transport.handleRequest(req, res, req.body);
});

const handleSessionRequest = async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }

  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
};

app.get("/mcp", handleSessionRequest);
app.delete("/mcp", handleSessionRequest);

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
