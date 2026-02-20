const {DynamoDBClient} = require("@aws-sdk/client-dynamodb")
const {DynamoDBDocumentClient, QueryCommand, PutCommand, DeleteCommand} = require("@aws-sdk/lib-dynamodb")

const client = new DynamoDBClient({region: "us-east-1"})
const dynamodb = DynamoDBDocumentClient.from(client)

const TABLE_NAME = "LiftingTable";

exports.addUserWorkout = async (req, res) => {
    const {id, sort_key, exercises} = req.body;
    const params = {
        TableName: TABLE_NAME,
        Item: {
            id: id,
            sort_key: sort_key,
            exercises: exercises
        }
    }

    const result = await dynamodb.send(new PutCommand(params))
    res.status(201).json();
}
exports.getUserWorkouts = async (req, res) => {
    try {
        const {userId} = req.params;
        
        if (!userId) {
            return res.status(400).json({error: "user id is required"});
        }
        
        const params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: "id = :userId AND begins_with(sort_key, :workoutPrefix)",
            ExpressionAttributeValues: {
                ":userId": userId,
                ":workoutPrefix": "workout#"
            },
            ScanIndexForward: false // Get newest first (descending order by sort key)
        };

        const data = await dynamodb.send(new QueryCommand(params));

        const workouts = data.Items.map(item => ({
            date: item.sort_key.split('#')[1],
            exercises: item.exercises || []
        }));

        res.status(200).json({
            count: data.Count,
            workouts: workouts
        });

    } catch (error) {
        console.error("error fetching workouts", error);
        res.status(500).json({error: "failed to fetch workouts"});
    }
}

exports.addUserTemplate = async (req, res) => {
    const {id, sort_key, exercises} = req.body;

    const params = {
        TableName: TABLE_NAME,
        Item: {
            id: id,
            sort_key: sort_key,
            exercises: exercises
        }
    }

    const result = await dynamodb.send(new PutCommand(params))
}
exports.getUserTemplates = async (req, res) => {
    try {
        const {userId} = req.params;
        
        if (!userId) {
            return res.status(400).json({error: "user id is required"});
        }
        
        const params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: "id = :userId AND begins_with(sort_key, :templatePrefix)",
            ExpressionAttributeValues: {
                ":userId": userId,
                ":templatePrefix": "template#"
            },
        };

        const data = await dynamodb.send(new QueryCommand(params));

        const templates = data.Items.map(item => ({
            name: item.sort_key.split('#')[1],
            exercises: item.exercises || []
        }));

        res.status(200).json({
            count: data.Count,
            templates: templates
        });

    } catch (error) {
        console.error("error fetching workouts", error);
        res.status(500).json({error: "failed to fetch workouts"});
    }
}
exports.deleteTemplate = async (req, res) => {
    try {
        const {userId, templateId} = req.params;
        
        const params = {
            TableName: TABLE_NAME,
            Key: {
                id: userId,
                sort_key: `template#${templateId}`
            }
        };

        await dynamodb.send(new DeleteCommand(params));

        res.status(200).json({
            message: "Template deleted successfully",
            templateId: templateId
        });

    } catch (error) {
        console.error("error deleting template", error);
        res.status(500).json({error: "failed to delete template"});
    }
}