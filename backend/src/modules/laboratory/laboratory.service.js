
import mongoose from "mongoose";

import LabTest from "./models/lab-test.model.js";
import LabOrder from "./models/lab-order.model.js";
import Consultation from "../consultations/models/consultation.model.js";
import Doctor from "../doctors/models/doctor.model.js";
import Counter from "../patients/models/counter.model.js";

// ======================================================
// COMMON HELPERS
// ======================================================

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const counterId = `lab-order-${year}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return `LAB-${year}-${String(counter.sequence).padStart(6, "0")}`;
};

const getDoctorForUser = async (userId) => {
  return Doctor.findOne({ user: userId });
};

const ensureDoctorOwnsOrder = async (order, user) => {
  // Super Admin and other authorized roles do not require
  // a doctor profile.
  if (user.role !== "doctor") return;

  const doctor = await getDoctorForUser(user.userId);

  if (!doctor) {
    throw createError("Doctor profile not found", 403);
  }

  const orderDoctorId = String(
    order.doctor?._id ?? order.doctor
  );

  if (orderDoctorId !== doctor._id.toString()) {
    throw createError(
      "You are not authorized to access this lab order",
      403
    );
  }
};

const populateLabOrder = (query) => {
  return query
    .populate(
      "patient",
      "uhid firstName lastName gender phone"
    )
    .populate({
      path: "doctor",
      select: "specialization department user",
      populate: {
        path: "user",
        select: "name email",
      },
    })
    .populate(
      "consultation",
      "consultationNumber chiefComplaint diagnosis"
    )
    .populate(
      "tests.test",
      "code name category"
    )
    .populate("createdBy", "name role")
    .populate("collectedBy", "name role")
    .populate("completedBy", "name role");
};

// ======================================================
// LAB TEST CATALOGUE
// ======================================================

// Create a new lab test
export const createLabTest = async (data, user) => {
  const code = data.code.toUpperCase();

  const existing = await LabTest.findOne({ code });

  if (existing) {
    throw createError(
      "A lab test with this code already exists",
      409
    );
  }

  const test = await LabTest.create({
    ...data,
    code,
    createdBy: user.userId,
  });

  return test;
};

// Get all active lab tests
export const getLabTests = async (filters = {}) => {
  const query = {
    isActive: true,
  };

  if (filters.search) {
    const search = filters.search.trim();

    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  if (filters.category) {
    query.category = filters.category;
  }

  return LabTest.find(query)
    .sort({ name: 1 })
    .limit(200);
};

// Update a lab test
export const updateLabTest = async (id, data) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid lab test ID");
  }

  if (data.code) {
    data.code = data.code.toUpperCase();

    const existing = await LabTest.findOne({
      code: data.code,
      _id: { $ne: id },
    });

    if (existing) {
      throw createError(
        "Another lab test already uses this code",
        409
      );
    }
  }

  const test = await LabTest.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!test) {
    throw createError("Lab test not found", 404);
  }

  return test;
};

// ======================================================
// CREATE LAB ORDER
// ======================================================

export const createLabOrder = async (data, user) => {
  if (!mongoose.isValidObjectId(data.consultationId)) {
    throw createError("Invalid consultation ID");
  }

  const consultation = await Consultation.findById(
    data.consultationId
  );

  if (!consultation) {
    throw createError("Consultation not found", 404);
  }

  // Doctor can request tests only for their own consultation.
  if (user.role === "doctor") {
    const doctor = await getDoctorForUser(user.userId);

    if (!doctor) {
      throw createError("Doctor profile not found", 403);
    }

    if (
      consultation.doctor.toString() !==
      doctor._id.toString()
    ) {
      throw createError(
        "You can only request tests for your own consultations",
        403
      );
    }
  }

  // Super Admin can request tests for any consultation.
  const tests = await LabTest.find({
    _id: { $in: data.testIds },
    isActive: true,
  });

  if (tests.length !== data.testIds.length) {
    throw createError(
      "One or more selected lab tests are invalid or inactive"
    );
  }

  const testMap = new Map(
    tests.map((test) => [
      test._id.toString(),
      test,
    ])
  );

  const orderItems = data.testIds.map((testId) => {
    const test = testMap.get(testId);

    return {
      test: test._id,
      code: test.code,
      name: test.name,
      specimen: test.specimen,
      price: test.price,
      status: "requested",

      parameters: test.parameters.map((parameter) => ({
        name: parameter.name,
        value: "",
        unit: parameter.unit,
        referenceRange: parameter.referenceRange,
        flag: "",
        remarks: "",
      })),
    };
  });

  const order = await LabOrder.create({
    orderNumber: await generateOrderNumber(),
    consultation: consultation._id,
    patient: consultation.patient,
    doctor: consultation.doctor,
    tests: orderItems,
    priority: data.priority || "routine",
    notes: data.notes || "",
    createdBy: user.userId,
  });

  return populateLabOrder(
    LabOrder.findById(order._id)
  );
};

// ======================================================
// GET LAB ORDERS
// ======================================================

export const getLabOrders = async (
  filters = {},
  user
) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.patientId) {
    if (!mongoose.isValidObjectId(filters.patientId)) {
      throw createError("Invalid patient ID");
    }

    query.patient = filters.patientId;
  }

  if (filters.doctorId) {
    if (!mongoose.isValidObjectId(filters.doctorId)) {
      throw createError("Invalid doctor ID");
    }

    query.doctor = filters.doctorId;
  }

  // Doctors can only view their own lab orders.
  if (user.role === "doctor") {
    const doctor = await getDoctorForUser(user.userId);

    if (!doctor) return [];

    query.doctor = doctor._id;
  }

  return populateLabOrder(
    LabOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
  );
};

// ======================================================
// GET SINGLE LAB ORDER
// ======================================================

export const getLabOrderById = async (id, user) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid lab order ID");
  }

  const order = await populateLabOrder(
    LabOrder.findById(id)
  );

  if (!order) {
    throw createError("Lab order not found", 404);
  }

  await ensureDoctorOwnsOrder(order, user);

  return order;
};

// ======================================================
// SAMPLE COLLECTION
// ======================================================

export const collectLabSample = async (id, user) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid lab order ID");
  }

  const order = await LabOrder.findById(id);

  if (!order) {
    throw createError("Lab order not found", 404);
  }

  if (order.status !== "requested") {
    throw createError(
      "Only requested orders can be marked as sample collected"
    );
  }

  order.status = "sample_collected";
  order.collectedAt = new Date();
  order.collectedBy = user.userId;

  await order.save();

  return populateLabOrder(
    LabOrder.findById(order._id)
  );
};

// ======================================================
// ENTER / UPDATE LAB RESULTS
// ======================================================

export const updateLabResults = async (id, data) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid lab order ID");
  }

  const order = await LabOrder.findById(id);

  if (!order) {
    throw createError("Lab order not found", 404);
  }

  if (
    !["sample_collected", "processing"].includes(
      order.status
    )
  ) {
    throw createError(
      "Sample must be collected before entering results"
    );
  }

  for (const submittedTest of data.tests) {
    const orderItem = order.tests.find(
      (item) =>
        item.test.toString() === submittedTest.testId
    );

    if (!orderItem) {
      throw createError(
        "Test does not belong to this lab order"
      );
    }

    for (const submittedParameter of submittedTest.parameters) {
      const parameter = orderItem.parameters.find(
        (item) =>
          item.name === submittedParameter.name
      );

      if (!parameter) {
        throw createError(
          `Unknown parameter ${submittedParameter.name} for ${orderItem.name}`
        );
      }

      parameter.value = submittedParameter.value;
      parameter.flag = submittedParameter.flag || "";
      parameter.remarks =
        submittedParameter.remarks || "";
    }

    const allEntered = orderItem.parameters.every(
      (parameter) =>
        parameter.value.trim() !== ""
    );

    orderItem.status = allEntered
      ? "completed"
      : "processing";
  }

  // The order remains processing until a technician
  // explicitly completes the report.
  order.status = "processing";

  await order.save();

  return populateLabOrder(
    LabOrder.findById(order._id)
  );
};

// ======================================================
// COMPLETE LAB REPORT
// ======================================================

export const completeLabOrder = async (id, user) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid lab order ID");
  }

  const order = await LabOrder.findById(id);

  if (!order) {
    throw createError("Lab order not found", 404);
  }

  if (order.status !== "processing") {
    throw createError(
      "Lab order must be processing before completion"
    );
  }

  const allResultsEntered = order.tests.every(
    (test) =>
      test.parameters.length > 0 &&
      test.parameters.every(
        (parameter) =>
          parameter.value.trim() !== ""
      )
  );

  if (!allResultsEntered) {
    throw createError(
      "Enter all test results before completing the report"
    );
  }

  order.tests.forEach((test) => {
    test.status = "completed";
  });

  order.status = "completed";
  order.completedAt = new Date();
  order.completedBy = user.userId;

  await order.save();

  return populateLabOrder(
    LabOrder.findById(order._id)
  );
};

// ======================================================
// CANCEL LAB ORDER
// ======================================================

export const cancelLabOrder = async (id, user) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid lab order ID");
  }

  const order = await LabOrder.findById(id);

  if (!order) {
    throw createError("Lab order not found", 404);
  }

  await ensureDoctorOwnsOrder(order, user);

  if (
    ["completed", "cancelled"].includes(order.status)
  ) {
    throw createError(
      "This lab order cannot be cancelled"
    );
  }

  order.status = "cancelled";

  await order.save();

  return populateLabOrder(
    LabOrder.findById(order._id)
  );
};
