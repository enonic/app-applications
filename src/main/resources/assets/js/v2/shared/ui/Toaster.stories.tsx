import type {Meta, StoryObj} from '@storybook/preact-vite';
import type {ReactElement} from 'react';
import {useEffect} from 'react';
import {Button} from '@enonic/ui';
import {
    dismissToast,
    pushToast,
    resetNotifications,
} from '../../features/store/notifications.store';
import {Toaster} from './Toaster';

const meta: Meta<typeof Toaster> = {
    title: 'v2/Toaster',
    component: Toaster,
    parameters: {layout: 'fullscreen'},
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Toaster>;

const Demo = ({initial}: {initial?: 'all' | 'success'}): ReactElement => {
    useEffect(() => {
        resetNotifications();
        if (initial === 'all') {
            pushToast({tone: 'info', message: 'Heads up — info toast.', duration: 0});
            pushToast({tone: 'success', message: 'Application installed successfully.', duration: 0});
            pushToast({tone: 'warning', message: 'A new XP version is available.', duration: 0});
            pushToast({tone: 'error', message: 'Failed to start application.', duration: 0});
        } else if (initial === 'success') {
            pushToast({tone: 'success', message: 'Saved.', duration: 0});
        }
        return (): void => resetNotifications();
    }, [initial]);

    return (
        <div className="relative min-h-100 p-6">
            <div className="flex flex-wrap gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    label="Push info"
                    onClick={(): string => pushToast({tone: 'info', message: 'Heads up.'})}
                />
                <Button
                    variant="outline"
                    size="sm"
                    label="Push success"
                    onClick={(): string => pushToast({tone: 'success', message: 'Done.'})}
                />
                <Button
                    variant="outline"
                    size="sm"
                    label="Push warning"
                    onClick={(): string => pushToast({tone: 'warning', message: 'Be careful.'})}
                />
                <Button
                    variant="outline"
                    size="sm"
                    label="Push error"
                    onClick={(): string => pushToast({tone: 'error', message: 'Something broke.'})}
                />
                <Button
                    variant="outline"
                    size="sm"
                    label="Push sticky"
                    onClick={(): string => pushToast({tone: 'info', message: 'Stays until dismissed.', duration: 0})}
                />
                <Button variant="text" size="sm" label="Reset" onClick={(): void => resetNotifications()} />
            </div>
            <Toaster />
        </div>
    );
};

export const Default: Story = {
    name: 'Examples / Default',
    render: () => <Demo />,
};

export const PrePopulated: Story = {
    name: 'Examples / Pre-populated stack',
    render: () => <Demo initial="all" />,
};

export const SingleSticky: Story = {
    name: 'Examples / Single sticky',
    render: () => <Demo initial="success" />,
};

export const ManualDismiss: Story = {
    name: 'Behavior / Manual dismiss',
    render: () => {
        useEffect(() => {
            resetNotifications();
            const id = pushToast({tone: 'warning', message: 'Click the X to dismiss this toast.', duration: 0});
            return (): void => {
                dismissToast(id);
                resetNotifications();
            };
        }, []);
        return (
            <div className="relative min-h-100 p-6">
                <Toaster />
            </div>
        );
    },
};
