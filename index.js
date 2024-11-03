const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const admin = require("firebase-admin");
const credentials = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers, *, Access-Control-Allow-Origin",
    "Origin, X-Requested-with, Content_Type, Accept, Authorization",
    "http://localhost:3000/add-teacher",
    "http://crm-adminstaration/add-student"
  );
  next();
});

app.post("/add-teacher", async (req, res) => {
  try {
    const teacher = {
      email: req.body.email,
      password: req.body.password,
      fullName: req.body.fullName,
      phone: req.body.phone,
      address: req.body.address,
      position: req.body.position,
      role: req.body.role,
      isTeacherUpdate: req.body.isTeacherUpdate,
    };

    const teacherResponse = await admin.auth().createUser({
      email: teacher.email,
      password: teacher.password,
      emailVerified: true,
      disabled: false,
    });

    await admin
      .auth()
      .setCustomUserClaims(teacherResponse.uid, { role: "teacher" });
    await admin
      .firestore()
      .collection("teachers")
      .doc(teacherResponse.uid)
      .set({
        ...teacher,
        timestamp: new Date().getTime(),
        id: teacherResponse.uid,
      });

    res.status(201).json({
      message: "O'qituvchi muvaffaqiyatli qo'shildi.",
      uid: teacherResponse.uid,
    });
  } catch (error) {
    console.log("Error in add-teacher:", error);

    res.status(400).json({
      errorInfo: {
        code: error.code || "unknown_error",
        message: error.message || "An unexpected error occurred.",
      },
    });
  }
});

app.post("/add-student", async (req, res) => {
  try {
    const student = {
      email: req.body.email,
      password: req.body.password,
      fullName: req.body.fullName,
      phoneNumber: req.body.phoneNumber,
      parentPhoneNumber: req.body.parentPhoneNumber,
      address: req.body.address,
      bornDate: req.body.bornDate,
      passportId: req.body.passportId,
      telegram: req.body.telegram,
      adminId: req.body.adminId,
      isPaid: req.body.isPaid,
      isStudentUpdate: req.body.isStudentUpdate,
    };

    const studentResponse = await admin.auth().createUser({
      email: student.email,
      password: student.password,
      emailVerified: true,
      disabled: false,
    });

    await admin
      .auth()
      .setCustomUserClaims(studentResponse.uid, { role: "student" });

    await admin
      .firestore()
      .collection("students")
      .doc(studentResponse.uid)
      .set({
        ...student,
        timestamp: new Date().getTime(),
        id: studentResponse.uid,
      });

    res.status(201).json({
      message: "Student registered successfully",
      uid: studentResponse.uid,
    });
    console.log("Student added successfully:", res);
  } catch (error) {
    console.log("Error in add-teacher:", error);

    res.status(400).json({
      errorInfo: {
        code: error.code || "unknown_error",
        message: error.message || "An unexpected error occurred.",
      },
    });
  }
});

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
