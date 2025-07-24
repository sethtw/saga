
import { useEffect } from 'react';
import useMapStore from '@/store/mapStore';

export const useUnsavedChangesProtection = () => {
  const { areElementsDirty, isViewportDirty } = useMapStore();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (areElementsDirty || isViewportDirty) {
        event.preventDefault();
        event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [areElementsDirty, isViewportDirty]);
}; 