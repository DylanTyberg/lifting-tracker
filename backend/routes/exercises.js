var express = require('express');
var router = express.Router();
const exercisesController = require("../controllers/exercisesController")
const workoutsController = require("../controllers/workoutsController")

/* GET exercises. */
router.get("/exercises", exercisesController.getExercises)
router.put("/exercises/:name", exercisesController.addExercise)


router.get("/user/exercises/:userId", exercisesController.getUserExercises)
router.put("/user/exercises/:userId", exercisesController.addUserExercise)

router.put("/user/workouts/:userId", workoutsController.addUserWorkout)
router.get("/user/workouts/:userId", workoutsController.getUserWorkouts)



module.exports = router;
