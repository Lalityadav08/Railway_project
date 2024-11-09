// const mysql = require('mysql2');

// // Create a MySQL connection pool
// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: 'Devansh@2010',
//     database: 'point_crossing',
// });

// // Function to find the latest date with non-'NIL' deficiencies
// function findDateWithNonNilDeficiencies() {
//   return new Promise((resolve, reject) => {
//     let currentDate = null;

//     const checkNextDate = () => {
//       pool.query(
//         'SELECT MAX(date_of_inspection) AS max_date FROM data_table WHERE DEFICIENCIES != "NIL"',
//         (error, results) => {
//           if (error) {
//             return reject(error);
//           }

//           if (results[0].max_date === null) {
//             // No date with non-'NIL' deficiencies found
//             return resolve(null);
//           }

//           currentDate = results[0].max_date;
//           checkGearIDDeficiencies();
//         }
//       );
//     };

//     const checkGearIDDeficiencies = () => {
//       pool.query(
//         'SELECT DISTINCT GEAR_ID FROM data_table WHERE date_of_inspection = ? AND DEFICIENCIES != "NIL"',
//         [currentDate],
//         (error, results) => {
//           if (error) {
//             return reject(error);
//           }

//           if (results.length > 0) {
//             // Found a date with non-'NIL' deficiencies for some GEAR_ID
//             resolve(currentDate);
//           } else {
//             // No non-'NIL' deficiencies found for this date; continue checking the next date
//             checkNextDate();
//           }
//         }
//       );
//     };

//     // Start checking from the latest date
//     checkNextDate();
//   });
// }

// // Function to fetch data for each gear ID based on the last entry date
// function fetchDataForGearIDs(date) {
//   return new Promise((resolve, reject) => {
//     const query = `
//       SELECT
//         GEAR_ID,
//         MAX(date_of_inspection) AS LAST_ENTRY_DATE
//       FROM data_table
//       WHERE date_of_inspection = ?
//       GROUP BY GEAR_ID`;

//     pool.query(query, [date], (error, results) => {
//       if (error) {
//         return reject(error);
//       }

//       const gearIDDataPromises = results.map((row) => {
//         const gearID = row.GEAR_ID;
//         const lastEntryDate = row.LAST_ENTRY_DATE;

//         return new Promise((resolveGearID, rejectGearID) => {
//           const deficiencyQuery = `
//             SELECT
//               DEFICIENCIES,
//               COUNT(*) AS TOTAL_DEFICIENCY_COUNT
//             FROM data_table
//             WHERE GEAR_ID = ? AND date_of_inspection = ? AND DEFICIENCIES != 'NIL'
//             GROUP BY DEFICIENCIES`;

//           pool.query(deficiencyQuery, [gearID, lastEntryDate], (err, result) => {
//             if (err) {
//               rejectGearID(err);
//             } else {
//               resolveGearID(result);
//             }
//           });
//         });
//       });

//       Promise.all(gearIDDataPromises)
//         .then((gearIDData) => {
//           resolve(gearIDData);
//         })
//         .catch((err) => {
//           reject(err);
//         });
//     });
//   });
// }

// // Example usage
// findDateWithNonNilDeficiencies()
//   .then((dateWithNonNilDeficiencies) => {
//     if (dateWithNonNilDeficiencies) {
//       console.log('Found a date with non-NIL deficiencies:', dateWithNonNilDeficiencies);

//       // Fetch data for each gear ID based on the last entry date
//       fetchDataForGearIDs(dateWithNonNilDeficiencies)
//         .then((gearIDData) => {
//           console.log('Data for each gear ID:');
//           gearIDData.forEach((gearData) => {
//             const gearID = gearData[0].GEAR_ID;
//             console.log(`Gear ID: ${gearID}`);
//             gearData.forEach((row) => {
//               const deficiency = row.DEFICIENCIES;
//               const totalDeficiencyCount = row.TOTAL_DEFICIENCY_COUNT;
//               console.log(`Deficiency: ${deficiency}, Total Count: ${totalDeficiencyCount}`);
//             });
//             console.log('-----------------------------');
//           });
//         })
//         .catch((error) => {
//           console.error('Error:', error);
//         });
//     } else {
//       console.log('No date with non-NIL deficiencies found.');
//     }
//   })
//   .catch((error) => {
//     console.error('Error:', error);
//   });


const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Devansh@2010',
    database: 'point_crossing',
});



db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    throw err;
  }
  console.log('Connected to MySQL database');
});

function executeQuery(query, values) {
  return new Promise((resolve, reject) => {
    db.query(query, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

async function fetchDataAndCombine(callback) {
  try {
    // Step 1: Fetch distinct SR_DEN values
    const distinctSRDENQuery = `
      SELECT DISTINCT SR_DEN
      FROM main_sheet;
    `;

    const srDenResults = await executeQuery(distinctSRDENQuery);

    // Create an object to store the final result
    const finalResult = {};

    // Step 2: Loop through distinct SR_DEN values
    for (const srDenRow of srDenResults) {
      const srDenValue = srDenRow.SR_DEN;

      // Execute the SQL query for the current SR_DEN value
      const query = `
        SELECT
          DEFICIENCIES AS DEFICIENCY,
          SUM(CASE WHEN DEFICIENCIES != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
        FROM (
          SELECT
            GEAR_ID,
            MAX(date_of_inspection) AS LAST_ENTRY_DATE
          FROM data_table
          WHERE STN_CODE = 'FDB'
            AND GEAR = 'POINT'
            AND SR_DEN = ?
          GROUP BY GEAR_ID
        ) last_entry_dates
        JOIN data_table ON last_entry_dates.GEAR_ID = data_table.GEAR_ID AND last_entry_dates.LAST_ENTRY_DATE = data_table.date_of_inspection
        GROUP BY DEFICIENCIES
        HAVING DEFICIENCIES != 'NIL'
        ORDER BY DEFICIENCIES;
      `;

      const queryResults = await executeQuery(query, [srDenValue]);

      // Store the data in the final result
      const resultForSRDen = queryResults.map((row) => {
        return {
          DEFICIENCY: row.DEFICIENCY,
          TOTAL_DEFICIENCY_COUNT: row.TOTAL_DEFICIENCY_COUNT,
        };
      });

      finalResult[srDenValue] = resultForSRDen;
    }

    // Execute the query without the SR_DEN condition
    const queryWithoutSRDen = `
      SELECT
        DEFICIENCIES AS DEFICIENCY,
        SUM(CASE WHEN DEFICIENCIES != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
      FROM (
        SELECT
          GEAR_ID,
          MAX(date_of_inspection) AS LAST_ENTRY_DATE
        FROM data_table
        WHERE STN_CODE = 'FDB'
          AND GEAR = 'POINT'
        GROUP BY GEAR_ID
      ) last_entry_dates
      JOIN data_table ON last_entry_dates.GEAR_ID = data_table.GEAR_ID AND last_entry_dates.LAST_ENTRY_DATE = data_table.date_of_inspection
      GROUP BY DEFICIENCIES
      HAVING DEFICIENCIES != 'NIL'
      ORDER BY DEFICIENCIES;
    `;

    const queryWithoutSRDenResults = await executeQuery(queryWithoutSRDen);

    // Store the result without SR_DEN
    finalResult['Without SR_DEN'] = queryWithoutSRDenResults.map((row) => {
      return {
        DEFICIENCY: row.DEFICIENCY,
        TOTAL_DEFICIENCY_COUNT: row.TOTAL_DEFICIENCY_COUNT,
      };
    });

    callback(finalResult);
  } catch (error) {
    console.error('Error:', error);
    callback({ error: 'Internal Server Error' });
  }
}

// Usage example
fetchDataAndCombine((data) => {
  console.log(data); // This will print the combined data
});


// db.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL:', err);
//     throw err;
//   }
//   console.log('Connected to MySQL database');

// });


// function fetchDataAndCombine(callback) {
//   // Step 1: Fetch distinct SR_DEN values
//   const distinctSRDENQuery = `
//     SELECT DISTINCT SR_DEN
//     FROM main_sheet;
//   `;

//   db.query(distinctSRDENQuery, (err, srDenResults) => {
//     if (err) {
//       console.error('Error fetching distinct SR_DEN values:', err);
//       callback({ error: 'Internal Server Error' });
//       return;
//     }

//     // Create an object to store the final result
//     const finalResult = {};

//     // Step 2: Loop through distinct SR_DEN values
//     srDenResults.forEach((srDenRow) => {
//       const srDenValue = srDenRow.SR_DEN;

//       // Step 3: Execute the SQL query for the current SR_DEN value
//       const query = `
//         SELECT
//           DEFICIENCIES AS DEFICIENCY,
//           SUM(CASE WHEN DEFICIENCIES != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
//         FROM (
//           SELECT
//             GEAR_ID,
//             MAX(date_of_inspection) AS LAST_ENTRY_DATE
//           FROM data_table
//           WHERE STN_CODE = 'FDB'
//             AND GEAR = 'POINT'
//             AND SR_DEN = ?
//           GROUP BY GEAR_ID
//         ) last_entry_dates
//         JOIN data_table ON last_entry_dates.GEAR_ID = data_table.GEAR_ID AND last_entry_dates.LAST_ENTRY_DATE = data_table.date_of_inspection
//         GROUP BY DEFICIENCIES
//         HAVING DEFICIENCIES != 'NIL'
//         ORDER BY DEFICIENCIES;
//       `;

//       db.query(query, [srDenValue], (err, queryResults) => {
//         if (err) {
//           console.error('Error executing query:', err);
//           callback({ error: 'Internal Server Error' });
//           return;
//         }

//         // Step 4: Store the data in the final result
//         queryResults.forEach((row) => {
//           const deficiency = row.DEFICIENCY;
//           if (!finalResult[deficiency]) {
//             finalResult[deficiency] = {
//               DEFICIENCY: deficiency,
//               TOTAL_DEFICIENCY_COUNT: 0,
//             };
//           }
//           finalResult[deficiency][`SR_DEN/${srDenValue}`] = row.TOTAL_DEFICIENCY_COUNT;
//         });

//         // Step 5: Continue to the next SR_DEN value
//         if (Object.keys(finalResult).length === srDenResults.length) {
//           // Step 6: Execute the query without the SR_DEN condition
//           const queryWithoutSRDen = `
//             SELECT
//               DEFICIENCIES AS DEFICIENCY,
//               SUM(CASE WHEN DEFICIENCIES != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
//             FROM (
//               SELECT
//                 GEAR_ID,
//                 MAX(date_of_inspection) AS LAST_ENTRY_DATE
//               FROM data_table
//               WHERE STN_CODE = 'FDB'
//                 AND GEAR = 'POINT'
//               GROUP BY GEAR_ID
//             ) last_entry_dates
//             JOIN data_table ON last_entry_dates.GEAR_ID = data_table.GEAR_ID AND last_entry_dates.LAST_ENTRY_DATE = data_table.date_of_inspection
//             GROUP BY DEFICIENCIES
//             HAVING DEFICIENCIES != 'NIL'
//             ORDER BY DEFICIENCIES;
//           `;

//           db.query(queryWithoutSRDen, (err, queryWithoutSRDenResults) => {
//             if (err) {
//               console.error('Error executing query without SR_DEN condition:', err);
//               callback({ error: 'Internal Server Error' });
//               return;
//             }

//             // Step 7: Add the results of the query without SR_DEN to the final result
//             queryWithoutSRDenResults.forEach((row) => {
//               const deficiency = row.DEFICIENCY;
//               if (!finalResult[deficiency]) {
//                 finalResult[deficiency] = {
//                   DEFICIENCY: deficiency,
//                   TOTAL_DEFICIENCY_COUNT: 0,
//                 };
//               }
//               finalResult[deficiency]['Without SR_DEN'] = row.TOTAL_DEFICIENCY_COUNT;
//             });

//             // Step 8: Convert the final result to an array
//             const dataArray = Object.values(finalResult);
//             console.log(dataArray);

//             // Step 9: Continue to the next SR_DEN value
//             if (Object.keys(finalResult).length === srDenResults.length) {
//               callback(dataArray);
//             }
//           });
//         }
//       });
//     });
//   });
// }

// Usage example
// fetchDataAndCombine((data) => {
//   console.log(data); // This will print the combined data
// });


// function fetchDataAndCombine(callback) {
//   // Step 1: Fetch distinct SR_DEN values
//   const distinctSRDENQuery = `
//     SELECT DISTINCT SR_DEN
//     FROM main_sheet;
//   `;

//   db.query(distinctSRDENQuery, (err, srDenResults) => {
//     if (err) {
//       console.error('Error fetching distinct SR_DEN values:', err);
//       callback({ error: 'Internal Server Error' });
//       return;
//     }

//     // Step 2: Create an object to store the final result
//     const finalResult = {};

//     // Step 3: Loop through distinct SR_DEN values
//     srDenResults.forEach((srDenRow) => {
//       const srDenValue = srDenRow.SR_DEN;

//       // Step 4: Execute the first SQL query for the current SR_DEN value
//       const firstQuery = `
//         SELECT
//           DEFICIENCIES AS DEFICIENCY,
//           SUM(CASE WHEN DEFICIENCIES != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
//         FROM (
//           SELECT
//             GEAR_ID,
//             MAX(date_of_inspection) AS LAST_ENTRY_DATE
//           FROM data_table
//           WHERE STN_CODE = 'FDB'
//             AND GEAR = 'POINT'
//             AND SR_DEN = ?
//           GROUP BY GEAR_ID
//         ) last_entry_dates
//         JOIN data_table ON last_entry_dates.GEAR_ID = data_table.GEAR_ID AND last_entry_dates.LAST_ENTRY_DATE = data_table.date_of_inspection
//         GROUP BY DEFICIENCIES
//         HAVING DEFICIENCIES != 'NIL'
//         ORDER BY DEFICIENCIES;
//       `;

//       db.query(firstQuery, [srDenValue], (err, firstQueryResults) => {
//         if (err) {
//           console.error('Error executing first query:', err);
//           callback({ error: 'Internal Server Error' });
//           return;
//         }

//         // Step 5: Execute the second SQL query (without SR_DEN condition)
//         const secondQuery = `
//           SELECT
//             DEFICIENCIES AS DEFICIENCY,
//             SUM(CASE WHEN DEFICIENCIES != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
//           FROM (
//             SELECT
//               GEAR_ID,
//               MAX(date_of_inspection) AS LAST_ENTRY_DATE
//             FROM data_table
//             WHERE STN_CODE = 'FDB'
//               AND GEAR = 'POINT'
//             GROUP BY GEAR_ID
//           ) last_entry_dates
//           JOIN data_table ON last_entry_dates.GEAR_ID = data_table.GEAR_ID AND last_entry_dates.LAST_ENTRY_DATE = data_table.date_of_inspection
//           GROUP BY DEFICIENCIES
//           HAVING DEFICIENCIES != 'NIL'
//           ORDER BY DEFICIENCIES;
//         `;

//         db.query(secondQuery, (err, secondQueryResults) => {
//           if (err) {
//             console.error('Error executing second query:', err);
//             callback({ error: 'Internal Server Error' });
//             return;
//           }

//           // Step 6: Store the data in the final result
//           finalResult[srDenValue] = {
//             SR_DEN: srDenValue,
//             WITH_SR_DEN: firstQueryResults,
//             WITHOUT_SR_DEN: secondQueryResults,
//           };

//           // Step 7: Continue to the next SR_DEN value
//           if (Object.keys(finalResult).length === srDenResults.length) {
//             callback(finalResult);
//           }
//         });
//       });
//     });
//   });
// }

// Usage example
// fetchDataAndCombine((data) => {
//   console.log(data); // This will print the combined data
// });


// Function to find the latest date with non-'NIL' deficiencies
// pool.query((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL:', err);
//     throw err;
//   }
//   console.log('Connected to MySQL database');
// });

// function fetchDataAndCombine(callback) {
//   const combinedQuery = `
//     SELECT
//       DEFICIENCIES AS DEFICIENCY,
//       SUM(CASE WHEN DEFICIENCIES != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT,
//       GROUP_CONCAT(SR_DEN) AS SR_DEN_VALUES
//     FROM (
//       SELECT
//         GEAR_ID,
//         MAX(date_of_inspection) AS LAST_ENTRY_DATE
//       FROM data_table
//       WHERE STN_CODE = 'FDB'
//         AND GEAR = 'POINT'
//       GROUP BY GEAR_ID
//     ) last_entry_dates
//     JOIN data_table ON last_entry_dates.GEAR_ID = data_table.GEAR_ID AND last_entry_dates.LAST_ENTRY_DATE = data_table.date_of_inspection
//     GROUP BY DEFICIENCIES
//     HAVING DEFICIENCIES != 'NIL'
//     ORDER BY DEFICIENCIES;
//   `;

//   pool.query(combinedQuery, (err, results) => {
//     if (err) {
//       console.error('Error executing combined query:', err);
//       callback({ error: 'Internal Server Error' });
//       return;
//     }

//     const formattedData = results.map((row) => {
//       const deficiency = row.DEFICIENCY;
//       const totalDeficiencyCount = row.TOTAL_DEFICIENCY_COUNT;
//       const srDenValues = row.SR_DEN_VALUES.split(',');

//       return {
//         DEFICIENCY: deficiency,
//         TOTAL_DEFICIENCY_COUNT: totalDeficiencyCount,
//         SR_DEN_VALUES: srDenValues,
//       };
//     });

//     callback(formattedData);
//   });
// }

// // Usage example
// fetchDataAndCombine((data) => {
//   console.log(data); // This will print the combined data
// });

