import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Star, Filter, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import CourseModal from '../components/CourseModal';
import ConfirmDialog from '../components/ConfirmDialog';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalMode, setModalMode] = useState('add');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, course: null });
  const pageSize = 12;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [currentPage, searchTerm, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await apiService.getCourses({
        page: currentPage,
        pageSize,
        search: searchTerm,
        categoryId: selectedCategory || undefined
      });
      setCourses(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      toast.error('Failed to fetch courses');
      console.error('Fetch courses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleDeleteCourse = (course) => {
    setDeleteDialog({ open: true, course });
  };

  const confirmDelete = async () => {
    try {
      await apiService.deleteCourse(deleteDialog.course.courseId);
      toast.success('Course deleted successfully');
      fetchCourses();
      setDeleteDialog({ open: false, course: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleModalClose = (shouldRefresh = false) => {
    setModalOpen(false);
    setSelectedCourse(null);
    setModalMode('add');
    if (shouldRefresh) {
      fetchCourses();
    }
  };

  const getLevelBadgeColor = (level) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getLevelText = (level) => {
    const levels = {
      1: 'Beginner',
      2: 'Intermediate',
      3: 'Advanced'
    };
    return levels[level] || 'Unknown';
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <div className="relative">
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          </div>
        </div>
        <p className="text-sm text-gray-500">Dashboard / Courses</p>
      </div>

      {}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">Courses</h2>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {totalCount}
            </span>
          </div>
        </div>

        {}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleAddCourse}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Course</span>
          </button>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={handleCategoryFilter}
                className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for Courses"
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No courses found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {courses.map((course) => (
                <div
                  key={course.courseId}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {}
                  <div className="relative">
                    {course.imageUrl ? (
                      <img
                        src={`http://localhost:5045${course.imageUrl}`}
                        alt={course.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    {}
                    <div className="absolute top-3 left-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {course.categoryName}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    {}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.name}
                    </h3>

                    {}
                    <p className="text-sm text-gray-600 mb-2">
                      By {course.instructorName}
                    </p>

                    {}
                    <div className="flex items-center mb-3">
                      {renderStars(course.rate)}
                    </div>

                    {}
                    <p className="text-xs text-gray-500 mb-3">
                      {course.totalHours} Total Hours. {course.totalLectures || 0} Lectures. {getLevelText(course.level)}
                    </p>

                    {}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        ${course.price}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewCourse(course)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {}
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>

              {[...Array(Math.ceil(totalCount / pageSize))].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    currentPage === index + 1
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(Math.min(Math.ceil(totalCount / pageSize), currentPage + 1))}
                disabled={currentPage === Math.ceil(totalCount / pageSize)}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </>
        )}
      </div>

      {}
      {modalOpen && (
        <CourseModal
          course={selectedCourse}
          categories={categories}
          onClose={handleModalClose}
          mode={modalMode}
        />
      )}

      {}
      {deleteDialog.open && (
        <ConfirmDialog
          title="Delete Course"
          message={`Are you sure you want to delete "${deleteDialog.course?.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteDialog({ open: false, course: null })}
        />
      )}
    </div>
  );
};

export default Courses;
