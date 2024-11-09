$(document).ready(function () {
  let updateButtonData = {
    deficiencies: '',
    srNo: '',
    updatedDescriptions: []
  };


  let isPopulatingForm = false;


  $('#Deficiencies').on('change', function () {
    if (isPopulatingForm) return;

    const selectedOptions = $(this).val() || [];
    const existingDeficiencies = [];

    // Track existing deficiencies in the DOM
    $('#description-container .textarea-group').each(function () {
      existingDeficiencies.push($(this).data('deficiency'));
    });

    // Add new textareas for selected deficiencies that are not already in the DOM
    selectedOptions.forEach(option => {
      if (!existingDeficiencies.includes(option)) {
        const textareaHTML = `
          <div class="form-group textarea-group" data-deficiency="${option.trim()}">
            <label>${option.trim()}:</label>
            <textarea class="form-control deficiency-description" data-deficiency="${option.trim()}"></textarea>
          </div>
        `;
        $('#description-container').append(textareaHTML);
      }
    });
    populateTextareas();

    // Remove textareas for deficiencies that have been deselected
    existingDeficiencies.forEach(deficiency => {
      if (!selectedOptions.includes(deficiency)) {
        $(`#description-container .textarea-group[data-deficiency="${deficiency}"]`).remove();
      }
    });
   
  });

  function populateTextareas() {
    // Iterate through each updated description
    updateButtonData.updatedDescriptions.forEach(descriptionData => {
      const { deficiency, description } = descriptionData;
      // Find the textarea corresponding to the deficiency
      const textarea = $(`#description-container .textarea-group[data-deficiency="${deficiency}"] textarea`);
      if (textarea.length) {
        textarea.val(description);  // Set the value of the textarea
      }
    });
  }

  function populateUpdateForm(stationName, gear, gearID, date, Type, deficiencies, defi_nums) {
    isPopulatingForm = false;

    $('#station-name').val(stationName);
    $('#gear').val(gear);
    $('#Type').val(Type);
    $('#gear-id').val(gearID);
    $('#date-of-deficiency').val(date);

    // Clear previous text areas
    // $('#description-container').empty();

    // Parse the deficiencies and descriptions
    const deficienciesArray = deficiencies.split(',');
    const defiNumsArray = defi_nums.split(',');

    // Initialize updateButtonData with the current descriptions
    updateButtonData = {
      deficiencies: deficiencies,
      srNo: updateButtonData.srNo, // keep the existing srNo
      updatedDescriptions: [] // array for storing descriptions
    };



    deficienciesArray.forEach((deficiency, index) => {
      deficiency = deficiency.replace(/^"|"$/g, '').trim();
      const description = defiNumsArray[index] ? defiNumsArray[index].trim() : '';
      const sanitizedDeficiency = deficiency.replace(/[^a-zA-Z0-9]/g, '-');
      updateButtonData.updatedDescriptions.push({ deficiency: deficiency, description: description });
      // const textareaHTML = `
      //       <div class="form-group textarea-group" data-deficiency="${deficiency}">
      //           <label>${deficiency}:</label>
      //           <textarea id="textarea-${sanitizedDeficiency}" class="form-control deficiency-description" data-deficiency="${deficiency}" data-index="${index}">${description}</textarea>
      //       </div>
      //   `;
      // $('#description-container').append(textareaHTML);
    });
    // isPopulatingForm = false; 
    
  }

  // Button to toggle the update form
  $('#data-table tbody').on('click', '.btn-edit', function () {
    const stationName = $(this).attr('data-station-attribute');
    const gear = $(this).attr('data-Gear-attribute');
    const Type = $(this).attr('data-Type-attribute');
    const gearID = $(this).attr('data-GearId-attribute');
    const date = $(this).attr('data-date-attribute');
    const deficiencies = $(this).attr('data-defi-attribute');
    let defiNums = $(this).attr('data-description-attribute');
    const serialNumbers = $(this).attr('data-serial-attribute');

    if (defiNums) {
      defiNums = defiNums.replace(/^"|"$/g, '');
    }

    updateButtonData = {
      deficiencies: deficiencies,
      srNo: serialNumbers
    };
    Deficiencies(gear, deficiencies);

    populateUpdateForm(stationName, gear, gearID, date, Type, deficiencies, defiNums);

    

    // Toggle the visibility of the update form
    $('#update-form').show();
  });

  function Deficiencies(gear, selectedOption) {
    fetch(`/fetchDeficiencies/${gear}`)
      .then(response => response.json())
      .then(data => {
        const deficienciesSelect = $('#Deficiencies');
        deficienciesSelect.empty();

        const selectedOptionParts = selectedOption.split(',');
        const regex = /^\d+-/;
        const modifiedSelectedOptionParts = selectedOptionParts.map(item => item.replace(regex, ''));
        const modifiedSelectedOptionPart = modifiedSelectedOptionParts.map(item => item.replace(/^["/]+|["/]+$/g, ''));
        const modifiedSelectedOption = [...new Set(modifiedSelectedOptionPart)];

        data.forEach(option => {
          const optionElement = new Option(option.list, option.list, false, false);
          deficienciesSelect.append(optionElement);
        });
        deficienciesSelect.select2({
          closeOnSelect: false
        });

        modifiedSelectedOption.forEach(value => {
          deficienciesSelect.select2('trigger', 'select', { data: { id: value } });
        });
        deficienciesSelect.trigger('change');
      })
      .catch(error => console.error('Error:', error));
  }

  // Handle form submission
  $('#submit-update').click(function () {
    const newDeficiency = $('#Deficiencies').val();
    const updatedDescriptions = [];

    // Gather updated descriptions
    $('#description-container .deficiency-description').each(function () {
      const deficiency = $(this).data('deficiency');
      const description = $(this).val().trim();
      updatedDescriptions.push({ deficiency, description });
    });

    const updatedArray = [];
    const deletedArray = [];
    const preselectedChangedArray = [];
    const selectedDeficiencies = updateButtonData.deficiencies.split(',').map(item => item.replace(/^["/]+|["/]+$/g, ''));
    const serialNumbersArray = updateButtonData.srNo.split(',').map(item => item.replace(/^["/]+|["/]+$/g, ''));

    newDeficiency.forEach(defi => {
      if (!selectedDeficiencies.includes(defi)) {
        const descriptionObj = updatedDescriptions.find(desc => desc.deficiency === defi);
        const description = descriptionObj ? descriptionObj.description : '';
        updatedArray.push({ deficiency: defi, description: description });
      }
    });

    selectedDeficiencies.forEach(defi => {
      const index = selectedDeficiencies.indexOf(defi);
      if (!newDeficiency.includes(defi)) {
        if (index !== -1 && serialNumbersArray.length > index) {
          deletedArray.push(serialNumbersArray[index]);
        }
      } else {
        const originalDescriptionObj = updateButtonData.updatedDescriptions.find(desc => desc.deficiency === defi);
        const newDescriptionObj = updatedDescriptions.find(desc => desc.deficiency === defi);

        if (originalDescriptionObj && newDescriptionObj && originalDescriptionObj.description !== newDescriptionObj.description) {
          preselectedChangedArray.push({
            sr_no: serialNumbersArray[index],
            deficiency: defi,
            description: newDescriptionObj.description
          });
        }
      }
    });

    const updatedData = {
      stationName: $('#station-name').val(),
      gear: $('#gear').val(),
      Type: $('#Type').val(),
      gearID: $('#gear-id').val(),
      date: $('#date-of-deficiency').val(),
      deficiencies: $('#Deficiencies').val(),
      updatedDescriptions: updatedDescriptions,
      preselectedChangedArray: preselectedChangedArray
    };

    const finalData = {
      updatedData: updatedData,
      updatedArray: updatedArray,
      deletedArray: deletedArray
    };

    $.ajax({
      type: 'POST',
      url: '/performUpdate',
      data: JSON.stringify(finalData),
      contentType: 'application/json',
      success: function (response) {
        console.log('Data successfully sent to the server:', response);
        location.reload();
      },
      error: function (error) {
        console.error('Error sending data to the server:', error);
      }
    });

    $('#update-form').hide();
  });
});





