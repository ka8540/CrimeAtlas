// Load required modules
const fs = require('fs');

// Initialize MongoDB Connection
let conn;
try {
    conn = new Mongo(`${process.env.MONGO_URI}`);
} catch (error) {
    print("Error connecting to MongoDB: " + error);
    quit(1);
}

const db = conn.getDB("ProjectTest"),
    crimeRate = db.getCollection("CrimeRate");

// Delete existing records
print("Deleting all existing records...");
try {
    const deleteResult = crimeRate.deleteMany({});
    print(`Deleted ${deleteResult.deletedCount} records`);
} catch (error) {
    print("Error deleting records: " + error);
    quit(1);
}

// Specify the path to the CSV file containing new data
const filePath = "Crime_Data_from_2020_to_Present.csv";
let fileContent;
try {
    // Read the entire file content as a string
    fileContent = fs.readFileSync(filePath, "utf8");
} catch (error) {
    print("Error reading file: " + error);
    quit(1);
}

// Manually parse CSV file
const fileLines = fileContent.split("\n");

// Extract column headers from the first line of the file
const headers = fileLines[0].split(",").map(h => h.trim());

// Define a function to parse each CSV row considering possible text qualifiers and delimiters
function parseCSVRow(row) {
    let result = [];
    let currentField = "";
    let insideQuotes = false;

    for (let i = 0; i < row.length; i++) {
        let char = row[i];

        if (char === '"' && row[i + 1] !== '"') {
            insideQuotes = !insideQuotes; // Toggle entry/exit of text qualifiers
        } else if (char === '"' && row[i + 1] === '"') {
            currentField += '"'; // Handle escaped double quotes
            i++; // Skip next quote
        } else if (char === "," && !insideQuotes) {
            result.push(currentField.trim()); // Push completed field
            currentField = "";
        } else {
            currentField += char; // Accumulate characters into the current field
        }
    }
    
    // Add the last field to result
    result.push(currentField.trim());
    return result;
}

// Process the parsed CSV data to prepare for database insertion
let data = [];
const batchSize = 50000; // Define batch size for bulk insertion
let insertedCount = 0; //inserted records tracker

// Iterate over each line in the CSV file starting from the second line (skipping headers)
for (let i = 1; i < fileLines.length; i++) {
    let row = fileLines[i].trim();
    if (!row) continue; // Skip empty lines

    let values = parseCSVRow(row);
    if (values.length !== headers.length) {
        print(`Skipping malformed row ${i + 1}: ${row}`);
        continue; // Skip invalid rows
    }

    let entry = {};
    // Construct document object from parsed values and headers
    for (let j = 0; j < headers.length; j++) {
        entry[headers[j]] = values[j];
    }

     // Clean up the entry by removing unwanted fields
    const unwantedFields = ["AREA", "Rpt Dist No", "Part 1-2", "Mocodes", "Status", "Crm Cd 1", "Crm Cd 3", "Crm Cd 4"];
    unwantedFields.forEach(field => delete entry[field]);

    // Convert latitude and longitude fields to a geospatial coordinate object if present
    if (entry["LAT"] && entry["LON"]) {
        let lat = parseFloat(entry["LAT"]);
        let lon = parseFloat(entry["LON"]);

        if (!isNaN(lat) && !isNaN(lon)) {
            entry.location = {
                type: "Point",
                coordinates: [lon, lat]
            };
            delete entry["LAT"];
            delete entry["LON"];
        }
    }

    // Accumulate the entry for batch insertion
    data.push(entry);

    // Insert in batches
    if (data.length > 0 && data.length >= batchSize) {
        try {
            const insertResult = crimeRate.insertMany(data, { ordered: false });
            let inserted = insertResult.insertedCount || 0;
            insertedCount += inserted;
        } catch (error) {
            print(`Error inserting batch: ${error}`);
        }
        data = []; // Clear batch
    }
}

// Insert remaining records
if (data.length > 0) {
    try {
        const insertResult = crimeRate.insertMany(data, { ordered: false });
        let inserted = insertResult.insertedCount || 0;
        insertedCount += inserted;
        print(`Inserted final batch of ${inserted} records. Total inserted: ${insertedCount}`);
    } catch (error) {
        print(`Error inserting final batch: ${error}`);
    }
}

// Prcocess completed
print(`Process completed. Total records inserted: ${insertedCount}`);
