import type {Meta, StoryObj} from '@storybook/preact-vite';
import {Badge} from './Badge';

const meta: Meta<typeof Badge> = {
    title: 'v2/Badge',
    component: Badge,
    parameters: {layout: 'centered'},
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
    name: 'Examples / Default',
    render: () => <Badge>Default</Badge>,
};

export const Tones: Story = {
    name: 'Examples / Tones',
    render: () => (
        <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="info">Info</Badge>
            <Badge tone="success">Started</Badge>
            <Badge tone="warning">Stopped</Badge>
            <Badge tone="error">Failed</Badge>
        </div>
    ),
};

export const Sizes: Story = {
    name: 'Examples / Sizes',
    render: () => (
        <div className="flex flex-wrap items-center gap-2">
            <Badge tone="success" size="sm">Small</Badge>
            <Badge tone="success" size="md">Medium</Badge>
        </div>
    ),
};

export const Matrix: Story = {
    name: 'States / Tone × Size matrix',
    render: () => (
        <div className="grid grid-cols-2 gap-3">
            {(['neutral', 'info', 'success', 'warning', 'error'] as const).map((tone) => (
                <div key={tone} className="flex items-center gap-2">
                    <Badge tone={tone} size="sm">{tone} · sm</Badge>
                    <Badge tone={tone} size="md">{tone} · md</Badge>
                </div>
            ))}
        </div>
    ),
};
