import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Link2 } from "lucide-react";

interface Profile {
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  background_video_url: string | null;
  background_audio_url: string | null;
  developer_badge: boolean;
  premium_badge: boolean;
  display_id: number | null;
  user_id: string;
}

interface Link {
  id: string;
  title: string;
  url: string;
  position: number;
}

interface SocialLink {
  id: string;
  platform: string;
  value: string;
  position: number;
}

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [typedBio, setTypedBio] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  useEffect(() => {
    // Custom cursor
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + "px";
        cursorRef.current.style.top = e.clientY + "px";
      }
    };

    const isTouchDevice = 'ontouchstart' in window;
    if (!isTouchDevice) {
      document.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    // Typewriter effect for bio
    if (profile?.bio && !showIntro) {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= profile.bio.length) {
          setTypedBio(profile.bio.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [profile?.bio, showIntro]);

  const loadProfile = async () => {
    if (!username) return;

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (profileError || !profileData) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setProfile(profileData);

    const { data: linksData } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", profileData.user_id)
      .eq("is_active", true)
      .order("position", { ascending: true });

    if (linksData) {
      setLinks(linksData);
    }

    const { data: socialData } = await supabase
      .from("social_links")
      .select("*")
      .eq("user_id", profileData.user_id)
      .eq("is_active", true)
      .order("position", { ascending: true });

    if (socialData) {
      setSocialLinks(socialData);
    }

    setLoading(false);
  };

  const handleIntroClick = () => {
    setShowIntro(false);
    if (audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.play();
    }
    if (videoRef.current) {
      videoRef.current.style.opacity = "0.4";
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // Show notification
    const notification = document.getElementById("notification");
    if (notification) {
      notification.textContent = `${label} copied to clipboard!`;
      notification.style.opacity = "1";
      setTimeout(() => {
        notification.style.opacity = "0";
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-lg text-white">Loading...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="p-8 text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-gray-400">
            The profile you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        * { font-family: 'Inter', sans-serif; }
        
        body { cursor: none; }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .custom-cursor {
          position: fixed;
          width: 2.5rem;
          height: 2.5rem;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 10%, transparent 20%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          transition: transform 0.1s ease;
        }
        
        .profile-block {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 820px;
          max-width: 90%;
          min-height: 332px;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.8));
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 1.25rem;
          backdrop-filter: blur(15px);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.3s ease;
        }
        
        .profile-block:hover {
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
        }
        
        .profile-header {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }
        
        .profile-container {
          position: relative;
          width: 150px;
          height: 150px;
          overflow: hidden;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .profile-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .name-with-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        #profile-name {
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: 0.0625rem;
          color: white;
          filter: drop-shadow(0 0 0.5rem rgba(255, 255, 255, 0.5));
          text-shadow: 0 0 5px rgba(255, 255, 255, 0.4), 0 0 10px rgba(255, 255, 255, 0.2);
          position: relative;
          cursor: pointer;
        }
        
        #profile-name:hover::after {
          content: "ID " attr(data-id);
          position: absolute;
          top: -2rem;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
          z-index: 10;
        }
        
        .profile-picture {
          width: 100%;
          height: 100%;
          object-fit: cover;
          cursor: pointer;
          transition: transform 0.3s ease, filter 0.3s ease;
        }
        
        .profile-picture:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
        }
        
        .developer-badge {
          background: #FF9500;
          color: white;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .developer-badge::before {
          content: "D";
          font-size: 1rem;
          font-weight: 700;
        }
        
        .developer-badge:hover {
          border-radius: 0.5rem;
          width: auto;
          padding: 0.25rem 0.75rem;
        }
        
        .developer-badge:hover::before {
          content: "developer";
          font-size: 0.75rem;
        }
        
        .premium-badge {
          background: #C71585;
          color: white;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .premium-badge::before {
          content: "★";
          font-size: 1rem;
          font-weight: 700;
        }
        
        .premium-badge:hover {
          border-radius: 0.5rem;
          width: auto;
          padding: 0.25rem 0.75rem;
        }
        
        .premium-badge:hover::before {
          content: "premium";
          font-size: 0.75rem;
        }
        
        .social-button {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          filter: drop-shadow(0 0 0.5rem rgba(255, 255, 255, 0.5));
          cursor: pointer;
        }
        
        .social-button:hover {
          transform: scale(1.1);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
          border-color: rgba(255, 255, 255, 0.3);
        }
        
        #notification {
          position: fixed;
          bottom: 1.25rem;
          right: 1.25rem;
          background: rgba(255, 255, 255, 0.9);
          color: black;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1000;
        }
      `}</style>

      {/* Intro Screen */}
      {showIntro && (
        <div
          className="fixed inset-0 bg-black flex items-center justify-center z-50 cursor-pointer"
          onClick={handleIntroClick}
        >
          <div
            className="text-white text-5xl font-bold tracking-wider uppercase text-center"
            style={{
              filter: "drop-shadow(0 0 0.625rem rgba(255, 255, 255, 0.5))",
              animation: "pulse 2s infinite",
            }}
          >
            Click to Enter
          </div>
        </div>
      )}

      {/* Custom Cursor */}
      <div ref={cursorRef} className="custom-cursor"></div>

      {/* Background Video */}
      {profile?.background_video_url && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="fixed top-0 left-0 w-full h-full object-cover z-0 opacity-0 transition-opacity duration-1000"
        >
          <source src={profile.background_video_url} type="video/mp4" />
        </video>
      )}

      {/* Background Audio */}
      {profile?.background_audio_url && (
        <audio ref={audioRef} loop muted preload="auto">
          <source src={profile.background_audio_url} type="audio/mpeg" />
        </audio>
      )}

      {/* Profile Block */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="profile-block">
          <div className="profile-header">
            <div className="profile-container">
              {profile?.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="profile-picture"
                />
              )}
            </div>
            <div className="profile-info">
              <div className="name-with-badge">
                <h1 
                  id="profile-name" 
                  data-id={profile?.display_id || ''}
                >
                  {profile?.display_name || profile?.username}
                </h1>
                {profile?.developer_badge && (
                  <span className="developer-badge"></span>
                )}
                {profile?.premium_badge && (
                  <span className="premium-badge"></span>
                )}
              </div>
              {profile?.bio && (
                <p className="text-gray-300 text-lg mt-2" style={{ minHeight: "1.5rem" }}>
                  {typedBio}
                  {typedBio.length < profile.bio.length && (
                    <span className="border-r-2 border-white ml-1 animate-pulse"></span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Separator */}
          <div className="w-full h-px bg-gray-700 my-6"></div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center gap-4 flex-wrap">
              {socialLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    if (link.value.startsWith('http')) {
                      window.open(link.value, '_blank');
                    } else {
                      copyToClipboard(link.value, link.platform);
                    }
                  }}
                  className="social-button"
                  title={link.platform}
                >
                  <span className="text-lg font-semibold capitalize">
                    {link.platform.charAt(0)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Regular Links */}
          {links.length > 0 && (
            <div className="mt-6 space-y-3">
              {links.map((link) => (
                <a
                  key={link.id}
                  onClick={async (e) => {
                    // Track click
                    try {
                      await supabase.from('link_clicks').insert({
                        link_id: link.id,
                        user_id: profile?.user_id,
                        referrer: document.referrer,
                        user_agent: navigator.userAgent
                      });
                    } catch (error) {
                      console.error('Error tracking click:', error);
                    }
                  }}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 hover:bg-opacity-20 hover:scale-105 transition-all duration-300"
                >
                  <span className="text-white font-medium text-center block">
                    {link.title}
                  </span>
                </a>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Notification */}
      <div id="notification"></div>
    </div>
  );
};

export default Profile;
