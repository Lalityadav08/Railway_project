$(document).ready(function() {
    // Initially hide dropdowns 2 and 3
    $("#optionDetails1").hide();
    
    // Show/hide dropdown 3 based on the selected option in dropdown 2
    $("#selectOption").change(function() {
        var selectedOption = $(this).val();
        $("#optionDetails1").show();
        fetchOptionName(selectedOption);
        
    });

    // function fetchStationName(option,optionDetails) {
    //     fetch(`/fetchStationName/${option}/${optionDetails}`)
    //       .then(response => response.json())
    //       .then(data => {
    //         // Clear previous options
    //         stationName.innerHTML = '<option value="" disabled selected>Select Station</option>';
    //         data.forEach(station => {
    //           const option = document.createElement('option');
    //           option.value = station;
    //           option.textContent = station;
    //           stationName.appendChild(option);
    //         });
    
    //       })
    //       .catch(error => console.error('Error:', error));
    //   }

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

function chartData(formData) {
    fetch('/analysisData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Data from the server
        const chartData = data[0];
        const total = chartData.TOTAL;

        // Get the canvas context
        const ctx = document.getElementById('myPieChart').getContext('2d');

        // Create the pie chart with tooltips and custom content
        const myPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Complied', 'Under Acknowledgement', 'Not Complied'],
                datasets: [{
                    data: [chartData.Complied, chartData.Under_Acknowledgement, chartData.Not_Complied],
                    backgroundColor: ['green', 'yellow', 'red'],
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                plugins: {
                    // legend: {
                    //     display: false // Hide default legend
                    // },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const percentage = ((value / total) * 100).toFixed(2);
                                return `Value: ${value} ( ${percentage}% )`;
                            }
                        }
                    }
                }
            }
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

function chartDataNew(formData) {
    fetch('/analysisData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        drawInitialPieChart(data);
        drawCategoryPieCharts(data);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

function filterDataByCategory(data, category) {
    return data.filter(item => item.Category === category);
}

function drawInitialPieChart(data) {
    
    const overallData = filterDataByCategory(data, 'Overall')[0];
    const total = overallData.TOTAL;
    console.log(overallData);
    const heading = $('#optionDetails').val();
    $('.heading').text(heading);
    $('.not-complied').text(overallData.Not_Complied);
    $('.under-acknowledgement').text(overallData.Under_Acknowledgement);
    $('.complied').text(overallData.Complied);
    $('.total').text(overallData.TOTAL);

    $('.data-details').show();

    const ctx = document.getElementById('overallPieChart').getContext('2d');
    const overallPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Complied', 'Under Acknowledgement', 'Not Complied'],
            datasets: [{
                data: [overallData.Complied, overallData.Under_Acknowledgement, overallData.Not_Complied],
                backgroundColor: ['green', 'yellow', 'red'],
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display:'top'
                },
                title: {
                    display: true,
                    text: `${overallData.Category}`
                  },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const percentage = ((value / total) * 100).toFixed(2);
                            return `Value: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// function drawCategoryPieCharts(data) {
//     const categories = data.filter(item => item.Category !== 'Overall');
//     console.log(categories);

//     const maxChartsPerRow = 3;
//     for (let i = 0; i < categories.length; i += maxChartsPerRow) {
//         const rowCategories = categories.slice(i, i + maxChartsPerRow);

//         const rowContainer = document.createElement('div');
//         rowContainer.classList.add('chart-container');
//         rowContainer.setAttribute('id',`overallChartContainer${i}`)


//         for (const category of rowCategories) {
//             const categoryData = filterDataByCategory(data, category.Category);

//             const categoryChartContainer = document.createElement('div');
//             categoryChartContainer.classList.add('chart-container');

//             const categoryCanvas = document.createElement('canvas');
//             categoryCanvas.width = 400;
//             categoryCanvas.height = 400;
//             categoryCanvas.classList.add('category-pie-chart');
//             categoryCanvas.setAttribute('id',`overallPieChart${i}`)

//             categoryChartContainer.appendChild(categoryCanvas);
//             rowContainer.appendChild(categoryChartContainer);

//             const colContainer = document.createElement('div');
//             colContainer.classList.add('col-md-4');

//             const dataDetailsDiv = document.createElement('div');
//             dataDetailsDiv.classList.add('data-details');
//             dataDetailsDiv.style.display = 'none';
//             dataDetailsDiv.style.marginTop = '20rem';
//             dataDetailsDiv.innerHTML = `
//                 <p>
//                 <span class="heading" style="margin-right: 20px;">AEN(${categoryData[0].AEN})</span>
//                 (<span class="not-complied">${categoryData[0].Not_Complied}</span> /
//                 <span class="under-acknowledgement">${categoryData[0].Under_Acknowledgement}</span> /
//                 <span class="complied">${categoryData[0].Complied}</span>) 
//                 <span class="total">${categoryData[0].TOTAL}</span>
//                 </p>
//             `;
//             categoryChartContainer.appendChild(dataDetailsDiv);

//       // Show the data details div after updating its content
//             $(dataDetailsDiv).show();

//             const ctx = categoryCanvas.getContext('2d');
//             //const ctx1 = document.getElementById(`overallPieChart${i}`).getContext('2d');
//             const categoryPieChart = new Chart(ctx, {
//                 type: 'pie',
//                 data: {
//                     labels: ['Complied', 'Under Acknowledgement', 'Not Complied'],
//                     datasets: [{
//                         data: [categoryData[i].Complied, categoryData[i].Under_Acknowledgement, categoryData[i].Not_Complied],
//                         backgroundColor: ['green', 'yellow', 'red'],
//                     }]
//                 },
//                 options: {
//                     responsive: false,
//                     maintainAspectRatio: false,
//                     plugins: {
//                         legend: {
//                             display:'top'
//                         },
//                         title: {
//                             display: true,
//                             text: `${categoryData[0].Category}`
//                           },
//                         tooltip : {
//                             callbacks:{
//                                 label: function(context) {
//                                     const value = context.parsed;
//                                     const total = categoryData[0].TOTAL;
//                                     const percentage = ((value / total) * 100).toFixed(2);
//                                     return `Value: ${value} (${percentage}%)`;
//                                 }
//                             }
//                         }
//                 }
//             }
        
//         });
//         rowContainer.appendChild(colContainer);
//     }

//     document.querySelector('#overallChartContainer').appendChild(rowContainer);
//   }
// }

function drawCategoryPieCharts(data) {
    const categories = data.filter(item => item.Category !== 'Overall');
  
    const maxChartsPerRow = 3;
    for (let i = 0; i < categories.length; i += maxChartsPerRow) {
      const rowCategories = categories.slice(i, i + maxChartsPerRow);
  
      const rowContainer = document.createElement('div');
      rowContainer.classList.add('chart-row');
  
      for (const category of rowCategories) {
        const categoryData = filterDataByCategory(data, category.Category);
  
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');
  
        const dataDetailsDiv = document.createElement('div');
        dataDetailsDiv.classList.add('data-details');
        dataDetailsDiv.style.display = 'none';
        dataDetailsDiv.innerHTML = `
          <p class="data-details-text">
            <span class="heading" style="margin-right: 20px;">AEN(${categoryData[0].AEN})</span>
            (<span class="not-complied">${categoryData[0].Not_Complied}</span> /
            <span class="under-acknowledgement">${categoryData[0].Under_Acknowledgement}</span> /
            <span class="complied">${categoryData[0].Complied}</span>) 
            <span class="total">${categoryData[0].TOTAL}</span>
          </p>
        `;
        categoryContainer.appendChild(dataDetailsDiv);
  
        const categoryChartContainer = document.createElement('div');
        categoryChartContainer.classList.add('chart-container');
  
        const categoryCanvas = document.createElement('canvas');
        categoryCanvas.width = 400;
        categoryCanvas.height = 400;
        categoryCanvas.classList.add('category-pie-chart');
        categoryCanvas.setAttribute('id', `categoryPieChart${i}`);
  
        categoryChartContainer.appendChild(categoryCanvas);
        categoryContainer.appendChild(categoryChartContainer);
  
        rowContainer.appendChild(categoryContainer);
  
        // Create chart and show data details
        const ctx = categoryCanvas.getContext('2d');
        const categoryPieChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Complied', 'Under Acknowledgement', 'Not Complied'],
            datasets: [{
              data: [categoryData[0].Complied, categoryData[0].Under_Acknowledgement, categoryData[0].Not_Complied],
              backgroundColor: ['green', 'yellow', 'red'],
            }]
          },
          options: {
            responsive: false,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: 'top'
              },
              title: {
                display: true,
                text: `${categoryData[0].Category}`
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const value = context.parsed;
                    const total = categoryData[0].TOTAL;
                    const percentage = ((value / total) * 100).toFixed(2);
                    return `Value: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });
  
        // Show the data details div after updating its content
        dataDetailsDiv.style.display = 'block';
      }
  
      document.querySelector('#overallChartContainer').appendChild(rowContainer);
    }
  }
  
  




// Define the variables
var table;
var column5Data = ['', '', '', '', ''];
var commonData;

// Function to generate sub-rows
function generateSubRows(rowData, complainceArray, srArray,acknowledgeArray,acknowledgeReviewArray) {
    var subRows = '';

    for (var i = 0; i < rowData.length; i++) {
        var complianceColor;
        var disableButton;
        var a_r = '';
        //var complianceColor = complainceArray[i] === 'NO' ? 'red' : 'green';
        //var disableButton = complainceArray[i] === 'YES' && acknowledgeArray[i] === 'Satisfied' ? 'disabled' : '';
        var complainceName = complainceArray[i] === 'YES' ? 'Complied':'Comply';
        if (complainceArray[i] === 'NO'){
            complianceColor = 'red'
        }
        else if (complainceArray[i] === 'YES' && acknowledgeArray[i] === 'Pending'){
            complianceColor ='orange'

        }
        else if (complainceArray[i] === 'YES' && acknowledgeArray[i] === 'Not Satisfied'){
            complianceColor ='red'
            a_r = acknowledgeReviewArray[i]
        }
        else {
            complianceColor = 'green'
            disableButton = 'disabled'

        }

        subRows += `<div class="sub-row-content">
                        <span style="margin-right: 2px">${i + 1}) </span>
                        <span style="margin-right: 4px;  font-weight: bold;">${defi_num[i]}-${rowData[i]}</span>
                        <span><button class="btn-edit" data-sub-row="${i}" data-sr-attribute="${srArray[i]}" data-other-attribute="${complainceArray[i]}" data-a-r="${a_r}" style="border: none;  color:${complianceColor}; margin-right: 6px" ${disableButton}>${complainceName}</button></span>
                    </div>`;
    }
    return subRows;
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

        data.forEach(rowData => {
            var deficienciesArray = rowData.DEFICIENCIES.substring(1, rowData.DEFICIENCIES.length - 1).split(',');
            var defi_num = rowData.DEFI_NUM.substring(1, rowData.DEFI_NUM.length - 1).split(',');
            var complainceArray = rowData.Complaince.substring(1, rowData.Complaince.length - 1).split(',');
            var srArray = rowData.SR_NO.substring(1, rowData.SR_NO.length - 1).split(',');
            var acknowledgeArray = rowData.Acknowledgement.substring(1, rowData.Acknowledgement.length - 1).split(',');
            var acknowledgeReviewArray = rowData.Acknowledge_Review.substring(1, rowData.Acknowledge_Review.length - 1).split(',');

            // Trim and remove extra whitespace from array elements
            deficienciesArray = deficienciesArray.map(deficiency => deficiency.trim());
            defi_num =  defi_num.map(defi => defi.trim());
            complainceArray = complainceArray.map(complaince => complaince.trim());
            srArray = srArray.map(sr => sr.trim());
            acknowledgeArray =acknowledgeArray.map(acknowledge => acknowledge.trim());
            acknowledgeReviewArray =acknowledgeArray.map(acknowledgeR => acknowledgeR.trim());
            // Create a new row object with data from the server
            var row = {
                // 'Station Code': rowData.STN_code,
                'Gear': rowData.Gear,
                'Gear ID': rowData.Gear_ID,
                'Date Of Inspection': rowData.Date_of_inspection,
                'Deficiency': generateSubRows(deficienciesArray, complainceArray, srArray,acknowledgeArray,acknowledgeReviewArray,defi_num)
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
            // 'Station Code': '',
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
            // { data: 'Station Code', width: '15%' },
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
                var serialNumberValue = $(this).data('sr-attribute');
                var rowData = column5Data[rowIndex];
                var rev = $(this).data('a-r');

                var modalContent = `
                    <form>

                        <div class ="review" id ="review" style="display: none;">
                            <p>${rev}
                        </div>
                        <div class="form-group">
                            <label for="editCheckbox">Compliance</label>
                            <select id="editCheckbox" class="form-control">
                                <option value="${complianceValue}" disabled selected>${complianceValue}</option>
                                <option value="NO" >NO</option>
                                <option value="YES">YES</option>
                            </select>
                        </div>
                        <div id="additionalFields" style="display: none;">
                            <div class="form-group">
                                <label for="inspectionDate">Date of Complaince</label>
                                <input type="date" id="inspectionDate" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="inspectionTime">Time of Complaince (12-hr format)</label>
                                <input type="time" id="inspectionTime" class="form-control">
                            </div>
                            <div class="form-group">
                                <label for="actionTaken">Action Taken</label>
                                <textarea id="actionTaken" class="form-control" rows="7"></textarea>
                            </div>
                        </div>
                    </form>
                `;
        
                // Open the SweetAlert2 modal with custom HTML content
                Swal.mixin({
                    customClass: {
                        confirmButton: 'btn btn-primary',
                        cancelButton: 'btn btn-secondary'
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
                    preConfirm: function() {
                        var editedData = $('#editCheckbox').val();
                        var indentifier  = complianceValue;
                        var showAdditionalFields = $('#editCheckbox').val();
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

                        if(rev != ''){
                            $('#review').show();
                        }else{
                            $('#review').hide();
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
                        })
                        .catch(error => {
                            // Handle errors (if needed)
                            Swal.fire('Error', 'Failed to save data!', 'error');
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
        event.preventDefault(); 
        var selectOptionValue = document.getElementById('selectOption').value;
        var optionDetailsValue = document.getElementById('optionDetails').value;
        const formData = {
            selectOption: selectOptionValue,
            optionDetails: optionDetailsValue,
        };
        chartDataNew(formData);
    });
});




