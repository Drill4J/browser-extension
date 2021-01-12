import * as React from 'react';

function useTimer(start?: number) {
  const [time, setTime] = React.useState(0);

  React.useEffect(
    () => {
      const interval = setInterval(() => {
        start && setTime(Date.now() - start);
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    },
    [start],
  );

  return time;
}

interface Props {
  start?: number;
}

export const Timer = ({ start }: Props) => {
  const time = useTimer(start);

  const seconds = (`0${Math.floor(time / 1000) % 60}`).slice(-2);
  const minutes = (`0${Math.floor(time / 60000) % 60}`).slice(-2);
  const hours = (`0${Math.floor(time / 3600000)}`).slice(-2);

  return (
    <div>{`${hours}:${minutes}:${seconds}`}</div>
  );
};
