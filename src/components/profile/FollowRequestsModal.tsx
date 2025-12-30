import { Link } from "react-router-dom";

interface FollowRequest {
  _id: string;
  from: { _id: string; username: string };
}

interface FollowRequestsModalProps {
  requests: FollowRequest[];
  darkMode: boolean;
  onClose: () => void;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

const FollowRequestsModal = ({ 
  requests, 
  darkMode, 
  onClose, 
  onAccept, 
  onReject 
}: FollowRequestsModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} p-6 rounded-xl w-96 max-h-[80vh] overflow-y-auto shadow-2xl`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Follow Requests</h2>
          <button onClick={onClose} className="text-2xl hover:text-red-500">&times;</button>
        </div>
        <ul className="space-y-3">
          {requests.map((req) => (
            <li key={req._id} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <Link to={`/profile/${req.from._id}`} onClick={onClose} className="font-semibold hover:text-blue-500">
                {req.from.username}
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => onAccept(req._id)}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600"
                >
                  ✓
                </button>
                <button
                  onClick={() => onReject(req._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
          {requests.length === 0 && <p className="text-center opacity-70">No pending requests.</p>}
        </ul>
      </div>
    </div>
  );
};

export default FollowRequestsModal;
