'use client'
import React, { useState } from 'react';
import { FaPaperPlane, FaUserCircle, FaTrashAlt } from 'react-icons/fa';

interface Comment {
  _id: string;
  user: {
    username: string;
    profilePicture: string;
  };
  text: string;
  createdAt: string;
}

interface CommentSectionProps {
  mangaTitle: string;
  comments: Comment[];
  isSignedIn: boolean;
  onCommentAdded: (comment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ mangaTitle, comments, isSignedIn, onCommentAdded, onCommentDeleted }) => {
  const [commentText, setCommentText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState('');

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = `http://localhost:5000/api/mangas/${mangaTitle}/comments`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token ?? '',
        },
        body: JSON.stringify({ text: commentText }),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        console.error('Failed to submit comment:', responseBody);
        throw new Error('Failed to submit comment');
      }

      onCommentAdded(responseBody); // Update local state with the new comment
      setCommentText(''); // Clear the comment input field
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleCommentDelete = (commentId: string) => {
    setShowModal(true);
    setCommentIdToDelete(commentId);
  };

  const handleConfirmDelete = async () => {
    try {
      setShowModal(false);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/mangas/${mangaTitle}/comments/${commentIdToDelete}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token ?? '',
        },
      });

      if (!response.ok) {
        const errorResponse = await response.text(); // Get the raw response text
        console.error('Failed to delete comment:', errorResponse);
        throw new Error('Failed to delete comment');
      }

      onCommentDeleted(commentIdToDelete);
      setCommentIdToDelete('');
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setCommentIdToDelete('');
  };

  const username = localStorage.getItem('username'); // Get username from localStorage

  return (
    <div className="mt-8 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-70">
      <h2 className="text-xl font-semibold text-black dark:text-gray-200 my-8">Comments</h2>
      {isSignedIn && (
        <div className="mt-4 flex items-center space-x-4 rounded-lg border-b border-gray-600">
          <textarea
            className="w-full relative p-2 rounded-t-lg bg-white dark:bg-gray-950 dark:text-white text-black placeholder-gray-400"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <FaPaperPlane
            className="dark:text-white text-blue-600 absolute right-12 cursor-pointer hover:text-blue-700 transition duration-200"
            size={24}
            onClick={handleCommentSubmit}
          />
        </div>
      )}
      <ul className="space-y-4 bg-white dark:bg-gray-950 p-2 rounded-b-lg">
        {comments.length === 0 ? (
          <li className="text-center text-gray-600 dark:text-gray-300 py-16">No comments yet</li>
        ) : (
          comments.slice().reverse().map((comment) => (
            <li key={comment._id} className="relative flex items-start space-x-4 p-4 bg-white dark:bg-gray-950 rounded-2xl">
              {comment.user.profilePicture ? (
                <img
                  src={`http://localhost:5000/${comment.user.profilePicture}`}
                  alt={comment.user.username}
                  className="w-10 h-10 rounded-full border border-black"
                />
              ) : (
                <FaUserCircle className="text-gray-500 w-10 h-10" />
              )}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <div className="dark:text-gray-300 text-gray-700">
                    <h2 className="dark:text-white text-black font-bold">{comment.user.username}</h2> {comment.text}
                  </div>
                  <div className='md:flex flex-col justify-center items-center gap-2'>
                    <p className="dark:text-gray-500 text-gray-800 text-xs md:text-sm py-1">{new Date(comment.createdAt).toLocaleString()}</p>
                    {isSignedIn && username === comment.user.username && (
                      <FaTrashAlt
                        className="text-red-500 cursor-pointer hover:text-red-700 transition duration-200"
                        size={16}
                        onClick={() => handleCommentDelete(comment._id)}
                      />
                    )}
                  </div>
                </div>
              </div>
              {showModal && commentIdToDelete === comment._id && (
                <div className="absolute inset-0 flex items-center justify-center md:bg-black md:bg-opacity-30 rounded-md z-50">
                  <div className="bg-white dark:bg-gray-800 border border-black p-6 rounded-lg shadow-lg max-w-md mx-auto mr-4 md:mr-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Confirm Deletion</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this comment?</p>
                    <div className="flex justify-end space-x-4">
                      <button
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                        onClick={handleCancelDelete}
                      >
                        Cancel
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                        onClick={handleConfirmDelete}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default CommentSection;
