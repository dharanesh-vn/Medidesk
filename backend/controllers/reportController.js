const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Get key statistics for the admin dashboard
exports.getSystemStats = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only.' });
  }

  try {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      completedAppointments,
      appointmentsThisMonth,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'Completed' }),
      Appointment.countDocuments({
        date: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      }),
    ]);

    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

    res.json({
      totalPatients,
      totalDoctors,
      appointmentsThisMonth,
      completionRate: completionRate.toFixed(2),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// Get a report of the most booked doctors
exports.getDoctorActivityReport = async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }

    try {
        const doctorActivity = await Appointment.aggregate([
            { $group: { _id: "$doctorId", appointmentCount: { $sum: 1 } } },
            { $sort: { appointmentCount: -1 } },
            { $limit: 5 },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "doctorDetails" } },
            { $project: { _id: 0, doctorName: { $arrayElemAt: ["$doctorDetails.name", 0] }, appointmentCount: 1 } }
        ]);
        res.json(doctorActivity);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}