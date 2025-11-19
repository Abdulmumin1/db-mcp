import type { ConnectionDetails, DBAdapter } from "./base.js";
import { MySqlAdapter } from "./mysql.js";
import { PostgresAdapter } from "./postgres.js";

export { validateReadOnly, ConnectionDetails, DBAdapter } from "./base.js";
export { PostgresAdapter } from "./postgres.js";
export { MySqlAdapter } from "./mysql.js";

// ADAPTER FACTORY

export const adapterFactory: Record<
	string,
	new (
		details: ConnectionDetails,
	) => DBAdapter
> = {
	postgres: PostgresAdapter,
	mysql: MySqlAdapter,
	// Add other db types here (e.g., 'sqlite', 'mssql')
};
