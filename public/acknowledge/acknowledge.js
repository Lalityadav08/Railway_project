// $(document).ready(function() {
//     // Initially hide dropdowns 2 and 3
//     $("#optionDetails1").hide();
//     $("#stationName1").hide();
//     // Show/hide dropdown 3 based on the selected option in dropdown 2
//     $("#selectOption").change(function() {
//         var selectedOption = $(this).val();
//         if (selectedOption === "PWI" || selectedOption === "CPWI") {
//             $("#optionDetails1").show();
//             fetchOptionName(selectedOption)
//             $("#stationName1").show();
//         } else {
//             $("#optionDetails1").show();
//             $("#stationName1").hide();
//             fetchOptionName(selectedOption);
//         }
//     });

//     $("#optionDetails").change(function() {
//         var optionDetails = $(this).val();
//         var option =  $("#selectOption").val();
       
//         fetchStationName(option,optionDetails);
//     });


//     function fetchStationName(option,optionDetails) {
//         fetch(`/fetchStationName/${option}/${optionDetails}`)
//           .then(response => response.json())
//           .then(data => {
//             // Clear previous options
//             stationName.innerHTML = '<option value="" disabled selected>Select Station</option>';
//             data.forEach(station => {
//               const option = document.createElement('option');
//               option.value = station;
//               option.textContent = station;
//               stationName.appendChild(option);
//             });
    
//           })
//           .catch(error => console.error('Error:', error));
//       }

//       function fetchOptionName(option) {
//         fetch(`/fetchOptionName/${option}`)
//           .then(response => response.json())
//           .then(data => {
//             // Clear previous options
//             optionDetails.innerHTML = '<option value="" disabled selected>Select Option</option>';
//             data.forEach( newData=> {
//               const option = document.createElement('option');
//               option.value = newData;
//               option.textContent = newData;
//               optionDetails.appendChild(option);
//             });
    
//           })
//           .catch(error => console.error('Error:', error));
//       }

// });

// // Define the variables
// var table;
// var column5Data = ['', '', '', '', ''];
// var commonData;

// // Function to generate sub-rows
// function generateSubRows(rowData, complainceArray, srArray,actionArray,acknowledgeReviewArray,defi_num,imagePathArray) {
//     var subRows = '';

//     for (var i = 0; i < rowData.length; i++) {

//         let subrowData;
//         if(defi_num[i] === '0'){
//             subrowData = `${rowData[i]}`;
//         }
//         else{
//             subrowData = `${defi_num[i]}-${rowData[i]} `
//         }
//         console.log(acknowledgeReviewArray[i])
//         subRows += `<div class="sub-row-content">
//                         <span style="margin-right: 2px">${i + 1}) </span>
//                         <span style="margin-right: 4px;  font-weight: bold;">${subrowData}</span>
//                         <span><button class="btn-edit" data-sub-row="${i}" data-sr-attribute="${srArray[i]}" data-action-attribute ="${actionArray[i]}" data-image-attribute = "${imagePathArray[i]}"  data-other-attribute="${acknowledgeReviewArray[i]}" data-acknowReview-attribute="${acknowledgeReviewArray[i]}" style="border: none; color:red;  margin-right: 6px" >ACK</button></span>
//                     </div>`;
//     }
//     return subRows;
// }

// // Function to refresh table data
// function refreshTableData(formData) {
//     fetch('/acknowledge', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(formData)
//     })
//     .then(response => response.json())
//     .then(data => {
//         var tableData = [];

//         data.forEach(rowData => {
//             var deficienciesArray = rowData.DEFICIENCIES.substring(1, rowData.DEFICIENCIES.length - 1).split(',');
//             var defi_num = rowData.DEFI_NUM.substring(1, rowData.DEFI_NUM.length - 1).split(',');
//             var complainceArray = rowData.Complaince.substring(1, rowData.Complaince.length - 1).split(',');
//             var srArray = rowData.SR_NO.substring(1, rowData.SR_NO.length - 1).split(',');
//             var actionArray = rowData.Action_Taken.substring(1, rowData.Action_Taken.length - 1).split(',');
//             var acknowledgeReviewArray = rowData.Acknowledge_Review.substring(1, rowData.Acknowledge_Review.length - 1).split(',');
//             var imagePathArray = rowData.ImagePath.substring(1, rowData.ImagePath.length - 1).split(',');


//             // Trim and remove extra whitespace from array elements
//             deficienciesArray = deficienciesArray.map(deficiency => deficiency.trim());
//             defi_num =  defi_num.map(defi => defi.trim());
//             complainceArray = complainceArray.map(complaince => complaince.trim());
//             srArray = srArray.map(sr => sr.trim());
//             actionArray = actionArray.map(action => action.trim());
//             acknowledgeReviewArray =acknowledgeReviewArray.map(acknowledgeR => acknowledgeR.trim());
//             imagePathArray = imagePathArray.map(imagePathR => imagePathR.trim());
            

//             // Create a new row object with data from the server
//             var row = {
//                 // 'Station Code': rowData.STN_code,
//                 'Gear': rowData.Gear,
//                 'Gear ID': rowData.Gear_ID,
//                 'Date Of Inspection': rowData.Date_of_inspection,
//                 'Deficiency': generateSubRows(deficienciesArray, complainceArray, srArray,actionArray,acknowledgeReviewArray,defi_num,imagePathArray)
//             };

//             tableData.push(row);
//         });

//         // Draw the DataTable with the updated data
//         table.clear();
//         table.rows.add(tableData);
//         table.draw();
//     })
//     .catch(error => {
//         console.error('Error fetching data:', error);
//     });
// }

// function generateFormData() {
//     var selectOptionValue = document.getElementById('selectOption').value;
//     var optionDetailsValue = document.getElementById('optionDetails').value;
//     var stationNameValue = document.getElementById('stationName').value;
    
//     const formData = {
//         selectOption: selectOptionValue,
//         optionDetails: optionDetailsValue,
//         stationName: stationNameValue,
//     };
//     return formData;
// }
// // Initialize the DataTable and other common data
// $(document).ready(function() {
//     // Sample data for the other columns (common data in each row)
//     commonData = [
//         {
//             // 'Station Code': '',
//             'Gear': '',
//             'Gear ID': '',
//             'Date Of Inspection': '',
//             'Deficiency': ''
//         }
//     ];

//     // Initialize the DataTable
//     table = $('#data-table').DataTable({
//         data: commonData,
//         columns: [
//             // { data: 'Station Code', width: '15%' },
//             { data: 'Gear', width: '15%' },
//             { data: 'Gear ID', width: '15%' },
//             { data: 'Date Of Inspection', width: '15%' },
//             { data: 'Deficiency', orderable: false, width: '40%' }
//         ],
//         columnDefs: [
//             {
//                 targets: -1, // The last column
//                 render: function(data, type, row) {
//                     // Custom rendering to show the sub-rows within the same cell
//                     if (type === 'display') {
//                         return `<div style="white-space: normal;">${data}</div>`;
//                     }
//                     return data;
//                 }
//             }
//         ],
//         autoWidth: false
//     });

//     // Event listener for the "Edit" button
//     $('#data-table tbody').on('click', '.btn-edit', function() {
//                 var rowIndex = $(this).data('sub-row');
//                 var ackarray = $(this).data('other-attribute');
//                 var actionValue = $(this).data('action-attribute');
//                 var serialNumberValue = $(this).data('sr-attribute');
//                 var imageDetails = $(this).data('image-attribute');
//                 //var ackarray = $(this).data('acknowReview-attribute');
//                 var historyParts;
//                 var lastAction;
//                 if (actionValue != 'NONE'){
//                     historyParts = actionValue.split('|');
//                     lastAction = historyParts[historyParts.length - 1];
//                 }
//                 else{
//                     lastAction ='';
//                 }

//                 var rowData = column5Data[rowIndex];
            
//                 // Generate the dynamic HTML content for the modal form
//                 var modalContent = `
//                     <form>
//                         <div class ="review" id ="review">                     
//                         <p>Comp:${lastAction} </p>
//                         </div>
//                         <div id="imageContainer">
//                             <span id="displayText">Click to view image</span>
//                             <img id="fullImage" src="/${imageDetails}" alt="compliance image" style="display:none;">
//                         </div>
                        
//                         <div class="form-group">
//                             <label for="editCheckbox">Compliance</label>
//                             <select id="editCheckbox" class="form-control">
//                                 <option value = "Pending" >Pending</option>
//                                 <option value="Not Satisfied" >Not Satisfied</option>
//                                 <option value="Satisfied">Satisfied</option>
//                             </select>
//                         </div>
//                         <div id="additionalFields" style="display: none;">
//                             <div class="form-group">
//                                 <label for="acknowledgeReview">Acknowledge Review</label>
//                                 <textarea id="acknowledgeReview" class="form-control" rows="7"></textarea>
//                             </div>
//                         </div>
//                     </form>
//                 `;
        
//                 // Open the SweetAlert2 modal with custom HTML content
//                 Swal.mixin({
//                     customClass: {
//                         confirmButton: 'btn btn-primary',
//                         cancelButton: 'btn btn-secondary'
//                     },
//                     buttonsStyling: false
//                 }).fire({
//                     title: 'Acknowledge Form',
//                     html: modalContent,
//                     showCancelButton: true,
//                     showConfirmButton: true,
//                     allowOutsideClick: false,
//                     reverseButtons: true,
//                     focusConfirm: false,
//                     didOpen: () => {
//                         document.getElementById('displayText').addEventListener('click', function() {
//                             var img = document.getElementById('fullImage');
//                             if (img.style.display === 'none') {
//                                 img.style.display = 'block';
//                                 document.getElementById('displayText').textContent = 'Click to hide image';
//                             } else {
//                                 img.style.display = 'none';
//                                 document.getElementById('displayText').textContent = 'Click to view image';
//                             }
//                         });
//                         if (lastAction === '') {
//                             document.getElementById('review').style.display = 'none';
//                         }
//                         else{
//                             var actionArrayParts = actionValue.split('|');
//                             var revParts = ackarray.split('|');

//                             // Create an empty array to store combined data
//                             var combinedData = [];

//                             // Iterate over the arrays and generate combined data
//                             for (var i = 0; i < Math.max(actionArrayParts.length, revParts.length); i++) {
//                                 var ack = revParts[i] === 'Not Satisfied' ? '' : (revParts[i] || '');
//                                 var comp = actionArrayParts[i] || '';

//                                 if (ack !== '' || comp !== '') {
//                                     combinedData.push({
//                                         comp: comp,
//                                         ack: ack
//                                     });
//                                 }
//                             }

//                             // Generate the HTML content for the review section
//                             var reviewContent = combinedData.map(data => `
//                             <h5> <strong>Comp </strong>: ${data.comp}</h5>
//                             <h5><strong>Ack</strong>: <span style="color: red;">${data.ack}</span></h5>
//                             `).join('<br>');

//                             // Replace the review section content with generated content
//                             document.getElementById('review').innerHTML = reviewContent;
//                         }
//                     },
//                     preConfirm: function() {
//                         var editedData = $('#editCheckbox').val();
//                         var showAdditionalFields = $('#editCheckbox').val();
//                         var additionalFieldData = {
//                             actionTaken: null,
//                         };
        
//                         if (showAdditionalFields === 'Not Satisfied') {
//                             additionalFieldData.actionTaken = $('#acknowledgeReview').val();

//                         }
        
//                         // Send the edited data and additional field data to Node.js backend using Fetch API
//                         var formData = {
//                             indentifier: serialNumberValue,
//                             editedData: editedData,
//                             additionalFieldData: additionalFieldData
//                         };        
//                         return fetch('/addAcknowledge', {
//                             method: 'POST',
//                             headers: {
//                                 'Content-Type': 'application/json'
//                             },
//                             body: JSON.stringify(formData)
//                         })
//                         .then(response => {
//                             if (!response.ok) {
//                                 throw new Error('Network response was not ok');
//                             }
//                             return response.json();
//                         })
//                         .then(data => {
//                             // Handle the response data (if needed)
//                             const res = generateFormData()
//                             refreshTableData(res);

//                             Swal.fire('Success', 'Data saved successfully!', 'success');
//                         })
//                         .catch(error => {
//                             // Handle errors (if needed)
//                             Swal.fire('Error', 'Failed to save data!', 'error');
//                         });
//                     }
                    
//                 });
//                 $('#editCheckbox').on('change', function() {
//                                 var showAdditionalFields = $(this).val();
//                                 if (showAdditionalFields === 'Not Satisfied') {
//                                     $('#additionalFields').show();
//                                 } else {
//                                     $('#additionalFields').hide();
//                                 }
//                             });
//     });

//     // Event listener for the "Submit" button
//     $('#submitButton').click(function(event) {
//         event.preventDefault(); // Prevent form submission

//         // Collect the form data
//         var selectOptionValue = document.getElementById('selectOption').value;
//         var optionDetailsValue = document.getElementById('optionDetails').value;
//         var stationNameValue = document.getElementById('stationName').value;
      
//         const formData = {
//             selectOption: selectOptionValue,
//             optionDetails: optionDetailsValue,
//             stationName: stationNameValue,
            
//         };

//         // Call refreshTableData with the form data after fetching data
//         refreshTableData(formData);
//     });
// });


$(document).ready(function() {
    // Initially hide dropdowns 2 and 3
    $("#optionDetails1").hide();
    $("#stationName1").hide();
    // Show/hide dropdown 3 based on the selected option in dropdown 2
    $("#selectOption").change(function() {
        var selectedOption = $(this).val();
        if (selectedOption === "PWI" || selectedOption === "CPWI") {
            $("#optionDetails1").show();
            fetchOptionName(selectedOption)
            $("#stationName1").show();
        } else {
            $("#optionDetails1").show();
            $("#stationName1").hide();
            fetchOptionName(selectedOption);
        }
    });

    $("#optionDetails").change(function() {
        var optionDetails = $(this).val();
        var option =  $("#selectOption").val();
       
        fetchStationName(option,optionDetails);
    });


    function fetchStationName(option,optionDetails) {
        fetch(`/fetchStationName/${option}/${optionDetails}`)
          .then(response => response.json())
          .then(data => {
            // Clear previous options
            stationName.innerHTML = '<option value="" disabled selected>Select Station</option>';
            data.forEach(station => {
              const option = document.createElement('option');
              option.value = station;
              option.textContent = station;
              stationName.appendChild(option);
            });
    
          })
          .catch(error => console.error('Error:', error));
      }

      function fetchOptionName(option) {
        fetch(`/fetchOptionName/${option}`)
          .then(response => response.json())
          .then(data => {
            // Clear previous options
            optionDetails.innerHTML = '<option value="" disabled selected>Select Option</option>';
            data.forEach( newData=> {
              const option = document.createElement('option');
              option.value = newData;
              option.textContent = newData;
              optionDetails.appendChild(option);
            });
    
          })
          .catch(error => console.error('Error:', error));
      }

});

// Define the variables
var table;
var column5Data = ['', '', '', '', ''];
var commonData;

// Function to generate sub-rows
function generateSubRows(rowData,defiData, complainceArray, srArray,actionArray,acknowledgeReviewArray,defi_num) {
    var subRows = '';
    console.log("STN_CODE",rowData.STN_code);
    console.log("Gear_ID",rowData.Gear_ID);
    

    for (var i = 0; i < defiData.length; i++) {

        let subrowData;

        // if (rowData.Acknowledgement === '[Satisfied]') {
        //     console.log("Acknowledgement is 'Satisfied', skipping the row.");
        //     return subRows; // Return empty string if Acknowledgement is "Satisfied"
        // }

        // if (acknowledgeReviewArray[i] === 'Satisfied') {
        //     console.log(acknowledgeReviewArray[i])
        //     continue;
        // }

        if(defi_num[i] === '0'){
            subrowData = `${defiData[i]}`;
        }
        else{
            subrowData = `${defiData[i]} - ${defi_num[i]} `
        }
        
        console.log(subrowData)
        subRows += `<div class="sub-row-content">
                        <span style="margin-right: 2px">${i + 1}) </span>
                        <span style="margin-right: 4px;  font-weight: bold;">${subrowData}</span>
                        <span><button class="btn-edit" data-sub-row="${i}"  data-sr-attribute="${srArray[i]}" data-action-attribute ="${actionArray[i]}"  data-other-attribute="${acknowledgeReviewArray[i]}" data-acknowReview-attribute="${acknowledgeReviewArray[i]}" data-gear-attribute = "${rowData.Gear}" data-gearid-attribute = "${rowData.Gear_ID}" data-stncode-attribute = "${rowData.STN_code}" data-defival-attribute = "${defiData[i]}" style="border: none; color:red;  margin-right: 6px" >ACK</button></span>
                    </div>`;
    }
    return subRows;
}

// Function to refresh table data
function refreshTableData(formData) {
    fetch('/acknowledge', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        var tableData = [];
        data.forEach(rowData => {
            if (rowData.Acknowledgement === '[Satisfied]') {
                console.log(`Skipping row with Acknowledgement: ${rowData.Acknowledgement}`);
                return; // Skip to the next iteration
            }
            var deficienciesArray = rowData.DEFICIENCIES.substring(1, rowData.DEFICIENCIES.length - 1).split(',');
            var defi_num = rowData.DEFI_NUM.substring(1, rowData.DEFI_NUM.length - 1).split(',');
            var complainceArray = rowData.Complaince.substring(1, rowData.Complaince.length - 1).split(',');
            var srArray = rowData.SR_NO.substring(1, rowData.SR_NO.length - 1).split(',');
            var actionArray = rowData.Action_Taken.substring(1, rowData.Action_Taken.length - 1).split(',');
            var acknowledgeReviewArray = rowData.Acknowledge_Review.substring(1, rowData.Acknowledge_Review.length - 1).split(',');
            var acknowledgement = rowData.Acknowledge_Review.substring(1, rowData.Acknowledge_Review.length - 1).split(',');
        


            // Trim and remove extra whitespace from array elements
            deficienciesArray = deficienciesArray.map(deficiency => deficiency.trim());
            defi_num =  defi_num.map(defi => defi.trim());
            complainceArray = complainceArray.map(complaince => complaince.trim());
            srArray = srArray.map(sr => sr.trim());
            actionArray = actionArray.map(action => action.trim());
            acknowledgeReviewArray =acknowledgeReviewArray.map(acknowledgeR => acknowledgeR.trim());
            acknowledgementArray = acknowledgementArray.map(ack => ack.trim());

            console.log("rowData ==>", rowData);


            

            // Create a new row object with data from the server
            var row = {
                'Station Code': rowData.STN_code,
                'Gear': rowData.Gear,
                'Gear ID': rowData.Gear_ID,
                'Date Of Inspection': rowData.Date_of_inspection,
                'Deficiency': generateSubRows(rowData,deficienciesArray, complainceArray, srArray,actionArray,acknowledgeReviewArray,defi_num)
            };

            tableData.push(row);
        });

        // Draw the DataTable with the updated data
        table.clear();
        table.rows.add(tableData);
        table.draw();
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

function generateFormData() {
    var selectOptionValue = document.getElementById('selectOption').value;
    var optionDetailsValue = document.getElementById('optionDetails').value;
    var stationNameValue = document.getElementById('stationName').value;
    
    const formData = {
        selectOption: selectOptionValue,
        optionDetails: optionDetailsValue,
        stationName: stationNameValue,
    };
    return formData;
}
// Initialize the DataTable and other common data
$(document).ready(function() {
    // Sample data for the other columns (common data in each row)
    commonData = [
        {
            'Station Code': '',
            'Gear': '',
            'Gear ID': '',
            'Date Of Inspection': '',
            'Deficiency': ''
        }
    ];

    // Initialize the DataTable
    table = $('#data-table').DataTable({
        data: commonData,
        columns: [
            { data: 'Station Code', width: '15%' },
            { data: 'Gear', width: '15%' },
            { data: 'Gear ID', width: '15%' },
            { data: 'Date Of Inspection', width: '15%' },
            { data: 'Deficiency', orderable: false, width: '40%' }
        ],
        columnDefs: [
            {
                targets: -1, // The last column
                render: function(data, type, row) {
                    // Custom rendering to show the sub-rows within the same cell
                    if (type === 'display') {
                        return `<div style="white-space: normal;">${data}</div>`;
                    }
                    return data;
                }
            }
        ],
        autoWidth: false
    });

    // Event listener for the "Edit" button
    $('#data-table tbody').on('click', '.btn-edit', function() {
                var rowIndex = $(this).data('sub-row');
                var ackarray = $(this).data('other-attribute');
                var actionValue = $(this).data('action-attribute');
                var serialNumberValue = $(this).data('sr-attribute');
                var stationNameValue = $(this).data('stncode-attribute');
                var gearValue = $(this).data('gear-attribute');
                var gearIdValue = $(this).data('gearid-attribute');
                var defiValue = $(this).data('defival-attribute');

                //var ackarray = $(this).data('acknowReview-attribute');
                var historyParts;
                var lastAction;
                if (actionValue != 'NONE'){
                    historyParts = actionValue.split('|');
                    lastAction = historyParts[historyParts.length - 1];
                }
                else{
                    lastAction ='';
                }

                var rowData = column5Data[rowIndex];
            
                // Generate the dynamic HTML content for the modal form
                var modalContent = `
                        <style>
                        .my-custom-modal {
                            width: 80%; 
                            height: 80%; 
                        }
                        #editCheckbox option {
                            font-size: 25px;
                        }
                    </style>
                    <form>
                        <div class ="stnDetails" id = "stnDetails" style = "margin:0 0 20 0; text-align: center;">
                        <h4 > <strong>Station Code: </strong> <span style ="color:green"> ${stationNameValue} </span> </h4>
                        <h4 >  <strong>Gear: </strong> <span style ="color:green">${gearValue} </span> <strong>, GearId: </strong> <span style ="color:green">${gearIdValue} </span></h4>
                        <h4 > <strong>Deficiency: </strong> <span style ="color:green">${defiValue} </span></h4>
                        </div>
                        <div class ="review" id ="review">                     
                        <p>Comp:${lastAction} </p>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="editCheckbox">Compliance</label>
                            <select id="editCheckbox" class="form-control">
                                <option  value = "Pending" >Pending</option>
                                <option   value="Not Satisfied" >Not Satisfied</option>
                                <option  value="Satisfied">Satisfied</option>
                            </select>
                        </div>
                        <div id="additionalFields" class="form-group col-md-6" style="display: none;">
                            <div class="form-group">
                                <label for="acknowledgeReview">Acknowledge Review</label>
                                <textarea id="acknowledgeReview" class="form-control" style="font-size: 14px;" rows="7"></textarea>
                            </div>
                        </div>
                    </form>
                `;
        
                // Open the SweetAlert2 modal with custom HTML content
                Swal.mixin({
                    customClass: {
                        confirmButton: 'btn btn-primary',
                        cancelButton: 'btn btn-secondary',
                        popup: 'my-custom-modal',
                    },
                    buttonsStyling: false
                }).fire({
                    title: 'Acknowledge Form',
                    html: modalContent,
                    showCancelButton: true,
                    showConfirmButton: true,
                    allowOutsideClick: false,
                    reverseButtons: true,
                    focusConfirm: false,
                    didOpen: () => {
                        if (lastAction === '') {
                            document.getElementById('review').style.display = 'none';
                        }
                        else{
                            var actionArrayParts = actionValue.split('|');
                            var revParts = ackarray.split('|');

                            // Create an empty array to store combined data
                            var combinedData = [];

                            // Iterate over the arrays and generate combined data
                            for (var i = 1; i < Math.max(actionArrayParts.length, revParts.length); i++) {
                                var ack = revParts[i] === 'Not Satisfied' ? '' : (revParts[i] || ''); // Handle "Not Satisfied" ack
                                var comp = actionArrayParts[i] || '';
                    
                                if (ack !== '' || comp !== '') {
                                    combinedData.push({
                                        comp: comp,
                                        ack: ack
                                    });
                                }
                            }

                            // Generate the HTML content for the review section
                            var reviewContent = combinedData.map((data, index) => `
                            <h5><strong>Comp (${index + 1})</strong>: ${data.comp}</h5>
                            <h5><strong>Ack (${index + 1})</strong>: <span style="color: red;">${data.ack}</span></h5>
                        `).join('<br>');

                            // Replace the review section content with generated content
                            document.getElementById('review').innerHTML = reviewContent;
                        }
                    },
                    preConfirm: function() {
                        var editedData = $('#editCheckbox').val();
                        var showAdditionalFields = $('#editCheckbox').val();
                        var additionalFieldData = {
                            actionTaken: null,
                        };
        
                        if (showAdditionalFields === 'Not Satisfied') {
                            additionalFieldData.actionTaken = $('#acknowledgeReview').val();

                        }
        
                        // Send the edited data and additional field data to Node.js backend using Fetch API
                        var formData = {
                            indentifier: serialNumberValue,
                            editedData: editedData,
                            additionalFieldData: additionalFieldData
                        };        
                        return fetch('/addAcknowledge', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(formData)
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then(data => {
                            // Handle the response data (if needed)
                            const res = generateFormData()
                            refreshTableData(res);

                            Swal.fire('Success', 'Data saved successfully!', 'success');
                            setTimeout(() => {
                                Swal.close();
                            }, 750);
                        })
                        .catch(error => {
                            // Handle errors (if needed)
                            Swal.fire('Error', 'Failed to save data!', 'error');
                            setTimeout(() => {
                                Swal.close();
                            }, 1000);
                        });
                    }
                    
                });
                $('#editCheckbox').on('change', function() {
                                var showAdditionalFields = $(this).val();
                                if (showAdditionalFields === 'Not Satisfied') {
                                    $('#additionalFields').show();
                                } else {
                                    $('#additionalFields').hide();
                                }
                            });
    });

    // Event listener for the "Submit" button
    $('#submitButton').click(function(event) {
        event.preventDefault(); // Prevent form submission

        // Collect the form data
        var selectOptionValue = document.getElementById('selectOption').value;
        var optionDetailsValue = document.getElementById('optionDetails').value;
        var stationNameValue = document.getElementById('stationName').value;
      
        const formData = {
            selectOption: selectOptionValue,
            optionDetails: optionDetailsValue,
            stationName: stationNameValue,
            
        };

        // Call refreshTableData with the form data after fetching data
        refreshTableData(formData);
    });


});

$(document).ready(function() {
    const formData = {
        selectOption: "ALL",
        optionDetails: "ALL",
        stationName: "ALL",
    };

    refreshTableData(formData);
    
});








