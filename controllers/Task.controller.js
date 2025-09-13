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
    res.status(200).json([
      { id: "To Do", title: "To Do", tasks: toDoTasks },
      { id: "In Progress", title: "In Progress", tasks: inProgressTasks },
      { id: "Completed", title: "Completed", tasks: completedTasks },
    ]);
  } catch (error) {
    res.status(400).json(error);
  }
};

exports.createTask = async (req, res) => {
  try {
    const count = await Task.countDocuments({ status: "To Do" });
    const task = new Task({ ...req.body, position: count });
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
    const response = await Task.findByIdAndDelete(id);
    res.status(200).json(response);
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
    console.log(req.body)
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
// exports.reOrderTask = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { fromStatus, toStatus, newPosition } = req.body;

//     const task = await Task.findById(id);
//     if (!task) return res.status(404).send("Task not found");

//     const oldStatus = task.status;
//     const oldPosition = task.position;

//     // Same column move
//     if (fromStatus === toStatus) {
//       if (oldPosition < newPosition) {
//         await Task.updateMany(
//           { status: fromStatus, position: { $gt: oldPosition, $lte: newPosition } },
//           { $inc: { position: -1 } }
//         );
//       } else if (oldPosition > newPosition) {
//         await Task.updateMany(
//           { status: fromStatus, position: { $gte: newPosition, $lt: oldPosition } },
//           { $inc: { position: 1 } }
//         );
//       }

//       task.position = newPosition;
//       await task.save();
//     } else {
//       // Shift tasks in old column
//       await Task.updateMany(
//         { status: fromStatus, position: { $gt: oldPosition } },
//         { $inc: { position: -1 } }
//       );

//       // Shift tasks in new column
//       await Task.updateMany(
//         { status: toStatus, position: { $gte: newPosition } },
//         { $inc: { position: 1 } }
//       );

//       task.status = toStatus;
//       task.position = newPosition;
//       await task.save();
//     }

//     // 🔹 Final normalization: reindex both affected columns
//     const [fromTasks, toTasks] = await Promise.all([
//       Task.find({ status: fromStatus }).sort("position"),
//       Task.find({ status: toStatus }).sort("position"),
//     ]);

//     await Promise.all([
//       ...fromTasks.map((t, idx) => Task.updateOne({ _id: t._id }, { position: idx })),
//       ...toTasks.map((t, idx) => Task.updateOne({ _id: t._id }, { position: idx })),
//     ]);

//     res.json({ success: true });
//   } catch (error) {
//     console.error(error);
//     res.status(400).json({ error: error.message });
//   }
// };
