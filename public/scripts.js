$(document).ready(function () {
  // By default, show the "inspectionForm1" and set "Deficiency Wise" button as active
  $("#deficiencyButton").addClass("btn-active");
  $("#inspectionForm1").show();
  $("#inspectionForm2").hide();

  // Handle click event for "Deficiency Wise" button
  $("#deficiencyButton").on("click", function () {
    $("#gearButton").removeClass("btn-active");
    $(this).addClass("btn-active");
    $("#inspectionForm1").show();
    $("#inspectionForm2").hide();
  });

  // Handle click event for "Gear Wise" button
  $("#gearButton").on("click", function () {
    $("#deficiencyButton").removeClass("btn-active");
    $(this).addClass("btn-active");
    $("#inspectionForm1").hide();
    $("#inspectionForm2").show();
  });

  $('#gear').change(function () {
    var selectedGearType = $(this).val();
    if (selectedGearType === 'Point') {
      $('#pointTypeSelect').show().prop('required', true);
      $('#trackTypeSelect').hide().prop('required', false);
    } else if (selectedGearType === 'Track Circuit') {
      $('#pointTypeSelect').hide().prop('required', false);
      $('#trackTypeSelect').hide().prop('required', false);
    } else {
      $('#pointTypeSelect').hide().prop('required', false);
      $('#trackTypeSelect').hide().prop('required', false);
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {

  const stationDropdown = document.getElementById('stationName');
  const gearDropdown = document.getElementById('gear');
  const zoneDropdown = document.getElementById('zone');
  //const typeDropdown = document.getElementById

  // Event listener for changes in the "Station Name" dropdown
  stationDropdown.addEventListener('change', function () {
    const selectedStation = this.value;
    $('#dateOfInspection').val('');
    if (gearDropdown.value) {
      const selectedGear = gearDropdown.value;
      const selectedZone = zoneDropdown.value;
      $('#Type_Point').val('');
      $('#Type_Track').val('');


      fetchGears(selectedStation);
      fetchZone(selectedStation, selectedGear);
      fetchGearIDsAfterTypeSelection();
      $('#pointTypeSelect').hide().prop('required', true);
      $('#trackTypeSelect').hide().prop('required', false);
      zoneDropdown.value = selectedZone;
    }
    else {
      fetchGears(selectedStation);
    }
  });

  // Event listener for changes in the "Gear" dropdown
  gearDropdown.addEventListener('change', function () {
    const selectedStation = stationDropdown.value;
    const selectedGear = this.value;
    const selectedZone = zoneDropdown.value;
    fetchZone(selectedStation, selectedGear);
    zoneDropdown.value = selectedZone;
    $('#dateOfInspection').val('');
    fetchDeficiencies(selectedGear);
    fetchGearIDsAfterTypeSelection();
  });

  zoneDropdown.addEventListener('change', function () {
    $('#dateOfInspection').val('');
    fetchGearIDsAfterTypeSelection();
  });

  $('#Type_Point, #Type_Track').change(function () {
    $('#dateOfInspection').val('');
    fetchGearIDsAfterTypeSelection();
  });

  $('#dateOfInspection').change(function () {
    fetchGearIDsAfterTypeSelection();
  });



  function fetchGearIDsAfterTypeSelection() {
    const selectedStation = $('#stationName').val();
    const selectedGear = $('#gear').val();
    const selectedZone = $('#zone').val();
    const selectedType = $('#Type_Point').is(':visible') ? $('#Type_Point').val() : $('#Type_Track').val();
    const selectedDate = $('#dateOfInspection').val();
    fetchGearIDs(selectedStation, selectedGear, selectedZone, selectedType, selectedDate);
    if (selectedStation && selectedGear && selectedZone && selectedType) {
      fetchLastEntryDetails(selectedStation, selectedGear, selectedType, selectedZone)
    }

    // if (selectedStation && selectedGear && selectedZone && selectedType && selectedDate) {
    //   fetchGearIDs(selectedStation, selectedGear, selectedZone, selectedType, selectedDate);
    // }

  }

  function clearGearIDsAndEntryPoints(loopEndpoint) {
    // Clear the gear ID values
    for (let i = 3; i <= loopEndpoint + 2; i++) {
      const gearIDField = document.getElementById(`gearID${i}`);
      gearIDField.value = '';
    }
    const entryPointField = document.getElementById(`entryPoint${i}`);
    entryPointField.value = '';
  }

  // Function to fetch gear options based on station name
  function fetchGears(stationName) {
    fetch(`/fetchGears/${stationName}`)
      .then(response => response.json())
      .then(data => {
        // Clear previous options
        gearDropdown.innerHTML = '<option value="" disabled selected>Select Gear</option>';
        data.forEach(gear => {
          const option = document.createElement('option');
          option.value = gear.Gear_type;
          option.textContent = gear.Gear_type;
          gearDropdown.appendChild(option);
        });
      })
      .catch(error => console.error('Error:', error));
  }
  // Function to fetch gear options based on station name
  function fetchZone(stationName, gearName) {
    fetch(`/fetchZone/${stationName}/${gearName}`)
      .then(response => response.json())
      .then(data => {
        // Clear previous options
        zoneDropdown.innerHTML = '<option value="" disabled selected>Select Zone</option>';
        data.forEach(Zone => {
          const option = document.createElement('option');
          option.value = Zone.Zone;
          option.textContent = Zone.Zone;
          zoneDropdown.appendChild(option);
        });
      })
      .catch(error => console.error('Error:', error));
  }

  function fetchGearIDs(stationName, gear, Zone, Type, date) {
    console.log(date);

    $.ajax({
      url: '/fetchGearIDs',
      method: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        stationName: stationName,
        gear: gear,
        Zone: Zone,
        Type: Type,
        date: date
      }),

      success: function (response) {
        const { gearIDs, responseData } = response;
        var gearIDArray = gearIDs.map(item => item.gear_ID);
        var loopEndpoint = Math.min(gearIDArray.length);
        newLoopEndPoint = loopEndpoint;
        // we can also add the gear_id avaliable to fill the details 
        //$('#point_value').html(loopEndpoint);
        $('#totalPoint').html(`Total ${responseData.Gear}: ${responseData.Results1Length}, `);
        $('#totalPoint').css('visibility', 'visible');

        // Display total gear length


        fetchUpdatedLoopContent(loopEndpoint)
          .then(() => {
            for (let i = 3; i <= loopEndpoint + 2; i++) {
              const gearIDField = $('#gearID' + i);
              gearIDField.val(gearIDArray[i - 3]);
              $(`#deficiencies${i}`).select2({
                closeOnSelect: false
              });
              fetchDeficiencies(gear, i);
              $(`#deficiencies${i}`).on('change', function () {
                showHideEntryFieldsForMultipleSets(i);
              });
            }
          })
          .catch(error => console.error('Error updating loop content:', error));
      },
      error: function (xhr, status, error) {
        console.error('Error fetching gear IDs:', error);
      }
    });
  }



  function fetchUpdatedLoopContent(loopEndpoint) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `/getUpdatedLoop?loopEndpoint=${loopEndpoint}`,
        method: 'GET',
        success: function (data) {
          $('#dynamicFieldsContainer').html(data);
          resolve(); // Resolve the promise when content is updated
        },
        error: function (error) {
          console.error('Error fetching updated loop content:', error);
          reject(error); // Reject the promise in case of an error
        }
      });
    });
  }


  function fetchDeficiencies(gear, i) {
    fetch(`/fetchDeficiencies/${gear}`)
      .then(response => response.json())
      .then(data => {
        const deficienciesSelect = $(`#deficiencies${i}`);

        // Get the current selected options before updating
        const selectedOptions = deficienciesSelect.val() || [];

        // Assuming data is an array of options with { value, label } properties
        deficienciesSelect.empty();
        data.forEach(option => {
          const optionElement = new Option(option.list, option.list, false, false);
          deficienciesSelect.append(optionElement);
        });

        deficienciesSelect.trigger('change');

      })
      .catch(error => console.error('Error:', error));

  }


  function fetchLastEntryDetails(stationName, gear, Type, Zone) {
    fetch(`/fetchlastEntryDetails/${stationName}/${gear}/${Type}/${Zone}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        document.getElementById("lastDayEntry").innerHTML = data.days;
        document.getElementById("lastDateEntry").innerHTML = data.date;
        const textColor = data.days >= 80 ? 'red' : 'green';
        document.getElementById("lastDayEntry").style.color = textColor;
        $(`#Days`).css('visibility', 'visible');

      })
      .catch(error => console.error('Error:', error));

  }



 
  $(document).ready(function () {
    $(`#deficiencies<%= i %>`).on('change', function () {
      showHideEntryFieldsForMultipleSets('<%= i %>');
    });
  });


  function showHideEntryFieldsForMultipleSets(setIndex) {
    var inputContainerSelector = "#inputContainer" + setIndex;
    var inputContainer = document.querySelector(inputContainerSelector);
  
    if (!inputContainer) {
      console.log("Input container not found: " + inputContainerSelector);
  

      inputContainer = document.createElement('div');
      inputContainer.id = "inputContainer" + setIndex;
      inputContainer.className = "form-group col-md-6 d-flex align-items-start flex-wrap";
      
      
      var deficienciesRow = document.querySelector("#deficiencies" + setIndex).closest('.form-row');
      deficienciesRow.appendChild(inputContainer);
    }
  
 
    inputContainer.innerHTML = '';
  
    var selectedOptions = document.querySelector("#deficiencies" + setIndex).selectedOptions;
    if (selectedOptions.length === 0) {
      console.log("No options selected.");
      return;
    }
  
   
    Array.from(selectedOptions).forEach(function (option) {
      var inputGroup = document.createElement('div');
      inputGroup.className = "input-group mb-3"; 
  
      var label = document.createElement('label');
      label.className = "mr-2";
      label.style.fontSize = '18px';
      label.style.marginRight = '10px'; 
      label.textContent = option.text;
  
      var textArea = document.createElement('textarea');
      textArea.className = "form-control";
      textArea.name =  `deficiencyInput_${setIndex}_${option.value}`;
      textArea.placeholder = "Enter details for " + option.text;
      textArea.rows = 1;
      textArea.style.fontSize = '16px'; 

  
      textArea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
      });
  
      inputGroup.appendChild(label);
      inputGroup.appendChild(textArea);
      inputContainer.appendChild(inputGroup);
    });

    console.log("Selected options: " + Array.from(selectedOptions).map(opt => opt.text).join(", "));
  }
  


});


