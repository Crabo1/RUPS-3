import { Alert, Button, Card, Label, Spinner, TextInput } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { HiInformationCircle } from 'react-icons/hi';

export default function Game() {
  const navigate = useNavigate();
  const {
    leaderboard,
    isLoading,
    createLeaderboard,
    joinLeaderboard,
    isCreating,
    isJoining,
    createError,
    joinError,
  } = useLeaderboard();

  const [leaderboardName, setLeaderboardName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (leaderboard && joinCode === '') {
      setJoinCode(leaderboard.id.toString());
    }
  }, [leaderboard]);

  const isJoinCodeDifferent = leaderboard
    ? joinCode.trim() !== leaderboard.id.toString()
    : true;

  const handleJoinCodeBlur = () => {
    if (leaderboard && !joinCode.trim()) {
      setJoinCode(leaderboard.id.toString());
    }
  };

  const handleCreateLeaderboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderboardName.trim()) return;

    try {
      await createLeaderboard({ name: leaderboardName });
      setLeaderboardName('');
      setShowCreateForm(false);
      setSuccessMessage('Skupina ustvarjena!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Napaka pri ustvarjanju skupine:', error);
    }
  };

  const handleJoinLeaderboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    const leaderboardId = parseInt(joinCode, 10);
    if (isNaN(leaderboardId)) {
      return;
    }

    try {
      await joinLeaderboard(leaderboardId);
      setJoinCode('');
      setSuccessMessage('Pridružil si se skupini!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Napaka pri pridružitvi:', error);

      setJoinCode(leaderboard ? leaderboard.id.toString() : '');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-8">
      <div className="flex min-w-[70%] justify-center gap-32">
        <Card className="max-w-md min-w-sm rounded-4xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Skupina{leaderboard && ` - ${leaderboard.name}`}
            </h2>
            {isLoading && <Spinner size="sm" />}
          </div>

          {successMessage && (
            <Alert color="success" icon={HiInformationCircle}>
              {successMessage}
            </Alert>
          )}

          <form onSubmit={handleJoinLeaderboard} className="space-y-4">
            <div>
              <Label htmlFor="join-code">ID Skupine</Label>
              <TextInput
                id="join-code"
                name="join-code"
                type="text"
                placeholder="Vnesi ID skupine"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onBlur={handleJoinCodeBlur}
                disabled={isJoining}
              />
              {joinError && (
                <p className="mt-1 text-sm text-red-600">{joinError.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isJoining || !joinCode.trim() || !isJoinCodeDifferent}
            >
              {isJoining ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Pridruževanje...
                </>
              ) : (
                'Pridruži se Skupini'
              )}
            </Button>
          </form>

          <div className="border-t pt-4">
            {!showCreateForm ? (
              <Button
                color="light"
                className="w-full"
                onClick={() => setShowCreateForm(true)}
              >
                Ustvari novo skupino
              </Button>
            ) : (
              <form onSubmit={handleCreateLeaderboard} className="space-y-4">
                <div>
                  <Label htmlFor="leaderboard-name">Ime skupine</Label>
                  <TextInput
                    id="leaderboard-name"
                    name="leaderboard-name"
                    type="text"
                    placeholder="Vnesi ime skupine"
                    value={leaderboardName}
                    onChange={(e) => setLeaderboardName(e.target.value)}
                    disabled={isCreating}
                  />
                  {createError && (
                    <p className="mt-1 text-sm text-red-600">
                      {createError.message}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isCreating || !leaderboardName.trim()}
                  >
                    {isCreating ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Ustvarjanje...
                      </>
                    ) : (
                      'Ustvari'
                    )}
                  </Button>
                  <Button
                    color="light"
                    onClick={() => {
                      setShowCreateForm(false);
                      setLeaderboardName('');
                    }}
                    disabled={isCreating}
                  >
                    Prekliči
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
        <div>
          <img
            src="/robot-excited.svg"
            alt="Excited Robot"
            className="h-64 w-64"
          />
          <Button
            size="xl"
            className="w-full"
            onClick={() => navigate('/game/levels')}
            disabled={!leaderboard}
          >
            Začni igro
          </Button>
        </div>
      </div>
    </div>
  );
}
