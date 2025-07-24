import React from 'react';
import AutoSaveSettings from '../components/settings/AutoSaveSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';

const SettingsView: React.FC = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <AutoSaveSettings />
            <AppearanceSettings />
        </div>
    );
};

export default SettingsView; 