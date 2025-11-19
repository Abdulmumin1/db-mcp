import mysql from "mysql2/promise";
import { DBAdapter } from "./base.js";

export class MySqlAdapter extends DBAdapter {
	async connect() {
		this.client = await mysql.createConnection(this.details);
	}

	async executeReadOnlyQuery(query: string) {
		const [rows] = await this.client.execute(query);
		return rows as any[];
	}
}
