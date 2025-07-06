import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import FloatingNavBar, { NavMode } from './FloatingNavBar';
import FileTree from './FileTree';
import SendPanel from './SendPanel';
import SettingsPanel from './SettingsPanel';

const meta: Meta<typeof FloatingNavBar> = {
  title: 'Components/FloatingNavBar',
  component: FloatingNavBar,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', backgroundColor: 'var(--grey-900)', position: 'relative' }}>
        <div style={{ padding: '2rem', color: 'white' }}>
          <h1>Cert Manager Demo</h1>
          <p>Tap the navigation icons to see different panel states.</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FloatingNavBar>;

export const Collapsed: Story = {
  args: {
    children: null,
  },
};

const ListModeComponent = () => {
  const [mode, setMode] = useState<NavMode>('list');
  
  const renderContent = () => {
    switch (mode) {
      case 'list':
        return <FileTree />;
      case 'send.step1':
        return (
          <SendPanel
            step="step1"
            onStepChange={() => setMode('send.step2')}
            onSend={(certs) => console.log('Sending:', certs)}
          />
        );
      case 'send.step2':
        return (
          <SendPanel
            step="step2"
            onStepChange={() => setMode('send.step1')}
            onSend={(certs) => console.log('Sending:', certs)}
          />
        );
      case 'settings.home':
        return <SettingsPanel mode="home" />;
      default:
        return null;
    }
  };

  return (
    <FloatingNavBar onModeChange={setMode} mode={mode}>
      {renderContent()}
    </FloatingNavBar>
  );
};

export const ListMode: Story = {
  render: () => <ListModeComponent />,
};

const SendStep1Component = () => {
  const [mode, setMode] = useState<NavMode>('send.step1');
  
  return (
    <FloatingNavBar onModeChange={setMode} mode={mode}>
      <SendPanel
        step="step1"
        onStepChange={() => setMode('send.step2')}
        onSend={(certs) => console.log('Sending:', certs)}
      />
    </FloatingNavBar>
  );
};

export const SendStep1: Story = {
  render: () => <SendStep1Component />,
};

const SendStep2Component = () => {
  const [mode, setMode] = useState<NavMode>('send.step2');
  
  return (
    <FloatingNavBar onModeChange={setMode} mode={mode}>
      <SendPanel
        step="step2"
        onStepChange={() => setMode('send.step1')}
        onSend={(certs) => console.log('Sending:', certs)}
      />
    </FloatingNavBar>
  );
};

export const SendStep2: Story = {
  render: () => <SendStep2Component />,
};

const SettingsHomeComponent = () => {
  const [mode, setMode] = useState<NavMode>('settings.home');
  
  return (
    <FloatingNavBar onModeChange={setMode} mode={mode}>
      <SettingsPanel mode="home" />
    </FloatingNavBar>
  );
};

const SettingsDocumentComponent = () => {
  const [mode, setMode] = useState<NavMode>('settings.doc');
  
  return (
    <FloatingNavBar onModeChange={setMode} mode={mode}>
      <SettingsPanel mode="doc" />
    </FloatingNavBar>
  );
};

export const SettingsHome: Story = {
  render: () => <SettingsHomeComponent />,
};

export const SettingsDocument: Story = {
  render: () => <SettingsDocumentComponent />,
};