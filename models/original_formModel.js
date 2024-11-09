//DOn't change anything
 //in this file 


const res = require('express/lib/response');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Devansh@2010',
  database: 'point_crossing'
});


exports.findUserByUsername = (username, callback) => {
  console.log('recieved the call');
  console.log('username',username);
  connection.query('SELECT * FROM users WHERE email = ?', [username], (err, results) => {
    console.log(results);
    if (err) {
      console.log('error',err)
      return callback(err, null);
    }
    if (results.length === 0) {
      console.log('recieved null')
      return callback(null, null);
    }
    console.log('sent the data');
    return callback(null, results[0]);
  });
};

exports.comparePasswords = (password, hashedPassword, callback) => {
  console.log('comapred password got the call')
  bcrypt.compare(password, hashedPassword, (err, result) => {
    if (err) {
      console.log('error',err)
      return callback(err, false);
    }
    console.log(result);
    return callback(null, result);
  });
};



exports.saveUser = (userData) => {
  return new Promise((resolve, reject) => {
    // Open the MySQL connection

      
      // Insert user data into your users table
      connection.query('INSERT INTO users (username, email, password, hashedPassword, preferences) VALUES (?, ?, ?, ?,?)', [
        userData.name,
        userData.email,
        userData.password,
        userData.hashedPassword, // Make sure it's already hashed
        userData.preferences,
      ], (error, results) => {
        // Close the connection, whether there was an error or not
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
        return callback(null,user)
      }
    });

};



exports.fetchStationNames = (option,optionDetails) => {
  return new Promise((resolve, reject) => {
    const query = option ? `SELECT DISTINCT STN_Code FROM main_sheet where ${option} = '${optionDetails}'`:'SELECT DISTINCT STN_Code FROM main_sheet'
    //connection.query(query, dataWithDeficiency, (err, results)
    connection.query(query,(error, results) => {
      if (error) {
        reject(error);
      } else {
        const stationNames = results.map(result => result.STN_Code);
        console.log('result check')
        console.log(stationNames);
        resolve(stationNames);
      }
    });
  });
};

exports.fetchSelectedOptions = (option) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT DISTINCT ${option} AS "col" FROM main_sheet`
    //connection.query(query, dataWithDeficiency, (err, results)
    connection.query(query,(error, results) => {
      if (error) {
        reject(error);
      } else {
        console.log(results)
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

exports.fetchZone = (stationName,gearName) => {
  return new Promise((resolve, reject) => {
    connection.query('SELECT DISTINCT Zone FROM gear_wise WHERE STN_Code = ? and Gear_type = ?', [stationName,gearName], (error, results) => {
      console.log(results);
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

exports.fetchGearIDsByStationAndGear = (stationName, gear,Zone) => {
  return new Promise((resolve, reject) => {
    if(!Zone || Zone === "NZ"){
      query = `SELECT DISTINCT gear_ID FROM gear_wise WHERE STN_Code = '${stationName}' AND Gear_type = '${gear}'`
      console.log(query)
    }
    else{
      query = `SELECT DISTINCT gear_ID FROM gear_wise WHERE STN_Code = '${stationName}' AND Gear_type = '${gear}' and Zone ='${Zone}'`
      console.log(query)
    }
    connection.query(query, [stationName, gear,Zone], (error, results) => {
      if (error) {
        reject(error);
      } else {
        console.log(results);
        resolve(results);
      }
    });
  });
};

exports.fetchDeficiencesByGear = (gear) => {
  return new Promise((resolve, reject) => {
    console.log(gear);
    console.log(`SELECT DISTINCT ${gear} FROM deficiencies_list`);
    connection.query(`SELECT DISTINCT ${gear} AS "list" FROM deficiencies_list`, [gear], (error, results) => {
      if (error) {
        reject(error);
      } else {
        console.log(results);
        resolve(results);
      }
    });
  });
};



// exports.saveFormToDatabase = (formData) => {
//   console.log(formData)
//   return new Promise((resolve, reject) => {

//     const fetchedDataArray = [];
//     connection.query(`SELECT * FROM main_sheet where STN_Code = "${formData.stationName}" `, formData, (error, results) => {
//       if (error) {
//         reject(error);
//       } else {
//         const firstElement = results[0];
//         const dataToInsert = {
//           STN_CODE:formData.stationName,
//           STN_NAME: firstElement.STN_Name,
//           GEAR:formData.gear,
//           GEAR_ID:formData.gearID,
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
//           Date_of_inspection:formData.dateOfInspection
//         };
//         // loopData contains the deficieny list and we will iterate over it and insert it to dataTO insert so that everytime it 
//         //get inserted into new row only with change of deficiences 
//         const loopData = {
//           Deficiencies: formData.deficiencies
//         };
//         const query = 'INSERT INTO data_table SET ?';

//         for (let i = 3; i <= 12; i++) {
//           const gearIDKey = `gearID${i}`;
//           const deficienciesKey = `deficiencies${i}`;
//           const lhsKey = `LHS${i}`;
//           const rhsKey = `RHS${i}`;
//           const looseKey = `Loose${i}`;
//           const chairKey = `Chair${i}`;
//           const guageKey = `Guage${i}`;
//           const guageTieKey = `Guage_Tie${i}`;
    
//           const gearID = formData[gearIDKey];
//           const deficiencies = formData[deficienciesKey];
//           const lhsValue = parseInt(formData[lhsKey], 10);
//           const rhsValue = parseInt(formData[rhsKey], 10);
//           const looseValue = parseInt(formData[looseKey], 10);
//           const chairValue = parseInt(formData[chairKey], 10);
//           const guageValue = parseInt(formData[guageKey], 10);
//           const guageTieValue = parseInt(formData[guageTieKey], 10);
    
//           if (gearID && deficiencies && gearID !== '' && deficiencies.length > 0) {
//             deficiencies.forEach((deficiency) => {
//               let newDeficiency = deficiency;
    
//               if (deficiency === 'stud bolt loose' && looseValue > 1) {
//                 newDeficiency = `${looseValue}-${deficiency}`;
//               } else if (deficiency === 'L.H.S. housing poor' && lhsValue > 1) {
//                 newDeficiency = `${lhsValue}-${deficiency}`;
//               } else if (deficiency === 'R.H.S. housing poor' && rhsValue > 1) {
//                 newDeficiency = `${rhsValue}-${deficiency}`;
//               } else if (deficiency === 'Chair plated broken' && chairValue > 1) {
//                 newDeficiency = `${chairValue}-${deficiency}`;
//               } else if (
//                 deficiency === 'Guage tie plate bracket welding broken' &&
//                 guageValue > 1
//               ) {
//                 newDeficiency = `${guageValue}-${deficiency}`;
//               } else if (
//                 deficiency === 'Guage tie plate bracket broken' &&
//                 guageTieValue > 1
//               ) {
//                 newDeficiency = `${guageTieValue}-${deficiency}`;
//               }
    
//               const dataWithDeficiency = {
//                 ...dataToInsert,
//                 GEAR_ID: gearID,
//                 DEFICIENCIES: newDeficiency,
//               };
    
//               connection.query(query, dataWithDeficiency, (err, results) => {
//                 if (err) {
//                   console.error('Error inserting data:', err);
//                 } else {
//                   console.log('Data inserted successfully.');
//                   console.log('Inserted ID:', results.insertId);
//                   connection.query(`SELECT STN_CODE, GEAR,GEAR_ID,Date_of_inspection,DEFICIENCIES FROM data_table WHERE SR_NO = ?`, [results.insertId], (err, data) => {
//                     if (err) {
//                       console.error('Error fetching data:', err);
//                       reject(err);
//                     } else {
//                       // Push fetched data to the array
//                       fetchedDataArray.push({ data: data });
        
//                       // If all data is fetched, resolve with the array
                    
//                     }
//                   });
                  
//                 }
              
//               });
            
//             });
//           }
//         }
//         resolve(fetchedDataArray);;
//       }
//     });
//   });
// };

// exports.saveFormToDatabase = (formData) => {
//   return new Promise((resolve, reject) => {
//     let totalGearIDs = 0;
//     for (const key in formData) {
//       if (key.startsWith('gearID')) {
        
//         totalGearIDs++;
//       }
//     }
//     console.log(totalGearIDs);
    
//     const fetchedDataArray = [];
//     const query = 'INSERT INTO data_table SET ?';

//     const gearIDKeys = [];
//     const deficienciesKeys = [];
//     const lhsKeys = [];
//     const rhsKeys = [];
//     const looseKeys = [];
//     const chairKeys = [];
//     const guageKeys = [];
//     const guageTieKeys = [];

//     for (let i = 3; i <= totalGearIDs+3; i++) {
//       gearIDKeys.push(`gearID${i}`);
//       deficienciesKeys.push(`deficiencies${i}`);
//       lhsKeys.push(`LHS${i}`);
//       rhsKeys.push(`RHS${i}`);
//       looseKeys.push(`Loose${i}`);
//       chairKeys.push(`Chair${i}`);
//       guageKeys.push(`Guage${i}`);
//       guageTieKeys.push(`Guage_Tie${i}`);
//     }
//     console.log(gearIDKeys);
//     console.log(deficienciesKeys)

//     connection.query(`SELECT * FROM main_sheet where STN_Code = ?`, [formData.stationName], (error, results) => {
//       if (error) {
//         reject(error);
//       } else if (results.length === 0) {
//         reject(new Error('Station not found'));
//       } else {
//         const firstElement = results[0];
//         const dataToInsert = {
//           STN_CODE: formData.stationName,
//           STN_NAME: firstElement.STN_Name,
//           GEAR: formData.gear,
//           GEAR_ID: formData.gearID,
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
//           Date_of_inspection: formData.dateOfInspection
//         };

//         for (let i = 0; i < gearIDKeys.length; i++) {
//           const gearIDKey = gearIDKeys[i];
//           const deficienciesKey = deficienciesKeys[i];
//           const lhsKey = lhsKeys[i];
//           const rhsKey = rhsKeys[i];
//           const looseKey = looseKeys[i];
//           const chairKey = chairKeys[i];
//           const guageKey = guageKeys[i];
//           const guageTieKey = guageTieKeys[i];

//           const gearID = formData[gearIDKey];
//           const deficiencies = formData[deficienciesKey];
//           const lhsValue = parseInt(formData[lhsKey], 10);
//           const rhsValue = parseInt(formData[rhsKey], 10);
//           const looseValue = parseInt(formData[looseKey], 10);
//           const chairValue = parseInt(formData[chairKey], 10);
//           const guageValue = parseInt(formData[guageKey], 10);
//           const guageTieValue = parseInt(formData[guageTieKey], 10);

//           if (gearID && deficiencies && gearID !== '' && deficiencies.length > 0) {
//             deficiencies.forEach((deficiency) => {
//               let newDeficiency = deficiency;

//               if (deficiency === 'stud bolt loose' && looseValue > 1) {
//                 newDeficiency = `${looseValue}-${deficiency}`;
//               } else if (deficiency === 'L.H.S. housing poor' && lhsValue > 1) {
//                 newDeficiency = `${lhsValue}-${deficiency}`;
//               } else if (deficiency === 'R.H.S. housing poor' && rhsValue > 1) {
//                 newDeficiency = `${rhsValue}-${deficiency}`;
//               } else if (deficiency === 'Chair plated broken' && chairValue > 1) {
//                 newDeficiency = `${chairValue}-${deficiency}`;
//               } else if (
//                 deficiency === 'Guage tie plate bracket welding broken' &&
//                 guageValue > 1
//               ) {
//                 newDeficiency = `${guageValue}-${deficiency}`;
//               } else if (
//                 deficiency === 'Guage tie plate bracket broken' &&
//                 guageTieValue > 1
//               ) {
//                 newDeficiency = `${guageTieValue}-${deficiency}`;
//               }

//               const dataWithDeficiency = {
//                 ...dataToInsert,
//                 GEAR_ID: gearID,
//                 DEFICIENCIES: newDeficiency,
//               };

//               connection.query(query, dataWithDeficiency, (err, results) => {
//                 if (err) {
//                   console.error('Error inserting data:', err);
//                 } else {
//                   console.log('Data inserted successfully.');
//                   console.log('Inserted ID:', results.insertId);
//                   // connection.query(`SELECT STN_CODE, GEAR, GEAR_ID, Date_of_inspection, DEFICIENCIES FROM data_table WHERE SR_NO = ?`, [results.insertId], (err, data) => {
//                   //   if (err) {
//                   //     console.error('Error fetching data:', err);
//                   //     //reject(err);
//                   //   } else {
//                   //     // Push fetched data to the array
//                   //     console.log({ insertId: results.insertId, data: data })
//                   //     fetchedDataArray.push({ insertId: results.insertId, data: data });
                      

//                   //     // If all data is fetched, resolve with the array
//                   //     // if (fetchedDataArray.length === gearIDKeys.length * deficiencies.length) {
                        
//                   //     // }
//                   //   }
//                   // });
//                 }
//               });
              
//             });
//           }
//         }
        
//       }
//     });
//   });
// };


exports.performUpdate = (formData) => {
  return new Promise((resolve, reject) => {
    console.log(formData);
    const lhsValue = parseInt(formData.updatedData.LHS, 10);
    const rhsValue = parseInt(formData.updatedData.RHS, 10);
    const looseValue = parseInt(formData.updatedData.Loose, 10);
    const chairValue = parseInt(formData.updatedData.Chair, 10);
    const guageValue = parseInt(formData.updatedData.Guage, 10);
    const guageTieValue = parseInt(formData.updatedData.Guage_Tie, 10);

    
    connection.query(`SELECT * FROM main_sheet where STN_Code = ?`, [formData.updatedData.stationName], (error, results) => {
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
              formData.deletedArray.forEach((value) => {
                connection.query(query, value, (err, results) => {
                  if (err) {
                    console.error('Error deleting data:', err);
                    reject(err);
                  } else {
                    console.log('Success');
                    resolve();
                  }
                });
              });
            })
          );
        }
        if (!formData.updatedArray.length ) {
          promises.push(Promise.resolve());
        } else {
            formData.updatedArray.forEach((deficiency) => {
            let newDeficiency = deficiency;
            let defi_num;

            if (deficiency === 'stud bolt loose' && looseValue > 1) {
              defi_num = looseValue;
            } 
            else if (deficiency === 'L.H.S. housing poor' && lhsValue > 1) {
              defi_num = lhsValue;
            } 
            else if (deficiency === 'R.H.S. housing poor' && rhsValue > 1) {
              defi_num = rhsValue;
            } 
            else if (deficiency === 'Chair plated broken' && chairValue > 1) {
              defi_num = chairValue;
            } 
            else if 
            (
              deficiency === 'Guage tie plate bracket welding broken' &&
              guageValue > 1
            ) {

                defi_num = guageValue;
                } 
                else if (
                    deficiency === 'Guage tie plate bracket broken' &&
                    guageTieValue > 1
                  ) {
                    defi_num = guageTieValue;
                  }

                  const dataWithDeficiency = {
                    ...dataToInsert,
                    GEAR_ID: formData.updatedData. gearID,
                    DEFI_NUM:defi_num,
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
                          console.log('Data inserted successfully.');
                          console.log('Inserted ID:', results.insertId);
                          resolve();
    
                        }
                      });
                    })
                  );
                });
          }
            // if (!formData.deletedArray.length) {
            //   // If the array is empty, create and resolve a promise immediately
            //   promises.push(Promise.resolve());
            // } else {
            //   // If the array is not empty, perform the deletion operation and resolve the promise
            //   promises.push(
            //     new Promise((resolve, reject) => {
            //       const query = 'DELETE FROM data_table WHERE SR_NO IN (?)';
            //       formData.deletedArray.forEach((value) => {
            //         connection.query(query, value, (err, results) => {
            //           if (err) {
            //             console.error('Error deleting data:', err);
            //             reject(err);
            //           } else {
            //             console.log('Success');
            //             resolve();
            //           }
            //         });
            //       });
            //     })
            //   );
            // }
    
        // Use Promise.all to wait for all promises to resolve
        Promise.all(promises)
          .then(() => {
            let Date_of_inspection = formatDate(formData.updatedData.date);
            responseData = {
              stationName:formData.updatedData.stationName,
              gear:formData.updatedData.gear,
              Date_of_inspection:Date_of_inspection
            }
            console.log('this is response data');
            console.log(responseData);
            resolve(responseData);
          //   connection.query(`WITH DataCTE AS (
          //     SELECT
          //         STN_code,
          //         Gear,
          //         Gear_ID,
          //         DATE_FORMAT(Date_of_inspection, '%Y-%m-%d') AS Date_of_inspection,
          //         GROUP_CONCAT(SR_NO ORDER BY SR_NO) AS SR_NO,
          //         GROUP_CONCAT(DEFICIENCIES) AS DEFICIENCIES
          //     FROM
          //         data_table
          //     WHERE
          //       STN_code = ? and Gear = ? and Date_of_inspection = ? 
          //     GROUP BY
                  
          //         STN_code,
          //         Gear,
          //         Gear_ID,
          //         DATE_FORMAT(Date_of_inspection, '%Y-%m-%d')
          // )
          
          // SELECT
              
          //     STN_code,
          //     Gear,
          //     Gear_ID,
          //     Date_of_inspection,
          //     CONCAT('[', SR_NO, ']') AS SR_NO,
          //     CONCAT('', DEFICIENCIES, '') AS DEFICIENCIES
          // FROM
          //     DataCTE;`, [formData.updatedData.stationName, formData.updatedData.gear,Date_of_inspection], (err, data) => {
          //     if (err) {
          //       console.error('Error fetching data:', err);
          //       reject(err);
          //     } else {
          //       console.log(data);
          //       resolve(data);
          //     }
          //   });
           
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  });
};

exports.renderResponseTable = (responseData) =>{
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
              DataCTE;`, [formData.responseData.stationName, formData.responseData.gear,Date_of_inspection], (err, data) => {
      if (err) {
        console.error('Error fetching data:', err);
        reject(err);
      } else {

        console.log(data);
        resolve(data);
      }
    });

    
  })
}

exports.saveStationGearFormData = (formatData) =>{
  return new Promise((resolve, reject) =>{
    const query = 'INSERT INTO gear_wise SET ?';
    let data ={
      STN_CODE :formData.STN_CODE,
      Gear_type:formatData.Gear_type,
      Gear_Id:formatData.Gear_Id,
      Zone:formatData.Zone,
      Type:formData.Type,
      Line:formatData.Line
    }

    connection.query(query, data, (err, results) => {
      if (err) {
        console.error('Error inserting data:', err);
        reject(err);
      } else {
        resolve();

      }
    });
  })
}

exports.saveFormToDatabase = (formData) => {
  return new Promise((resolve, reject) => {
    let repeat_entry = false;
    let totalGearIDs = 0;
    for (const key in formData) {
      if (key.startsWith('gearID')) {
        totalGearIDs++;
      }
    }
    const query = 'INSERT INTO data_table SET ?';
    const gearIDKeys = [];
    const deficienciesKeys = [];
    const lhsKeys = [];
    const rhsKeys = [];
    const looseKeys = [];
    const chairKeys = [];
    const guageKeys = [];
    const guageTieKeys = [];

    for (let i = 3; i <= totalGearIDs+3; i++) {
      gearIDKeys.push(`gearID${i}`);
      deficienciesKeys.push(`deficiencies${i}`);
      lhsKeys.push(`LHS${i}`);
      rhsKeys.push(`RHS${i}`);
      looseKeys.push(`Loose${i}`);
      chairKeys.push(`Chair${i}`);
      guageKeys.push(`Guage${i}`);
      guageTieKeys.push(`Guage_Tie${i}`);
    }
    console.log(lhsKeys);

    connection.query(`SELECT * FROM main_sheet where STN_Code = ?`, [formData.stationName], (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length === 0) {
        reject(new Error('Station not found'));
      } else {
        const firstElement = results[0];
        const dataToInsert = {
          STN_CODE: formData.stationName,
          STN_NAME: firstElement.STN_Name,
          GEAR: formData.gear,
          GEAR_ID: formData.gearID,
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

        // Create an array to hold all the promises
        const promises = [];
        

        for (let i = 0; i < gearIDKeys.length; i++) {
          const gearIDKey = gearIDKeys[i];
          const deficienciesKey = deficienciesKeys[i];
          const lhsKey = lhsKeys[i];
          const rhsKey = rhsKeys[i];
          const looseKey = looseKeys[i];
          const chairKey = chairKeys[i];
          const guageKey = guageKeys[i];
          const guageTieKey = guageTieKeys[i];

          const gearID = formData[gearIDKey];
          let deficiencies = formData[deficienciesKey];
          const lhsValue = parseInt(formData[lhsKey], 10);
          const rhsValue = parseInt(formData[rhsKey], 10);
          const looseValue = parseInt(formData[looseKey], 10);
          const chairValue = parseInt(formData[chairKey], 10);
          const guageValue = parseInt(formData[guageKey], 10);
          const guageTieValue = parseInt(formData[guageTieKey], 10);

          //Remove this 
          console.log(deficiencies);

          if (!deficiencies){
            deficiencies =['NIL']
          }

          if (gearID && gearID !== '') {
            deficiencies.forEach((deficiency) => {
              let newDeficiency = deficiency;
              let defi_num;

              if (deficiency === 'stud bolt loose' && looseValue > 1) {
                defi_num = looseValue
              } else if (deficiency === 'L.H.S. housing poor' && lhsValue > 1) {
                defi_num = lhsValue
              } else if (deficiency === 'R.H.S. housing poor' && rhsValue > 1) {
                defi_num = rhsValue;
              } else if (deficiency === 'Chair plated broken' && chairValue > 1) {
                defi_num = chairValue;
              } else if (deficiency === 'Guage tie plate bracket welding broken' && guageValue > 1) {
                defi_num = guageValue;
              } else if (deficiency === 'Guage tie plate bracket broken' && guageTieValue > 1) {
                defi_num = guageTieValue;
              }
              else{
                defi_num = 0;
              }

              const dataWithDeficiency = {
                ...dataToInsert,
                GEAR_ID: gearID,
                DEFI_NUM: defi_num,
                DEFICIENCIES: newDeficiency,
              };

              // Push the promise for the current query into the promises array
              promises.push(
                new Promise((resolve, reject) => {
                  let date =formatDate(dataWithDeficiency.Date_of_inspection);
                  connection.query(
                    'SELECT * FROM data_table WHERE STN_CODE = ? AND GEAR_ID = ? AND Date_of_inspection = ?',
                    [dataWithDeficiency.STN_CODE, dataWithDeficiency.GEAR_ID, date],
                    (err, results) => {
                      if (err) {
                        console.error('Error checking for existing data:', err);
                        reject(err);
                      } else {
                        if (results.length === 0) {
                          // Data doesn't exist, insert it
                          connection.query(query, dataWithDeficiency, (err, results) => {
                            if (err) {
                              console.error('Error inserting data:', err);
                              reject(err);
                            } else {
                              console.log('Data inserted successfully.');
                              console.log('Inserted ID:', results.insertId);
                              resolve();
                            }
                          });
                        } else {
                          // Data already exists, resolve without inserting
                          repeat_entry = true;
                          console.log('Data already exists, skipping insertion.');
                          resolve();
                        }
                      }
                    }
                  );
                })
              );
              // promises.push(
              //   new Promise((resolve, reject) => {
              //     connection.query(query, dataWithDeficiency, (err, results) => {
              //       if (err) {
              //         console.error('Error inserting data:', err);
              //         reject(err);
              //       } else {
              //         console.log('Data inserted successfully.');
              //         console.log('Inserted ID:', results.insertId);
              //         resolve();
 
              //       }
              //     });
              //   })
              // );
            });
          }
        }

        // Use Promise.all to wait for all promises to resolve
        Promise.all(promises)
          .then(() => {
            if (repeat_entry){
              const data = [];
;              resolve(data);
            }
            else{
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
                DataCTE;`, [formData.stationName, formData.gear,Date_of_inspection], (err, data) => {
                if (err) {
                  console.error('Error fetching data:', err);
                  reject(err);
                } else {
                  console.log(data);
                  // Push fetched data to the array
                  data.sort((a, b) => {
                    if (a.DEFICIENCIES === 'Nil' && b.DEFICIENCIES !== 'Nil') {
                      return 1; // Move 'Nil' DEFICIENCIES to the end
                    } else if (a.DEFICIENCIES !== 'Nil' && b.DEFICIENCIES === 'Nil') {
                      return -1; // Keep non-'Nil' DEFICIENCIES at the beginning
                    } else {
                      return 0; // Leave other elements in their current order
                    }
                  });

                  // Resolve this promise since the query is completed
                  resolve(data);
                }
              });
          }
           
          })
          .catch((error) => {
            reject(error);
          });
      }
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
  console.log(formData);
  return new Promise((resolve, reject) => {
    let repeat_entry = false;
    const fetchedDataArray = [];
    connection.query(`SELECT * FROM main_sheet WHERE STN_Code = "${formData.stationName}"`, formData, (error, results) => {
      if (error) {
        reject(error);
      } else {
        let defi_num;
        let newDeficiency = formData.deficiencies;
        let deficiency = formData.deficiencies;
        if (deficiency === 'stud bolt loose' && formData.Loose_gear > 1) {
          console.log(formData.Loose_gear)
          defi_num = formData.Loose_gear;
        } else if (deficiency === 'L.H.S. housing poor' && formData.LHS_gear > 1) {
          console.log(formData.LHS_gear)
          defi_num = formData.LHS_gear;
        } else if (deficiency === 'R.H.S. housing poor' && formData.RHS_gear > 1) {
          console.log(formData.RHS_gear)
          defi_num = formData.RHS_gear
        } else if (deficiency === 'Chair plated broken' && formData.Chair_gear > 1) {
          console.log(formData.Chair_gear)
          defi_num = formData.Chair_gear;
        } else if (deficiency === 'Guage tie plate bracket welding broken' && formData.Guage_gear > 1 ) {
          console.log(formData.Guage_gear)
          defi_num = formData.Guage_gear;
        } else if (deficiency === 'Guage tie plate bracket broken' && formData.Guage_Tie_gear > 1) {
          console.log(formData.Guage_Tie_gear)
          defi_num = formData.Guage_Tie_gear;
        }
        else{
          defi_num = 0;
        }
        console.log(newDeficiency);
        console.log(defi_num);
        const firstElement = results[0];
        const dataToInsert = {
          STN_CODE: formData.stationName,
          STN_NAME: firstElement.STN_Name,
          GEAR: formData.gear,
          DEFICIENCIES:newDeficiency,
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
            let date =formatDate(dataWithGear.Date_of_inspection);
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
                  console.log('Data already exists, skipping insertion.');
                  resolve();
                } else {
                  // Data does not exist, insert it
                  connection.query(query, dataWithGear, (err, results) => {
                    if (err) {
                      reject(err);
                    } else {
                      console.log('Data inserted successfully.');
                      console.log('Inserted ID:', results.insertId);
                      resolve();
                    }
                  });
                }
              }
            );
          });
          // return new Promise((resolve, reject) => {
          //   connection.query(query, dataWithGear, (err, results) => {
          //     if (err) {
          //       reject(err);
          //     } else {
          //       console.log('Data inserted successfully.');
          //       console.log('Inserted ID:', results.insertId);
          //       resolve();
          //     }
          //   });
          // });
        });
        Promise.all(insertPromises)
        .then(() => {
          if(repeat_entry){
            const data = [];
            resolve(data);
          }else{
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
                  DataCTE;`, [formData.stationName, formData.gear,Date_of_inspection], (err, data) => {
                  if (err) {
                    console.error('Error fetching data:', err);
                    reject(err);
                  } else {
                    console.log(data);
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

// Function for fetching data for the table from the database
exports.getDataFromDatabase = function(formData) {
  console.log(formData)
  return new Promise((resolve, reject) => {
    let conditionString;

    if (formData.selectOption === "PWI" || formData.selectOption === "CPWI"){
      if (formData.complainceOption === "ALL")
      {
        conditionString = `${formData.selectOption} = '${formData.optionDetails}' and STN_Code ='${formData.stationName}'`
      }
      else{
        conditionString = `${formData.selectOption} = '${formData.optionDetails}' and STN_Code ='${formData.stationName}' and Complaince = '${formData. complainceOption}'`
      }
      
    }else{
      if (formData.complainceOption === "ALL")
      {
        conditionString = `${formData.selectOption} = '${formData.optionDetails}'`
      }
      else{
        conditionString = `${formData.selectOption} = '${formData.optionDetails}' and Complaince = '${formData.complainceOption}'`
      }
    }

    const sql = `WITH DataCTE AS (
      SELECT
          STN_code,
          Gear,
          Gear_ID,
          DATE_FORMAT(Date_of_inspection, '%Y-%m-%d') AS Date_of_inspection,
          GROUP_CONCAT(SR_NO ORDER BY SR_NO) AS SR_NO,
          GROUP_CONCAT(Complaince) AS Complaince,
          GROUP_CONCAT(DEFI_NUM) AS DEFI_NUM,
          GROUP_CONCAT(DEFICIENCIES) AS DEFICIENCIES,
          GROUP_CONCAT(Action_Taken) AS Action_Taken,
          GROUP_CONCAT(Acknowledgement) AS Acknowledgement,
          GROUP_CONCAT(Acknowledge_Review) AS Acknowledge_Review
      FROM
          data_table
      WHERE
         ${conditionString}
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
      CONCAT('[', Complaince, ']') AS Complaince,
      CONCAT('[', DEFI_NUM, ']') AS DEFI_NUM,
      CONCAT('[', DEFICIENCIES, ']') AS DEFICIENCIES,
      CONCAT('[', Action_Taken, ']') AS Action_Taken,
      CONCAT('[', Acknowledgement, ']') AS Acknowledgement,
      CONCAT('[', Acknowledge_Review, ']') AS Acknowledge_Review

  FROM
      DataCTE;`    
    connection.query(sql, (error, result) => {
       if (error) {
         reject(error);
       } else {
          console.log(result);
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

exports.fetchRenderTableData = function(data) {
  return new Promise((resolve,reject) =>{
    console.log('this is the data in models')
    console.log(data);
    // let Date_of_inspection = formatDateForMySQL(data.dateOfInspection);
    connection.query(`WITH DataCTE AS (
      SELECT
          
          STN_code,
          Gear,
          Gear_ID,
          DATE_FORMAT(Date_of_inspection, '%Y-%m-%d') AS Date_of_inspection,
          GROUP_CONCAT(SR_NO ORDER BY SR_NO) AS SR_NO,
          GROUP_CONCAT(DEFI_NUM) AS DEFI_NUM,
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
            CONCAT('', DEFI_NUM, '') AS DEFI_NUM,
            CONCAT('', DEFICIENCIES, '') AS DEFICIENCIES
        FROM
            DataCTE;`, [data.stationName, data.gear,data.Date_of_inspection], (err, result) => {
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
              console.log(result);
              // Push fetched data to the array
              //fetchedDataArray.push({ data: data });
              // Resolve this promise since the query is completed
              resolve(result);
            }
          });
  });
};

// Function for updating the data in the database
exports.updateDataInDatabase = function(updatedData) {
  return new Promise((resolve, reject) => {
    console.log(updatedData)
    const delimiter = '|';
    const inspectionDate = updatedData.additionalFieldData.inspectionDate;
// Format the date as 'YYYY-MM-DD'
    const formattedDate = new Date(inspectionDate).toISOString().split('T')[0];
    connection.query('SELECT Action_Taken FROM data_table WHERE SR_NO = ?', [updatedData.indentifier], (err, rows) => {
      if (err) {
        console.error('Error fetching history:', err);
        return;
      }

      const historyString = rows[0].Action_Taken;

      // Add the new action to the history string with the delimiter
      const updatedHistory = historyString + delimiter + updatedData.additionalFieldData.actionTaken;

    const query = `UPDATE data_table
    SET 
        Complaince = '${updatedData.editedData}',
        Date_of_complaince = '${formattedDate}',
        Time_of_complaince = '${updatedData.additionalFieldData.inspectionTime}',
        Action_Taken = '${updatedHistory}'
    WHERE
        SR_NO = ${updatedData.indentifier};`
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


exports.acknowledgeDataTable = function(formData) {
  return new Promise((resolve, reject) => { 
    let conditionString;

    if (formData.selectOption === "PWI" || formData.selectOption === "CPWI"){
      conditionString = `${formData.selectOption} = '${formData.optionDetails}' and STN_Code ='${formData.stationName}'`
      
    }else{
      conditionString = `${formData.selectOption} = '${formData.optionDetails}'`
     
    }
    const sql = `WITH DataCTE AS (
      SELECT
          STN_code,
          Gear,
          Gear_ID,
          DATE_FORMAT(Date_of_inspection, '%Y-%m-%d') AS Date_of_inspection,
          GROUP_CONCAT(SR_NO ORDER BY SR_NO) AS SR_NO,
          GROUP_CONCAT(Complaince) AS Complaince,
          GROUP_CONCAT(DEFI_NUM) AS DEFI_NUM,
          GROUP_CONCAT(DEFICIENCIES) AS DEFICIENCIES,
          GROUP_CONCAT(Acknowledgement) AS Acknowledgement,
          GROUP_CONCAT(Action_Taken) AS Action_Taken,
          GROUP_CONCAT(Acknowledge_Review) AS Acknowledge_Review
      FROM
          data_table
      WHERE
          ${conditionString} AND Complaince = 'YES'
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
      CONCAT('[', Complaince, ']') AS Complaince,
      CONCAT('[', DEFI_NUM, ']') AS DEFI_NUM,
      CONCAT('[', DEFICIENCIES, ']') AS DEFICIENCIES,
      CONCAT('[', Acknowledgement, ']') AS Acknowledgement,
      CONCAT('[', Action_Taken, ']') AS Action_Taken,
      CONCAT('[', Acknowledge_Review, ']') AS Acknowledge_Review
  FROM
      DataCTE;
  `    
    connection.query(sql, (error, result) => {
       if (error) {
         reject(error);
       } else {
          console.log(result);
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
        Acknowledge_Review = '${updatedHistory}'
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

exports.analysisDataChart = function(formData) {
  return new Promise((resolve, reject) => { 
    let conditionString = `${formData.selectOption} = '${formData.optionDetails}'`;

  //   const sql = `SELECT
  //   (SELECT COUNT(*) FROM data_table WHERE ${conditionString}  AND Complaince = 'YES' AND Acknowledgement = 'Satisfied') AS Complied,
  //   (SELECT COUNT(*) FROM data_table WHERE  ${conditionString} AND Complaince = 'YES' AND Acknowledgement = 'Pending') AS Under_Acknowledgement,
  //   (SELECT COUNT(*) FROM data_table WHERE  ${conditionString} AND Complaince = 'NO') AS Not_Complied,
  //   (SELECT COUNT(*) FROM data_table WHERE ${conditionString}  ) AS TOTAL;
  // `    
    const sql =`SELECT
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
          console.log(result);
          resolve(result)
        }
  });
});
};



exports.dashboardDataTable = function(stationName,gear) {
  return new Promise(async (resolve, reject) => {
    try {
      const stationValue = `${stationName}`
      const gearValue = `${gear}`
      // Step 1: Fetch distinct SR_DEN values
      const distinctSRDENQuery = `
        SELECT DISTINCT SR_DEN
        FROM main_sheet;
      `;

      connection.query(distinctSRDENQuery, async (error, srDenResults) => {
        if (error) {
          console.error('Error:', error);
          return reject(error);
        }

        // Create an object to store the final result
        const finalResult = {};
        
         let SR_DEN= srDenResults.map((row) => row.SR_DEN);
         finalResult['srDenResults'] = SR_DEN.sort();

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
              WHERE STN_CODE = '${stationValue}'
                AND GEAR = '${gearValue}'
                AND SR_DEN = ?
              GROUP BY GEAR_ID
            ) last_entry_dates
            JOIN data_table ON last_entry_dates.GEAR_ID = data_table.GEAR_ID AND last_entry_dates.LAST_ENTRY_DATE = data_table.date_of_inspection
            GROUP BY DEFICIENCIES
            HAVING DEFICIENCIES != 'NIL'
            ORDER BY DEFICIENCIES;
          `;

          connection.query(query, [srDenValue], (error, queryResults) => {
            if (error) {
              console.error('Error:', error);
              return reject(error);
            }

            // Store the data in the final result
            const resultForSRDen = queryResults.map((row) => {
              return {
                DEFICIENCY: row.DEFICIENCY,
                TOTAL_DEFICIENCY_COUNT: row.TOTAL_DEFICIENCY_COUNT,
              };
            });

            finalResult[srDenValue] = resultForSRDen;
          });
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
            WHERE STN_CODE = '${stationValue}'
            AND GEAR = '${gearValue}'
          GROUP BY GEAR_ID
          ) last_entry_dates
          JOIN data_table ON last_entry_dates.GEAR_ID = data_table.GEAR_ID AND last_entry_dates.LAST_ENTRY_DATE = data_table.date_of_inspection
          GROUP BY DEFICIENCIES
          HAVING DEFICIENCIES != 'NIL'
          ORDER BY DEFICIENCIES;
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
              TOTAL_DEFICIENCY_COUNT: row.TOTAL_DEFICIENCY_COUNT,
            };
          });
          console.log(finalResult);
          resolve(finalResult);
        });
      });
    } catch (error) {
      console.error('Error:', error);
      reject(error);
    }
  });
};


exports.hyperLinkData = function (stationName, gear, columnName,defi) {
  return new Promise(async (resolve, reject) => {
    try {
      const stationValue = `${stationName}`;
      const gearValue = `${gear}`;
      const columnNameValue = `${columnName}`;
      const defiValue = `${defi}`;
      console.log(stationValue,gearValue,columnNameValue,defiValue)
      const condition =
        columnName === 'DLI DIVISION'
          ? `STN_CODE = '${stationValue}' AND GEAR = '${gearValue}'`
          : `STN_CODE = '${stationValue}' AND GEAR = '${gearValue}'  AND SR_DEN = '${columnNameValue}'`;

      console.log(condition);

      // Step 1: Fetch distinct SR_DEN values
      const distinctSRDENQuery = `
      SELECT
        DEFICIENCIES AS DEFICIENCY,
        DATE_FORMAT(MAX(data_table.date_of_inspection), '%Y-%m-%d') AS MAX_INSPECTION_DATE,
        SUM(CASE WHEN DEFICIENCIES != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
      FROM (
        SELECT
          GEAR_ID,
          MAX(date_of_inspection) AS LAST_ENTRY_DATE
        FROM data_table
        WHERE ${condition}

        GROUP BY GEAR_ID
      ) last_entry_dates
      JOIN data_table ON last_entry_dates.GEAR_ID = data_table.GEAR_ID AND last_entry_dates.LAST_ENTRY_DATE = data_table.date_of_inspection
      GROUP BY DEFICIENCIES
      HAVING DEFICIENCIES != 'NIL'
      ORDER BY DEFICIENCIES;
      `;


      connection.query(distinctSRDENQuery, async (error, srDenResults) => {
        if (error) {
          console.error('Error:', error);
          return reject(error);
        } else {
          console.log(srDenResults);
          console.log(srDenResults.length);
          
          const firstRowDate = srDenResults[0].MAX_INSPECTION_DATE; // Access MAX_INSPECTION_DATE from the result
          // Step 2: Fetch data based on the firstRowDate
          const complianceQuery = `
            SELECT STN_CODE, GEAR, GEAR_ID, SR_DEN, DATE_FORMAT(Date_of_inspection, '%Y-%m-%d')AS Date_of_inspection , DEFICIENCIES
            FROM data_table where ${condition} and Date_of_inspection = '${firstRowDate}' and DEFICIENCIES = '${defiValue}';
          `;

          connection.query(complianceQuery, async (error, complianceResults) => {
            if (error) {
              console.error('Error:', error);
              return reject(error);
            } else {
              console.log(complianceResults.length);
              console.log(complianceResults);
              resolve(complianceResults);
            }
          });
        }
      });
    } catch (error) {
      console.error('Error:', error);
      reject(error);
    }
  });
};


// exports.hyperLinkData = function(stationName,gear,columnName) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const stationValue = `${stationName}`
//       const gearValue = `${gear}`
//       const columnNameValue = `${columnName}`
//       const condition  =  columnName === 'DLI DIVISION' ? `STN_CODE = '${stationValue}' AND GEAR = '${gearValue}'`: `STN_CODE = '${stationValue}' AND GEAR = '${gearValue}'  AND SR_DEN = '${columnNameValue}'`
      
//       // Step 1: Fetch distinct SR_DEN values
//       const distinctSRDENQuery = `
//       SELECT
//       DEFICIENCIES AS DEFICIENCY,
//       MAX(data_table.date_of_inspection) AS MAX_INSPECTION_DATE,
//       SUM(CASE WHEN DEFICIENCIES != 'NIL' THEN 1 ELSE 0 END) AS TOTAL_DEFICIENCY_COUNT
//     FROM (
//       SELECT
//         GEAR_ID,
//         MAX(date_of_inspection) AS LAST_ENTRY_DATE
//       FROM data_table
//       WHERE ${condition}
//       GROUP BY GEAR_ID
//     ) last_entry_dates
//     JOIN data_table ON last_entry_dates.GEAR_ID = data_table.GEAR_ID AND last_entry_dates.LAST_ENTRY_DATE = data_table.date_of_inspection
//     GROUP BY DEFICIENCIES
//     HAVING DEFICIENCIES != 'NIL'
//     ORDER BY DEFICIENCIES;    
//       `;

//       connection.query(distinctSRDENQuery, async (error, srDenResults) => {
//         if (error) {
//           console.error('Error:', error);
//           return reject(error);
//         }
//         else{
//           const firstRowDate = srDenResults[0].date_of_inspection; 
//         }
//     })

//     const complainceQuery = `
//         SELECT STN_CODE, STN_NAME,GEAR,GEAR_ID,SR_DSTE,Date_of_inspection,DEFICIENCIES
//         FROM data_table where ${condition} and Date_of_inspection =${firstRowDate};
//       `;

//     connection.query(complainceQuery, async (error, complainceResults) => {
//         if (error) {
//           console.error('Error:', error);
//           return reject(error);
//         }
//       });

//       resolve(complainceResults);

//     } catch (error) {
//       console.error('Error:', error);
//       reject(error);
//     }
//   });
// };