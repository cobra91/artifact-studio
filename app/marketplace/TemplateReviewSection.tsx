import { useEffect, useState } from "react";

import { getReviews, submitReview } from "../lib/templates";
import { TemplateReview } from "../types/artifact";

interface TemplateReviewSectionProps {
  templateId: string;
  currentRating: number;
}

export const TemplateReviewSection = ({
  templateId,
  currentRating,
}: TemplateReviewSectionProps) => {
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
      <div className="mb-2 flex items-center">
        <span className="mr-2 text-lg font-bold">
          {currentRating.toFixed(1)}
        </span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map(star => (
            <svg
              key={star}
              className={`h-5 w-5 ${star <= currentRating ? "text-yellow-400" : "text-gray-300"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="ml-2 text-sm text-gray-500">
          ({reviews.length} reviews)
        </span>
      </div>

      <button
        onClick={() => setShowReviewForm(!showReviewForm)}
        className="mb-4 text-sm text-blue-600 hover:underline"
      >
        {showReviewForm ? "Cancel Review" : "Write a Review"}
      </button>

      {/* Review form section */}
      {showReviewForm && (
        <div className="mb-4 rounded-lg border p-4">
          <h4 className="mb-2 font-semibold">Submit Your Review</h4>
          <div className="mb-2 flex">
            {[1, 2, 3, 4, 5].map(star => (
              <svg
                key={star}
                className={`h-6 w-6 cursor-pointer ${
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
            className="mb-2 w-full rounded-md border p-2"
            rows={3}
            placeholder="Write your comment..."
            value={userComment}
            onChange={e => setUserComment(e.target.value)}
          />
          <button
            onClick={handleSubmitReview}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Submit Review
          </button>
        </div>
      )}

      {/* Reviews list section */}
      {reviews.length > 0 && (
        <div>
          <h4 className="mb-2 font-semibold">User Reviews</h4>
          <div className="space-y-3">
            {reviews.map((review, index) => (
              <div key={index} className="rounded-lg border bg-gray-50 p-3">
                <div className="mb-1 flex items-center">
                  <span className="mr-2 font-medium">{review.userId}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm">{review.comment}</p>
                <p className="mt-1 text-xs text-gray-500">
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
