import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { adapterFactory, validateReadOnly } from "./db-adapters.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const { DB_TYPE, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE } =
  process.env;

//  Validate Configuration ---
if (!DB_TYPE || !DB_HOST || !DB_USER || !DB_PASSWORD || !DB_DATABASE) {
  console.error(
    "FATAL ERROR: Missing required database environment variables."
  );
  console.error(
    "This server requires: DB_TYPE, DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE"
  );
  process.exit(1);
}

const AdapterClass = adapterFactory[DB_TYPE.toLowerCase()];

if (!AdapterClass) {
  console.error(`FATAL ERROR: Invalid DB_TYPE "${DB_TYPE}". No adapter found.`);
  process.exit(1);
}

// pre-configured adapter for this server instance
const connectionDetails = {
  host: DB_HOST,
  port: DB_PORT ? parseInt(DB_PORT, 10) : undefined,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
};
const dbAdapter = new AdapterClass(connectionDetails);


//  MCP Server
const server = new McpServer(
  {
    name: "db-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// --- 6. Handle Tool Listing ---
server.registerTool(
  "run_query",
  {
    title: "Run a query",
    description: `Executes a secure, read-only SQL query (SELECT or WITH) against the '${DB_DATABASE}' (${DB_TYPE}) database. This tool is pre-configured and requires no connection info.`,
    inputSchema: {
      query: z.string().describe("The read-only SQL query to execute."),
    },
  },
  async ({ query }) => {
    try {
      // 1. Validate the query is safe
      validateReadOnly(query);

      // 2. Connect
      await dbAdapter.connect();

      // 3. Execute the query
      const results = await dbAdapter.executeReadOnlyQuery(query);

      // 4. Return success
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                database: DB_DATABASE,
                rowCount: results.length,
                data: results,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      console.error(
        `[DB-MCP-Server Error] ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                database: DB_DATABASE,
                error: error instanceof Error ? error.message : String(error),
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    } finally {
      // Disconnect
      await dbAdapter.disconnect();
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DB MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
