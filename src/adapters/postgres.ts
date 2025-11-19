import { Client } from "pg";
import { DBAdapter } from "./base.js";

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
