import { ApplicationState } from './applicaiton-state-type';

const SET_EXPANDED = 'SET_EXPANDED';
const SAVE_POSITION = 'SAVE_POSITION';

export type Action = ReturnType<typeof setExpanded | typeof savePosition>;

export const setExpanded = (expanded: boolean) => ({ type: SET_EXPANDED, payload: expanded } as const);

export const savePosition = (position: { x: number; y: number}) => ({ type: SAVE_POSITION, payload: position } as const);

export const reducer = (state: ApplicationState, action: Action): ApplicationState => {
  switch (action.type) {
    case SET_EXPANDED:
      return { ...state, expanded: action.payload };
    case SAVE_POSITION:
      return { ...state, position: action.payload };
    default:
      return state;
  }
};
