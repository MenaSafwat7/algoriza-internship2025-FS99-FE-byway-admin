import React, { useState, useEffect } from 'react';
import { X, Upload, Star, Plus, Trash2, ChevronLeft, ChevronDown } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const CourseModal = ({ course, categories, onClose, mode = 'add' }) => {
  const [loading, setLoading] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      instructorId: '',
      level: '',
      totalHours: '',
      rate: 1,
      price: '',
      hasCertification: false,
      certification: '',
      topics: [{ topicName: '', lectureCount: 1, durationMinutes: 60, order: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'topics'
  });

  const selectedRate = watch('rate', 1);

  useEffect(() => {
    fetchInstructors();
    if (course) {
      if (mode === 'view') {
        setIsViewMode(true);
        setIsEditMode(false);
      } else if (mode === 'edit') {
        setIsEditMode(true);
        setIsViewMode(false);
      } else {
        setIsEditMode(false);
        setIsViewMode(false);
      }
      populateForm();
    } else {
      setIsEditMode(false);
      setIsViewMode(false);
    }
  }, [course, mode]);

  const fetchInstructors = async () => {
    try {
      const response = await apiService.getInstructors({ pageSize: 100 });
      setInstructors(response.data.items);
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
    }
  };

  const populateForm = async () => {
    setValue('name', course.name);
    setValue('description', course.description || '');
    setValue('categoryId', course.categoryId);
    setValue('instructorId', course.instructorId);
    setValue('level', course.level);
    setValue('totalHours', course.totalHours);
    setValue('rate', course.rate);
    setValue('price', course.price);
    setValue('hasCertification', course.hasCertification);
    setValue('certification', course.certification || '');

    try {
      const response = await apiService.getCourse(course.courseId);
      const fullCourse = response.data;

      if (fullCourse.topics && fullCourse.topics.length > 0) {
        setValue('topics', fullCourse.topics.map(topic => ({
          topicName: topic.topicName,
          lectureCount: topic.lectureCount,
          durationMinutes: topic.durationMinutes,
          order: topic.order
        })));
      }
    } catch (error) {
      console.error('Failed to fetch course details:', error);
    }

    if (course.imageUrl) {
      setImagePreview(`http://localhost:5045${course.imageUrl}`);
    }
  };

  const levelOptions = [
    { value: 1, label: 'Beginner' },
    { value: 2, label: 'Intermediate' },
    { value: 3, label: 'Advanced' }
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

  const addTopic = () => {
    const nextOrder = fields.length + 1;
    append({ topicName: '', lectureCount: 1, durationMinutes: 60, order: nextOrder });
  };

  const removeTopic = (index) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error('At least one topic is required');
    }
  };

  const handleNext = () => {

    const step1Data = watch(['name', 'categoryId', 'instructorId', 'level', 'totalHours', 'price', 'rate']);
    const [name, categoryId, instructorId, level, totalHours, price, rate] = step1Data;

    if (!name || !categoryId || !instructorId || !level || !totalHours || !price || !rate) {
      toast.error('Please fill in all required fields before proceeding');
      return;
    }

    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      console.log('Form data received:', data);
      console.log('Certification value:', data.certification);
      console.log('Topics data:', data.topics);

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('categoryId', parseInt(data.categoryId));
      formData.append('instructorId', parseInt(data.instructorId));
      formData.append('level', parseInt(data.level));
      formData.append('totalHours', parseInt(data.totalHours));
      formData.append('rate', parseInt(data.rate));
      formData.append('price', parseFloat(data.price));
      formData.append('hasCertification', data.hasCertification === true || data.hasCertification === 'true');
      formData.append('certification', data.certification || '');

      console.log('Raw topics data:', data.topics);
      const topicsJson = JSON.stringify(data.topics.map((topic, index) => ({
        topicName: topic.topicName,
        lectureCount: parseInt(topic.lectureCount),
        durationMinutes: parseInt(topic.durationMinutes),
        order: index + 1
      })));
      console.log('Topics JSON:', topicsJson);
      console.log('Topics JSON length:', topicsJson.length);
      formData.append('topicsJson', topicsJson);

      const imageFile = data.image?.[0];
      if (imageFile) {
        formData.append('image', imageFile);
      }

      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      if (course) {
        await apiService.updateCourse(course.courseId, formData);
        toast.success('Course updated successfully');
      } else {
        await apiService.createCourse(formData);
        toast.success('Course created successfully');
      }

      onClose(true);
    } catch (error) {
      console.error('Course creation error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      toast.error(error.response?.data?.message || `Operation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    return [...Array(5)].map((_, index) => (
      <button
        key={index}
        type={interactive ? "button" : undefined}
        className={`h-6 w-6 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        } ${interactive ? 'hover:text-yellow-400 transition-colors' : ''}`}
        onClick={interactive ? () => setValue('rate', index + 1) : undefined}
        disabled={!interactive}
      >
        <Star className="h-full w-full" />
      </button>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50" aria-hidden="true"></div>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-6 pt-6 pb-6 max-h-[90vh] overflow-y-auto">
            {}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {isViewMode
                  ? (currentStep === 1 ? 'View Course Step 1 of 2' : '← View Course Step 2 of 2')
                  : isEditMode
                    ? (currentStep === 1 ? 'Update Course Step 1 of 2' : '← Update Course Step 2 of 2')
                    : (currentStep === 1 ? 'Add Course Step 1 of 2' : '← Add Course Step 2 of 2')
                }
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
              {currentStep === 1 ? (

                <>
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Course details</h4>
                  </div>

                  {}
                  <div className="mb-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <div className="space-y-4">
                        {isViewMode ? (

                          imagePreview ? (
                            <div className="mt-4">
                              <img
                                src={imagePreview}
                                alt="Course"
                                className="mx-auto h-48 w-auto rounded-lg object-cover"
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              <p>No image available</p>
                            </div>
                          )
                        ) : (

                          <>
                            <div className="text-sm text-gray-500">
                              <p>Size: 700x430 pixels</p>
                              <p>File Support: .jpg, .jpeg, png, or .gif</p>
                            </div>
                            <div>
                              <input
                                {...register('image')}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="image-upload"
                              />
                              <label
                                htmlFor="image-upload"
                                className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                              >
                                <Upload className="h-4 w-4" />
                                <span>Upload Image</span>
                              </label>
                            </div>
                            {imagePreview && (
                              <div className="mt-4">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="mx-auto h-32 w-auto rounded-lg"
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Course Name
                      </label>
                      <input
                        {...register('name', { required: 'Course name is required' })}
                        type="text"
                        disabled={isViewMode}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="Write here"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    {}
                    <div>
                      <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <div className="relative">
                        <select
                          {...register('categoryId', { required: 'Category is required' })}
                          disabled={isViewMode}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                            isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="">Choose</option>
                          {categories.map((category) => (
                            <option key={category.categoryId} value={category.categoryId}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.categoryId && (
                        <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                      )}
                    </div>

                    {}
                    <div>
                      <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                        Level
                      </label>
                      <div className="relative">
                        <select
                          {...register('level', { required: 'Level is required' })}
                          disabled={isViewMode}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                            isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="">Choose</option>
                          {levelOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.level && (
                        <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
                      )}
                    </div>

                    {}
                    <div>
                      <label htmlFor="instructorId" className="block text-sm font-medium text-gray-700 mb-2">
                        Instructor
                      </label>
                      <div className="relative">
                        <select
                          {...register('instructorId', { required: 'Instructor is required' })}
                          disabled={isViewMode}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                            isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="">Choose</option>
                          {instructors.map((instructor) => (
                            <option key={instructor.instructorId} value={instructor.instructorId}>
                              {instructor.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.instructorId && (
                        <p className="mt-1 text-sm text-red-600">{errors.instructorId.message}</p>
                      )}
                    </div>

                    {}
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        Cost
                      </label>
                      <input
                        {...register('price', {
                          required: 'Price is required',
                          min: { value: 0, message: 'Price cannot be negative' }
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        disabled={isViewMode}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="Write here"
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                      )}
                    </div>

                    {}
                    <div>
                      <label htmlFor="totalHours" className="block text-sm font-medium text-gray-700 mb-2">
                        Total hours
                      </label>
                      <input
                        {...register('totalHours', {
                          required: 'Total hours is required',
                          min: { value: 1, message: 'Must be at least 1 hour' }
                        })}
                        type="number"
                        min="1"
                        disabled={isViewMode}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="Write here"
                      />
                      {errors.totalHours && (
                        <p className="mt-1 text-sm text-red-600">{errors.totalHours.message}</p>
                      )}
                    </div>

                    {}
                    <div className="md:col-span-2">
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
                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        {...register('description')}
                        rows={6}
                        disabled={isViewMode}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                          isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="Write here"
                      />
                    </div>

                    {}
                    <div className="md:col-span-2">
                      <label htmlFor="certification" className="block text-sm font-medium text-gray-700 mb-2">
                        Certification
                      </label>
                      <textarea
                        {...register('certification')}
                        rows={6}
                        disabled={isViewMode}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                          isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="Write here"
                      />
                    </div>
                  </div>

                  {}
                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => onClose()}
                      className="px-4 py-2 text-red-600 bg-white border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (

                <>
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      {isViewMode ? 'View Contents' : isEditMode ? 'Update Contents' : 'Add Content'}
                    </h4>
                  </div>

                  {}
                  <div className="space-y-6">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-6 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-sm font-medium text-gray-700">Content {index + 1}</h5>
                          {!isViewMode && fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTopic(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Name
                            </label>
                            <input
                              {...register(`topics.${index}.topicName`, {
                                required: 'Topic name is required'
                              })}
                              type="text"
                              disabled={isViewMode}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''
                              }`}
                              placeholder="Write here"
                            />
                            {errors.topics?.[index]?.topicName && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.topics[index].topicName.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Lectures Number
                            </label>
                            <input
                              {...register(`topics.${index}.lectureCount`, {
                                required: 'Lecture count is required',
                                min: { value: 1, message: 'Must be at least 1' }
                              })}
                              type="number"
                              min="1"
                              disabled={isViewMode}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''
                              }`}
                              placeholder="Write here"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Time
                            </label>
                            <input
                              {...register(`topics.${index}.durationMinutes`, {
                                required: 'Duration is required',
                                min: { value: 1, message: 'Must be at least 1 minute' }
                              })}
                              type="number"
                              min="1"
                              disabled={isViewMode}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''
                              }`}
                              placeholder="Write here"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {}
                  {!isViewMode && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={addTopic}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Another Content</span>
                      </button>
                    </div>
                  )}

                  {}
                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => onClose()}
                      className="px-4 py-2 text-red-600 bg-white border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>
                    {isViewMode ? (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Back
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          isEditMode ? 'Update' : 'Add'
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModal;
