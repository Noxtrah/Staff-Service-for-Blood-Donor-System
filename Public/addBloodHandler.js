// addBloodHandler.js
// This file contains the JavaScript logic for the addBlood page

document.addEventListener('DOMContentLoaded', function () {
    // Attach event listener to the search button
    document.getElementById('searchButton').addEventListener('click', searchDonor);
  
    // Attach event listener to the add blood button
    document.getElementById('addBloodButton').addEventListener('click', addBloodToBank);
  });

  function searchDonor() {
    const donorName = document.getElementById('donorName').value;
    console.log('Searching donor on the client side:', donorName);

    // Make a fetch request to get donor information by name
    fetch('/api/staff/search-donor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: donorName }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            console.error('Error searching donor:', data.error);
            alert('Error searching donor: ' + data.error);
        } else if (data.donorInfo && data.donorInfo.length > 0) {
            // Assuming the first donor in the array contains the relevant information
            const firstDonor = data.donorInfo[0];
            console.log('First donor information:', firstDonor);
            console.log('First donor information:', firstDonor);
            console.log('Blood Type from first donor:', firstDonor.BloodType);
            
            document.getElementById('bloodType').value = firstDonor.BloodType || '';
            console.log('Area:', document.getElementById('bloodType').value);

            document.getElementById('donationDate').value = getCurrentDate();
        } else {
            console.log('No donor found.');
        }
    })
    .catch(error => {
        console.error('Error searching donor:', error);
    });
}

// Function to add blood to the bank
  function addBloodToBank() {
    const branchName = document.getElementById('branchName').value;
    const branchPassword = document.getElementById('branchPassword').value;
    const fullname = document.getElementById('donorName').value;
    const bloodType = document.getElementById('bloodType').value;
    const donationDate = document.getElementById('donationDate').value;
    const units = document.getElementById('units').value;
  
    // Make a fetch request to add blood to the bank
    fetch('/api/staff/add-blood', {
      method: 'POST',
      body: JSON.stringify({
        branchName,
        branchPassword,
        fullname,
        bloodType,
        donationDate,
        units,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error('Error adding blood to bank:', data.error);
          alert('Error adding blood to bank: ' + data.error);
        } else {
          console.log('Blood added to bank successfully:', data);
          // Optionally, you can reset the form or perform other actions
        }
      })
      .catch(error => {
        console.error('Error adding blood to bank:', error);
      });
  }
  
  // Function to get the current date in the format YYYY-MM-DD
  function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }