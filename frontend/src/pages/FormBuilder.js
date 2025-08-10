import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import QuestionEditor from "../components/QuestionEditor";
import FormSettings from "../components/FormSettings";

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "Untitled Form",
    description: "",
    headerImage: "",
    questions: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchForm = async () => {
        try {
          const response = await axios.get(
            `https://form-builder-vfye.onrender.com/api/forms/${id}`
          );
          setForm(response.data);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching form:", err);
          setLoading(false);
        }
      };
      fetchForm();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleSaveForm = async () => {
    try {
      let savedForm;
      if (id) {
        const response = await axios.put(
          `https://form-builder-vfye.onrender.com/api/forms/${id}`,
          form
        );
        savedForm = response.data;
      } else {
        const response = await axios.post(
          "https://form-builder-vfye.onrender.com/api/forms",
          form
        );
        savedForm = response.data;
        navigate(`/builder/${response.data._id}`);
      }
      setForm(savedForm);
      alert("Form saved successfully!");
    } catch (err) {
      console.error("Error saving form:", err);
      alert(
        "Failed to save form: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const addQuestion = (type) => {
    const newQuestion = {
      type,
      questionText: "",
      image: "",
      ...(type === "categorize" && {
        categories: ["Category 1", "Category 2"],
        items: [
          { text: "Item 1", category: "Category 1" },
          { text: "Item 2", category: "Category 2" },
        ],
      }),
      ...(type === "cloze" && {
        clozeText: "Fill in the blanks",
        blanks: [{ answer: "", position: 0 }],
      }),
      ...(type === "comprehension" && {
        comprehensionText: "Read the passage and answer",
        mcqs: [
          {
            question: "Sample question",
            options: ["Option 1", "Option 2"],
            correctOption: 0,
          },
        ],
      }),
    };
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setActiveQuestionIndex(form.questions.length);
  };

  const updateQuestion = (index, updatedQuestion) => {
    setForm((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = updatedQuestion;
      return { ...prev, questions: newQuestions };
    });
  };

  const moveQuestion = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= form.questions.length) return;

    setForm((prev) => {
      const newQuestions = [...prev.questions];
      const [movedQuestion] = newQuestions.splice(fromIndex, 1);
      newQuestions.splice(toIndex, 0, movedQuestion);
      return { ...prev, questions: newQuestions };
    });

    if (activeQuestionIndex === fromIndex) {
      setActiveQuestionIndex(toIndex);
    }
  };

  const deleteQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
    if (activeQuestionIndex === index) {
      setActiveQuestionIndex(null);
    } else if (activeQuestionIndex > index) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    }
  };

  const updateFormSettings = (settings) => {
    setForm((prev) => ({ ...prev, ...settings }));
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-screen bg-gray-100">
        <div className="w-64 bg-white shadow-md p-4">
          <h2 className="text-xl font-bold mb-4">Question Types</h2>
          <div className="space-y-2">
            <button
              onClick={() => addQuestion("categorize")}
              className="w-full p-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              Categorize
            </button>
            <button
              onClick={() => addQuestion("cloze")}
              className="w-full p-2 bg-green-100 text-green-800 rounded hover:bg-green-200"
            >
              Cloze
            </button>
            <button
              onClick={() => addQuestion("comprehension")}
              className="w-full p-2 bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
            >
              Comprehension
            </button>
          </div>

          <div className="mt-8">
            <FormSettings
              formId={id}
              title={form.title}
              description={form.description}
              headerImage={form.headerImage}
              onUpdate={updateFormSettings}
            />
          </div>

          <button
            onClick={handleSaveForm}
            className="mt-4 w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Form
          </button>

          {id && (
            <button
              onClick={() => navigate(`/preview/${id}`)}
              className="mt-2 w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Preview Form
            </button>
          )}
        </div>

        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">
            {form.title || "Untitled Form"}
          </h1>

          {form.questions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">
                Click on a question type to add your first question
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {form.questions.map((question, index) => (
                <QuestionEditor
                  key={index}
                  question={question}
                  formId={id}
                  questionId={question._id}
                  isActive={activeQuestionIndex === index}
                  onClick={() => setActiveQuestionIndex(index)}
                  onUpdate={(updated) => updateQuestion(index, updated)}
                  onDelete={() => deleteQuestion(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}

const QuestionContainer = ({
  index,
  question,
  isActive,
  onClick,
  onUpdate,
  onDelete,
  moveQuestion,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "QUESTION",
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "QUESTION",
    drop: (item) => moveQuestion(item.index, index),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div ref={drop} className={`relative ${isOver ? "bg-gray-100" : ""}`}>
      <div
        ref={drag}
        className={`cursor-move p-1 absolute -left-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <div
        className={`bg-white rounded-lg shadow p-6 ${
          isActive ? "ring-2 ring-blue-500" : ""
        } ${isDragging ? "opacity-50" : ""}`}
        onClick={onClick}
      >
        <QuestionEditor
          question={question}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};
