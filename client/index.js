import { config } from "dotenv";
import readline from "readline/promises";
import { GoogleGenAI } from "@google/genai";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

config();

let tools = [];

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const chatHistory = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const mcpClient = new Client({
  name: "example-client",
  version: "1.0.0",
});

await mcpClient.connect(
  new StreamableHTTPClientTransport("http://localhost:3001/mcp")
);

console.log("Connected to MCP server");
tools = (await mcpClient.listTools()).tools.map((tool) => {
  return {
    name: tool.name,
    description: tool.description,
    parameters: {
      type: tool.inputSchema.type,
      properties: tool.inputSchema.properties,
      required: tool.inputSchema.required,
    },
  };
});
// console.log('Available tools: ', tools);

async function chatLoop(toolCall) {
  if (toolCall) {
    console.log(toolCall);

    chatHistory.push({
      role: "model",
      parts: [
        {
          text: `calling tool ${toolCall.name}`,
          type: "text",
        },
      ],
    });

    const toolResult = await mcpClient.callTool({
      name: toolCall.name,
      arguments: toolCall.args,
    });

    chatHistory.push({
      role: "user",
      parts: [
        {
          text: "Tool result : " + toolResult.content[0].text,
          type: "text",
        },
      ],
    });

    // console.log(toolResult);
  } else {
    const question = await rl.question("You: ");
    chatHistory.push({
      role: "user",
      parts: [
        {
          text: question,
          type: "text",
        },
      ],
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: chatHistory,
    config: {
      tools: [
        {
          functionDeclarations: tools,
        },
      ],
    },
  });

  const functionCall = response.candidates[0].content.parts[0].functionCall;
  const responseText =
    response.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("\n") || "[No response from Gemini]";

  if (functionCall) {
    return chatLoop(functionCall);
  }

  chatHistory.push({
    role: "model",
    parts: [
      {
        text: responseText,
        type: "text",
      },
    ],
  });

  console.log(`AI: ${responseText}`);
  chatLoop();
}

chatLoop();
