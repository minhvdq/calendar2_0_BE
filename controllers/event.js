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
        res.status(200).json(result.rows.event_id);
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


// async function runApp()
// {
//   let connection;
//   try {
//     // Use the connection string copied from the cloud console
//     // and stored in connstring.txt file from Step 2 of this tutorial
//     connection = await oracledb.getConnection({ user: "admin", password: "Binhtcd23072003", connectionString: "(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.us-ashburn-1.oraclecloud.com))(connect_data=(service_name=gde533bf5874b44_events_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))" });
//     
//     // Create a table
// //     await connection.execute(`begin execute immediate 'drop table nodetab'; exception when others then if sqlcode <> -942 then raise; end if; end;`);
// //     await connection.execute(`create table nodetab (id number, data varchar2(20))`);
// //     
// //     // Insert some rows
// //     const sql = `INSERT INTO nodetab VALUES (:1, :2)`; const binds = [ [1, "First" ], [2, "Second" ], [3, "Third" ], [4, "Fourth" ], [5, "Fifth" ], [6, "Sixth" ], [7, "Seventh" ] ];
// //     await connection.executeMany(sql, binds);
//     // connection.commit(); // uncomment to make data persistent
//     
//     // Now query the rows back
//     const result = await connection.execute(`SELECT * FROM nodetab`);
//     //console.dir(result.rows, { depth: null });
//     console.log(typeof result.rows[0][1])
//   } catch (err) {
//     console.error(err);
//   } finally {
//     if (connection)
//       {
//         try {
//           await connection.close();
//         } catch (err) {
//           console.error(err);
//       }
//     }
//   }
// }
// runApp();