const { where, Op } = require("sequelize");
const db = require("../models");
import _ from 'lodash'
import emailService from "./email.service";
require('dotenv').config();

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

const getTopDoctorHome = (limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = {};
      const data = await db.User.findAll({
        where: {
          roleId: "R2",
        },
        limit: limit,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password'] },
        include: [
          { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
          { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },
        ],
        raw: true,
        nest: true,
      });
      if (data) {
        response.EC = 0;
        response.EM = "Get data success";
        response.data = data;
      } else {
        response.EC = 3;
        response.EM = "Get data failed";
      }
      resolve(response);
    } catch (error) {
      reject(error);
    }
  })
}

const getAllDoctor = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const doctors = await db.User.findAll({
        where: { roleId: "R2" },
        attributes: { exclude: ['password', 'image'] }
      })
      resolve({
        EC: 0,
        EM: "Get all doctor success",
        data: doctors
      });
    } catch (error) {
      reject(error);
    }
  })
}

const checkRquiredFields = (data) => {
  const arr = ["doctorId", "contentHTML", "contentMarkdown", "action", "selectedPrice", "selectedPayment", "selectedProvince", "selectedSpecialty", "selectedClinic", "nameClinic", "addressClinic",];

  const missingFields = arr.filter(item => !hasData(data[item]));

  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}

const hasData = (value) => {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

const createNewDetailDoctor = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { isValid, missingFields } = checkRquiredFields(payload)
      if (!isValid) // pass ? true : flase
        return resolve({ EC: 2, EM: "Missing required params", EF: missingFields });

      // UPSERT MARKDOWN
      if (payload.action === "CREATE") {
        await db.Markdown.create({
          contentHTML: payload.contentHTML,
          contentMarkdown: payload.contentMarkdown,
          description: payload.description,
          doctorId: payload.doctorId,
          specialtyId: +payload.selectedSpecialty,
          clinicId: +payload.selectedClinic,
        })
      } else if (payload.action === "EDIT") {
        const res = await db.Markdown.update(
          {
            contentHTML: payload.contentHTML,
            contentMarkdown: payload.contentMarkdown,
            description: payload.description,
            specialtyId: +payload.selectedSpecialty,
            clinicId: +payload.selectedClinic,
          },
          { where: { doctorId: payload.doctorId } }
        )
        if (res[0] === 0) resolve({ EC: 3, EM: "Markdown doctor not found" })
      }

      // UPSERT DOCTOR INFO
      const [doctorInfo, created] = await db.Doctor_Info.upsert({
        doctorId: payload.doctorId,
        specialtyId: +payload.selectedSpecialty, // INTERGER
        clinicId: +payload.selectedClinic, // INTERGER
        priceId: payload.selectedPrice,
        provinceId: payload.selectedProvince,
        paymentId: payload.selectedPayment,
        addressClinic: payload.addressClinic,
        nameClinic: payload.nameClinic,
        note: payload.note,
      });

      if (created) {
        resolve({ EC: 0, EM: "Created Doctor Info Successed" });
      } else {
        resolve({ EC: 0, EM: "Update Doctor Info Successed" });
      }

      resolve({ EC: 0, EM: " Save Markdown Success" });
    } catch (error) {
      reject(error);
    }
  })
}

const getDetailDoctorById = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await db.User.findOne({
        where: { id: doctorId },
        attributes: {
          exclude: ['password'],
        },
        include: [
          { model: db.Markdown, as: 'markdown_data', attributes: ["description", "contentMarkdown", "contentHTML"] },
          { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
          {
            model: db.Doctor_Info, as: 'doctor_info',
            attributes: {
              exclude: ['id', 'doctorId']
            },
            include: [
              { model: db.Allcode, as: 'price_data', attributes: ['valueEn', 'valueVi'] },
              { model: db.Allcode, as: 'payment_data', attributes: ['valueEn', 'valueVi'] },
              { model: db.Allcode, as: 'province_data', attributes: ['valueEn', 'valueVi'] },
            ],
          },
        ],
        raw: false,
        nest: true,
      });

      // console.log("Full result:", JSON.stringify(res, null, 2));
      if (!res) resolve({ EC: 3, EM: "Cannot find doctor" });
      if (res.image) {
        res.image = Buffer.from(res.image, 'base64').toString('binary');
      }
      resolve({ EC: 0, EM: "Get detail success", detail: res });
    } catch (error) {
      reject(error);
    }
  })
}

const getMarkDownDoctor = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await db.Markdown.findOne({
        where: { doctorId: doctorId },
        attributes: ['contentHTML', 'contentMarkdown', 'description']
      });

      const doctorInfo = await db.Doctor_Info.findOne({
        where: { doctorId: doctorId },
        attributes: {
          exclude: ['id', 'doctorId']
        }
      })

      const newData = _.cloneDeep(res);

      if (!newData) resolve({ EC: 3, EM: "Cannot find doctor", detail: {} });

      newData.doctorInfo = doctorInfo;
      resolve({ EC: 0, EM: "Get markdown doctor success", detail: newData });
    } catch (error) {
      reject(error);
    }
  })
}

const bulkCreateSchedule = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!payload && !payload.data) resolve({ EC: 1, EM: "Missing required params" });
      else {
        let scheduleData = payload.data;
        scheduleData = scheduleData.map(item => ({
          ...item,
          maxNumber: MAX_NUMBER_SCHEDULE,
        }));

        // get existing schedule
        const { doctorId, date } = scheduleData[0];
        let existSchedule = await db.Schedule.findAll({
          where: { doctorId: doctorId, date: date },
          attributes: ['maxNumber', 'date', 'timeType', 'doctorId']
        });

        // compare schedule
        const diffSchedule = _.differenceWith(scheduleData, existSchedule, (a, b) => {
          return a.timeType === b.timeType && +a.date === +b.date;
        })

        const diffScheduleSub = _.differenceWith(existSchedule, scheduleData, (a, b) => {
          return a.timeType === b.timeType && +a.date === +b.date;
        })
        if (diffSchedule && diffSchedule.length > 0) {
          await db.Schedule.bulkCreate(diffSchedule);
          resolve({ EC: 0, EM: "Save schedule success" });
        }

        if (diffScheduleSub && diffScheduleSub.length > 0) {
          await db.Schedule.destroy({ where: { [Op.or]: diffScheduleSub } });
          resolve({ EC: 0, EM: "Save schedule success" });
        }
        resolve({ EC: 0, EM: "Cannot save more schedule!" });
      }
    } catch (error) {
      reject(error);
    }
  })
}

const getScheduleDoctor = (doctorId, day) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!day && !doctorId) resolve({ EC: 1, EM: "Missing required params" });
      else {
        let data = await db.Schedule.findAll({
          where: { doctorId: doctorId, date: day },
          include: [
            { model: db.Allcode, as: 'scheduleData', attributes: ['valueEn', 'valueVi'] },
            {
              model: db.User, as: 'profile_doctor',
              attributes: ['firstName', 'lastName'],
              include: { model: db.Doctor_Info, as: "doctor_info", attributes: ["nameClinic", "addressClinic"] }
            },
          ],
          raw: true,
          nest: true,
        });
        if (!data) data = [];
        resolve({ EC: 0, data: data });
      }
    } catch (error) {
      reject(error);
    }
  })

}

const getExtraInfoDoctorById = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId) {
        resolve({ EC: 1, EM: "Missing required params" });
      }
      else {
        const res = await db.Doctor_Info.findOne({
          where: { doctorId: doctorId },
          attributes: { exclude: ['id', 'doctorId', 'createdAt', 'updatedAt'] },
          include: [
            { model: db.Allcode, as: 'price_data', attributes: ['valueEn', 'valueVi'] },
            { model: db.Allcode, as: 'payment_data', attributes: ['valueEn', 'valueVi'] },
            { model: db.Allcode, as: 'province_data', attributes: ['valueEn', 'valueVi'] },
          ],
          raw: false,
          nest: true,
        });

        if (!res) {
          resolve({ EC: 2, EM: "Cannot find doctor info", infoDoctor: {} })
        }
        resolve({ EC: 0, EM: "OK", infoDoctor: res });
      }
    } catch (error) {
      reject(error);
    }
  })
}

const getProfileDoctorById = (doctorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId) {
        resolve({ EC: 1, EM: "Missing required params" });
      }
      else {
        const res = await db.User.findOne({
          where: { id: doctorId },
          attributes: {
            exclude: ['password'],
          },
          include: [
            { model: db.Markdown, as: 'markdown_data', attributes: ['description'] },
            { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
            {
              model: db.Doctor_Info, as: 'doctor_info',
              attributes: {
                exclude: ['id', 'doctorId']
              },
              include: [
                { model: db.Allcode, as: 'price_data', attributes: ['valueEn', 'valueVi'] },
                { model: db.Allcode, as: 'payment_data', attributes: ['valueEn', 'valueVi'] },
                { model: db.Allcode, as: 'province_data', attributes: ['valueEn', 'valueVi'] },
              ],
            },
          ],
          raw: false,
          nest: true,
        });

        // console.log("Full result:", JSON.stringify(res, null, 2));
        if (!res) resolve({ EC: 3, EM: "Cannot find doctor" });
        if (res.image) {
          res.image = Buffer.from(res.image, 'base64').toString('binary');
        }
        resolve({ EC: 0, EM: "Get detail success", profile: res });
      }
    } catch (error) {
      reject(error);
    }
  })
}

const getListPatientForDoctor = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        return resolve({ EC: 1, EM: "Missing required params" });
      } else {
        const res = await db.Booking.findAll({
          where: { doctorId, date, statusId: 'S2' },
          attributes: { exclude: ['tokenConfirm'] },
          include: [
            { model: db.Allcode, as: 'time_data', attributes: ['valueVi', 'valueEn'] },
            {
              model: db.User,
              as: "user_data",
              attributes: ['firstName', 'lastName', 'email', 'gender', 'phoneNumber', 'address'],
              include: { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] }
            }
          ],
          raw: true,
          nest: true,
        })
        if (res) resolve({ EC: 0, EM: "OK", data: res })
        else resolve({ EC: 0, EM: "Booking not found!" })
      }
    } catch (error) {
      reject(error);
    }
  })
}


const sendRemedy = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!payload.doctorId || !payload.email || !payload.patientId || !payload.timeType) {
        return resolve({ EC: 1, EM: "Missing required params" });
      } else {
        const update_appoinment = await db.Booking.update(
          {
            statusId: "S3",
          },
          {
            where: {
              doctorId: payload.doctorId,
              patientId: payload.patientId,
              timeType: payload.timeType,
              statusId: "S2"
            },
          },
        )
        if (update_appoinment[0] !== 0) {
          const patient = await db.User.findOne({ where: { id: payload.patientId } });
          await emailService.sendAttatchment(patient.email, payload);

          resolve({ EC: 0, EM: "Send remery success" });
        } else resolve({ EC: 2, EM: "Not found data booking" });
      }
    } catch (error) {
      reject(error);
    }
  })
}

module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctor: getAllDoctor,
  createNewDetailDoctor: createNewDetailDoctor,
  getDetailDoctorById: getDetailDoctorById,
  getMarkDownDoctor: getMarkDownDoctor,
  bulkCreateSchedule: bulkCreateSchedule,
  getScheduleDoctor: getScheduleDoctor,
  getExtraInfoDoctorById: getExtraInfoDoctorById,
  getProfileDoctorById: getProfileDoctorById,
  getListPatientForDoctor: getListPatientForDoctor,
  sendRemedy: sendRemedy,
}