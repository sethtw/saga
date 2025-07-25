import { useState, useEffect } from 'react';
import { api } from '@/api/api';
import { type ObjectTypeDefinition } from '@/types/objectTypes';

export interface ObjectTypesState {
  objectTypes: ObjectTypeDefinition[];
  loading: boolean;
  error: string | null;
}

export const useObjectTypes = () => {
  const [state, setState] = useState<ObjectTypesState>({
    objectTypes: [],
    loading: true,
    error: null,
  });

  // Load object types on mount
  useEffect(() => {
    loadObjectTypes();
  }, []);

  const loadObjectTypes = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const objectTypes = await api.getObjectTypes();
      
      setState(prev => ({
        ...prev,
        objectTypes,
        loading: false,
      }));
      
      console.log(`✅ Loaded ${objectTypes.length} object types`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load object types';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      console.error('Failed to load object types:', error);
    }
  };

  const getObjectTypeDefinition = async (objectType: string): Promise<ObjectTypeDefinition | null> => {
    try {
      // First check if we already have it loaded
      const cached = state.objectTypes.find(type => type.name === objectType);
      if (cached) {
        return cached;
      }
      
      // Otherwise fetch it from the API
      const definition = await api.getObjectTypeDefinition(objectType);
      
      // Add to our cache
      setState(prev => ({
        ...prev,
        objectTypes: [...prev.objectTypes.filter(t => t.name !== objectType), definition],
      }));
      
      console.log(`✅ Loaded object type definition for ${objectType}:`, definition);
      return definition;
    } catch (error) {
      console.error(`Failed to load object type definition for ${objectType}:`, error);
      return null;
    }
  };

  const getObjectTypesByCategory = (category: string) => {
    return state.objectTypes.filter(type => type.category === category);
  };

  const getAvailableObjectTypes = () => {
    return state.objectTypes.filter(type => 
      type.permissions?.canCreate !== false
    );
  };

  const isValidObjectType = (objectType: string) => {
    return state.objectTypes.some(type => type.name === objectType);
  };

  const getObjectTypeNames = () => {
    return state.objectTypes.map(type => type.name);
  };

  const getObjectTypeDisplayName = (objectType: string) => {
    const type = state.objectTypes.find(t => t.name === objectType);
    return type?.displayName || objectType;
  };

  const getObjectTypePluralName = (objectType: string) => {
    const type = state.objectTypes.find(t => t.name === objectType);
    return type?.pluralName || `${objectType}s`;
  };

  const getObjectTypeIcon = (objectType: string) => {
    const type = state.objectTypes.find(t => t.name === objectType);
    return type?.icon || 'circle';
  };

  return {
    // State
    objectTypes: state.objectTypes,
    loading: state.loading,
    error: state.error,
    
    // Actions
    loadObjectTypes,
    getObjectTypeDefinition,
    
    // Computed values
    getObjectTypesByCategory,
    getAvailableObjectTypes,
    isValidObjectType,
    getObjectTypeNames,
    getObjectTypeDisplayName,
    getObjectTypePluralName,
    getObjectTypeIcon,
  };
}; 