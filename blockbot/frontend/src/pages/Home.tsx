import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center p-8">
      <div className="flex w-full max-w-6xl items-center justify-between gap-12">
        <div className="flex-1">
          <img
            src="/robot-wave.svg"
            alt="Robot Wave"
            className="w-full max-w-md"
          />
        </div>
        <div className="flex flex-1 flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-6xl font-bold text-gray-800">Zdravo!</h1>
            <p className="text-3xl text-gray-700">
              Si me pripravljen naučiti programirati?
            </p>
          </div>
          <Link to={user ? '/game' : '/auth?mode=login'}>
            <Button size="xl" className="text-xl font-bold">
              {user ? 'Začni igro' : 'Vpiši se'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
