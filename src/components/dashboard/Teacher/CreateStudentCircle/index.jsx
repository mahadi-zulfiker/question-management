import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreateStudentCircle() {
  const [students, setStudents] = useState([]);
  const [circleName, setCircleName] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const response = await axios.get("/api/createCircle");
        setStudents(response.data);
      } catch (error) {
        toast.error("Failed to fetch students");
      }
    }
    fetchStudents();
  }, []);

  const toggleStudentSelection = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const createCircle = async () => {
    if (!circleName || selectedStudents.length === 0) {
      toast.warn("Please provide a circle name and select students");
      return;
    }
    try {
      await axios.post("/api/createCircle", { circleName, studentIds: selectedStudents });
      setCircleName("");
      setSelectedStudents([]);
      toast.success("Circle created successfully");
    } catch (error) {
      toast.error("Failed to create circle");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-4 text-center">Create Student Circle</h1>
      <input
        type="text"
        className="border p-2 w-full mb-4 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        placeholder="Circle Name"
        value={circleName}
        onChange={(e) => setCircleName(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
        {students.map((student) => (
          <div
            key={student._id}
            onClick={() => toggleStudentSelection(student._id)}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-lg ${selectedStudents.includes(student._id) ? "bg-blue-200 border-blue-500" : ""}`}
          >
            <p className="text-lg font-medium">{student.username}</p>
            <p className="text-sm text-gray-500">{student.email}</p>
          </div>
        ))}
      </div>
      <button
        onClick={createCircle}
        className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
      >
        Create Circle
      </button>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme="light" />
    </div>
  );
}