// components/FilterPanel.tsx
import React from "react";

interface FilterPanelProps {
  filters: {
    liked: boolean;
    showMe: string;
  };
  setFilters: (filters: any) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters }) => {
  return (
    <div className="w-full sm:w-60 bg-white p-4 border rounded shadow-sm mb-6">
      <h2 className="text-xl font-bold mb-4">Filters</h2>

      <div className="mb-4">
        <p className="font-semibold mb-2">Show Me</p>
        <div className="space-y-1 text-sm">
          <label>
            <input
              type="radio"
              name="showMe"
              value="everything"
              checked={filters.showMe === "everything"}
              onChange={() => setFilters({ ...filters, showMe: "everything" })}
            />
            <span className="ml-2">Everything</span>
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="showMe"
              value="liked"
              checked={filters.showMe === "liked"}
              onChange={() => setFilters({ ...filters, showMe: "liked" })}
            />
            <span className="ml-2">Liked</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
