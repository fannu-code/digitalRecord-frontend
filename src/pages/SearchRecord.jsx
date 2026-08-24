import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SearchRecord() {
  const navigate = useNavigate();

  // Search State
  const [dairyNo, setDairyNo] = useState("");

  // Record State
  const [record, setRecord] = useState(null);

  // UI States
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ================================
  // SEARCH RECORD
  // ================================
  const handleSearch = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");
    setRecord(null);

    if (!dairyNo.trim()) {
      setMessage("Please enter a Dairy Number.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/records/search",
        {
          params: {
            dairyNo: dairyNo.trim(),
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setRecord(response.data.record);

      setMessage(response.data.message);
      setMessageType("success");
    } catch (error) {
      setRecord(null);

      setMessage(
        error.response?.data?.message ||
          "Unable to search for the record. Please try again.",
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // DOWNLOAD DOCUMENT
  // ================================
  const handleDownload = async () => {
    if (!record) return;

    try {
      setDownloading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/records/download/${record._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        },
      );

      // Create temporary download URL
      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = window.document.createElement("a");

      link.href = url;

      // Download with original filename
      link.setAttribute("download", record.originalFileName || "document");

      window.document.body.appendChild(link);

      link.click();

      link.remove();

      // Clean up temporary URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to download the document.",
      );

      setMessageType("error");
    } finally {
      setDownloading(false);
    }
  };

  // ================================
  // DELETE RECORD AND DOCUMENT
  // ================================
  const handleDelete = async () => {
    if (!record) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete the record "${record.dairyNo}"?\n\nThis will also delete the uploaded document and cannot be undone.`,
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);

      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `http://localhost:5000/api/records/${record._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Clear record after successful deletion
      setRecord(null);
      setDairyNo("");

      setMessage(
        response.data.message || "Record and document deleted successfully.",
      );

      setMessageType("success");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to delete the record and document.",
      );

      setMessageType("error");
    } finally {
      setDeleting(false);
    }
  };

  // ================================
  // CLEAR SEARCH
  // ================================
  const handleClear = () => {
    setDairyNo("");
    setRecord(null);
    setMessage("");
    setMessageType("");
  };

  // ================================
  // FORMAT DATE
  // ================================
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // ================================
  // GET DOCUMENT TYPE
  // ================================
  const getDocumentType = () => {
    if (!record?.documentType) {
      return "Document";
    }

    if (record.documentType === "application/pdf") {
      return "PDF Document";
    }

    if (record.documentType.startsWith("image/")) {
      return "Image Document";
    }

    return record.documentType;
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

              <div>
                <h1 className="text-white text-lg sm:text-xl font-bold">
                  Search Records
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
            Record Retrieval
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mt-2">
            Search Official Records
          </h2>

          <p className="text-slate-500 mt-3 leading-7 max-w-2xl">
            Enter the registered Dairy Number to locate the official record,
            download its associated document, or remove the record if required.
          </p>
        </div>

        {/* ================================
            SEARCH CARD
        ================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Dairy Number
              </label>

              <input
                type="text"
                value={dairyNo}
                onChange={(e) => setDairyNo(e.target.value)}
                placeholder="e.g. 729/ADMIN/KEMU"
                className="w-full px-4 py-3.5 border border-slate-300 rounded-xl outline-none transition focus:border-slate-600 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white px-8 py-3.5 rounded-xl font-semibold transition shadow-md hover:shadow-lg"
              >
                {loading ? "Searching..." : "Search Record"}
              </button>
            </div>
          </form>
        </div>

        {/* ================================
            MESSAGE
        ================================= */}
        {message && (
          <div
            className={`mt-6 rounded-xl border px-4 py-4 text-sm ${
              messageType === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* ================================
            RECORD RESULT
        ================================= */}
        {record && (
          <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Result Header */}
            <div className="px-6 sm:px-8 py-6 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Record Found
                </p>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">
                  {record.dairyNo}
                </h3>
              </div>

              <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-center justify-center font-bold">
                ✓
              </div>
            </div>

            {/* Record Details */}
            <div className="p-6 sm:p-8">
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Dairy Number */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Dairy Number
                  </p>

                  <p className="text-base font-semibold text-slate-800 mt-2 break-all">
                    {record.dairyNo}
                  </p>
                </div>

                {/* Date */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Record Date
                  </p>

                  <p className="text-base font-semibold text-slate-800 mt-2">
                    {formatDate(record.date)}
                  </p>
                </div>

                {/* Document Name */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Document
                  </p>

                  <p className="text-base font-semibold text-slate-800 mt-2 break-all">
                    {record.originalFileName || "N/A"}
                  </p>

                  <p className="text-sm text-slate-500 mt-2">
                    {getDocumentType()}
                  </p>
                </div>
              </div>

              {/* Uploaded By */}
              {record.uploadedBy && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-sm text-slate-500">
                    Uploaded by{" "}
                    <span className="font-semibold text-slate-700">
                      {record.uploadedBy.username || "Unknown User"}
                    </span>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* New Search */}
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={deleting}
                  className="border border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-slate-700 py-3.5 rounded-xl font-semibold transition"
                >
                  New Search
                </button>

                {/* Download */}
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading || deleting}
                  className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white py-3.5 rounded-xl font-semibold transition shadow-md hover:shadow-lg"
                >
                  {downloading ? "Preparing..." : "Download Document"}
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting || downloading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-3.5 rounded-xl font-semibold transition shadow-md hover:shadow-lg"
                >
                  {deleting ? "Deleting..." : "Delete Record"}
                </button>
              </div>

              {/* Warning */}
              <p className="mt-4 text-xs text-red-500 text-center">
                Warning: Deleting a record will permanently remove the record
                and its associated document.
              </p>
            </div>
          </div>
        )}

        {/* ================================
            INFORMATION CARD
        ================================= */}
        {!record && !message && (
          <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            <div className="flex gap-4">
              <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">
                i
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Search Instructions
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-6">
                  Enter the complete Dairy Number exactly as it was registered
                  in the system. For example:
                  <span className="font-semibold text-slate-700 ml-1">
                    729/ADMIN/KEMU
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
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

export default SearchRecord;
