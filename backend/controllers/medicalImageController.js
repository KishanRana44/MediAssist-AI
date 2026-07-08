const MedicalImage =
require("../models/MedicalImage");

const Patient =
require("../models/Patient");

const {
 generateMedicalAnalysis
} = require("../ai/geminiService");

const uploadImage = async (
 req,
 res
) => {
 try {

  const patient =
   await Patient.findOne({
    userId: req.user._id,
   });

  if (!patient) {
   return res.status(404).json({
    message:
     "Patient profile not found",
   });
  }

  const aiResult =
   await generateMedicalAnalysis(
    "medical image",
    req.file.path
   );

  let parsedResult = {};

  try {
   parsedResult =
    JSON.parse(aiResult);
  } catch {
   parsedResult = {
    prediction:
     "Analysis Available",
    confidence: 85,
    findings: aiResult,
    recommendation:
     "Consult doctor",
    riskLevel: "Medium",
   };
  }

  const image =
   await MedicalImage.create({
    patientId: patient._id,
    imageType:
     req.body.imageType,
    imageUrl:
     req.file.path,

    findings:
     parsedResult.findings,

    confidence:
     parsedResult.confidence,

    prediction:
     parsedResult.prediction,

    recommendation:
     parsedResult.recommendation,

    riskLevel:
     parsedResult.riskLevel,
   });

  res.status(201).json({
   success: true,
   image,
  });

 } catch (error) {
  res.status(500).json({
   message: error.message,
  });
 }
};
const getImages = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      userId: req.user._id,
    });

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }

    const images = await MedicalImage.find({
      patientId: patient._id,
    });

    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const saveImageResult = async (req, res) => {
  try {
    const {
      imageId,
      prediction,
      confidence,
      findings,
      recommendation,
      riskLevel,
    } = req.body;

    const image =
      await MedicalImage.findByIdAndUpdate(
        imageId,
        {
          prediction,
          confidence,
          findings,
          recommendation,
          riskLevel,
        },
        { new: true }
      );

    if (!image) {
      return res.status(404).json({
        message: "Image not found",
      });
    }

    res.status(200).json({
      success: true,
      image,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  uploadImage,
  getImages,
  saveImageResult,
};