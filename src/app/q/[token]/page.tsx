import { db } from "@/lib/mockdb";
import { isExpired } from "@/lib/date";
import PublicQuizForm from "@/components/public/PublicQuizForm";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicQuizPage({ params }: PageProps) {
  const { token } = await params;
  const quiz = db.getQuizByToken(token);
  
  if (!quiz || !quiz.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Quiz Not Found</h1>
            <p className="text-gray-600">This quiz is not available or has not been published yet.</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (isExpired(quiz.expiresAt)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-yellow-500 text-4xl mb-4">⏰</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Quiz Expired</h1>
            <p className="text-gray-600">This quiz has expired and is no longer available.</p>
            <p className="text-sm text-gray-500 mt-2">
              Quiz: <span className="font-medium">{quiz.title}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>📝 {quiz.questions.length} questions</span>
              {quiz.expiresAt && (
                <span>⏰ Expires: {new Date(quiz.expiresAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          <PublicQuizForm quiz={quiz} />
        </div>
      </div>
    </div>
  );
}
