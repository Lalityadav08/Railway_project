$(document).ready(function () {
    var existingGearIDS;
    // By default, show the "inspectionForm1" and set "Deficiency Wise" button as active
    $("#deficiencyButton").addClass("btn-active");
    $("#gearForm").show();
    $("#DeficiencyForm").hide();
    $("#DeficiencyForm2").hide();

    // Handle click event for "Deficiency Wise" button
    $("#deficiencyButton").on("click", function () {
        $("#gearButton").removeClass("btn-active");
        $(this).addClass("btn-active");
        $("#gearForm").show();
        $("#DeficiencyForm").hide();
        $("#DeficiencyForm2").hide();
    });

    // Handle click event for "Gear Wise" button
    $("#gearButton").on("click", function () {
        $("#deficiencyButton").removeClass("btn-active");
        $(this).addClass("btn-active");
        $("#gearForm").hide();
        $("#DeficiencyForm").show();
        $("#DeficiencyForm2").hide();
    });

    $("#priorityDefi").on("click", function () {
        $("#deficiencyButton").removeClass("btn-active");
        $(this).addClass("btn-active");
        $("#gearForm").hide();
        $("#DeficiencyForm").hide();
        $("#DeficiencyForm2").show();

    });

    $('#gear_type').change(function () {
        var selectedGearType = $(this).val();
        if (selectedGearType === 'Point') {
            $('#pointTypeSelect').show();
            $('#trackTypeSelect').hide();
        } else if (selectedGearType === 'Track Circuit') {
            $('#pointTypeSelect').hide();
            $('#trackTypeSelect').show();
        } else {
            $('#pointTypeSelect').hide();
            $('#trackTypeSelect').hide();
        }
    });

    function validateGearId(input) {

        input = input.toUpperCase();
        // Regular expression to allow only alphanumeric characters and backward slashes
        var regex = /^[a-zA-Z0-9\/]+$/;
        // Check if the input matches the regex
        if (regex.test(input)) {
            return true; // Input is valid
        } else {
            return false; // Input is invalid
        }
    }

    function checkDropdownValues() {
        var stnName = $('#stationName').val();
        var gearType = $('#gear_type').val();
        var zone = $('#Zone').val();
        var type = $('#Type_Point').val() || $('#Type_Track').val();
        if (stnName && gearType && zone && type) {
            sendDataToBackend(stnName, gearType, zone, type);
        }
    }

    function sendDataToBackend(stnName, gearType, zone, type) {
        console.log(stnName, gearType, zone, type);
        $.ajax({
            url: '/existingGearID',
            method: 'POST',
            data: {
                stnName: stnName,
                gearType: gearType,
                zone: zone,
                type: type
            },
            success: function (response) {
                console.log('Data sent successfully');
                console.log(response.data);
                existingGearIDS = response.data
                updateNumberOfPoints(response.data.length, stnName, gearType, zone, type);
                displayGearIds(response.data);
            },
            error: function (xhr, status, error) {
                console.error('Error sending data to backend:', error);

            }
        });
    }

    // Function to update the number of points displayed
    function updateNumberOfPoints(length, stnName, gearType, zone, type) {
        // Construct the message to display
        //var message = 'No. of Points in ' + stnName + ' ' + gearType + ' ' + zone + ' ' + type + ': ' + length;
        var message = gearType + ' Type ' + type + ' in ' + stnName + ' on ' + zone + ' Zone '
        console.log(message);
        // Update the content of the h5 tag
        $('#numberOfPoints').text(message);
        
    }

    function displayGearIds(data) {
        var gearIdsList = '<table>'; // Start the table
        var maxLength = 0; // Initialize the maximum length of gear ID
        
        // Find the maximum length of gear ID
        data.forEach(function(item) {
            maxLength = Math.max(maxLength, item.Gear_ID.length);
        });
        
        var columnCount = 5; // Number of columns
        var rowCount = Math.ceil(data.length / columnCount); // Number of rows
        
        // Add each gear ID with appropriate spacing and numbering
        for (var i = 0; i < rowCount; i++) {
            gearIdsList += '<tr>'; // Start a new row
            for (var j = 0; j < columnCount; j++) {
                var index = i * columnCount + j;
                if (index < data.length) {
                    var item = data[index];
                    var spacing = ' '.repeat(maxLength - item.Gear_ID.length + 2); // Calculate spacing based on the maximum length
                    gearIdsList += '<td style="font-size: 16px; padding:5px 10px 5px 10px; font-weight: bold;">' + (index + 1) + '). ' + item.Gear_ID + spacing + '</td>'; // Add gear ID with spacing and numbering
                } else {
                    gearIdsList += '<td></td>'; // Empty cell for padding
                }
            }
            gearIdsList += '</tr>'; // End the row
        }
        
        gearIdsList += '</table>'; // End the table
    
        $('#gearIdList').html(gearIdsList); // Insert the gear IDs list into the DOM
    }
    


    $('#stationName, #gear_type, #Zone, #Type_Point, #Type_Track').change(function () {
        checkDropdownValues();
    });
    $(document).on('input', '.gearIdInput', function () {
        var input = $(this).val();
        input = input.toUpperCase();
        $(this).val(input); 
    });

    $(document).on('input', '.gearIdInput', function () {
        var input = $(this).val();
        var isValid = validateGearId(input);
        var bubble = $(this).siblings('.bubble-notification');
        if (!isValid) {
            $(this).val(input.replace(/\s/g, '').replace(/[^\w\/]/g, ''));
            //$(this).val(input.replace(/\s/g, '').replace(/[^\w\\]/g, ''));
            bubble.text('Gear ID should contain only alphanumeric characters and (/).').show();
            setTimeout(function() {
                bubble.hide();
            }, 3000);
        } else {
            
            bubble.hide();
        }
    });

    // Add gearId input fields dynamically
    $('.addGearId').click(function () {
        var numGearIds = parseInt($(this).text().substring(1)); // Extract the number from the button text
        var gearIdContainer = $('#gearIdContainer');

        // Calculate the starting index based on the existing number of input fields
        var startIndex = gearIdContainer.find('.form-group').length + 1;

        // Create a new row
        var row = $('<div class="form-row"></div>');

        // Generate new gearId input fields and append to the row
        for (var i = 0; i < numGearIds; i++) {
            var index = startIndex + i; // Calculate the index for the current GearID
            var gearIdInput = '<div class="form-group col-md-2">' +
                '<label for="gearId' + index + '" class="gearIdLabel">GEAR ID ' + index + '</label>' +
                '<input type="text" class="form-control gearIdInput" name="Gear_ID[]" >' +
                '<div class="bubble-notification" id="errorBubble' + index + '"></div>' +
                '</div>';
            row.append(gearIdInput);
        }

        // Append the row to the container
        gearIdContainer.append(row);
    });


    // Submit form
    $('#reviewButton').click(function () {
        $('#submitRow').show();
        //$(this).hide();
        // Get form data
        var stationName = $('#stationName').val();
        var gearType = $('#gear_type').val();
        var gearIds = $('input[name="Gear_ID[]"]').map(function () {
            return $(this).val();
        }).get();
        var zone = $('#Zone').val();
        var type = $('#Type_Point').val() || $('#Type_Track').val();
        


        var tableBody = $('#gearIdTable tbody');
        tableBody.empty();


        for (var i = 0; i < gearIds.length; i++) {
            var matched = false; // Initialize matched variable for each iteration

            // Check if the filled gear_id matches any in existingGearIDS
            for (var j = 0; j < existingGearIDS.length; j++) {
                if (existingGearIDS[j].Gear_ID.trim() === gearIds[i]) {
                    matched = true;
                    break; // Exit the loop as soon as a match is found
                }
            }

            // Construct the row HTML
            if (matched) {
                var row = '<tr >' +
                    '<td style="color: red;">' + (i + 1) + '</td>' +
                    '<td style="color: red;">' + stationName + '</td>' +
                    '<td style="color: red;">' + gearType + '</td>' +
                    '<td style="color: red;">' + gearIds[i] + '</td>' +
                    '<td style="color: red;">' + zone + '</td>' +
                    '<td style="color: red;">' + type + '</td>' +
                    '</tr>';
            }
            else {
                var row = '<tr>' +
                    '<td>' + (i + 1) + '</td>' +
                    '<td>' + stationName + '</td>' +
                    '<td>' + gearType + '</td>' +
                    '<td>' + gearIds[i] + '</td>' +
                    '<td>' + zone + '</td>' +
                    '<td>' + type + '</td>' +
                    '</tr>';
            }

            tableBody.append(row);
        }



        // Show the table and the submit button
        $('#gearIdTable').show();

    });

});




$(document).ready(function () {
    var deficiencyCount = 1;

    // Add more deficiency fields on clicking the '+' button
    $('#addDeficiency').click(function () {
        deficiencyCount++;
        var label = $('<label>').text('Deficiency (' + deficiencyCount + ')');
        var input = $('<input>').attr({
            type: 'text',
            class:'form-control deficiency-input',
            name: 'Deficiency[]'
        });
        var formGroup = $('<div>').addClass('form-group col-md-6').append(label).append(input);
        $('#deficiencyInputs').append(formGroup);
    });

    // Intercept form submission
    $('#DeficiencyForm').submit(function (e) {
        e.preventDefault(); // Prevent default form submission

        // Gather entered deficiencies
        var deficiencies = $('input[name="Deficiency[]"]').map(function () { return $(this).val(); }).get();

        // Display the entered deficiencies for confirmation
        var confirmationMessage = 'You are about to submit the following deficiencies:\n\n';
        for (var i = 0; i < deficiencies.length; i++) {
            confirmationMessage += (i + 1) + '. ' + deficiencies[i] + '\n';
        }

        // Confirm before submission
        if (confirm(confirmationMessage)) {
            // Submit the form if confirmed
            this.submit();
        }
    });
    $('#gear_type2').change(function () {
        $('.deficiency-input').parent('.form-group').remove(); // Clear all deficiency inputs
        deficiencyCount = 0; // Reset deficiency count
    });
});


$(document).ready(function () {
    var deficiencyCount = 1;

    // Add more deficiency fields on clicking the '+' button
    $('#addDeficiency2').click(function () {
        deficiencyCount++;
        var label = $('<label>').text('Deficiency (' + deficiencyCount + ')');
        var input = $('<input>').attr({
            type: 'text',
            class:'form-control deficiency-input',
            name: 'Deficiency[]'
        });
        var formGroup = $('<div>').addClass('form-group col-md-6').append(label).append(input);
        $('#deficiencyInputs2').append(formGroup);
    });

    // Intercept form submission
    $('#DeficiencyForm2').submit(function (e) {
        e.preventDefault(); // Prevent default form submission

        // Gather entered deficiencies
        var deficiencies = $('input[name="Deficiency[]"]').map(function () { return $(this).val(); }).get();

        // Display the entered deficiencies for confirmation
        var confirmationMessage = 'You are about to submit the following deficiencies:\n\n';
        for (var i = 0; i < deficiencies.length; i++) {
            confirmationMessage += (i + 1) + '. ' + deficiencies[i] + '\n';
        }

        // Confirm before submission
        if (confirm(confirmationMessage)) {
            // Submit the form if confirmed
            this.submit();
        }
    });
    $('#gear_type3').change(function () {
        $('.deficiency-input').parent('.form-group').remove(); // Clear all deficiency inputs
        deficiencyCount = 0; // Reset deficiency count
    });
});