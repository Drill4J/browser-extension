const SET_EXPANDED = 'SET_EXPANDED';
const SAVE_POSITION = 'SAVE_POSITION';
const SET_INITIAL = 'SET_INITIAL';
const SET_IS_WIDGET_VISIBLE = 'SET_IS_WIDGET_VISIBLE';

export type Action = ReturnType<typeof setExpanded | typeof savePosition | typeof setInitial | typeof setIsWidgetVisible>;

export const setExpanded = (expanded: boolean) => ({ type: SET_EXPANDED, payload: expanded } as const);
export const setIsWidgetVisible = (data: boolean) => ({ type: SET_IS_WIDGET_VISIBLE, payload: data } as const);
export const savePosition = (position: { x: number; y: number}) => ({ type: SAVE_POSITION, payload: position } as const);
export const setInitial = (initialState: Record<string, any>) => ({ type: SET_INITIAL, payload: initialState } as const);

export const reducer = (sideEffect: (params: any) => void) => (state: ApplicationState, action: Action): ApplicationState => {
  const newState = (() => {
    switch (action.type) {
      case SET_EXPANDED:
        return { ...state, expanded: action.payload };
      case SAVE_POSITION:
        return { ...state, position: action.payload };
      case SET_IS_WIDGET_VISIBLE:
        return { ...state, isWidgetVisible: action.payload };
      case SET_INITIAL:
        return action.payload;
      default:
        return state;
    }
  })();

  // TODO It kinda defeats 'pure' function? Would like to move it outside?
  try {
    sideEffect(newState);
  } catch (e) {
    console.log('WARNING', 'side effect failed', e);
  }

  return newState;
};

interface ApplicationState {
  expanded?: boolean;
  isWidgetVisible?: boolean;
  position?: { x: number; y: number };
}
