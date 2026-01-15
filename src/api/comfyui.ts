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
   * Enhance prompt with quality tags and first-person perspective
   */
  private enhancePrompt(prompt: string): string {
    const qualityTags = [
      'high quality',
      'masterpiece',
      'best quality',
      'highly detailed',
      '8k uhd',
      'professional',
      'sharp focus',
      'perfect composition',
      'immersive first person perspective',
      'POV shot'
    ];

    return `${prompt}, ${qualityTags.join(', ')}`;
  }

  /**
   * Create a simple text-to-image workflow
   * This is a basic example - you'll need to customize based on your ComfyUI setup
   */
  createTextToImageWorkflow(prompt: string): Record<string, any> {
    // Enhance the prompt with quality tags
    const enhancedPrompt = this.enhancePrompt(prompt);
    console.log('Original prompt:', prompt);
    console.log('Enhanced prompt:', enhancedPrompt);

    return {
      "3": {
        "inputs": {
          "seed": Math.floor(Math.random() * 1000000000),
          "steps": 20,
          "cfg": 8,
          "sampler_name": "uni_pc_bh2",
          "scheduler": "simple",
          "denoise": 1,
          "model": ["4", 0],
          "positive": ["6", 0],
          "negative": ["7", 0],
          "latent_image": ["5", 0]
        },
        "class_type": "KSampler",
        "_meta": {
          "title": "KSampler"
        }
      },
      "4": {
        "inputs": {
          "ckpt_name": "biglustydonutmixNSFW_v12.safetensors"
        },
        "class_type": "CheckpointLoaderSimple",
        "_meta": {
          "title": "Load Checkpoint"
        }
      },
      "5": {
        "inputs": {
          "width": 1920,
          "height": 1080,
          "batch_size": 1
        },
        "class_type": "EmptyLatentImage",
        "_meta": {
          "title": "Empty Latent Image"
        }
      },
      "6": {
        "inputs": {
          "text": enhancedPrompt,
          "clip": ["4", 1]
        },
        "class_type": "CLIPTextEncode",
        "_meta": {
          "title": "CLIP Text Encode (Prompt)"
        }
      },
      "7": {
        "inputs": {
          "text": "text, watermark, low quality, worst quality, blurry, bad anatomy, bad proportions, ugly, deformed, distorted, poorly drawn, amateur, sketch, draft",
          "clip": ["4", 1]
        },
        "class_type": "CLIPTextEncode",
        "_meta": {
          "title": "CLIP Text Encode (Prompt)"
        }
      },
      "8": {
        "inputs": {
          "samples": ["3", 0],
          "vae": ["4", 2]
        },
        "class_type": "VAEDecode",
        "_meta": {
          "title": "VAE Decode"
        }
      },
      "9": {
        "inputs": {
          "filename_prefix": "ComfyUI",
          "images": ["11", 0]
        },
        "class_type": "SaveImage",
        "_meta": {
          "title": "Save Image"
        }
      },
      "10": {
        "inputs": {
          "model_name": "2xNomosUni_compact_otf_medium.safetensors"
        },
        "class_type": "UpscaleModelLoader",
        "_meta": {
          "title": "Load Upscale Model"
        }
      },
      "11": {
        "inputs": {
          "grain_intensity": 0.04,
          "saturation_mix": 0.5,
          "batch_size": 4,
          "images": ["12", 0]
        },
        "class_type": "FastFilmGrain",
        "_meta": {
          "title": "🎞️ Fast Film Grain"
        }
      },
      "12": {
        "inputs": {
          "upscale_model": ["10", 0],
          "image": ["8", 0]
        },
        "class_type": "ImageUpscaleWithModel",
        "_meta": {
          "title": "Upscale Image (using Model)"
        }
      },
      "13": {
        "inputs": {
          "enabled": true,
          "swap_model": "hyperswap_1b_256.onnx",
          "facedetection": "YOLOv5n",
          "face_restore_model": "GFPGANv1.4.pth",
          "face_restore_visibility": 1,
          "codeformer_weight": 1,
          "detect_gender_input": "no",
          "detect_gender_source": "no",
          "input_faces_index": "0",
          "source_faces_index": "0",
          "console_log_level": 1,
          "source_image": ["14", 0]
        },
        "class_type": "ReActorFaceSwap",
        "_meta": {
          "title": "ReActor 🌌 Fast Face Swap"
        }
      },
      "14": {
        "inputs": {
          "image": "content.png"
        },
        "class_type": "LoadImage",
        "_meta": {
          "title": "Load Image"
        }
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
