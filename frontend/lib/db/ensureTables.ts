import pg from "pg";

let ensurePromise: Promise<void> | null = null;

export function ensureTables(): Promise<void> {
    if (ensurePromise) return ensurePromise;

    ensurePromise = (async () => {
        const pool = new pg.Pool({
            connectionString: process.env.DATABASE_URL!,
            max: 1,
            connectionTimeoutMillis: 5000,
        });
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS organisation (
                    id         SERIAL PRIMARY KEY,
                    name       VARCHAR(500) NOT NULL,
                    managed_by VARCHAR(100) NOT NULL,
                    user_id    VARCHAR(255)
                );

                CREATE TABLE IF NOT EXISTS employees (
                    emp_id             SERIAL PRIMARY KEY,
                    emp_name           VARCHAR(100) NOT NULL,
                    orgid              INTEGER REFERENCES organisation(id)
                                           ON DELETE NO ACTION ON UPDATE NO ACTION,
                    tasks              INTEGER,
                    deadline_met       INTEGER,
                    averagetime        INTEGER,
                    performance_score  INTEGER,
                    attendance_percent FLOAT,
                    late_days          INTEGER,
                    projects_completed INTEGER,
                    complaints         INTEGER,
                    skills_score       INTEGER,
                    experience_years   FLOAT,
                    leadership_score   INTEGER,
                    workload           INTEGER,
                    deadline_pressure  INTEGER,
                    job_satisfaction   INTEGER,
                    past_overtime      BOOLEAN
                );
            `);

            // Add columns to existing tables that may be missing (safe on re-runs)
            const mlCols: [string, string][] = [
                ["performance_score",  "INTEGER"],
                ["attendance_percent", "FLOAT"],
                ["late_days",          "INTEGER"],
                ["projects_completed", "INTEGER"],
                ["complaints",         "INTEGER"],
                ["skills_score",       "INTEGER"],
                ["experience_years",   "FLOAT"],
                ["leadership_score",   "INTEGER"],
                ["workload",           "INTEGER"],
                ["deadline_pressure",  "INTEGER"],
                ["job_satisfaction",   "INTEGER"],
                ["past_overtime",      "BOOLEAN"],
            ];
            for (const [col, type] of mlCols) {
                await pool.query(
                    `ALTER TABLE employees ADD COLUMN IF NOT EXISTS ${col} ${type};`
                );
            }

            console.log("[db] Tables verified / created.");
        } catch (err) {
            ensurePromise = null;
            console.warn("[db] Could not verify tables:", (err as Error).message);
        } finally {
            await pool.end();
        }
    })();

    return ensurePromise;
}
