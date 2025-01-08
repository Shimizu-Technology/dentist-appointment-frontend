export default function DashboardHeader() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">
          Admin Dashboard
        </h1>
        <p className="text-base sm:text-xl text-blue-100">
          Manage appointments, schedules, and clinic settings
        </p>
      </div>
    </div>
  );
}
