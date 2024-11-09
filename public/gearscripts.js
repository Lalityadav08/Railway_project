// JavaScript to handle sidebar expansion
const Zone = "NZ"
// NZ = NOZONE

function expandSidebar() {
  $(".main-menu").addClass("expanded");
}

function collapseSidebar() {
  $(".main-menu").removeClass("expanded");
}
$(document).ready(function() {

  $('#gear2').change(function () {
    var selectedGearType = $(this).val();
    if (selectedGearType === 'Point') {
      $('#pointTypeSelect2').show().prop('required', true);
      $('#trackTypeSelect2').hide().prop('required', false);
  } else if (selectedGearType === 'Track Circuit') {
      $('#pointTypeSelect2').hide().prop('required', false);
      $('#trackTypeSelect2').show().prop('required', true);
  } else {
      $('#pointTypeSelect2').hide().prop('required', false);
      $('#trackTypeSelect2').hide().prop('required', false);
  }
});

});



document.addEventListener('DOMContentLoaded', () => {
  // Elements

  
  const stationDropdown = document.getElementById('stationName2');
  const gearDropdown = document.getElementById('gear2');
  const gearIDDropdown = document.getElementById('gearID2');
  const deficienciesDropdown = document.getElementById('deficiencies2');
  $('#gearID2').select2();

  // Event listener for changes in the "Station Name" dropdown

  stationDropdown.addEventListener('change', function () {
    const selectedStation = this.value;
    fetchGears(selectedStation);
    $('#pointTypeSelect2').hide().prop('required', false);
    $('#trackTypeSelect2').hide().prop('required', false);
    // if (gearDropdown.value){
    //   const selectedGear = gearDropdown.value;
    //   fetchGears(selectedStation);
    //   $('#pointTypeSelect2').hide();
    //   $('#trackTypeSelect2').hide();
      
    // //   fetchGearIDs(selectedStation, selectedGear,Zone);
    // }
    // // Fetch gears based on the selected station
    // else{
    //   fetchGears(selectedStation
    //   $('#pointTypeSelect2').hide();
    //   $('#trackTypeSelect2').hide();
    // }
  });
  // stationDropdown.addEventListener('change', function () {
  //   const selectedStation = this.value;
  //   if (gearDropdown.value){
  //     const selectedGear = gearDropdown.value;
      
  //     fetchGearIDs(selectedStation, selectedGear,Zone);
  //     fetchLastEntryDetails(selectedStation, selectedGear, selectedGear);
  //   }
  //   // Fetch gears based on the selected station
  //   else{
  //     fetchGears(selectedStation);
  //   }
  // });

  // Event listener for changes in the "Gear" dropdown
  gearDropdown.addEventListener('change', function () {
    const selectedStation = stationDropdown.value;
    const selectedGear = this.value;
    // Fetch gear IDs based on the selected station and gear
    //fetchGearIDs(selectedStation, selectedGear,Zone);
    fetchLastEntryDetails(selectedStation, selectedGear, selectedGear);
    // Fetch deficiencies based on the selected gear
    fetchDeficiencies(selectedGear);

    
  });

  $('#Type_Point2, #Type_Track2').change(function () {
    fetchGearIDsAfterTypeSelection();
  });

  function fetchGearIDsAfterTypeSelection() {
    const selectedStation = $('#stationName2').val();
    const selectedGear = $('#gear2').val();
    const selectedZone = Zone;
    const selectedType = $('#Type_Point2').is(':visible') ? $('#Type_Point2').val() : $('#Type_Track2').val();
    fetchGearIDs(selectedStation, selectedGear, selectedZone, selectedType);
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

  // Function to fetch gearID options based on station name and gear
  function fetchGearIDs(stationName, gear,Zone,Type) {
    fetch(`/fetchGearIDs/${stationName}/${gear}/${Zone}/${Type}`)
      .then(response => response.json())
      .then(data => {
        const gearIDSelect = $('#gearID2');
        // Clear previous options
        gearIDSelect.empty()
        data.forEach(option => {
          const optionElement = new Option(option.gear_ID, option.gear_ID, false, false);
          gearIDSelect.append(optionElement);
        });
        gearIDSelect.trigger('change');
      })
      .catch(error => console.error('Error:', error));
  }

  // Function to fetch deficiencies options based on gear
  function fetchDeficiencies(gear) {
    fetch(`/fetchDeficiencies/${gear}`)
      .then(response => response.json())
      .then(data => {
        deficienciesDropdown.innerHTML = '';
        
        data.forEach(deficiency => {
          const option = document.createElement('option');
          option.value = deficiency.list;
          option.textContent = deficiency.list;
          deficienciesDropdown.appendChild(option);
          console.log(option);
        });
        
      })
      .catch(error => console.error('Error:', error));
  }

  function fetchLastEntryDetails(stationName, gear,gear) {
    fetch(`/fetchlastEntryDetails/${stationName}/${gear}/${gear}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        document.getElementById("lastDayEntry").innerHTML = data.days;
        document.getElementById("lastDateEntry").innerHTML = data.date;
        $(`#Days`).css('visibility', 'visible');

      })
      .catch(error => console.error('Error:', error));
  
}

  $("#deficiencies2").change(function() {
    showHideEntryFieldsForMultipleSets();
  });
  function showHideEntryFieldsForMultipleSets() {
    //  don't change the order for fileToHide  array
      var filedToHide = [
        'LOOSEPACKING_gear',
        'LHSPOUR_gear',
        'RHSPOUR_gear',
        'CHAIRPLATED_gear',
        'Guagewelding_gear',
        'Guagebracket_gear'
      ];
    
      var allConditions = [
        'stud bolt loose',
        'RH switch rail housing housing poor',
        //'L.H.S. housing poor',
        'R.H.S. housing poor',
        'Chair plated broken',
        'Guage tie plate bracket welding broken',
        'Guage tie plate bracket broken'
      ];
    
      for (var i = 0; i < filedToHide.length; i++) {
        $(`#${filedToHide[i]}`).css('visibility', 'hidden');
      }
      var selectedOptions = $(`#deficiencies2`).val();
    
      for (var i = 0; i < allConditions.length; i++) {
        var selectedCondition = allConditions[i];
        var conditionID = filedToHide[i];
        switch (selectedCondition) {
          case 'stud bolt loose':
          case 'RH switch rail housing housing poor':
          //case 'L.H.S. housing poor':
          case 'R.H.S. housing poor':
          case 'Chair plated broken':
          case 'Guage tie plate bracket welding broken':
          case 'Guage tie plate bracket broken':
            if (selectedOptions.includes(selectedCondition)) {
              $(`#${conditionID}`).css('visibility', 'visible').prop('disabled', false);
            } else {
              $(`#${conditionID}`).css('visibility', 'hidden').prop('disabled', true);
              $(`#${conditionID} input`).val(''); // Clear input value
            }
            break;
          default:
            break;
        }
      }
    }
});
