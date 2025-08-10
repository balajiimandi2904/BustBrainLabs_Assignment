import { useState } from "react";
import axios from "axios";

export default function QuestionEditor({
  question,
  formId,
  questionId,
  onUpdate,
  onDelete,
}) {
  const [editing, setEditing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(question);

  const handleUpdate = () => {
    onUpdate(currentQuestion);
    setEditing(false);
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      if (!formId || !questionId) {
        throw new Error("Form ID or Question ID is missing");
      }

      const response = await axios.post(
        `https://form-builder-vfye.onrender.com/api/forms/${formId}/questions/${questionId}/image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setCurrentQuestion((prev) => ({
        ...prev,
        [field]: response.data.imageUrl,
      }));
    } catch (err) {
      console.error("Error uploading image:", err);
      alert(
        "Failed to upload image: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const renderEditor = () => {
    switch (currentQuestion.type) {
      case "categorize":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Question Text
              </label>
              <input
                type="text"
                value={currentQuestion.questionText}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    questionText: e.target.value,
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Image
              </label>
              <input
                type="file"
                onChange={(e) => handleImageUpload(e, "image")}
                className="mt-1 block w-full"
              />
              {currentQuestion.image && (
                <img
                  src={`https://form-builder-vfye.onrender.com/${currentQuestion.image}`}
                  alt="Question"
                  className="mt-2 max-h-40"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Categories
              </label>
              {currentQuestion.categories.map((category, index) => (
                <div key={index} className="flex mt-2">
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => {
                      const newCategories = [...currentQuestion.categories];
                      newCategories[index] = e.target.value;
                      setCurrentQuestion({
                        ...currentQuestion,
                        categories: newCategories,
                      });
                    }}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                  />
                  <button
                    onClick={() => {
                      const newCategories = currentQuestion.categories.filter(
                        (_, i) => i !== index
                      );
                      setCurrentQuestion({
                        ...currentQuestion,
                        categories: newCategories,
                      });
                    }}
                    className="ml-2 p-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    categories: [
                      ...currentQuestion.categories,
                      `Category ${currentQuestion.categories.length + 1}`,
                    ],
                  })
                }
                className="mt-2 p-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Add Category
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Items
              </label>
              {currentQuestion.items.map((item, index) => (
                <div key={index} className="flex mt-2">
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const newItems = [...currentQuestion.items];
                      newItems[index].text = e.target.value;
                      setCurrentQuestion({
                        ...currentQuestion,
                        items: newItems,
                      });
                    }}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    placeholder="Item text"
                  />
                  <select
                    value={item.category}
                    onChange={(e) => {
                      const newItems = [...currentQuestion.items];
                      newItems[index].category = e.target.value;
                      setCurrentQuestion({
                        ...currentQuestion,
                        items: newItems,
                      });
                    }}
                    className="ml-2 border border-gray-300 rounded-md p-2"
                  >
                    {currentQuestion.categories.map((category, i) => (
                      <option key={i} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const newItems = currentQuestion.items.filter(
                        (_, i) => i !== index
                      );
                      setCurrentQuestion({
                        ...currentQuestion,
                        items: newItems,
                      });
                    }}
                    className="ml-2 p-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    items: [
                      ...currentQuestion.items,
                      {
                        text: "",
                        category: currentQuestion.categories[0] || "",
                      },
                    ],
                  })
                }
                className="mt-2 p-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Add Item
              </button>
            </div>
          </div>
        );

      case "cloze":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Question Text
              </label>
              <input
                type="text"
                value={currentQuestion.questionText}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    questionText: e.target.value,
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Image
              </label>
              <input
                type="file"
                onChange={(e) => handleImageUpload(e, "image")}
                className="mt-1 block w-full"
              />
              {currentQuestion.image && (
                <img
                  src={`https://form-builder-vfye.onrender.com/${currentQuestion.image}`}
                  alt="Question"
                  className="mt-2 max-h-40"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cloze Text
              </label>
              <textarea
                value={currentQuestion.clozeText}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    clozeText: e.target.value,
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Blanks
              </label>
              {currentQuestion.blanks.map((blank, index) => (
                <div key={index} className="flex mt-2">
                  <input
                    type="text"
                    value={blank.answer}
                    onChange={(e) => {
                      const newBlanks = [...currentQuestion.blanks];
                      newBlanks[index].answer = e.target.value;
                      setCurrentQuestion({
                        ...currentQuestion,
                        blanks: newBlanks,
                      });
                    }}
                    className="flex-1 border border-gray-300 rounded-md p-2"
                    placeholder="Correct answer"
                  />
                  <input
                    type="number"
                    value={blank.position}
                    onChange={(e) => {
                      const newBlanks = [...currentQuestion.blanks];
                      newBlanks[index].position = parseInt(e.target.value) || 0;
                      setCurrentQuestion({
                        ...currentQuestion,
                        blanks: newBlanks,
                      });
                    }}
                    className="ml-2 w-20 border border-gray-300 rounded-md p-2"
                    placeholder="Position"
                  />
                  <button
                    onClick={() => {
                      const newBlanks = currentQuestion.blanks.filter(
                        (_, i) => i !== index
                      );
                      setCurrentQuestion({
                        ...currentQuestion,
                        blanks: newBlanks,
                      });
                    }}
                    className="ml-2 p-2 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    blanks: [
                      ...currentQuestion.blanks,
                      { answer: "", position: 0 },
                    ],
                  })
                }
                className="mt-2 p-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Add Blank
              </button>
            </div>
          </div>
        );

      case "comprehension":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Question Text
              </label>
              <input
                type="text"
                value={currentQuestion.questionText}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    questionText: e.target.value,
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Image
              </label>
              <input
                type="file"
                onChange={(e) => handleImageUpload(e, "image")}
                className="mt-1 block w-full"
              />
              {currentQuestion.image && (
                <img
                  src={`https://form-builder-vfye.onrender.com/${currentQuestion.image}`}
                  alt="Question"
                  className="mt-2 max-h-40"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Comprehension Text
              </label>
              <textarea
                value={currentQuestion.comprehensionText}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    comprehensionText: e.target.value,
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                rows={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                MCQs
              </label>
              {currentQuestion.mcqs.map((mcq, mcqIndex) => (
                <div
                  key={mcqIndex}
                  className="mt-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Question {mcqIndex + 1}</h3>
                    <button
                      onClick={() => {
                        const newMcqs = currentQuestion.mcqs.filter(
                          (_, i) => i !== mcqIndex
                        );
                        setCurrentQuestion({
                          ...currentQuestion,
                          mcqs: newMcqs,
                        });
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    type="text"
                    value={mcq.question}
                    onChange={(e) => {
                      const newMcqs = [...currentQuestion.mcqs];
                      newMcqs[mcqIndex].question = e.target.value;
                      setCurrentQuestion({ ...currentQuestion, mcqs: newMcqs });
                    }}
                    className="w-full border border-gray-300 rounded-md p-2 mb-2"
                    placeholder="Question"
                  />

                  <div className="space-y-2">
                    {mcq.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center">
                        <input
                          type="radio"
                          name={`mcq-${mcqIndex}`}
                          checked={mcq.correctOption === optionIndex}
                          onChange={() => {
                            const newMcqs = [...currentQuestion.mcqs];
                            newMcqs[mcqIndex].correctOption = optionIndex;
                            setCurrentQuestion({
                              ...currentQuestion,
                              mcqs: newMcqs,
                            });
                          }}
                          className="mr-2"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newMcqs = [...currentQuestion.mcqs];
                            newMcqs[mcqIndex].options[optionIndex] =
                              e.target.value;
                            setCurrentQuestion({
                              ...currentQuestion,
                              mcqs: newMcqs,
                            });
                          }}
                          className="flex-1 border border-gray-300 rounded-md p-2"
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        <button
                          onClick={() => {
                            const newMcqs = [...currentQuestion.mcqs];
                            newMcqs[mcqIndex].options = newMcqs[
                              mcqIndex
                            ].options.filter((_, i) => i !== optionIndex);
                            if (
                              newMcqs[mcqIndex].correctOption >= optionIndex
                            ) {
                              newMcqs[mcqIndex].correctOption = Math.max(
                                0,
                                newMcqs[mcqIndex].correctOption - 1
                              );
                            }
                            setCurrentQuestion({
                              ...currentQuestion,
                              mcqs: newMcqs,
                            });
                          }}
                          className="ml-2 p-2 text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newMcqs = [...currentQuestion.mcqs];
                        newMcqs[mcqIndex].options = [
                          ...newMcqs[mcqIndex].options,
                          `Option ${newMcqs[mcqIndex].options.length + 1}`,
                        ];
                        setCurrentQuestion({
                          ...currentQuestion,
                          mcqs: newMcqs,
                        });
                      }}
                      className="mt-2 p-2 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      Add Option
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    mcqs: [
                      ...currentQuestion.mcqs,
                      {
                        question: "",
                        options: ["Option 1", "Option 2"],
                        correctOption: 0,
                      },
                    ],
                  })
                }
                className="mt-2 p-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Add MCQ
              </button>
            </div>
          </div>
        );

      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <div>
      {editing ? (
        <div className="space-y-4">
          {renderEditor()}
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setCurrentQuestion(question);
                setEditing(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">
                {question.questionText || "Untitled Question"}
              </h3>
              <p className="text-sm text-gray-500">{question.type}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setEditing(true)}
                className="p-2 text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
          {question.image && (
            <img
              src={`https://form-builder-vfye.onrender.com/${question.image}`}
              alt="Question"
              className="mt-2 max-h-40"
            />
          )}
        </div>
      )}
    </div>
  );
}
