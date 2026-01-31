import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Challenge() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/leaderboards');
  }, [navigate]);

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center p-8 mt-7">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Čakate izziv...
        </h2>
        <p className="text-gray-600">
          Če se modal ne prikaže, kliknite spodnji gumb za nazaj na lestvico.
        </p>

        <button
          onClick={() => navigate('/leaderboards')}
          className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors mt-4"
        >
          ← Nazaj na lestvico
        </button>
      </div>
    </div>
  );
}
