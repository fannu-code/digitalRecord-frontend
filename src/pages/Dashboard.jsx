import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            {/* Logo & System Name */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <span className="text-slate-800 font-bold text-lg">DR</span>
              </div>

              <div>
                <h1 className="text-white text-lg sm:text-xl font-bold">
                  Dairy Record Management System
                </h1>

                <p className="text-slate-400 text-xs sm:text-sm">
                  Digital Record & Document Management Portal
                </p>
              </div>
            </div>

            {/* User Information */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-white text-sm font-semibold">
                  {user.username || "User"}
                </p>

                <p className="text-slate-400 text-xs capitalize">
                  {user.role || "Authorized User"}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="border border-slate-600 hover:border-red-400 hover:bg-red-500 text-slate-200 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <section className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Dashboard
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mt-2">
            Welcome, {user.username || "User"}
          </h2>

          <p className="text-slate-500 mt-3 max-w-2xl leading-7">
            Manage official dairy records and documents securely. Submit new
            records or search existing records using their registered Dairy
            Number.
          </p>
        </section>

        {/* Main Action Cards */}
        <section className="grid md:grid-cols-2 gap-6">
          {/* Submit Record */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition duration-300 p-7 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 rounded-xl bg-slate-800 text-white flex items-center justify-center text-xl font-bold">
                +
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Record Management
              </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-800">
              Submit New Record
            </h3>

            <p className="text-slate-500 mt-3 leading-7">
              Register a new official record by entering the Dairy Number,
              selecting the relevant date, and securely uploading the supporting
              document.
            </p>

            <button
              onClick={() => navigate("/submit-record")}
              className="mt-8 w-full bg-slate-800 hover:bg-slate-900 text-white py-3.5 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
            >
              Submit a Record
            </button>
          </div>

          {/* Search Record */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition duration-300 p-7 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 rounded-xl border border-slate-300 text-slate-700 flex items-center justify-center text-xl font-bold">
                🔍
              </div>

              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Record Retrieval
              </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-800">
              Search Records
            </h3>

            <p className="text-slate-500 mt-3 leading-7">
              Quickly locate an existing record using its registered Dairy
              Number and download the associated official document.
            </p>

            <button
              onClick={() => navigate("/search-record")}
              className="mt-8 w-full border border-slate-300 hover:border-slate-500 hover:bg-slate-50 text-slate-700 py-3.5 rounded-lg font-semibold transition"
            >
              Search Records
            </button>
          </div>
        </section>

        {/* Information Section */}
        <section className="mt-10 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                System Information
              </h3>

              <p className="text-slate-500 mt-2">
                Supported document formats: All Pdf's, Documents Word-Excel-PowerPoint, Zip Files and All Type of Images.
                upload size Upto: 100 MB.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>

              <span className="text-sm font-medium text-slate-600">
                System Ready
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
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

export default Dashboard;
