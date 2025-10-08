import React from 'react';
import { X, Trash2 } from 'lucide-react';

const ConfirmDialog = ({ title, message, onConfirm, onCancel, confirmText = 'Delete', cancelText = 'Cancel' }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50" aria-hidden="true"></div>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="bg-white px-6 pt-6 pb-6">
            {}
            <div className="flex justify-end mb-4">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
                onClick={onCancel}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
            </div>

            {}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                {message}
              </p>
            </div>

            {}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={onCancel}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
