import clinicService from "../services/clinic.service";

// POST /api/create-new-clinic
const createNewClinic = async (req, res) => {
  try {
    const data = await clinicService.createNewClinicService(req.body);
    return res.status(200).json({ ...data });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: 1,
      EM: "Error when create new clinic!"
    })
  }
}

// GET /api/get-all-clinic
const getAllClinic = async (req, res) => {
  try {
    const data = await clinicService.getAllClinicService();
    return res.status(200).json({ ...data });

  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: 1,
      EM: "Error when get all clinic!"
    })
  }
}

// GET /api/get-detail-clinic
const getDetailClinic = async (req, res) => {
  try {
    const { id } = req.query;
    const data = await clinicService.getDetailClinicService(id);
    return res.status(200).json({ ...data });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: 1,
      EM: "Error when get detail clinic!"
    })
  }
}


export default {
  createNewClinic,
  getAllClinic,
  getDetailClinic
}