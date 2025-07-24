import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import useSettingsStore from '@/store/settingsStore';

const AutoSaveSettings: React.FC = () => {
    const {
        autoSaveEnabled,
        autoSaveInterval,
        setAutoSaveEnabled,
        setAutoSaveInterval,
    } = useSettingsStore();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Auto-Save</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save-enabled">Enable Auto-Save</Label>
                    <Switch
                        id="auto-save-enabled"
                        checked={autoSaveEnabled}
                        onCheckedChange={setAutoSaveEnabled}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="auto-save-interval">Auto-Save Interval (ms)</Label>
                    <Input
                        id="auto-save-interval"
                        type="number"
                        value={autoSaveInterval}
                        onChange={(e) => setAutoSaveInterval(parseInt(e.target.value))}
                        disabled={!autoSaveEnabled}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default AutoSaveSettings; 