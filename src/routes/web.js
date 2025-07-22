import express from "express";
import homeController from "../controllers/home.controller";
import userController from "../controllers/user.controller"
import doctorController from "../controllers/doctor.controller";
import pateintController from "../controllers/pateint.controller"
import specialtyController from "../controllers/specialty.controller";
import clinicController from "../controllers/clinic.controller";

let router = express.Router();

let initWebRoutes = (app) => {
  router.get("/", homeController.getHomePage);
  router.get("/about", homeController.getAboutPage);
  router.get("/crud", homeController.getCRUD);
  router.post("/post-crud", homeController.postCRUD);
  router.get("/get-crud", homeController.displayGetCRUD);
  router.get("/edit-crud", homeController.getEditCRUD);
  router.post("/put-crud", homeController.putCRUD);
  router.get("/delete-crud", homeController.deleteCRUD);

  router.post("/api/login", userController.hanleLogin);
  router.get("/api/get-all-user", userController.getAllUser)
  router.post("/api/create-user", userController.createUser)
  router.put("/api/edit-user", userController.editUser)
  router.delete("/api/delete-user", userController.deleteUser)

  router.get("/api/allcode", userController.getAllCode)

  router.get('/api/top-doctor-home', doctorController.getTopDoctorHome)
  router.get('/api/get-all-doctor', doctorController.getAllDoctor)
  router.post('/api/save-detail-doctor', doctorController.createNewDetailDoctor)
  router.get('/api/get-detail-doctor', doctorController.getDetailDoctor)
  router.post('/api/bulk-create-schedule', doctorController.bulkCreateSchedule)
  router.get('/api/get-schedule-doctor', doctorController.getScheduleDoctor)
  router.get('/api/get-extra-info-doctor-by-id/:doctorId', doctorController.getExtraInfoDoctorById)
  router.get('/api/get-profile-doctor-by-id/:doctorId', doctorController.getProfileDoctorById)

  router.get('/api/get-list-patient-for-doctor', doctorController.getListPatientForDoctor)
  router.post('/api/send-remedy', doctorController.sendRemedy)

  router.post('/api/post-booking-appoinment', pateintController.postBookingAppoinment)
  router.post('/api/verify-booking-appoinment', pateintController.postVerifyBookingAppoinment)
  router.get('/api/get-booking-appoinment/:token', pateintController.getDataAppoinment)

  router.post('/api/create-new-specialty', specialtyController.createNewSpecialty)
  router.get('/api/get-all-specialty', specialtyController.getAllSpecialty)
  router.get('/api/get-detail-specialty', specialtyController.getDetailSpecialty)

  router.post('/api/create-new-clinic', clinicController.createNewClinic)
  router.get('/api/get-all-clinic', clinicController.getAllClinic)
  router.get('/api/get-detail-clinic', clinicController.getDetailClinic)


  return app.use("/", router);
};

module.exports = initWebRoutes;
