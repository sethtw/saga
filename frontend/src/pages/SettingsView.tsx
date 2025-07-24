import React from 'react';
import { Link } from 'react-router-dom';
import AutoSaveSettings from '@/components/settings/AutoSaveSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';

const SettingsView: React.FC = () => {
    return (
        <div className="container mx-auto p-4">
            <Link to="/" className="text-blue-500 hover:underline mb-4 block">&larr; Back to Dashboard</Link>
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <AutoSaveSettings />
            <AppearanceSettings />
        </div>
    );
};

export default SettingsView; 