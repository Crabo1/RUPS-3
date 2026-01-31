export async function sendChallenge(challengeeName: string) {
  const token = localStorage.getItem('token');

  const res = await fetch('http://localhost:5050/challenges', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ challengee_name: challengeeName }),
  });

  if (!res.ok) throw new Error('Failed to send challenge');

  return res.json();
}
