import userService from "../services/user.service"

// POST /api/login
const hanleLogin = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(500).json({
      EC: 1,
      message: "Missing inputs parameter",
    })
  }

  let userData = await userService.handleUserLogin(email, password);

  return res.status(200).json({
    EC: userData.EC,
    EM: userData.EM,
    user: userData.user ? userData.user : {}
  })
}

// GET /api/get-all-user
const getAllUser = async (req, res, next) => {
  let { id } = req.query;
  if (!id) {
    return res.status(500).json({
      EC: 1,
      message: "Missing required parameter",
      user: [],
    })
  }

  const user = await userService.getAllUser(id);
  res.status(200).json({
    EC: 0,
    EM: "OK",
    user
  })
}

// POST /api/create-user
const createUser = async (req, res, next) => {
  const response = await userService.createNewUser(req.body);
  return res.status(200).json({ ...response })
}

// PUT /api/edit-user
const editUser = async (req, res, next) => {
  const response = await userService.updateUserData(req.body);
  return res.status(200).json({ ...response })
}

// DELETE /api/delete-user
const deleteUser = async (req, res, next) => {
  const { userId } = req.body;
  if (!userId)
    return res.status(200).json({
      EC: 1,
      EM: "Missing required parameters"
    });
  const response = await userService.deleteUserById(userId);
  return res.status(200).json({ ...response })
}

const getAllCode = async (req, res, next) => {
  try {

    let data = await userService.getAllCodeService(req.query.type);
    return res.status(200).json(data);
  } catch (error) {
    console.log("Get all_code server: ", error);
    return res.status(200).json({
      EC: -1,
      EM: "Error form server"
    });
  }
}

let handleLoginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(200).json({ errCode: 1, errMessage: 'Missing token' });
    } else {
      const result = await userService.handleGooogleLogin(token);
      return res.status(200).json(result);
    }

  } catch (error) {
    console.log("login error", error)
    return res.status(200).json({
      errCode: -1,
      errMessage: 'Error from server!'
    })
  }
}

export default {
  handleLoginWithGoogle,
  hanleLogin,
  getAllUser,
  createUser,
  editUser,
  deleteUser,
  getAllCode,
}