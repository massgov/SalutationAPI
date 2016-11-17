# Overview

## Main Functions
- GET
- GET-id
- POST
- PUT
- PUT-id
- DELETE-id

### GET
This retrieves all the active records that are currently stored in S3. Then it will return the relevant record based on any filters passed in the input event.

#### Main methods
- init
    - Sets the S3 bucket and key to use
- setup
    - Gets the input parameters from the Lambda event
- process
    - Retrieves all the records and applies any defined filters
- takedown
    - Makes the final callback

#### Helper methods
- getAllRecords
    - Makes a call to S3 to retrieve all the records
- filterRecords
    - Applies any defined filters to the list of records returned by the getAllRecords method call

---

### POST
This adds a new record to the active records that are currently stored in S3.

#### Main methods
- init
    - Sets the S3 bucket and key to use
- setup
    - Gets the input parameters from the Lambda event to be used as the fields for the new record and retrieves all the active records.
- process
    - Adds the new record and uploads the new data back to S3
- takedown
    - Makes the final callback

#### Helper methods
- getAllRecords
    - Makes a call to S3 to retrieve all the records
- findHighestId
    - Iterates through all the records to find the highest value id
- addRecord
    - Adds the new record to the list of active records and uploads the new data to S3
- uploadToS3
    - Uploads the new list of records to S3 as a JSON file
- getSingleRecord
    - Retrieves the newly created record from S3 to verify that it has been successfully added to the active records

---

### PUT
This updates parameters for all the active records that are currently stored in S3.

#### Main methods
- init
    - Sets the S3 bucket and key to use
- setup
    - Gets the input parameters from the Lambda event to determine which fields of the records to modify
- process
    - Modifies all the records with the defined parameters and uploads the new data to S3
- takedown
    - Makes the final callback

#### Helper methods
- getAllRecords
    - Makes a call to S3 to retrieve all the records
- updateAllRecords
    - Modifies all the records in the list of active records and uploads the new data to S3
- uploadToS3
    - Uploads the new list of records to S3 as a JSON file

---

### GET-id
This retrieves the record with the specified id from S3.

#### Main methods
- init
    - Sets the S3 bucket and key to use
- setup
    - Gets the  
