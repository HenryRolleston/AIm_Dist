import { useState, useEffect } from "react";
import logo from "./assets/a.i.m.png";
import { useNavigate } from "react-router-dom";

function App() {
  const [reqs, setReqs] = useState(null);
  const [customReqs, setCustomReqs] = useState(null);
  const [desc, setDesc] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addingRole, setAddingRole] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [newFeatures, setNewFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState("");
  const [addingEntity, setAddingEntity] = useState(false);
  const [newEntity, setNewEntity] = useState("");
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:5000/api/requirements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: desc }),
    });
    const data = await res.json();
    setReqs(data);
    setCustomReqs(JSON.parse(JSON.stringify(data)));
  };

  useEffect(() => {
  if (sidebarOpen) {
    fetch("http://localhost:5000/api/history")
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => console.error("Failed to fetch history:", err));
    }
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 bg-white shadow-md">
        {/* Hamburger icon */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md hover:bg-gray-200"
        >
          <div className="space-y-1">
            <span className="block w-6 h-0.5 bg-gray-800"></span>
            <span className="block w-6 h-0.5 bg-gray-800"></span>
            <span className="block w-6 h-0.5 bg-gray-800"></span>
          </div>
        </button>

        <div className="w-8" />
      </div>

      
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-200 shadow-lg transform transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-800">History</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>
        <div className="p-4 text-gray-800 space-y-3">
          {history.length > 0 ? (
            history.map((item, idx) => (
              <div
                key={idx}
                className="p-2 bg-white rounded shadow cursor-pointer hover:bg-gray-100"
                onClick={() => setCustomReqs(item)}
              >
                <p className="font-semibold">{item.appName}</p>
                <p className="text-sm text-gray-500">
                  {item.entities?.slice(0, 2).join(", ")}{item.entities?.length > 2 ? "..." : ""}
                </p>
              </div>
            ))
          ) : (
            <p>No history yet...</p>
          )}
        </div>
      </div>

      {/* Overlay. Can click to close sidebar. */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-grow bg-slate-900 text-white flex flex-col items-center justify-start p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="AIm Logo" className="h-75 w-75 mb-2" />
        </div>

        {/* Input + button */}
        <textarea
          className="w-full max-w-lg p-3 border rounded-lg shadow-sm mb-4 text-center text-black"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Describe your app idea..."
        />

        <button
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Preview
        </button>

        {/* Results */}
        {reqs && (
          <div className="mt-8 w-full max-w-5xl flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-4">{reqs.appName}</h2>
            {/* Generate Button */}
            <button
              onClick={async () => {
                try {
                  // Save to backend (MongoDB)
                  await fetch("http://localhost:5000/api/save-requirements", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(customReqs),
                  });

                  // Save data to localStorage so Preview page can access it
                  localStorage.setItem("previewReqs", JSON.stringify(customReqs));

                  // Open new tab with /preview route
                  navigate("/preview", { state: { reqs: customReqs } });
                } catch (err) {
                  console.error("Failed to save or open:", err);
                  alert("Something went wrong while generating!");
                }
              }}
              className="mb-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
            Generate
          </button>

            {/* Two tables side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {/* Roles + Features section */}
              <div className="flex flex-col items-start w-full">
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full border border-gray-300 rounded-lg shadow-sm">
                    <thead className="bg-indigo-600 text-white">
                      <tr>
                        <th className="px-4 py-2 text-left">Roles</th>
                        <th className="px-4 py-2 text-left">Features</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {customReqs.roles.map((role) => (
                        <tr key={role} className="border-t border-gray-200">
                          <td className="px-4 py-2 font-medium text-gray-800 text-left">
                            {role}
                          </td>
                          <td className="px-4 py-2 text-gray-600 text-left">
                            <ul className="list-disc list-inside">
                              {(customReqs.features[role] || []).map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Role button / form */}
                {!addingRole ? (
                  <button
                    onClick={() => setAddingRole(true)}
                    className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
                  >
                    + Add Role
                  </button>
                ) : (
                  <div className="mt-4 p-4 border rounded bg-white text-gray-800 text-left shadow-md w-full">
                    <label className="block mb-2 font-medium">Role Name</label>
                    <input
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full border rounded px-2 py-1 mb-3"
                      placeholder="Enter role name..."
                    />

                    <label className="block mb-2 font-medium">Features</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        className="flex-grow border rounded px-2 py-1"
                        placeholder="Add feature..."
                      />
                      <button
                        onClick={() => {
                          if (featureInput.trim()) {
                            setNewFeatures([...newFeatures, featureInput.trim()]);
                            setFeatureInput("");
                          }
                        }}
                        className="bg-indigo-600 text-white px-3 rounded hover:bg-indigo-700"
                      >
                        ➕
                      </button>
                    </div>

                    {newFeatures.length > 0 && (
                      <ul className="list-disc list-inside mb-3">
                        {newFeatures.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setAddingRole(false);
                          setNewRole("");
                          setNewFeatures([]);
                        }}
                        className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (newRole.trim()) {
                            setCustomReqs((prev) => ({
                              ...prev,
                              roles: [...prev.roles, newRole.trim()],
                              features: { ...prev.features, [newRole.trim()]: newFeatures },
                            }));
                            setAddingRole(false);
                            setNewRole("");
                            setNewFeatures([]);
                          }
                        }}
                        className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Entities section */}
              <div className="flex flex-col items-start w-full">
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full border border-gray-300 rounded-lg shadow-sm">
                    <thead className="bg-indigo-600 text-white">
                      <tr>
                        <th className="px-4 py-2 text-left" colSpan={2}>
                          Entities
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {customReqs.entities
                        .reduce((rows, entity, index) => {
                          if (index % 2 === 0) {
                            rows.push([entity]);
                          } else {
                            rows[rows.length - 1].push(entity);
                          }
                          return rows;
                        }, [])
                        .map((pair, rowIndex) => (
                          <tr key={rowIndex} className="border-t border-gray-200">
                            {pair.map((e, i) => (
                              <td
                                key={i}
                                className="px-4 py-2 text-gray-800 text-left w-1/2"
                              >
                                {e}
                              </td>
                            ))}
                            {pair.length === 1 && (
                              <td className="px-4 py-2 text-gray-800 text-left w-1/2"></td>
                            )}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Entity button / form */}
                {!addingEntity ? (
                  <button
                    onClick={() => setAddingEntity(true)}
                    className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
                  >
                    + Add Entity
                  </button>
                ) : (
                  <div className="mt-4 p-4 border rounded bg-white text-gray-800 text-left shadow-md w-full">
                    <label className="block mb-2 font-medium">Entity Name</label>
                    <input
                      type="text"
                      value={newEntity}
                      onChange={(e) => setNewEntity(e.target.value)}
                      className="w-full border rounded px-2 py-1 mb-3"
                      placeholder="Enter entity name..."
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setAddingEntity(false);
                          setNewEntity("");
                        }}
                        className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (newEntity.trim()) {
                            setCustomReqs((prev) => ({
                              ...prev,
                              entities: [...prev.entities, newEntity.trim()],
                            }));
                            setAddingEntity(false);
                            setNewEntity("");
                          }
                        }}
                        className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;