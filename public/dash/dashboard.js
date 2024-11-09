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
          optionDetails.innerHTML = '<option value="ALL">ALL</option>';
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
  document.addEventListener('DOMContentLoaded', () => {

    const defaultStationName = 'ALL STATION'; // replace with your default value
    const defaultGear = "ALL GEAR"; // replace with your default value
    const defaultselectedOption = "ALL";
    const defaultoptionDetails = "ALL"

    $.ajax({
        url: '/dashboard/data', 
        method: 'GET',
        data: { stationName: defaultStationName, gear: defaultGear , selectedOption: defaultselectedOption, optionDetails: defaultoptionDetails },
        dataType: 'json',
        success: function (data) {
            console.log(data);
            // Call a function to create the table with the fetched data
            createTable(data, defaultStationName, defaultGear,'tableContainer');
        },
        error: function (error) {
            console.error('Error fetching data:', error);
        }
    });
      $.ajax({
        url: '/dashboard/longdefidata', 
        method: 'GET',
        data: { stationName: defaultStationName, gear: defaultGear , selectedOption: defaultselectedOption, optionDetails: defaultoptionDetails },
        dataType: 'json',
        success: function (data) {
            console.log(data);
            createLongDefiDataTable(data, defaultStationName, defaultGear,'tableLongDefiData');
        },
        error: function (error) {
            console.error('Error fetching data:', error);
        }
    });
    $.ajax({
      url: '/repeated/data', 
      method: 'GET',
      data: { stationName: defaultStationName, gear: defaultGear , selectedOption: defaultselectedOption, optionDetails: defaultoptionDetails },
      dataType: 'json',
      success: function (data) {
        console.log(data);
        createRepeatedTable(data,defaultStationName, defaultGear,'tableRepeatedData');
      },
      error: function (error) {
        console.error('Error fetching data:', error);
      }
    });

    const gearDropdown = document.getElementById('gear');

  
// working code ....

    function createTable(data, stationName, gear, tableDetails) {
      const tableName = `#${tableDetails}`;
      const table = $('<table>');
      const thead = $('<thead>');
      const tbody = $('<tbody>');
      let srDenValues = new Set();

      const headerRow = $('<tr>');
      headerRow.append($('<th>').text('SR.NO'));
      headerRow.append($('<th>').text('DEFICIENCY'));
      

      if (data.selectedOption === 'STN_Code') {
        if (data.optionDetails === "DON'T ADD IN FILTERATION" || data.optionDetails === "ALL"){
          const stnValue = data.optionDetails
          headerRow.append($('<th>').text('ALL Stations'));
        }
        else{
          const stnValue = data.optionDetails
          headerRow.append($('<th>').text(stnValue));
        }
      }else if (data.selectedOption === 'AEN') {
        if (data.optionDetails === "DON'T ADD IN FILTERATION" || data.optionDetails === "ALL"){
          const aenValue = data.optionDetails
          headerRow.append($('<th>').text('ALL AEN'));
        }
        else{
          const aenValue = data.optionDetails
          headerRow.append($('<th>').text(aenValue));
        }
      }
      else {
        headerRow.append($('<th>').text('DLI DIVISION'));
        // Get the unique SR_DEN values from the data
         
        data.srDenResults.forEach(srDenItem => {
          srDenValues.add(srDenItem);
        });
        // Add headers for SR_DEN values
        srDenValues.forEach(srDenValue => {
          headerRow.append($('<th>').text(srDenValue));
        });
        
      }
      thead.append(headerRow);



      let serialNumber = 0; // Initialize serial number
      const totalRow = $('<tr>'); // Create a total row
      

      //  Add the total row
    // Add the total row
    totalRow.append($('<td>').text(serialNumber++)); // Add SR.NO cell
    totalRow.append($('<td>').text('Total')); // Add DEFICIENCY cell

    // Add DLI DIVISION cell with conditional formatting
    const totalDefiWithoutSR_DEN = data['Total_defi']['Without SR_DEN'];
    const totalCompiledDefiWithoutSR_DEN = data['Total_compiled_defi']['Without SR_DEN'];

    const dliDivisionHtml = totalDefiWithoutSR_DEN !== 0 || totalCompiledDefiWithoutSR_DEN !== 0 ?
        `<span style="color: green; font-weight: bold;">${totalCompiledDefiWithoutSR_DEN}</span>/<span style="color: red; font-weight: bold;">${totalDefiWithoutSR_DEN}</span>` :
        '0';

    const dliDivisionCell = $('<td>').html(dliDivisionHtml);
    totalRow.append(dliDivisionCell);

    // Apply inline styles to each cell in the total row
    totalRow.find('td').each(function() {
        $(this).css({
            //'color': 'green',
            'font-weight': 'bold',
            'background-color': '#dbe4eb' // Light shade of blue
        });
    });

    // Add empty cells for SR_DEN values
      if (data.selectedOption != 'STN_Code') {
        srDenValues.forEach(srDenValue => {
          const compiledCount = data['Total_compiled_defi'][srDenValue] || 0;
          const totalCount = data['Total_defi'][srDenValue] || 0;
          const cellHtml = compiledCount !== 0 || totalCount !== 0 ?
            `<span style="color: green; font-weight: bold;">${compiledCount}</span>/<span style="color: red; font-weight: bold;">${totalCount}</span>` :
            '0';
          const cell = $('<td>').html(cellHtml);

          // Apply inline styles to each td
          cell.css({
            'color': 'green',
            'font-weight': 'bold',
            'background-color': '#dbe4eb' // Light shade of blue
          });
          totalRow.append(cell);
        });
      }

      //Add total row
      totalRow.addClass('total-row');
      totalRow.attr('style', 'background-color: #dbe4eb !important');

      tbody.append(totalRow); // Append the total row to tbody

      // Loop through each item in 'Without SR_DEN'
      data['Without SR_DEN'].forEach(item => {
          const row = $('<tr>');

          // Add SR.NO cell
          row.append($('<td>').text(serialNumber++));

          // Create a plain text cell for the DEFICIENCY column
          row.append($('<td>').text(item.DEFICIENCY));

          // Create a hyperlink for the TOTAL_DEFICIENCY_COUNT column
          const totalDeficiencyCountLink = $('<a>')
              .html(`<span style="color: green;">${item.COMPLIED_DEFICIENCY_COUNT}</span>/<span style="color: red;">${item.TOTAL_DEFICIENCY_COUNT}</span>`)
              .attr('href', '#')
              .attr('data-stationName', stationName)
              .attr('data-gear', gear)
              .attr('data-columnName', 'DLI DIVISION')
              .attr('data-deficiencyName', item.DEFICIENCY)
              .addClass('custom-link');

          // Append the hyperlink to the <td>
          row.append($('<td>').append(totalDeficiencyCountLink));

          // Loop through SR_DEN values
        if (data.selectedOption != 'STN_Code') {
          srDenValues.forEach(srDenValue => {
            const srDenData = data[srDenValue];
            const deficiencyValue = item.DEFICIENCY;

            if (srDenData && deficiencyValue) {
              const matchingDeficiency = srDenData.find(srDenItem => srDenItem.DEFICIENCY === deficiencyValue);

              if (matchingDeficiency) {
                // Create a hyperlink for other columns
                const otherLink = $('<a>')
                  .html(`<span style="color: green;">${matchingDeficiency.COMPLIED_DEFICIENCY_COUNT || '0'}</span>/<span style="color: red;">${matchingDeficiency.TOTAL_DEFICIENCY_COUNT || '0'}</span>`)
                  .attr('href', '#')
                  .attr('data-stationName', stationName)
                  .attr('data-gear', gear)
                  .attr('data-columnName', srDenValue)
                  .attr('data-deficiencyName', deficiencyValue)
                  .addClass('custom-link');

                // Append the hyperlink to the <td>
                row.append($('<td>').append(otherLink));
              } else {
                row.append($('<td>').text('0'));
              }
            } else {
              row.append($('<td>').text('0'));
            }
          });
        }

          tbody.append(row);
      });

      table.append(thead);
      table.append(tbody);

      // Display the table inside the container
      $(tableName).html(table);
      $(document).ready(function() {
        $('a[data-columnName]').on('click', function(e) {
          e.preventDefault();
      
          const stationName = $(this).attr('data-stationName');
          const gear = $(this).attr('data-gear');
          const columnName = $(this).attr('data-columnName');
          const defValue = $(this).attr('data-deficiencyName');
          const tableName = $(this).closest('div').attr('id'); 


          if (tableName === 'tableContainer') {
      
          // Send the values to the backend using AJAX
          $.ajax({
            url: '/backend-endpoint',
            method: 'GET',
            data: {
              stationName: stationName,
              gear: gear,
              columnName: columnName,
              defi: defValue,
              tableName: 'mainDefi',
              selectedOption: data.selectedOption,
              optionDetails: data.optionDetails
            },
            dataType: 'json',
            success: function(response) {
              // Generate HTML content for the floating window
              var floatingWindowContent = generateFloatingWindowContent(response, defValue, columnName);
      
              // Create the floating window with dynamic title
              var floatingWindow = floatingWindowContent.dialog({
                title: defValue + '-' + columnName,
                modal: true,
                width: 'auto', // Adjust the width as per your requirement
                resizable: true,
                draggable: false,
                close: function() {
                  $(this).dialog('destroy').remove();
                }
              });
      
              // Adjust the close button to display the red cross mark
              $('.ui-dialog-titlebar-close').html('<span class="ui-icon ui-icon-closethick" style="color: red;"></span>');
      
              // Add context menu listener for right-click
              floatingWindowContent.on('contextmenu', function(event) {
                event.preventDefault();
                var contextMenu = $('<ul>').addClass('context-menu');
                var openInNewTab = $('<li>').text('Open in new tab').appendTo(contextMenu);
                contextMenu.css({
                  top: event.pageY + 'px',
                  left: event.pageX + 'px'
                }).appendTo('body').show();
      
                // Add click event listener for 'Open in new tab' option
                openInNewTab.on('click', function() {
                  // Generate HTML content for the new tab
                  var newTabContent = generateFloatingWindowContent(response, defValue, columnName).html();
      
                  // Create a data URL from the HTML content
                  var dataUrl = 'data:text/html;base64,' + btoa(newTabContent);
      
                  // Open new tab with the data URL
                  window.open(dataUrl, '_blank');
                });
      
                // Hide context menu when clicking outside
                $(document).on('click', function() {
                  contextMenu.hide();
                });
              });
      
            },
            error: function(error) {
              console.error('Error sending data to the backend:', error);
            }
          });
        }
        });
      });
      
      // Function to generate HTML content for the floating window
      function generateFloatingWindowContent(data, defValue, columnName) {
        // Create a new div for the floating window content
        var floatingWindowContent = $('<div>');
      
        // Apply the specified style to the table
        var customStyle = '<style>' +
        '.custom-table { ' +
        'border-collapse: separate;' +
        'border-spacing: 0px 1px;' +
        'background-color: #e8eef5;' +
        'width: 100%;' +
        '}' +
        '.custom-table tbody tr {' +
        'border-bottom: 2px solid #b5d4fd;' +
        '}' +
        '.custom-table tbody tr:nth-child(odd) {' +
        'background-color: #ffffff;' +
        '}' +
        '.custom-table tbody tr:nth-child(even) {' +
        'background-color: #ffffff;' +
        '}' +
        '.custom-table thead:after {' +
        'display: block;' +
        'height: 0px;' +
        'content: "";' +
        'border: none;' +
        '}' +
        '.custom-table th {' +
        'background-color: #dce0e6;' +
        'text-align: center;' +
        'font-size: 18px;' +
        '}' +
        '.custom-table th, .custom-table td {' +
        'padding: 0.8em;' +
        'border-right: 3px solid white;' +
        '}' +
        '.custom-table th:last-child, .custom-table td:last-child {' +
        'border: none;' +
        '}' +
        '.custom-table td {' +
        'background-color: #eff4f6;' +
        'font-size: 16px;' +
        '}' +
        '.table-container {' +
        'max-height: 400px;' +
        'overflow: auto;' +
        '}' +
        '.compliance-yes { color: green; }' +
        '.compliance-no { color: red; }' +
        '</style>';
      
        // Append the custom style to the floating window content
        floatingWindowContent.append(customStyle);
      
        // Generate a new table in the floating window content
        const table = $('<table>');
        table.addClass('custom-table');
      
        // Create a header row with column headings
        const headerRow = $('<tr>');
        headerRow.append($('<th>').text('Station Code'));
        headerRow.append($('<th>').text('GEAR'));
        headerRow.append($('<th>').text('GEAR ID'));
        headerRow.append($('<th>').text('SR DEN'));
        headerRow.append($('<th>').text('Compliance'));
        headerRow.append($('<th>').text('Date of Inspection'));
        headerRow.append($('<th>').text('DEFICIENCIES'));
        table.append(headerRow);

      
        // Build the table rows and cells from the response data
        $.each(data, function(index, item) {
          const row = $('<tr>');
          row.append($('<td>').text(item.STN_CODE));
          row.append($('<td>').text(item.GEAR));
          row.append($('<td>').text(item.GEAR_ID));
          row.append($('<td>').text(item.SR_DEN));
          row.append($('<td>').text(item.Complaince));
          if (item.Compliance === 'YES') {
            complianceCell.addClass('complaince-yes');
          } else if (item.Compliance === 'NO') {
            complianceCell.addClass('complaince-no');
          }
          row.append($('<td>').text(item.Date_of_inspection_date));
          row.append($('<td>').text(item.DEFICIENCIES));
          table.append(row);
        });
      
        // Append the table to the floating window content
        floatingWindowContent.append(table);
      
        return floatingWindowContent;
      }
      
    }

    function createLongDefiDataTable(data, stationName, gear, tableDetails) {
      const tableName = `#${tableDetails}`;
      const table = $('<table>');
      const thead = $('<thead>');
      const tbody = $('<tbody>');

      const headerRow = $('<tr>');
      headerRow.append($('<th>').text('SR.NO'));
      headerRow.append($('<th>').text('DEFICIENCY'));
      headerRow.append($('<th>').text('DLI DIVISION'));

      // Get the unique SR_DEN values from the data
      const srDenValues = new Set();
      data.srDenResults.forEach(srDenItem => {
          srDenValues.add(srDenItem);
      });

      // Add headers for SR_DEN values
      srDenValues.forEach(srDenValue => {
          headerRow.append($('<th>').text(srDenValue));
      });

      thead.append(headerRow);

      let serialNumber = 0; // Initialize serial number
      const totalRow = $('<tr>'); // Create a total row
      

      //  Add the total row
    // Add the total row
    totalRow.append($('<td>').text(serialNumber++)); // Add SR.NO cell
    totalRow.append($('<td>').text('Total')); // Add DEFICIENCY cell

    // Add DLI DIVISION cell with conditional formatting
    const totalDefiWithoutSR_DEN = data['Total_defi']['Without SR_DEN'];
    const totalCompiledDefiWithoutSR_DEN = data['Total_compiled_defi']['Without SR_DEN'];

    const dliDivisionHtml = totalDefiWithoutSR_DEN !== 0 || totalCompiledDefiWithoutSR_DEN !== 0 ?
        `<span style="color: green; font-weight: bold;">${totalCompiledDefiWithoutSR_DEN}</span>/<span style="color: red; font-weight: bold;">${totalDefiWithoutSR_DEN}</span>` :
        '0';

    const dliDivisionCell = $('<td>').html(dliDivisionHtml);
    totalRow.append(dliDivisionCell);

    // Apply inline styles to each cell in the total row
    totalRow.find('td').each(function() {
        $(this).css({
            //'color': 'green',
            'font-weight': 'bold',
            'background-color': '#dbe4eb' // Light shade of blue
        });
    });

    // Add empty cells for SR_DEN values
    srDenValues.forEach(srDenValue => {
        const compiledCount = data['Total_compiled_defi'][srDenValue] || 0;
        const totalCount = data['Total_defi'][srDenValue] || 0;
        const cellHtml = compiledCount !== 0 || totalCount !== 0 ?
            `<span style="color: green; font-weight: bold;">${compiledCount}</span>/<span style="color: red; font-weight: bold;">${totalCount}</span>` :
            '0';
        const cell = $('<td>').html(cellHtml);
        
        // Apply inline styles to each td
        cell.css({
            'color': 'green',
            'font-weight': 'bold',
            'background-color': '#dbe4eb' // Light shade of blue
        });
        totalRow.append(cell);
    });

      //Add total row
      totalRow.addClass('total-row');
      totalRow.attr('style', 'background-color: #dbe4eb !important');

      tbody.append(totalRow); // Append the total row to tbody

      // Loop through each item in 'Without SR_DEN'
      data['Without SR_DEN'].forEach(item => {
          const row = $('<tr>');

          // Add SR.NO cell
          row.append($('<td>').text(serialNumber++));

          // Create a plain text cell for the DEFICIENCY column
          row.append($('<td>').text(item.DEFICIENCY));

          // Create a hyperlink for the TOTAL_DEFICIENCY_COUNT column
          const totalDeficiencyCountLink = $('<a>')
              .html(`<span style="color: green;">${item.COMPLIED_DEFICIENCY_COUNT}</span>/<span style="color: red;">${item.TOTAL_DEFICIENCY_COUNT}</span>`)
              .attr('href', '#')
              .attr('data-stationName', stationName)
              .attr('data-gear', gear)
              .attr('data-columnName', 'DLI DIVISION')
              .attr('data-deficiencyName', item.DEFICIENCY)
              .addClass('custom-link');

          // Append the hyperlink to the <td>
          row.append($('<td>').append(totalDeficiencyCountLink));

          // Loop through SR_DEN values
          srDenValues.forEach(srDenValue => {
              const srDenData = data[srDenValue];
              const deficiencyValue = item.DEFICIENCY;

              if (srDenData && deficiencyValue) {
                  const matchingDeficiency = srDenData.find(srDenItem => srDenItem.DEFICIENCY === deficiencyValue);

                  if (matchingDeficiency) {
                      // Create a hyperlink for other columns
                      const otherLink = $('<a>')
                          .html(`<span style="color: green;">${matchingDeficiency.COMPLIED_DEFICIENCY_COUNT || '0'}</span>/<span style="color: red;">${matchingDeficiency.TOTAL_DEFICIENCY_COUNT || '0'}</span>`)
                          .attr('href', '#')
                          .attr('data-stationName', stationName)
                          .attr('data-gear', gear)
                          .attr('data-columnName', srDenValue)
                          .attr('data-deficiencyName', deficiencyValue)
                          .addClass('custom-link');

                      // Append the hyperlink to the <td>
                      row.append($('<td>').append(otherLink));
                  } else {
                      row.append($('<td>').text('0'));
                  }
              } else {
                  row.append($('<td>').text('0'));
              }
          });

          tbody.append(row);
      });

      table.append(thead);
      table.append(tbody);

      // Display the table inside the container
      $(tableName).html(table);
      $(document).ready(function() {
        $('a[data-columnName]').on('click', function(e) {
          e.preventDefault();
      
          const stationName = $(this).attr('data-stationName');
          const gear = $(this).attr('data-gear');
          const columnName = $(this).attr('data-columnName');
          const defValue = $(this).attr('data-deficiencyName');
          const tableName = $(this).closest('div').attr('id'); 
          if (tableName === 'tableLongDefiData') {
      
          // Send the values to the backend using AJAX
          $.ajax({
            url: '/backend-endpoint',
            method: 'GET',
            data: {
              stationName: stationName,
              gear: gear,
              columnName: columnName,
              defi: defValue,
              tableName: 'longDefi'
            },
            dataType: 'json',
            success: function(response) {
              // Generate HTML content for the floating window
              var floatingWindowContent = generateFloatingWindowContent(response, defValue, columnName);
      
              // Create the floating window with dynamic title
              var floatingWindow = floatingWindowContent.dialog({
                title: defValue + '-' + columnName,
                modal: true,
                width: 'auto', // Adjust the width as per your requirement
                resizable: true,
                draggable: false,
                close: function() {
                  $(this).dialog('destroy').remove();
                }
              });
      
              // Adjust the close button to display the red cross mark
              $('.ui-dialog-titlebar-close').html('<span class="ui-icon ui-icon-closethick" style="color: red;"></span>');
      
              // Add context menu listener for right-click
              floatingWindowContent.on('contextmenu', function(event) {
                event.preventDefault();
                var contextMenu = $('<ul>').addClass('context-menu');
                var openInNewTab = $('<li>').text('Open in new tab').appendTo(contextMenu);
                contextMenu.css({
                  top: event.pageY + 'px',
                  left: event.pageX + 'px'
                }).appendTo('body').show();
      
                // Add click event listener for 'Open in new tab' option
                openInNewTab.on('click', function() {
                  // Generate HTML content for the new tab
                  var newTabContent = generateFloatingWindowContent(response, defValue, columnName).html();
      
                  // Create a data URL from the HTML content
                  var dataUrl = 'data:text/html;base64,' + btoa(newTabContent);
      
                  // Open new tab with the data URL
                  window.open(dataUrl, '_blank');
                });
      
                // Hide context menu when clicking outside
                $(document).on('click', function() {
                  contextMenu.hide();
                });
              });
      
            },
            error: function(error) {
              console.error('Error sending data to the backend:', error);
            }
          });
        }
        });
      });
      
      // Function to generate HTML content for the floating window
      function generateFloatingWindowContent(data, defValue, columnName) {
        // Create a new div for the floating window content
        var floatingWindowContent = $('<div>');
      
        // Apply the specified style to the table
        var customStyle = '<style>' +
        '.custom-table { ' +
        'border-collapse: separate;' +
        'border-spacing: 0px 1px;' +
        'background-color: #e8eef5;' +
        'width: 100%;' +
        '}' +
        '.custom-table tbody tr {' +
        'border-bottom: 2px solid #b5d4fd;' +
        '}' +
        '.custom-table tbody tr:nth-child(odd) {' +
        'background-color: #ffffff;' +
        '}' +
        '.custom-table tbody tr:nth-child(even) {' +
        'background-color: #ffffff;' +
        '}' +
        '.custom-table thead:after {' +
        'display: block;' +
        'height: 0px;' +
        'content: "";' +
        'border: none;' +
        '}' +
        '.custom-table th {' +
        'background-color: #dce0e6;' +
        'text-align: center;' +
        'font-size: 18px;' +
        '}' +
        '.custom-table th, .custom-table td {' +
        'padding: 0.8em;' +
        'border-right: 3px solid white;' +
        '}' +
        '.custom-table th:last-child, .custom-table td:last-child {' +
        'border: none;' +
        '}' +
        '.custom-table td {' +
        'background-color: #eff4f6;' +
        'font-size: 16px;' +
        '}' +
        '.table-container {' +
        'max-height: 400px;' +
        'overflow: auto;' +
        '}' +
        '.compliance-yes { color: green; }' +
        '.compliance-no { color: red; }' +
        '</style>';
      
        // Append the custom style to the floating window content
        floatingWindowContent.append(customStyle);
      
        // Generate a new table in the floating window content
        const table = $('<table>');
        table.addClass('custom-table');
      
        // Create a header row with column headings
        const headerRow = $('<tr>');
        headerRow.append($('<th>').text('Station Code'));
        headerRow.append($('<th>').text('GEAR'));
        headerRow.append($('<th>').text('GEAR ID'));
        headerRow.append($('<th>').text('SR DEN'));
        headerRow.append($('<th>').text('Compliance'));
        headerRow.append($('<th>').text('Date of Inspection'));
        headerRow.append($('<th>').text('DEFICIENCIES'));
        table.append(headerRow);
      
        // Build the table rows and cells from the response data
        $.each(data, function(index, item) {
          const row = $('<tr>');
          row.append($('<td>').text(item.STN_CODE));
          row.append($('<td>').text(item.GEAR));
          row.append($('<td>').text(item.GEAR_ID));
          row.append($('<td>').text(item.SR_DEN));
          row.append($('<td>').text(item.Complaince));
          if (item.Compliance === 'YES') {
            complianceCell.addClass('complaince-yes');
          } else if (item.Compliance === 'NO') {
            complianceCell.addClass('complaince-no');
          }
          row.append($('<td>').text(item.Date_of_inspection_date));
          row.append($('<td>').text(item.DEFICIENCIES));
          table.append(row);
        });
      
        // Append the table to the floating window content
        floatingWindowContent.append(table);
      
        return floatingWindowContent;
      }
      
    }

    function fetchData() {
      const gear = $('#gear').val();
      const selectedOption = $('#selectOption').val() || "Don't Add in Filteration";
      console.log("22222",selectedOption)
      const optionDetails = $('#optionDetails1').is(':visible') ? $('#optionDetails').val() : "DON'T ADD IN FILTERATION";
      const stationName = $('#stationName1').is(':visible') ? $('#stationName').val() : "DON'T ADD IN FILTERATION";
  
      $.ajax({
        url: '/dashboard/data',
        method: 'GET',
        data: { stationName: stationName, gear: gear, selectedOption: selectedOption, optionDetails: optionDetails },
        dataType: 'json',
        success: function(data) {
          console.log(data);
          createTable(data, stationName, gear, 'tableContainer');
        },
        error: function(error) {
          console.error('Error fetching data:', error);
        }
      });
  
      // $.ajax({
      //   url: '/dashboard/longdefidata',
      //   method: 'GET',
      //   data: { stationName: stationName, gear: gear, selectedOption: selectedOption, optionDetails: optionDetails },
      //   dataType: 'json',
      //   success: function(data) {
      //     console.log(data);
      //     createLongDefiDataTable(data, stationName, gear, 'tableLongDefiData');
      //   },
      //   error: function(error) {
      //     console.error('Error fetching data:', error);
      //   }
      // });
  
      // $.ajax({
      //   url: '/repeated/data',
      //   method: 'GET',
      //   data: { stationName: stationName, gear: gear, selectedOption: selectedOption, optionDetails: optionDetails },
      //   dataType: 'json',
      //   success: function(data) {
      //     console.log(data);
      //     createTable(data, stationName, gear, 'tableRepeatedData');
      //   },
      //   error: function(error) {
      //     console.error('Error fetching data:', error);
      //   }
      // });
    }
  
    // Bind the fetchData function to the change event of all relevant dropdowns
    $('#gear, #selectOption, #optionDetails, #stationName').change(fetchData);

});
    
    
  
  
  