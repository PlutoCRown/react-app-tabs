import { createContext, useContext } from 'react';
import type { InternalTabsContextType } from './types';

export const TabsContext = createContext<InternalTabsContextType | undefined>(undefined);

export function useReactAppTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    return undefined;
  }
  const {
    requestSwipe: _requestSwipe,
    previewSwipe: _previewSwipe,
    clearPreview: _clearPreview,
    registerInnerScroll: _registerInnerScroll,
    unregisterInnerScroll: _unregisterInnerScroll,
    getInnerScrollControllerFromTarget: _getInnerScrollControllerFromTarget,
    ...publicContext
  } = context;
  return publicContext;
}
