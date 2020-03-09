import * as React from 'react';

import { useAgentConfig } from '../../../../hooks';

function useTimer() {
  const config = useAgentConfig() || {};
  const [time, setTime] = React.useState(0);

  React.useEffect(
    () => {
      function updateTimer(timerStart?: number) {
        timerStart && setTime(Date.now() - timerStart);
      }

      const { timerStart } = config;
      updateTimer(timerStart);
      const interval = setInterval(() => updateTimer(timerStart), 1000);

      return () => {
        clearInterval(interval);
      };
    },
    [config.timerStart],
  );

  return time;
}

export const Timer = () => {
  const time = useTimer();

  const seconds = (`0${Math.floor(time / 1000) % 60}`).slice(-2);
  const minutes = (`0${Math.floor(time / 60000) % 60}`).slice(-2);
  const hours = (`0${Math.floor(time / 3600000)}`).slice(-2);

  return (
    <div>
      <div>{`${hours}:${minutes}:${seconds}`}</div>
    </div>
  );
};
