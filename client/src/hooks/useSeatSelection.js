import { useReducer, useCallback } from 'react';

const initialState = {
  selectedIds: new Set(),
};

function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE': {
      const next = new Set(state.selectedIds);
      if (next.has(action.id)) {
        next.delete(action.id);
      } else {
        next.add(action.id);
      }
      return { ...state, selectedIds: next };
    }
    case 'CLEAR':
      return { ...state, selectedIds: new Set() };
    case 'REMOVE': {
      const next = new Set(state.selectedIds);
      next.delete(action.id);
      return { ...state, selectedIds: next };
    }
    default:
      return state;
  }
}

export const useSeatSelection = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const toggle  = useCallback((id) => dispatch({ type: 'TOGGLE', id }), []);
  const clear   = useCallback(()   => dispatch({ type: 'CLEAR' }), []);
  const remove  = useCallback((id) => dispatch({ type: 'REMOVE', id }), []);

  return {
    selectedIds: state.selectedIds,
    toggle,
    clear,
    remove,
    count: state.selectedIds.size,
  };
};
