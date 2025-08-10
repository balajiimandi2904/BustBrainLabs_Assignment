import { useState } from "react";
import axios from "axios";

export default function FormSettings({
  formId,
  title,
  description,
  headerImage,
  onUpdate,
}) {
  const [settings, setSettings] = useState({ title, description, headerImage });
  const [editing, setEditing] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      if (!formId) {
        throw new Error("Form ID is missing");
      }

      const response = await axios.post(
        `https://form-builder-vfye.onrender.com/api/forms/${formId}/header-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setSettings((prev) => ({
        ...prev,
        headerImage: response.data.headerImage,
      }));
      onUpdate({ headerImage: response.data.headerImage });
    } catch (err) {
      console.error("Error uploading image:", err);
      alert(
        "Failed to upload header image: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleUpdate = () => {
    onUpdate(settings);
    setEditing(false);
  };

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="font-medium mb-2">Form Settings</h3>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700">Title</label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) =>
                setSettings({ ...settings, title: e.target.value })
              }
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Description</label>
            <textarea
              value={settings.description}
              onChange={(e) =>
                setSettings({ ...settings, description: e.target.value })
              }
              className="w-full p-2 border rounded"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700">Header Image</label>
            <input
              type="file"
              onChange={handleImageUpload}
              className="w-full"
            />
            {settings.headerImage && (
              <img
                src={`https://form-builder-vfye.onrender.com/${settings.headerImage}`}
                alt="Header"
                className="mt-2 max-h-40"
              />
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setSettings({ title, description, headerImage });
                setEditing(false);
              }}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm">
            <span className="font-medium">Title:</span> {title}
          </p>
          {description && (
            <p className="text-sm">
              <span className="font-medium">Description:</span> {description}
            </p>
          )}
          {headerImage && (
            <div className="mt-2">
              <p className="text-sm font-medium">Header Image:</p>
              <img
                src={`https://form-builder-vfye.onrender.com/${headerImage}`}
                alt="Header"
                className="max-h-32"
              />
            </div>
          )}
          <button
            onClick={() => setEditing(true)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Edit Settings
          </button>
        </div>
      )}
    </div>
  );
}
