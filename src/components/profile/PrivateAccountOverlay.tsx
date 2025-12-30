interface PrivateAccountOverlayProps {
  hasPendingRequest: boolean;
  onSendRequest: () => void;
}

const PrivateAccountOverlay = ({ hasPendingRequest, onSendRequest }: PrivateAccountOverlayProps) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-sm rounded-xl">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-2xl font-bold mb-2">This Account is Private</h3>
          <p className="opacity-70 mb-4">Follow this user to see their content</p>
          {hasPendingRequest ? (
            <p className="text-yellow-400 font-semibold">Follow request sent</p>
          ) : (
            <button
              onClick={onSendRequest}
              className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all"
            >
              Send Follow Request
            </button>
          )}
        </div>
      </div>
      
      {/* Blurred placeholder content */}
      <div className="filter blur-lg pointer-events-none opacity-50 min-h-[400px]">
        <div className="grid grid-cols-5 gap-4 p-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="aspect-[2/3] bg-gray-600 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivateAccountOverlay;
