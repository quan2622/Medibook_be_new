import specialtyService from "../services/specialty.service";

// POST /api/create-new-specialty
const createNewSpecialty = async (req, res) => {
  try {
    const data = await specialtyService.createNewSpecialty(req.body);
    return res.status(200).json({ ...data });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: 1,
      EM: "Error when createnew specialty!"
    })
  }
}

// GET /api/get-all-specialty
const getAllSpecialty = async (req, res) => {
  try {
    const data = await specialtyService.getAllSpecialty();
    return res.status(200).json({ ...data });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: 1,
      EM: "Error when get all specialty!"
    })
  }
}

// GET /api/get-detail-specialty
const getDetailSpecialty = async (req, res) => {
  try {
    const { id, location } = req.query;
    const data = await specialtyService.getDetailSpecialty(id, location);
    return res.status(200).json({ ...data });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: 1,
      EM: "Error when get detail specialty!"
    })
  }
}

export default {
  createNewSpecialty,
  getAllSpecialty,
  getDetailSpecialty
}