const Partner = require("../models/partener.model");
const handleErrors = require("../services/handleErrors");
const { cloudinary } = require("../config/cloudinary.config");
const fs = require("fs");
const { Console } = require("console");

const createPartner = async (req, res, next) => {
  try {
    const { partner_name, partner_mobile_number } = req.body;
    const userId = req.user?.id;

    if (!partner_name || !partner_mobile_number) {
      return next(handleErrors(400, "All fields are required"));
    }

    const existingPartner = await Partner.findOne({ partner_mobile_number });

    if (existingPartner) {
      return next(
        handleErrors(409, "Partner with this mobile number already exists")
      );
    }

    const newPartner = await Partner.create({
      partner_name,
      partner_mobile_number,
      current_userId: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Partner created successfully",
      data: newPartner,
    });
  } catch (error) {
    return next(handleErrors(500, error.message || "Internal Server Error"));
  }
};

const showPartner = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const partners = await Partner.find({ current_userId: userId }).sort({
      createdAt: -1,
    });

    if (partners.length === 0) {
      return next(handleErrors(404, "No partners found for this user."));
    }

    return res.status(200).json({
      success: true,
      message: "Partners fetched successfully.",
      partners: partners,
    });
  } catch (error) {
    console.error("Error fetching partners:", error);
    return next(handleErrors(500, "Internal server error"));
  }
};

const findPartnerById = async (req, res, next) => {
  try {
    const { partner_id } = req.params;

    if (!partner_id) {
      return next(handleErrors(400, "Partner ID is required."));
    }

    const partner = await Partner.findOne({
      _id: partner_id,
      current_userId: req.user.id,
    });

    if (!partner) {
      return next(handleErrors(404, "Partner not found or unauthorized."));
    }

    return res.status(200).json({
      success: true,
      message: "Partner fetched successfully.",
      partner: partner,
    });
  } catch (error) {
    console.error("Error fetching partner:", error);
    return next(handleErrors(500, "Internal server error"));
  }
};

const deletePartner = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(handleErrors(400, "Partner ID is required."));
    }

    const partner = await Partner.findOne({
      current_userId: req.user.id,
      _id: id,
    });

    if (!partner) {
      return next(handleErrors(404, "Partner not found or unauthorized."));
    }

    if (partner.partner_image && partner.partner_public_id) {
      try {
        await cloudinary.uploader.destroy(partner.partner_public_id);
      } catch (deleteError) {
        console.error("Failed to delete image from Cloudinary:", deleteError);
      }
    }

    await Partner.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Partner and related records deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting partner:", error);
    return next(handleErrors(500, "Internal server error"));
  }
};





const partnerUpdate = async (req, res, next) => {
  try {
    const {
      partner_id,
      partner_mobile_number,
      partner_address,
      partner_gender,
    } = req.body;

    if (!partner_id) {
      return next(handleErrors(400, "Partner ID is required for update."));
    }

    const existPartner = await Partner.findOne({
      _id: partner_id,
      current_userId: req.user.id,
    });

    if (!existPartner) {
      return next(handleErrors(404, "Partner not found or unauthorized."));
    }

    if (
      partner_mobile_number === undefined &&
      partner_address === undefined &&
      partner_gender === undefined &&
      !req.file
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field (mobile number, address, gender, or image) is required to update.",
      });
    }

    
    if (partner_mobile_number !== undefined)
      existPartner.partner_mobile_number = partner_mobile_number;

    if (partner_address !== undefined)
      existPartner.partner_address = partner_address;

    if (partner_gender !== undefined)
      existPartner.partner_gender = partner_gender;

    await existPartner.save();

    
    res.status(200).json({
      success: true,
      message: req.file
        ? "Partner updated successfully. Image upload in background."
        : "Partner updated successfully.",
      partner: existPartner,
    });

 
    if (req.file) {
      try {
        if (existPartner.partner_public_id) {
          await cloudinary.uploader.destroy(existPartner.partner_public_id);
        }

        const updatedFields = {
          partner_image: req.file.path,
          partner_public_id: req.file.filename,
        };

        await Partner.findByIdAndUpdate(partner_id, updatedFields, { new: true });
      } catch (imgErr) {
        console.error("Background image upload failed:", imgErr);
      }
    }
  } catch (error) {
    console.error("Error updating partner:", error);
    return next(handleErrors(500, "Internal server error"));
  }
};


module.exports = {
  createPartner,
  showPartner,
  partnerUpdate,
  deletePartner,
  findPartnerById,
};
