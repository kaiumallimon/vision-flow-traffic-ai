import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Upload, Activity, Eye, RefreshCcw, LogOut, Image as ImageIcon,
  ArrowUpCircle, History as HistoryIcon, Trash2, User, BarChart3, Search, Filter, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = window.location.origin + "/api";

function Dashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('detection'); // detection, profile, stats
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const user = JSON.parse(localStorage.getItem('user')) || { first_name: "User", email: "" };

  const fetchHistory = async () => {
    try {
      let url = `${API_BASE_URL}/history?email=${user.email}`;
      if (searchQuery) url += `&search=${searchQuery}`;
      if (dateFrom) url += `&date_from=${dateFrom}`;
      if (dateTo) url += `&date_to=${dateTo}`;

      const response = await axios.get(url);
      setHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile?email=${user.email}`);
      setProfile(response.data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats?email=${user.email}`);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchProfile();
    fetchStats();
  }, [searchQuery, dateFrom, dateTo]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const deleteHistoryItem = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this detection?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/history/${id}`);
      fetchHistory();
      if (result && result.id === id) setResult(null);
    } catch (error) {
      alert("Delete failed.");
    }
  };

  const viewHistoryItem = (item) => {
    const formatUrl = (path) => {
        const fileName = path.split(/[\\/]/).pop();
        return `${window.location.origin}/media/uploads/${fileName}`;
    };

    setResult({
      id: item.id,
      detected: item.object_name,
      advice: item.advice,
      original_url: formatUrl(item.image_path),
      heatmap_url: formatUrl(item.heatmap_path)
    });
    setPreview(null);
    setActiveTab('detection');
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', user.email);

    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, formData);
      setResult(response.data);
      fetchHistory();
      fetchStats();
      alert('Analysis complete! Check your email for the results.');
    } catch (error) {
      alert("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    const formData = {
      email: user.email,
      first_name: e.target.first_name.value,
      last_name: e.target.last_name.value,
    };

    if (e.target.password.value) {
      formData.password = e.target.password.value;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/profile/update`, formData);
      alert('Profile updated successfully!');
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      fetchProfile();
    } catch (error) {
      alert('Profile update failed.');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-gray-200 p-4 flex flex-col bg-[#F9FBFF]">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
            {user.first_name[0]}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-gray-800 truncate">{user.first_name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() => setActiveTab('detection')}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'detection' ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-gray-700'
            }`}
          >
            <Activity size={18} />
            <span>Detection</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'profile' ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-gray-700'
            }`}
          >
            <User size={18} />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-semibold transition-all ${
              activeTab === 'stats' ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-gray-700'
            }`}
          >
            <BarChart3 size={18} />
            <span>Statistics</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
              <HistoryIcon size={14} /> DETECTIONS
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1 hover:bg-blue-100 rounded"
            >
              <Filter size={14} className="text-gray-500" />
            </button>
          </div>

          {showFilters && (
            <div className="bg-white rounded-xl p-3 mb-3 space-y-2 shadow-sm">
              <input
                type="text"
                placeholder="Search objects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-2 py-1 text-xs border rounded"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-2 py-1 text-xs border rounded"
                />
              </div>
              <button
                onClick={clearFilters}
                className="w-full py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          )}

          <div className="space-y-1">
            {history.length > 0 ? history.map((item) => (
              <div key={item.id} className="group flex items-center hover:bg-blue-50 rounded-xl px-3 transition-all cursor-pointer">
                <button
                  onClick={() => viewHistoryItem(item)}
                  className="flex-1 text-left py-2.5 text-sm text-gray-700 truncate"
                >
                  • {item.object_name}
                </button>
                <button
                  onClick={(e) => deleteHistoryItem(e, item.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )) : (
              <p className="text-xs text-gray-400 px-3 italic text-center mt-4">No history found</p>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
          <button
            onClick={() => {localStorage.clear(); navigate('/login');}}
            className="w-full flex items-center gap-3 py-3 px-4 hover:bg-red-50 text-red-600 rounded-2xl text-sm font-semibold transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full bg-white relative">
        <header className="h-16 flex items-center justify-center border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-800 italic">Vision Flow AI</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-6 pb-40">
          <div className="max-w-4xl mx-auto">

            {/* DETECTION TAB */}
            {activeTab === 'detection' && (
              <>
                {!result && !preview ? (
                  <div className="text-center mt-20">
                    <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <ImageIcon size={40} className="text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Private Image Detection</h1>
                    <p className="text-gray-500">Detections are only visible to you.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {result && (
                      <div className="bg-white border border-gray-100 shadow-xl rounded-3xl overflow-hidden">
                        <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                          <h3 className="font-bold">Result: {result.detected}</h3>
                        </div>
                        <div className="p-8">
                          <p className="text-lg text-gray-700 leading-relaxed mb-8 border-l-4 border-blue-500 pl-4">{result.advice}</p>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                               <span className="text-xs font-bold text-gray-400">ORIGINAL IMAGE</span>
                               <img src={result.original_url} className="w-full rounded-2xl border shadow-sm" alt="Original" />
                            </div>
                            <div className="flex flex-col gap-2">
                               <span className="text-xs font-bold text-gray-400">AI HEATMAP</span>
                               <img src={result.heatmap_url} className="w-full rounded-2xl border shadow-sm" alt="Heatmap" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {preview && !result && (
                      <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-300">
                        <img src={preview} className="w-full h-64 object-cover rounded-2xl shadow-md mb-4" />
                        <button
                          onClick={handleUpload}
                          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                        >
                          {loading ? <RefreshCcw className="animate-spin" /> : <Activity size={20} />}
                          {loading ? "Analyzing..." : "Analyze Image"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && profile && (
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">My Profile</h2>
                <div className="bg-white border rounded-3xl p-8 shadow-lg">
                  <form onSubmit={updateProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                      <input
                        name="first_name"
                        type="text"
                        defaultValue={profile.firstName}
                        className="w-full px-4 py-3 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                      <input
                        name="last_name"
                        type="text"
                        defaultValue={profile.lastName}
                        className="w-full px-4 py-3 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full px-4 py-3 border rounded-xl bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">New Password (optional)</label>
                      <input
                        name="password"
                        type="password"
                        placeholder="Leave blank to keep current"
                        className="w-full px-4 py-3 border rounded-xl"
                      />
                    </div>
                    <div className="pt-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Member since: {new Date(profile.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Total Detections: {profile.totalDetections}
                      </p>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
                    >
                      Update Profile
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* STATISTICS TAB */}
            {activeTab === 'stats' && stats && (
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Detection Statistics</h2>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-3xl shadow-lg">
                    <h3 className="text-sm font-semibold opacity-90">Total Detections</h3>
                    <p className="text-4xl font-bold mt-2">{stats.totalDetections}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-3xl shadow-lg">
                    <h3 className="text-sm font-semibold opacity-90">Unique Objects</h3>
                    <p className="text-4xl font-bold mt-2">{Object.keys(stats.mostCommonObjects).length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-3xl shadow-lg">
                    <h3 className="text-sm font-semibold opacity-90">This Week</h3>
                    <p className="text-4xl font-bold mt-2">{Object.values(stats.detectionsByDate).reduce((a, b) => a + b, 0)}</p>
                  </div>
                </div>

                <div className="bg-white border rounded-3xl p-8 shadow-lg mb-6">
                  <h3 className="text-lg font-bold mb-4">Most Detected Objects</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.mostCommonObjects).map(([object, count]) => (
                      <div key={object} className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">{object}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{width: `${(count / stats.totalDetections) * 100}%`}}
                            />
                          </div>
                          <span className="text-gray-500 font-bold">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border rounded-3xl p-8 shadow-lg">
                  <h3 className="text-lg font-bold mb-4">Detections Over Time (Last 7 Days)</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.detectionsByDate).sort().map(([date, count]) => (
                      <div key={date} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-24">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-green-500 h-full rounded-full flex items-center justify-end px-2"
                            style={{width: `${count > 0 ? (count / Math.max(...Object.values(stats.detectionsByDate))) * 100 : 0}%`}}
                          >
                            <span className="text-xs text-white font-bold">{count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* UPLOAD BAR (only show on detection tab) */}
        {activeTab === 'detection' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
            <div className="bg-white border-2 border-gray-100 rounded-3xl shadow-2xl p-3 flex items-center gap-4">
              <label className="p-3 bg-blue-50 text-blue-600 rounded-2xl cursor-pointer">
                <Upload size={24} />
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-700">{file ? file.name : "Select an image"}</p>
              </div>
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className={`h-12 px-6 rounded-2xl font-bold ${file ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-300'}`}
              >
                {loading ? "..." : "Detect"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
