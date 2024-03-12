const eventRouter = require('express').Router()
const oracledb = require('oracledb')


let pool;

const initializePool = async () => {
    try {
        pool = await oracledb.createPool({
            user: "admin",
            password: "Binhtcd23072003",
            connectString: "(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.us-ashburn-1.oraclecloud.com))(connect_data=(service_name=gde533bf5874b44_events_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))",
            poolMax: 10, // Maximum number of connections in the pool
            poolMin: 2,  // Minimum number of connections in the pool
            poolTimeout: 60, // Time (in seconds) after which idle connections are released
            poolPingInterval: 60 // Time (in seconds) between connection pings to keep connections alive
        });
    } catch (error) {
        console.error("Error initializing connection pool:", error);
    }
};

initializePool();

eventRouter.get('/', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const result = await connection.execute(`SELECT * FROM EVENT`);
        console.log(result)
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error executing SQL query:", error);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error("Error closing connection:", error);
            }
        }
    }
});

module.exports = eventRouter;