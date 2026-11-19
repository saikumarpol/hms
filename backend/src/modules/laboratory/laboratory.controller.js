
import {
  createLabTest as createLabTestService,
  getLabTests as getLabTestsService,
  updateLabTest as updateLabTestService,
  createLabOrder as createLabOrderService,
  getLabOrders as getLabOrdersService,
  getLabOrderById as getLabOrderByIdService,
  collectLabSample as collectLabSampleService,
  updateLabResults as updateLabResultsService,
  completeLabOrder as completeLabOrderService,
  cancelLabOrder as cancelLabOrderService,
} from "./laboratory.service.js";

// ---------------- LAB TEST CATALOGUE ----------------

export const createLabTest = async (req, res) => {
  const test = await createLabTestService(req.body, req.user);

  res.status(201).json({
    success: true,
    message: "Lab test created successfully",
    data: test,
  });
};

export const listLabTests = async (req, res) => {
  const tests = await getLabTestsService(req.query);

  res.status(200).json({
    success: true,
    count: tests.length,
    data: tests,
  });
};

export const editLabTest = async (req, res) => {
  const test = await updateLabTestService(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Lab test updated successfully",
    data: test,
  });
};

// ---------------- LAB ORDERS ----------------

export const createLabOrder = async (req, res) => {
  const order = await createLabOrderService(req.body, req.user);

  res.status(201).json({
    success: true,
    message: "Lab order created successfully",
    data: order,
  });
};

export const listLabOrders = async (req, res) => {
  const orders = await getLabOrdersService(req.query, req.user);

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
};

export const getLabOrder = async (req, res) => {
  const order = await getLabOrderByIdService(req.params.id, req.user);

  res.status(200).json({
    success: true,
    data: order,
  });
};

export const collectSample = async (req, res) => {
  const order = await collectLabSampleService(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: "Sample collection recorded successfully",
    data: order,
  });
};

export const enterResults = async (req, res) => {
  const order = await updateLabResultsService(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Lab results saved successfully",
    data: order,
  });
};

export const completeLabOrder = async (req, res) => {
  const order = await completeLabOrderService(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: "Lab report completed successfully",
    data: order,
  });
};

export const cancelLabOrder = async (req, res) => {
  const order = await cancelLabOrderService(req.params.id, req.user);

  res.status(200).json({
    success: true,
    message: "Lab order cancelled successfully",
    data: order,
  });
};
