const Worker = require("../models/worker.model");
const handleErrors = require("../services/handleErrors");
const { cloudinary } = require("../config/cloudinary.config");
const { find } = require("../models/user.models");
const fs=require('fs')
const WorkerAttendance =require('../models/attendance.model')
const Production=require('../models/production.model')

const createWorker = async (req, res, next) => {
  try {
    const { worker_id, worker_name, worker_mobile_number } = req.body;

    if (!worker_id || !worker_name || !worker_mobile_number) {
      return next(
        handleErrors(400, "Enter worker ID, name, and mobile number.")
      );
    }

    const existWorker = await Worker.findOne({ worker_id });
    if (existWorker) {
      return next(handleErrors(409, "Worker already exists."));
    }

    if (!req.user || !req.user.id) {
      return next(handleErrors(403, "Unauthorized access. User ID missing."));
    }

    const newWorker = new Worker({
      worker_id,
      worker_name,
      worker_mobile_number,
      current_userId: req.user.id,
    });

    await newWorker.save();

    return res.status(201).json({
      success: true,
      message: "Worker created successfully",
      worker: newWorker,
    });
  } catch (error) {
    console.error("Error creating worker:", error);

    return next(handleErrors(500, "Internal server error"));
  }
};

const showWorker = async (req, res, next) => {
  try {
    const userId = req.user.id;

    
    const workers = await Worker.find({ current_userId: userId }).sort({
      createdAt: -1,
    });

    if (workers.length === 0) {
      return next(handleErrors(404, "No workers found for this user."));
    }
    const userProductions = await Production.find({ current_userId: userId })
    .select('production_name');
    
    return res.status(200).json({
      success: true,
      message: "Workers fetched successfully.",
      workers: workers,
      productionNames: userProductions.map(p => p.production_name)
    });
  } catch (error) {
    console.error("Error fetching workers:", error);
    return next(handleErrors(500, "Internal server error"));
  }
};

const deleteWorker = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(handleErrors(400, "Worker ID is required."));
    }

    const worker = await Worker.findOne({
      current_userId: req.user.id,
      _id: id,
    });

    if (!worker) {
      return next(handleErrors(404, "Worker not found or unauthorized."));
    }

   
    if (worker.worker_image && worker.worker_public_id) {
      await cloudinary.uploader.destroy(worker.worker_public_id);
    }

   
    await WorkerAttendance.deleteMany({ workerId: id });

 
    await Worker.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Worker and related attendance records deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting worker:", error);
    return next(handleErrors(500, "Internal server error"));
  }
};

const findWorkerById = async (req, res, next) => {
  try {
    const { worker_id } = req.params; 
    if (!worker_id) {
      return next(handleErrors(400, "Worker ID is required."));
    }

    const worker = await Worker.findOne({
      _id: worker_id,
      current_userId: req.user.id, 
    });

    if (!worker) {
      return next(handleErrors(404, "Worker not found or unauthorized."));
    }

    return res.status(200).json({
      success: true,
      message: "Worker fetched successfully.",
      worker: worker,
    });
  } catch (error) {
    console.error("Error fetching worker:", error);
    return next(handleErrors(500, "Internal server error"));
  }
};





const workerUpdate = async (req, res, next) => {
  try {
    const { worker_id, worker_age, worker_address, worker_gender, worker_mobile_number } = req.body;

    if (!worker_id) {
      return next(handleErrors(400, "Worker ID is required for update."));
    }

    const existWorker = await Worker.findOne({
      _id: worker_id,
      current_userId: req.user.id,
    });

    if (!existWorker) {
      return next(handleErrors(404, "Worker not found or unauthorized."));
    }

    
    if (worker_age !== undefined) existWorker.worker_age = worker_age;
    if (worker_address !== undefined) existWorker.worker_address = worker_address;
    if (worker_gender !== undefined) existWorker.worker_gender = worker_gender;
    if (worker_mobile_number !== undefined) existWorker.worker_mobile_number = worker_mobile_number;

    await existWorker.save();

  
    res.status(200).json({
      success: true,
      message: "Worker updated successfully",
      worker: existWorker,
    });

    
    if (req.file) {
      try {
        if (existWorker.worker_public_id) {
          await cloudinary.uploader.destroy(existWorker.worker_public_id);
        }

        const updatedFields = {
          worker_image: req.file.path,
          worker_public_id: req.file.filename,
        };

        await Worker.findByIdAndUpdate(worker_id, updatedFields, { new: true });
      } catch (imgErr) {
        console.error("Background image upload failed:", imgErr);
        
      }
    }

  } catch (error) {
    console.error("Error updating worker:", error);
    return next(handleErrors(500, "Internal server error"));
  }
};




module.exports = { createWorker, showWorker, workerUpdate, deleteWorker,findWorkerById };
