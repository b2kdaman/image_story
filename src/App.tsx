import React from 'react';
import { StoryContainer } from './components/StoryContainer';
import { StoryInput } from './components/StoryInput';
import { SettingsPanel } from './components/SettingsPanel';
import { ImageGallery } from './components/ImageGallery';
import { useStory } from './hooks/useStory';
import './App.css';

function App() {
  const {
    messages,
    isGenerating,
    systemPrompt,
    autoGenerateImages,
    setSystemPrompt,
    setAutoGenerateImages,
    generateStoryResponse,
    startNewStory,
    regenerateLastImage
  } = useStory();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Interactive Story</h1>
        <p className="subtitle">Powered by LM Studio & ComfyUI</p>
      </header>

      <SettingsPanel
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        autoGenerateImages={autoGenerateImages}
        onAutoGenerateImagesChange={setAutoGenerateImages}
        onNewStory={() => startNewStory()}
        onRegenerateImage={regenerateLastImage}
      />

      <main className="app-main split-layout">
        <div className="chat-panel">
          <StoryContainer messages={messages} isGenerating={isGenerating} />
          <StoryInput onSubmit={generateStoryResponse} disabled={isGenerating} />
        </div>

        <div className="image-panel">
          <ImageGallery messages={messages} isGenerating={isGenerating} />
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Make sure LM Studio (localhost:1234) and ComfyUI (localhost:8188) are running
        </p>
      </footer>
    </div>
  );
}

export default App;
