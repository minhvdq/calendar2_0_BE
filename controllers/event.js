const eventRouter = require('express').Router()
const oracledb = require('oracledb')
const moment = require('moment')


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
        const call = `SELECT JSON_OBJECT (*) FROM EVENT`;
        const result = await connection.execute(call);
        const rows = result.rows.map(row => JSON.parse(row[0])); // Parse each JSON string into an object
        console.log(rows);
        res.status(200).json(rows);
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

eventRouter.get('/:id', async( request, res ) => {
    const id = request.params.id
    let connection;
    try {
        connection = await pool.getConnection();
        const call = `SELECT JSON_OBJECT (*) FROM EVENT WHERE ${id} = EVENT_ID`;
        const result = await connection.execute(call);
        const rows = result.rows.map(row => JSON.parse(row[0])); 
        console.log(rows);
        res.status(200).json(rows);
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
})

eventRouter.get('/user/:user_id', async (request, res) => {
    const userId = request.params.user_id
    let connection;
    try {
        connection = await pool.getConnection();
        const call = `SELECT JSON_OBJECT (*) FROM EVENT WHERE '${userId}' = USER_ID`;
        const result = await connection.execute(call);
        const rows = result.rows.map(row => JSON.parse(row[0])); 
        console.log(rows);
        res.status(200).json(rows);
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
})

module.exports = eventRouter;



// //get all the event in the week.
// eventRouter.post("/weekly/:timestamp", async (req, res) => {
//     const currentTime = req.params.timestamp;
//     const events = req.body.events
//     let connection;
//     const currentDate = new Date(currentTime); // Parse timestamp string
//     // Adjust date to local time zone
//     const offset = currentDate.getTimezoneOffset(); // Get offset in minutes
//     currentDate.setMinutes(currentDate.getMinutes() - offset); // Apply offset
//     // res.status(200).json(currentDate)

//     let day = currentDate.getDay();
//     console.log('day: ', day)
//     const monday = new Date(currentDate);
//     monday.setDate(currentDate.getDate() - day + 1)
//     //the offset is 5 hours so it's neccessary to setHours() to 19 the day before hand
//     monday.setHours(0, 0, 0, 0)
//     monday.setMinutes(monday.getMinutes() - offset)

//     const nextMonday = new Date(currentDate)
//     nextMonday.setDate(currentDate.getDate() + 8 - day )
//     nextMonday.setHours(0, 0, 0, 0)
//     nextMonday.setMinutes(nextMonday.getMinutes() - offset)
//     console.log(nextMonday)
//     try {
//         connection = await pool.getConnection();
//         const call = `SELECT JSON_OBJECT (*) FROM EVENT 
//             WHERE END_TIME >= TO_TIMESTAMP('${monday.toISOString().replace('.000Z', '')}', 'YYYY-MM-DD"T"HH24:MI:SS') 
//             AND START_TIME < TO_TIMESTAMP('${nextMonday.toISOString().replace('.000Z', '')}', 'YYYY-MM-DD"T"HH24:MI:SS')`
//         //  res.status(200).send(call)
//         const result = await connection.execute(call);
//         console.log(result)
//         // res.status(200).json(result)
//         const rows = result.rows.map(row => JSON.parse(row[0])); 
//         console.log(rows);
//         const ansRows = rows.filter(row => {
//             for( let event of events){
//                 console.log(row.EVENT_ID, "and", event)
//                 if(row.EVENT_ID == event){
//                     return true
//                 }
//             }
//             return false
//         })
//         res.status(200).json(ansRows);
//     } catch (error) {
//         console.error("Error executing SQL query:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error("Error closing connection:", error);
//             }
//         }
//     }
// })


// eventRouter.post('/monthly/:timestamp', async (req, res) => {
//     const events = req.body.events 
//     const numDays = (y, m) => new Date(y, m, 0).getDate()
//     const currentTime = req.params.timestamp;
//     let connection;
//     const currentDate = new Date(currentTime); // Parse timestamp string
//     // Adjust date to local time zone
//     const offset = currentDate.getTimezoneOffset(); // Get offset in minutes
//     currentDate.setMinutes(currentDate.getMinutes() - offset); // Apply offset

//     const curDate = currentDate.getDate()
//     const daysOfMonth = numDays(currentDate.getFullYear(), currentDate.getMonth() + 1)
    
//     const lastMonth = new Date(currentDate)
//     lastMonth.setDate(lastMonth.getDate() - curDate + 1 )
//     lastMonth.setHours(0, 0, 0, 0)
//     lastMonth.setMinutes(lastMonth.getMinutes() - offset)

//     const thisMonth = new Date(currentDate)
//     thisMonth.setDate(thisMonth.getDate() + daysOfMonth - curDate + 1 )
//     thisMonth.setHours(0, 0, 0, 0)
//     thisMonth.setMinutes(thisMonth.getMinutes() - offset)

//     try {
//         connection = await pool.getConnection();
//         const call = `SELECT JSON_OBJECT (*) FROM EVENT 
//             WHERE END_TIME >= TO_TIMESTAMP('${lastMonth.toISOString().replace('.000Z', '')}', 'YYYY-MM-DD"T"HH24:MI:SS')
//             AND START_TIME < TO_TIMESTAMP('${thisMonth.toISOString().replace('.000Z', '')}', 'YYYY-MM-DD"T"HH24:MI:SS')`
//         // res.status(200).json(call)
//         const result = await connection.execute(call);
//         console.log(result)
//         // res.status(200).json(result)
//         const rows = result.rows.map(row => JSON.parse(row[0])); 
//         // rows.filter(row => {
//         //     const endTime = new Date(row.END_TIME)
//         //     endTime.setMinutes(endTime.getMinutes() - offset); // Apply offset

//         //     const startTime = new Date( row.START_TIME )
//         //     startTime.setMinutes(startTime.getMinutes() - offset); // Apply offset

//         //     if( row.PERIOD == null ){
//         //         return true
//         //     }
//         //     else{
//         //         const period = row.PERIOD
//         //         const remainder = (endTime.getMinutes() - startTime.getMinutes()) % (period*60*60)
//         //         const gapEnd = endTime.getMinutes() - lastMonth.getMinutes()
//         //         const gapStart = e
//         //         return remainder <= gap
//         //     }
//         // })
//         console.log(rows);
//         const ansRows = rows.filter(row => {
//             for( let event of events){
//                 if(row.EVENT_ID == event){
//                     return true
//                 }
//             }
//             return false
//         })
//         res.status(200).json(ansRows);
//     } catch (error) {
//         console.error("Error executing SQL query:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error("Error closing connection:", error);
//             }
//         }
//     }
// })

// eventRouter.post('/', async (req, res) => {
//     let connection;
//     const event = req.body
//     try {
//         connection = await pool.getConnection();
//         const call = `INSERT INTO EVENT (EVENT_ID, TITLE, START_TIME, END_TIME, PERIOD, LOCATION, DESCRIPTIONS, TYPE_OF_EVENT) VALUES (${event.id}, '${event.title}', TO_TIMESTAMP('${event.startTime}', 'YYYY-MM-DD"T"HH24:MI:SS'), TO_TIMESTAMP('${event.endTime}','YYYY-MM-DD"T"HH24:MI:SS'), ${event.period}, '${event.location}', '${event.descriptions}', '${event.type}')`;
//         //res.status(200).json(call)
        
//         const result = await connection.execute(call);2

//         await connection.commit()
//         // const rows = result.rows.map(row => JSON.parse(row[0])); // Parse each JSON string into an object
//         // console.log(rows);
//         res.status(200).json({ message: "Event inserted successfully" });
//     } catch (error) {
//         console.error("Error executing SQL query:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (error) {
//                 console.error("Error closing connection:", error);
//             }
//         }
//     }
// });
// module.exports = eventRouter;