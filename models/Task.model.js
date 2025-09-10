const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    task_id: { type: String },
    title: { type: String, required: true },
    tag: { type: String, required: true },
    progress: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    views: { type: String, default: "0" }, 
    users: [{ type: String }], 
    description: { type: String }, 
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Completed"], 
      default: "To Do",
    },
  },
  {
    toJSON: {
      versionKey: false,
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
      },
    },
  }
);

TaskSchema.virtual("id").get(function () {
  return this._id;
});

module.exports = mongoose.model("Task", TaskSchema);
