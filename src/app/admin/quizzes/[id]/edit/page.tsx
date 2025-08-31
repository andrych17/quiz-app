"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BaseEditForm } from "@/components/ui/common/BaseEditForm";
import { FormField, TextField, TextArea, Select } from "@/components/ui/common/FormControls";
import { db } from "@/lib/mockdb";
import { Quiz } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

const tabs = [
  { id: 'general', name: 'General', icon: 'quiz' },
  { id: 'questions', name: 'Questions', icon: 'list' },
  { id: 'settings', name: 'Settings', icon: 'cog' }
];

function QuizEditContent({ quizId }: { quizId: string }) {
  const [activeTab, setActiveTab] = useState('general');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublished: false,
    expiresAt: "",
    // Questions will be managed separately
    questions: [] as any[],
    // Settings
    timeLimit: 30,
    allowRetake: false,
    showResults: true,
    randomizeQuestions: false
  });

  // Question modal state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questionFormData, setQuestionFormData] = useState({
    questionText: "",
    questionType: "multiple-choice" as "multiple-choice" | "text",
    correctAnswer: "",
    options: ["", "", "", ""]
  });

  const isCreateMode = quizId === 'create';

  useEffect(() => {
    if (isCreateMode) {
      setLoading(false);
    } else {
      loadQuiz();
    }
  }, [quizId, isCreateMode]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const foundQuiz = db.getQuizById(quizId);
      if (foundQuiz) {
        setQuiz(foundQuiz);
        setFormData(prev => ({
          ...prev,
          title: foundQuiz.title,
          isPublished: foundQuiz.isPublished,
          expiresAt: foundQuiz.expiresAt ? new Date(foundQuiz.expiresAt).toISOString().slice(0, 16) : "",
          questions: foundQuiz.questions || []
        }));
      }
    } catch (error) {
      console.error("Error loading quiz:", error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Please fill in the quiz title');
      setActiveTab('general');
      return;
    }

    setSaving(true);
    try {
      if (isCreateMode) {
        // Create new quiz
        const newQuiz = db.createQuiz({
          title: formData.title.trim(),
          createdBy: 'admin',
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined
        });
        
        if (newQuiz) {
          router.push('/admin/quizzes');
        } else {
          alert('Failed to create quiz');
        }
      } else {
        // Update existing quiz
        const updatedQuiz = db.updateQuiz(quizId, {
          title: formData.title,
          isPublished: formData.isPublished,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
        });
        
        if (updatedQuiz) {
          setQuiz(updatedQuiz);
          router.push('/admin/quizzes');
        } else {
          alert('Failed to update quiz');
        }
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert('Error saving quiz');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!quiz) return;
    
    if (confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
      try {
        const success = db.deleteQuiz(quizId);
        if (success) {
          router.push('/admin/quizzes');
        } else {
          alert('Failed to delete quiz');
        }
      } catch (error) {
        console.error("Error deleting quiz:", error);
        alert('Error deleting quiz');
      }
    }
  };

  // Question management
  const handleAddQuestion = () => {
    if (!questionFormData.questionText.trim() || !questionFormData.correctAnswer.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingQuestion) {
      // Update existing question
      if (quiz) {
        db.removeQuestion(quiz.id, editingQuestion.id);
        db.addQuestion(quiz.id, {
          questionText: questionFormData.questionText.trim(),
          correctAnswer: questionFormData.correctAnswer.trim(),
          questionType: questionFormData.questionType,
          options: questionFormData.questionType === 'multiple-choice' 
            ? questionFormData.options.filter(opt => opt.trim()) 
            : undefined
        });
        loadQuiz();
      }
    } else {
      // Add new question
      if (quiz) {
        db.addQuestion(quiz.id, {
          questionText: questionFormData.questionText.trim(),
          correctAnswer: questionFormData.correctAnswer.trim(),
          questionType: questionFormData.questionType,
          options: questionFormData.questionType === 'multiple-choice' 
            ? questionFormData.options.filter(opt => opt.trim()) 
            : undefined
        });
        loadQuiz();
      }
    }
    
    setShowQuestionModal(false);
    setEditingQuestion(null);
    setQuestionFormData({
      questionText: "",
      questionType: "multiple-choice",
      correctAnswer: "",
      options: ["", "", "", ""]
    });
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setQuestionFormData({
      questionText: question.questionText,
      questionType: question.questionType || 'multiple-choice',
      correctAnswer: question.correctAnswer,
      options: question.options || ["", "", "", ""]
    });
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!quiz) return;
    if (confirm("Are you sure you want to delete this question?")) {
      db.removeQuestion(quiz.id, questionId);
      loadQuiz();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isCreateMode && !quiz) {
    return (
      <BaseEditForm
        title="Quiz Not Found"
        subtitle="The requested quiz does not exist"
        backUrl="/admin/quizzes"
        isCreateMode={false}
      >
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz Not Found</h2>
          <p className="text-gray-600">The quiz you're looking for doesn't exist.</p>
        </div>
      </BaseEditForm>
    );
  }

  const renderTabIcon = (iconType: string) => {
    switch (iconType) {
      case 'quiz':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'list':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'cog':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderGeneralTab = () => (
    <div className="space-y-8">
      {/* Mode Notice */}
      <div className={`${isCreateMode ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
        <div className="flex items-center">
          <svg className={`w-5 h-5 ${isCreateMode ? 'text-green-400' : 'text-blue-400'} mr-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCreateMode ? "M12 6v6m0 0v6m0-6h6m-6 0H6" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"} />
          </svg>
          <div>
            <h3 className={`text-sm font-semibold ${isCreateMode ? 'text-green-800' : 'text-blue-800'}`}>
              {isCreateMode ? 'Create Mode' : 'Edit Mode'}
            </h3>
            <p className={`text-sm ${isCreateMode ? 'text-green-600' : 'text-blue-600'}`}>
              {isCreateMode ? 'Create a new quiz with basic information.' : 'Update the quiz information and settings.'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormField label="Quiz Title" required>
          <TextField
            value={formData.title}
            onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
            placeholder="Enter quiz title"
            disabled={saving}
          />
        </FormField>
        
        <FormField label="Expires At">
          <input
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </FormField>

        <FormField label="Description" className="lg:col-span-2">
          <TextArea
            value={formData.description}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            placeholder="Enter quiz description"
            rows={3}
            disabled={saving}
          />
        </FormField>

        <FormField label={isCreateMode ? "Initial Status" : "Current Status"}>
          <div className="mt-1">
            <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold ${
              isCreateMode ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
              formData.isPublished ? 'bg-green-100 text-green-800 border border-green-200' : 
              'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}>
              <span className={`w-2 h-2 mr-2 rounded-full ${
                isCreateMode ? 'bg-yellow-400' : 
                formData.isPublished ? 'bg-green-400' : 'bg-yellow-400'
              }`}></span>
              {isCreateMode ? 'Draft (Default)' : (formData.isPublished ? 'Published' : 'Draft')}
            </span>
            {isCreateMode && (
              <p className="text-xs text-gray-500 mt-1">New quizzes are created as draft by default</p>
            )}
          </div>
        </FormField>

        {!isCreateMode && (
          <FormField label="Questions Count">
            <div className="mt-1">
              <span className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                {formData.questions.length} questions
              </span>
              <p className="text-xs text-gray-500 mt-1">Use the Questions tab to manage quiz questions</p>
            </div>
          </FormField>
        )}
      </div>
    </div>
  );

  const renderQuestionsTab = () => (
    <div className="space-y-6">
      {isCreateMode ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.635 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-yellow-800">Save Quiz First</h3>
              <p className="text-sm text-yellow-600">Please save the quiz basic information first before adding questions.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Quiz Questions ({formData.questions.length})</h3>
            <button
              onClick={() => setShowQuestionModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Question
            </button>
          </div>

          <div className="space-y-4">
            {formData.questions.map((question, index) => (
              <div key={question.id || index} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                        Q{index + 1}
                      </span>
                      <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                        {question.questionType || 'multiple-choice'}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium mb-2">{question.questionText}</p>
                    {question.options && (
                      <div className="space-y-1">
                        {question.options.map((option: string, optIndex: number) => (
                          <div key={optIndex} className="flex items-center space-x-2 text-sm">
                            <span className={`w-2 h-2 rounded-full ${option === question.correctAnswer ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                            <span className={option === question.correctAnswer ? 'text-green-700 font-medium' : 'text-gray-600'}>
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {question.questionType === 'text' && (
                      <div className="text-sm">
                        <span className="text-gray-500">Correct answer: </span>
                        <span className="text-green-700 font-medium">{question.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {formData.questions.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Questions Yet</h3>
                <p className="text-gray-600">Add your first question to get started with this quiz.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-8">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-purple-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-purple-800">Quiz Settings</h3>
            <p className="text-sm text-purple-600">Configure advanced quiz behavior and participant experience.</p>
          </div>
        </div>
      </div>

      <div className="text-center py-8">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Settings Coming Soon</h3>
        <p className="text-gray-600">
          Time limits, retake policies, and other advanced quiz settings are being developed.
        </p>
      </div>
    </div>
  );

  const title = isCreateMode ? "Create New Quiz" : `Edit Quiz: ${quiz?.title}`;
  const subtitle = isCreateMode 
    ? "Create a new quiz with questions and settings"
    : "Update quiz information, questions and settings";

  const canSave = Boolean(formData.title.trim());

  return (
    <>
      <BaseEditForm
        title={title}
        subtitle={subtitle}
        backUrl="/admin/quizzes"
        isCreateMode={isCreateMode}
        onSave={handleSave}
        onDelete={isCreateMode ? undefined : handleDelete}
        isSaving={saving}
        canSave={canSave}
        createdAt={quiz?.createdAt}
        updatedAt={quiz?.updatedAt}
        createdBy={quiz?.createdBy}
        isActive={quiz?.isPublished}
      >
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
              >
                {renderTabIcon(tab.icon)}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'questions' && renderQuestionsTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </BaseEditForm>

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingQuestion ? "Edit Question" : "Add New Question"}
            </h3>
            <div className="space-y-6">
              <FormField label="Question Type" required>
                <Select
                  value={questionFormData.questionType}
                  onChange={(value) => setQuestionFormData(prev => ({ 
                    ...prev, 
                    questionType: value as "multiple-choice" | "text",
                    correctAnswer: "",
                    options: value === 'multiple-choice' ? ["", "", "", ""] : prev.options
                  }))}
                  options={[
                    { value: "multiple-choice", label: "Multiple Choice" },
                    { value: "text", label: "Text Input" }
                  ]}
                />
              </FormField>

              <FormField label="Question Text" required>
                <TextArea
                  value={questionFormData.questionText}
                  onChange={(value) => setQuestionFormData(prev => ({ ...prev, questionText: value }))}
                  placeholder="Enter the question..."
                  rows={3}
                />
              </FormField>

              {questionFormData.questionType === 'multiple-choice' && (
                <>
                  <FormField label="Answer Options" required>
                    <div className="space-y-2">
                      {questionFormData.options.map((option, index) => (
                        <TextField
                          key={index}
                          value={option}
                          onChange={(value) => {
                            const newOptions = [...questionFormData.options];
                            newOptions[index] = value;
                            setQuestionFormData(prev => ({ ...prev, options: newOptions }));
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                      ))}
                    </div>
                  </FormField>

                  <FormField label="Correct Answer" required>
                    <Select
                      value={questionFormData.correctAnswer}
                      onChange={(value) => setQuestionFormData(prev => ({ ...prev, correctAnswer: value }))}
                      options={questionFormData.options
                        .filter(opt => opt.trim())
                        .map(opt => ({ value: opt, label: opt }))
                      }
                      placeholder="Select the correct answer"
                    />
                  </FormField>
                </>
              )}

              {questionFormData.questionType === 'text' && (
                <FormField label="Correct Answer" required>
                  <TextField
                    value={questionFormData.correctAnswer}
                    onChange={(value) => setQuestionFormData(prev => ({ ...prev, correctAnswer: value }))}
                    placeholder="Enter the correct answer..."
                  />
                </FormField>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuestionModal(false);
                    setEditingQuestion(null);
                    setQuestionFormData({
                      questionText: "",
                      questionType: "multiple-choice",
                      correctAnswer: "",
                      options: ["", "", "", ""]
                    });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingQuestion ? "Update Question" : "Add Question"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default async function QuizEditPage({ params }: PageProps) {
  const { id } = await params;
  return <QuizEditContent quizId={id} />;
}
