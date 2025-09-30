import { useLocation } from "react-router-dom";
import { useState } from "react";

function Preview() {
  const location = useLocation();
  const { reqs } = location.state || {};
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  if (!reqs) {
    return <div className="p-8">No requirements provided.</div>;
  }

  const currentRole = reqs.roles[currentRoleIndex];

  const cycleRole = () => {
    setCurrentRoleIndex((prev) => (prev + 1) % reqs.roles.length);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div
        className="flex items-center justify-between p-4"
        style={{ backgroundColor: reqs.colorScheme?.primary || "#4f46e5" }}
      >
        <div className="flex gap-4 text-white">
          {(reqs.features[currentRole] || []).map((feature, i) => (
            <span key={i} className="font-medium">
              {feature}
            </span>
          ))}
        </div>
        <button
          onClick={cycleRole}
          className="bg-white text-black px-3 py-1 rounded shadow"
        >
          Switch Role ({currentRole})
        </button>
      </div>

      {/* Entity Forms */}
      <div className="p-6 flex flex-col gap-6">
        {reqs.entities.map((entity) => (
          <form
            key={entity}
            className="border rounded p-4 bg-white shadow-md"
          >
            <h3
              className="text-lg font-bold mb-3"
              style={{ color: reqs.colorScheme?.secondary || "#10b981" }}
            >
              {entity}
            </h3>
            {(reqs.entityAttributes?.[entity] || ["Name", "Description"]).map(
              (attr, i) => (
                <input
                  key={i}
                  placeholder={attr}
                  className="border p-2 w-full mb-2 rounded"
                />
              )
            )}
          </form>
        ))}
      </div>
    </div>
  );
}

export default Preview;