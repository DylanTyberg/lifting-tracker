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

router.put("/user/workouts/templates/:userId", workoutsController.addUserTemplate)
router.get("/user/workouts/templates/:userId", workoutsController.getUserTemplates)
router.delete("/user/workouts/templates/:userId", workoutsController.deleteTemplate)



module.exports = router;
