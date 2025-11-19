import { Client } from 'pg';
import mysql from 'mysql2/promise';

// --- 2. THE READ-ONLY VALIDATOR (CRITICAL) ---

/**
 * Ensures the given SQL query is read-only.
 * @param {string} query The SQL query string.
 * @throws {Error} If the query contains any write/DDL keywords.
 */
export function validateReadOnly(query: string) {
    const normalizedQuery = query.trim().toUpperCase();
    
    // Deny-list of non-read keywords
    const writeKeywords = [
        'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE',
        'TRUNCATE', 'GRANT', 'REVOKE', 'SET'
    ];

    // Allow-list for start of query
    if (!normalizedQuery.startsWith('SELECT') && !normalizedQuery.startsWith('WITH')) {
         throw new Error(`Query rejected: Must begin with 'SELECT' or 'WITH'.`);
    }
    
    // Check if any write keyword is present
    const hasWriteKeyword = writeKeywords.some(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`);
        return regex.test(normalizedQuery);
    });

    if (hasWriteKeyword) {
        throw new Error(`Query rejected: Contains a restricted write operation keyword.`);
    }
    
    console.log("Query passed read-only validation.");
}

// --- 3. THE ABSTRACT ADAPTER ---

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

// --- 4. CONCRETE ADAPTERS ---

export class PostgresAdapter extends DBAdapter {
    async connect() {
        this.client = new Client(this.details);
        await this.client.connect();
    }

    async executeReadOnlyQuery(query: string) {
        const result = await this.client.query(query);
        return result.rows;
    }
}

export class MySqlAdapter extends DBAdapter {
    async connect() {
        this.client = await mysql.createConnection(this.details);
    }

    async executeReadOnlyQuery(query: string) {
        const [rows] = await this.client.execute(query);
        return rows as any[];
    }
}

// --- 5. ADAPTER FACTORY ---

export const adapterFactory: Record<string, new (details: ConnectionDetails) => DBAdapter> = {
    'postgres': PostgresAdapter,
    'mysql': MySqlAdapter,
    // Add other db types here (e.g., 'sqlite', 'mssql')
};