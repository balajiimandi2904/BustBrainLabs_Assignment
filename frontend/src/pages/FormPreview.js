import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function FormPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});

  useEffect(() => {
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
  }, [id]);

  const handleResponseChange = (questionIndex, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const answers = form.questions.map((_, index) => ({
        questionId: form.questions[index]._id,
        answer: responses[index] || null,
      }));

      await axios.post("https://form-builder-vfye.onrender.com/api/responses", {
        formId: id,
        answers,
      });

      alert("Response submitted successfully!");
      navigate(`/response/${id}`);
    } catch (err) {
      console.error("Error submitting response:", err);
      alert("Failed to submit response");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!form) return <div className="p-8">Form not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {form.headerImage && (
            <img
              src={`https://form-builder-vfye.onrender.com/${form.headerImage}`}
              alt="Header"
              className="w-full h-48 object-cover"
            />
          )}

          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-gray-600 mb-8">{form.description}</p>
            )}

            <div className="space-y-8">
              {form.questions.map((question, index) => (
                <div key={index} className="border-b pb-6 last:border-b-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {question.questionText}
                  </h3>

                  {question.image && (
                    <img
                      src={`https://form-builder-vfye.onrender.com/${question.image}`}
                      alt="Question"
                      className="mb-4 max-h-48"
                    />
                  )}

                  {renderQuestionInput(
                    question,
                    index,
                    handleResponseChange,
                    responses[index]
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderQuestionInput(question, index, onChange, value) {
  switch (question.type) {
    case "categorize":
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Categories</h4>
              <div className="space-y-2">
                {question.categories.map((category, i) => (
                  <div key={i} className="p-2 bg-gray-100 rounded">
                    {category}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Items</h4>
              <div className="space-y-2">
                {question.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center p-2 bg-gray-100 rounded"
                  >
                    <span className="flex-1">{item.text}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      → {item.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case "cloze":
      return (
        <div>
          <p className="whitespace-pre-line mb-4">
            {insertBlanks(question.clozeText, question.blanks)}
          </p>

          <div className="space-y-2">
            {question.blanks.map((blank, i) => (
              <div key={i} className="flex items-center">
                <span className="mr-2">{i + 1}.</span>
                <input
                  type="text"
                  value={value?.[i] || ""}
                  onChange={(e) => {
                    const newValue = value ? [...value] : [];
                    newValue[i] = e.target.value;
                    onChange(index, newValue);
                  }}
                  className="flex-1 border border-gray-300 rounded p-2"
                  placeholder="Your answer"
                />
              </div>
            ))}
          </div>
        </div>
      );

    case "comprehension":
      return (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded">
            <p className="whitespace-pre-line">{question.comprehensionText}</p>
          </div>

          <div className="space-y-4">
            {question.mcqs.map((mcq, mcqIndex) => (
              <div key={mcqIndex} className="border-l-4 border-blue-200 pl-4">
                <h4 className="font-medium mb-2">{mcq.question}</h4>

                <div className="space-y-2">
                  {mcq.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={`mcq-${index}-${mcqIndex}`}
                        checked={value?.[mcqIndex] === optionIndex}
                        onChange={() => {
                          const newValue = value ? [...value] : [];
                          newValue[mcqIndex] = optionIndex;
                          onChange(index, newValue);
                        }}
                        className="mr-2"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return <div>Unknown question type</div>;
  }
}

function insertBlanks(text, blanks) {
  const blankPositions = blanks.map((blank) => blank.position);
  return text
    .split("")
    .map((char, index) =>
      blankPositions.includes(index) ? (
        <span
          key={index}
          className="inline-block w-16 border-b-2 border-black mx-1"
        ></span>
      ) : (
        char
      )
    );
}
