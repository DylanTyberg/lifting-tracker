const {DynamoDBClient} = require("@aws-sdk/client-dynamodb")
const {DynamoDBDocumentClient, QueryCommand, PutCommand} = require("@aws-sdk/lib-dynamodb")

const client = new DynamoDBClient({region: "us-east-1"})
const dynamodb = DynamoDBDocumentClient.from(client)

const TABLE_NAME = "LiftingTable";

exports.getExercises = async (req, res) => {
    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": "exercise"
        }
    }
    const data = await dynamodb.send(new QueryCommand(params))

    res.status(200).json({
        exercises: data.Items
    })
}

exports.addExercise = async (req, res) => {
    const {name} = req.params;
    const params = {
        TableName: TABLE_NAME,
        Item: {
            "id": "exercise",
            "sort_key": name
        }
    }
    const result = await dynamodb.send(new PutCommand(params))
    res.status(200).json(result)
}

exports.getUserExercises = async (req, res) => {
    try {
        const {userId} = req.params;
        if (!userId) {
            return res.status(400).json({error: "user id is required"})
        }
        const params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: "id = :userId AND begins_with(sort_key, :exercisePrefix)",
            ExpressionAttributeValues: {
                ":userId": userId,
                ":exercisePrefix": "exercise#"
            }
        }

        const data = await dynamodb.send(new QueryCommand(params));

        // Group exercises by name
        const exercises = {};
        
        data.Items.forEach(item => {
            const parts = item.sort_key.split('#');
            const exerciseName = parts[1];
            const date = parts[2];
            
            // Initialize array for this exercise if it doesn't exist
            if (!exercises[exerciseName]) {
                exercises[exerciseName] = [];
            }
            
            // Add this workout entry
            exercises[exerciseName].push({
                date: date,
                sets: item.sets || []
            });
        });

        // Sort each exercise's entries by date (newest first)
        Object.keys(exercises).forEach(exerciseName => {
            exercises[exerciseName].sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            );
        });

        res.status(200).json({
            count: data.Count,
            exercises: exercises
        });

    } catch (error) {
        console.error("error fetching exercises", error);
        res.status(500).json({error: "failed to fetch exercises"});
    }
}

exports.addUserExercise = async (req, res) => {
    try {
        // Data comes from req.body, not req.params
        const { id, sort_key, sets } = req.body;

        // Validate required fields
        if (!id || !sort_key || !sets) {
            return res.status(400).json({ 
                error: "Missing required fields: id, sort_key, sets" 
            });
        }

        const params = {
            TableName: TABLE_NAME,
            Item: {
                id: id,                    
                sort_key: sort_key,             
                sets: sets,               
                createdAt: new Date().toISOString(),  
                
            }
        };

        const result = await dynamodb.send(new PutCommand(params));
        
        res.status(201).json({ 
            message: "Exercise added successfully",
            item: params.Item 
        });

    } catch (error) {
        console.error("Error adding exercise:", error);
        res.status(500).json({ 
            error: "Failed to add exercise",
            details: error.message 
        });
    }
};