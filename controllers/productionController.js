const Production = require("../models/production.model");
const handleErrors = require("../services/handleErrors");
const addProduction = async (req, res, next) => {
    try {
        const { production_name, production_unit } = req.body;

        
        if (!production_name || !production_unit) {
            return next(handleErrors(400, "Enter production name and unit"));
        }

        const userId = req.user?.id;
        if (!userId) {
            return next(handleErrors(401, "Unauthorized: Please log in."));
        }
 
        const newProduction = new Production({
            production_name,
            production_unit,
            current_userId: userId
        });

        await newProduction.save();

        return res.status(201).json({
            success: true,
            message: "Production added successfully",
            data: newProduction
        });

    } catch (error) {
        return next(handleErrors(500, "Internal Server Error, Production add not success."));
    }
};


const showProduction = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(handleErrors(401, "Unauthorized: Please log in to access production data."));
        }

        const productions = await Production.find({ current_userId: userId }).sort({ created: -1 });


        if (!productions || productions.length === 0) {
            return next(handleErrors(404, "No production records found for this user."));
        }

        return res.status(200).json({
            success: true,
            message: "Production data retrieved successfully.",
            data: productions
        });

    } catch (error) {
        return next(handleErrors(500, "An error occurred while fetching production data. Please try again later."));
    }
};

const deleteProduction = async (req, res) => {
    try {
        const { productionId } = req.params; 
        const userId = req.user._id;
        

        const deletedProduction = await Production.findOneAndDelete({
            _id: productionId,
            current_userId: userId
        });

        if (!deletedProduction) {
            return res.status(404).json({ message: "Production not found or you don't have permission to delete." });
        }

        res.status(200).json({success:true, message: "Production deleted successfully!" });

    } catch (error) {
        console.error("Error deleting production:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



const addProductionDetails = async (req, res) => {
    try {
        const { productionId } = req.params;  
        const { shift, quantity, ratePerUnit, date } = req.body; 
        const userId = req.user?.id;
        if (!userId) {
            return next(handleErrors(401, "Unauthorized: Please log in to access production data."));
        }
        if ( !quantity || !ratePerUnit) {
            return res.status(400).json({ message: "All fields are required." });
        }
         const production = await Production.findOne({ _id: productionId, current_userId: userId })
        if (!production) {
            return res.status(404).json({ message: "Production not found." });
        }

        production.productionDetails.push({
            shift,
            quantity,
            ratePerUnit,
            date: date || new Date()
        });

        await production.save();

        res.status(200).json({
            success: true,
            message: "Production details added successfully.",
            production
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};






const getProductionByIdAndUser = async (req, res) => {
    try {
        const { id } = req.params;  
        const userId = req.user?.id;  

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: Please log in to access production data." });
        }

       
        const production = await Production.findOne(
            { _id: id, current_userId: userId },
            { productionDetails: 1, _id: 0 }  
        );

        if (!production) {
            return res.status(404).json({ message: "Production details not found" });
        }

       
        const groupedData = {};

        production.productionDetails.forEach((entry) => {
            const dateKey = new Date(entry.date).toISOString().split('T')[0]; 
            if (!groupedData[dateKey]) {
                groupedData[dateKey] = {
                    Morning: [],
                    Afternoon: [],
                    Evening: []
                };
            }
            groupedData[dateKey][entry.shift].push(entry);
        });

        res.status(200).json(groupedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const deleteProductionDetail = async (req, res, next) => {
    try {
        const { productionId, productionDetailId } = req.body;
        const userId = req.user._id;

       

        const updatedProduction = await Production.findOneAndUpdate(
            { _id: productionId, current_userId: userId },
            { 
                $pull: { productionDetails: { _id: productionDetailId } } 
            },
            { new: true }
        );

        if (!updatedProduction) {
            return next(handleErrors(404, "Production not found or you don't have permission to delete."));
        }

        res.status(200).json({ success: true, message: "Production detail deleted successfully!" });

    } catch (error) {
        console.error("Error deleting production detail:", error);
        return next(handleErrors(500, "Internal Server Error - Unable to delete production detail."));
    }
};



module.exports = { addProduction,showProduction,  addProductionDetails, getProductionByIdAndUser, deleteProductionDetail, deleteProduction };
