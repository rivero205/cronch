const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function seed() {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolons to get individual statements, filtering empty/whitespace ones
        const statements = schemaSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Found ${statements.length} SQL statements to execute.`);

        const connection = await pool.getConnection();

        try {
            for (const statement of statements) {
                console.log(`Executing: ${statement.substring(0, 50)}...`);
                await connection.query(statement);
            }
            console.log('✅ Database seeded successfully!');
        } catch (err) {
            console.error('❌ Error executing query:', err);
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('❌ Start up error:', error);
    } finally {
        process.exit();
    }
}

seed();
