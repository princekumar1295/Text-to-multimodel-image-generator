import React, { useState, ChangeEvent } from 'react';
import { Wand2, Moon, Settings2, ImagePlus } from 'lucide-react';
// Removed unused import GoogleGenerativeAI
import { API_KEYS } from './config/apiKeys';

function App() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('FLUX.1-schnell');
  const [imageCount, setImageCount] = useState('4');
  const [aspectRatio, setAspectRatio] = useState('Square (1:1)');
  const [loading, setLoading] = useState(false);

  const models = [
    'FLUX.1-dev',
    'FLUX.1-schnell',
    'Stable Diffusion XL',
    'Stable Diffusion v1.5',
    'Stable Diffusion 3',
    'Openjourney'
  ];

  const imageCounts = ['1', '2', '4', '8'];
  const aspectRatios = ['Square (1:1)', 'Portrait (2:3)', 'Landscape (3:2)', 'Widescreen (16:9)'];

  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedImages([]);
    try {
      if (!prompt.trim()) {
        throw new Error('Please enter a valid prompt');
      }

      const count = parseInt(imageCount);
      const images: string[] = [];

      for (let i = 0; i < count; i++) {
        const response = await query({ inputs: prompt, model, aspectRatio });
        const imageUrl = URL.createObjectURL(response);
        images.push(imageUrl);
      }

      setGeneratedImages(images);
      console.log('Generated image URLs:', images);
    } catch (error) {
      console.error('Image generation failed:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to generate images'}`);
    } finally {
      setLoading(false);
      console.log('Generation process completed');
    }
  };

  // Download all generated images as files
  const handleDownload = () => {
    generatedImages.forEach((imgUrl, index) => {
      const link = document.createElement('a');
      link.href = imgUrl;
      link.download = `generated-image-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // Reset form and clear generated images
  const handleReset = () => {
    setPrompt('');
    setModel('FLUX.1-schnell');
    setImageCount('4');
    setAspectRatio('Square (1:1)');
    setGeneratedImages([]);
  };

  async function query(data: { inputs: string; model?: string; aspectRatio?: string }): Promise<Blob> {
    // Prepare request body with additional parameters if needed
    const bodyData: any = { inputs: data.inputs };
    if (data.model) bodyData.model = data.model;
    if (data.aspectRatio) bodyData.aspect_ratio = data.aspectRatio;

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        headers: {
          Authorization: "Bearer " + API_KEYS.huggingFace,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(bodyData),
      }
    );
    const result = await response.blob();
    return result;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-xl">
              <Wand2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">AI Image Generator</h1>
          </div>
          <button
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Toggle dark mode"
          >
            <Moon className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl">
          {/* Prompt Input */}
          <div className="relative mb-6">
            <textarea
              className="w-full bg-gray-700 rounded-xl p-4 pr-12 resize-none h-32 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe your imagination in detail..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              aria-label="Prompt input"
            />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Model Selection */}
            <div className="relative">
              <select
                className="w-full bg-gray-700 rounded-xl p-3 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={model}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setModel(e.target.value)}
                aria-label="Select model"
              >
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <Settings2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" />
            </div>

            {/* Image Count */}
            <div className="relative">
              <select
                className="w-full bg-gray-700 rounded-xl p-3 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={imageCount}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setImageCount(e.target.value)}
                aria-label="Select image count"
              >
                {imageCounts.map((count) => (
                  <option key={count} value={count}>{count} Images</option>
                ))}
              </select>
              <ImagePlus className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" />
            </div>

            {/* Aspect Ratio */}
            <div className="relative md:col-span-2">
              <select
                className="w-full bg-gray-700 rounded-xl p-3 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={aspectRatio}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setAspectRatio(e.target.value)}
                aria-label="Select aspect ratio"
              >
                {aspectRatios.map((ratio) => (
                  <option key={ratio} value={ratio}>{ratio}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            className={`w-full bg-purple-600 hover:bg-purple-700 rounded-xl p-4 font-semibold flex items-center justify-center gap-2 transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            onClick={handleGenerate}
            disabled={loading}
            aria-label="Generate images"
          >
            <Wand2 className="w-5 h-5" />
            {loading ? 'Generating...' : 'Generate'}
          </button>

          {/* Download and Reset Buttons */}
          <div className="flex justify-between mt-4 gap-4">
            <button
              className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl p-3 font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDownload}
              disabled={generatedImages.length === 0}
              aria-label="Download images"
            >
              Download
            </button>
            <button
              className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl p-3 font-semibold flex items-center justify-center gap-2 transition-colors"
              onClick={handleReset}
              aria-label="Reset form"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Results Grid */}
        {generatedImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {generatedImages.map((img, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl">
                <img 
                  src={img} 
                  alt={`Generated image ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {Array.from({ length: parseInt(imageCount) }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
