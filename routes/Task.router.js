const express = require('express')
const { fetchAllTasks, createTask, deleteTask, updateTask, reOrderTask } = require('../controllers/Task.controller')
const app = express()
const router = express.Router()


router
    .get('/allTasks', fetchAllTasks)
    .post('/',createTask)
    .delete('/:id',deleteTask)
    .patch('/update/:id',updateTask)
    .patch("/reorder/:id",reOrderTask)

module.exports = router