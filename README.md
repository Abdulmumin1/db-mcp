# Database MCP Server

A Model Context Protocol (MCP) server that provides secure, read-only access to databases through AI assistants. This server allows MCP-compatible clients to execute SQL queries against databases while enforcing strict read-only operations.

## Features

- **Secure Read-Only Queries**: Only allows SELECT and WITH statements, blocking all write operations
- **Multiple Database Support**: Currently supports PostgreSQL and MySQL
- **MCP Protocol**: Fully compatible with the Model Context Protocol for seamless AI integration
- **Environment-Based Configuration**: Easy setup through environment variables
- **TypeScript**: Built with TypeScript for type safety and maintainability

## Supported Adapters

- **PostgreSQL** (`DB_TYPE=postgres`)
- **MySQL** (`DB_TYPE=mysql`)

## Installation

### Prerequisites

- Node.js 18+
- A PostgreSQL or MySQL database

### Install Dependencies

```bash
npm install
# or
pnpm install
```

### Build the Server

```bash
npm run build
# or
pnpm build
```

This creates an executable `build/index.js` file.

## Configuration

Configure the server using environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_TYPE` | Yes | Database type: `postgres` or `mysql` |
| `DB_HOST` | Yes | Database host address |
| `DB_PORT` | No | Database port (uses default if not specified) |
| `DB_USER` | Yes | Database username |
| `DB_PASSWORD` | Yes | Database password |
| `DB_DATABASE` | Yes | Database name |

### Example Configuration

For PostgreSQL:
```bash
export DB_TYPE=postgres
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=myuser
export DB_PASSWORD=mypassword
export DB_DATABASE=mydatabase
```

For MySQL:
```bash
export DB_TYPE=mysql
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=myuser
export DB_PASSWORD=mypassword
export DB_DATABASE=mydatabase
```

## Usage

### Running the Server

After building and configuring environment variables:

```bash
node build/index.js
```

The server will start and listen on stdin/stdout for MCP protocol messages.

### MCP Client Integration

This server is designed to work with MCP-compatible clients. The server provides a single tool:

#### `run_query`

Executes a secure, read-only SQL query against the configured database.

**Input:**
- `query` (string): The read-only SQL query to execute (must start with SELECT or WITH)

**Output:**
- JSON response with query results or error information


## Security

This server implements several security measures:

- **Read-Only Enforcement**: Queries are validated to ensure they only contain SELECT or WITH statements
- **Keyword Filtering**: Blocks queries containing write operations (INSERT, UPDATE, DELETE, etc.)
- **Connection Isolation**: Each query uses a separate database connection that is properly closed
- **No DDL Operations**: Prevents schema modifications and administrative commands

## Development

### Project Structure

```
src/
├── index.ts              # Main server implementation
└── adapters/
    ├── index.ts          # Adapter exports and factory
    ├── base.ts           # Abstract adapter and validation
    ├── postgres.ts       # PostgreSQL adapter
    └── mysql.ts          # MySQL adapter
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

### Adding New Database Adapters

To add support for a new database type:

1. Create a new file in `src/adapters/` (e.g., `sqlite.ts`)
2. Create a new adapter class extending `DBAdapter` from `./base.js`
3. Implement the required methods: `connect()` and `executeReadOnlyQuery()`
4. Export the class from the new file
5. Add the adapter to the `adapterFactory` object in `src/adapters/index.ts`
6. Update the dependencies in `package.json` if needed

Example:
```typescript
// src/adapters/sqlite.ts
import { DBAdapter } from './base.js';

export class SqliteAdapter extends DBAdapter {
  async connect() {
    // Implementation
  }

  async executeReadOnlyQuery(query: string) {
    // Implementation
  }
}
```

```typescript
// src/adapters/index.ts
import { SqliteAdapter } from './sqlite.js';

export const adapterFactory: Record<string, new (details: ConnectionDetails) => DBAdapter> = {
  'postgres': PostgresAdapter,
  'mysql': MySqlAdapter,
  'sqlite': SqliteAdapter,  // New adapter
};
```

### Testing

Run the linter:
```bash
npm run lint
```

Fix linting issues:
```bash
npm run lint:fix
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

ISC License

## Dependencies

- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk) - MCP protocol implementation
- [pg](https://www.npmjs.com/package/pg) - PostgreSQL client
- [mysql2](https://www.npmjs.com/package/mysql2) - MySQL client
- [zod](https://github.com/colinhacks/zod) - Schema validation