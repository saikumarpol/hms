
import Patient from "./models/patient.model.js";
import Counter from "./models/counter.model.js";

const generateUHID = async () => {
  const year = new Date().getFullYear();
  const counterId = `PATIENT_${year}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return `HMS-${year}-${String(counter.sequence).padStart(6, "0")}`;
};

export const registerPatient = async (data, currentUser) => {
  const uhid = await generateUHID();

  const patient = await Patient.create({
    ...data,
    dateOfBirth: new Date(data.dateOfBirth),
    email: data.email || null,
    bloodGroup: data.bloodGroup || null,
    address: data.address || null,
    emergencyContact: data.emergencyContact || null,
    uhid,
    createdBy: currentUser.userId,
  });

  return patient;
};

export const getPatients = async (search) => {
  const query = {};

  if (search) {
    query.$or = [
      { uhid: { $regex: search, $options: "i" } },
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  return Patient.find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("createdBy", "name role");
};

export const getPatientById = async (id) => {
  const patient = await Patient.findById(id);

  if (!patient) {
    const error = new Error("Patient not found");
    error.statusCode = 404;
    throw error;
  }

  return patient;
};
