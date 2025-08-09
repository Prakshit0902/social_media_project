import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IconPhoto, 
  IconVideo, 
  IconX, 
  IconUpload, 
  IconLocation,
  IconHash
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../../store/slices/postSlice';

export const CreatePost = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { createPostLoading, createPostError } = useSelector((state) => state.post);
  
  const [postType, setPostType] = useState('image'); // 'image' or 'video'
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Please select an image or video file');
      return;
    }

    // Update post type based on file
    setPostType(isImage ? 'image' : 'video');
    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    try {
      // Create FormData for file upload matching backend expectations
      const formData = new FormData();
      formData.append('media', selectedFile); // Changed from 'file' to 'media'
      formData.append('caption', description); // Changed from 'description' to 'caption'
      
      // Add location to caption if provided
      let captionWithLocation = description;
      if (location) {
        captionWithLocation += `\n📍 ${location}`;
      }
      formData.append('caption', captionWithLocation);
      
      // Process hashtags - extract from caption and add manual tags
      let allTags = [];
      
      // Extract hashtags from caption
      const hashtagsFromCaption = description.match(/#[a-zA-Z0-9_]+/g) || [];
      allTags = [...hashtagsFromCaption.map(tag => tag.slice(1).toLowerCase())];
      
      // Add manual tags if provided
      if (tags.trim()) {
        const manualTags = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);
        // Add # prefix to manual tags if not present and add to caption
        const hashtaggedManualTags = manualTags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
        captionWithLocation += ' ' + hashtaggedManualTags.join(' ');
        formData.set('caption', captionWithLocation);
      }
      
      formData.append('mediaType', postType); // Add media type for backend processing
      
      // Dispatch the createPost action
      const result = await dispatch(createPost(formData));
      
      if (createPost.fulfilled.match(result)) {
        console.log('Post created successfully:', result.payload);
        
        // Show success message
        alert('Post created successfully!');
        
        // Navigate back to dashboard
        navigate('/dashboard');
      } else {
        // Handle error case
        console.error('Post creation failed:', result.payload);
        alert(result.payload || 'Failed to create post. Please try again.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Create New Post</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <IconX size={24} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {createPostError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
            >
              <p className="text-red-300 text-sm">{createPostError}</p>
            </motion.div>
          )}

          {/* File Upload Section */}
          <div className="backdrop-blur-xl bg-black/30 p-6 rounded-2xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Upload Media</h3>
            
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragOver 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-white/20 hover:border-white/40'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <IconUpload size={48} className="mx-auto text-white/60 mb-4" />
                <p className="text-white/80 mb-2">Drag and drop your image or video here</p>
                <p className="text-white/50 text-sm mb-4">or</p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <motion.span
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-600 transition-colors"
                  >
                    Choose File
                  </motion.span>
                </label>
                <p className="text-white/40 text-xs mt-4">
                  Supported formats: JPG, PNG, GIF, MP4, WebM (Max 50MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Preview */}
                <div className="relative rounded-xl overflow-hidden bg-black/50">
                  {postType === 'image' ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full max-h-96 object-contain"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full max-h-96 object-contain"
                    />
                  )}
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <IconX size={16} />
                  </button>
                </div>

                {/* File Info */}
                <div className="flex items-center gap-3 text-sm text-white/70">
                  {postType === 'image' ? (
                    <IconPhoto size={20} className="text-green-400" />
                  ) : (
                    <IconVideo size={20} className="text-blue-400" />
                  )}
                  <span>{selectedFile.name}</span>
                  <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              </div>
            )}
          </div>

          {/* Post Details */}
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="backdrop-blur-xl bg-black/30 p-6 rounded-2xl border border-white/10 space-y-4"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Post Details</h3>

              {/* Description/Caption */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Caption
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a caption for your post... Use #hashtags to categorize your content"
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
                />
                <p className="text-white/40 text-xs mt-1">
                  Hashtags in your caption will be automatically detected (e.g., #nature #photography)
                </p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  <IconLocation size={16} className="inline mr-1" />
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add a location..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
              </div>

              {/* Additional Tags */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  <IconHash size={16} className="inline mr-1" />
                  Additional Tags (Optional)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Add extra tags separated by commas..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white placeholder:text-white/40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
                <p className="text-white/40 text-xs mt-1">
                  Example: nature, photography, sunset (# will be added automatically)
                </p>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end relative z-50"
          >
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              disabled={!selectedFile || createPostLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {createPostLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Post...
                </div>
              ) : (
                selectedFile ? 'Create Post' : 'Select a file first'
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};
