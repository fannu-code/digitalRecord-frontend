import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SubmitRecord() {
  const navigate = useNavigate();

  // Form States
  const [dairyNo, setDairyNo] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [date, setDate] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // UI States
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  // ================================
  // HANDLE FILE CHANGE
  // ================================
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // =========================================
    // ALLOWED FILE EXTENSIONS
    // =========================================

    const allowedExtensions = [
      // Images
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
      ".tif",
      ".tiff",
      ".ico",

      // PDF
      ".pdf",

      // Microsoft Word
      ".doc",
      ".docx",
      ".docm",
      ".dot",
      ".dotx",
      ".dotm",

      // Microsoft Excel
      ".xls",
      ".xlsx",
      ".xlsm",
      ".xlsb",
      ".csv",

      // Microsoft PowerPoint
      ".ppt",
      ".pptx",
      ".pptm",
      ".pps",
      ".ppsx",
      ".pot",
      ".potx",
      ".potm",

      // Archives
      ".zip",
      ".rar",
      ".7z",

      // Text
      ".txt",
      ".rtf",
    ];

    // =========================================
    // GET FILE EXTENSION
    // =========================================

    const fileName = file.name.toLowerCase();

    const fileExtension = fileName.substring(fileName.lastIndexOf("."));

    // =========================================
    // FILE TYPE VALIDATION
    // =========================================

    if (!allowedExtensions.includes(fileExtension)) {
      setMessage(
        "Unsupported file type. Please select an image, PDF, Word, Excel, PowerPoint, ZIP, RAR, 7Z, TXT, CSV or RTF file.",
      );

      setMessageType("error");

      setSelectedFile(null);

      // Reset file input
      e.target.value = "";

      return;
    }

    // =========================================
    // FILE SIZE VALIDATION
    // =========================================

    // Maximum file size = 100 MB
    const maxSize = 100 * 1024 * 1024;

    if (file.size > maxSize) {
      setMessage("File size must not exceed 100 MB.");

      setMessageType("error");

      setSelectedFile(null);

      // Reset file input
      e.target.value = "";

      return;
    }

    // =========================================
    // SET SELECTED FILE
    // =========================================

    setSelectedFile(file);

    // =========================================
    // CLEAR PREVIOUS MESSAGES
    // =========================================

    setMessage("");
    setMessageType("");
  };

  // ================================
  // HANDLE FORM SUBMISSION
  // ================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    // Validate Fields
    if (!dairyNo || !documentName || !date || !selectedFile) {
      setMessage("Please complete all fields and select a document.");
      setMessageType("error");

      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("dairyNo", dairyNo.trim());

      formData.append("documentName", documentName.trim());

      formData.append("date", date);

      // IMPORTANT:
      // "document" must match:
      // upload.single("document") in backend
      formData.append("document", selectedFile);

      const response = await axios.post(
        "http://localhost:5000/api/records/submit",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Success Message
      setMessage(response.data.message);
      setMessageType("success");

      // Reset Form
      setDairyNo("");
      setDocumentName("");
      setDate("");
      setSelectedFile(null);

      // Clear File Input
      const fileInput = window.document.getElementById("document");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to submit the record. Please try again.",
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // REMOVE SELECTED FILE
  // ================================
  const handleRemoveFile = () => {
    setSelectedFile(null);

    const fileInput = window.document.getElementById("document");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* ================================
          HEADER
      ================================= */}
      <header className="bg-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <button
                onClick={() => navigate("/dashboard")}
                className="w-11 h-11 rounded-xl border border-slate-600 hover:bg-slate-700 text-white flex items-center justify-center transition"
                title="Back to Dashboard"
              >
                ←
              </button>

              {/* Page Title */}
              <div>
                <h1 className="text-white text-lg sm:text-xl font-bold">
                  Submit New Record
                </h1>

                <p className="text-slate-400 text-xs sm:text-sm">
                  Dairy Record Management System
                </p>
              </div>
            </div>

            {/* Dashboard Button */}
            <button
              onClick={() => navigate("/dashboard")}
              className="hidden sm:block text-sm text-slate-300 hover:text-white transition"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* ================================
          MAIN CONTENT
      ================================= */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Introduction */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Record Registration
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mt-2">
            Submit an Official Record
          </h2>

          <p className="text-slate-500 mt-3 leading-7 max-w-2xl">
            Enter the official Dairy Number, select the relevant date, and
            upload the supporting document to securely register a new record in
            the system.
          </p>
        </div>

        {/* ================================
            FORM CARD
        ================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="px-6 sm:px-8 py-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">
              Record Information
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Fields marked as required must be completed.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7">
            {/* ================================
                MESSAGE
            ================================= */}
            {message && (
              <div
                className={`rounded-xl border px-4 py-4 text-sm ${
                  messageType === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* ================================
                DAIRY NUMBER
            ================================= */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Dairy Number
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="text"
                value={dairyNo}
                onChange={(e) => setDairyNo(e.target.value)}
                placeholder="e.g. 729/ADMIN/KEMU"
                className="w-full px-4 py-3.5 border border-slate-300 rounded-xl outline-none transition focus:border-slate-600 focus:ring-4 focus:ring-slate-100"
              />

              <p className="text-xs text-slate-400 mt-2">
                Enter the official Dairy Number exactly as assigned.
              </p>
            </div>

            {/* Document Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Document Name
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g. Annual Report 2023"
                className="w-full px-4 py-3.5 border border-slate-300 rounded-xl outline-none transition focus:border-slate-600 focus:ring-4 focus:ring-slate-100"
              />

              <p className="text-xs text-slate-400 mt-2">
                Enter the name of the document.
              </p>
            </div>

            {/* ================================
                RECORD DATE
            ================================= */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Record Date
                <span className="text-red-500 ml-1">*</span>
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3.5 border border-slate-300 rounded-xl outline-none transition focus:border-slate-600 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            {/* ================================
                DOCUMENT UPLOAD
            ================================= */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Supporting Document
                <span className="text-red-500 ml-1">*</span>
              </label>

              {/* Upload Area */}
              <label
                htmlFor="document"
                className="block border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition bg-slate-50 hover:bg-slate-100"
              >
                {/* Upload Icon */}
                <div className="w-14 h-14 mx-auto bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                  ↑
                </div>

                {/* File Name */}
                <h4 className="mt-4 text-base font-semibold text-slate-700">
                  {selectedFile ? selectedFile.name : "Upload Document"}
                </h4>

                <p className="text-sm text-slate-500 mt-2">
                  Click here to select a document from your computer.
                </p>

                <p className="text-xs text-slate-400 mt-4">
                  Supported formats: PDF, JPG, JPEG, PNG
                  <br />
                  Maximum file size: 10 MB
                </p>

                {/* Hidden File Input */}
                <input
                  id="document"
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.docm,.xls,.xlsx,.xlsm,.xlsb,.csv,.ppt,.pptx,.pptm,.pps,.ppsx,.zip,.rar,.7z,.txt,.rtf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* ================================
                  SELECTED FILE DETAILS
              ================================= */}
              {selectedFile && (
                <div className="mt-4 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {selectedFile.name}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-sm font-medium text-red-600 hover:text-red-700 ml-4"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* ================================
                FORM BUTTONS
            ================================= */}
            <div className="pt-3 flex flex-col-reverse sm:flex-row gap-3">
              {/* Cancel */}
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="sm:w-1/3 border border-slate-300 hover:bg-slate-50 text-slate-700 py-3.5 rounded-xl font-semibold transition"
              >
                Cancel
              </button>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="sm:w-2/3 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white py-3.5 rounded-xl font-semibold transition shadow-md hover:shadow-lg"
              >
                {loading ? "Submitting Record..." : "Submit Record"}
              </button>
            </div>
          </form>
        </div>

        {/* ================================
            IMPORTANT INFORMATION
        ================================= */}
        <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
          <div className="flex gap-4">
            {/* Information Icon */}
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">
              i
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                Important Information
              </h3>

              <p className="text-sm text-slate-500 mt-2 leading-6">
                Each Dairy Number can only be registered once. Please verify the
                Dairy Number and uploaded document before submitting the record.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ================================
          FOOTER
      ================================= */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-slate-500">
            © 2026 Dairy Record Management System
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Secure • Organized • Accessible
          </p>
        </div>
      </footer>
    </div>
  );
}

export default SubmitRecord;
