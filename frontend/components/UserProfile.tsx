import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { Button } from './UI';

interface UserProfileProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

const AVATAR_COUNT = 35;

export const UserProfile: React.FC<UserProfileProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    const match = user.avatarUrl.match(/memo_(\d+)\.png/);
    return match ? parseInt(match[1], 10) : 1;
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await api.auth.updateAvatar(selectedAvatar);
      onUpdate(updatedUser);
      onClose();
    } catch (error) {
      console.error('Failed to update avatar:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">
        <div className="border-b-2 border-black p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold font-mono">Profile</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-black">
              <img
                src={`https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_${selectedAvatar}.png`}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-lg">{user.name}</div>
              <div className="text-gray-500 text-sm">{user.email}</div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold uppercase mb-2">
              Choose Avatar ({selectedAvatar}/{AVATAR_COUNT})
            </label>
            <div className="grid grid-cols-7 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200">
              {Array.from({ length: AVATAR_COUNT }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedAvatar(num)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                    selectedAvatar === num
                      ? 'border-black ring-2 ring-black ring-offset-1'
                      : 'border-gray-200'
                  }`}
                >
                  <img
                    src={`https://cdn.jsdelivr.net/gh/alohe/avatars/png/memo_${num}.png`}
                    alt={`Avatar ${num}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              className="flex-1"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
