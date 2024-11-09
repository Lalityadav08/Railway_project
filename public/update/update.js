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
// function generateSubRows(rowData, complainceArray, srArray,acknowledgeArray,acknowledgeReviewArray,actionArray,defi_num,dateArray) {
//     var subRows = '';

//     for (var i = 0; i < rowData.length; i++) {
//         var complianceColor;
//         var disableButton;
//         var a_r = '';
//         //var complianceColor = complainceArray[i] === 'NO' ? 'red' : 'green';
//         //var disableButton = complainceArray[i] === 'YES' && acknowledgeArray[i] === 'Satisfied' ? 'disabled' : '';
//         var complainceName = complainceArray[i] === 'YES' ? 'Complied':'Comply';
//         if (complainceArray[i] === 'NO'){
//             complianceColor = 'red'
//         }
//         else if (complainceArray[i] === 'YES' && acknowledgeArray[i] === 'Pending'){
//             complianceColor ='orange'
//             complainceName = 'Under ACK'

//         }
//         else if (complainceArray[i] === 'Under_Acknowledge' && acknowledgeArray[i] === 'Not Satisfied'){
//             complianceColor ='cyan'
//             complainceName = 'Re Comply'
//             a_r = acknowledgeReviewArray[i]
//         }
//         else if(acknowledgeArray[i] === 'Satisfied'){
//             complianceColor = 'green'
//             disableButton = 'disabled'

//         }
//         else{
//             complianceColor ='orange'
//             complainceName = 'Under ACK'
//         }

//         let subrowData;
//         if(defi_num[i] === '0'){
//             subrowData = `${rowData[i]}`;
//         }
//         else{
//             subrowData = `${defi_num[i]}-${rowData[i]} `
//         }

//         subRows += `<div class="sub-row-content">
//                         <span style="margin-right: 2px">${i + 1}) </span>
//                         <span style="margin-right: 4px;  font-weight: bold;">${subrowData}</span>
//                         <span><button class="btn-edit" data-sub-row="${i}" data-sr-attribute="${srArray[i]}" data-action-attribute ="${actionArray[i]}"  data-date-attribute = "${dateArray[i]}" data-other-attribute="${complainceArray[i]}" data-a-r="${a_r}" style="border: none;  color:${complianceColor}; margin-right: 6px" ${disableButton}>${complainceName}</button></span>
//                     </div>`;
//     }
//     return subRows;
// }


// function groupBy(array, key) {
//     return array.reduce((result, obj) => {
//         (result[obj[key]] = result[obj[key]] || []).push(obj);
//         return result;
//     }, {});
// }

// // Function to refresh table data
// function refreshTableData(formData) {
//     fetch('/updateSearch', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(formData)
//     })
//     .then(response => response.json())
//     .then(data => {
//         var tableData = [];

//         // Group data by Gear_ID and find the largest date within each group
//         const gearIdGroups = groupBy(data, 'Gear_ID');
//         const gearIdLargestDates = {};
//         for (const gearId in gearIdGroups) {
//             const largestDate = Math.max(...gearIdGroups[gearId].map(rowData => new Date(rowData.Date_of_inspection)));
//             gearIdLargestDates[gearId] = largestDate;
//         }
//          // Find the largest date in the data
//          //const largestDate = Math.max(...data.map(rowData => new Date(rowData.Date_of_inspection)));

//         data.forEach(rowData => {
//             var deficienciesArray = rowData.DEFICIENCIES.substring(1, rowData.DEFICIENCIES.length - 1).split(',');
//             var defi_num = rowData.DEFI_NUM.substring(1, rowData.DEFI_NUM.length - 1).split(',');
//             var complainceArray = rowData.Complaince.substring(1, rowData.Complaince.length - 1).split(',');
//             var srArray = rowData.SR_NO.substring(1, rowData.SR_NO.length - 1).split(',');
//             var acknowledgeArray = rowData.Acknowledgement.substring(1, rowData.Acknowledgement.length - 1).split(',');
//             var acknowledgeReviewArray = rowData.Acknowledge_Review.substring(1, rowData.Acknowledge_Review.length - 1).split(',');
//             var actionArray = rowData.Action_Taken.substring(1, rowData.Action_Taken.length - 1).split(','); 
//             var dateArray = rowData.Date_of_inspection.split(',');
//             //var dateArray  = rowData.Date_of_inspection.substring(1, rowData.Date_of_inspection.length ).split(','); 

//             // Trim and remove extra whitespace from array elements
//             deficienciesArray = deficienciesArray.map(deficiency => deficiency.trim());
//             defi_num =  defi_num.map(defi => defi.trim());
//             complainceArray = complainceArray.map(complaince => complaince.trim());
//             srArray = srArray.map(sr => sr.trim());
//             acknowledgeArray =acknowledgeArray.map(acknowledge => acknowledge.trim());
//             acknowledgeReviewArray =acknowledgeReviewArray.map(acknowledgeR => acknowledgeR.trim());
//             actionArray = actionArray.map(action => action.trim());
//             //dateArray = dateArray.map(date => date.trim())
//             dateArray = dateArray.map(date => {
//                 const [year, month, day] = date.split('-');
//                 const correctedYear = year.length === 2 ? '20' + year : year;
//                 return `${correctedYear}-${month}-${day}`;
//             });

//             console.log(dateArray);

//             // Check if the date is less than the largest date for the Gear_ID
//             const isDateLessThanLargest = new Date(rowData.Date_of_inspection) < gearIdLargestDates[rowData.Gear_ID];

//             // Create a new row object with data from the server
//             var row = {
//                 // 'Station Code': rowData.STN_code,
//                 'Gear': rowData.Gear,
//                 'Gear ID': rowData.Gear_ID,
//                 'Date Of Inspection': rowData.Date_of_inspection + (isDateLessThanLargest ? '<span style="color: red;">  R</span>' : ''),
//                 //'Date Of Inspection': rowData.Date_of_inspection + (new Date(rowData.Date_of_inspection) < largestDate ? '<span style="color: red;">  R</span>' : ''),
//                 //'Date Of Inspection': rowData.Date_of_inspection,
//                 'Deficiency': generateSubRows(deficienciesArray, complainceArray, srArray,acknowledgeArray,acknowledgeReviewArray,actionArray,defi_num,dateArray)
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
//     var complainceOptionValue = document.getElementById('complianceDropdown').value;
//     const formData = {
//         selectOption: selectOptionValue,
//         optionDetails: optionDetailsValue,
//         stationName: stationNameValue,
//         complainceOption: complainceOptionValue
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
//                 var dateValue = $(this).data('date-attribute');
//                 var complianceValue = $(this).data('other-attribute');
//                 var serialNumberValue = $(this).data('sr-attribute');
//                 var actionAttribute = $(this).data('action-attribute');
//                 var rowData = column5Data[rowIndex];
//                 var rev = $(this).data('a-r');
//                 var lastAction;

//                 if (rev == "Not Satisfied"){
//                     rev =''
//                     lastAction = ''

//                 }
//                 else{
//                     const historyParts = rev.split('|');
//                     lastAction = historyParts[historyParts.length - 1];
//                 }
            
//                 // Generate the dynamic HTML content for the modal form
//                 var modalContent = `
//                     <form>
//                         <div class ="review" id ="review">
//                             <p>Ack:${lastAction}</p>
//                         </div>
//                         <div class="form-group">
//                             <label for="editCheckbox">Compliance</label>
//                             <select id="editCheckbox" class="form-control">
//                                 <option value="${complianceValue}" disabled selected>${complianceValue}</option>
//                                 <option value="NO" >NO</option>
//                                 <option value="YES">YES</option>
//                             </select>
//                         </div>
//                         <div id="additionalFields" style="display: none;">
//                             <div class="form-group">
//                                 <label for="inspectionDate">Date of Complaince</label>
//                                 <input type="date" id="inspectionDate" class="form-control">
//                             </div>
//                             <div class="form-group">
//                                 <label for="inspectionTime">Time of Complaince (12-hr format)</label>
//                                 <input type="time" id="inspectionTime" class="form-control">
//                             </div>
//                             <div class="form-group">
//                                 <label for="imageInput" >Uplaod Image</label>
//                                 <input class="form-control" type="file" name="imageInput" id= "imageInput" 
//                                accept="image/*" enctype = "multipart/form-data" >
//                              </div>   
//                             <div class="form-group">
//                                 <label for="actionTaken">Action Taken</label>
//                                 <textarea id="actionTaken" class="form-control" rows="7"></textarea>
//                             </div>
//                         </div>
//                     </form>
//                 `;


                
//                 // Open the SweetAlert2 modal with custom HTML content
//                 Swal.mixin({
//                     customClass: {
//                         confirmButton: 'btn btn-primary',
//                         cancelButton: 'btn btn-secondary',
//                         popup: 'my-custom-popup-class'
//                     },
//                     buttonsStyling: false
//                 }).fire({
//                     title: 'Complaince Form',
//                     html: modalContent,
//                     showCancelButton: true,
//                     showConfirmButton: true,
//                     allowOutsideClick: false,
//                     reverseButtons: true,
//                     focusConfirm: false,
//                     didOpen: () => {

//                         var minDate = dateValue;
//                         console.log(minDate);
//                         document.getElementById('inspectionDate').min = minDate;

//                         // Initialize the datepicker and disable past dates
//                         $('#inspectionDate').datepicker({
//                             minDate: minDate, // Set the minimum date
//                             dateFormat: 'yy-mm-dd' // Set the date format
//                         });
//                         document.getElementById('inspectionDate').addEventListener('click', function(event) {
//                             event.preventDefault();
//                         });
//                         if (rev === '') {
//                             document.getElementById('review').style.display = 'none';
//                         }
//                         else{
//                             var actionArrayParts = actionAttribute.split('|');
//                             var revParts = rev.split('|');

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
//                             // for (var i = 0; i < Math.max(actionArrayParts.length, revParts.length); i++) {
//                             //     var ack= revParts[i] ? revParts[i] : '';
//                             //     var comp = actionArrayParts[i] ? actionArrayParts[i] : '';

//                             //     combinedData.push({
//                             //         comp: comp,
//                             //         ack: ack
//                             //     });
//                             // }

//                             // Generate the HTML content for the review section
//                             var reviewContent = combinedData.map(data => `
//                                 <h5> <strong>Comp </strong>: ${data.comp}</h5>
//                                 <h5><strong>Ack</strong>: <span style="color: red;">${data.ack}</span></h5>
                                
//                             `).join('<br>');

//                             // Replace the review section content with generated content
//                             document.getElementById('review').innerHTML = reviewContent;
//                         }
//                         // } else {

//                         //     var combinedData = [];

//                         //     // Determine the maximum length for iteration
//                         //     var maxLength = Math.max(actionAttribute.length, rev.length);
                            
//                         //     // Loop through and extract data from both arrays
//                         //     for (var i = 0; i < maxLength; i++) {
//                         //         var actionParts = actionAttribute[i] ? actionAttribute[i].split('|') : [];
//                         //         var revParts = rev[i] ? rev[i].split('|') : [];
                                
//                         //         if (actionParts.length > 1 && revParts.length > 1) {
//                         //             combinedData.push([
//                         //                 actionParts[1],
//                         //                 revParts[1]
//                         //             ]);
//                         //         }
//                         //     }
//                         //     document.getElementById('review').innerHTML = constructDisplayContent(combinedData);
//                         //     // Display additional information in the review section
//                         // }   
//                         },
                    
//                     preConfirm: function() {
//                         var editedData = $('#editCheckbox').val();
//                         var indentifier  = complianceValue;
//                         var showAdditionalFields = $('#editCheckbox').val();
//                         var imageData = $('#imageInput').val();
//                         var additionalFieldData = {
//                             inspectionDate: null,
//                             inspectionTime: null,
//                             actionTaken: null,

                            
//                         };

        
//                         if (showAdditionalFields === 'YES') {
//                             additionalFieldData.inspectionDate = $('#inspectionDate').val();
//                             additionalFieldData.inspectionTime = $('#inspectionTime').val();
//                             additionalFieldData.actionTaken = $('#actionTaken').val();

//                         }


        
//                         // Send the edited data and additional field data to Node.js backend using Fetch API
//                         // var formData = {
//                         //     indentifier: serialNumberValue,
//                         //     editedData: editedData,
//                         //     imageData:imageData,
//                         //     additionalFieldData: additionalFieldData
//                         // }; 

//                         // return fetch('/updateData', {
//                         //     method: 'POST',
//                         //     headers: {
//                         //         'Content-Type': 'application/json'
//                         //     },
//                         //     body: JSON.stringify(formData)
//                         // })
                        
//                         var formData = new FormData();
//                         formData.append('indentifier', serialNumberValue);
//                         formData.append('editedData', editedData);
//                         formData.append('imageInput', document.getElementById('imageInput').files[0]); // Assuming only one image is being uploaded
//                         formData.append('additionalFieldData', JSON.stringify(additionalFieldData));
                        
//                         return fetch('/updateData', {
//                             method: 'POST',
//                             body: formData
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
//                                 if (showAdditionalFields === 'YES') {
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
//         var complainceOptionValue = document.getElementById('complianceDropdown').value;
//         const formData = {
//             selectOption: selectOptionValue,
//             optionDetails: optionDetailsValue,
//             stationName: stationNameValue,
//             complainceOption: complainceOptionValue
//         };

//         // Call refreshTableData with the form data after fetching data
//         refreshTableData(formData);
//     });
// });


$(document).ready(function() {
    var tryDateValue ;
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
function generateSubRows(rowData,defiData, complainceArray, srArray,acknowledgeArray,acknowledgeReviewArray,actionArray,defi_num,dateArray) {
    var subRows = '';

    for (var i = 0; i < defiData.length; i++) {
        var complianceColor;
        var disableButton;
        var a_r = '';
        var dateValue = dateArray[0];
        //var complianceColor = complainceArray[i] === 'NO' ? 'red' : 'green';
        //var disableButton = complainceArray[i] === 'YES' && acknowledgeArray[i] === 'Satisfied' ? 'disabled' : '';
        var complainceName = complainceArray[i] === 'YES' ? 'Complied':'Comply';
        if (complainceArray[i] === 'NO'){
            complianceColor = 'red'
        }
        else if (complainceArray[i] === 'YES' && acknowledgeArray[i] === 'Pending'){
            complianceColor ='orange'
            complainceName = 'Under ACK'

        }
        else if (complainceArray[i] === 'Under_Acknowledge' && acknowledgeArray[i] === 'Not Satisfied'){
            complianceColor ='#4F7942'
            complainceName = 'Re Comply'
            a_r = acknowledgeReviewArray[i]
        }
        else if(acknowledgeArray[i] === 'Satisfied'){
            complianceColor = 'green'
            disableButton = 'disabled'

        }
        else{
            complianceColor ='orange'
            complainceName = 'Under ACK'
        }

        let subrowData;
        if(defi_num[i] === '0'){
            subrowData = `${defiData[i]}`;
        }
        else{
            subrowData = `${defiData[i]} - ${defi_num[i]}`
        }
        

        subRows += `<div class="sub-row-content">
                        <span style="margin-right: 2px">${i + 1}) </span>
                        <span style="margin-right: 4px;  font-weight: bold;">${subrowData}</span>
                        <span><button class="btn-edit" data-sub-row="${i}" data-sr-attribute="${srArray[i]}" data-action-attribute ="${actionArray[i]}" data-date-attribute = "${dateValue}" data-other-attribute="${complainceArray[i]}" data-a-r="${a_r}" data-gear-attribute = "${rowData.Gear}" data-gearid-attribute = "${rowData.Gear_ID}" data-stncode-attribute = "${rowData.STN_code}" data-defival-attribute = "${defiData[i]}" style="border: none;  color:${complianceColor}; margin-right: 6px" ${disableButton}>${complainceName}</button></span>
                    </div>`;
    }
    return subRows;
}


function groupBy(array, key) {
    return array.reduce((result, obj) => {
        (result[obj[key]] = result[obj[key]] || []).push(obj);
        return result;
    }, {});
}

// Function to refresh table data
function refreshTableData(formData) {
    fetch('/updateSearch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        var tableData = [];
        const gearIdGroups = groupBy(data, 'Gear_ID');
        const gearIdLargestDates = {};
        for (const gearId in gearIdGroups) {
            const largestDate = Math.max(...gearIdGroups[gearId].map(rowData => new Date(rowData.Date_of_inspection)));
            gearIdLargestDates[gearId] = largestDate;
        }

        data.forEach(rowData => {
            var deficienciesArray = rowData.DEFICIENCIES.substring(1, rowData.DEFICIENCIES.length - 1).split(',');
            var defi_num = rowData.DEFI_NUM.substring(1, rowData.DEFI_NUM.length - 1).split(',');
            var complainceArray = rowData.Complaince.substring(1, rowData.Complaince.length - 1).split(',');
            var srArray = rowData.SR_NO.substring(1, rowData.SR_NO.length - 1).split(',');
            var acknowledgeArray = rowData.Acknowledgement.substring(1, rowData.Acknowledgement.length - 1).split(',');
            var acknowledgeReviewArray = rowData.Acknowledge_Review.substring(1, rowData.Acknowledge_Review.length - 1).split(',');
            var actionArray = rowData.Action_Taken.substring(1, rowData.Action_Taken.length - 1).split(','); 
            var dateArray = rowData.Date_of_inspection.split(',');
            
            

            // Trim and remove extra whitespace from array elements
            deficienciesArray = deficienciesArray.map(deficiency => deficiency.trim());
            defi_num =  defi_num.map(defi => defi.trim());
            complainceArray = complainceArray.map(complaince => complaince.trim());
            srArray = srArray.map(sr => sr.trim());
            acknowledgeArray =acknowledgeArray.map(acknowledge => acknowledge.trim());
            acknowledgeReviewArray =acknowledgeReviewArray.map(acknowledgeR => acknowledgeR.trim());
            actionArray = actionArray.map(action => action.trim());
            dateArray = dateArray.map(date => {
                const [year, month, day] = date.split('-');
                const correctedYear = year.length === 2 ? '20' + year : year;
                return `${correctedYear}-${month}-${day}`;
            });
            
            // Check if the date is less than the largest date for the Gear_ID
            const isDateLessThanLargest = new Date(rowData.Date_of_inspection) < gearIdLargestDates[rowData.Gear_ID];
            

            // Create a new row object with data from the server
            var row = {
                'Station Code': rowData.STN_code,
                'Gear': rowData.Gear,
                'Gear ID': rowData.Gear_ID,
                //'Date Of Inspection': rowData.Date_of_inspection,
                'Date Of Inspection': rowData.Date_of_inspection + (isDateLessThanLargest ? '<span style="color: red;">  R</span>' : ''),
                'Deficiency': generateSubRows(rowData,deficienciesArray, complainceArray, srArray,acknowledgeArray,acknowledgeReviewArray,actionArray,defi_num,dateArray)
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
    var complainceOptionValue = document.getElementById('complianceDropdown').value;
    const formData = {
        selectOption: selectOptionValue,
        optionDetails: optionDetailsValue,
        stationName: stationNameValue,
        complainceOption: complainceOptionValue
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
                var complianceValue = $(this).data('other-attribute');
                var dateValue = $(this).data('date-attribute');
                tryDateValue = dateValue;
                var serialNumberValue = $(this).data('sr-attribute');
                var actionAttribute = $(this).data('action-attribute');
                var stationNameValue = $(this).data('stncode-attribute');
                var gearValue = $(this).data('gear-attribute');
                var gearIdValue = $(this).data('gearid-attribute');
                var defiValue = $(this).data('defival-attribute');
                var rowData = column5Data[rowIndex];
                var rev = $(this).data('a-r');
                var lastAction;

                if (rev == "Not Satisfied"){
                    rev =''
                    lastAction = ''

                }
                else{
                    const historyParts = rev.split('|');
                    lastAction = historyParts[historyParts.length - 1];
                }
            
                // Generate the dynamic HTML content for the modal form
                // var modalContent = `
                //     <style>
                //     .my-custom-modal {
                //         width: 80%; 
                //         height: 80%; 
                //         font-size: 16px;

                //     }
                //     </style>
                //     <form>

                //         <div class ="stnDetails" id = "stnDetails" style = "margin:0 0 20 0; text-align: center;">
                //         <h4 > <strong>Station Code: </strong> <span style ="color:green"> ${stationNameValue} </span> </h4>
                //         <h4 >  <strong>Gear: </strong> <span style ="color:green">${gearValue} </span> <strong>, GearId: </strong> <span style ="color:green">${gearIdValue} </span></h4>
                //         <h4 > <strong>Deficiency: </strong> <span style ="color:green">${defiValue} </span></h4>
                //         </div>

                //         <div class ="review" id ="review">
                //             <p>Ack:${lastAction}</p>

                //         </div>
                //         <div class="row">
                //             <div class="col-md-3">
                //                 <div class="form-group">
                //                     <label for="editCheckbox">Compliance</label>
                //                     <select id="editCheckbox" class="form-control">
                //                         <option value="${complianceValue}" disabled selected>${complianceValue}</option>
                //                         <option value="NO">NO</option>
                //                         <option value="YES">YES</option>
                //                     </select>
                //                 </div>
                //             </div>
                //             <div id="additionalFields" class="col-md-3" style="display: none;">
                //                 <div class="col-md-3">
                //                     <div class="form-group">
                //                         <label for="inspectionDate">Date of Compliance</label>
                //                         <input type="date" id="inspectionDate" class="form-control">
                //                     </div>
                //                 </div>
                //                 <div class="col-md-3">
                //                     <div class="form-group">
                //                         <label for="inspectionTime">Time of Compliance (12-hr format)</label>
                //                         <input type="time" id="inspectionTime" class="form-control">
                //                     </div>
                //                 </div>
                //                 <div class="col-md-3">
                //                     <div class="form-group">
                //                         <label for="actionTaken">Action Taken</label>
                //                         <textarea id="actionTaken" class="form-control" rows="7"></textarea>
                //                     </div>
                //                 </div>
                //             </div>
                //         </div>
                    
                //     </form>
                // `;

                var modalContent = `<style>
                .my-custom-modal {
                    width: 80%; 
                    height: 80%; 
                    font-size: 16px;
                }
            </style>
            <form>
                <div class="stnDetails" id="stnDetails" style="margin:0 0 20px 0; text-align: center;">
                    <h4><strong>Station Code:</strong> <span style="color:green">${stationNameValue}</span></h4>
                    <h4><strong>Gear:</strong> <span style="color:green">${gearValue}</span>, <strong>GearId:</strong> <span style="color:green">${gearIdValue}</span></h4>
                    <h4><strong>Deficiency:</strong> <span style="color:green">${defiValue}</span></h4>
                </div>
                <div class="review" id="review">
                    <p>Ack:${lastAction}</p>
                </div>
                <div class="form-group row">
                    <div class="col-md-3">
                        <label for="editCheckbox">Compliance</label>
                        <select id="editCheckbox" class="form-control">
                            <option value="${complianceValue}" disabled selected>${complianceValue}</option>
                            <option value="NO">NO</option>
                            <option value="YES">YES</option>
                        </select>
                    </div>
                    <div id="additionalFields" class="col-md-9" style="display: none;">
                        <div class="form-group col-md-4">
                            <label for="inspectionDate">Date of Compliance</label>
                            <input type="date" id="inspectionDate" class="form-control inspectionDate">
                        </div>
                        <div class="form-group col-md-4">
                            <label for="inspectionTime">Time of Compliance(12-hr)</label>
                            <input type="time" id="inspectionTime" class="form-control">
                        </div>
                        <div class="form-group col-md-4">
                            <label for="actionTaken">Action Taken</label>
                            <textarea id="actionTaken" style="font-size: 12px;" class="form-control" rows="7"></textarea>
                        </div>
                    </div>
                </div>
            </form>
            `


                
                // Open the SweetAlert2 modal with custom HTML content
                Swal.mixin({
                    customClass: {
                        confirmButton: 'btn btn-primary',
                        cancelButton: 'btn btn-secondary',
                        popup:'my-custom-modal'
                        //popup: 'my-custom-popup-class'
                    },
                    buttonsStyling: false
                }).fire({
                    title: 'Complaince Form',
                    html: modalContent,
                    showCancelButton: true,
                    showConfirmButton: true,
                    allowOutsideClick: false,
                    reverseButtons: true,
                    focusConfirm: false,
                    didOpen: () => {

                        // var minDate = dateValue;
                        // $('.inspectionDate').prop('min', minDate);

                        // // Initialize the datepicker for all elements with the class 'inspectionDate'
                        // $('.inspectionDate').datepicker({
                        //     minDate: minDate,
                        //     dateFormat: 'yy-mm-dd' 
                        // });

                        // // Add event listener for click events on elements with the class 'inspectionDate'
                        // $('.inspectionDate').on('click', function(event) {
                        //     event.preventDefault();
                        // });
                        
                        var minDate = dateValue;
                        document.getElementById('inspectionDate').min = minDate;
                        console.log(tryDateValue);

                        // Initialize the datepicker and disable past dates
                        $('#inspectionDate').datepicker({
                            minDate: minDate,
                            dateFormat: 'yy-mm-dd' 
                        });

                        document.getElementById('inspectionDate').addEventListener('click', function(event) {
                            event.preventDefault();
                        });
                        // document.addEventListener('click', function(event) {
                        //     // Check if the clicked element has the class 'datepicker-icon'
                        //     if (event.target.classList.contains('icon')) {
                        //         // Handle the click event for the datepicker icon
                        //         var targetInput = event.target.previousElementSibling;
                        //         console.log(dateValue);
                        //         var minDate = targetInput.min;
                        //         console.log(minDate);
                
                        //         // Initialize the datepicker for the target input
                        //         $(targetInput).datepicker({
                        //             minDate: minDate,
                        //             dateFormat: 'yy-mm-dd' 
                        //         });
                                
                        //         // Prevent the default action for the click event
                        //         event.preventDefault();
                        //     }
                        // });
                    
                        if (rev === '') {
                            document.getElementById('review').style.display = 'none';
                        }
                        else{
                            var actionArrayParts = actionAttribute.split('|');
                            var revParts = rev.split('|');

                            // Create an empty array to store combined data
                            var combinedData = [];

                            // Iterate over the arrays and generate combined data
                            for (var i = 1; i < Math.max(actionArrayParts.length, revParts.length); i++) {
                                var ack = revParts[i] === 'Not Satisfied' ? '' : (revParts[i] || '');
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
                                <h5> <strong>Comp (${index + 1})</strong>: ${data.comp}</h5>
                                <h5><strong>Ack (${index + 1})</strong>: <span style="color: red;">${data.ack}</span></h5>  
                            `).join('<br>');

                            // Replace the review section content with generated content
                            document.getElementById('review').innerHTML = reviewContent;
                        }
 
                        },
                    
                    preConfirm: function() {
                        var editedData = $('#editCheckbox').val();
                        var showAdditionalFields 
                        if (editedData === null) {
                            editedData = 'NO';
                            showAdditionalFields  = 'NO';
                        }
                        else{
                            showAdditionalFields = $('#editCheckbox').val();
                        }
                        var indentifier  = complianceValue;
                        console.log(dateValue);
                        
                  
                        var additionalFieldData = {
                            inspectionDate: null,
                            inspectionTime: null,
                            actionTaken: null,

                            
                        };

        
                        if (showAdditionalFields === 'YES') {
                            additionalFieldData.inspectionDate = $('#inspectionDate').val();
                            additionalFieldData.inspectionTime = $('#inspectionTime').val();
                            additionalFieldData.actionTaken = $('#actionTaken').val();

                        }


        
                        // Send the edited data and additional field data to Node.js backend using Fetch API
                        var formData = {
                            indentifier: serialNumberValue,
                            editedData: editedData,
                            additionalFieldData: additionalFieldData
                        };        
                        return fetch('/updateData', {
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
                            }, 1000);
                        })
                        .catch(error => {
                            // Handle errors (if needed)
                            Swal.fire('Error', 'Failed to save data!', 'error');
                            setTimeout(() => {
                                Swal.close();
                            }, 3000);
                        });
                    }
                });
                
                $('#editCheckbox').on('change', function() {
                                var showAdditionalFields = $(this).val();
                                if (showAdditionalFields === 'YES') {
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
        var complainceOptionValue = document.getElementById('complianceDropdown').value;
        const formData = {
            selectOption: selectOptionValue,
            optionDetails: optionDetailsValue,
            stationName: stationNameValue,
            complainceOption: complainceOptionValue
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
        complainceOption: "ALL"
    };

    refreshTableData(formData);
    
});








