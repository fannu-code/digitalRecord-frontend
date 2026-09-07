import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SearchRecord() {
  const navigate = useNavigate();

  // =================================
  // API BASE URL
  // =================================
  const API_URL = "http://localhost:5000/api/records";

  // =================================
  // SEARCH STATE
  // =================================
  const [dairyNo, setDairyNo] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [year, setYear] = useState("");

  // =================================
  // AVAILABLE YEARS
  // =================================
  const [availableYears, setAvailableYears] = useState([]);

  const [loadingYears, setLoadingYears] = useState(false);

  // =================================
  // RECORD STATE
  // =================================
  const [records, setRecords] = useState([]);

  const [selectedRecord, setSelectedRecord] = useState(null);

  // =================================
  // UI STATES
  // =================================
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [loading, setLoading] = useState(false);

  const [downloading, setDownloading] = useState(false);

  const [deleting, setDeleting] = useState(false);

  // =================================
  // LOAD AVAILABLE YEARS
  // =================================
  useEffect(() => {
    fetchAvailableYears();
  }, []);

  // =================================
  // FETCH AVAILABLE YEARS
  // =================================
  const fetchAvailableYears = async () => {
    try {
      setLoadingYears(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/years`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAvailableYears(response.data.years || []);
    } catch (error) {
      console.error("Error loading available years:", error);

      setAvailableYears([]);
    } finally {
      setLoadingYears(false);
    }
  };

  // =================================
  // SEARCH RECORDS
  // =================================
  const handleSearch = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");
    setRecords([]);
    setSelectedRecord(null);

    // =================================
    // VALIDATION
    // =================================
    if (!dairyNo.trim() && !documentName.trim() && !year) {
      setMessage(
        "Please enter a Dairy Number, Document Name, or select a Year.",
      );

      setMessageType("error");

      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // =================================
      // BUILD SEARCH PARAMETERS
      // =================================
      const params = {};

      if (dairyNo.trim()) {
        params.dairyNo = dairyNo.trim();
      }

      if (documentName.trim()) {
        params.documentName = documentName.trim();
      }

      if (year) {
        params.year = year;
      }

      // =================================
      // SEARCH API
      // =================================
      const response = await axios.get(`${API_URL}/search`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const foundRecords = response.data.records || [];

      setRecords(foundRecords);

      // =================================
      // AUTO SELECT IF ONLY ONE RECORD
      // =================================
      if (foundRecords.length === 1) {
        setSelectedRecord(foundRecords[0]);
      }

      setMessage(
        response.data.message || `${foundRecords.length} record(s) found.`,
      );

      setMessageType("success");
    } catch (error) {
      console.error("Search Error:", error);

      setRecords([]);
      setSelectedRecord(null);

      setMessage(
        error.response?.data?.message ||
          "Unable to search for records. Please try again.",
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // =================================
  // SELECT RECORD
  // =================================
  const handleSelectRecord = (record) => {
    setSelectedRecord(record);

    setMessage("");
    setMessageType("");
  };

  // =================================
  // DOWNLOAD DOCUMENT
  // =================================
  const handleDownload = async () => {
    if (!selectedRecord) return;

    try {
      setDownloading(true);

      setMessage("");
      setMessageType("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/download/${selectedRecord._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        },
      );

      // =================================
      // CREATE DOWNLOAD URL
      // =================================
      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = window.document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        selectedRecord.originalFileName || "document",
      );

      window.document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage("Document downloaded successfully.");

      setMessageType("success");
    } catch (error) {
      console.error("Download Error:", error);

      setMessage(
        error.response?.data?.message || "Unable to download the document.",
      );

      setMessageType("error");
    } finally {
      setDownloading(false);
    }
  };

  // =================================
  // DELETE RECORD
  // =================================
  const handleDelete = async () => {
    if (!selectedRecord) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete the record "${selectedRecord.dairyNo}"?\n\nThis will also delete the uploaded document and cannot be undone.`,
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);

      setMessage("");
      setMessageType("");

      const token = localStorage.getItem("token");

      const response = await axios.delete(`${API_URL}/${selectedRecord._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // =================================
      // REMOVE FROM CURRENT RESULTS
      // =================================
      setRecords((previousRecords) =>
        previousRecords.filter((item) => item._id !== selectedRecord._id),
      );

      // =================================
      // CLEAR SELECTED RECORD
      // =================================
      setSelectedRecord(null);

      // =================================
      // REFRESH YEAR LIST
      // =================================
      await fetchAvailableYears();

      setMessage(
        response.data.message || "Record and document deleted successfully.",
      );

      setMessageType("success");
    } catch (error) {
      console.error("Delete Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to delete the record and document.",
      );

      setMessageType("error");
    } finally {
      setDeleting(false);
    }
  };

  // =================================
  // CLEAR SEARCH
  // =================================
  const handleClear = () => {
    setDairyNo("");
    setDocumentName("");
    setYear("");

    setRecords([]);
    setSelectedRecord(null);

    setMessage("");
    setMessageType("");
  };

  // =================================
  // FORMAT DATE
  // =================================
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // =================================
  // GET DOCUMENT TYPE
  // =================================
  const getDocumentType = (record) => {
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

  // =================================
  // GET DOCUMENT ICON
  // =================================
  const getDocumentIcon = (record) => {
    if (!record?.documentType) {
      return "📄";
    }

    if (record.documentType === "application/pdf") {
      return "📕";
    }

    if (record.documentType.startsWith("image/")) {
      return "🖼️";
    }

    return "📄";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* =================================
          HEADER
      ================================= */}
      <header className="bg-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            {/* LEFT */}
            <div className="flex items-center gap-4">
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

            {/* DASHBOARD */}
            <button
              onClick={() => navigate("/dashboard")}
              className="hidden sm:block text-sm text-slate-300 hover:text-white transition"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* =================================
          MAIN
      ================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* =================================
            INTRODUCTION
        ================================= */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Record Retrieval
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mt-2">
            Search Official Records
          </h2>

          <p className="text-slate-500 mt-3 leading-7 max-w-3xl">
            Search records using Dairy Number, Document Name, Year, or any
            combination of these fields.
          </p>
        </div>

        {/* =================================
            SEARCH CARD
        ================================= */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* DAIRY NUMBER */}
              <div>
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

                <p className="text-xs text-slate-400 mt-2">Optional</p>
              </div>

              {/* DOCUMENT NAME */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Document Name
                </label>

                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="e.g. Annual Report"
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl outline-none transition focus:border-slate-600 focus:ring-4 focus:ring-slate-100"
                />

                <p className="text-xs text-slate-400 mt-2">Optional</p>
              </div>

              {/* YEAR */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Record Year
                </label>

                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  disabled={loadingYears}
                  className="w-full px-4 py-3.5 border border-slate-300 bg-white rounded-xl outline-none transition focus:border-slate-600 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-100"
                >
                  <option value="">Select Year</option>

                  {availableYears.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <p className="text-xs text-slate-400 mt-2">
                  {loadingYears
                    ? "Loading available years..."
                    : availableYears.length > 0
                      ? `${availableYears.length} year(s) available`
                      : "No record years available"}
                </p>
              </div>
            </div>

            {/* =================================
                SEARCH HELP
            ================================= */}
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold">
                  i
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Search Options
                  </p>

                  <p className="text-xs text-slate-500 mt-1 leading-5">
                    You can use any one field or combine multiple fields. For
                    example, select a year to view all documents from that year.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================
                BUTTONS
            ================================= */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white px-8 py-3.5 rounded-xl font-semibold transition shadow-md hover:shadow-lg"
              >
                {loading ? "Searching..." : "Search Records"}
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="border border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-slate-700 px-8 py-3.5 rounded-xl font-semibold transition"
              >
                Clear Search
              </button>
            </div>
          </form>
        </div>

        {/* =================================
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

        {/* =================================
            RESULTS
        ================================= */}
        {records.length > 0 && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* =================================
                DOCUMENT LIST
            ================================= */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* HEADER */}
              <div className="px-6 py-5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Search Results
                    </p>

                    <h3 className="text-xl font-bold text-slate-800 mt-1">
                      Documents Found
                    </h3>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-700">
                      {records.length}
                    </span>
                  </div>
                </div>

                {year && (
                  <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
                      Records from {year}
                    </span>
                  </div>
                )}
              </div>

              {/* LIST */}
              <div className="divide-y divide-slate-200">
                {records.map((item, index) => {
                  const isSelected = selectedRecord?._id === item._id;

                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => handleSelectRecord(item)}
                      className={`w-full text-left px-5 sm:px-6 py-5 transition ${
                        isSelected
                          ? "bg-slate-100 border-l-4 border-slate-800"
                          : "hover:bg-slate-50 border-l-4 border-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* NUMBER */}
                        <div
                          className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isSelected
                              ? "bg-slate-800 text-white"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        {/* ICON */}
                        <div className="hidden sm:flex w-10 h-10 flex-shrink-0 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center text-lg">
                          {getDocumentIcon(item)}
                        </div>

                        {/* INFO */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 break-words">
                            {item.documentName || "Unnamed Document"}
                          </h4>

                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-slate-500 break-all">
                              <span className="font-semibold text-slate-600">
                                Dairy No:
                              </span>{" "}
                              {item.dairyNo}
                            </p>

                            <p className="text-xs text-slate-500">
                              <span className="font-semibold text-slate-600">
                                Date:
                              </span>{" "}
                              {formatDate(item.date)}
                            </p>
                          </div>
                        </div>

                        {/* ARROW */}
                        <div className="flex-shrink-0 text-slate-400 text-xl pt-1">
                          →
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* =================================
                DETAILS
            ================================= */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden lg:sticky lg:top-6">
                {/* HEADER */}
                <div className="px-6 py-5 border-b border-slate-200">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Selected Record
                  </p>

                  <h3 className="text-xl font-bold text-slate-800 mt-1">
                    Document Details
                  </h3>
                </div>

                {selectedRecord ? (
                  <div className="p-6">
                    {/* ICON */}
                    <div className="flex justify-center mb-6">
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-4xl">
                        {getDocumentIcon(selectedRecord)}
                      </div>
                    </div>

                    {/* DOCUMENT NAME */}
                    <div className="mb-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Document Name
                      </p>

                      <p className="mt-2 text-base font-bold text-slate-800 break-words">
                        {selectedRecord.documentName || "N/A"}
                      </p>
                    </div>

                    {/* DAIRY NUMBER */}
                    <div className="mb-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Dairy Number
                      </p>

                      <p className="mt-2 text-base font-semibold text-slate-800 break-all">
                        {selectedRecord.dairyNo}
                      </p>
                    </div>

                    {/* DATE */}
                    <div className="mb-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Record Date
                      </p>

                      <p className="mt-2 text-base font-semibold text-slate-800">
                        {formatDate(selectedRecord.date)}
                      </p>
                    </div>

                    {/* FILE NAME */}
                    <div className="mb-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        File Name
                      </p>

                      <p className="mt-2 text-sm font-medium text-slate-700 break-all">
                        {selectedRecord.originalFileName || "N/A"}
                      </p>
                    </div>

                    {/* FILE TYPE */}
                    <div className="mb-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        File Type
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        {getDocumentType(selectedRecord)}
                      </p>
                    </div>

                    {/* UPLOADED BY */}
                    {selectedRecord.uploadedBy && (
                      <div className="mb-5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Uploaded By
                        </p>

                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {selectedRecord.uploadedBy?.username ||
                            "Unknown User"}
                        </p>
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div className="border-t border-slate-200 pt-6">
                      <button
                        type="button"
                        onClick={handleDownload}
                        disabled={downloading || deleting}
                        className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white py-3.5 rounded-xl font-semibold transition shadow-md hover:shadow-lg"
                      >
                        {downloading
                          ? "Preparing Download..."
                          : "Download Document"}
                      </button>

                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting || downloading}
                        className="w-full mt-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-3.5 rounded-xl font-semibold transition shadow-md hover:shadow-lg"
                      >
                        {deleting ? "Deleting..." : "Delete Record"}
                      </button>
                    </div>

                    <p className="mt-4 text-xs text-red-500 text-center leading-5">
                      Warning: Deleting a record permanently removes the
                      database record and its associated document.
                    </p>
                  </div>
                ) : (
                  /* NO SELECTED RECORD */
                  <div className="min-h-[450px] flex items-center justify-center px-6">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-4xl">
                        📁
                      </div>

                      <h4 className="mt-5 font-bold text-slate-700">
                        Select a Document
                      </h4>

                      <p className="mt-2 text-sm text-slate-500 leading-6">
                        Select any document from the search results to view its
                        complete details and download the document.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================
            INITIAL INFORMATION
        ================================= */}
        {records.length === 0 && !message && (
          <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            <div className="flex gap-4">
              <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">
                i
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Search Instructions
                </h3>

                <div className="text-sm text-slate-500 mt-3 leading-7">
                  <p>You can search records using:</p>

                  <ul className="mt-2 ml-5 list-disc space-y-1">
                    <li>
                      <span className="font-semibold text-slate-700">
                        Dairy Number
                      </span>{" "}
                      — e.g. 729/ADMIN/KEMU
                    </li>

                    <li>
                      <span className="font-semibold text-slate-700">
                        Document Name
                      </span>{" "}
                      — e.g. Annual Report
                    </li>

                    <li>
                      <span className="font-semibold text-slate-700">Year</span>{" "}
                      — only years that actually contain records are shown.
                    </li>

                    <li>
                      You can combine all three fields for a more specific
                      search.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================
            NO RECORDS
        ================================= */}
        {records.length === 0 && message && messageType === "success" && (
          <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
              📂
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-700">
              No Documents
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              No documents were found for the selected search criteria.
            </p>
          </div>
        )}
      </main>

      {/* =================================
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
