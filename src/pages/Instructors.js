import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Star, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import InstructorModal from '../components/InstructorModal';
import ConfirmDialog from '../components/ConfirmDialog';

const Instructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, instructor: null });
  const pageSize = 10;

  useEffect(() => {
    fetchInstructors();
  }, [currentPage, searchTerm]);

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const response = await apiService.getInstructors({
        page: currentPage,
        pageSize,
        search: searchTerm
      });
      setInstructors(response.data.items);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      toast.error('Failed to fetch instructors');
      console.error('Fetch instructors error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleAddInstructor = () => {
    setSelectedInstructor(null);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleEditInstructor = (instructor) => {
    setSelectedInstructor(instructor);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleViewInstructor = (instructor) => {
    setSelectedInstructor(instructor);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleDeleteInstructor = (instructor) => {
    setDeleteDialog({ open: true, instructor });
  };

  const confirmDelete = async () => {
    try {
      await apiService.deleteInstructor(deleteDialog.instructor.instructorId);
      toast.success('Instructor deleted successfully');
      fetchInstructors();
      setDeleteDialog({ open: false, instructor: null });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete instructor');
    }
  };

  const handleModalClose = (shouldRefresh = false) => {
    setModalOpen(false);
    setSelectedInstructor(null);
    if (shouldRefresh) {
      fetchInstructors();
    }
  };

  const getJobTitleDisplay = (jobTitle) => {
    const titles = {
      1: 'Frontend',
      2: 'Backend',
      3: 'Full Stack',
      4: 'UI/UX Design'
    };
    return titles[jobTitle] || 'Unknown';
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
          <h1 className="text-3xl font-bold text-gray-900">Instructors</h1>
          <div className="relative">
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          </div>
        </div>
        <p className="text-sm text-gray-500">Dashboard / Instructors</p>
      </div>

      {}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">Instructors</h2>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {totalCount}
            </span>
          </div>
        </div>

        {}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleAddInstructor}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Instructor</span>
          </button>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for Instructors"
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
        ) : instructors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No instructors found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Job Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {instructors.map((instructor) => (
                    <tr key={instructor.instructorId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          {instructor.name}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">
                          {getJobTitleDisplay(instructor.jobTitle)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          {renderStars(instructor.rate)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleViewInstructor(instructor)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditInstructor(instructor)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInstructor(instructor)}
                            className="text-red-600 hover:text-red-800 p-1 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {}
            <div className="flex items-center justify-center mt-6 space-x-2">
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
        <InstructorModal
          instructor={selectedInstructor}
          mode={modalMode}
          onClose={handleModalClose}
        />
      )}

      {}
      {deleteDialog.open && (
        <ConfirmDialog
          title="Delete Instructor"
          message={`Are you sure you want to delete ${deleteDialog.instructor?.name}? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteDialog({ open: false, instructor: null })}
        />
      )}
    </div>
  );
};

export default Instructors;
