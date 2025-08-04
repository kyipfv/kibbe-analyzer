import { useState } from 'react';

// Generate color swatches based on color season
const getColorPalette = (season) => {
  const palettes = {
    'bright spring': ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FFA502', '#FF4757', '#00D2D3', '#FEC02F', '#EA2C62'],
    'light spring': ['#FFB6C1', '#98D8C8', '#FFFACD', '#FFE4B5', '#FFD1DC', '#B2DFDB', '#FFF8DC', '#FFCCCB'],
    'bright winter': ['#FF0080', '#00BFA5', '#FFD600', '#FF1744', '#00E676', '#651FFF', '#00B8D4', '#C51162'],
    'dark winter': ['#880E4F', '#1A237E', '#B71C1C', '#4A148C', '#006064', '#263238', '#3E2723', '#212121'],
    'soft summer': ['#D8BFD8', '#B0C4DE', '#DDA0DD', '#9370DB', '#8FBC8F', '#BC8F8F', '#F0E68C', '#D3D3D3'],
    'light summer': ['#E6E6FA', '#F0F8FF', '#FFF0F5', '#F5FFFA', '#F0FFF0', '#F5F5DC', '#FFFAF0', '#FFF5EE'],
    'soft autumn': ['#CD853F', '#DEB887', '#D2691E', '#BC8F8F', '#8B7355', '#A0522D', '#D2B48C', '#F4A460'],
    'dark autumn': ['#8B4513', '#A52A2A', '#800000', '#696969', '#483D8B', '#2F4F4F', '#8B0000', '#556B2F'],
    'default': ['#E5E5E5', '#CCCCCC', '#B3B3B3', '#999999', '#808080', '#666666', '#4D4D4D', '#333333']
  };
  
  const normalizedSeason = season?.toLowerCase() || 'default';
  return palettes[normalizedSeason] || palettes['default'];
};

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(selectedFile.type)) {
        setError('Please upload a JPG or PNG image');
        return;
      }
      setError('');
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResults(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } };
      handleFileChange(event);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
      {/* Premium Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-stone-200/50 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-stone-900 via-stone-700 to-stone-600 bg-clip-text text-transparent">
                Kibbe & Color Analysis
              </h1>
              <p className="text-sm text-stone-500 mt-1">Discover your unique style archetype and personal color palette</p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-stone-500 font-medium">AI-Powered Analysis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          
          {/* Premium Upload Section */}
          <div className="mb-12">
            <div
              className="group relative bg-white/70 backdrop-blur-sm border-2 border-dashed border-stone-300/60 rounded-2xl p-12 text-center hover:border-stone-400/80 hover:bg-white/90 transition-all duration-300 shadow-sm hover:shadow-lg"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-stone-50/20 to-transparent rounded-2xl"></div>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg,image/png"
                className="hidden"
                id="fileInput"
              />
              <label htmlFor="fileInput" className="cursor-pointer block relative z-10">
                {preview ? (
                  <div className="space-y-6">
                    <div className="relative inline-block">
                      <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl shadow-lg ring-1 ring-stone-200/50" />
                      <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Ready
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 font-medium">{file.name}</p>
                  </div>
                ) : (
                  <div className="py-8">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                        <svg className="w-8 h-8 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-xl font-semibold text-stone-800 mb-3">Upload Your Photo</div>
                    <div className="text-stone-500 mb-2">
                      Drag and drop your image here, or click to select
                    </div>
                    <div className="inline-flex items-center space-x-4 text-xs text-stone-400">
                      <span className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>
                        <span>JPG, PNG supported</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-stone-300 rounded-full"></div>
                        <span>Max 5MB</span>
                      </span>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {file && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className={`group relative inline-flex items-center px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                    loading
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-stone-900 to-stone-800 text-white hover:from-stone-800 hover:to-stone-700 hover:shadow-xl hover:shadow-stone-900/25 hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing Your Style...</span>
                    </>
                  ) : (
                    <>
                      <span>Begin Analysis</span>
                      <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Premium Results Section */}
          {results && (
            <div className="space-y-8 animate-fadeIn">
              {/* Premium Results Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 bg-emerald-50/80 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200/50 mb-4">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-700">Analysis Complete</span>
                </div>
                <h2 className="text-2xl font-bold text-stone-800">Your Personal Style Profile</h2>
              </div>

              {/* Premium Results Grid */}
              <div className="space-y-6">
                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg border border-stone-200/50 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-sm"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-stone-800 mb-2">Kibbe Body Archetype</h3>
                      <p className="text-3xl font-bold bg-gradient-to-r from-stone-800 to-stone-600 bg-clip-text text-transparent mb-2">
                        {results.kibbe_archetype}
                      </p>
                      <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg border border-stone-200/50 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full shadow-sm"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-stone-800 mb-2">Seasonal Color Type</h3>
                      <p className="text-3xl font-bold bg-gradient-to-r from-stone-800 to-stone-600 bg-clip-text text-transparent mb-2">
                        {results.color_season}
                      </p>
                      <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-lg border border-stone-200/50 transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-3 h-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-sm"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-stone-800 mb-4">Your Signature Color Palette</h3>
                      <div className="grid grid-cols-4 gap-3 mb-6">
                        {getColorPalette(results.color_season).map((color, index) => (
                          <div
                            key={index}
                            className="group/swatch relative aspect-square rounded-xl shadow-md border-2 border-white hover:scale-110 hover:shadow-lg transition-all duration-300 cursor-pointer"
                            style={{ backgroundColor: color }}
                            title={color}
                          >
                            <div className="absolute inset-0 bg-black/0 group-hover/swatch:bg-black/10 rounded-xl transition-colors duration-300"></div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full shadow-sm opacity-0 group-hover/swatch:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-stone-50/80 backdrop-blur-sm rounded-xl p-4 border border-stone-200/50">
                        <p className="text-stone-700 leading-relaxed font-medium">{results.palette_description}</p>
                      </div>
                      <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mt-4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;