import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function FormResponse() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [formRes, responsesRes] = await Promise.all([
          axios.get(`https://form-builder-vfye.onrender.com/api/forms/${id}`),
          axios.get(
            `https://form-builder-vfye.onrender.com/api/responses/form/${id}`
          ),
        ]);

        setForm(formRes.data);
        setResponses(responsesRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!form) return <div className="p-8">Form not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Responses for: {form.title}
        </h1>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <p className="text-gray-600">
              {responses.length} responses received
            </p>
          </div>

          <div className="border-t border-gray-200">
            {form.questions.map((question, qIndex) => (
              <div
                key={qIndex}
                className="p-6 border-b border-gray-200 last:border-b-0"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {question.questionText}
                </h3>

                <div className="space-y-4">
                  {responses.map((response, rIndex) => {
                    const answer = response.answers.find(
                      (a) => a.questionId.toString() === question._id.toString()
                    );

                    return (
                      <div
                        key={rIndex}
                        className="border-l-2 border-gray-200 pl-4"
                      >
                        <p className="text-sm text-gray-500 mb-1">
                          Response {rIndex + 1}
                        </p>
                        {renderAnswer(question, answer?.answer)}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderAnswer(question, answer) {
  if (!answer) return <p className="text-gray-400">No answer provided</p>;

  switch (question.type) {
    case "categorize":
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm mb-1">Categories</h4>
            <div className="space-y-1">
              {question.categories.map((category, i) => (
                <div key={i} className="p-1 bg-gray-100 rounded text-sm">
                  {category}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-1">Items</h4>
            <div className="space-y-1">
              {question.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center p-1 bg-gray-100 rounded text-sm"
                >
                  <span className="flex-1">{item.text}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    → {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "cloze":
      return (
        <div>
          <p className="whitespace-pre-line mb-2">
            {insertBlanks(question.clozeText, question.blanks)}
          </p>

          <div className="space-y-1">
            {question.blanks.map((blank, i) => (
              <div key={i} className="flex items-center text-sm">
                <span className="mr-1">{i + 1}.</span>
                <span className="font-medium">{answer[i] || "No answer"}</span>
                {answer[i] === blank.answer ? (
                  <span className="ml-2 text-green-600">✓ Correct</span>
                ) : (
                  <span className="ml-2 text-gray-500">
                    Correct: {blank.answer}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case "comprehension":
      return (
        <div className="space-y-3">
          <div className="bg-gray-50 p-2 rounded text-sm">
            <p className="whitespace-pre-line">{question.comprehensionText}</p>
          </div>

          <div className="space-y-2">
            {question.mcqs.map((mcq, mcqIndex) => (
              <div key={mcqIndex} className="border-l-2 border-blue-100 pl-2">
                <h4 className="font-medium text-sm mb-1">{mcq.question}</h4>

                <div className="space-y-1">
                  {mcq.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`text-sm p-1 rounded ${
                        optionIndex === answer[mcqIndex]
                          ? optionIndex === mcq.correctOption
                            ? "bg-green-100"
                            : "bg-red-100"
                          : optionIndex === mcq.correctOption
                          ? "bg-green-50"
                          : ""
                      }`}
                    >
                      {option}
                      {optionIndex === mcq.correctOption && " ✓"}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return <p>{JSON.stringify(answer)}</p>;
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
          className="inline-block w-12 border-b-2 border-black mx-1"
        ></span>
      ) : (
        char
      )
    );
}
