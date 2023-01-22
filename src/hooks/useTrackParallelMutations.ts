import React from 'react';

// https://github.com/TanStack/query/discussions/2245#discussioncomment-2271299
export const useTrackParallelMutations = () => {
  const mutationNumber = React.useRef(0);

  return {
    startOne: () => {
      mutationNumber.current += 1;
    },
    endOne: () => {
      if (mutationNumber.current > 0) {
        mutationNumber.current -= 1;
      }
    },
    allEnded: () => mutationNumber.current === 0,
  };
};
