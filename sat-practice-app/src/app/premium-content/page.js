'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PremiumContentPage() {
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch('/api/subscription');
        const data = await response.json();
        
        if (response.ok) {
          setSubscription(data);
          
          // If not a premium subscriber, redirect to pricing
          if (!data.isSubscriptionActive || data.planType !== 'premium') {
            router.push('/pricing');
          }
        } else {
          console.error('Error fetching subscription:', data.error);
          router.push('/pricing');
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        router.push('/pricing');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscription();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  // This content will only be shown to premium subscribers
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Premium Content
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Welcome to the exclusive premium content area!
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Advanced Practice Tests</h3>
              <p className="mt-2 text-sm text-gray-500">
                Access our collection of advanced practice tests designed to challenge even the most prepared students.
              </p>
              <div className="mt-4">
                <Link
                  href="/practice/advanced"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Start Practice
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">AI-Generated Questions</h3>
              <p className="mt-2 text-sm text-gray-500">
                Get personalized questions generated by our AI system based on your performance and areas for improvement.
              </p>
              <div className="mt-4">
                <Link
                  href="/practice/ai-questions"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Generate Questions
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Detailed Analytics</h3>
              <p className="mt-2 text-sm text-gray-500">
                Access in-depth analytics and insights about your performance, with detailed breakdowns by topic and question type.
              </p>
              <div className="mt-4">
                <Link
                  href="/analytics/advanced"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  View Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 