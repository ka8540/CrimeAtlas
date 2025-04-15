const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const crimeRateSchema = new mongoose.Schema({}, { collection: 'CrimeRate' }); 
const CrimeRate = mongoose.model('CrimeRate', crimeRateSchema);


// router.get('/get_details', async (req, res) => {
//     try {
//         const fieldsToQuery = ['DATE OCC', 'Status Desc', 'Crm Cd Desc'];
//         const queries = fieldsToQuery.map(field => {
//             return CrimeRate.aggregate([
//                 {
//                     $group: {
//                         _id: `$${field}`
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 0,
//                         value: '$_id'
//                     }
//                 }
//             ]);
//         });

//         const results = await Promise.all(queries);
//         const uniqueValues = results.map((result, index) => ({
//             field: fieldsToQuery[index],
//             values: result.map(item => item.value)
//         }));

//         res.json(uniqueValues);
//     } catch (error) {
//         console.error('Database error:', error);
//         res.status(500).send('Failed to retrieve data.');
//     }
// });

router.get('/get_details', async (req, res) => {
    try {
        const result = await CrimeRate.aggregate([
            {
                $group: {
                    _id: "$Crm Cd Desc"
                }
            },
            {
                $project: {
                    _id: 0,
                    value: "$_id"
                }
            }
        ]);

        res.json({
            field: "Crm Cd Desc",
            values: result.map(item => item.value)
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Failed to retrieve data.');
    }
});


// // get detailed data based on provided parameters
// router.get('/get_crime_data', async (req, res) => {
//     const { date_occ, status_desc, crm_cd_desc } = req.query;

//     const query = {};
//     if (date_occ) query['DATE OCC'] = date_occ;
//     if (status_desc) query['Status Desc'] = status_desc;
//     if (crm_cd_desc) query['Crm Cd Desc'] = crm_cd_desc;

//     if (Object.keys(query).length === 0) {
//         return res.status(400).send('At least one parameter (date_occ, status_desc, crm_cd_desc) is required.');
//     }

//     try {
//         const results = await CrimeRate.find(query, {
//             'DATE OCC': 1,
//             'Status Desc': 1,
//             'Crm Cd Desc': 1,
//             'location': 1,
//             '_id': 0
//         });

//         if (results.length === 0) {
//             return res.status(404).send('No documents found with the specified criteria.');
//         }

//         // Convert each document to JSON and map over the results to format data
//         const dataWithCoordinates = results.map(doc => {
//             const jsonDoc = doc.toJSON(); // Convert Mongoose document to JSON
//             return {
//                 date_occ: jsonDoc['DATE OCC'],
//                 status_desc: jsonDoc['Status Desc'],
//                 crm_cd_desc: jsonDoc['Crm Cd Desc'],
//                 longitude: jsonDoc.location && jsonDoc.location.coordinates ? jsonDoc.location.coordinates[0] : null,
//                 latitude: jsonDoc.location && jsonDoc.location.coordinates ? jsonDoc.location.coordinates[1] : null
//             };
//         });

//         res.json(dataWithCoordinates);
//     } catch (error) {
//         console.error('Database error:', error);
//         res.status(500).send('Failed to retrieve data.');
//     }
// });

// Get detailed crime data based on provided parameters
router.get('/get_crime_data', async (req, res) => {
    const { date_occ,crm_cd_desc } = req.query;

    const query = {};

    if (date_occ) {
        const regexDate = new RegExp(`^${date_occ}.*`, 'i'); 
        query['DATE OCC'] = regexDate;
    }

    if (crm_cd_desc) query['Crm Cd Desc'] = crm_cd_desc;

    if (Object.keys(query).length === 0) {
        return res.status(400).send('At least one parameter (date_occ, status_desc, crm_cd_desc) is required.');
    }

    try {
        const results = await CrimeRate.find(query, {
            'DATE OCC': 1,
            'Crm Cd Desc': 1,
            'location': 1,
            '_id': 0
        });

        if (results.length === 0) {
            return res.status(404).send('No documents found with the specified criteria.');
        }

        const dataWithCoordinates = results.map(doc => {
            const jsonDoc = doc.toJSON(); 
            return {
                date_occ: jsonDoc['DATE OCC'],
                crm_cd_desc: jsonDoc['Crm Cd Desc'],
                longitude: jsonDoc.location && jsonDoc.location.coordinates ? jsonDoc.location.coordinates[0] : null,
                latitude: jsonDoc.location && jsonDoc.location.coordinates ? jsonDoc.location.coordinates[1] : null
            };
        });

        res.json(dataWithCoordinates);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Failed to retrieve data.');
    }
});





module.exports = router;

