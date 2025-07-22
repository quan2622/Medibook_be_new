import db from "../models/index";
import CRUDService from "../services/CRUD.service";

let getHomePage = async (req, res) => {
  try {
    let data = await db.User.findAll();

    res.render("homePage.ejs", {
      data: JSON.stringify(data),
    });
  } catch (error) {
    console.log(error);
  }
};

let getAboutPage = (req, res) => {
  res.render("test/about.ejs");
};

// GET /crud
let getCRUD = (req, res) => {
  res.render("crud.ejs");
};

// POST /post-crud
let postCRUD = async (req, res) => {
  let message = await CRUDService.createNewUser(req.body);
  console.log(message);
  res.send("post crud");
};

// GET /get-crud
let displayGetCRUD = async (req, res) => {
  let data = await CRUDService.getAllUsers();
  res.render("displayCRUD.ejs", {
    dataTable: data,
  });
};

// GET /edit-crud?id=...
let getEditCRUD = async (req, res) => {
  let id = req.query.id;
  if (id) {
    let userData = await CRUDService.getUserInfoById(id);
    if (userData) {
      return res.render("editCRUD.ejs", {
        user: userData,
      });
    }
  } else {
    return res.send("User not found");
  }
};

//  PUT /put-crud
let putCRUD = async (req, res) => {
  let data = req.body;
  let user = await CRUDService.updateUserData(data);
  return res.render("displayCRUD.ejs", {
    dataTable: user,
  });
};

// DELETE /delete-crud
let deleteCRUD = async (req, res) => {
  let id = req.query.id;
  if (id) {
    await CRUDService.deleteUserById(id);
    return res.send("Delete user success");
  } else P;
  return res.send("User not found");
};

export default {
  getHomePage: getHomePage,
  getAboutPage: getAboutPage,
  getCRUD: getCRUD,
  postCRUD: postCRUD,
  displayGetCRUD: displayGetCRUD,
  getEditCRUD: getEditCRUD,
  putCRUD: putCRUD,
  deleteCRUD: deleteCRUD,
};
