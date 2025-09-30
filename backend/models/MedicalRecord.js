const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  date: { type: Date, default: Date.now },
  diagnosis: { type: String, required: true },
  prescription: { type: String },
  notes: { type: String },
});

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);