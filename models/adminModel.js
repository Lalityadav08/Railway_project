const mysql = require('mysql2');
const bcrypt = require('bcrypt');


const connection = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'Devansh@2010',
    database: 'point_crossing'
  });


exports.fetchUser = (option,optionDetails) => {
    return new Promise((resolve, reject) => {
      const query =  `SELECT * FROM users`;
      //connection.query(query, dataWithDeficiency, (err, results)
      connection.query(query,(error, results) => {
        if (error) {
          reject(error);
        } else {
        //   const dataValue = results.map(result => result.Point);
          console.log('result check')
          console.log(results);
          resolve(results);
        }
      });
    });
};

exports.updateUser = (userId, name, email, plainPassword, preferences) => {
    return new Promise((resolve, reject) => {
        console.log(userId);
        // Hash the plain password
        bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
            if (err) {
                reject(err);
            } else {
                const query = `UPDATE users SET username=?, email=?, password=?, hashedPassword=?, preferences=? WHERE ID=?`;

                connection.query(query, [name, email, plainPassword, hashedPassword, preferences, userId], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        const fetchQuery = `SELECT * FROM users`;
                        connection.query(fetchQuery, (fetchError, fetchResults) => {
                            if (fetchError) {
                                reject(fetchError);
                            } else {
                                console.log(fetchResults)
                                resolve(fetchResults);
                            }
                        });
                    }
                });
            }
        });
    });
};

exports.deleteUser = (serialNo) => {
    return new Promise((resolve, reject) => {
        const deleteQuery = `DELETE FROM users WHERE ID = ?`;
        connection.query(deleteQuery, [serialNo], (error, deleteResults) => {
            if (error) {
                reject(error);
            } else {
                const fetchQuery = `SELECT * FROM users`;
                connection.query(fetchQuery, (fetchError, fetchResults) => {
                    if (fetchError) {
                        reject(fetchError);
                    } else {
                        resolve(fetchResults);
                    }
                });
            }
        });
    });
};

exports.fetchData = (option,optionDetails) => {
    return new Promise((resolve, reject) => {
      const query =  `SELECT * FROM deficiencies_list`;
      connection.query(query,(error, results) => {
        if (error) {
          reject(error);
        } else {
          console.log('result check')
          console.log(results);
          resolve(results);
        }
      });
    });
};

exports.priorityUpdate = (option,optionDetails) => {
    return new Promise((resolve, reject) => {
      const query =  `SELECT * FROM prioritizePointDeficiencies`;
      connection.query(query,(error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
};

exports.trackUpdate = (option,optionDetails) => {
    return new Promise((resolve, reject) => {
      const query =  `SELECT * FROM prioritizeTrackDeficiencies`;
      connection.query(query,(error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
};


exports.updatePointPriorityDeficiencies = (id, newPriority) => {
    return new Promise((resolve, reject) => {
        connection.getConnection((err, conn) => {
            if (err) return reject(err);

            // Start a transaction
            conn.beginTransaction(err => {
                if (err) {
                    conn.release();
                    return reject(err);
                }

                const getCurrentPriorityQuery = `SELECT priority FROM prioritizePointDeficiencies WHERE id = ?`;
                conn.query(getCurrentPriorityQuery, [id], (error, results) => {
                    if (error) {
                        return conn.rollback(() => {
                            conn.release();
                            reject(error);
                        });
                    }

                    const currentPriority = results[0].priority;

                    let updateOtherPrioritiesQuery;
                    if (newPriority < currentPriority) {
                        updateOtherPrioritiesQuery = `
                            UPDATE prioritizePointDeficiencies 
                            SET priority = priority + 1 
                            WHERE priority >= ? AND priority < ?`;
                    } else if (newPriority > currentPriority) {
                        updateOtherPrioritiesQuery = `
                            UPDATE prioritizePointDeficiencies 
                            SET priority = priority - 1 
                            WHERE priority <= ? AND priority > ?`;
                    }

                    conn.query(updateOtherPrioritiesQuery, [newPriority, currentPriority], (updateError, updateResults) => {
                        if (updateError) {
                            return conn.rollback(() => {
                                conn.release();
                                reject(updateError);
                            });
                        }

                        const updateSelectedDeficiencyQuery = `UPDATE prioritizePointDeficiencies SET priority = ? WHERE id = ?`;
                        conn.query(updateSelectedDeficiencyQuery, [newPriority, id], (updateSelectedError, updateSelectedResults) => {
                            if (updateSelectedError) {
                                return conn.rollback(() => {
                                    conn.release();
                                    reject(updateSelectedError);
                                });
                            }

                            conn.commit(commitError => {
                                if (commitError) {
                                    return conn.rollback(() => {
                                        conn.release();
                                        reject(commitError);
                                    });
                                }

                                const fetchQuery = `SELECT * FROM prioritizePointDeficiencies ORDER BY priority ASC`;
                                conn.query(fetchQuery, (fetchError, fetchResults) => {
                                    conn.release();
                                    if (fetchError) {
                                        reject(fetchError);
                                    } else {
                                        resolve(fetchResults);
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

exports.updateTrackPriorityDeficiencies = (id, newPriority) => {
    return new Promise((resolve, reject) => {
        connection.getConnection((err, conn) => {
            if (err) return reject(err);

            // Start a transaction
            conn.beginTransaction(err => {
                if (err) {
                    conn.release();
                    return reject(err);
                }

                const getCurrentPriorityQuery = `SELECT priority FROM prioritizeTrackDeficiencies WHERE id = ?`;
                conn.query(getCurrentPriorityQuery, [id], (error, results) => {
                    if (error) {
                        return conn.rollback(() => {
                            conn.release();
                            reject(error);
                        });
                    }

                    const currentPriority = results[0].priority;

                    let updateOtherPrioritiesQuery;
                    if (newPriority < currentPriority) {
                        updateOtherPrioritiesQuery = `
                            UPDATE prioritizeTrackDeficiencies 
                            SET priority = priority + 1 
                            WHERE priority >= ? AND priority < ?`;
                    } else if (newPriority > currentPriority) {
                        updateOtherPrioritiesQuery = `
                            UPDATE prioritizeTrackDeficiencies 
                            SET priority = priority - 1 
                            WHERE priority <= ? AND priority > ?`;
                    }

                    conn.query(updateOtherPrioritiesQuery, [newPriority, currentPriority], (updateError, updateResults) => {
                        if (updateError) {
                            return conn.rollback(() => {
                                conn.release();
                                reject(updateError);
                            });
                        }

                        const updateSelectedDeficiencyQuery = `UPDATE prioritizeTrackDeficiencies SET priority = ? WHERE id = ?`;
                        conn.query(updateSelectedDeficiencyQuery, [newPriority, id], (updateSelectedError, updateSelectedResults) => {
                            if (updateSelectedError) {
                                return conn.rollback(() => {
                                    conn.release();
                                    reject(updateSelectedError);
                                });
                            }

                            conn.commit(commitError => {
                                if (commitError) {
                                    return conn.rollback(() => {
                                        conn.release();
                                        reject(commitError);
                                    });
                                }

                                const fetchQuery = `SELECT * FROM prioritizeTrackDeficiencies ORDER BY priority ASC`;
                                conn.query(fetchQuery, (fetchError, fetchResults) => {
                                    conn.release();
                                    if (fetchError) {
                                        reject(fetchError);
                                    } else {
                                        resolve(fetchResults);
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};


exports.updateDeficiency = (newValue, serialNo) => {
    return new Promise((resolve, reject) => {
        // Update in deficiencies_list table
        const updateQuery = `UPDATE deficiencies_list SET Point = ? WHERE SR_NO = ?`;
        connection.query(updateQuery, [newValue, serialNo], (error, updateResults) => {
            if (error) {
                reject(error);
            } else {
                // Update in prioritizePointDeficiencies table
                const updatePrioritizeQuery = `UPDATE prioritizePointDeficiencies SET deficiency = ? WHERE sr_no = ?`;
                connection.query(updatePrioritizeQuery, [newValue, serialNo], (prioritizeError, prioritizeResults) => {
                    if (prioritizeError) {
                        reject(prioritizeError);
                    } else {
                        // Fetch updated data from deficiencies_list table
                        const fetchQuery = `SELECT * FROM deficiencies_list`;
                        connection.query(fetchQuery, (fetchError, fetchResults) => {
                            if (fetchError) {
                                reject(fetchError);
                            } else {
                                resolve(fetchResults);
                            }
                        });
                    }
                });
            }
        });
    });
};




exports.addNewPriorityPointDeficiency = (deficiency, serialNo) => {
    return new Promise((resolve, reject) => {
        // Fetch the highest current priority
        const fetchHighestPriorityQuery = `SELECT MAX(priority) AS maxPriority FROM prioritizePointDeficiencies`;
        connection.query(fetchHighestPriorityQuery, (fetchError, fetchResults) => {
            if (fetchError) {
                reject(fetchError);
            } else {
                const maxPriority = fetchResults[0].maxPriority || 0;
                const newPriority = maxPriority + 1;

                // Insert the new deficiency with the calculated priority
                const insertQuery = `INSERT INTO prioritizePointDeficiencies (sr_no, deficiency, priority) VALUES (?, ?, ?)`;
                connection.query(insertQuery, [serialNo, deficiency, newPriority], (insertError, insertResults) => {
                    if (insertError) {
                        reject(insertError);
                    } else {
                        // Fetch all records after the insert
                        const fetchQuery = `SELECT * FROM deficiencies_list`;
                        connection.query(fetchQuery, (fetchAllError, fetchAllResults) => {
                            if (fetchAllError) {
                                reject(fetchAllError);
                            } else {
                                resolve(fetchAllResults);
                            }
                        });
                    }
                });
            }
        });
    });
};





exports.deficiencyTrack = (option,optionDetails) => {
    return new Promise((resolve, reject) => {
      const query =  `SELECT * FROM deficiencies_list_Track`;
      connection.query(query,(error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
};

// exports.updateDeficiencyTrack = (newValue, serialNo) => {
//     return new Promise((resolve, reject) => {
//         const updateQuery = `UPDATE deficiencies_list_Track SET Track_circuit = ? WHERE SR_NO = ?`;
//         connection.query(updateQuery, [newValue, serialNo], (error, updateResults) => {
//             if (error) {
//                 reject(error);
//             } else {
//                 const fetchQuery = `SELECT * FROM deficiencies_list_Track`;
//                 connection.query(fetchQuery, (fetchError, fetchResults) => {
//                     if (fetchError) {
//                         reject(fetchError);
//                     } else {
//                         console.log(fetchResults)
//                         resolve(fetchResults);
//                     }
//                 });
//             }
//         });
//     });
// };

exports.updateDeficiencyTrack = (newValue, serialNo) => {
    return new Promise((resolve, reject) => {
        // Update in deficiencies_list_Track table
        const updateQuery = `UPDATE deficiencies_list_Track SET Track_circuit = ? WHERE SR_NO = ?`;
        connection.query(updateQuery, [newValue, serialNo], (error, updateResults) => {
            if (error) {
                reject(error);
            } else {
                // Update in prioritizeTrackDeficiencies table
                const updatePrioritizeQuery = `UPDATE prioritizeTrackDeficiencies SET deficiency = ? WHERE sr_no = ?`;
                connection.query(updatePrioritizeQuery, [newValue, serialNo], (prioritizeError, prioritizeResults) => {
                    if (prioritizeError) {
                        reject(prioritizeError);
                    } else {
                        // Fetch updated data from deficiencies_list_Track table
                        const fetchQuery = `SELECT * FROM deficiencies_list_Track`;
                        connection.query(fetchQuery, (fetchError, fetchResults) => {
                            if (fetchError) {
                                reject(fetchError);
                            } else {
                                resolve(fetchResults);
                            }
                        });
                    }
                });
            }
        });
    });
};


exports.addNewPriorityTrackDeficiency = (deficiency, serialNo) => {
    return new Promise((resolve, reject) => {
        // Fetch the highest current priority
        const fetchHighestPriorityQuery = `SELECT MAX(priority) AS maxPriority FROM prioritizeTrackDeficiencies`;
        connection.query(fetchHighestPriorityQuery, (fetchError, fetchResults) => {
            if (fetchError) {
                reject(fetchError);
            } else {
                const maxPriority = fetchResults[0].maxPriority || 0;
                const newPriority = maxPriority + 1;

                // Insert the new deficiency with the calculated priority
                const insertQuery = `INSERT INTO prioritizeTrackDeficiencies (sr_no, deficiency, priority) VALUES (?, ?, ?)`;
                connection.query(insertQuery, [serialNo, deficiency, newPriority], (insertError, insertResults) => {
                    if (insertError) {
                        reject(insertError);
                    } else {
                        // Fetch all records after the insert
                        const fetchQuery = `SELECT * FROM deficiencies_list_Track`;
                        connection.query(fetchQuery, (fetchAllError, fetchAllResults) => {
                            if (fetchAllError) {
                                reject(fetchAllError);
                            } else {
                                resolve(fetchAllResults);
                            }
                        });
                    }
                });
            }
        });
    });
};


// exports.deleteDeficiency = (serialNo) => {
//     return new Promise((resolve, reject) => {
//         const deleteQuery = `DELETE FROM deficiencies_list WHERE SR_NO = ?`;
//         connection.query(deleteQuery, [serialNo], (error, deleteResults) => {
//             if (error) {
//                 reject(error);
//             } else {
//                 const fetchQuery = `SELECT * FROM deficiencies_list`;
//                 connection.query(fetchQuery, (fetchError, fetchResults) => {
//                     if (fetchError) {
//                         reject(fetchError);
//                     } else {
//                         resolve(fetchResults);
//                     }
//                 });
//             }
//         });
//     });
// };

exports.deleteDeficiency = (serialNo) => {
    return new Promise((resolve, reject) => {
        // Delete from deficiencies_list table
        const deleteQuery = `DELETE FROM deficiencies_list WHERE SR_NO = ?`;
        connection.query(deleteQuery, [serialNo], (error, deleteResults) => {
            if (error) {
                reject(error);
            } else {
                // Delete from prioritizePointDeficiencies table
                const deletePrioritizeQuery = `DELETE FROM prioritizePointDeficiencies WHERE sr_no = ?`;
                connection.query(deletePrioritizeQuery, [serialNo], (prioritizeError, prioritizeResults) => {
                    if (prioritizeError) {
                        reject(prioritizeError);
                    } else {
                        // Fetch updated data from deficiencies_list table
                        const fetchQuery = `SELECT * FROM deficiencies_list`;
                        connection.query(fetchQuery, (fetchError, fetchResults) => {
                            if (fetchError) {
                                reject(fetchError);
                            } else {
                                resolve(fetchResults);
                            }
                        });
                    }
                });
            }
        });
    });
};

exports.deleteDeficiencyTrack = (serialNo) => {
    return new Promise((resolve, reject) => {
        // Delete from deficiencies_list_Track table
        const deleteQuery = `DELETE FROM deficiencies_list_Track WHERE SR_NO = ?`;
        connection.query(deleteQuery, [serialNo], (error, deleteResults) => {
            if (error) {
                reject(error);
            } else {
                // Delete from prioritizeTrackDeficiencies table
                const deletePrioritizeQuery = `DELETE FROM prioritizeTrackDeficiencies WHERE sr_no = ?`;
                connection.query(deletePrioritizeQuery, [serialNo], (prioritizeError, prioritizeResults) => {
                    if (prioritizeError) {
                        reject(prioritizeError);
                    } else {
                        // Fetch updated data from deficiencies_list_Track table
                        const fetchQuery = `SELECT * FROM deficiencies_list_Track`;
                        connection.query(fetchQuery, (fetchError, fetchResults) => {
                            if (fetchError) {
                                reject(fetchError);
                            } else {
                                resolve(fetchResults);
                            }
                        });
                    }
                });
            }
        });
    });
};

// exports.deleteDeficiencyTrack = (serialNo) => {
//     return new Promise((resolve, reject) => {
//         const deleteQuery = `DELETE FROM deficiencies_list_Track WHERE SR_NO = ?`;
//         connection.query(deleteQuery, [serialNo], (error, deleteResults) => {
//             if (error) {
//                 reject(error);
//             } else {
//                 const fetchQuery = `SELECT * FROM deficiencies_list_Track`;
//                 connection.query(fetchQuery, (fetchError, fetchResults) => {
//                     if (fetchError) {
//                         reject(fetchError);
//                     } else {
//                         resolve(fetchResults);
//                     }
//                 });
//             }
//         });
//     });
// };


exports.fetchZone = (option,optionDetails) => {
    return new Promise((resolve, reject) => {
      const query =  `SELECT * FROM zone`;
      connection.query(query,(error, results) => {
        if (error) {
          reject(error);
        } else {
          console.log('result check')
          console.log(results);
          resolve(results);
        }
      });
    });
};

exports.updateZone = (newValue, serialNo, operationType) => {
    return new Promise((resolve, reject) => {
        console.log(operationType);
        let updateQuery;
        if (operationType == "add"){
            updateQuery = `INSERT INTO zone (ZONE) VALUES ('${newValue}')`;
        }
        else {
            updateQuery = `UPDATE zone SET ZONE = '${newValue}' WHERE SR_NO = ${serialNo}`;
        }
        connection.query(updateQuery, (error, updateResults) => {
            if (error) {
                reject(error);
            } else {
                const fetchQuery = `SELECT * FROM zone`;
                connection.query(fetchQuery, (fetchError, fetchResults) => {
                    if (fetchError) {
                        reject(fetchError);
                    } else {
                        console.log(fetchResults)
                        resolve(fetchResults);
                    }
                });
            }
        });
    });
};

exports.deleteZone = (serialNo) => {
    return new Promise((resolve, reject) => {
        const deleteQuery = `DELETE FROM zone WHERE SR_NO = ?`;
        connection.query(deleteQuery, [serialNo], (error, deleteResults) => {
            if (error) {
                reject(error);
            } else {
                const fetchQuery = `SELECT * FROM zone`;
                connection.query(fetchQuery, (fetchError, fetchResults) => {
                    if (fetchError) {
                        reject(fetchError);
                    } else {
                        resolve(fetchResults);
                    }
                });
            }
        });
    });
};


exports.fetchGearType = (option,optionDetails) => {
    return new Promise((resolve, reject) => {
      const query =  `SELECT * FROM gear_type`;
      connection.query(query,(error, results) => {
        if (error) {
          reject(error);
        } else {
          console.log('result check')
          console.log(results);
          resolve(results);
        }
      });
    });
};

exports.updateGearType = (newValue, serialNo) => {
    return new Promise((resolve, reject) => {
        const updateQuery = `UPDATE gear_type SET GEAR_TYPE = ? WHERE SR_NO = ?`;
        connection.query(updateQuery, [newValue, serialNo], (error, updateResults) => {
            if (error) {
                reject(error);
            } else {
                const fetchQuery = `SELECT * FROM gear_type`;
                connection.query(fetchQuery, (fetchError, fetchResults) => {
                    if (fetchError) {
                        reject(fetchError);
                    } else {
                        console.log(fetchResults)
                        resolve(fetchResults);
                    }
                });
            }
        });
    });
};

exports.deleteGearType = (serialNo) => {
    return new Promise((resolve, reject) => {
        const deleteQuery = `DELETE FROM gear_type WHERE SR_NO = ?`;
        connection.query(deleteQuery, [serialNo], (error, deleteResults) => {
            if (error) {
                reject(error);
            } else {
                const fetchQuery = `SELECT * FROM gear_type`;
                connection.query(fetchQuery, (fetchError, fetchResults) => {
                    if (fetchError) {
                        reject(fetchError);
                    } else {
                        resolve(fetchResults);
                    }
                });
            }
        });
    });
};


exports.fetchGearTypePoint = (option,optionDetails) => {
    return new Promise((resolve, reject) => {
      const query =  `SELECT * FROM gear_type_point`;
      connection.query(query,(error, results) => {
        if (error) {
          reject(error);
        } else {
          console.log('result check')
          console.log(results);
          resolve(results);
        }
      });
    });
};

exports.updateGearTypePoint = (newValue, serialNo) => {
    return new Promise((resolve, reject) => {
        const updateQuery = `UPDATE gear_type_point SET point_type = ? WHERE SR_NO = ?`;
        connection.query(updateQuery, [newValue, serialNo], (error, updateResults) => {
            if (error) {
                reject(error);
            } else {
                const fetchQuery = `SELECT * FROM gear_type_point`;
                connection.query(fetchQuery, (fetchError, fetchResults) => {
                    if (fetchError) {
                        reject(fetchError);
                    } else {
                        console.log(fetchResults)
                        resolve(fetchResults);
                    }
                });
            }
        });
    });
};

exports.deleteGearTypePoint = (serialNo) => {
    return new Promise((resolve, reject) => {
        const deleteQuery = `DELETE FROM gear_type_point WHERE SR_NO = ?`;
        connection.query(deleteQuery, [serialNo], (error, deleteResults) => {
            if (error) {
                reject(error);
            } else {
                const fetchQuery = `SELECT * FROM gear_type_point`;
                connection.query(fetchQuery, (fetchError, fetchResults) => {
                    if (fetchError) {
                        reject(fetchError);
                    } else {
                        resolve(fetchResults);
                    }
                });
            }
        });
    });
};


exports.fetchGearTypeTrackCircuit = (option,optionDetails) => {
    return new Promise((resolve, reject) => {
      const query =  `SELECT * FROM gear_type_track_circuit`;
      connection.query(query,(error, results) => {
        if (error) {
          reject(error);
        } else {
          console.log('result check')
          console.log(results);
          resolve(results);
        }
      });
    });
};

exports.updateGearTypeTrackCircuit = (newValue, serialNo) => {
    return new Promise((resolve, reject) => {
        const updateQuery = `UPDATE gear_type_track_circuit SET track_circuit_type = ? WHERE SR_NO = ?`;
        connection.query(updateQuery, [newValue, serialNo], (error, updateResults) => {
            if (error) {
                console.log(error);
                reject(error);

            } else {
                const fetchQuery = `SELECT * FROM gear_type_track_circuit`;
                connection.query(fetchQuery, (fetchError, fetchResults) => {
                    if (fetchError) {
                        reject(fetchError);
                    } else {
                        console.log(fetchResults)
                        resolve(fetchResults);
                    }
                });
            }
        });
    });
};

exports.deleteGearTypeTrackCircuit = (serialNo) => {
    return new Promise((resolve, reject) => {
        const deleteQuery = `DELETE FROM gear_type_track_circuit WHERE SR_NO = ?`;
        connection.query(deleteQuery, [serialNo], (error, deleteResults) => {
            if (error) {
                reject(error);
            } else {
                const fetchQuery = `SELECT * FROM gear_type_track_circuit`;
                connection.query(fetchQuery, (fetchError, fetchResults) => {
                    if (fetchError) {
                        reject(fetchError);
                    } else {
                        resolve(fetchResults);
                    }
                });
            }
        });
    });
};

exports.fetchGear = (option,optionDetails) => {
    return new Promise((resolve, reject) => {
      const query =  `SELECT * FROM gear_wise`;
      connection.query(query,(error, results) => {
        if (error) {
          reject(error);
        } else {
          console.log('result check')
          console.log(results);
          resolve(results);
        }
      });
    });
};

exports.fetchStationDetailsByCode = (stnCode) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM main_sheet WHERE stn_code = ?'; 
        connection.query(query, [stnCode], (error, results) => {
            if (error) {
                reject(error);
            } else {
                console.log('Station details fetched:', results);
                resolve(results[0]); 
            }
        });
    });
};

exports.updateStationDetails = (data) => {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE main_sheet
            SET 
                STN_Name = ?, 
                Section = ?, 
                Route = ?, 
                SI = ?, 
                CSI = ?, 
                ADSTE = ?, 
                Sr_DSTE = ?, 
                PWI = ?, 
                CPWI = ?, 
                AEN = ?, 
                Sr_DEN = ?
            WHERE STN_Code = ?`;

        const values = [
            data.stationName,
            data.section,
            data.route,
            data.si,
            data.csi,
            data.adste,
            data.srDste,
            data.pwi,
            data.cpwi,
            data.aen,
            data.srDen,
            data.stnCode
        ];

        connection.query(query, values, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

exports.updateGear = (newStnCode, newGearType, newGearID, newZone, newType, newLine, serialNo) => {
    return new Promise((resolve, reject) => {
        const updateQuery = `UPDATE gear_wise SET Stn_Code = ?, Gear_type = ?, Gear_ID = ?, Zone = ?, Type = ?, Line = ? WHERE SR_NO = ?`;
        connection.query(updateQuery, [newStnCode, newGearType, newGearID, newZone, newType, newLine, serialNo], (error, updateResults) => {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                const fetchQuery = `SELECT * FROM gear_wise`;
                connection.query(fetchQuery, (fetchError, fetchResults) => {
                    if (fetchError) {
                        reject(fetchError);
                    } else {
                        console.log(fetchResults)
                        resolve(fetchResults);
                    }
                });
            }
        });
    });
};

exports.deleteGear = (serialNo) => {
    return new Promise((resolve, reject) => {
        const deleteQuery = `DELETE FROM gear_wise WHERE SR_NO = ?`;
        connection.query(deleteQuery, [serialNo], (error, deleteResults) => {
            if (error) {
                reject(error);
            } else {
                const fetchQuery = `SELECT * FROM gear_wise`;
                connection.query(fetchQuery, (fetchError, fetchResults) => {
                    if (fetchError) {
                        reject(fetchError);
                    } else {
                        resolve(fetchResults);
                    }
                });
            }
        });
    });
};

