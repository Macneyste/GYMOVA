import { useCallback, useEffect, useState } from 'react';

/** Countdown that matches the API's 60-second resend cooldown for verification codes. */
export function useResendCountdown(seconds: number, startImmediately = true) {
  const [secondsLeft, setSecondsLeft] = useState(startImmediately ? seconds : 0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const restart = useCallback(() => setSecondsLeft(seconds), [seconds]);
  return { secondsLeft, restart };
}
