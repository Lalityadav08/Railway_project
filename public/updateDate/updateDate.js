
// $(document).ready(function () {
//   const table = $('#data-table').DataTable({
//     paging: false,  // Disable pagination
//     //pageLength: 1000 
//   });
//   let tableData = [];  

//   function fetchTableData() {
//     const stationName = $('#stationName').val();
//     const gear = $('#gear').val();
//     const zone = $('#zone').val();
//     const fromDate = $('#fromDate').val(); 
//     const typePoint = $('#Type_Point').is(':visible') ? $('#Type_Point').val() : null;
//     const typeTrack = $('#Type_Track').is(':visible') ? $('#Type_Track').val() : null;

//     $('#updateDateField').val('');

//     const queryParams = {
//       stationName,
//       gear,
//       zone,
//       fromDate,  
//       typePoint,  
//       typeTrack   
//     };

//     $.ajax({
//       url: '/fetchMainEntryData',  
//       type: 'GET',
//       data: queryParams,
//       success: function (data) {
//         table.clear().draw();
//         tableData = data;  
//         if (data.length > 0) {
//           $('#updateDateForm').show();  
//         } else {
//           $('#updateDateForm').hide();  
//         }

//         data.forEach(row => {
//           table.row.add([
//             `<input type="checkbox" class="row-select" value="${row.SR_NO}">`,
//             row.STN_CODE,
//             row.GEAR,
//             row.GEAR_ID,
//             row.Date_of_inspection,
//             row.DEFICIENCIES
//           ]).draw();
//         });
//       },
//       error: function (error) {
//         console.error('Error fetching table data:', error);
//       }
//     });
//   }


//   $('#stationName, #gear, #zone, #Type_Track, #Type_Point, #fromDate').change(fetchTableData);

//   $('#stationName').change(function () {
//     const selectedStation = $(this).val();
//     resetGearDropdown();  
//     resetZoneDropdown(); 
//     fetchGears(selectedStation);  
//     resetConditionalFields();  

//     $('#updateDateField').val('');  
//   });

//   $('#gear').change(function () {
//     const selectedStation = $('#stationName').val();
//     const selectedGear = $(this).val();
//     resetZoneDropdown();  
//     fetchZone(selectedStation, selectedGear);  
//     resetConditionalFields();  

//     if (selectedGear === 'Point') {
//       $('#pointTypeSelect').show().prop('required', true);
//       $('#trackTypeSelect').hide().prop('required', false);
//       $('#Type_Track').val(''); 
//     } else if (selectedGear === 'Track Circuit') {
//       $('#pointTypeSelect').hide().prop('required', false);
//       $('#trackTypeSelect').show().prop('required', true);
//       $('#Type_Point').val('');  
//     } else {
//       $('#pointTypeSelect, #trackTypeSelect').hide().prop('required', false);
//       $('#Type_Point, #Type_Track').val(''); 
//     }

//     $('#updateDateField').val(''); 
//   });

//   $('#zone').change(function () {
//     resetConditionalFields();  
//     $('#updateDateField').val('');  
//   });

//   // Function to reset the conditional fields (Type_Point and Type_Track)
//   function resetConditionalFields() {
//     $('#Type_Point').val('');
//     $('#Type_Track').val('');
//   }

//   // Function to reset and clear the zone dropdown
//   function resetZoneDropdown() {
//     $('#zone').html('<option value="" disabled selected>Select Zone</option>');
//   }

//   // Function to reset and clear the gear dropdown
//   function resetGearDropdown() {
//     $('#gear').html('<option value="" disabled selected>Select Gear</option>');
//   }

//   // Function to fetch gear options based on station name
//   function fetchGears(stationName) {
//     $.ajax({
//       url: `/fetchGears/${stationName}`,
//       type: 'GET',
//       success: function (data) {
//         $('#gear').html('<option value="" disabled selected>Select Gear</option>');
//         data.forEach(gear => {
//           $('#gear').append(new Option(gear.Gear_type, gear.Gear_type));
//         });
//       },
//       error: function (error) {
//         console.error('Error fetching gears:', error);
//       }
//     });
//   }

//   // Function to fetch zone options based on station and gear
//   function fetchZone(stationName, gearName) {
//     $.ajax({
//       url: `/fetchZone/${stationName}/${gearName}`,
//       type: 'GET',
//       success: function (data) {
//         $('#zone').html('<option value="" disabled selected>Select Zone</option>');
//         data.forEach(zone => {
//           $('#zone').append(new Option(zone.Zone, zone.Zone));
//         });
//       },
//       error: function (error) {
//         console.error('Error fetching zone:', error);
//       }
//     });
//   }

//   // Function to handle updating the date for all rows
//   $('#submitUpdateDate').click(function () {
//     const newDate = $('#updateDateField').val();  // Use the selected new date for update
//     const fromDate = $('#fromDate').val();  // Include From Date
//     if (!newDate) {
//       alert('Please select a date to update.');
//       return;
//     }

//     const stationName = $('#stationName').val();
//     const gear = $('#gear').val();
//     const zone = $('#zone').val();
//     const typePoint = $('#Type_Point').is(':visible') ? $('#Type_Point').val() : null;
//     const typeTrack = $('#Type_Track').is(':visible') ? $('#Type_Track').val() : null;

//     // Prepare data for updating dates
//     const updateData = {
//       newDate,
//       fromDate,  
//       stationName,
//       gear,
//       zone,
//       typePoint,
//       typeTrack
//     };

//     // Send AJAX request to update the dates for all rows
//     $.ajax({
//       url: '/updateTableDate',  // Replace with your endpoint
//       type: 'POST',
//       data: updateData,  // Send the update data to the backend
//       success: function (response) {
//         alert('Dates updated successfully!');
//         fetchTableData();  // Refresh the table data after update
//       },
//       error: function (error) {
//         console.error('Error updating dates:', error);
//       }
//     });
//   });
// });



$(document).ready(function () {
  const table = $('#data-table').DataTable({
    paging: false,  // Disable pagination
  });
  let tableData = [];  // Store fetched table data for updating dates later

  // Function to fetch table data based on current filters
  function fetchTableData() {
    const stationName = $('#stationName').val();
    const gear = $('#gear').val();
    const zone = $('#zone').val();
    const fromDate = $('#fromDate').val(); 
    const typePoint = $('#Type_Point').is(':visible') ? $('#Type_Point').val() : null;
    const typeTrack = $('#Type_Track').is(':visible') ? $('#Type_Track').val() : null;

    $('#updateDateField').val('');

    // Prepare query parameters
    const queryParams = {
      stationName,
      gear,
      zone,
      fromDate,  
      typePoint,  
      typeTrack   
    };

    $.ajax({
      url: '/fetchMainEntryData',  
      type: 'GET',
      data: queryParams,
      success: function (data) {
        table.clear().draw();
        tableData = data;  
        if (data.length > 0) {
          $('#updateDateForm').show();  
        } else {
          $('#updateDateForm').hide();  
        }

        data.forEach(row => {
          table.row.add([
            `<input type="checkbox" class="row-select" value="${row.SR_NO}">`, // Checkbox for selecting rows
            row.STN_CODE,
            row.GEAR,
            row.GEAR_ID,
            row.Date_of_inspection,
            row.DEFICIENCIES
          ]).draw();
        });
      },
      error: function (error) {
        console.error('Error fetching table data:', error);
      }
    });
  }

  // Trigger fetch when dropdowns change
  $('#stationName, #gear, #zone, #Type_Track, #Type_Point, #fromDate').change(fetchTableData);

  // Populate gear and zone dynamically on station and gear change
  $('#stationName').change(function () {
    const selectedStation = $(this).val();
    resetGearDropdown();  // Reset gear dropdown when station changes
    resetZoneDropdown();  // Reset zone dropdown when station changes
    fetchGears(selectedStation);  // Fetch new gears based on selected station
    resetConditionalFields();  // Reset conditional fields when station changes

    $('#updateDateField').val('');  // Clear updateDateField on station change
  });

  $('#gear').change(function () {
    const selectedStation = $('#stationName').val();
    const selectedGear = $(this).val();
    resetZoneDropdown();  // Reset zone dropdown when gear changes
    fetchZone(selectedStation, selectedGear);  // Fetch new zones based on selected station and gear
    resetConditionalFields();  // Reset conditional fields when gear changes

    if (selectedGear === 'Point') {
      $('#pointTypeSelect').show().prop('required', true);
      $('#trackTypeSelect').hide().prop('required', false);
      $('#Type_Track').val('');  // Reset Type_Track if shown previously
    } else if (selectedGear === 'Track Circuit') {
      $('#pointTypeSelect').hide().prop('required', false);
      $('#trackTypeSelect').show().prop('required', true);
      $('#Type_Point').val('');  // Reset Type_Point if shown previously
    } else {
      $('#pointTypeSelect, #trackTypeSelect').hide().prop('required', false);
      $('#Type_Point, #Type_Track').val('');  // Reset both if none is applicable
    }

    $('#updateDateField').val('');  // Clear updateDateField on gear change
  });

  $('#zone').change(function () {
    resetConditionalFields();  // Reset conditional fields when zone changes
    $('#updateDateField').val('');  // Clear updateDateField on zone change
  });

  // Function to reset the conditional fields (Type_Point and Type_Track)
  function resetConditionalFields() {
    $('#Type_Point').val('');
    $('#Type_Track').val('');
  }

  // Function to reset and clear the zone dropdown
  function resetZoneDropdown() {
    $('#zone').html('<option value="" disabled selected>Select Zone</option>');
  }

  // Function to reset and clear the gear dropdown
  function resetGearDropdown() {
    $('#gear').html('<option value="" disabled selected>Select Gear</option>');
  }

  // Function to fetch gear options based on station name
  function fetchGears(stationName) {
    $.ajax({
      url: `/fetchGears/${stationName}`,
      type: 'GET',
      success: function (data) {
        $('#gear').html('<option value="" disabled selected>Select Gear</option>');
        data.forEach(gear => {
          $('#gear').append(new Option(gear.Gear_type, gear.Gear_type));
        });
      },
      error: function (error) {
        console.error('Error fetching gears:', error);
      }
    });
  }

  // Function to fetch zone options based on station and gear
  function fetchZone(stationName, gearName) {
    $.ajax({
      url: `/fetchZone/${stationName}/${gearName}`,
      type: 'GET',
      success: function (data) {
        $('#zone').html('<option value="" disabled selected>Select Zone</option>');
        data.forEach(zone => {
          $('#zone').append(new Option(zone.Zone, zone.Zone));
        });
      },
      error: function (error) {
        console.error('Error fetching zone:', error);
      }
    });
  }

  // Handle select all checkbox functionality
  $('#select-all').change(function () {
    const isChecked = $(this).is(':checked');
    $('.row-select').prop('checked', isChecked);
  });

  // Function to handle updating the date for all rows
  // $('#submitUpdateDate').click(function () {
  //   const newDate = $('#updateDateField').val();  // Use the selected new date for update
  //   const fromDate = $('#fromDate').val();  // Include From Date
  //   if (!newDate) {
  //     alert('Please select a date to update.');
  //     return;
  //   }

  //   const stationName = $('#stationName').val();
  //   const gear = $('#gear').val();
  //   const zone = $('#zone').val();
  //   const typePoint = $('#Type_Point').is(':visible') ? $('#Type_Point').val() : null;
  //   const typeTrack = $('#Type_Track').is(':visible') ? $('#Type_Track').val() : null;

  //   // Prepare data for updating dates
  //   const updateData = {
  //     newDate,
  //     fromDate,  
  //     stationName,
  //     gear,
  //     zone,
  //     typePoint,
  //     typeTrack
  //   };

  //   // Send AJAX request to update the dates for all rows
  //   $.ajax({
  //     url: '/updateTableDate',  // Replace with your endpoint
  //     type: 'POST',
  //     data: updateData,  // Send the update data to the backend
  //     success: function (response) {
  //       alert('Dates updated successfully!');
  //       fetchTableData();  // Refresh the table data after update
  //     },
  //     error: function (error) {
  //       console.error('Error updating dates:', error);
  //     }
  //   });
  // });

  $('#submitUpdateDate').click(function () {
    const newDate = $('#updateDateField').val();  // Use the selected new date for update
    const fromDate = $('#fromDate').val();  // Include From Date
    if (!newDate) {
        alert('Please select a date to update.');
        return;
    }

    const stationName = $('#stationName').val();
    const gear = $('#gear').val();
    const zone = $('#zone').val();
    const typePoint = $('#Type_Point').is(':visible') ? $('#Type_Point').val() : null;
    const typeTrack = $('#Type_Track').is(':visible') ? $('#Type_Track').val() : null;

    // Check if all rows are selected
    const isAllSelected = $('#select-all').is(':checked');
    
    // Prepare data for updating dates
    let updateData;

    if (isAllSelected) {
        // If all rows are selected, send all row data
        updateData = {
            newDate,
            fromDate,  
            stationName,
            gear,
            zone,
            typePoint,
            typeTrack,
            allSelected: true  // Indicate that all rows are selected
        };
    } else {
        // Get selected row data
        const selectedRows = $('.row-select:checked'); // Get all checked checkboxes
        const selectedData = [];

        selectedRows.each(function () {
            const rowData = $(this).val(); // Get the value (e.g., STN_CODE)
            selectedData.push(rowData);
        });

        // Prepare the updateData object
        updateData = {
            newDate,
            fromDate,  
            stationName,
            gear,
            zone,
            typePoint,
            typeTrack,
            selectedData // Include selected row data
        };
    }

    // Send AJAX request to update the dates for selected rows
    $.ajax({
        url: '/updateMainTableDate',  // Replace with your endpoint
        type: 'POST',
        data: updateData,  // Send the update data to the backend
        success: function (response) {
            alert('Dates updated successfully!');
            fetchTableData();  // Refresh the table data after update
        },
        error: function (error) {
            console.error('Error updating dates:', error);
        }
    });
});


  // Add button to perform action on selected rows
  $('#performAction').click(function () {
    const selectedRows = $('.row-select:checked'); // Get all checked checkboxes
    const selectedData = [];
    
    selectedRows.each(function () {
      const rowData = $(this).val(); // Get the value (STN_CODE or other)
      selectedData.push(rowData);
    });
    
    if (selectedData.length > 0) {
      // Perform your action here (e.g., send selected data to the server)
      console.log('Selected Rows:', selectedData);
      // Optionally, you can send the selectedData to the server via AJAX
    } else {
      alert('No rows selected.');
    }
  });
});
