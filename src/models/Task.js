const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Task title is required"],
        trim: true,
        minlength: [3, "Title must be at least 3 characters"],
        maxlength: [200, "Title cannot exceed 200 characters"]
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, "Description cannot exceed 1000 characters"]
    }, 
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    }, 
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }, 
    category: {
        type: String,
        trim: true, 
        maxlength: [50, "Category cannot exceed 50 characters"]
    },
    dueDate: {
        type: Date
    },
    completed: {
        type: Boolean,
        default: false
    }, 
    completedAt: {
        type: Date
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

taskSchema.pre('save', function() {
    if (this.isModified('completed') && this.completed && !this.completedAt) {
        this.completedAt = new Date();
    }
    if (this.isModified('completed') && !this.completed) {
        this.completedAt = undefined;
    }
});

taskSchema.index({owner: 1, status: 1, priority: 1});
taskSchema.index({dueDate: 1});

module.exports = mongoose.model("Task", taskSchema);