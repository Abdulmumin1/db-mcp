/**
 * Ensures the given SQL query is read-only.
 * @param {string} query The SQL query string.
 * @throws {Error} If the query contains any write/DDL keywords.
 */
export function validateReadOnly(query: string) {
	const normalizedQuery = query.trim().toUpperCase();

	// Deny-list of non-read keywords
	const writeKeywords = [
		"INSERT",
		"UPDATE",
		"DELETE",
		"DROP",
		"ALTER",
		"CREATE",
		"TRUNCATE",
		"GRANT",
		"REVOKE",
		"SET",
	];

	// Allow-list for start of query
	if (
		!normalizedQuery.startsWith("SELECT") &&
		!normalizedQuery.startsWith("WITH")
	) {
		throw new Error(`Query rejected: Must begin with 'SELECT' or 'WITH'.`);
	}

	// Check if any write keyword is present
	const hasWriteKeyword = writeKeywords.some((keyword) => {
		const regex = new RegExp(`\\b${keyword}\\b`);
		return regex.test(normalizedQuery);
	});

	if (hasWriteKeyword) {
		throw new Error(
			"Query rejected: Contains a restricted write operation keyword.",
		);
	}

	console.log("Query passed read-only validation.");
}

// THE ABSTRACT ADAPTER

export interface ConnectionDetails {
	host: string;
	port?: number;
	user: string;
	password: string;
	database: string;
}

export abstract class DBAdapter {
	protected details: ConnectionDetails;
	protected client: any;

	constructor(connectionDetails: ConnectionDetails) {
		this.details = connectionDetails;
		this.client = null;
	}

	abstract connect(): Promise<void>;

	abstract executeReadOnlyQuery(query: string): Promise<any[]>;

	async disconnect() {
		if (this.client) {
			if (this.client.end) {
				await this.client.end();
			}
			this.client = null;
		}
	}
}
