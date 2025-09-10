const express = require('express')
const { fetchAllTasks, createTask, deleteTask } = require('../controllers/Task.controller')
const app = express()
const router = express.Router()


router
    .get('/allTasks', fetchAllTasks)
    .post('/',createTask)
    .delete('/:id',deleteTask)

module.exports = router