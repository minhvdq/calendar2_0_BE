const eventRouter = require('express').Router()
const oracledb = require('oracledb')
const moment = require('moment')
const config = require('../utils/config.js')
//import config from '../utils/config'


let pool;

const initializePool = async () => {
    let oraclePass = config.ORACLE_PASS;
    try {
        pool = await oracledb.createPool({
            user: "admin",
            password: `${oraclePass}`,
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


eventRouter.post('/addEvents/:user_id', async (request, res) => {
    const eventData = request.body;
    const title = eventData.TITLE
    const startTime= eventData.START_TIME
    const endTime= eventData.END_TIME
    let period= eventData.PERIOD !== "" ? eventData.PERIOD : 'NULL';
    const descriptions= eventData.DESCRIPTIONS
    const location= eventData.LOCATION
    const userId = request.params.user_id
    const groupId = eventData.GROUP_ID
    let connection;
    try {
        connection = await pool.getConnection();

        const call = `INSERT INTO EVENT(EVENT_ID,TITLE, START_TIME,END_TIME,PERIOD,LOCATION,DESCRIPTIONS,USER_ID, GROUP_ID) 
                      VALUES(EVENT_SEQ.NEXTVAL,'${title}',TO_TIMESTAMP('${startTime}', 'YYYY-MM-DD"T"HH24:MI:SS'), 
                      TO_TIMESTAMP('${endTime}', 'YYYY-MM-DD"T"HH24:MI:SS'),${period}, '${location}','${descriptions}', '${userId}', '${groupId}')
                      RETURNING EVENT_ID,TITLE, START_TIME,END_TIME,PERIOD,LOCATION,DESCRIPTIONS,USER_ID,GROUP_ID
                      INTO
                      :EVENT_ID,:TITLE, :START_TIME,:END_TIME,:PERIOD,:LOCATION,:DESCRIPTIONS,:USER_ID, :GROUP_ID`
        const result = await connection.execute(call, {
            EVENT_ID:   { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
            TITLE:  { type: oracledb.STRING, dir: oracledb.BIND_OUT },
            START_TIME : { type: oracledb.DB_TYPE_TIMESTAMP_LTZ, dir: oracledb.BIND_OUT },
            END_TIME: { type: oracledb.DB_TYPE_TIMESTAMP_LTZ, dir: oracledb.BIND_OUT },
            PERIOD: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
            LOCATION: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
            DESCRIPTIONS: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
            USER_ID: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
            GROUP_ID: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        } );
        await connection.commit();
 

        const outputItem = {
            EVENT_ID: result.outBinds.EVENT_ID[0],
            TITLE: result.outBinds.TITLE[0],
            START_TIME: result.outBinds.START_TIME[0],
            END_TIME: result.outBinds.END_TIME[0],
            PERIOD: result.outBinds.PERIOD[0],
            LOCATION: result.outBinds.LOCATION[0],
            DESCRIPTIONS: result.outBinds.DESCRIPTIONS[0],
            USER_ID: result.outBinds.USER_ID[0],
            GROUP_ID: result.outBinds.GROUP_ID[0]
        }
        console.log('output', JSON.stringify(outputItem))
        res.status(200).json(outputItem);
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

eventRouter.post('/editEvents/:eventID', async (request, res) => {
    const eventData = request.body;
    const title = eventData.TITLE
    const startTime= eventData.START_TIME
    const endTime= eventData.END_TIME
    let period= eventData.PERIOD !== "" ? eventData.PERIOD : 'NULL'
    const descriptions= eventData.DESCRIPTIONS
    const location= eventData.LOCATION
    const eventId = request.params.eventID
    let connection;
    try {
        connection = await pool.getConnection();
        const call = `UPDATE EVENT SET TITLE = '${title}', START_TIME = TO_TIMESTAMP('${startTime}', 'YYYY-MM-DD"T"HH24:MI:SS'),END_TIME = TO_TIMESTAMP('${endTime}', 'YYYY-MM-DD"T"HH24:MI:SS'),
                      PERIOD = ${period}, LOCATION = '${location}', DESCRIPTIONS = '${descriptions}'
                      WHERE EVENT_ID = ${eventId}
                      `;
        console.log(call)
        const result = await connection.execute(call);
        await connection.commit();

        res.status(200).send("Event edited successfully");;
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

eventRouter.put('/editMultipleEvents/:eventID', async (request,res)=>{
    const eventData = request.body;
    const title = eventData.TITLE
    const startTime= eventData.START_TIME+':00'
    const endTime= eventData.END_TIME+':00'
    let period= eventData.PERIOD !== "" ? eventData.PERIOD : 'NULL';
    const descriptions= eventData.DESCRIPTIONS
    const location= eventData.LOCATION
    const eventId = request.params.eventID
    console.log("start time is ",startTime)
    console.log("end time is ",endTime)
    let connection;
    try {
        connection = await pool.getConnection();
        const callGroupID = `SELECT GROUP_ID,START_TIME FROM EVENT WHERE EVENT_ID=${eventId}`
        const result = await connection.execute(callGroupID);
        console.log(result)
        const groupId = result.rows[0][0]
        const start_time_event = moment(result.rows[0][1].toISOString()).format('YYYY-MM-DDTHH:mm:ss[Z]');
        console.log('groupID '+ groupId)
        console.log(start_time_event)
        const call = `UPDATE event 
        SET TITLE = '${title}', DESCRIPTIONS = '${descriptions}', LOCATION = '${location}',
        START_TIME = TO_TIMESTAMP(TO_CHAR(start_time, 'YYYY-MM-DD') || 'T' || '${startTime}Z', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
        END_TIME = TO_TIMESTAMP(TO_CHAR(end_time, 'YYYY-MM-DD') || 'T' || '${endTime}Z', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
        WHERE group_id = ${groupId} and START_TIME >= TO_TIMESTAMP('${start_time_event}', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`;
        console.log('query is ',call)
        const ress = await connection.execute(call)
        await connection.commit();

        res.status(200).send("Multiple events edited successfully");;
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

eventRouter.delete('/:id', async (request, res) => {
    const eventId = request.params.id
    let connection;
    try {
        connection = await pool.getConnection();
        const call = `DELETE FROM EVENT WHERE EVENT_ID = ${eventId}`;
        console.log(call)
        await connection.execute(call);
        await connection.commit();

        res.status(200).send("Event deleted successfully");;
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


eventRouter.delete('/deleteMultipleEvents/:eventID', async (request, res) => {
    const eventId = request.params.eventID
    // const eventData = request.body;
    // const startTime= eventData.START_TIME+':00'
    // console.log("start time is " , startTime)
    let connection;
    try {
        connection = await pool.getConnection();
        const callGroupID = `SELECT GROUP_ID, START_TIME FROM EVENT WHERE EVENT_ID=${eventId}`
        console.log(callGroupID)
        const result = await connection.execute(callGroupID);
        console.log(result.rows)
        const groupID = result.rows[0][0]
        const startTime = moment(result.rows[0][1].toISOString()).format('YYYY-MM-DDTHH:mm:ss[Z]')
        console.log("group id is ", groupID)
        console.log("start time is ",startTime)
        const call = `DELETE FROM EVENT WHERE GROUP_ID = ${groupID} AND START_TIME >=TO_TIMESTAMP('${startTime}', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`;
        console.log(call)
        await connection.execute(call);
        await connection.commit();

        res.status(200).send("Event deleted successfully");;
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