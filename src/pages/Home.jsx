import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-cyan-500 text-white">

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-10 py-4 bg-black/30">
        <div className="flex gap-6 font-semibold">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/create-event">Create</Link>
          <Link to="/my-bookings">Bookings</Link>
        </div>

        <Link
          to="/login"
          className="bg-red-500 px-4 py-1 rounded hover:bg-red-600"
        >
          Login
        </Link>
      </div>

      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-center mt-24 text-center">
        <h1 className="text-4xl font-bold mb-4">
          🎉 Discover Amazing Events
        </h1>

        <p className="mb-6 text-lg">
          Book, Explore and Manage Events Easily
        </p>

        <div className="flex gap-2">
          <input
            placeholder="Search events..."
            className="px-4 py-2 rounded text-black w-72"
          />
          <button className="bg-purple-500 px-4 py-2 rounded">
            Search
          </button>
        </div>

        <div className="mt-6 flex gap-4">
          <Link to="/login" className="bg-purple-500 px-4 py-2 rounded">
            Login
          </Link>
          <button className="bg-purple-500 px-4 py-2 rounded">
            Register
          </button>
        </div>
      </div>
    </div>
  );
}