# Interactive Story with AI

An immersive, interactive storytelling application that combines AI-powered narrative generation with dynamic image creation. The app uses **LM Studio** for roleplay text generation and **ComfyUI** for scene visualization.

## Features

- 🎭 **Interactive Roleplay**: Engage in dynamic story experiences powered by local LLM
- 🎨 **AI-Generated Images**: Visual scenes generated automatically for each story moment
- 💻 **Fully Local**: Runs entirely on your machine using LM Studio and ComfyUI
- ⚙️ **Customizable**: Adjust system prompts and generation settings
- 🎯 **Real-time Generation**: Stream responses from LM Studio with live updates

## Prerequisites

Before running this application, you need to have the following installed and running locally:

### 1. LM Studio
- Download from [https://lmstudio.ai/](https://lmstudio.ai/)
- Load a model of your choice (recommended: 7B-13B parameter models for good performance)
- Start the local server on `http://localhost:1234`

### 2. ComfyUI
- Install from [https://github.com/comfyanonymous/ComfyUI](https://github.com/comfyanonymous/ComfyUI)
- Download a Stable Diffusion model (e.g., SDXL or SD 1.5)
- Start ComfyUI server on `http://127.0.0.1:8188`

### 3. Node.js
- Version 18 or higher
- Download from [https://nodejs.org/](https://nodejs.org/)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/b2kdaman/image_story.git
   cd image_story
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** (optional)
   ```bash
   cp .env.example .env
   ```
   Edit `.env` if your LM Studio or ComfyUI run on different ports.

## Usage

### Starting the Application

1. **Start LM Studio**
   - Open LM Studio
   - Load your preferred model
   - Click "Start Server" (default: localhost:1234)

2. **Start ComfyUI**
   ```bash
   # In your ComfyUI directory
   python main.py
   ```

3. **Start the Interactive Story App**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`

### Using the Application

1. **Start Your Story**: Type your first action or scenario in the input box
2. **Interact**: The AI will respond with story continuation
3. **Enjoy Visuals**: Images are automatically generated for each scene
4. **Customize**: Use the Settings panel to:
   - Toggle auto-image generation on/off
   - Modify the system prompt for different story styles
   - Start a new story
   - Regenerate the last image

### Example Prompts

- "I wake up in a mysterious ancient temple filled with glowing runes"
- "As a detective, I enter the abandoned mansion to investigate"
- "I'm a space explorer discovering an alien civilization"

## Project Structure

```
image_story/
├── src/
│   ├── api/
│   │   ├── comfyui.ts       # ComfyUI API client
│   │   └── lmstudio.ts      # LM Studio API client
│   ├── components/
│   │   ├── MessageBubble.tsx
│   │   ├── StoryContainer.tsx
│   │   ├── StoryInput.tsx
│   │   └── SettingsPanel.tsx
│   ├── hooks/
│   │   └── useStory.ts      # Story management logic
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   ├── App.css              # Application styles
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── vite.config.ts           # Vite configuration with proxies
└── tsconfig.json
```

## Customization

### ComfyUI Workflow

The default workflow is configured in `src/api/comfyui.ts`. You can customize it to:
- Use different models
- Adjust image dimensions
- Change samplers and schedulers
- Modify generation parameters

Edit the `createTextToImageWorkflow()` method to match your ComfyUI setup.

### System Prompt

Customize the storytelling style by modifying the system prompt in the Settings panel or in `src/hooks/useStory.ts`.

## Troubleshooting

### LM Studio Connection Issues
- Ensure LM Studio server is running on port 1234
- Check that a model is loaded in LM Studio
- Verify the server is set to "Accept connections"

### ComfyUI Connection Issues
- Confirm ComfyUI is running on port 8188
- Make sure you have the required models downloaded
- Check ComfyUI console for errors
- Verify the workflow matches your ComfyUI node setup

### Image Generation Fails
- Check that your ComfyUI workflow is correctly configured
- Ensure model names in the workflow match your installed models
- Review ComfyUI console output for specific errors

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client
- **LM Studio** - Local LLM inference
- **ComfyUI** - Image generation

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

MIT

## Acknowledgments

- [LM Studio](https://lmstudio.ai/) - Local LLM runtime
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) - Powerful image generation interface
- [Anthropic](https://www.anthropic.com/) - For Claude Code assistance
