import React from 'react';
import useSettingsStore from '../store/settingsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const SettingsView: React.FC = () => {
    const {
        autoSaveEnabled,
        autoSaveInterval,
        theme,
        setAutoSaveEnabled,
        setAutoSaveInterval,
        setTheme,
    } = useSettingsStore();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
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

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="theme-select">Theme</Label>
                        <Select value={theme} onValueChange={(value) => setTheme(value as any)}>
                            <SelectTrigger id="theme-select">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsView; 