import React, { useState } from 'react';

interface SettingsPanelProps {
  systemPrompt: string;
  onSystemPromptChange: (prompt: string) => void;
  autoGenerateImages: boolean;
  onAutoGenerateImagesChange: (enabled: boolean) => void;
  onNewStory: () => void;
  onRegenerateImage: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  systemPrompt,
  onSystemPromptChange,
  autoGenerateImages,
  onAutoGenerateImagesChange,
  onNewStory,
  onRegenerateImage
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="settings-panel">
      <button
        className="settings-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '▼' : '▶'} Settings
      </button>

      {isExpanded && (
        <div className="settings-content">
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={autoGenerateImages}
                onChange={(e) => onAutoGenerateImagesChange(e.target.checked)}
              />
              Auto-generate images
            </label>
          </div>

          <div className="setting-group">
            <label>System Prompt:</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => onSystemPromptChange(e.target.value)}
              rows={6}
              placeholder="Enter the system prompt to guide the story generation..."
            />
          </div>

          <div className="setting-actions">
            <button onClick={onNewStory} className="btn-secondary">
              New Story
            </button>
            <button onClick={onRegenerateImage} className="btn-secondary">
              Regenerate Last Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
