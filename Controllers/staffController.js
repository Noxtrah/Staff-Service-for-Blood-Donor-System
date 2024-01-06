// staffController.js
import fetch from 'node-fetch';
import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import { Donor } from '../Models/donorModel.js';
import { connectToDatabase, getPool } from '../db.js';
import sql from 'mssql';

const storageAccountName = 'donorphotostorage';
const storageAccountKey = 'WjVTlPvoS9E3NDlXyJh7ceNZsfmA2/LFsQH4eOJXdxqpjJQFaKrMsySrFd7zOm9hUfxyKdTodiEH+AStweOUdA==';
const containerName = 'donor-photos';

// Azure Storage connection string
const storageConnectionString = `DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${storageAccountKey};EndpointSuffix=core.windows.net`;

// Azure Storage BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnectionString);

// Azure CDN endpoint URL (replace with your CDN endpoint)
const cdnEndpointUrl = 'https://donorPhotosCDN.azureedge.net';

// const donors = [];

const branches = [
  { name: 'Branch1', password: 'password1' },
  { name: 'Branch2', password: 'password2' },
];

export async function createOrQueryDonor(req, res) {
  const { branchName, branchPassword, fullname, bloodType, town, city, phoneNumber, photoUrl } = req.body;
  console.log('Received branchName:', branchName);
  console.log('Received branchPassword:', branchPassword);
  console.log('Received request body:', req.body);

  // Validate branch authentication
  const validBranch = branches.find(branch => branch.name === branchName && branch.password === branchPassword);
  if (!validBranch) {
    return res.status(401).json({ error: 'Invalid branch credentials.' });
  }

  if (fullname || bloodType) {
    try {
        // Connect to the database
        await connectToDatabase();

        // Query the donor information from the database based on fullname and/or bloodType
        let queryCondition = '';
        let queryParams = {};

        if (fullname && bloodType) {
            queryCondition = 'WHERE fullname = @fullname AND bloodType = @bloodType';
            queryParams = { fullname, bloodType };
        } else if (fullname) {
            queryCondition = 'WHERE fullname = @fullname';
            queryParams = { fullname };
        } else if (bloodType) {
            queryCondition = 'WHERE bloodType = @bloodType';
            queryParams = { bloodType };
        }

        const queryResult = await getPool()
            .request()
            .input('fullname', sql.VarChar, queryParams.fullname || null)
            .input('bloodType', sql.VarChar, queryParams.bloodType || null)
            .query(`
                SELECT * FROM Donor
                ${queryCondition}
            `);

        const queriedDonor = queryResult.recordset;

        if (queriedDonor.length > 0) {
            // Donors exist, return the queried donor information
            return res.status(200).json({ donorInfo: queriedDonor });
        }
    } catch (error) {
        console.error('Error querying donor:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
  // Validate required fields
  if (!fullname || !bloodType || !town || !city || !phoneNumber) {
    return res.status(400).json({ error: 'All required fields (Fullname, Blood type, Town, City, Phone No.) must be provided.' });
  }

  const newDonor = new Donor(fullname, bloodType, town, city, phoneNumber, photoUrl);
  const blobName = `${uuidv4()}.jpg`;

  try {
    // Connect to the database
    await connectToDatabase();

    // Save the donor information to the database
    const result = await getPool()
      .request()
      .input('fullname', sql.VarChar, fullname)
      .input('bloodType', sql.VarChar, bloodType)
      .input('town', sql.VarChar, town)
      .input('city', sql.VarChar, city)
      .input('phoneNumber', sql.VarChar, phoneNumber)
      .input('photoUrl', sql.VarChar, newDonor.photoUrl)
      .query(`
        INSERT INTO Donor (fullname, bloodType, town, city, phoneNumber, photoUrl)
        VALUES (@fullname, @bloodType, @town, @city, @phoneNumber, @photoUrl)
      `);

    const blobClient = blobServiceClient.getContainerClient(containerName).getBlockBlobClient(blobName);
    const photoBuffer = await fetch(photoUrl).then(response => response.arrayBuffer());
    const contentLength = photoBuffer.byteLength;

    await blobClient.upload(photoBuffer, contentLength);

    // Update the photoUrl in the database with the CDN endpoint URL
    newDonor.photoUrl = `${cdnEndpointUrl}/${containerName}/${blobName}`;

  } catch (error) {
    console.error('Error creating donor:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function searchDonor(req, res) {
  const donorName = req.body.name; // Assuming the request body contains the donor name
  console.log('Searching for donor with name:', donorName);
  try {
      // Connect to the database
      await connectToDatabase();

      // Query the donor information from the database based on the donor name
      const queryResult = await getPool()
          .request()
          .input('fullname', sql.VarChar, donorName)
          .query(`
              SELECT * FROM Donor
              WHERE fullname = @fullname
          `);

      const queriedDonor = queryResult.recordset;
      console.log(queriedDonor)

      if (queriedDonor.length > 0) {
          // Donor exists, return the queried donor information
          return res.status(200).json({ donorInfo: queriedDonor });
      } else {
          // Donor not found
          return res.status(404).json({ error: 'No donor found.' });
      }
  } catch (error) {
      console.error('Error searching donor:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function addBlood(req, res) {
  const { branchName, branchPassword, fullname, bloodType, donationDate, units } = req.body;

  // Validate branch authentication
  const validBranch = branches.find(branch => branch.name === branchName && branch.password === branchPassword);
  if (!validBranch) {
    return res.status(401).json({ error: 'Invalid branch credentials.' });
  }
  // Validate required fields
  if (!fullname || !bloodType || !donationDate || !units) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Connect to the database
    await connectToDatabase();

    // Query the donor information from the database based on the donor name
    const queryResult = await getPool()
        .request()
        .input('fullname', sql.VarChar, fullname)
        .input('bloodType', sql.VarChar, bloodType)
        .input('donationDate', sql.Date, donationDate)
        .input('units', sql.Int, units)
        .query(`
          INSERT INTO BloodBank (fullname, bloodType, donationDate, units)
          VALUES (@fullname, @bloodType, @donationDate, @units)
        `);

        const affectedRows = queryResult.rowsAffected[0];

        if (affectedRows > 0) {
            // Blood added successfully
            return res.status(201).json({ message: 'Blood added to the bank successfully.' });
        } else {
            // No rows were affected, indicating an issue with the insertion
            return res.status(500).json({ error: 'Error adding blood to the bank.' });
        }
    } catch (error) {
        console.error('Error searching donor:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
