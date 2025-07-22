import db from "../models";

const createNewClinicService = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!payload.nameClinic || !payload.imageClinic || !payload.descriptionHTML || !payload.descriptionMarkdown || !payload.addressClinic) {
        return resolve({ EC: 1, EM: "Missing required params" })
      } else {
        const res = await db.Clinic.create({
          name: payload.nameClinic,
          address: payload.addressClinic,
          image: payload.imageClinic,
          descriptionHTML: payload.descriptionHTML,
          descriptionMarkdown: payload.descriptionMarkdown,
        });

        if (!res) {
          return resolve({ EC: 2, EM: "Cannot create new clinic!" });
        }
        resolve({ EC: 0, EM: "Create new clinic success" })
      }
    } catch (error) {
      reject(error);
    }
  })
}

const getAllClinicService = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await db.Clinic.findAll({
        attributes: {
          exclude: ['descriptionMarkdown'],
        },
        raw: false,
      });
      if (data) {
        data.map(item => item.image = Buffer.from(item.image, 'base64').toString('binary'));
        return resolve({ EC: 0, EM: "OK", data });
      } else return resolve({ EC: 0, EM: "Faild", data: [] });
    } catch (error) {
      reject(error);
    }
  })
}
const getDetailClinicService = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) return resolve({ EC: 1, EM: "Missing required params" });

      const specialty = await db.Clinic.findOne({
        where: { id },
        attributes: ["descriptionHTML", "image", "name", "address"]
      });
      if (specialty) {
        if (specialty.image) specialty.image = Buffer.from(specialty.image, 'base64').toString('binary');

        let doctorInfos = [];
        doctorInfos = await db.Doctor_Info.findAll({
          where: { clinicId: id },
          attributes: ["doctorId", "provinceId"]
        });

        specialty.doctorInfos = doctorInfos;
        resolve({ EC: 0, EM: "OKE", data: specialty });
      } else {
        resolve({ EC: 0, EM: "No data", data: [] });
      }
    } catch (error) {
      reject(error);
    }
  })
}

export default {
  createNewClinicService,
  getAllClinicService,
  getDetailClinicService
}