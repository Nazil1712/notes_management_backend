const Task = require("../models/Task.model");

exports.fetchAllTasks = async (req, res) => {
  try {
    const toDoTasks = await Task.find({ status: "To Do" }).sort({
      position: 1,
    });
    const inProgressTasks = await Task.find({ status: "In Progress" }).sort({
      position: 1,
    });
    const completedTasks = await Task.find({ status: "Completed" }).sort({
      position: 1,
    });
    const allTasks = await Task.find().sort({rowPosition:1})
    res.status(200).json({kanbanView:[
      { id: "To Do", title: "To Do", tasks: toDoTasks },
      { id: "In Progress", title: "In Progress", tasks: inProgressTasks },
      { id: "Completed", title: "Completed", tasks: completedTasks },
    ], rowView: allTasks});
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.createTask = async (req, res) => {
  // console.log(req.body)
  
  try {
    
    const count = await Task.countDocuments({ status: req.body.status || "To Do"});
    const taskPosition = count;

    await Task.updateMany({}, { $inc: { rowPosition: 1 } });

    const task = new Task({ ...req.body, position: taskPosition, rowPosition:0});
    const response = await task.save();
    // console.log(response)
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Find the task to delete
    const taskToDelete = await Task.findById(id);
    if (!taskToDelete) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { status, position, rowPosition } = taskToDelete;

    // 2. Delete the task
    await Task.findByIdAndDelete(id);

    // 3. Decrement positions of tasks in the same status with position > deleted task's position
    await Task.updateMany(
      { status: status, position: { $gt: position } },
      { $inc: { position: -1 } }
    );

    // 4. Decrement rowPosition globally (row view ordering)
    await Task.updateMany(
      { rowPosition: { $gt: rowPosition } },
      { $inc: { rowPosition: -1 } }
    );


    res.status(200).json({ data: {message: "Task deleted and positions updated", id: id }});
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await Task.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.reOrderTask = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(req.body)
    const { fromStatus, toStatus, newPosition, status } = req.body;

    const task = await Task.findById(id);
    if (!task) return res.status(404).send("Task not found");

    const oldPosition = task.position;

    // If moved DOWN
    if (fromStatus === toStatus) {
      console.log("I am Inside Error happening....")
      if (oldPosition < newPosition) {
        await Task.updateMany(
          { status, position: { $gt: oldPosition, $lte: newPosition } },
          { $inc: { position: -1 } }
        );
      }

      // If moved UP
      if (oldPosition > newPosition) {
        await Task.updateMany(
          { status, position: { $gte: newPosition, $lt: oldPosition } },
          { $inc: { position: 1 } }
        );
      }

      // Update task itself
      task.position = newPosition;
      await task.save();

      return res.json({ success: true, moved: "within column" });
    } else {
      // (a) shift up tasks below old position in old column
      await Task.updateMany(
        { status: fromStatus, position: { $gt: oldPosition } },
        { $inc: { position: -1 } }
      );

      // (b) shift down tasks at/after newPosition in new column
      await Task.updateMany(
        { status: toStatus, position: { $gte: newPosition } },
        { $inc: { position: 1 } }
      );

      // (c) update moved task
      console.log("new Position", newPosition);
      task.status = toStatus;
      task.position = newPosition;
      await task.save();

      res.json({ success: true, moved: "across columns" });
    }
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.reOrderRowPosition = async (req, res) => {
  try {
    const {id} = req.params;
    const { oldIndex, newIndex } = req.body;
    console.log(id,req.body)

    if (oldIndex < newIndex) {
      // Moving DOWN
      await Task.updateMany(
        { rowPosition: { $gt: oldIndex, $lte: newIndex } },
        { $inc: { rowPosition: -1 } }
      );
    } else if (oldIndex > newIndex) {
      // Moving UP
      await Task.updateMany(
        { rowPosition: { $gte: newIndex, $lt: oldIndex } },
        { $inc: { rowPosition: 1 } }
      );
    }

    // Finally set the moved task's rowPosition to newIndex
    await Task.findByIdAndUpdate(id, { rowPosition: newIndex });

    res.status(200).json({ message: "Row positions updated successfully" });
  } catch (error) {
    res.status(400).json(error);
  }
};
