import React, { useState, useEffect } from 'react';
import { X, Upload, Star, ChevronDown, Image } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const InstructorModal = ({ instructor, onClose, mode = 'add' }) => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  const selectedRate = watch('rate', 1);
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (instructor) {
      setValue('name', instructor.name);
      setValue('jobTitle', instructor.jobTitle);
      setValue('rate', instructor.rate);
      setValue('description', instructor.description || '');

      if (instructor.imageUrl) {
        setImagePreview(`http://localhost:5000${instructor.imageUrl}`);
      }
    }
  }, [instructor, setValue]);

  const jobTitleOptions = [
    { value: 1, label: 'Frontend' },
    { value: 2, label: 'Backend' },
    { value: 3, label: 'Full Stack' },
    { value: 4, label: 'UI/UX Design' }
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('jobTitle', data.jobTitle);
      formData.append('rate', data.rate);
      formData.append('description', data.description || '');

      const imageFile = data.image?.[0];
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (isEditMode) {
        await apiService.updateInstructor(instructor.instructorId, formData);
        toast.success('Instructor updated successfully');
      } else {
        await apiService.createInstructor(formData);
        toast.success('Instructor created successfully');
      }

      onClose(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    return [...Array(5)].map((_, index) => (
      <button
        key={index}
        type={interactive ? "button" : undefined}
        className={`h-5 w-5 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        } ${interactive ? 'hover:text-yellow-400 transition-colors' : ''}`}
        onClick={interactive ? () => setValue('rate', index + 1) : undefined}
        disabled={!interactive}
      >
        <Star className="h-full w-full" />
      </button>
    ));
  };

  const getModalTitle = () => {
    if (isViewMode) return 'View Instructor';
    if (isEditMode) return 'Update Instructor';
    return 'Add Instructor';
  };

  const getButtonText = () => {
    if (isEditMode) return 'Update';
    return 'Add';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50" aria-hidden="true"></div>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="bg-white px-6 pt-6 pb-6">
            {}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {getModalTitle()}
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                onClick={() => onClose()}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  {!isViewMode && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer">
                      <input
                        {...register('image')}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 text-white" />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write here"
                  disabled={isViewMode}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {}
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <div className="relative">
                  <select
                    {...register('jobTitle', { required: 'Job title is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    disabled={isViewMode}
                  >
                    <option value="">Choose</option>
                    {jobTitleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.jobTitle && (
                  <p className="mt-1 text-sm text-red-600">{errors.jobTitle.message}</p>
                )}
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate
                </label>
                <div className="flex items-center space-x-1">
                  {renderStars(selectedRate, !isViewMode)}
                </div>
                <input
                  {...register('rate', { required: 'Rating is required' })}
                  type="hidden"
                />
              </div>

              {}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write here"
                  disabled={isViewMode}
                />
              </div>

              {}
              {!isViewMode && (
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => onClose()}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      getButtonText()
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorModal;
