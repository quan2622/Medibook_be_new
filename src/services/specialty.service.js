import db from "../models"

const createNewSpecialty = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!payload.nameSpecialty || !payload.imageSpecialty || !payload.descriptionHTML || !payload.descriptionMarkdown) {
        return resolve({ EC: 1, EM: "Missing required params" })
      } else {
        const res = await db.Specialty.create({
          name: payload.nameSpecialty,
          image: payload.imageSpecialty,
          descriptionHTML: payload.descriptionHTML,
          descriptionMarkdown: payload.descriptionMarkdown,
        });

        if (!res) {
          return resolve({ EC: 2, EM: "Cannot create new specialty!" });
        }
        resolve({ EC: 0, EM: "Create new specialty success" })
      }
    } catch (error) {
      reject(error)
    }
  })
}

const getAllSpecialty = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await db.Specialty.findAll({ raw: false });

      if (data) {
        data.map(item => item.image = Buffer.from(item.image, 'base64').toString('binary'))
        return resolve({ EC: 0, EM: "Get All Specialty Successed", data });
      } else return resolve({ EC: 0, EM: "Get All Specialty Failed" });
    } catch (error) {
      reject(error);
    }
  })
}

const getDetailSpecialty = (id, location) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id || !location) return resolve({ EC: 1, EM: "Missing required params" });

      const specialty = await db.Specialty.findOne({
        where: { id },
        attributes: ["descriptionHTML", "image"]
      });
      if (specialty) {
        if (specialty.image) specialty.image = Buffer.from(specialty.image, 'base64').toString('binary');
        let doctorInfos = [];
        if (location === "ALL") {
          doctorInfos = await db.Doctor_Info.findAll({
            where: { specialtyId: id },
            attributes: ["doctorId", "provinceId"]
          });
        } else {
          doctorInfos = await db.Doctor_Info.findAll({
            where: { specialtyId: id, provinceId: location },
            attributes: ["doctorId", "provinceId"]
          });
        }
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
  createNewSpecialty,
  getAllSpecialty,
  getDetailSpecialty,
}