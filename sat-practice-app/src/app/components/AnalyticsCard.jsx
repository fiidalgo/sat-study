"use client"

import { useState, useEffect, useRef } from "react"
import { BarChart2, TrendingUp, CheckCircle } from "lucide-react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

// Create a stats cache to reduce repeated API calls
const statsCache = {
  data: null,
  lastFetched: 0
};

// Cache stats for 5 minutes
const STATS_CACHE_DURATION = 300000;

export default function AnalyticsCard() {
  const [stats, setStats] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    accuracyPercentage: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const fetchInProgress = useRef(false);

  useEffect(() => {
    // Skip if a fetch is already in progress
    if (fetchInProgress.current) return;
    
    const fetchStats = async () => {
      // Return cached stats if recent
      const now = Date.now();
      if (statsCache.data && now - statsCache.lastFetched < STATS_CACHE_DURATION) {
        console.log('Using cached stats data');
        setStats(statsCache.data);
        setLoading(false);
        return;
      }
      
      fetchInProgress.current = true;
      
      try {
        setLoading(true);
        
        // Check if we have a session already cached in localStorage
        const localSession = localStorage.getItem('supabase.auth.token');
        if (!localSession) {
          console.log('No session found in local storage');
          // No session cached, check with the server
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session) {
            console.log('No valid session found');
            return;
          }
          
          console.log('Fetching stats for user:', session.user.id);
          
          const response = await fetch(`/api/user-stats?userId=${session.user.id}`);
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data && data.stats) {
            // Cache the stats data
            statsCache.data = data.stats;
            statsCache.lastFetched = Date.now();
            
            setStats(data.stats);
          }
        } else {
          // We already have a session in localStorage, parse it
          const session = JSON.parse(localSession);
          if (session?.user) {
            console.log('Using cached session for user:', session.user.id);
            
            const response = await fetch(`/api/user-stats?userId=${session.user.id}`);
            
            if (!response.ok) {
              throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data && data.stats) {
              // Cache the stats data
              statsCache.data = data.stats;
              statsCache.lastFetched = Date.now();
              
              setStats(data.stats);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
        // Set default values on error
        setStats({
          questionsAnswered: 0,
          correctAnswers: 0,
          accuracyPercentage: 0
        });
      } finally {
        setLoading(false);
        fetchInProgress.current = false;
      }
    };

    fetchStats();
  }, [router, supabase]);

  const handleViewAnalytics = () => {
    router.push('/progress');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Your Progress</h2>
      </div>

      <div style={styles.stats}>
        <div style={styles.stat}>
          <div style={styles.statIcon}>
            <CheckCircle style={{ color: "#65a30d", width: 20, height: 20 }} />
          </div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>
              {loading ? "..." : stats.questionsAnswered}
            </div>
            <div style={styles.statLabel}>Questions Completed</div>
          </div>
        </div>

        <div style={styles.stat}>
          <div style={styles.statIcon}>
            <TrendingUp style={{ color: "#65a30d", width: 20, height: 20 }} />
          </div>
          <div style={styles.statInfo}>
            <div style={styles.statValue}>
              {loading ? "..." : `${stats.accuracyPercentage.toFixed(1)}%`}
            </div>
            <div style={styles.statLabel}>Accuracy Rate</div>
          </div>
        </div>
      </div>

      <button style={styles.viewButton} onClick={handleViewAnalytics}>
        <BarChart2 style={styles.buttonIcon} />
        <span>View Detailed Analytics</span>
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    fontSize: "16px",
    fontWeight: 500,
    color: "#4b5563",
  },
  stats: {
    display: "flex",
    gap: "24px",
    marginBottom: "24px",
  },
  stat: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  statIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    backgroundColor: "#f3f9f3",
    borderRadius: "8px",
  },
  statInfo: {
    display: "flex",
    flexDirection: "column",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: 600,
    color: "#111827",
  },
  statLabel: {
    fontSize: "14px",
    color: "#6b7280",
  },
  viewButton: {
    backgroundColor: "#10b981",
    color: "white", 
    padding: "0.5rem 1.25rem",
    borderRadius: "0.375rem",
    fontWeight: 500,
    width: "100%",
    border: "none", 
    cursor: "pointer",
    textAlign: "center",
    textDecoration: "none",
    display: "inline-block",
  },
  buttonIcon: {
    width: "16px",
    height: "16px",
  },
}

