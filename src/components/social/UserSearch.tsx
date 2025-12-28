import { Link } from "react-router-dom";

interface User {
  _id: string;
  username: string;
  isFollowing: boolean;
}

interface UserSearchProps {
  query: string;
  users: User[];
  darkMode: boolean;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  onToggleFollow: (id: string, isFollowing: boolean) => void;
}

const UserSearch = ({ 
  query, 
  users, 
  darkMode, 
  onQueryChange, 
  onSearch, 
  onToggleFollow 
}: UserSearchProps) => {
  return (
    <div className={`p-6 rounded-xl shadow-lg mb-10 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      <h2 className="text-xl font-semibold mb-4">Find Friends</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search username..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className={`flex-1 p-3 rounded-lg border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"}`}
        />
        <button
          onClick={onSearch}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Search Results */}
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u._id} className={`flex items-center justify-between p-3 rounded ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
            <Link to={`/profile/${u._id}`} className="font-semibold hover:underline">
              {u.username}
            </Link>
            <button
              onClick={() => onToggleFollow(u._id, u.isFollowing)}
              className={`px-4 py-1 rounded-full text-sm font-bold ${
                u.isFollowing 
                  ? "bg-red-500 text-white hover:bg-red-600" 
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {u.isFollowing ? "Unfollow" : "Follow"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearch;
