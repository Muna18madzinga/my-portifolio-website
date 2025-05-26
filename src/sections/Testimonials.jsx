import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import TitleHeader from "../components/TitleHeader";
import GlowCard from "../components/GlowCard";
import StarRating from "../components/StarRating";
import LoginButton from "../components/LoginButton";

const Testimonials = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    review: '',
    rating: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(db, 'reviews');
      const reviewsQuery = query(reviewsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(reviewsQuery);
      
      if (querySnapshot.empty) {
        console.log('No reviews found');
        setReviews([]);
        return;
      }

      const reviewsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      }));
      
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again later.');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newReview.review.trim()) {
      errors.review = 'Review is required';
    }
    if (newReview.rating === 0) {
      errors.rating = 'Please select a rating';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    if (!validateForm()) return;

    setLoading(true);
    if (!user) {
      setError('Please sign in to submit a review');
      return;
    }

    try {
      // Add to Firebase
      await addDoc(collection(db, 'reviews'), {
        ...newReview,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        userPhoto: user.photoURL,
        timestamp: new Date().getTime()
      });

      // Send email notification
      const emailResponse = await fetch('/api/send-review-email.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newReview,
          name: user.displayName,
          email: user.email
        })
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.warn('Email notification failed:', errorData.error);
      }

      setSuccess(true);
      setNewReview({ review: '', rating: 0 });
      setFormErrors({});
      fetchReviews(); // Refresh the reviews list
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRatingChange = (rating) => {
    setNewReview(prev => ({ ...prev, rating }));
    if (formErrors.rating) {
      setFormErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  return (
    <section id="testimonials" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader 
          title="Reviews" 
          subtitle="What others say about my work" 
          className="text-center"
        />

        <div className="lg:columns-3 md:columns-2 columns-1 mt-16">
          {reviews.map((review, index) => (
            <GlowCard card={review} key={review.id || index} index={index}>
              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: 5 }, (_, i) => (
                  <span 
                    key={i} 
                    className={`text-2xl ${i < review.rating ? 'text-yellow-400' : 'text-gray-400'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img 
                    src={review.userPhoto} 
                    alt={review.userName} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold">{review.userName}</p>
                  <p className="text-white-50">{review.userEmail}</p>
                </div>
              </div>
              <p className="text-white-75">{review.review}</p>
            </GlowCard>
          ))}
        </div>

        <div className="mt-16">
          <div className="bg-[#1c1c24] rounded-xl p-8 border border-[#2c2c35]">
            <div className="mb-6 flex justify-end">
              <LoginButton />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-500">
                Review submitted successfully!
              </div>
            )}

            {user ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{user.displayName}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <StarRating 
                    rating={newReview.rating} 
                    onRatingChange={handleRatingChange}
                  />
                  {formErrors.rating && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.rating}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Your Review</label>
                  <textarea
                    name="review"
                    value={newReview.review}
                    onChange={handleChange}
                    placeholder="Write your review here..."
                    rows="4"
                    className="w-full px-4 py-2 rounded-lg bg-[#2c2c35] text-white border border-[#3c3c45] focus:outline-none focus:border-purple-500 placeholder-gray-500 resize-none"
                  />
                  {formErrors.review && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.review}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg font-medium transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Sign in to share your review</p>
                <div className="flex justify-center">
                  <LoginButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
