import { Agent } from 'types/agent';
import { State } from './main-page-state';

const SET_AGENT = 'SET_AGENT';

export type Action = ReturnType<typeof setAgent>;

export const setAgent = (agent: Agent) => ({ type: SET_AGENT, payload: agent } as const);


export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case SET_AGENT:
      return { ...state, agent: action.payload };
    default:
      return state;
  }
};
