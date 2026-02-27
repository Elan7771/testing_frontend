import { useState } from "react";
import axios from "axios";
import "./App.css";

import Header from "./Components/Header";
import SearchForm from "./Components/SearchForm";
import JobCard from "./Components/JobCard";

function App() {
  // --- Search Mode (internship / job) ---
  const [searchMode, setSearchMode] = useState("internship");

  // --- Filter State ---
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [mode, setMode] = useState("");        // full_time / part_time (scoring only)
  const [sector, setSector] = useState("");
  const [salaryMin, setSalaryMin] = useState("");

  // --- Result State ---
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- Fetch Recommendations from Backend ---
  const fetchJobs = async () => {
    if (!query && !sector && !skills) {
      setError("Please enter at least a job role, skills, or select a sector.");
      return;
    }
    setLoading(true);
    setError("");
    setJobs([]);
    try {
      const res = await axios.get("http://localhost:5000/api/recommendations", {
        params: {
          q: query,
          location,
          skills,
          contract_time: mode,        // used for scoring, not hard Adzuna filter
          category: sector,
          salary_min: salaryMin || undefined,
          search_mode: searchMode,    // internship or job
        },
      });
      if (res.data.success && res.data.results.length > 0) {
        setJobs(res.data.results);
      } else {
        setError("No results found. Try broadening your filters or changing your search.");
      }
    } catch (err) {
      setError("Failed to fetch recommendations. Please check your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const resultLabel = searchMode === "internship" ? "Internships" : "Jobs";

  return (
    <div className="app">
      {/* 🏷️ App Header */}
      <Header />

      {/* 🔎 Search & Filter Form */}
      <SearchForm
        searchMode={searchMode} setSearchMode={setSearchMode}
        query={query} setQuery={setQuery}
        location={location} setLocation={setLocation}
        skills={skills} setSkills={setSkills}
        mode={mode} setMode={setMode}
        sector={sector} setSector={setSector}
        salaryMin={salaryMin} setSalaryMin={setSalaryMin}
        onSearch={fetchJobs}
        loading={loading}
      />

      {/* ⚠️ Error Message */}
      {error && <div className="error">{error}</div>}

      {/* 🏆 Results Section */}
      {jobs.length > 0 && (
        <h2 className="results-title">
          🎯 Top {jobs.length} {resultLabel} Recommended for You
        </h2>
      )}

      <div className="job-grid">
        {jobs.map((job, index) => (
          <JobCard key={index} job={job} />
        ))}
      </div>

      {/* 📭 Loading / Empty State */}
      {loading && (
        <p className="empty-text">⏳ Searching across Indian {resultLabel.toLowerCase()}...</p>
      )}
      {!loading && jobs.length === 0 && !error && (
        <p className="empty-text">
          Fill in the filters above and click{" "}
          <strong>{searchMode === "internship" ? "🎓 Find Internships" : "💼 Find Jobs"}</strong>.
        </p>
      )}
    </div>
  );
}

export default App;
