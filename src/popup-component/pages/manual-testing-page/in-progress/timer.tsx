import * as React from 'react';

function useTimer() {
  const [time, setTime] = React.useState(0);

  React.useEffect(() => {
    const timerStart = Date.now();
    const interval = setInterval(() => {
      setTime(Date.now() - timerStart);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return time;
}

export const Timer = () => {
  const time = useTimer();

  const seconds = ('0' + (Math.floor(time / 1000) % 60)).slice(-2);
  const minutes = ('0' + (Math.floor(time / 60000) % 60)).slice(-2);
  const hours = ('0' + Math.floor(time / 3600000)).slice(-2);

  return (
    <div>
      <div>{`${hours}:${minutes}:${seconds}`}</div>
    </div>
  );
};
