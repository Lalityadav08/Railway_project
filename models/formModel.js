const res = require('express/lib/response');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const express = require('express');
// const multer = require('multer');
const app = express();
const fileUpload = require('express-fileupload');
const { execFileSync } = require('child_process');
const moment = require('moment');


// app.use(multer({dest:'imageInput'}).single('imageInput'))


const connection = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'Devansh@2010',
  database: 'point_crossing',
  keepAlive: true
});


exports.findUserByUsername = (username, callback) => {


  connection.query('SELECT * FROM users WHERE email = ?', [username], (err, results) => {
    ;
    if (err) {
      console.log('error', err)
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(null, null);
    }
    return callback(null, results[0]);
  });
};

exports.comparePasswords = (password, hashedPassword, callback) => {
  bcrypt.compare(password, hashedPassword, (err, result) => {
    if (err) {
      console.log('error', err)
      return callback(err, false);
    }
    return callback(null, result);
  });
};



exports.saveUser = (userData) => {
  return new Promise((resolve, reject) => {

    connection.query('INSERT INTO users (username, email, password, hashedPassword, preferences) VALUES (?, ?, ?, ?,?)', [
      userData.name,
      userData.email,
      userData.password,
      userData.hashedPassword, // Make sure it's already hashed
      userData.preferences,
    ], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });

  });
};

exports.findUserById = (id, callback) => {

  const query = 'SELECT * FROM users WHERE ID = ?';
  connection.query(query, [id], (error, results) => {
    if (error) {
      console.log(error)
      return callback(error, null)
    } else {
      const user = results[0];
      return callback(null, user)
    }
  });

};


exports.findUserByEmail = (email, callback) => {


  connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    ;
    if (err) {
      console.log('error', err)
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(null, null);
    }
    return callback(null, results[0]);
  });
};



exports.fetchStationNames = (option, optionDetails) => {
  return new Promise((resolve, reject) => {
    const query = option ? `SELECT DISTINCT STN_Code FROM main_sheet where ${option} = '${optionDetails}'` : 'SELECT DISTINCT STN_Code FROM main_sheet'
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        const stationNames = results.map(result => result.STN_Code);
        resolve(stationNames);
      }
    });
  });
};


exports.fetchZoneForGearForm = () => {
  return new Promise((resolve, reject) => {
    const query = 'select ZONE from zone';
    connection.query(query, (error, results) => {
      if (error) {

        reject(error);
      } else {
        const Zone = results.map(result => result.ZONE);
        resolve(Zone);
      }
    });
  });
};

exports.fetchGearType = () => {
  return new Promise((resolve, reject) => {
    const query = 'select DISTINCT GEAR_TYPE from gear_type';
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        const gearType = results.map(result => result.GEAR_TYPE);
        resolve(gearType);
      }
    });
  });
};

exports.fetchGearTypePoint = () => {
  return new Promise((resolve, reject) => {
    const query = 'select DisTINCT point_type from gear_type_point';
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        const point = results.map(result => result.point_type);
        resolve(point);
      }
    });
  });
};

exports.fetchGearTypeTrackCircuit = () => {
  return new Promise((resolve, reject) => {
    const query = 'select DISTINCT track_circuit_type from gear_type_track_circuit';
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        const track = results.map(result => result.track_circuit_type);
        resolve(track);
      }
    });
  });
};

exports.fetchSelectedOptions = (option) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT DISTINCT ${option} AS "col" FROM main_sheet`
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {

        const optionNames = results.map(result => result.col);
        resolve(optionNames);
      }
    });
  });
};


exports.fetchGearsByStation = (stationName) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT DISTINCT Gear_type FROM gear_wise WHERE STN_Code = ?', [stationName], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

exports.fetchGears = () => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT DISTINCT Gear_type FROM gear_wise', (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

exports.fetchZone = (stationName, gearName) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT DISTINCT Zone FROM gear_wise WHERE STN_Code = ? and Gear_type = ?', [stationName, gearName], (error, results) => {
      ;
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};


exports.fetchGearIDsByStationAndGear = (stationName, gear, Zone, Type, date) => {
  return new Promise((resolve, reject) => {
    console.log(date);
    console.log(gear)
    console.log(Type)
    // Calculate 15 days before and after the provided date
    const startDate = new Date(date);
    const endDate = new Date(date);
    startDate.setDate(startDate.getDate() - 15);
    endDate.setDate(endDate.getDate() + 15);

    console.log(typeof (d))
    let condition

    if (Gear = 'Track Circuit'){
      condition = ''
    }
    else {
      condition = `AND Type ='${Type}'`
    }

    if (!Zone || Zone === "NZ") {
      queryWithoutDate = `
        SELECT DISTINCT gear_ID 
        FROM gear_wise 
        WHERE STN_Code = '${stationName}' 
        AND Gear_type = '${gear}' 
        ${condition}
      `;
      queryWithDate = `
        SELECT DISTINCT gear_ID 
        FROM data_table 
        WHERE STN_Code = '${stationName}' 
          AND GEAR = '${gear}' 
          ${condition}
          AND Date_of_inspection BETWEEN '${startDate.toISOString().slice(0, 10)}' AND '${endDate.toISOString().slice(0, 10)}'
      `;
    } else {
      queryWithoutDate = `
        SELECT DISTINCT gear_ID 
        FROM gear_wise 
        WHERE STN_Code = '${stationName}' 
          AND Gear_type = '${gear}' 
          ${condition}
          AND Zone ='${Zone}'
      `;
      queryWithData = `
        SELECT DISTINCT gear_ID 
        FROM data_table 
        WHERE STN_Code = '${stationName}' 
          AND GEAR = '${gear}' 
          ${condition}  
          AND Date_of_inspection BETWEEN '${startDate.toISOString().slice(0, 10)}' AND '${endDate.toISOString().slice(0, 10)}'
      `;
    }

    // Execute the first query to fetch data from gear_wise table
    connection.query(queryWithoutDate, (error1, results1) => {
      if (error1) {
        reject(error1);
        return;
      }
      console.log(results1);

      // Execute the second query to fetch data from data_table
      connection.query(queryWithData, (error2, results2) => {
        if (error2) {
          reject(error2);
          return;
        }
        console.log(results2);

        // Extract gear IDs from the results of the second query
        const gearIDsFromData = results2.map(result => result.gear_ID);

        // Filter out gear IDs obtained from data_table from results1
        const filteredResults = results1.filter(result => !gearIDsFromData.includes(result.gear_ID));
        console.log(filteredResults);

        const responseData = {
          Gear: gear,
          Results1Length: results1.length,
          Date: date
        };

        resolve({ gearIDs: filteredResults, responseData: responseData });
      });
    });
  });
};


exports.fetchDeficiencesByGear = (gear) => {
  return new Promise((resolve, reject) => {
    // we will remove the gear = Point once we have deficiencies for the track circuit""
    let query = gear == "Track Circuit" ? `SELECT DISTINCT Track_circuit AS "list" FROM deficiencies_list_Track` : `SELECT DISTINCT ${gear} AS "list" FROM deficiencies_list`;
    console.log(query);
    connection.query(query, [gear], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

exports.fetchLastDateDetails = (stationName, gear, Type, Zone) => {
  return new Promise((resolve, reject) => {
    console.log()

    connection.query(`select Date_of_inspection from data_table where STN_Code = '${stationName}' and GEAR = '${gear}' and Gear_type = '${Type}' and Zone ='${Zone}'ORDER BY Date_of_inspection DESC limit 1`, [stationName, gear,Type,Zone], (error, result) => {
      if (error) {
        console.log(error)
        reject(error)
      } else {

        if (result.length > 0 && result[0].Date_of_inspection) {
          const dbDate = new Date(result[0].Date_of_inspection);

          const currentDate = new Date();

          const dateString = dbDate.toISOString().split('T')[0];

          const timeDiff = currentDate - dbDate;

          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

          resolve({ days: days, date: dateString })
        } else {
          resolve({ days: 0, date: 'NONE' })
        }
      }
    });
  });
};


//new updated perform update
exports.performUpdate = (formData) => {
  return new Promise((resolve, reject) => {

    connection.query(`SELECT * FROM main_sheet WHERE STN_Code = ?`, [formData.updatedData.stationName], (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        reject(new Error('Station not found'));
      } else {
        const firstElement = results[0];
        const dataToInsert = {
          STN_CODE: formData.updatedData.stationName,
          STN_NAME: firstElement.STN_Name,
          GEAR: formData.updatedData.gear,
          GEAR_ID: formData.updatedData.gearID,
          Gear_type: formData.updatedData.Type,
          SECTION: firstElement.Section,
          ROUTE: firstElement.Route,
          SI: firstElement.SI,
          CSI: firstElement.CSI,
          ADSTE: firstElement.ADSTE,
          SR_DSTE: firstElement.Sr_DSTE,
          PWI: firstElement.PWI,
          CPWI: firstElement.CPWI,
          AEN: firstElement.AEN,
          SR_DEN: firstElement.Sr_DEN,
          Date_of_inspection: formatDate(formData.updatedData.date)
        };

        // Create an array to hold all the promises
        const promises = [];

        if (!formData.deletedArray.length) {
          // If the array is empty, create and resolve a promise immediately
          promises.push(Promise.resolve());
        } else {
          // If the array is not empty, perform the deletion operation and resolve the promise
          promises.push(
            new Promise((resolve, reject) => {
              const query = 'DELETE FROM data_table WHERE SR_NO IN (?)';
              connection.query(query, [formData.deletedArray], (err, results) => {
                if (err) {
                  console.error('Error deleting data:', err);
                  reject(err);
                } else {
                  resolve();
                }
              });
            })
          );
        }

        if (!formData.updatedArray.length) {
          promises.push(Promise.resolve());
        } else {
          formData.updatedArray.forEach((deficiencyObj) => {
            let newDeficiency = deficiencyObj.deficiency;
            let defi_num = deficiencyObj.description;

            const dataWithDeficiency = {
              ...dataToInsert,
              GEAR_ID: formData.updatedData.gearID,
              DEFI_NUM: defi_num,
              DEFICIENCIES: newDeficiency,
            };

            // Push the promise for the current query into the promises array
            promises.push(
              new Promise((resolve, reject) => {
                const query = 'INSERT INTO data_table SET ?';
                connection.query(query, dataWithDeficiency, (err, results) => {
                  if (err) {
                    console.error('Error inserting data:', err);
                    reject(err);
                  } else {
                    resolve();
                  }
                });
              })
            );
          });
        }

        // Handle preselected changes
        if (formData.updatedData.preselectedChangedArray.length) {
          formData.updatedData.preselectedChangedArray.forEach((change) => {
            if (!formData.deletedArray.includes(change.sr_no)) {
              // Update if the serial number is not in the deleted array
              promises.push(
                new Promise((resolve, reject) => {
                  const query = 'UPDATE data_table SET DEFI_NUM = ? WHERE SR_NO = ?';
                  connection.query(query, [ change.description, change.sr_no], (err, results) => {
                    if (err) {
                      console.error('Error updating data:', err);
                      reject(err);
                    } else {
                      resolve();
                    }
                  });
                })
              );
            }
          });
        }

        // Use Promise.all to wait for all promises to resolve
        Promise.all(promises)
          .then(() => {
            let Date_of_inspection = formatDate(formData.updatedData.date);
            const responseData = {
              stationName: formData.updatedData.stationName,
              gear: formData.updatedData.gear,
              Date_of_inspection: Date_of_inspection
            };

            resolve(responseData);
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  });
};


// exports.performUpdate = (formData) => {
//   return new Promise((resolve, reject) => {

//     connection.query(`SELECT * FROM main_sheet where STN_Code = ?`, [formData.updatedData.stationName], (error, results) => {
//       if (error) {
//         reject(error);
//       } else if (results.length === 0) {
//         reject(new Error('Station not found'));
//       } else {
//         const firstElement = results[0];
//         const dataToInsert = {
//           STN_CODE: formData.updatedData.stationName,
//           STN_NAME: firstElement.STN_Name,
//           GEAR: formData.updatedData.gear,
//           GEAR_ID: formData.updatedData.gearID,
//           Gear_type: formData.updatedData.Type,
//           SECTION: firstElement.Section,
//           ROUTE: firstElement.Route,
//           SI: firstElement.SI,
//           CSI: firstElement.CSI,
//           ADSTE: firstElement.ADSTE,
//           SR_DSTE: firstElement.Sr_DSTE,
//           PWI: firstElement.PWI,
//           CPWI: firstElement.CPWI,
//           AEN: firstElement.AEN,
//           SR_DEN: firstElement.Sr_DEN,
//           Date_of_inspection: formatDate(formData.updatedData.date)
//         };

//         // Create an array to hold all the promises
//         const promises = [];
//         if (!formData.deletedArray.length) {
//           // If the array is empty, create and resolve a promise immediately
//           promises.push(Promise.resolve());
//         } else {
//           // If the array is not empty, perform the deletion operation and resolve the promise
//           promises.push(
//             new Promise((resolve, reject) => {
//               const query = 'DELETE FROM data_table WHERE SR_NO IN (?)';
//               formData.deletedArray.forEach((value) => {
//                 connection.query(query, value, (err, results) => {
//                   if (err) {
//                     console.error('Error deleting data:', err);
//                     reject(err);
//                   } else {

//                     resolve();
//                   }
//                 });
//               });
//             })
//           );
//         }
//         if (!formData.updatedArray.length) {
//           promises.push(Promise.resolve());
//         } else {
//           formData.updatedArray.forEach((deficiencyObj) => {
//             let newDeficiency = deficiencyObj.deficiency;
//             let defi_num = deficiencyObj.description;

            
//             const dataWithDeficiency = {
//               ...dataToInsert,
//               GEAR_ID: formData.updatedData.gearID,
//               DEFI_NUM: defi_num,
//               DEFICIENCIES: newDeficiency,
//             };

//             // Push the promise for the current query into the promises array
//             promises.push(
//               new Promise((resolve, reject) => {
//                 const query = 'INSERT INTO data_table SET ?';
//                 connection.query(query, dataWithDeficiency, (err, results) => {
//                   if (err) {
//                     console.error('Error inserting data:', err);
//                     reject(err);
//                   } else {
//                     resolve();

//                   }
//                 });
//               })
//             );
//           });
//         }

//         // Use Promise.all to wait for all promises to resolve
//         Promise.all(promises)
//           .then(() => {
//             let Date_of_inspection = formatDate(formData.updatedData.date);
//             responseData = {
//               stationName: formData.updatedData.stationName,
//               gear: formData.updatedData.gear,
//               Date_of_inspection: Date_of_inspection
//             }

//             resolve(responseData);

//           })
//           .catch((error) => {
//             reject(error);
//           });
//       }
//     });
//   });
// };

exports.renderResponseTable = (responseData) => {
  return new Promise((resolve, reject) => {

    connection.query(`WITH DataCTE AS (
            SELECT
                STN_code,
                Gear,
                Gear_ID,
                DATE_FORMAT(Date_of_inspection, '%Y-%m-%d') AS Date_of_inspection,
                GROUP_CONCAT(SR_NO ORDER BY SR_NO) AS SR_NO,
                GROUP_CONCAT(DEFICIENCIES) AS DEFICIENCIES
            FROM
                data_table
            WHERE
              STN_code = ? and Gear = ? and Date_of_inspection = ? 
            GROUP BY
                
                STN_code,
                Gear,
                Gear_ID,
                DATE_FORMAT(Date_of_inspection, '%Y-%m-%d')
                )
                
                SELECT
              
              STN_code,
              Gear,
              Gear_ID,
              Date_of_inspection,
              CONCAT('[', SR_NO, ']') AS SR_NO,
              CONCAT('', DEFICIENCIES, '') AS DEFICIENCIES
          FROM
              DataCTE;`, [formData.responseData.stationName, formData.responseData.gear, Date_of_inspection], (err, data) => {
      if (err) {
        console.error('Error fetching data:', err);
        reject(err);
      } else {


        resolve(data);
      }
    });


  })
}

exports.addNewGear = (formData) => {
  return new Promise((resolve, reject) => {


    // Check if formData has Type_Point or Type_Track property
    let typeValue;
    if (formData.hasOwnProperty('Type_Point')) {
      typeValue = formData.Type_Point;
    } else if (formData.hasOwnProperty('Type_Track')) {
      typeValue = formData.Type_Track;
    }

    // Filter out null gear IDs
    const gearIds = formData.Gear_ID.filter(id => id);

    // Perform insertion for each gear ID
    const promises = gearIds.map(gearId => {
      // Prepare data object for insertion
      const data = {
        STN_CODE: formData.STN_CODE,
        Gear_type: formData.Gear_type,
        Gear_Id: gearId.toUpperCase(),
        Zone: formData.Zone,
        Type: typeValue,
      };



      // Perform the database insertion
      const query = 'INSERT INTO gear_wise SET ?';
      return new Promise((resolve, reject) => {
        connection.query(query, data, (err, results) => {
          if (err) {
            console.error('Error inserting data:', err);
            reject(err);
          } else {
            ;
            resolve();
          }
        });
      });
    });

    // Resolve when all insertions are completed
    Promise.all(promises)
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
};



exports.addNewDeficiency = (formData) => {
  return new Promise((resolve, reject) => {

    let query = formData.Gear_type_value == "Track Circuit" ? 'INSERT INTO deficiencies_list_Track (Track_circuit) VALUES ?' : 'INSERT INTO deficiencies_list (Point) VALUES ?';

    let values = formData.Deficiency.map(deficiency => [deficiency]);

    connection.query(query, [values], (err, results) => {
      if (err) {
        console.error('Error inserting data:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};


exports.addNewPriorityDeficiency = (formData) => {
  return new Promise((resolve, reject) => {

    let query = formData.Gear_type_value == "Track Circuit" ? 'INSERT INTO priority_deficiencies_track (Deficiencies) VALUES ?' : 'INSERT INTO priority_Deficiencies_point (Deficiencies) VALUES ?';

    let values = formData.Deficiency.map(deficiency => [deficiency]);

    connection.query(query, [values], (err, results) => {
      if (err) {
        console.error('Error inserting data:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};




// exports.saveFormToDatabase = (formData) => {
//   return new Promise((resolve, reject) => {
//     let totalGearIDs = 0;
//     let gear_type_value;

//     for (const key in formData) {
//       if (key.startsWith('gearID')) {
//         totalGearIDs++;
//       }
//     }

//     const query = 'INSERT INTO data_table SET ?';
//     const gearIDKeys = [];
//     const deficienciesKeys = [];


//     for (let i = 3; i <= totalGearIDs + 3; i++) {
//       gearIDKeys.push(`gearID${i}`);
//       deficienciesKeys.push(`deficiencies${i}`);

//     }

//     connection.query('SELECT * FROM main_sheet WHERE STN_Code = ?', [formData.stationName], (error, results) => {
//       if (error) {
//         reject(error);
//         return;
//       }

//       if (results.length === 0) {
//         reject(new Error('Station not found'));
//         return;
//       }

//       const firstElement = results[0];
//       const dataToInsert = {
//         STN_CODE: formData.stationName,
//         STN_NAME: firstElement.STN_Name,
//         GEAR: formData.gear,
//         GEAR_ID: formData.gearID,
//         Zone: formData.zone,
//         SECTION: firstElement.Section,
//         ROUTE: firstElement.Route,
//         SI: firstElement.SI,
//         CSI: firstElement.CSI,
//         ADSTE: firstElement.ADSTE,
//         SR_DSTE: firstElement.Sr_DSTE,
//         PWI: firstElement.PWI,
//         CPWI: firstElement.CPWI,
//         AEN: firstElement.AEN,
//         SR_DEN: firstElement.Sr_DEN,
//         Date_of_inspection: formData.dateOfInspection
//       };

//       const promises = [];

//       for (let i = 0; i < gearIDKeys.length; i++) {
//         const gearIDKey = gearIDKeys[i];
//         const deficienciesKey = deficienciesKeys[i];


//         const gearID = formData[gearIDKey];
//         let deficiencies = formData[deficienciesKey];

//         if (!deficiencies) {
//           deficiencies = ['NIL']
//         }

//         if (gearID && gearID !== '' && deficiencies[0] !== 'NIL') {
//           deficiencies.forEach((deficiency) => {
//             const inputName = `deficiencyInput_${i + 3}_${deficiency}`; 
//             const textareaValue = formData[inputName] || '';
//             let defi_num = textareaValue;

//             if (formData.gear === "Track Circuit"){
              
//               console.log("gear_type_value = >" ,gear_type_value)
//             }
            
//             const dataWithDeficiency = {
//               ...dataToInsert,
//               Gear_type: gear_type_value,
//               GEAR_ID: gearID,
//               DEFI_NUM: defi_num,
//               DEFICIENCIES: deficiency,
//             };

//             promises.push(
//               new Promise((resolve, reject) => {
//                 const date = formatDate(dataWithDeficiency.Date_of_inspection);
//                 connection.query(
//                   'DELETE FROM data_table WHERE STN_CODE = ? AND GEAR = ?  AND Gear_type = ? AND GEAR_ID = ? AND Date_of_inspection = ?',
//                   [dataWithDeficiency.STN_CODE, formData.gear, gear_type_value, dataWithDeficiency.GEAR_ID, date],
//                   (err, results) => {
//                     if (err) {
//                       console.error('Error deleting existing data:', err);
//                       reject(err);
//                     } else {
//                       console.log("Data deleted succesfuly", results);
//                       connection.query(query, dataWithDeficiency, (err, results) => {
//                         if (err) {
//                           console.error('Error inserting data:', err);
//                           reject(err);
//                         } else {
//                           resolve();
//                         }
//                       });
//                     }
//                   }
//                 );
//               })
//             );
//           });
//         }
//       }

//       Promise.all(promises)
//         .then(() => {
//           const Date_of_inspection = formatDate(formData.dateOfInspection);
//           connection.query(`SELECT
//               STN_code,
//               Gear,
//               Gear_ID,
//               Gear_type,
//               Date_of_inspection,
//               CONCAT('', SR_NO, '') AS SR_NO,
//               CONCAT('', DEFICIENCIES, '') AS DEFICIENCIES
//             FROM (
//               SELECT
//                 STN_code,
//                 Gear,
//                 Gear_ID,
//                 Gear_type,
//                 DATE_FORMAT(Date_of_inspection, '%Y-%m-%d') AS Date_of_inspection,
//                 GROUP_CONCAT(SR_NO ORDER BY SR_NO) AS SR_NO,
//                 GROUP_CONCAT(DEFICIENCIES) AS DEFICIENCIES
//               FROM
//                 data_table
//               WHERE
//                 STN_code = ? and Gear = ? and Date_of_inspection = ? and Gear_type = ? 
//               GROUP BY
//                 STN_code,
//                 Gear,
//                 Gear_ID,
//                 Gear_type,
//                 DATE_FORMAT(Date_of_inspection, '%Y-%m-%d')
//             ) AS DataSubquery
//             WHERE
//               DEFICIENCIES <> 'Notttt NIL';
//           `, [formData.stationName, formData.gear, Date_of_inspection, gear_type_value], (err, data) => {
//             if (err) {
//               console.error('Error fetching data:', err);
//               reject(err);
//             } else {
//               data.sort((a, b) => {
//                 if (a.DEFICIENCIES === 'Nil' && b.DEFICIENCIES !== 'Nil') {
//                   return 1; // Move 'Nil' DEFICIENCIES to the end
//                 } else if (a.DEFICIENCIES !== 'Nil' && b.DEFICIENCIES === 'Nil') {
//                   return -1; // Keep non-'Nil' DEFICIENCIES at the beginning
//                 } else {
//                   return 0; 
//                 }
//               });
    
//               resolve(data);
//             }
//           });
//         })
//         .catch((error) => {
//           reject(error);
//         });
//     });
//   });
// };

exports.saveFormToDatabase = (formData) => {
  return new Promise((resolve, reject) => {
    let totalGearIDs = 0;
    let gear_type_value = null; // Initialize gear_type_value at the top

    // Count total gear IDs
    for (const key in formData) {
      if (key.startsWith('gearID')) {
        totalGearIDs++;
      }
    }

    const query = 'INSERT INTO data_table SET ?';
    const gearIDKeys = [];
    const deficienciesKeys = [];

    for (let i = 3; i <= totalGearIDs + 3; i++) {
      gearIDKeys.push(`gearID${i}`);
      deficienciesKeys.push(`deficiencies${i}`);
    }

    // Fetch station data
    connection.query('SELECT * FROM main_sheet WHERE STN_Code = ?', [formData.stationName], (error, results) => {
      if (error) {
        reject(error);
        return;
      }

      if (results.length === 0) {
        reject(new Error('Station not found'));
        return;
      }

      const firstElement = results[0];
      const dataToInsert = {
        STN_CODE: formData.stationName,
        STN_NAME: firstElement.STN_Name,
        GEAR: formData.gear,
        GEAR_ID: formData.gearID,
        Zone: formData.zone,
        SECTION: firstElement.Section,
        ROUTE: firstElement.Route,
        SI: firstElement.SI,
        CSI: firstElement.CSI,
        ADSTE: firstElement.ADSTE,
        SR_DSTE: firstElement.Sr_DSTE,
        PWI: firstElement.PWI,
        CPWI: firstElement.CPWI,
        AEN: firstElement.AEN,
        SR_DEN: firstElement.Sr_DEN,
        Date_of_inspection: formData.dateOfInspection
      };

      // Fetch the gear type based on the gear ID and station info
      const fetchGearTypeQuery = `SELECT gear_ID, Type 
                                  FROM gear_wise 
                                  WHERE STN_Code = ? 
                                  AND Gear_type = ? 
                                  AND Zone = ?`;

      connection.query(fetchGearTypeQuery, [formData.stationName, formData.gear, formData.zone], (error, gearIdWithTypeResult) => {
        if (error) {
          reject(error);
          return;
        }

        let promises = [];

        for (let i = 0; i < gearIDKeys.length; i++) {
          const gearIDKey = gearIDKeys[i];
          const deficienciesKey = deficienciesKeys[i];

          const gearID = formData[gearIDKey];
          let deficiencies = formData[deficienciesKey];

          if (!deficiencies) {
            deficiencies = ['NIL'];
          }

          if (gearID && gearID !== '' && deficiencies[0] !== 'NIL') {
            deficiencies.forEach((deficiency) => {
              const inputName = `deficiencyInput_${i + 3}_${deficiency}`;
              const textareaValue = formData[inputName] || '';
              let defi_num = textareaValue;

              // Get gear type value based on the gear ID
              if (formData.gear === "Track Circuit") {
                const gearRecord = gearIdWithTypeResult.find(row => row.gear_ID === gearID);
                if (gearRecord) {
                  gear_type_value = gearRecord.Type;
                  console.log("gear_type_value =>", gear_type_value);
                } else {
                  console.log("No matching gear ID found.");
                 
                }
              } else {
                gear_type_value = formData.gear_Point  
              }

              if (!gear_type_value) {
                console.error("gear_type_value is not set for gearID:", gearID);
              }

              const dataWithDeficiency = {
                ...dataToInsert,
                Gear_type: gear_type_value,
                GEAR_ID: gearID,
                DEFI_NUM: defi_num,
                DEFICIENCIES: deficiency,
              };

              promises.push(
                new Promise((resolve, reject) => {
                  const date = formatDate(dataWithDeficiency.Date_of_inspection);
                  connection.query(
                    'DELETE FROM data_table WHERE STN_CODE = ? AND GEAR = ? AND Gear_type = ? AND GEAR_ID = ? AND Date_of_inspection = ?',
                    [dataWithDeficiency.STN_CODE, formData.gear, gear_type_value, dataWithDeficiency.GEAR_ID, date],
                    (err, results) => {
                      if (err) {
                        console.error('Error deleting existing data:', err);
                        reject(err);
                      } else {
                        console.log("Data deleted successfully", results);
                        connection.query(query, dataWithDeficiency, (err, results) => {
                          if (err) {
                            console.error('Error inserting data:', err);
                            reject(err);
                          } else {
                            resolve();
                          }
                        });
                      }
                    }
                  );
                })
              );
            });
          }
        }

        // Resolve the promises
        Promise.all(promises)
          .then(() => {
            const Date_of_inspection = formatDate(formData.dateOfInspection);
            console.log("Gear type value before querying:", gear_type_value); // Check here
            
            connection.query(`SELECT
                STN_code,
                Gear,
                Gear_ID,
                Gear_type,
                Date_of_inspection,
                CONCAT('', SR_NO, '') AS SR_NO,
                CONCAT('', DEFICIENCIES, '') AS DEFICIENCIES
              FROM (
                SELECT
                  STN_code,
                  Gear,
                  Gear_ID,
                  Gear_type,
                  DATE_FORMAT(Date_of_inspection, '%Y-%m-%d') AS Date_of_inspection,
                  GROUP_CONCAT(SR_NO ORDER BY SR_NO) AS SR_NO,
                  GROUP_CONCAT(DEFICIENCIES) AS DEFICIENCIES
                FROM
                  data_table
                WHERE
                  STN_code = ? and Gear = ? and Date_of_inspection = ? and Gear_type = ? 
                GROUP BY
                  STN_code,
                  Gear,
                  Gear_ID,
                  Gear_type,
                  DATE_FORMAT(Date_of_inspection, '%Y-%m-%d')
              ) AS DataSubquery
              WHERE
                DEFICIENCIES <> 'NIL';
            `, [formData.stationName, formData.gear, Date_of_inspection, gear_type_value], (err, data) => {
              if (err) {
                console.error('Error fetching data:', err);
                reject(err);
              } else {
                data.sort((a, b) => {
                  if (a.DEFICIENCIES === 'Nil' && b.DEFICIENCIES !== 'Nil') {
                    return 1; // Move 'Nil' DEFICIENCIES to the end
                  } else if (a.DEFICIENCIES !== 'Nil' && b.DEFICIENCIES === 'Nil') {
                    return -1; // Keep non-'Nil' DEFICIENCIES at the beginning
                  } else {
                    return 0;
                  }
                });

                resolve(data);
              }
            });
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  });
};






function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


exports.saveFormToDatabaseGear = (formData) => {

  return new Promise((resolve, reject) => {
    let totalGearIDs = 0;
    let repeat_entry = false;
    const fetchedDataArray = [];
    if (formData.gear_Point == '') {
      gear_type_value = formData.gear_Track
    }
    else {
      gear_type_value = formData.gear_Point
    }
    for (const key in formData) {
      if (key.startsWith('gearID')) {
        totalGearIDs++;
      }
    }
    connection.query(`SELECT * FROM main_sheet WHERE STN_Code = "${formData.stationName}"`, formData, (error, results) => {
      if (error) {
        reject(error);
      } else {
        let defi_num;
        let newDeficiency = formData.deficiencies;
        let deficiency = formData.deficiencies;
        if (deficiency === 'stud bolt loose' && formData.Loose_gear > 1) {

          defi_num = formData.Loose_gear;
        } else if (deficiency === 'L.H.S. housing poor' && formData.LHS_gear > 1) {
          defi_num = formData.LHS_gear;
        } else if (deficiency === 'R.H.S. housing poor' && formData.RHS_gear > 1) {
          defi_num = formData.RHS_gear
        } else if (deficiency === 'Chair plated broken' && formData.Chair_gear > 1) {
          defi_num = formData.Chair_gear;
        } else if (deficiency === 'Guage tie plate bracket welding broken' && formData.Guage_gear > 1) {
          defi_num = formData.Guage_gear;
        } else if (deficiency === 'Guage tie plate bracket broken' && formData.Guage_Tie_gear > 1) {
          defi_num = formData.Guage_Tie_gear;
        }
        else {
          defi_num = 0;
        }
        const firstElement = results[0];
        const dataToInsert = {
          STN_CODE: formData.stationName,
          STN_NAME: firstElement.STN_Name,
          GEAR: formData.gear,
          Gear_type: gear_type_value,
          DEFICIENCIES: newDeficiency,
          SECTION: firstElement.Section,
          ROUTE: firstElement.Route,
          SI: firstElement.SI,
          CSI: firstElement.CSI,
          ADSTE: firstElement.ADSTE,
          SR_DSTE: firstElement.Sr_DSTE,
          PWI: firstElement.PWI,
          CPWI: firstElement.CPWI,
          AEN: firstElement.AEN,
          SR_DEN: firstElement.Sr_DEN,
          Date_of_inspection: formData.dateOfInspection,
          DEFI_NUM: defi_num
        };

        const query = 'INSERT INTO data_table SET ?';
        const insertPromises = formData.gearID.map((gear_ID) => {
          const dataWithGear = {
            ...dataToInsert,
            GEAR_ID: gear_ID,
          };
          return new Promise((resolve, reject) => {
            let date = formatDate(dataWithGear.Date_of_inspection);
            // Check if data already exists
            connection.query(
              'SELECT * FROM data_table WHERE STN_CODE = ? AND GEAR = ? AND GEAR_ID = ? AND Date_of_inspection = ?',
              [dataWithGear.STN_CODE, dataWithGear.GEAR, dataWithGear.GEAR_ID, date],
              (err, results) => {
                if (err) {
                  reject(err);
                } else if (results.length > 0) {
                  repeat_entry = true;
                  // Data already exists, resolve without inserting
                  resolve();
                } else {
                  // Data does not exist, insert it
                  connection.query(query, dataWithGear, (err, results) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve();
                    }
                  });
                }
              }
            );
          });

        });
        Promise.all(insertPromises)
          .then(() => {
            if (repeat_entry) {
              const data = [];
              resolve(data);
            } else {
              let Date_of_inspection = formatDate(formData.dateOfInspection);
              connection.query(`WITH DataCTE AS (
            SELECT
                STN_code,
                Gear,
                Gear_ID,
                DATE_FORMAT(Date_of_inspection, '%Y-%m-%d') AS Date_of_inspection,
                GROUP_CONCAT(SR_NO ORDER BY SR_NO) AS SR_NO,
                GROUP_CONCAT(DEFICIENCIES) AS DEFICIENCIES
            FROM
                data_table
            WHERE
              STN_code = ? and Gear = ? and Date_of_inspection = ? 
            GROUP BY
                
                STN_code,
                Gear,
                Gear_ID,
                DATE_FORMAT(Date_of_inspection, '%Y-%m-%d')
        )
        
        SELECT
            
            STN_code,
            Gear,
            Gear_ID,
            Date_of_inspection,
            CONCAT('', SR_NO, '') AS SR_NO,
            CONCAT('', DEFICIENCIES, '') AS DEFICIENCIES
        FROM
            DataCTE;
        `, [formData.stationName, formData.gear, Date_of_inspection], (err, data) => {
                if (err) {
                  console.error('Error fetching data:', err);
                  reject(err);
                } else {

                  // Push fetched data to the array
                  fetchedDataArray.push({ data: data });
                  // Resolve this promise since the query is completed
                  resolve(data);
                }
              });
            }
          })
          .catch((error) => {
            console.error('Error inserting data:', error);
            reject(error);
          });
      }
    });
  });
};

exports.getDataFromDatabase = function (formData) {
  return new Promise((resolve, reject) => {
    let conditionString;

    if (formData.selectOption === 'ALL' && formData. optionDetails === 'ALL' &&formData.stationName === 'ALL' && formData.complainceOption === 'ALL') {
      conditionString = ``;
     

    } else if (formData.selectOption === '' && formData.optionDetails === '' && formData.stationName === '') {
        conditionString = ``;

    } else if (formData.selectOption === "PWI" || formData.selectOption === "CPWI") {
      if (formData.complainceOption === "ALL") {
        conditionString = `WHERE ${formData.selectOption} = '${formData.optionDetails}' and STN_Code ='${formData.stationName}'`
      }
      else {
        conditionString = `WHERE ${formData.selectOption} = '${formData.optionDetails}' and STN_Code ='${formData.stationName}' and Complaince = '${formData.complainceOption}'`
      }

    } else {
      if (formData.complainceOption === "ALL") {
        conditionString = ` WHERE ${formData.selectOption} = '${formData.optionDetails}'`
      }
      else {
        conditionString = ` WHERE ${formData.selectOption} = '${formData.optionDetails}' and Complaince = '${formData.complainceOption}'`
      }
    }

    const sql = `SELECT
    STN_code,
    Gear,
    Gear_ID,
    DATE_FORMAT(Date_of_inspection, '%Y-%m-%d') AS Date_of_inspection,
    CONCAT('[', GROUP_CONCAT(SR_NO ORDER BY SR_NO), ']') AS SR_NO,
    CONCAT('[', GROUP_CONCAT(Complaince ORDER BY SR_NO), ']') AS Complaince,
    CONCAT('[', GROUP_CONCAT(DEFI_NUM ORDER BY SR_NO), ']') AS DEFI_NUM,
    CONCAT('[', GROUP_CONCAT(DEFICIENCIES ORDER BY SR_NO), ']') AS DEFICIENCIES,
    CONCAT('[', GROUP_CONCAT(Action_Taken ORDER BY SR_NO), ']') AS Action_Taken,
    CONCAT('[', GROUP_CONCAT(Acknowledgement ORDER BY SR_NO), ']') AS Acknowledgement,
    CONCAT('[', GROUP_CONCAT(Acknowledge_Review ORDER BY SR_NO), ']') AS Acknowledge_Review
    FROM
        data_table
        ${conditionString}
    GROUP BY
        STN_code,
        Gear,
        Gear_ID,
        DATE_FORMAT(Date_of_inspection, '%Y-%m-%d')
    HAVING
        DEFICIENCIES NOT LIKE '%NIL%'
    ORDER BY
        Date_of_inspection DESC;`

    connection.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {

        resolve(result)
      }
    });
  });
};

function formatDateForMySQL(date) {
  const parts = date.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[0]}-${parts[1]}`;
  }
  return date; // Return the input if the format is not valid
}

exports.fetchRenderTableData = function (data) {
  return new Promise((resolve, reject) => {

    console.log('datainFetchRenderTable', data);

    // let Date_of_inspection = formatDateForMySQL(data.dateOfInspection);
    connection.query(`WITH DataCTE AS (
      SELECT 
          STN_code,
          Gear,
          Gear_ID,
          Gear_type,
          DATE_FORMAT(Date_of_inspection, '%Y-%m-%d') AS Date_of_inspection,
          GROUP_CONCAT(SR_NO ORDER BY SR_NO) AS SR_NO,
          GROUP_CONCAT(DEFI_NUM) AS DEFI_NUM,
          GROUP_CONCAT(DEFICIENCIES) AS DEFICIENCIES
      FROM
          data_table
      WHERE
        STN_code = ? and Gear = ? and Date_of_inspection = ? and Gear_type = ?
      GROUP BY
          STN_code,
          Gear,
          Gear_ID,
          Gear_type,
          DATE_FORMAT(Date_of_inspection, '%Y-%m-%d')
        )
        SELECT   
            STN_code,
            Gear,
            Gear_ID,
            Gear_type,
            Date_of_inspection,
            CONCAT('', SR_NO, '') AS SR_NO,
            CONCAT('', DEFI_NUM, '') AS DEFI_NUM,
            CONCAT('', DEFICIENCIES, '') AS DEFICIENCIES
        FROM
            DataCTE;
        `, [data.stationName, data.gear, data.Date_of_inspection, data.Gear_type], (err, result) => {
      if (err) {
        console.error('Error fetching data:', err);
        reject(err);
      } else {
        result.sort((a, b) => {
          if (a.DEFICIENCIES === 'Nil' && b.DEFICIENCIES !== 'Nil') {
            return 1; // Move 'Nil' DEFICIENCIES to the end
          } else if (a.DEFICIENCIES !== 'Nil' && b.DEFICIENCIES === 'Nil') {
            return -1; // Keep non-'Nil' DEFICIENCIES at the beginning
          } else {
            return 0; // Leave other elements in their current order
          }
        });
        resolve(result);
      }
    });
  });
};

// Function for updating complaince  data in the database

exports.updateDataInDatabase = function(updatedData) {
  return new Promise((resolve, reject) => {
    if (updatedData.editedData === "NO")
    {
      resolve();
      return;
    }
    const delimiter = '|';
    const inspectionDate = updatedData.additionalFieldData.inspectionDate;
    // Format the date as 'YYYY-MM-DD'
    const formattedDate = new Date(inspectionDate).toISOString().split('T')[0];
    connection.query('SELECT * FROM data_table WHERE SR_NO = ?', [updatedData.indentifier], (err, rows) => {
      if (err) {
        console.error('Error fetching history:', err);
        reject();
      }

      const row = rows[0];
      console.log('row ==>',row);
      console.log('row.Action_taken ==>',row.Action_taken);
      if (!row.Action_taken === 'undefined') {
        const actionTakenArray = row.Action_Taken.split('|');
        const acknowledgeReviewArray = row.Acknowledge_Review.split('|');

        console.log(actionTakenArray);
        console.log(acknowledgeReviewArray);

        if (actionTakenArray.length > acknowledgeReviewArray.length) {
          const updatedActionTaken = actionTakenArray.slice(0, -1).join('|');
          row.Action_Taken = updatedActionTaken;
        }
      }
      const dateOfComplaince = new Date(row.Date_of_Complaince).toISOString().split('T')[0];

      if (dateOfComplaince === formattedDate) {
        console.log("same_date");
        const timeOfComplaince = new Date(`1970-01-01T${row.Time_of_complaince}:00.000Z`).toLocaleTimeString('en-US', { hour12: false });
        const inspectionTime = new Date(`1970-01-01T${updatedData.additionalFieldData.inspectionTime}:00.000Z`).toLocaleTimeString('en-US', { hour12: false });

        if (timeOfComplaince > inspectionTime) {
          console.error('Error: Time_of_complaince is greater than updated inspection time.');
          reject();
        }
      } else {
        console.error('Error: Date_of_complaince does not match formattedDate.');
      }

      const historyString = row.Action_taken;
      console.log('historyString === > ',historyString)

      // Add the new action to the history string with the delimiter
      const updatedHistory = historyString+ delimiter + updatedData.additionalFieldData.actionTaken;
      console.log('updatedString ==>')

      const query = `UPDATE data_table
                    SET 
                        Complaince = '${updatedData.editedData}',
                        Date_of_complaince = '${formattedDate}',
                        Time_of_complaince = '${updatedData.additionalFieldData.inspectionTime}',
                        Action_Taken = '${updatedHistory}'
                    WHERE
                        SR_NO = ${updatedData.indentifier};`;
      connection.query(query, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(updatedData);
        }
      });
    });
  });
};

exports.acknowledgeDataTable = function (formData) {
  return new Promise((resolve, reject) => {
    let conditionString;
    console.log(formData)
    if (formData.selectOption === 'ALL' && formData. optionDetails === 'ALL' && formData.stationName === 'ALL' ) {
      conditionString = ``;
      
    }else if (formData.selectOption === '' && formData.optionDetails === '' && formData.stationName === '') {
        conditionString = ``;
        
    } else if (formData.selectOption === "PWI" || formData.selectOption === "CPWI") {
      conditionString = `${formData.selectOption} = '${formData.optionDetails}' and STN_Code ='${formData.stationName}'AND `

    } else {
      conditionString = `${formData.selectOption} = '${formData.optionDetails}'AND `

    }
    const sql = `SELECT
        a.STN_code,
        a.Gear,
        a.Gear_ID,
        DATE_FORMAT(a.Date_of_inspection, '%Y-%m-%d') AS Date_of_inspection,
        CONCAT('[', GROUP_CONCAT(a.SR_NO ORDER BY a.SR_NO), ']') AS SR_NO,
        CONCAT('[', GROUP_CONCAT(a.Complaince), ']') AS Complaince,
        CONCAT('[', GROUP_CONCAT(a.DEFI_NUM ORDER BY a.DEFI_NUM), ']') AS DEFI_NUM,
        CONCAT('[', GROUP_CONCAT(a.DEFICIENCIES ORDER BY a.DEFI_NUM), ']') AS DEFICIENCIES,
        CONCAT('[', GROUP_CONCAT(a.Acknowledgement), ']') AS Acknowledgement,
        CONCAT('[', GROUP_CONCAT(a.Action_Taken), ']') AS Action_Taken,
        CONCAT('[', GROUP_CONCAT(a.Acknowledge_Review), ']') AS Acknowledge_Review
    FROM
        data_table a
    WHERE
        ${conditionString}  a.Complaince = 'YES'
    GROUP BY
        a.STN_code,
        a.Gear,
        a.Gear_ID,
        DATE_FORMAT(a.Date_of_inspection, '%Y-%m-%d');

  ` 
    connection.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {

        resolve(result)
      }
    });
  });
};

exports.updateAcknowledgeDataInDatabase = function(updatedData) {
  return new Promise((resolve, reject) => {
    console.log(updatedData)
    const delimiter = '|';
    connection.query('SELECT Acknowledge_Review FROM data_table WHERE SR_NO = ?', [updatedData.indentifier], (err, rows) => {
      if (err) {
        console.error('Error fetching history:', err);
        return;
      }

      const historyString = rows[0]. Acknowledge_Review;

      // Add the new action to the history string with the delimiter
      const updatedHistory = historyString + delimiter + updatedData.additionalFieldData.actionTaken;

    console.log(updatedData.additionalFieldData.actionTaken)
    let query;
    if  (updatedData.editedData === "Pending"|| updatedData.editedData === "Not Satisfied"){
      query = `UPDATE data_table
    SET 
        Acknowledgement = '${updatedData.editedData}',
        Acknowledge_Review = '${updatedHistory}',
        Complaince = 'Under_Acknowledge'
    WHERE
        SR_NO = ${updatedData.indentifier};`

    }
    else {
      query = `UPDATE data_table
      SET 
          Acknowledgement = '${updatedData.editedData}',
          Acknowledge_Review = '${updatedHistory}'
      WHERE
          SR_NO = ${updatedData.indentifier};`
    };
    connection.query(query, (err, results) => {
      if (err) {
          reject(err);
      } else {
          resolve(updatedData);
        }
    });
  });

  });
};


exports.analysisDataChart = function (formData) {
  return new Promise((resolve, reject) => {
    let conditionString = `${formData.selectOption} = '${formData.optionDetails}'`;

    //   const sql = `SELECT
    //   (SELECT COUNT(*) FROM data_table WHERE ${conditionString}  AND Complaince = 'YES' AND Acknowledgement = 'Satisfied') AS Complied,
    //   (SELECT COUNT(*) FROM data_table WHERE  ${conditionString} AND Complaince = 'YES' AND Acknowledgement = 'Pending') AS Under_Acknowledgement,
    //   (SELECT COUNT(*) FROM data_table WHERE  ${conditionString} AND Complaince = 'NO') AS Not_Complied,
    //   (SELECT COUNT(*) FROM data_table WHERE ${conditionString}  ) AS TOTAL;
    // `    
    const sql = `SELECT
          'Overall' AS Category,
          NULL AS AEN,
          (SELECT COUNT(*) FROM data_table WHERE ${conditionString}  AND Complaince = 'YES' AND Acknowledgement = 'Satisfied') AS Complied,
          (SELECT COUNT(*) FROM data_table WHERE ${conditionString}  AND  Complaince = 'YES' AND Acknowledgement = 'Pending') AS Under_Acknowledgement,
          (SELECT COUNT(*) FROM data_table WHERE  ${conditionString}  AND  Complaince = 'NO') AS Not_Complied,
          (SELECT COUNT(*) FROM data_table WHERE ${conditionString}) AS TOTAL
      UNION
      SELECT
          'By AEN' AS Category,
          AEN,
          (SELECT COUNT(*) FROM data_table WHERE ${conditionString}  AND  AEN = e.AEN AND Complaince = 'YES' AND Acknowledgement = 'Satisfied') AS Complied,
          (SELECT COUNT(*) FROM data_table WHERE ${conditionString}  AND  AEN = e.AEN AND Complaince = 'YES' AND Acknowledgement = 'Pending') AS Under_Acknowledgement,
          (SELECT COUNT(*) FROM data_table WHERE ${conditionString}  AND  AEN = e.AEN AND Complaince = 'NO') AS Not_Complied,
          (SELECT COUNT(*) FROM data_table WHERE ${conditionString}  AND  AEN = e.AEN) AS TOTAL
      FROM (
          SELECT DISTINCT AEN
          FROM data_table
          WHERE ${conditionString} 
      ) AS e;
`
    connection.query(sql, (error, result) => {
      if (error) {
        reject(error);
      } else {

        resolve(result)
      }
    });
  });
};



exports.dashboardDataTable = function (stationName, gear , selectedOption, optionDetails) {
  return new Promise(async (resolve, reject) => {
    try {
      const stationValue = `${stationName}`;
      let gearValue = `${gear}`;
      const selectedOptionValue = `${selectedOption}`;
      const optionDetailsValue = `${optionDetails}`;


      let conditionSr;
      let condition;
      
      

      if (gearValue == 'Mechanical ') {
        gearValue = "Mechanical"
      }

      if (gearValue === "IRS" || gearValue == "Mechanical" || gearValue === "TWS" || gearValue === "Point Zone" || gearValue === "Straight") {
        conditionSr = `Gear_type = '${gearValue}'`;
        condition = `WHERE Gear_type = '${gearValue}' `;
      }
      else if (gearValue === "Point" || gearValue === "Track Circuit") {
        conditionSr = `GEAR = '${gearValue}'`;
        condition = `WHERE GEAR = '${gearValue}'`;
      }
      else if (gearValue === "ALL GEAR") {
        conditionSr = `GEAR IN ('Point', 'Track Circuit') `;
        condition = `WHERE GEAR IN ('Point', 'Track Circuit')`;
      }


      if (selectedOptionValue !== "ALL"  && selectedOptionValue !== "Don't Add in Filteration" ){
        if (stationValue !== "DON'T ADD IN FILTERATION" && stationValue !== "ALL") {
          conditionSr += `AND STN_Code = '${stationValue}' AND `;
          condition += `AND STN_Code = '${stationValue}' `;
        }
        // Selected option and option details conditions
        if (selectedOptionValue !== "DON'T ADD IN FILTERATION" && optionDetailsValue !== "DON'T ADD IN FILTERATION" && optionDetails !== "ALL") {
          conditionSr += `AND ${selectedOptionValue} = '${optionDetailsValue}' AND `;
          condition += `AND ${selectedOptionValue} = '${optionDetailsValue}' `;
        } else if (selectedOptionValue !== "DON'T ADD IN FILTERATION" ) {
          conditionSr += `AND ${selectedOptionValue} IS NOT NULL AND `;
          condition += `AND ${selectedOptionValue} IS NOT NULL `;
        }
      }
      else{
        conditionSr += ` AND `;
      }

      console.log("conditionSR ==>", conditionSr);
      console.log("Condition ==>", condition);


      const distinctSRDENQuery = `SELECT DISTINCT SR_DEN FROM main_sheet;`;

      connection.query(distinctSRDENQuery, async (error, srDenResults) => {
        console.log("SR_DEN ==> ", srDenResults)
        if (error) {
          console.error('Error:', error);
          return reject(error);
        }

        const finalResult = {};
        let SR_DEN = srDenResults.map((row) => row.SR_DEN);
        finalResult['srDenResults'] = SR_DEN.sort();

        finalResult['stationName'] = stationValue;
        finalResult['gear'] = gearValue;
        finalResult['selectedOption'] = selectedOptionValue;
        finalResult['optionDetails'] = optionDetailsValue;

        const srDenQueryPromises = [];

        for (const srDenRow of srDenResults) {
          const srDenValue = srDenRow.SR_DEN;

          srDenQueryPromises.push(new Promise((resolveQuery, rejectQuery) => {
            const query = `
            SELECT
                DEFICIENCY,
                SUM(CASE WHEN DEFICIENCY != 'NIL' AND Complaince = 'YES' THEN 1 ELSE 0 END) AS COMPLIED_DEFICIENCY_COUNT,
                SUM(CASE WHEN DEFICIENCY != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
            FROM (
                SELECT
                    DEFICIENCIES AS DEFICIENCY,
                    data_table.Complaince, 
                    data_table.STN_CODE,
                    data_table.GEAR,
                    data_table.Zone,
                    data_table.Gear_type,
                    data_table.Date_of_inspection
                FROM data_table
                JOIN (
                    SELECT
                        STN_CODE,
                        GEAR,
                        Zone,
                        Gear_Type,
                        MAX(Date_of_inspection) AS max_date_of_inspection
                    FROM data_table
                    WHERE ${conditionSr} SR_DEN = ?
                    GROUP BY STN_CODE, GEAR, Zone, Gear_type
                ) latest_inspections
                ON data_table.STN_CODE = latest_inspections.STN_CODE
                    AND data_table.GEAR = latest_inspections.GEAR
                    AND data_table.Zone = latest_inspections.Zone
                    AND data_table.Gear_type = latest_inspections.Gear_type
                    AND data_table.Date_of_inspection = latest_inspections.max_date_of_inspection
            ) latest_entries
            GROUP BY DEFICIENCY
            ORDER BY DEFICIENCY;
            `;
            connection.query(query, [srDenValue], (error, queryResults) => {
              console.log("queryResults ==> ", queryResults);
              if (error) {
                console.error('Error:', error);
                rejectQuery(error);
              }

              const resultForSRDen = queryResults.map((row) => {
                return {
                  DEFICIENCY: row.DEFICIENCY,
                  COMPLIED_DEFICIENCY_COUNT: row.COMPLIED_DEFICIENCY_COUNT,
                  TOTAL_DEFICIENCY_COUNT: row.TOTAL_DEFICIENCY_COUNT,
                };
              });

              finalResult[srDenValue] = resultForSRDen;

              resolveQuery();
            });
          }));
        }

        await Promise.all(srDenQueryPromises);

        const queryWithoutSRDen = `SELECT
          DEFICIENCIES AS DEFICIENCY,
            SUM(CASE WHEN DEFICIENCIES != 'NIL' AND Complaince = 'YES' THEN 1 ELSE 0 END) AS COMPLIED_DEFICIENCY_COUNT,
            SUM(CASE WHEN DEFICIENCIES != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
        FROM (
            SELECT
                STN_CODE,
                GEAR,
                Zone,
                Gear_type,
                MAX(Date_of_inspection) AS LAST_ENTRY_DATE
            FROM data_table ${condition} 
            GROUP BY STN_CODE, GEAR, Zone, Gear_type
        ) last_entry_dates
        JOIN data_table ON last_entry_dates.STN_CODE = data_table.STN_CODE
            AND last_entry_dates.GEAR = data_table.GEAR
            AND last_entry_dates.Zone = data_table.Zone
            AND last_entry_dates.Gear_type = data_table.Gear_type
            AND last_entry_dates.LAST_ENTRY_DATE = data_table.Date_of_inspection
        GROUP BY DEFICIENCIES
        ORDER BY DEFICIENCIES;
      `
        connection.query(queryWithoutSRDen, (error, queryWithoutSRDenResults) => {

          console.log("withoutSR_DEN ==>", queryWithoutSRDenResults)
          if (error) {
            console.error('Error:', error);
            return reject(error);
          }

          finalResult['Without SR_DEN'] = queryWithoutSRDenResults.map((row) => {
            return {
              DEFICIENCY: row.DEFICIENCY,
              COMPLIED_DEFICIENCY_COUNT: row.COMPLIED_DEFICIENCY_COUNT,
              TOTAL_DEFICIENCY_COUNT: row.TOTAL_DEFICIENCY_COUNT,
            };
          });
          let total_defi = { 'Without SR_DEN': 0 };
          let total_compiled_defi = { 'Without SR_DEN': 0 };
          
          // Calculate total deficiency count for each SR_DEN
          finalResult.srDenResults.forEach(srDen => {
              const srDenData = finalResult[srDen];
              total_defi[srDen] = srDenData.reduce((acc, obj) => acc + parseInt(obj.TOTAL_DEFICIENCY_COUNT), 0);
          });
          
          // Calculate total deficiency count for 'Without SR_DEN'
          total_defi['Without SR_DEN'] = finalResult['Without SR_DEN'].reduce((acc, obj) => acc + parseInt(obj.TOTAL_DEFICIENCY_COUNT), 0);
          
          // Calculate total complied deficiency count for each SR_DEN
          finalResult.srDenResults.forEach(srDen => {
              const srDenData = finalResult[srDen];
              total_compiled_defi[srDen] = srDenData.reduce((acc, obj) => acc + parseInt(obj.COMPLIED_DEFICIENCY_COUNT), 0);
          });
          
          // Calculate total complied deficiency count for 'Without SR_DEN'
          total_compiled_defi['Without SR_DEN'] = finalResult['Without SR_DEN'].reduce((acc, obj) => acc + parseInt(obj.COMPLIED_DEFICIENCY_COUNT), 0);
          
          finalResult['Total_defi'] = total_defi;
          finalResult['Total_compiled_defi'] = total_compiled_defi;
          
          console.log("finalResult ==>", finalResult);
          resolve(finalResult);

        });
      });
    } catch (error) {
      console.error('Error:', error);
      reject(error);
    }
  });
};

exports.longPendingDefiData = function (stationName, gear , selectedOption, optionDetails) {
  return new Promise(async (resolve, reject) => {
    try {
      const stationValue = `${stationName}`;
      let gearValue = `${gear}`;
      const selectedOptionValue = `${selectedOption}`;
      const optionDetailsValue = `${optionDetails}`;

      let conditionSr;
      let condition;

      if (gearValue == 'Mechanical ') {
        gearValue = "Mechanical"
      }

      if (gearValue === "IRS" || gearValue == "Mechanical" || gearValue === "TWS" || gearValue === "Point Zone" || gearValue === "Straight") {
        conditionSr = `Gear_type = '${gearValue}' AND `;
        condition = `WHERE Gear_type = '${gearValue}' `;
      }
      else if (gearValue === "Point" || gearValue === "Track Circuit") {
        conditionSr = `GEAR = '${gearValue}' AND `;
        condition = `WHERE GEAR = '${gearValue}'`;
      }
      else if (gearValue === "ALL GEAR") {
        conditionSr = `GEAR IN ('Point', 'Track Circuit') AND `;
        condition = `WHERE GEAR IN ('Point', 'Track Circuit')`;
      }

      if (selectedOptionValue !== "ALL"){
        if (stationValue !== "DON'T ADD IN FILTERATION") {
          conditionSr += `STN_Code = '${stationValue}' AND `;
          condition += `AND STN_Code = '${stationValue}' `;
        }
        // Selected option and option details conditions
        if (selectedOptionValue !== "DON'T ADD IN FILTERATION" && optionDetailsValue !== "DON'T ADD IN FILTERATION") {
          conditionSr += `${selectedOptionValue} = '${optionDetailsValue}' AND `;
          condition += `AND ${selectedOptionValue} = '${optionDetailsValue}' `;
        } else if (selectedOptionValue !== "DON'T ADD IN FILTERATION") {
          conditionSr += `${selectedOptionValue} IS NOT NULL AND `;
          condition += `AND ${selectedOptionValue} IS NOT NULL `;
        }
      }

      console.log("csr => " , condition)
      console.log("cwsr=> ", conditionSr )

      const distinctSRDENQuery = `SELECT DISTINCT SR_DEN FROM main_sheet;`;

      connection.query(distinctSRDENQuery, async (error, srDenResults) => {
        console.log("SR_DEN ==> ", srDenResults)
        if (error) {
          console.error('Error:', error);
          return reject(error);
        }

        const finalResult = {};
        let SR_DEN = srDenResults.map((row) => row.SR_DEN);
        finalResult['srDenResults'] = SR_DEN.sort();
        finalResult['stationName'] = stationValue;
        finalResult['gear'] = gearValue;
        finalResult['selectedOption'] = selectedOptionValue;
        finalResult['optionDetails'] = optionDetailsValue;
        const srDenQueryPromises = [];

        for (const srDenRow of srDenResults) {
          const srDenValue = srDenRow.SR_DEN;

          srDenQueryPromises.push(new Promise((resolveQuery, rejectQuery) => {
            const query = `
                SELECT
                DEFICIENCY,
                SUM(CASE WHEN DEFICIENCY != 'NIL' AND Complaince = 'YES' THEN 1 ELSE 0 END) AS COMPLIED_DEFICIENCY_COUNT,
                SUM(CASE WHEN DEFICIENCY != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
            FROM (
                SELECT
                    DEFICIENCIES AS DEFICIENCY,
                    data_table.Complaince, 
                    data_table.STN_CODE,
                    data_table.GEAR,
                    data_table.Zone,
                    data_table.Gear_type,
                    data_table.Date_of_inspection
                FROM data_table
                JOIN (
                    SELECT
                        STN_CODE,
                        GEAR,
                        Zone,
                        Gear_Type,
                        MAX(Date_of_inspection) AS max_date_of_inspection
                    FROM data_table
                    WHERE ${conditionSr} SR_DEN = ? AND
                          data_table.Complaince = 'NO' AND
                          data_table.Date_of_inspection <= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY) 
                    GROUP BY STN_CODE, GEAR, Zone, Gear_type
                ) latest_inspections
                ON data_table.STN_CODE = latest_inspections.STN_CODE
                    AND data_table.GEAR = latest_inspections.GEAR
                    AND data_table.Zone = latest_inspections.Zone
                    AND data_table.Gear_type = latest_inspections.Gear_type
                    AND data_table.Date_of_inspection = latest_inspections.max_date_of_inspection
            ) latest_entries
            GROUP BY DEFICIENCY
            ORDER BY DEFICIENCY;
          `;

            connection.query(query, [srDenValue], (error, queryResults) => {
              console.log("queryResults ==> ", queryResults);
              if (error) {
                console.error('Error:', error);
                rejectQuery(error);
              }

              const resultForSRDen = queryResults.map((row) => {
                return {
                  DEFICIENCY: row.DEFICIENCY,
                  COMPLIED_DEFICIENCY_COUNT: row.COMPLIED_DEFICIENCY_COUNT,
                  TOTAL_DEFICIENCY_COUNT: row.TOTAL_DEFICIENCY_COUNT,
                };
              });

              finalResult[srDenValue] = resultForSRDen;

              resolveQuery();
            });
          }));
        }

        await Promise.all(srDenQueryPromises);

        const queryWithoutSRDen = `SELECT
              DEFICIENCY,
              SUM(CASE WHEN DEFICIENCY != 'NIL' AND Complaince = 'YES' THEN 1 ELSE 0 END) AS COMPLIED_DEFICIENCY_COUNT,
              SUM(CASE WHEN DEFICIENCY != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
          FROM (
              SELECT
                  DEFICIENCIES AS DEFICIENCY,
                  data_table.Complaince, 
                  data_table.STN_CODE,
                  data_table.GEAR,
                  data_table.Zone,
                  data_table.Gear_type,
                  data_table.Date_of_inspection
              FROM data_table
              JOIN (
                  SELECT
                      STN_CODE,
                      GEAR,
                      Zone,
                      Gear_Type,
                      MAX(Date_of_inspection) AS max_date_of_inspection
                  FROM data_table ${condition} AND
                        data_table.Complaince = 'NO' AND
                        data_table.Date_of_inspection <= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
                  GROUP BY STN_CODE, GEAR, Zone, Gear_type
              ) last_entry_dates
              ON data_table.STN_CODE = last_entry_dates.STN_CODE
                  AND data_table.GEAR = last_entry_dates.GEAR
                  AND data_table.Zone = last_entry_dates.Zone
                  AND data_table.Gear_type = last_entry_dates.Gear_type
                  AND data_table.Date_of_inspection = last_entry_dates.max_date_of_inspection
          ) latest_entries
          GROUP BY DEFICIENCY
          ORDER BY DEFICIENCY;
          `

        connection.query(queryWithoutSRDen, (error, queryWithoutSRDenResults) => {

          console.log("withoutSR_DEN ==>", queryWithoutSRDenResults)
          if (error) {
            return reject(error);
          }

          finalResult['Without SR_DEN'] = queryWithoutSRDenResults.map((row) => {
            return {
              DEFICIENCY: row.DEFICIENCY,
              COMPLIED_DEFICIENCY_COUNT: row.COMPLIED_DEFICIENCY_COUNT,
              TOTAL_DEFICIENCY_COUNT: row.TOTAL_DEFICIENCY_COUNT,
            };
          });
          let total_defi = { 'Without SR_DEN': 0 };
          let total_compiled_defi = { 'Without SR_DEN': 0 };
          
          // Calculate total deficiency count for each SR_DEN
          finalResult.srDenResults.forEach(srDen => {
              const srDenData = finalResult[srDen];
              total_defi[srDen] = srDenData.reduce((acc, obj) => acc + parseInt(obj.TOTAL_DEFICIENCY_COUNT), 0);
          });
          
          // Calculate total deficiency count for 'Without SR_DEN'
          total_defi['Without SR_DEN'] = finalResult['Without SR_DEN'].reduce((acc, obj) => acc + parseInt(obj.TOTAL_DEFICIENCY_COUNT), 0);
          
          // Calculate total complied deficiency count for each SR_DEN
          finalResult.srDenResults.forEach(srDen => {
              const srDenData = finalResult[srDen];
              total_compiled_defi[srDen] = srDenData.reduce((acc, obj) => acc + parseInt(obj.COMPLIED_DEFICIENCY_COUNT), 0);
          });
          
          // Calculate total complied deficiency count for 'Without SR_DEN'
          total_compiled_defi['Without SR_DEN'] = finalResult['Without SR_DEN'].reduce((acc, obj) => acc + parseInt(obj.COMPLIED_DEFICIENCY_COUNT), 0);
          
          finalResult['Total_defi'] = total_defi;
          finalResult['Total_compiled_defi'] = total_compiled_defi;
          resolve(finalResult);
          
        });
      });
    } catch (error) {
      console.error('Error:', error);
      reject(error);
    }
  });
};



exports.repeatedCompliance = function (stationName, gear , selectedOption, optionDetails) {
  return new Promise(async (resolve, reject) => {
    try {
      const stationValue = `${stationName}`;
      let gearValue = `${gear}`;
      const selectedOptionValue = `${selectedOption}`;
      const optionDetailsValue = `${optionDetails}`;

      let conditionSr;
      let condition;

      if (gearValue == 'Mechanical ') {
        gearValue = "Mechanical"
      }

      if (gearValue === "IRS" || gearValue == "Mechanical" || gearValue === "TWS" || gearValue === "Point Zone" || gearValue === "Straight") {
        conditionSr = `Gear_type = '${gearValue}' AND `;
        condition = `WHERE Gear_type = '${gearValue}' `;
      }
      else if (gearValue === "Point" || gearValue === "Track Circuit") {
        conditionSr = `GEAR = '${gearValue}' AND `;
        condition = `WHERE GEAR = '${gearValue}'`;
      }
      else if (gearValue === "ALL GEAR") {
        conditionSr = `GEAR IN ('Point', 'Track Circuit') AND `;
        condition = `WHERE GEAR IN ('Point', 'Track Circuit')`;
      }

      if (selectedOptionValue !== "ALL"){
        if (stationValue !== "DON'T ADD IN FILTERATION") {
          conditionSr += `STN_Code = '${stationValue}' AND `;
          condition += `AND STN_Code = '${stationValue}' `;
        }
        // Selected option and option details conditions
        if (selectedOptionValue !== "DON'T ADD IN FILTERATION" && optionDetailsValue !== "DON'T ADD IN FILTERATION") {
          conditionSr += `${selectedOptionValue} = '${optionDetailsValue}' AND `;
          condition += `AND ${selectedOptionValue} = '${optionDetailsValue}' `;
        } else if (selectedOptionValue !== "DON'T ADD IN FILTERATION") {
          conditionSr += `${selectedOptionValue} IS NOT NULL AND `;
          condition += `AND ${selectedOptionValue} IS NOT NULL `;
        }
      }


      const distinctSRDENQuery = `
        SELECT DISTINCT SR_DEN
        FROM main_sheet;
      `;

      connection.query(distinctSRDENQuery, async (error, srDenResults) => {
        if (error) {
          console.error('Error:', error);
          return reject(error);
        }
        
        const finalResult = {};
        let SR_DEN = srDenResults.map((row) => row.SR_DEN);
        finalResult['srDenResults'] = SR_DEN.sort();
        finalResult['stationName'] = stationValue;
        finalResult['gear'] = gearValue;
        finalResult['selectedOption'] = selectedOptionValue;
        finalResult['optionDetails'] = optionDetailsValue;

        // Array to store promises for srDenValue queries
        let srDenQueryPromises = [];

        for (const srDenRow of srDenResults) {
          const srDenValue = srDenRow.SR_DEN;
          const query = `
            SELECT
              DEFICIENCY,
              SUM(CASE WHEN DEFICIENCY != 'NIL' AND Complaince = 'YES' THEN 1 ELSE 0 END) AS COMPLIED_DEFICIENCY_COUNT,
              SUM(CASE WHEN DEFICIENCY != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
            FROM (
              SELECT
                DEFICIENCIES AS DEFICIENCY,
                data_table.Complaince, 
                data_table.STN_CODE,
                data_table.GEAR,
                data_table.Zone,
                data_table.Gear_type,
                data_table.GEAR_ID,
                data_table.Date_of_inspection
              FROM data_table
              JOIN (
                SELECT
                  STN_CODE,
                  GEAR,
                  Zone,
                  Gear_Type,
                  GEAR_ID,
                  MAX(Date_of_inspection) AS max_date_of_inspection
                FROM data_table
                WHERE ${conditionSr} SR_DEN = ?
                GROUP BY STN_CODE, GEAR, Zone, Gear_type, GEAR_ID
              ) latest_inspections
              ON data_table.STN_CODE = latest_inspections.STN_CODE
                AND data_table.GEAR = latest_inspections.GEAR
                AND data_table.Zone = latest_inspections.Zone
                AND data_table.Gear_type = latest_inspections.Gear_type
                AND data_table.GEAR_ID = latest_inspections.GEAR_ID
                AND data_table.Date_of_inspection = latest_inspections.max_date_of_inspection
            ) latest_entries
            WHERE (DEFICIENCY, GEAR, STN_CODE, Gear_type, GEAR_ID) IN (
              SELECT
                DEFICIENCIES,
                GEAR,
                STN_CODE,
                Gear_type,
                GEAR_ID
              FROM data_table
              WHERE ${conditionSr} SR_DEN = ?
                AND Date_of_inspection = (
                  SELECT MAX(Date_of_inspection)
                  FROM data_table
                  WHERE ${conditionSr} SR_DEN = ?
                    AND (STN_CODE, GEAR, Zone, Gear_type, GEAR_ID) = (latest_entries.STN_CODE, latest_entries.GEAR, latest_entries.Zone, latest_entries.Gear_type, latest_entries.GEAR_ID)
                )
            )
            GROUP BY DEFICIENCY
            ORDER BY DEFICIENCY;
          `;

          // Pushing each query promise into the array
          srDenQueryPromises.push(new Promise((resolveQuery, rejectQuery) => {
            connection.query(query, [srDenValue, srDenValue, srDenValue], (error, queryResults) => {
              if (error) {
                console.error('Error:', error);
                rejectQuery(error);
              } else {
                console.log("result(with sr_den) =>", queryResults);

                // Store the data in the final result
                const resultForSRDen = queryResults.map((row) => {
                  return {
                    DEFICIENCY: row.DEFICIENCY,
                    COMPLIED_DEFICIENCY_COUNT: row.COMPLIED_DEFICIENCY_COUNT,
                    TOTAL_DEFICIENCY_COUNT: row.TOTAL_DEFICIENCY_COUNT,
                  };
                });

                finalResult[srDenValue] = resultForSRDen;
                resolveQuery();
              }
            });
          }));
        }

        // Wait for all srDen queries to complete
        await Promise.all(srDenQueryPromises);

        const queryWithoutSRDen = `
          SELECT
            DEFICIENCY,
            SUM(CASE WHEN DEFICIENCY != 'NIL' AND Complaince = 'YES' THEN 1 ELSE 0 END) AS COMPLIED_DEFICIENCY_COUNT,
            SUM(CASE WHEN DEFICIENCY != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
          FROM (
            SELECT
              DEFICIENCIES AS DEFICIENCY,
              data_table.Complaince, 
              data_table.STN_CODE,
              data_table.GEAR,
              data_table.Zone,
              data_table.Gear_type,
              data_table.GEAR_ID,
              data_table.Date_of_inspection
            FROM data_table
            JOIN (
              SELECT
                STN_CODE,
                GEAR,
                Zone,
                Gear_Type,
                GEAR_ID,
                MAX(Date_of_inspection) AS max_date_of_inspection
              FROM data_table
              ${condition}   
              GROUP BY STN_CODE, GEAR, Zone, Gear_type, GEAR_ID
            ) latest_inspections
            ON data_table.STN_CODE = latest_inspections.STN_CODE
              AND data_table.GEAR = latest_inspections.GEAR
              AND data_table.Zone = latest_inspections.Zone
              AND data_table.Gear_type = latest_inspections.Gear_type
              AND data_table.GEAR_ID = latest_inspections.GEAR_ID
              AND data_table.Date_of_inspection = latest_inspections.max_date_of_inspection
          ) latest_entries
          WHERE (DEFICIENCY, GEAR, STN_CODE, Gear_type, GEAR_ID) IN (
            SELECT
              DEFICIENCIES,
              GEAR,
              STN_CODE,
              Gear_type,
              GEAR_ID
            FROM data_table
            ${condition}  
              AND Date_of_inspection = (
                  SELECT MAX(Date_of_inspection)
                  FROM data_table
                  ${condition} 
                    AND (STN_CODE, GEAR, Zone, Gear_type, GEAR_ID) = (latest_entries.STN_CODE, latest_entries.GEAR, latest_entries.Zone, latest_entries.Gear_type, latest_entries.GEAR_ID)
              )
          )
          GROUP BY DEFICIENCY
          ORDER BY DEFICIENCY;
        `;

        connection.query(queryWithoutSRDen, (error, queryWithoutSRDenResults) => {
          if (error) {
            console.error('Error:', error);
            return reject(error);
          }


          // Store the result without SR_DEN
          finalResult['Without SR_DEN'] = queryWithoutSRDenResults.map((row) => {
            return {
              DEFICIENCY: row.DEFICIENCY,
              COMPLIED_DEFICIENCY_COUNT: row.COMPLIED_DEFICIENCY_COUNT,
              TOTAL_DEFICIENCY_COUNT: row.TOTAL_DEFICIENCY_COUNT,
            };
          });

          let total_defi = { 'Without SR_DEN': 0 };
          let total_compiled_defi = { 'Without SR_DEN': 0 };

          // Calculate total deficiency count for each SR_DEN
          finalResult.srDenResults.forEach(srDen => {
            const srDenData = finalResult[srDen];
            total_defi[srDen] = srDenData.reduce((acc, obj) => acc + parseInt(obj.TOTAL_DEFICIENCY_COUNT), 0);
          });

          // Calculate total deficiency count for 'Without SR_DEN'
          total_defi['Without SR_DEN'] = finalResult['Without SR_DEN'].reduce((acc, obj) => acc + parseInt(obj.TOTAL_DEFICIENCY_COUNT), 0);

          // Calculate total complied deficiency count for each SR_DEN
          finalResult.srDenResults.forEach(srDen => {
            const srDenData = finalResult[srDen];
            total_compiled_defi[srDen] = srDenData.reduce((acc, obj) => acc + parseInt(obj.COMPLIED_DEFICIENCY_COUNT), 0);
          });

          // Calculate total complied deficiency count for 'Without SR_DEN'
          total_compiled_defi['Without SR_DEN'] = finalResult['Without SR_DEN'].reduce((acc, obj) => acc + parseInt(obj.COMPLIED_DEFICIENCY_COUNT), 0);

          finalResult['Total_defi'] = total_defi;
          finalResult['Total_compiled_defi'] = total_compiled_defi;

          console.log("finalResult ==>", finalResult);
          resolve(finalResult);
        });
      });
    } catch (error) {
      console.error('Error:', error);
      reject(error);
    }
  });
};




exports.hyperLinkData = function (stationName, gear, columnName, defi,tableName, selectedOption , optionDetails) {
  return new Promise(async (resolve, reject) => {
    try {
      const stationValue = `${stationName}`;
      const gearValue = `${gear}`;
      const columnNameValue = `${columnName}`;
      const defiValue = `${defi}`;
      const selectedOptions= `${selectedOption}`;
      const optionDetail = `${optionDetails}`;
      let flagGearValue = '0';
      let condition;
      let final_condition;
      let query

      if (gearValue == 'Mechanical ') {
        gearValue = "Mechanical"
      }
      if (gearValue === "IRS" || gearValue == "Mechanical" || gearValue === "TWS" || gearValue === "Point Zone" || gearValue === "Straight") {
        flagGearValue = '1'
        condition = columnName === 'DLI DIVISION' ? ` Gear_type = '${gearValue}' and DEFICIENCIES = '${defi}' ` : `Gear_type = '${gearValue}'  AND SR_DEN = '${columnNameValue}' AND DEFICIENCIES = '${defi}'`;
        final_condition = columnName === 'DLI DIVISION' ? `Where data_table.Gear_type = '${gearValue}' and data_table.DEFICIENCIES = '${defi}' ` : `WHERE data_table.Gear_type = '${gearValue}'  AND data_table.SR_DEN = '${columnNameValue}' AND data_table.DEFICIENCIES = '${defi}'`;
      }
      else if (gearValue === "Point" || gearValue === "Track Circuit") {
        flagGearValue = '1'
        condition =
          columnName === 'DLI DIVISION'
            ? `  GEAR = '${gearValue}' AND DEFICIENCIES = '${defi}'`
            : ` GEAR = '${gearValue}'  AND SR_DEN = '${columnNameValue}' AND DEFICIENCIES = '${defi}'`;
        final_condition =
          columnName === 'DLI DIVISION'
            ? ` WHERE data_table.GEAR = '${gearValue}' AND data_table.DEFICIENCIES = '${defi}'`
            : `WHERE data_table.GEAR = '${gearValue}'  AND data_table.SR_DEN = '${columnNameValue}' AND data_table.DEFICIENCIES = '${defi}'`;
      }
      else {
        flagGearValue = '1'
        condition = columnName === 'DLI DIVISION'
          ? `  DEFICIENCIES = '${defi}'  `
          : `  SR_DEN = '${columnNameValue}' and DEFICIENCIES = '${defi}'`;
        final_condition = columnName === 'DLI DIVISION'
          ? `where  data_table.DEFICIENCIES = '${defi}'`
          : `WHERE  data_table.SR_DEN = '${columnNameValue}' and data_table.DEFICIENCIES = '${defi}'`;
      }

      if (selectedOptions === 'STN_Code'  ){
        if(optionDetail != 'ALL'){
          if (flagGearValue === '1'){
            condition += ` and STN_CODE = '${optionDetails}'`
            final_condition +=  `and data_table.STN_CODE = '${optionDetails}'`
          }
          else{
            condition += `DEFICIENCIES = '${defi}' and STN_CODE = '${optionDetails}'`
            final_condition +=  `AND data_table.DEFICIENCIES = '${defi}' and data_table.STN_CODE = '${optionDetails}'`

          }
        }

    } else if (selectedOptions === 'AEN') {
      if(optionDetail != 'ALL'){
        if (flagGearValue === '1'){
          condition += ` and ${selectedOption} = '${optionDetails}'`
          final_condition +=  `and data_table.${selectedOption} = '${optionDetails}'`
        }
        else{
          condition += `DEFICIENCIES = '${defi}' and ${selectedOption} = '${optionDetails}'`
          final_condition +=  `AND data_table.DEFICIENCIES = '${defi}' and data_table.${selectedOption} = '${optionDetails}'`

        }
      }

    }
    console.log(condition)
    console.log(final_condition)


      


  //     const query = `SELECT
  //     latest_entries.STN_CODE,
  //     latest_entries.GEAR,
  //     latest_entries.Gear_type,
  //     data_table.GEAR_ID,
  //     latest_entries.SR_DEN,
  //     latest_entries.Complaince,
  //     latest_entries.DEFICIENCY,
  //     SUM(CASE WHEN latest_entries.DEFICIENCY != 'NIL' AND latest_entries.Complaince = 'YES' THEN 1 ELSE 0 END) AS COMPLIED_DEFICIENCY_COUNT,
  //     SUM(CASE WHEN latest_entries.DEFICIENCY != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
  // FROM (
  //     SELECT
  //         data_table.STN_CODE,
  //         data_table.GEAR,
  //         data_table.Zone,
  //         data_table.Gear_type,
  //         data_table.Date_of_inspection,
  //         data_table.SR_DEN,
  //         data_table.Complaince,
  //         data_table.DEFICIENCIES AS DEFICIENCY
  //     FROM data_table
  //     JOIN (
  //         SELECT
  //             STN_CODE,
  //             GEAR,
  //             Zone,
  //             Gear_Type,
  //             MAX(Date_of_inspection) AS max_date_of_inspection
  //         FROM data_table
  //         WHERE ${condition}
  //         GROUP BY STN_CODE, GEAR, Zone, Gear_type
  //     ) AS latest_inspections  
  //     ON data_table.STN_CODE = latest_inspections.STN_CODE
  //         AND data_table.GEAR = latest_inspections.GEAR
  //         AND data_table.Zone = latest_inspections.Zone
  //         AND data_table.Gear_type = latest_inspections.Gear_type
  //         AND data_table.Date_of_inspection = latest_inspections.max_date_of_inspection
  // ) AS latest_entries
  // JOIN data_table ON latest_entries.STN_CODE = data_table.STN_CODE
  //     AND latest_entries.GEAR = data_table.GEAR
  //     AND latest_entries.Zone = data_table.Zone
  //     AND latest_entries.Gear_type = data_table.Gear_type
  //     AND latest_entries.Date_of_inspection = data_table.Date_of_inspection
  //     ${final_condition}
  // GROUP BY latest_entries.DEFICIENCY, latest_entries.STN_CODE, latest_entries.GEAR, latest_entries.Gear_type, data_table.GEAR_ID, latest_entries.SR_DEN, latest_entries.Complaince
  // ORDER BY latest_entries.DEFICIENCY;`
       
     if (tableName === 'mainDefi'){
      query = `WITH LatestInspections AS (
        SELECT
            STN_CODE,
            GEAR,
            Zone,
            Gear_Type,
            MAX(Date_of_inspection) AS max_date_of_inspection
        FROM data_table
        WHERE ${condition}
        GROUP BY STN_CODE, GEAR, Zone, Gear_Type
    )
    
    SELECT
        data_table.*,
        DATE_FORMAT(Date_of_inspection, '%Y-%m-%d')AS  Date_of_inspection_date,

        SUM(CASE WHEN DEFICIENCIES != 'NIL' AND Complaince = 'YES' THEN 1 ELSE 0 END) AS COMPLIED_DEFICIENCY_COUNT,
        SUM(CASE WHEN DEFICIENCIES != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
    FROM data_table
    JOIN LatestInspections ON data_table.STN_CODE = LatestInspections.STN_CODE
        AND data_table.GEAR = LatestInspections.GEAR
        AND data_table.Zone = LatestInspections.Zone
        AND data_table.Gear_type = LatestInspections.Gear_type
        AND data_table.Date_of_inspection = LatestInspections.max_date_of_inspection
    ${final_condition}
    GROUP BY 
        data_table.STN_CODE, 
        data_table.GEAR, 
        data_table.Zone, 
        data_table.Gear_type, 
        data_table.Date_of_inspection,
        data_table.SR_NO   -- This line includes the SR_NO column in the GROUP BY clause
    ORDER BY 
        data_table.STN_CODE, 
        data_table.GEAR, 
        data_table.Zone, 
        data_table.Gear_type, 
        data_table.Date_of_inspection;`
     }
     else if (tableName === 'longDefi'){
       query = `WITH LatestInspections AS (
        SELECT
            STN_CODE,
            GEAR,
            Zone,
            Gear_Type,
            MAX(Date_of_inspection) AS max_date_of_inspection
        FROM data_table
        WHERE ${condition} AND
              Complaince = 'NO' AND
              Date_of_inspection <= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
        GROUP BY STN_CODE, GEAR, Zone, Gear_Type
    )
    
    SELECT
        data_table.*,
        DATE_FORMAT(Date_of_inspection, '%Y-%m-%d') AS Date_of_inspection_date,
        SUM(CASE WHEN DEFICIENCIES != 'NIL' AND Complaince = 'YES' THEN 1 ELSE 0 END) AS COMPLIED_DEFICIENCY_COUNT,
        SUM(CASE WHEN DEFICIENCIES != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
    FROM data_table
    JOIN LatestInspections ON data_table.STN_CODE = LatestInspections.STN_CODE
        AND data_table.GEAR = LatestInspections.GEAR
        AND data_table.Zone = LatestInspections.Zone
        AND data_table.Gear_type = LatestInspections.Gear_type
        AND data_table.Date_of_inspection = LatestInspections.max_date_of_inspection
    ${final_condition}
    GROUP BY 
        data_table.STN_CODE, 
        data_table.GEAR, 
        data_table.Zone, 
        data_table.Gear_type, 
        data_table.Date_of_inspection,
        data_table.SR_NO
    ORDER BY 
        data_table.STN_CODE, 
        data_table.GEAR, 
        data_table.Zone, 
        data_table.Gear_type, 
        data_table.Date_of_inspection;`
     }

      connection.query(query, async (error, result) => {
        if (error) {
          console.error('Error:', error);
          return reject(error);
        } else {
          console.log("hyperlink ==>" ,result)
          resolve(result);
        }
      });
    } catch (error) {
      console.error('Error:', error);
      reject(error);
    }
  });
};




exports.existingGearID = function (stnName, gearType, zone, type) {
  return new Promise(async (resolve, reject) => {

    try {
      const query = `select distinct Gear_ID from gear_wise where stn_code = '${stnName}' and Gear_type = '${gearType}'
      and zone ='${zone}' and Type = '${type}'ORDER BY Gear_ID ASC;`
      connection.query(query, (error, results) => {
        if (error) {
          reject(error);
        } else {

          resolve(results);
        }
      });
    }
    catch (error) {
      console.error('Error:', error);
      reject(error)
    }
  });
};

//count total no of inspection and deficiencies noted for analysis
exports.dashboardAnalysis = function (fromDate, toDate) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = `SELECT 
      (SELECT COUNT(DISTINCT CONCAT(STN_Code, '-', Zone))
       FROM data_table
       WHERE Date_of_inspection BETWEEN '${fromDate}' AND '${toDate}') AS total_inspections,
      
      (SELECT COUNT(DEFICIENCIES)
       FROM data_table
       WHERE Date_of_inspection BETWEEN '${fromDate}' AND '${toDate}'
         AND DEFICIENCIES IS NOT NULL AND DEFICIENCIES <> '') AS total_deficiencies,
         
      (SELECT COUNT(Complaince)
       FROM data_table
       WHERE Date_of_inspection BETWEEN '${fromDate}' AND '${toDate}'
       AND Complaince = 'YES') AS total_compliance_done;`
      connection.query(query, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    }
    catch (error) {
      console.error('Error:', error);
      reject(error)
    }
  });
};


exports.getMainEntryData = async (filters) => {
  const {
      stationName,
      gear,
      zone,
      fromDate,
      toDate,
      typePoint,
      typeTrack
  } = filters;

  return new Promise((resolve, reject) => {
    try {
        let query = `SELECT SR_NO, STN_CODE, GEAR, GEAR_ID, DATE_FORMAT(Date_of_inspection, '%Y-%m-%d') AS Date_of_inspection, DEFICIENCIES FROM data_table WHERE 1=1`; 

        const queryParams = [];
        if (stationName) {
            query += ` AND STN_CODE = ?`;
            queryParams.push(stationName);
        }

        if (gear) {
            query += ` AND GEAR = ?`;
            queryParams.push(gear);
        }

        if (zone) {
            query += ` AND Zone = ?`;
            queryParams.push(zone);
        }

        if (fromDate) {
            query += ` AND Date_of_inspection = ?`;
            queryParams.push(fromDate);
        }


        if (typePoint) {
            query += ` AND Gear_type = ?`;
            queryParams.push(typePoint);
        }

        if (typeTrack) {
            query += ` AND Gear_type = ?`;
            queryParams.push(typeTrack);
        }

        console.log(query);
        console.log(queryParams)
        // Execute query with connection.query
        connection.query(query, queryParams, (error, results) => {
          if (error) {
              console.error('Error fetching table data from database:', error);
              return reject(error);
          }
          resolve(results);
        });
    } catch (error) {
        console.error('Error processing query:', error);
        reject(error);
    }
  });
};

// exports.updateMainTableData = async (updateData) => {data_table
//   const {
//       newDate,
//       stationName,
//       gear,
//       zone,
//       typePoint,
//       typeTrack,
//       selectedData,
//       allSelected
//   } = updateData;

//   return new Promise((resolve, reject) => {
//       try {
//           let query;
//           const queryParams = [newDate]; 

//           if (allSelected) {
              
//               query = `UPDATE inspectionData 
//                         SET dateOfInspection = ? 
//                         WHERE stationName = ? 
//                         AND gear = ? 
//                         AND zone = ?`;

//               queryParams.push(stationName, gear, zone); 
//               if (typePoint) {
//                   query += ` AND gear_Point = ?`;
//                   queryParams.push(typePoint);
//               }
//               if (typeTrack) {
//                   query += ` AND gear_Track = ?`;
//                   queryParams.push(typeTrack);
//               }
//           } else {
              
//               query = `UPDATE inspectionData 
//                         SET dateOfInspection = ? 
//                         WHERE STN_CODE IN (?)`; 

//               queryParams.push(selectedData);
//           }

//           console.log(query);
//           console.log(queryParams);
//           connection.query(query, queryParams, (error, results) => {
//               if (error) {
//                   console.error('Error updating table data in database:', error);
//                   return reject(error);
//               }
//               resolve(results);
//           });
//       } catch (error) {
//           console.error('Error processing update query:', error);
//           reject(error);
//       }
//   });
// };


// New function to update table dates



exports.updateMainTableData = async (updateData) => {
  const {
      newDate,
      stationName,
      fromDate,
      gear,
      zone,
      typePoint,
      typeTrack,
      selectedData,
      allSelected
  } = updateData;

  return new Promise((resolve, reject) => {
      try {
          let query;
          const queryParams = [newDate]; 
          if (allSelected) {
              query = `UPDATE data_table 
                        SET Date_of_inspection = ? 
                        WHERE 1=1`; 

              if (stationName) {
                  query += ` AND STN_CODE = ?`;
                  queryParams.push(stationName);
              }

              if (gear) {
                  query += ` AND GEAR = ?`;
                  queryParams.push(gear);
              }

              if (zone) {
                  query += ` AND Zone = ?`;
                  queryParams.push(zone);
              }

              if (fromDate) {
                  query += ` AND Date_of_inspection = ?`;
                  queryParams.push(fromDate);
              }

              if (typePoint) {
                  query += ` AND Gear_type = ?`;
                  queryParams.push(typePoint);
              }

              if (typeTrack) {
                  query += ` AND Gear_type = ?`;
                  queryParams.push(typeTrack);
              }
          } else {
              query = `UPDATE data_table 
                        SET Date_of_inspection = ? 
                        WHERE SR_NO IN (?)`;

              queryParams.push(selectedData); 
          }

          console.log(query);
          console.log(queryParams);
          connection.query(query, queryParams, (error, results) => {
              if (error) {
                  console.error('Error updating table data in database:', error);
                  return reject(error);
              }
              resolve(results);
          });
      } catch (error) {
          console.error('Error processing update query:', error);
          reject(error);
      }
  });
};


// Fetch all deficiency data for DLI Division, SR_DENs, and AENs in one go
exports.getDonutChartData = () => {
  return new Promise((resolve, reject) => {
      console.log('Starting database queries...'); // Log before starting queries

      const divisionQuery = `
          SELECT 
              COUNT(*) AS total_deficiencies,
              SUM(CASE WHEN Complaince = 'YES' THEN 1 ELSE 0 END) AS complied_deficiencies
          FROM data_table
          WHERE Date_of_inspection >= NOW() - INTERVAL 90 DAY
      `;

      const srDenQuery = `
          SELECT 
              SR_DEN,
              COUNT(*) AS total_deficiencies,
              SUM(CASE WHEN Complaince = 'YES' THEN 1 ELSE 0 END) AS complied_deficiencies
          FROM data_table
          WHERE Date_of_inspection >= NOW() - INTERVAL 90 DAY
          GROUP BY SR_DEN
      `;

      const aenQuery = `
          SELECT 
              SR_DEN,
              AEN,
              COUNT(*) AS total_deficiencies,
              SUM(CASE WHEN Complaince = 'YES' THEN 1 ELSE 0 END) AS complied_deficiencies
          FROM data_table
          WHERE Date_of_inspection >= NOW() - INTERVAL 90 DAY
          GROUP BY SR_DEN, AEN
      `;

      Promise.all([
          // Division query
          new Promise((resolve, reject) => {
              connection.query(divisionQuery, (error, results) => {
                  if (error) {
                      console.error('Division query error:', error); // Log if division query fails
                      reject(error);
                  } else {
                      console.log('Division data:', results); // Log division data
                      resolve(results[0]);
                  }
              });
          }),
          // SR_DEN query
          new Promise((resolve, reject) => {
              connection.query(srDenQuery, (error, results) => {
                  if (error) {
                      console.error('SR_DEN query error:', error); // Log if SR_DEN query fails
                      reject(error);
                  } else {
                      console.log('SR_DEN data:', results); // Log SR_DEN data
                      resolve(results);
                  }
              });
          }),
          // AEN query
          new Promise((resolve, reject) => {
              connection.query(aenQuery, (error, results) => {
                  if (error) {
                      console.error('AEN query error:', error); // Log if AEN query fails
                      reject(error);
                  } else {
                      console.log('AEN data:', results); // Log AEN data
                      resolve(results);
                  }
              });
          })
      ])
      .then(([divisionData, srDenData, aenData]) => {
          console.log('All queries completed successfully.'); // Log if all queries succeed
          console.log('Processing data structure...'); // Log before processing data

          const responseData = {
              division: {
                  total_deficiency: divisionData.total_deficiencies,
                  total_complied_deficiency: divisionData.complied_deficiencies
              },
              sr_dens: srDenData.map(srDen => {
                  const relatedAens = aenData.filter(aen => aen.SR_DEN === srDen.SR_DEN);
                  return {
                      name: srDen.SR_DEN,
                      total_deficiency: srDen.total_deficiencies,
                      complied_deficiency: srDen.complied_deficiencies,
                      aens: relatedAens.map(aen => ({
                          name: aen.AEN,
                          total_deficiency: aen.total_deficiencies,
                          complied_deficiency: aen.complied_deficiencies
                      }))
                  };
              })
          };

          console.log('Structured response data:', responseData); // Log final structured data
          resolve(responseData);
      })
      .catch(error => {
          console.error('Error in processing query results:', error); // Log any error in promise chain
          reject(error);
      });
  });
};

// formModel.js

// exports.getLongPendingPerformanceData = () => {
//   return new Promise((resolve, reject) => {
//       const longPendingQuery = `
//           SELECT 
//               all_sr_den.SR_DEN,
//               COUNT(CASE WHEN DATEDIFF(CURDATE(), data_table.Date_of_inspection) > 90 AND data_table.Complaince = 'No' THEN 1 END) AS deficiencies_90_days,
//               COUNT(CASE WHEN DATEDIFF(CURDATE(), data_table.Date_of_inspection) > 120 AND data_table.Complaince = 'No' THEN 1 END) AS deficiencies_120_days,
//               COUNT(CASE WHEN DATEDIFF(CURDATE(), data_table.Date_of_inspection) > 180 AND data_table.Complaince = 'No' THEN 1 END) AS deficiencies_180_days,
//               COUNT(CASE WHEN DATEDIFF(CURDATE(), data_table.Date_of_inspection) > 365 AND data_table.Complaince = 'No' THEN 1 END) AS deficiencies_365_days
//           FROM 
//               (SELECT DISTINCT SR_DEN FROM data_table) AS all_sr_den
//           LEFT JOIN 
//               data_table ON all_sr_den.SR_DEN = data_table.SR_DEN
//           GROUP BY 
//               all_sr_den.SR_DEN
//           ORDER BY 
//               all_sr_den.SR_DEN;
//       `;

//       connection.query(longPendingQuery, (error, results) => {
//           if (error) {
//               console.error('Error executing long pending performance query:', error);
//               reject(error);
//           } else {
//               console.log('Long pending performance data:', results);
//               resolve(results);
//           }
//       });
//   });
// };

// exports.getAverageComplianceTimeData = () => {
//   return new Promise((resolve, reject) => {
//       const averageComplianceQuery = `
//           SELECT 
//               all_sr_den.SR_DEN,
//               COALESCE(COUNT(data_table.SR_NO), 0) AS total_deficiencies,
//               COALESCE(SUM(DATEDIFF(data_table.Date_of_Complaince, data_table.Date_of_inspection)), 0) AS total_days_compliance,
//               COALESCE(ROUND(SUM(DATEDIFF(data_table.Date_of_Complaince, data_table.Date_of_inspection)) / COUNT(data_table.SR_NO)), 0) AS avg_compliance_time
//           FROM 
//               (SELECT DISTINCT SR_DEN FROM data_table) AS all_sr_den
//           LEFT JOIN 
//               data_table ON all_sr_den.SR_DEN = data_table.SR_DEN
//               AND data_table.Date_of_Complaince != '2000-01-01'
//               AND data_table.Date_of_Complaince >= '2000-01-01'
//               AND YEAR(data_table.Date_of_Complaince) <= YEAR(CURDATE())
//           GROUP BY 
//               all_sr_den.SR_DEN
//           ORDER BY 
//               all_sr_den.SR_DEN;
//       `;

//       connection.query(averageComplianceQuery, (error, results) => {
//           if (error) {
//               console.error('Error executing average compliance time query:', error);
//               reject(error);
//           } else {
//               console.log('Average compliance time data:', results);
//               resolve(results);
//           }
//       });
//   });
// };


// formModel.js

exports.getLongPendingPerformanceData = () => {
  return new Promise((resolve, reject) => {
    const longPendingQuery = `
      SELECT 
          all_sr_den.SR_DEN,
          COUNT(CASE WHEN DATEDIFF(CURDATE(), data_table.Date_of_inspection) > 90 AND data_table.Complaince = 'No' THEN 1 END) AS deficiencies_90_days,
          COUNT(CASE WHEN DATEDIFF(CURDATE(), data_table.Date_of_inspection) > 120 AND data_table.Complaince = 'No' THEN 1 END) AS deficiencies_120_days,
          COUNT(CASE WHEN DATEDIFF(CURDATE(), data_table.Date_of_inspection) > 180 AND data_table.Complaince = 'No' THEN 1 END) AS deficiencies_180_days,
          COUNT(CASE WHEN DATEDIFF(CURDATE(), data_table.Date_of_inspection) > 365 AND data_table.Complaince = 'No' THEN 1 END) AS deficiencies_365_days
      FROM 
          (SELECT DISTINCT SR_DEN FROM data_table) AS all_sr_den
      LEFT JOIN 
          data_table ON all_sr_den.SR_DEN = data_table.SR_DEN
      GROUP BY 
          all_sr_den.SR_DEN
      ORDER BY 
          all_sr_den.SR_DEN;
    `;

    connection.query(longPendingQuery, (error, results) => {
      if (error) {
        console.error('Error executing long pending performance query:', error);
        reject(error);
      } else {
        // Structure data to match frontend expectations
        const formattedData = {
          "90days": results.map(row => row.deficiencies_90_days || 0),
          "120days": results.map(row => row.deficiencies_120_days || 0),
          "180days": results.map(row => row.deficiencies_180_days || 0),
          "365days": results.map(row => row.deficiencies_365_days || 0),
        };
        resolve(formattedData);
      }
    });
  });
};

exports.getAverageComplianceTimeData = () => {
  return new Promise((resolve, reject) => {
    const averageComplianceQuery = `
      SELECT 
          all_sr_den.SR_DEN,
          COALESCE(COUNT(data_table.SR_NO), 0) AS total_deficiencies,
          COALESCE(SUM(DATEDIFF(data_table.Date_of_Complaince, data_table.Date_of_inspection)), 0) AS total_days_compliance,
          COALESCE(ROUND(SUM(DATEDIFF(data_table.Date_of_Complaince, data_table.Date_of_inspection)) / COUNT(data_table.SR_NO)), 0) AS avg_compliance_time
      FROM 
          (SELECT DISTINCT SR_DEN FROM data_table) AS all_sr_den
      LEFT JOIN 
          data_table ON all_sr_den.SR_DEN = data_table.SR_DEN
          AND data_table.Date_of_Complaince != '2000-01-01'
          AND data_table.Date_of_Complaince >= '2000-01-01'
          AND YEAR(data_table.Date_of_Complaince) <= YEAR(CURDATE())
      GROUP BY 
          all_sr_den.SR_DEN
      ORDER BY 
          all_sr_den.SR_DEN;
    `;

    connection.query(averageComplianceQuery, (error, results) => {
      if (error) {
        console.error('Error executing average compliance time query:', error);
        reject(error);
      } else {
        // Structure data to match frontend expectations
        const formattedData = {
          averageCompliance: {
            all: results.map(row => row.avg_compliance_time || 0),
            complied: results.map(row => row.avg_compliance_time || 0), // Adjust if there's a separate logic for complied
          }
        };
        resolve(formattedData);
      }
    });
  });
};







