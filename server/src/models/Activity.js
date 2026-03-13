import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "card:created",
        "card:moved",
        "card:updated",
        "card:deleted",
        "column:created",
        "column:deleted",
        "column:updated",
        "member:invited",
      ],
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

activitySchema.index({ boardId: 1, timestamp: -1 });

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;