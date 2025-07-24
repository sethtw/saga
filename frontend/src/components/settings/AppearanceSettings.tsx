import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import useSettingsStore from '@/store/settingsStore';

const AppearanceSettings: React.FC = () => {
    const { theme, setTheme } = useSettingsStore();

    return (
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
    );
};

export default AppearanceSettings; 