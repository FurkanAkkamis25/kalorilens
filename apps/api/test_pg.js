const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://admin:password123@localhost:5432/kalorilens_db?schema=public',
});

async function test() {
    try {
        await client.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT NOW()');
        console.log(res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('Connection error', err);
    }
}

test();
