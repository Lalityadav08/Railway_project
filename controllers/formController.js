const formModel = require('../models/formModel');

// const express = require('express');
// const multer = require('multer');
// const app = express();
// app.use(multer({dest:'imageInput'}).single('imageInput'))

//entry-From display function
exports.displayForm = (req, res) => {
  Promise.all([
    formModel.fetchStationNames(),
    formModel.fetchGearTypePoint(),
    formModel.fetchGearTypeTrackCircuit()
  ])
    .then(([stationNames, pointTypes, trackCircuitTypes]) => {

      //console.l
      console.log("data for point in", pointTypes)
      res.render('try1', { stationNames, pointTypes, trackCircuitTypes, req });
    })
    .catch(error => {
      console.error('Error fetching Station Names:', error);
      res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
    });
};



// exports.displayStationGearWiseForm = (req, res) => {
//   formModel.fetchStationNames()
//     .then(stationNames => {
//       console.log(stationNames)
//       res.render('stationGearForm', { stationNames,req });
//     })
//     .catch(error => {
//       console.error('Error fetching Station Names:', error);
//       res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
//     });
// };

exports.displayStationGearWiseForm = (req, res) => {
  // Execute all promises concurrently
  Promise.all([
    formModel.fetchStationNames(),
    formModel.fetchZoneForGearForm(),
    formModel.fetchGearType(),
    formModel.fetchGearTypePoint(),
    formModel.fetchGearTypeTrackCircuit()
  ])
    .then(([stationNames, zones, gearTypes, pointTypes, trackCircuitTypes]) => {
      console.log(stationNames, zones, gearTypes, pointTypes, trackCircuitTypes);
      res.render('stationGearForm', { stationNames, zones, gearTypes, pointTypes, trackCircuitTypes, req });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'An error occurred while fetching data.' });
    });
};



exports.fetchStationName = (req, res) => {
  const { option, optionDetails } = req.params

  formModel.fetchStationNames(option, optionDetails)
    .then(stationNames => {
      res.json(stationNames);
    })
    .catch(error => {
      console.error('Error fetching Station Names:', error);
      res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
    });
};


exports.fetchOptionName = (req, res) => {
  const { option } = req.params

  formModel.fetchSelectedOptions(option)
    .then(optionNames => {
      res.json(optionNames);
    })
    .catch(error => {
      console.error('Error fetching Station Names:', error);
      res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
    });
};

exports.complianceEntry = (req, res) => {
  formModel.fetchStationNames()
    .then(stationNames => {
      res.render('update', { stationNames, req });
    })
    .catch(error => {
      console.error('Error fetching Station Names:', error);
      res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
    });
};

exports.acknowledgeDetails = (req, res) => {
  formModel.fetchStationNames()
    .then(stationNames => {
      res.render('acknowledge', { stationNames, req });
    })
    .catch(error => {
      console.error('Error fetching Station Names:', error);
      res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
    });
};


exports.fetchGears = (req, res) => {
  const { stationName } = req.params;
  console.log(stationName);
  formModel.fetchGearsByStation(stationName)
    .then(gears => {
      console.log(gears);
      res.json(gears);
    })
    .catch(error => {
      console.error('Error fetching Gear options:', error);
      res.status(500).json({ error: 'An error occurred while fetching Gear options.' });
    });
};


exports.fetchZone = (req, res) => {
  const { stationName, gearName } = req.params;
  formModel.fetchZone(stationName, gearName)
    .then(Zone => {
      res.json(Zone);
    })
    .catch(error => {
      console.error('Error fetching zone options:', error);
      res.status(500).json({ error: 'An error occurred while fetching zone options.' });
    });
};


exports.fetchGearIDs = (req, res) => {
  const { stationName, gear, Zone, Type, date } = req.body;
  console.log("date == >", date);
  formModel.fetchGearIDsByStationAndGear(stationName, gear, Zone, Type, date)
    .then(({ gearIDs, responseData }) => {
      console.log("gearID ==>", gearIDs);
      res.json({ gearIDs, responseData });
    })

    .catch(error => {
      console.error('Error fetching GearID options:', error);
      res.status(500).json({ error: 'An error occurred while fetching GearID options.' });
    });
};

exports.fetchDeficiencies = (req, res) => {
  const { gear } = req.params;
  formModel.fetchDeficiencesByGear(gear)
    .then(gear => {
      res.json(gear);
    })
    .catch(error => {
      console.error('Error fetching Gear options:', error);
      res.status(500).json({ error: 'An error occurred while fetching Gear options.' });
    });
};

exports.fetchLastDateDetails = (req, res) => {
  const { stationName, gear, Type, Zone } = req.params;
  console.log(req.params);
  formModel.fetchLastDateDetails(stationName, gear, Type, Zone)
    .then(days => {
      res.json(days);
    })
    .catch(error => {
      console.error('Error fetching Gear options:', error);
      res.status(500).json({ error: 'An error occurred while fetching Gear options.' });
    });
}

exports.performUpdate = (req, res) => {
  const { updatedData, updatedArray, deletedArray } = req.body;
  console.log(req.body);

  formModel.performUpdate(req.body)
    .then(data => {
      console.log(data);
      console.log('Form data saved to the database successfully.');
      console.log(data);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      res.redirect('/render-response?data=' + encodeURIComponent(JSON.stringify(data)));
    })
    .catch(error => {
      console.error('Error saving form data to the database:', error);
      res.sendStatus(500);
    });
};

// function renderResponseTable(req, res) {
exports.renderResponseTable = (req, res) => {
  const dataString = req.query.data;

  const data = JSON.parse(decodeURIComponent(dataString));


  const isEmpty = Object.keys(data).length === 0;
  if (isEmpty) {
    res.render('rendertable', { data, req });
  }
  else {

    // data.Date_of_inspection = formatDate(data.Date_of_inspection);
    console.log('response rendertable',data);
    formModel.fetchRenderTableData(data)
      .then(data => {
        console.log(data);
        res.render('rendertable', { data, req });
      })
      .catch(error => {
        console.error('Error fetching data to the database:', error);
        res.sendStatus(500);
      })

  }

}


exports.saveFormData = (req, res) => {
  const formData = req.body;

  formModel.saveFormToDatabase(formData)
    .then(data => {
      console.log('Form data saved to the database successfully.');
      console.log(data);
      let responseData = {};
      if (data.length === 0) {
        responseData = {}
      }
      else {
        responseData = {
          stationName: data[0].STN_code,
          gear: data[0].Gear,
          Gear_type: data[0].Gear_type,
          Date_of_inspection: data[0].Date_of_inspection
        }
      }
      res.redirect('/render-response?data=' + encodeURIComponent(JSON.stringify(responseData)));
    })
    .catch(error => {
      console.error('Error saving form data to the database:', error);
      res.sendStatus(500);
    });
};


function formatDate(dateString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}


exports.saveFormData2 = (req, res) => {
  const formData = req.body;
  formModel.saveFormToDatabaseGear(formData)
    .then(data => {
      console.log(data);
      // data.forEach(item => {
      //   item.Date_of_inspection = formatDate(item.Date_of_inspection);;
      // });
      console.log('Form data saved to the database successfully.');
      console.log(data);
      let responseData = {};
      if (data.length === 0) {
        responseData = {};
      } else {
        responseData = {
          stationName: data[0].STN_code,
          gear: data[0].Gear,
          Date_of_inspection: data[0].Date_of_inspection
        }
      }
      res.redirect('/render-response?data=' + encodeURIComponent(JSON.stringify(responseData)));
    })
    .catch(error => {
      console.error('Error saving form data to the database:', error);
      res.sendStatus(500);
    });
};

exports.addNewGear = (req, res) => {
  const formData = req.body;
  formModel.addNewGear(formData)
    .then(data => {
      console.log('Form data saved to the database successfully.');
      res.redirect('/stationGearForm');
    })
    .catch(error => {
      console.error('Error saving form data to the database:', error);
      res.sendStatus(500);
    });
};

exports.addNewDeficiency = (req, res) => {
  const formData = req.body;
  formModel.addNewDeficiency(formData)
    .then(data => {
      console.log('Form data saved to the database successfully.');
      res.redirect('/stationGearForm');
    })
    .catch(error => {
      console.error('Error saving form data to the database:', error);
      res.sendStatus(500);
    });
};

exports.addNewPriorityPointDeficiency = (req, res) => {
  const formData = req.body;
  formModel.addNewPriorityDeficiency(formData)
    .then(data => {
      console.log('Form data saved to the database successfully.');
      res.redirect('/stationGearForm');
    })
    .catch(error => {
      console.error('Error saving form data to the database:', error);
      res.sendStatus(500);
    });
};

// complaince table
exports.updateSearch = (req, res) => {
  const formData = req.body; // Get the form data from req.body and process it if needed
  console.log(formData)
  formModel.getDataFromDatabase(formData)
    .then(tableData => {
      res.json(tableData);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'An error occurred while fetching data' });
    });
};

// Route handler for updating the data received from the SweetAlert
exports.updateData = (req, res) => {
  const updatedData = req.body;
  console.log("TEST_IMAGE ->", req.file);
  // Get the data from req.body and process it if needed
  formModel.updateDataInDatabase(updatedData, req.file)
    .then(updatedData => {
      res.json({ message: 'Data updated successfully', data: updatedData });
    })
    .catch(error => {
      console.error('Error updating data:', error);
      res.status(500).json({ error: 'An error occurred while updating data' });
    });
};


exports.updateAcknowledge = (req, res) => {
  const formData = req.body;
  console.log(formData)
  formModel.acknowledgeDataTable(formData)
    .then(tableData => {
      res.json(tableData);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'An error occurred while fetching data' });
    });
};

exports.updateAcknowledgeData = (req, res) => {
  const updatedData = req.body;

  formModel.updateAcknowledgeDataInDatabase(updatedData)
    .then(updatedData => {
      res.json({ message: 'Data updated successfully', data: updatedData });
    })
    .catch(error => {
      console.error('Error updating data:', error);
      res.status(500).json({ error: 'An error occurred while updating data' });
    });
};

exports.dashboardAnalysis = (req, res) => {
  let { fromDate, toDate } = req.query;
  // Set default dates if not provided
  if (!fromDate) {
    fromDate = '2010-01-01';
  }
  if (!toDate) {
    const today = new Date();
    toDate = today.toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
  }
  formModel.dashboardAnalysis(fromDate, toDate)
    .then(result => {
      console.log(result)
      res.render('dashboardAnalysis', { req, result })
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'An error occurred while fetching data' });
    });

  //res.render('dashboardAnalysis',{req})
};

exports.chartAnalysis = (req, res) => {

  res.render('chartAnalysis', { req })
};

// Controller function to fetch donut chart data
exports.getDonutChartData = (req, res) => {
  console.log('Fetching donut chart data...'); // Log start of data fetch
  formModel.getDonutChartData()
      .then(data => {
          console.log('Data fetched successfully:', data); // Log the final data
          res.json(data);
      })
      .catch(error => {
          console.error('Error fetching donut chart data:', error); // Log error if any
          res.status(500).json({ error: 'Error fetching donut chart data' });
      });
};


// formController.js

exports.getLongPendingPerformanceData = (req, res) => {
  console.log('Fetching long pending performance data...');
  formModel.getLongPendingPerformanceData()
      .then(data => {
          console.log('Long pending performance data fetched successfully:', data);
          res.json(data);
      })
      .catch(error => {
          console.error('Error fetching long pending performance data:', error);
          res.status(500).json({ error: 'Error fetching long pending performance data' });
      });
};

exports.getAverageComplianceTimeData = (req, res) => {
  console.log('Fetching average compliance time data...');
  formModel.getAverageComplianceTimeData()
      .then(data => {
          console.log('Average compliance time data fetched successfully:', data);
          res.json(data);
      })
      .catch(error => {
          console.error('Error fetching average compliance time data:', error);
          res.status(500).json({ error: 'Error fetching average compliance time data' });
      });
};



exports.analysis = (req, res) => {

  res.render('analysis', { req })
};

exports.analysisData = (req, res) => {
  const formData = req.body;
  console.log(formData)
  formModel.analysisDataChart(formData)
    .then(tableData => {
      res.json(tableData);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'An error occurred while fetching data' });
    });
};

exports.dashboard = (req, res) => {

  Promise.all([

    formModel.fetchGearType(),
    formModel.fetchGearTypePoint(),
    formModel.fetchGearTypeTrackCircuit(),
    formModel.fetchStationNames()
  ])
    .then(([gears, pointTypes, trackCircuitTypes, stationNames]) => {
      console.log(gears, pointTypes, trackCircuitTypes);
      res.render('dashboard', { gears, pointTypes, trackCircuitTypes, stationNames, req });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'An error occurred while fetching data.' });
    });

  // formModel.fetchGears()
  //   .then(gears => {
  //     console.log(gears)
  //     res.render('dashboard', { gears,req});
  //   })
  //   .catch(error => {
  //     console.error('Error fetching Station Names:', error);
  //     res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
  //   });
};




exports.dashboardData = (req, res) => {
  const { stationName, gear, selectedOption, optionDetails } = req.query;

  console.log(req.query)
  formModel.dashboardDataTable(stationName, gear, selectedOption, optionDetails)
    .then(finalResult => {
      res.json(finalResult);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'An error occurred while fetching data' });
    });
};


exports.longPendingDefiData = (req, res) => {
  const { stationName, gear, selectedOption, optionDetails } = req.query;
  console.log(req.query)
  formModel.longPendingDefiData(stationName, gear, selectedOption, optionDetails)
    .then(finalResult => {
      res.json(finalResult);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'An error occurred while fetching data' });
    });
};

exports.repeatedCompliance = (req, res) => {
  const { stationName, gear, selectedOption, optionDetails } = req.query;
  console.log(req.body)
  formModel.repeatedCompliance(stationName, gear, selectedOption, optionDetails)
    .then(finalResult => {
      res.json(finalResult);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'An error occurred while fetching data' });
    });
};

exports.hyperlinkData = (req, res) => {
  const { stationName, gear, columnName, defi, tableName, selectedOption, optionDetails } = req.query;
  console.log(req.query)
  formModel.hyperLinkData(stationName, gear, columnName, defi, tableName, selectedOption, optionDetails)
    .then(data => {
      //console.log(data)
      res.json(data);
      // res.render('Hyperlink', { data });
    })
    .catch(error => {
      console.error('Error fetching Station Names:', error);
      res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
    });
};


exports.existingGearID = (req, res) => {
  const { stnName, gearType, zone, type } = req.body;

  // Validate that all required fields are present
  if (!stnName || !gearType || !zone || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }


  formModel.existingGearID(stnName, gearType, zone, type)
    .then(result => {
      console.log('Data processed successfully:', result);
      res.json({ data: result });
    })
    .catch(error => {
      console.error('Error processing data:', error);
      res.status(500).json({ success: false, error: 'An error occurred while processing data' });
    });
}

exports.updateDate = (req, res) => {
  Promise.all([
    formModel.fetchStationNames(),
    formModel.fetchGearTypePoint(),
    formModel.fetchGearTypeTrackCircuit()
  ])
    .then(([stationNames, pointTypes, trackCircuitTypes]) => {

      //console.l
      console.log("data for point in", pointTypes)
      res.render('editMainEntry', { stationNames, pointTypes, trackCircuitTypes, req });
    })
    .catch(error => {
      console.error('Error fetching Station Names:', error);
      res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
    });
};

exports.updateMainSheet = (req, res) => {
  Promise.all([
    formModel.fetchStationNames()
  ])
    .then(([stationNames]) => {

      //console.l
      console.log("data for point in", stationNames)
      res.render('adminStationDetailsUpdate', { stationNames, req });
    })
    .catch(error => {
      console.error('Error fetching Station Names:', error);
      res.status(500).json({ error: 'An error occurred while fetching Station Names.' });
    });
};



exports.getMainEntryData = async (req, res) => {
  try {
      const {
          stationName,
          gear,
          zone,
          fromDate,
          typePoint,
          typeTrack
      } = req.query;  // Extract query parameters

      // Call the model to fetch data
      const data = await formModel.getMainEntryData ({
          stationName,
          gear,
          zone,
          fromDate,
          typePoint,
          typeTrack
      });

      res.status(200).json(data);  // Send data as JSON
  } catch (error) {
      console.error("Error in fetching table data:", error);
      res.status(500).send("Error fetching table data");
  }
};


exports.updateMainTableData = async (req, res) => {
  try {
      const updateData = req.body; 
      await formModel.updateMainTableData(updateData); 
      res.status(200).json({ message: 'Dates updated successfully!' });
  } catch (error) {
      console.error('Error updating dates:', error);
      res.status(500).send('Error updating dates.');
  }
};








