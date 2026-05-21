import type {Meta, StoryObj} from '@storybook/preact-vite';
import {Spinner} from './Spinner';

const meta: Meta<typeof Spinner> = {
    title: 'v2/Spinner',
    component: Spinner,
    parameters: {layout: 'centered'},
    tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
    name: 'Examples / Default',
    render: () => <Spinner />,
};

export const Sizes: Story = {
    name: 'Examples / Sizes',
    render: () => (
        <div className="flex items-center gap-4">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
        </div>
    ),
};

export const Inline: Story = {
    name: 'Examples / Inline label',
    render: () => (
        <div className="flex items-center gap-2 text-sm text-subtle">
            <Spinner size="sm" label="Loading" />
            Loading application list…
        </div>
    ),
};
