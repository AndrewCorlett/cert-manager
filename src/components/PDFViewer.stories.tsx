import type { Meta, StoryObj } from '@storybook/react';
import PDFViewer from './PDFViewer';

const meta: Meta<typeof PDFViewer> = {
  title: 'Components/PDFViewer',
  component: PDFViewer,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '100vw' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PDFViewer>;

export const SampleCertificate: Story = {
  args: {
    pdfUrl: '/dev-assets/ENG-1-2023.pdf',
    className: 'w-full h-full',
  },
};

export const Loading: Story = {
  args: {
    pdfUrl: '/nonexistent-file.pdf',
    className: 'w-full h-full',
  },
};