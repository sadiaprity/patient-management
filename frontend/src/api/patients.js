import client from "./client";

export const getPatients = async (page = 1) => {
  const response = await client.get("/patients/", {
    params: { page },
  });
  return response.data;
};

export const getPatient = async (id) => {
  const response = await client.get(`/patients/${id}/`);
  return response.data;
};

export const createPatient = async (data) => {
  const response = await client.post("/patients/", data);
  return response.data;
};

export const createVisit = async (data) => {
  const response = await client.post("/visits/", data);
  return response.data;
};

export const getPatientVisits = async (patientId) => {
  const response = await client.get(`/patients/${patientId}/visits/`);
  return response.data;
};

export const updatePatient = async (id, data) => {
  const response = await client.patch(`/patients/${id}/`, data);
  return response.data;
};

export const deletePatient = async (id) => {
  const response = await client.delete(`/patients/${id}/`);
  return response.data;
};
