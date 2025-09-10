const express = require('express')
const { fetchAllTasks, createTask } = require('../controllers/Task.controller')
const app = express()
const router = express.Router()


router
    .get('/allTasks', fetchAllTasks)
    .post('/',createTask)

module.exports = router