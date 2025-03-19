"use client"
import Header from "../components/Header"
import SubjectSection from "../components/SubjectSection"
import WeeklyTrack from "../components/WeeklyTrack"
import TestCategories from "../components/topics"
import useAuth from '../../../lib/useAuth'; // Adjust the path as necessary
import AIChat from "../components/AIChatGeneral"
import AnalyticsCard from "../components/AnalyticsCard"
import Footer from "../components/Footer"
import TimedTestButton from "../components/TimedPractice"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '../components/TopBar';
import DifficultyModal from '../components/DifficultyModal';
import { supabase } from '../../../lib/supabase';

export default function Dashboard() {
  const { user, subscription, loading, enforceSubscription } = useAuth();
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const router = useRouter();

  // Check auth and subscription status on mount
  useEffect(() => {
    // Only check after initial loading is complete
    if (!loading) {
      console.log('Dashboard: checking subscription status');
      enforceSubscription();
    }
  }, [loading, enforceSubscription]);

  const handleStartPractice = (subject) => {
    setSelectedSubject(subject);
    setShowDifficultyModal(true);
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Don't render content until we've confirmed subscription
  if (!subscription || !subscription.active) {
    return (
      <div style={{ ...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={styles.redirectingMessage}>
          <h2>Subscription Required</h2>
          <p>You need an active subscription to access this content.</p>
          <button 
            onClick={() => router.push('/pricing')}
            style={styles.redirectButton}
          >
            View Pricing Options
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header />
      
      {subscription && (
        <div style={styles.subscriptionBanner}>
          <div style={styles.subscriptionInfo}>
            <span>
              <strong>{subscription.plan === 'monthly' ? 'Monthly' : '6-Month'} Plan</strong>
              {subscription.expires && ` · Expires: ${new Date(subscription.expires).toLocaleDateString()}`}
            </span>
          </div>
        </div>
      )}
      
      <div style={styles.content}>
        <div style={styles.grid}>
          <div style={styles.leftColumn}>
            <div style={styles.subjects}>
              <SubjectSection 
                title="Quick Practice" 
                value="Math Section" 
                buttonText="Start Practice" 
                subject_id="1" 
                onStartPractice={handleStartPractice}
              />
              <SubjectSection 
                title="Quick Practice" 
                value="Reading & Writing Section" 
                buttonText="Start Practice" 
                subject_id="2" 
                onStartPractice={handleStartPractice}
              />
            </div>
            <TimedTestButton/>

            <div style={styles.analytics}>
              <TestCategories />
            </div>
          </div>
          <div style={styles.rightColumn}>
          <AnalyticsCard />
          <AIChat/>
          </div>
        </div>
      </div>
      <Footer />

      {/* Difficulty selection modal */}
      <DifficultyModal 
        isOpen={showDifficultyModal} 
        onClose={() => setShowDifficultyModal(false)}
        subject={selectedSubject}
      />
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
  },
  content: {
    padding: "24px",
    margin:"0 1vh  0 1vh",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  subjects: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  analytics: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  subscriptionBanner: {
    backgroundColor: "#10b981",
    color: "white",
    padding: "8px 24px",
    textAlign: "center",
    fontSize: "14px",
  },
  subscriptionInfo: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  redirectingMessage: {
    textAlign: "center",
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "8px",
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: "400px",
  },
  redirectButton: {
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    marginTop: "16px",
  }
}

