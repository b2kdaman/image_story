import axios from 'axios';

const COMFYUI_BASE_URL = '/api/comfyui';

export class ComfyUIClient {
  private clientId: string;
  private ws: WebSocket | null = null;

  constructor() {
    this.clientId = this.generateClientId();
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Connect to ComfyUI WebSocket for real-time updates
   */
  connectWebSocket(onMessage: (data: any) => void): void {
    const wsUrl = `ws://127.0.0.1:8188/ws?clientId=${this.clientId}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Queue a prompt for image generation
   */
  async queuePrompt(workflow: Record<string, any>): Promise<{ prompt_id: string }> {
    try {
      const response = await axios.post(`${COMFYUI_BASE_URL}/prompt`, {
        prompt: workflow,
        client_id: this.clientId
      });
      return response.data;
    } catch (error) {
      console.error('Error queuing prompt:', error);
      throw new Error('Failed to queue prompt in ComfyUI');
    }
  }

  /**
   * Get history of a specific prompt
   */
  async getHistory(promptId: string): Promise<any> {
    try {
      const response = await axios.get(`${COMFYUI_BASE_URL}/history/${promptId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting history:', error);
      throw error;
    }
  }

  /**
   * Get generated image
   */
  async getImage(filename: string, subfolder: string, type: string): Promise<string> {
    const url = `${COMFYUI_BASE_URL}/view?filename=${filename}&subfolder=${subfolder}&type=${type}`;
    return url;
  }

  /**
   * Create a simple text-to-image workflow
   * This is a basic example - you'll need to customize based on your ComfyUI setup
   */
  createTextToImageWorkflow(prompt: string): Record<string, any> {
    return {
      "3": {
        "inputs": {
          "seed": Math.floor(Math.random() * 1000000000),
          "steps": 20,
          "cfg": 8,
          "sampler_name": "euler",
          "scheduler": "normal",
          "denoise": 1,
          "model": ["4", 0],
          "positive": ["6", 0],
          "negative": ["7", 0],
          "latent_image": ["5", 0]
        },
        "class_type": "KSampler"
      },
      "4": {
        "inputs": {
          "ckpt_name": "sd_xl_base_1.0.safetensors"
        },
        "class_type": "CheckpointLoaderSimple"
      },
      "5": {
        "inputs": {
          "width": 1024,
          "height": 1024,
          "batch_size": 1
        },
        "class_type": "EmptyLatentImage"
      },
      "6": {
        "inputs": {
          "text": prompt,
          "clip": ["4", 1]
        },
        "class_type": "CLIPTextEncode"
      },
      "7": {
        "inputs": {
          "text": "text, watermark, low quality, blurry",
          "clip": ["4", 1]
        },
        "class_type": "CLIPTextEncode"
      },
      "8": {
        "inputs": {
          "samples": ["3", 0],
          "vae": ["4", 2]
        },
        "class_type": "VAEDecode"
      },
      "9": {
        "inputs": {
          "filename_prefix": "ComfyUI",
          "images": ["8", 0]
        },
        "class_type": "SaveImage"
      }
    };
  }

  /**
   * Generate an image from a text prompt
   */
  async generateImage(prompt: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // Connect WebSocket to track progress
        this.connectWebSocket((data) => {
          if (data.type === 'executed' && data.data.output) {
            // Image generation complete
            const output = data.data.output;
            if (output.images && output.images.length > 0) {
              const image = output.images[0];
              const imageUrl = this.getImage(image.filename, image.subfolder, image.type);
              this.disconnectWebSocket();
              resolve(imageUrl as any);
            }
          }
        });

        // Queue the prompt
        const workflow = this.createTextToImageWorkflow(prompt);
        await this.queuePrompt(workflow);

      } catch (error) {
        this.disconnectWebSocket();
        reject(error);
      }
    });
  }
}

export const comfyUIClient = new ComfyUIClient();
