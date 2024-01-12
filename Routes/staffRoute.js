// staffRoute.js
import express from 'express';
const router = express.Router();
import * as staffController from '../Controllers/staffController.js';


// API endpoint for creating a donor by staff
router.post('/staff/create-query-donor', staffController.createOrQueryDonor);

// API endpoint for adding blood by staff
router.post('/staff/add-blood', staffController.addBlood);

router.post('/staff/search-donor', staffController.searchDonor);

router.get('/staff/check-available-blood', staffController.getFoundBloods);

export default router;
