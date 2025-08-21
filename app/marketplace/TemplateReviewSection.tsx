import { useEffect, useState } from "react";

import { getReviews, submitReview } from "../lib/templates";
import { TemplateReview } from "../types/artifact";

interface TemplateReviewSectionProps {
  templateId: string;
  currentRating: number;
}

export const TemplateReviewSection = ({ templateId, currentRating }: TemplateReviewSectionProps) => {
  const [reviews, setReviews] = useState<TemplateReview[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      const fetchedReviews = await getReviews(templateId);
      setReviews(fetchedReviews);
    };
    fetchReviews();
  }, [templateId]);

  const handleSubmitReview = async () => {
    if (userRating === 0 || !userComment.trim()) {
      alert("Please provide a rating and a comment.");
      return;
    }

    const newReview: TemplateReview = {
      userId: "anonymous", // In a real app, this would be the logged-in user's ID
      rating: userRating,
      comment: userComment,
      timestamp: Date.now(),
    };

    await submitReview(templateId, newReview);
    setReviews(await getReviews(templateId)); // Refresh reviews
    setUserRating(0);
    setUserComment("");
    setShowReviewForm(false);
  };

  return (
    <div className="mt-4">
      {/* Rating summary section */}
      <div className="flex items-center mb-2">
        <span className="text-lg font-bold mr-2">{currentRating.toFixed(1)}</span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-5 h-5 ${star <= currentRating ? "text-yellow-400" : "text-gray-300"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="ml-2 text-sm text-gray-500">({reviews.length} reviews)</span>
      </div>

      <button
        onClick={() => setShowReviewForm(!showReviewForm)}
        className="text-blue-600 hover:underline text-sm mb-4"
      >
        {showReviewForm ? "Cancel Review" : "Write a Review"}
      </button>

      {/* Review form section */}
      {showReviewForm && (
        <div className="border p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-2">Submit Your Review</h4>
          <div className="flex mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-6 h-6 cursor-pointer ${
                  star <= userRating ? "text-yellow-400" : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                onClick={() => setUserRating(star)}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <textarea
            className="w-full p-2 border rounded-md mb-2"
            rows={3}
            placeholder="Write your comment..."
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
          />
          <button
            onClick={handleSubmitReview}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit Review
          </button>
        </div>
      )}

      {/* Reviews list section */}
      {reviews.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">User Reviews</h4>
          <div className="space-y-3">
            {reviews.map((review, index) => (
              <div key={index} className="border p-3 rounded-lg bg-gray-50">
                <div className="flex items-center mb-1">
                  <span className="font-medium mr-2">{review.userId}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700">{review.comment}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(review.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};