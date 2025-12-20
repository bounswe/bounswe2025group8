/**
 * Unit Tests for Review and Rating Utilities
 * Tests review calculations, formatting, and validation
 */

describe('Review Rating Utilities', () => {
    describe('calculateAverageRating', () => {
        const calculateAverageRating = (reviews: Array<{ score: number }>): number => {
            if (!reviews || reviews.length === 0) return 0;
            const total = reviews.reduce((sum, r) => sum + (r.score || 0), 0);
            return Math.round((total / reviews.length) * 10) / 10;
        };

        test('calculates average correctly', () => {
            const reviews = [{ score: 4 }, { score: 5 }, { score: 3 }];
            expect(calculateAverageRating(reviews)).toBe(4);
        });

        test('handles decimal averages', () => {
            const reviews = [{ score: 4 }, { score: 5 }];
            expect(calculateAverageRating(reviews)).toBe(4.5);
        });

        test('returns 0 for empty reviews', () => {
            expect(calculateAverageRating([])).toBe(0);
        });

        test('handles single review', () => {
            expect(calculateAverageRating([{ score: 5 }])).toBe(5);
        });
    });

    describe('calculateWeightedRating', () => {
        interface ReviewWithWeights {
            score: number;
            weight?: number;
        }

        const calculateWeightedRating = (reviews: ReviewWithWeights[]): number => {
            if (!reviews || reviews.length === 0) return 0;

            let totalWeight = 0;
            let weightedSum = 0;

            for (const review of reviews) {
                const weight = review.weight || 1;
                totalWeight += weight;
                weightedSum += review.score * weight;
            }

            return Math.round((weightedSum / totalWeight) * 10) / 10;
        };

        test('calculates weighted average', () => {
            const reviews = [
                { score: 5, weight: 2 },
                { score: 3, weight: 1 },
            ];
            // (5*2 + 3*1) / (2+1) = 13/3 = 4.33 -> 4.3
            expect(calculateWeightedRating(reviews)).toBe(4.3);
        });

        test('defaults weight to 1', () => {
            const reviews = [
                { score: 4 },
                { score: 5 },
            ];
            expect(calculateWeightedRating(reviews)).toBe(4.5);
        });
    });

    describe('getRatingDistribution', () => {
        const getRatingDistribution = (reviews: Array<{ score: number }>): Record<number, number> => {
            const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

            for (const review of reviews) {
                const score = Math.round(review.score);
                if (score >= 1 && score <= 5) {
                    distribution[score]++;
                }
            }

            return distribution;
        };

        test('counts ratings correctly', () => {
            const reviews = [
                { score: 5 },
                { score: 5 },
                { score: 4 },
                { score: 3 },
            ];
            const dist = getRatingDistribution(reviews);

            expect(dist[5]).toBe(2);
            expect(dist[4]).toBe(1);
            expect(dist[3]).toBe(1);
            expect(dist[2]).toBe(0);
            expect(dist[1]).toBe(0);
        });

        test('handles empty reviews', () => {
            const dist = getRatingDistribution([]);
            expect(Object.values(dist).every(v => v === 0)).toBe(true);
        });
    });

    describe('formatRatingStars', () => {
        const formatRatingStars = (rating: number): string => {
            const fullStars = Math.floor(rating);
            const hasHalf = rating - fullStars >= 0.5;
            const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

            return '★'.repeat(fullStars) +
                (hasHalf ? '½' : '') +
                '☆'.repeat(emptyStars);
        };

        test('formats full stars', () => {
            expect(formatRatingStars(5)).toBe('★★★★★');
        });

        test('formats with half star', () => {
            expect(formatRatingStars(3.5)).toBe('★★★½☆');
        });

        test('formats empty stars', () => {
            expect(formatRatingStars(0)).toBe('☆☆☆☆☆');
        });

        test('rounds down partial', () => {
            expect(formatRatingStars(4.3)).toBe('★★★★☆');
        });

        test('rounds up to half for .5+', () => {
            expect(formatRatingStars(4.7)).toBe('★★★★½');
        });
    });
});

describe('Review Validation', () => {
    describe('isValidReviewScore', () => {
        const isValidReviewScore = (score: number): boolean => {
            return Number.isFinite(score) && score >= 1 && score <= 5;
        };

        test('accepts valid scores', () => {
            expect(isValidReviewScore(1)).toBe(true);
            expect(isValidReviewScore(3)).toBe(true);
            expect(isValidReviewScore(5)).toBe(true);
        });

        test('accepts decimal scores', () => {
            expect(isValidReviewScore(4.5)).toBe(true);
        });

        test('rejects scores below 1', () => {
            expect(isValidReviewScore(0)).toBe(false);
            expect(isValidReviewScore(-1)).toBe(false);
        });

        test('rejects scores above 5', () => {
            expect(isValidReviewScore(6)).toBe(false);
        });

        test('rejects non-finite values', () => {
            expect(isValidReviewScore(NaN)).toBe(false);
            expect(isValidReviewScore(Infinity)).toBe(false);
        });
    });

    describe('validateReviewComment', () => {
        const validateReviewComment = (comment: string): { valid: boolean; error?: string } => {
            if (!comment || comment.trim().length === 0) {
                return { valid: true }; // Comments are optional
            }

            if (comment.length > 500) {
                return { valid: false, error: 'Comment must be 500 characters or less' };
            }

            if (comment.length < 10) {
                return { valid: false, error: 'Comment must be at least 10 characters' };
            }

            return { valid: true };
        };

        test('accepts empty comment', () => {
            expect(validateReviewComment('').valid).toBe(true);
        });

        test('accepts valid comment', () => {
            expect(validateReviewComment('Great service, would recommend!').valid).toBe(true);
        });

        test('rejects too short comment', () => {
            const result = validateReviewComment('Good');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('at least 10');
        });

        test('rejects too long comment', () => {
            const longComment = 'a'.repeat(501);
            const result = validateReviewComment(longComment);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('500 characters');
        });
    });

    describe('canUserReview', () => {
        interface Task {
            status: string;
            creator_id: number;
            assignee_id: number | null;
        }

        const canUserReview = (
            task: Task,
            userId: number,
            existingReviews: Array<{ reviewer_id: number }>
        ): { canReview: boolean; reason?: string } => {
            // Task must be completed
            if (task.status?.toLowerCase() !== 'completed') {
                return { canReview: false, reason: 'Task must be completed' };
            }

            // User must be participant
            const isCreator = task.creator_id === userId;
            const isAssignee = task.assignee_id === userId;

            if (!isCreator && !isAssignee) {
                return { canReview: false, reason: 'You must be a participant' };
            }

            // Check if already reviewed
            const hasReviewed = existingReviews.some(r => r.reviewer_id === userId);
            if (hasReviewed) {
                return { canReview: false, reason: 'You have already submitted a review' };
            }

            return { canReview: true };
        };

        test('allows creator to review completed task', () => {
            const task = { status: 'completed', creator_id: 1, assignee_id: 2 };
            const result = canUserReview(task, 1, []);
            expect(result.canReview).toBe(true);
        });

        test('allows assignee to review completed task', () => {
            const task = { status: 'completed', creator_id: 1, assignee_id: 2 };
            const result = canUserReview(task, 2, []);
            expect(result.canReview).toBe(true);
        });

        test('prevents review for incomplete task', () => {
            const task = { status: 'open', creator_id: 1, assignee_id: null };
            const result = canUserReview(task, 1, []);
            expect(result.canReview).toBe(false);
        });

        test('prevents non-participant from reviewing', () => {
            const task = { status: 'completed', creator_id: 1, assignee_id: 2 };
            const result = canUserReview(task, 3, []);
            expect(result.canReview).toBe(false);
        });

        test('prevents duplicate review', () => {
            const task = { status: 'completed', creator_id: 1, assignee_id: 2 };
            const reviews = [{ reviewer_id: 1 }];
            const result = canUserReview(task, 1, reviews);
            expect(result.canReview).toBe(false);
        });
    });
});

describe('Review Formatting', () => {
    describe('formatReviewSummary', () => {
        const formatReviewSummary = (rating: number, count: number): string => {
            if (count === 0) return 'No reviews yet';
            const stars = '★'.repeat(Math.round(rating));
            return `${rating.toFixed(1)} ${stars} (${count} review${count !== 1 ? 's' : ''})`;
        };

        test('formats with multiple reviews', () => {
            expect(formatReviewSummary(4.5, 10)).toBe('4.5 ★★★★★ (10 reviews)');
        });

        test('formats with single review', () => {
            expect(formatReviewSummary(5, 1)).toBe('5.0 ★★★★★ (1 review)');
        });

        test('handles no reviews', () => {
            expect(formatReviewSummary(0, 0)).toBe('No reviews yet');
        });
    });

    describe('getReviewAge', () => {
        const getReviewAge = (timestamp: string): string => {
            const now = new Date();
            const reviewDate = new Date(timestamp);
            const days = Math.floor((now.getTime() - reviewDate.getTime()) / 86400000);

            if (days === 0) return 'Today';
            if (days === 1) return 'Yesterday';
            if (days < 7) return `${days} days ago`;
            if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
            if (days < 365) return `${Math.floor(days / 30)} months ago`;
            return `${Math.floor(days / 365)} years ago`;
        };

        test('returns Today for recent reviews', () => {
            const today = new Date().toISOString();
            expect(getReviewAge(today)).toBe('Today');
        });

        test('returns Yesterday', () => {
            const yesterday = new Date(Date.now() - 86400000).toISOString();
            expect(getReviewAge(yesterday)).toBe('Yesterday');
        });

        test('returns days ago', () => {
            const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
            expect(getReviewAge(threeDaysAgo)).toBe('3 days ago');
        });

        test('returns weeks ago', () => {
            const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
            expect(getReviewAge(twoWeeksAgo)).toBe('2 weeks ago');
        });
    });
});
