const Task = require("../models/Task.model");

exports.fetchAllTasks = async (req, res) => {

  try {
    const toDoTasks = await Task.find({status:"To Do"});
    const inProgressTasks = await Task.find({status:"In Progress"});
    const completedTasks = await Task.find({status:"Completed"});
    res.status(200).json({toDoTasks,inProgressTasks,completedTasks});
  } catch (error) {
    res.status(400).json(error);
  }
};


exports.createTask = async(req,res)=>{
    try{
        const task = new Task(req.body)
        const response = await task.save()
        // console.log(response)
        res.status(201).json(response)
    }catch(error) {
        res.status(400).json(error)
    }
}