import paitentService from "../services/pateint.service"

// POST /api/post-booking-appoinment
const postBookingAppoinment = async (req, res) => {
  try {
    const data = await paitentService.postBookingAppoinment(req.body);
    return res.status(200).json({ ...data });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: 1,
      EM: "Error when post booking appoinment!"
    })
  }
}

// POST /api/verify-booking-appoinment
const postVerifyBookingAppoinment = async (req, res) => {
  try {
    const data = await paitentService.postVerifyBookingAppoinment(req.body);
    return res.status(200).json({ ...data });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: 1,
      EM: "Error when verify booking appoinment!"
    })
  }
}

// GET /api/get-booking-appoinment/:token
const getDataAppoinment = async (req, res) => {
  try {
    const data = await paitentService.getDataAppoinment(req.params.token);
    return res.status(200).json({ ...data });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      EC: 1,
      EM: "Error when get data booking appoinment!"
    })
  }
}

export default {
  postBookingAppoinment,
  postVerifyBookingAppoinment,
  getDataAppoinment,
}