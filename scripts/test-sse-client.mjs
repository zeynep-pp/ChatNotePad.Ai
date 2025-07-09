import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const origin = process.argv[2] || "http://localhost:3000";

async function main() {
  console.log("🔄 Creating SSE transport...");
  const transport = new SSEClientTransport(new URL(`${origin}/sse`));

  console.log("🔄 Creating MCP client...");
  const client = new Client(
    {
      name: "sse-test-client",
      version: "1.0.0",
    },
    {
      capabilities: {
        prompts: {},
        resources: {},
        tools: {},
      },
    }
  );

  try {
    console.log("🔗 Connecting to", `${origin}/sse`);
    
    // Set a connection timeout
    const connectPromise = client.connect(transport);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 10s')), 10000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    console.log("✅ Connected successfully!");

    console.log("📋 Server capabilities:", client.getServerCapabilities());

    console.log("🔧 Listing available tools...");
    const tools = await client.listTools();
    console.log("✅ Available tools:", JSON.stringify(tools, null, 2));

    if (tools.tools && tools.tools.length > 0) {
      console.log("🧪 Testing first tool...");
      const testTool = tools.tools[0];
      
      // Test the react-code-review tool with sample code
      if (testTool.name === 'react-code-review') {
        const result = await client.callTool(testTool.name, {
          code: `
import React from 'react';

function HelloWorld() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div>
      <h1>Hello World</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default HelloWorld;
          `.trim(),
          filename: "HelloWorld.jsx"
        });
        
        console.log("🎉 Tool result:", JSON.stringify(result, null, 2));
      }
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    console.log("🔌 Closing connection...");
    client.close();
    console.log("✅ Connection closed");
  }
}

main().catch(console.error);