import { Link } from "react-router-dom";

interface FollowModalProps {
  type: "followers" | "following";
  users: { _id: string; username: string }[];
  darkMode: boolean;
  onClose: () => void;
}

const FollowModal = ({ type, users, darkMode, onClose }: FollowModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} p-6 rounded-xl w-96 max-h-[80vh] overflow-y-auto shadow-2xl`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold capitalize">{type}</h2>
          <button onClick={onClose} className="text-2xl hover:text-red-500">&times;</button>
        </div>
        <ul className="space-y-3">
          {users.map((u) => (
            <li key={u._id} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <Link to={`/profile/${u._id}`} onClick={onClose} className="font-semibold hover:text-blue-500">
                {u.username}
              </Link>
            </li>
          ))}
          {users.length === 0 && <p className="text-center opacity-70">No users found.</p>}
        </ul>
      </div>
    </div>
  );
};

export default FollowModal;
