// dropdownHandler.js
let currentPage = 1;
const donorsPerPage = 3;
let donorInfo = [];
async function fetchProvinces() {
    try {
      const response = await fetch('https://turkiyeapi.dev/api/v1/provinces');
      const data = await response.json();
  
      // Check if 'data' property exists and is an array
      const provinces = Array.isArray(data.data) ? data.data : [];
  
      console.log('Provinces:', provinces);
      return provinces;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  }

  function populateCityDropdown() {
    const cityDropdown = document.getElementById('city');
  
    fetchProvinces().then(provinces => {
      provinces.forEach(province => {
        const option = document.createElement('option');
        option.value = province.name;
        option.text = province.name;
        cityDropdown.appendChild(option);
        console.log(province.districts);
      });
  
      // Call the function to populate the towns based on the initial selected city
      populateTownDropdown();
    });
  }
  
  async function populateTownDropdown() {
    const cityDropdown = document.getElementById('city');
    const townDropdown = document.getElementById('town');
    const selectedCityName = cityDropdown.value; // Parse to ensure numeric comparison
  
    // Clear the existing options in the town dropdown
    townDropdown.innerHTML = '';
  
    try {
      const response = await fetch('https://turkiyeapi.dev/api/v1/provinces');
      const responseData = await response.json();
  
      console.log('API Response:', responseData);
  
      // Check if the 'data' property is an array
      if (Array.isArray(responseData.data)) {
        // Find the selected city in the data
        const selectedCity = responseData.data.find(city => city.name === selectedCityName);
  
        if (selectedCity && Array.isArray(selectedCity.districts) && selectedCity.districts.length > 0) {
          selectedCity.districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district.name;
            option.text = district.name;
            townDropdown.appendChild(option);
          });
        } else {
          console.error('No districts found for the selected city.');
        }
      } else {
        console.error('Invalid response structure for districts.');
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  }
  
  
  
  
  function initializeDropdownHandlers() {
    document.getElementById('city').addEventListener('change', populateTownDropdown);
    document.getElementById('queryDonorButton').addEventListener('click', queryDonor);
    document.getElementById('photoUrl').addEventListener('change', function(event) {
    });
    document.getElementById('nextPageButton').addEventListener('click', () => {
      currentPage++;
      updateDonorListPage();
    });
    document.getElementById('previousPageButton').addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        updateDonorListPage();
      }
    });

    function queryDonor() {
      const fullname = prompt('Enter the fullname of the donor to query:');
      const bloodType = prompt('Enter the blood type of the donor to query:');

      const queryParam = fullname ? { fullname } : bloodType ? { bloodType } : {};

      if (fullname || bloodType) {
        const backendEndpoint = '/api/staff/create-query-donor';

        const requestBody = {
          branchName: 'Branch1',
          branchPassword: 'password1',
          fullname: fullname || null,
          bloodType: bloodType || null,
        };

        fetch(backendEndpoint, {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then(response => response.json())
          .then(data => {
            if (data.error) {
              //console.error('Error querying donor:', data.error);
              alert('No donor found!');
            } else {
              console.log('Donor queried successfully:', data);
              // Update the donor list textarea with the queried donor information
              // updateDonorList(data.donorInfo);
              donorInfo = data.donorInfo;
              updateDonorListPage();
              showImageUrlForDonor(data.donorInfo.photoUrl);
            }
          })
          .catch(error => {
            console.error('Error querying donor:', error);
            // Handle errors
          });
      }
    }
    
    // function updateDonorList(donorInfo) {
    //   updateDonorListPage(donorInfo);
    //   const donorListTextArea = document.getElementById('donorList');
    //   if (donorInfo) {
    //     const donorList = Array.isArray(donorInfo) ? formatDonorList(donorInfo) : formatDonorList([donorInfo]);
    //     donorListTextArea.value = donorList;

    //     if (donorInfo.length > 0 && donorInfo[0].photoUrl) {
    //       showImageUrlForDonor(donorInfo[0].photoUrl);
    //     }

    //   } else {
    //     console.error('Invalid donor information format:', donorInfo);
    //     donorListTextArea.value = 'Error: Invalid donor information format.';
    //   }
    //   document.getElementById('nextPageButton').addEventListener('click', () => {
    //     currentPage++;
    //     updateDonorListPage(donorInfo);
    // });
    // }

// Function to update the donor list in the textarea based on the current page
    function updateDonorListPage() {
      const donorListTextArea = document.getElementById('donorList');
      if (donorInfo && Array.isArray(donorInfo)) {
          const startIdx = (currentPage - 1) * donorsPerPage;
          const endIdx = startIdx + donorsPerPage;
          const paginatedDonors = donorInfo.slice(startIdx, endIdx);
          const donorList = formatDonorList(paginatedDonors);
          donorListTextArea.value = donorList;
      } else {
          console.error('Invalid donor information format:', donorInfo);
          donorListTextArea.value = 'Error: Invalid donor information format.';
      }
    }

    function formatDonorList(donorInfo) {
      console.log('Donor Info:', donorInfo);
      if (!Array.isArray(donorInfo)) {
        return 'Invalid donor information format';
      }
    
      if (donorInfo.length === 0) {
        return 'No donor information found.';
      }
      const donorList = donorInfo.map(donor => {
        return `${donor.Fullname}   ${donor.BloodType}   ${donor.City}   ${donor.Town}`;
    });
    return donorList.join('\n\n');
  }

  function showImageUrlForDonor(photoUrl) {
    const preview = document.getElementById('preview');
    // Display the image in the preview box
    preview.src = photoUrl;
  }
  
    document.getElementById('donorForm').addEventListener('submit', function(event) {
      event.preventDefault();
  
      const branchName = document.getElementById('branchName').value;
      const branchPassword = document.getElementById('branchPassword').value;
      const fullname = document.getElementById('fullname').value;
      const bloodType = document.getElementById('bloodType').value;
      const city = document.getElementById('city').value;
      const town = document.getElementById('town').value;
      const phoneNumber = document.getElementById('phoneNumber').value;
      const photoUrl = document.getElementById('photoUrl').value;
  
      // You can add additional validation for phone number and photo as needed
  
      // Assuming you have a backend service endpoint for creating donors
      // Replace 'your-backend-endpoint' with the actual endpoint
      const backendEndpoint = '/api/staff/create-query-donor';
  
      const requestBody = {
        branchName,
        branchPassword,
        fullname,
        bloodType,
        city,
        town,
        phoneNumber,
        photoUrl
      };
    
      fetch(backendEndpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => {
          console.log('Request successfully send:', data);
          // Handle success
        })
        .catch(error => {
          console.error('Error sending request:', error);
          // Handle errors
        });
    });
  }
  document.getElementById('city').addEventListener('change', populateTownDropdown);
  // Call the function to initially populate the city dropdown and set up event listeners
  populateCityDropdown();
  initializeDropdownHandlers();
  