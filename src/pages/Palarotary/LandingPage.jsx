import {
  ArrowRightOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  SoundOutlined,
  ShopOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Button, Card, Modal, Typography } from "antd";
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { cloud, shirtTemplate } from "../../assets/images/Other";
import {
  logo2,
  logoBanner,
  playersImg,
  yearImg,
  dgsiLogo,
  eventbookLogo,
} from "../../assets/images/logos";
import { videoTeaser } from "../../assets/video";

gsap.registerPlugin(ScrollTrigger);

const { Title, Paragraph } = Typography;

export default function PalarotaryLandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const floatingElementsRef = useRef([]);
  const cardsRef = useRef(null);
  const featuresRef = useRef(null);
  const videoRef = useRef(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Advanced GSAP animations on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section entrance
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        heroRef.current.querySelector(".hero-title"),
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 1, scale: 1, duration: 1 }
      )
        .fromTo(
          heroRef.current.querySelector(".hero-subtitle"),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 1, duration: 0.8 },
          "-=0.6"
        )
        .fromTo(
          heroRef.current.querySelectorAll(".info-badge"),
          { opacity: 0, scale: 0.8, rotationY: -90 },
          {
            opacity: 1,
            scale: 1,
            rotationY: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "back.out(1.5)",
          },
          "-=0.5"
        );

      // Floating elements animation
      floatingElementsRef.current.forEach((el, i) => {
        if (el) {
          gsap.to(el, {
            y: "random(-30, 30)",
            x: "random(-25, 25)",
            rotation: "random(-25, 25)",
            scale: "random(0.8, 1.2)",
            duration: "random(4, 7)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.2,
          });
        }
      });

      // Cards scroll animation
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.querySelectorAll(".registration-card"),
          {
            opacity: 0,
            y: 60,
            rotationX: -20,
          },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Features animation
      if (featuresRef.current) {
        gsap.fromTo(
          featuresRef.current.querySelectorAll(".feature-item"),
          {
            opacity: 0,
            x: -30,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.1,
            scrollTrigger: {
              trigger: featuresRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Lazy load video when it comes into view
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !videoLoaded) {
            setVideoLoaded(true);
            // Preload video and autoplay when loaded
            videoElement.load();
            videoElement.addEventListener("loadeddata", () => {
              videoElement.play().then(() => {
                setIsPlaying(true);
              }).catch(() => {
                setIsPlaying(false);
              });
            }, { once: true });
          }
        });
      },
      {
        rootMargin: "200px", // Start loading before video is visible
        threshold: 0.1,
      }
    );

    observer.observe(videoElement);

    return () => {
      if (videoElement) {
        observer.unobserve(videoElement);
      }
    };
  }, [videoLoaded]);

  // Video control handlers
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -15 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    hover: {
      y: -10,
      scale: 1.02,
      rotateY: 2,
      boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: { scale: 0.95 },
  };

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3,
      },
    },
  };

  return (
    <div
      ref={containerRef}
      style={{
        background: "linear-gradient(135deg, #f8f9fc 0%, #e8edf5 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated floating background elements */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          ref={(el) => (floatingElementsRef.current[i] = el)}
          style={{
            position: "absolute",
            width: `${Math.random() * 120 + 60}px`,
            height: `${Math.random() * 120 + 60}px`,
            borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "20%" : "30%",
            background:
              i % 3 === 0
                ? `rgba(28, 60, 109, ${Math.random() * 0.08 + 0.02})` // Navy blue
                : i % 3 === 1
                ? `rgba(247, 165, 10, ${Math.random() * 0.08 + 0.02})` // Orange
                : `rgba(213, 72, 57, ${Math.random() * 0.08 + 0.02})`, // Red
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            pointerEvents: "none",
            filter: "blur(2px)",
          }}
          animate={{
            opacity: [0.15, 0.4, 0.15],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: Math.random() * 5 + 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className=" my-0 mx-auto relative px-0 ">
        <img src={cloud} className=" absolute z-0 w-full bottom-0 top-0 l-0 " />
        <img
          src={playersImg}
          className=" absolute z-0 w-full bottom-0 top-0 l-0 opacity-50 "
        />
        {/* Hero Section */}
        <motion.div
          ref={heroRef}
          style={{ y: yHero, opacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-screen flex flex-col justify-center items-center mb-56 px-4"
        >
          <div className="w-full max-w-6xl mx-auto text-center flex flex-col ">
            {/* Main Logo */}
            <motion.div
              className="hero-title"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 1 }}
            >
              <img
                src={logoBanner}
                className="w-full max-w-[400px] mx-auto mb-6"
                alt="Palarotary Banner"
              />
              <img
                src={logo2}
                className="w-full max-w-[800px] mx-auto"
                alt="Palarotary Logo"
              />
            </motion.div>

            {/* Year Image */}
            <motion.div
              className="hero-subtitle"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 1 }}
              transition={{ delay: 0.3 }}
            >
              <img
                src={yearImg}
                className="w-full max-w-[400px] mx-auto "
                alt="2026"
              />
            </motion.div>

            {/* Hosted By */}
            <motion.div
              className="hero-subtitle"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 1 }}
              transition={{ delay: 0.3 }}
              style={{ marginBottom: "16px" }}
            >
              <span className=" text-[#1c3c6d] font-bold text-lg">
                Hosted by: RC Metro East Taytay
              </span>
            </motion.div>

            {/* Date/Time/Venue Badges */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}
            >
              {[
                { icon: CalendarOutlined, text: "January 25, 2026", delay: 0 },
                { icon: ClockCircleOutlined, text: "7am - 4pm", delay: 0.1 },
                {
                  icon: EnvironmentOutlined,
                  text: "Marikina Sports Center",
                  delay: 0.2,
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="info-badge w-full max-w-[300px] flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    boxShadow: "0 12px 35px rgba(28, 60, 109, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    backgroundColor: "#ffffffc0",
                    // background:
                    //   "linear-gradient(135deg, #ffffff 0%, #f8f9fc 100%)",
                    padding: "18px 32px",
                    borderRadius: "16px",
                    backdropFilter: "blur(10px)",
                    border:
                      "2px solid " +
                      (index === 0
                        ? "#1c3c6d"
                        : index === 1
                        ? "#f7a50a"
                        : "#d54839"),
                    boxShadow: "0 8px 32px rgba(28, 60, 109, 0.12)",
                  }}
                >
                  <motion.div
                    variants={iconVariants}
                    initial="initial"
                    animate="animate"
                  >
                    <item.icon
                      style={{
                        fontSize: "24px",
                        marginRight: "12px",
                        color:
                          index === 0
                            ? "#1c3c6d"
                            : index === 1
                            ? "#f7a50a"
                            : "#d54839",
                      }}
                    />
                  </motion.div>
                  <strong style={{ fontSize: "16px", color: "#1a1a2e" }}>
                    {item.text}
                  </strong>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div
        style={{
          maxWidth: "1500px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
          padding: "0 20px",
        }}
        className="bg-transparent"
      >
        {/* Video Teaser Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: "80px" }}
        >
          <Title
            level={2}
            style={{
              textAlign: "center",
              marginBottom: "40px",
              color: "#1c3c6d",
              fontSize: "clamp(28px, 4vw, 36px)",
            }}
          >
            Experience PALAROTARY 2026
          </Title>

          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(28, 60, 109, 0.25)",
              background: "linear-gradient(135deg, #1c3c6d 0%, #2a5085 100%)",
              padding: "8px",
            }}
          >
            <div
              style={{
                position: "relative",
                paddingBottom: "56.25%", // 16:9 aspect ratio
                background: "#000",
                borderRadius: "16px",
                overflow: "hidden",
                cursor: "pointer",
              }}
              onClick={togglePlayPause}
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(isPlaying ? false : true)}
            >
              <video
                ref={videoRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                loop
                muted
                playsInline
                preload="none"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'%3E%3Crect fill='%231c3c6d' width='1200' height='675'/%3E%3Ctext x='50%25' y='50%25' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle'%3EPALAROTARY 2026%3C/text%3E%3C/svg%3E"
              >
                {videoLoaded && <source src={videoTeaser} type="video/mp4" />}
                Your browser does not support the video tag.
              </video>

              {/* YouTube-like Overlay Controls */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showControls || !isPlaying ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: showControls || !isPlaying ? "auto" : "none",
                }}
              >
                {/* Center Play/Pause Button */}
                {!isPlaying && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    whileHover={{ scale: 1.1 }}
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.95)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <PlayCircleOutlined
                      style={{
                        fontSize: "48px",
                        color: "#1c3c6d",
                      }}
                    />
                  </motion.div>
                )}

                {/* Mute/Unmute Button - Bottom Right */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  {isMuted ? (
                    <SoundOutlined
                      style={{
                        fontSize: "24px",
                        color: "#1c3c6d",
                        textDecoration: "line-through",
                      }}
                    />
                  ) : (
                    <SoundOutlined
                      style={{
                        fontSize: "24px",
                        color: "#1c3c6d",
                      }}
                    />
                  )}
                </motion.div>

                {/* Playing Indicator - Top Left */}
                {isPlaying && showControls && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    style={{
                      position: "absolute",
                      top: "20px",
                      left: "20px",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      background: "rgba(255, 255, 255, 0.9)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <PauseCircleOutlined
                      style={{
                        fontSize: "20px",
                        color: "#1c3c6d",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#1c3c6d",
                      }}
                    >
                      Click to pause
                    </span>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>

          <Paragraph
            style={{
              textAlign: "center",
              marginTop: "24px",
              fontSize: "16px",
              color: "#6b7280",
            }}
          >
            Watch the highlights and get ready for the biggest Rotary sports
            event of 2026!
            <br />
            <span style={{ fontSize: "14px", color: "#9ca3af" }}>
              Click to play/pause • Tap speaker icon to unmute
            </span>
          </Paragraph>
        </motion.div>

        {/* Registration Cards */}
        <div ref={cardsRef}>
          <Title
            level={2}
            style={{
              textAlign: "center",
              marginBottom: "40px",
              color: "#1c3c6d",
              fontSize: "clamp(28px, 4vw, 36px)",
            }}
          >
            Register & Customize Shirt
          </Title>
          <div className=" grid grid-cols-12 gap-6 mb-6">
            <motion.div
              className="registration-card h-full col-span-12 lg:col-span-4"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true }}
            >
              <Card
                style={{
                  height: "100%",
                  borderRadius: "24px",
                  boxShadow: "0 10px 40px rgba(213, 72, 57, 0.15)",
                  border: "2px solid #fde5e3",
                  overflow: "hidden",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #fef5f4 100%)",
                }}
                styles={{
                  body: {
                    height: "100%",
                  },
                }}
              >
                <div className="p-0 md:p-4 flex h-full flex-col">
                  <div className=" flex-1">
                    <motion.div
                      style={{ textAlign: "center", marginBottom: "24px" }}
                      whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <div
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #d54839 0%, #a83a2d 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 20px",
                          boxShadow: "0 10px 30px rgba(213, 72, 57, 0.3)",
                        }}
                      >
                        <ShopOutlined
                          style={{ fontSize: "48px", color: "white" }}
                        />
                      </div>
                    </motion.div>

                    <Title
                      level={2}
                      style={{
                        marginBottom: "12px",
                        textAlign: "center",
                        fontSize: "28px",
                      }}
                    >
                      Club Registration
                    </Title>
                    <Paragraph
                      style={{
                        fontSize: "16px",
                        color: "#666",
                        marginBottom: "24px",
                        textAlign: "center",
                      }}
                    >
                      Register your club for PALAROTARY 2026
                    </Paragraph>

                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      animate={{
                        boxShadow: [
                          "0 4px 15px rgba(213, 72, 57, 0.2)",
                          "0 8px 25px rgba(213, 72, 57, 0.3)",
                          "0 4px 15px rgba(213, 72, 57, 0.2)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        background:
                          "linear-gradient(135deg, #fde5e320 0%, #fbcbc720 100%)",
                        padding: "20px",
                        borderRadius: "16px",
                        marginBottom: "24px",
                        border: "2px solid #d5483940",
                      }}
                    >
                      <Title
                        level={3}
                        style={{
                          margin: 0,
                          color: "#d54839",
                          fontSize: "32px",
                        }}
                      >
                        ₱4,000
                      </Title>
                      <Paragraph
                        style={{
                          margin: "8px 0 0 0",
                          fontSize: "14px",
                          color: "#6b7280",
                        }}
                      >
                        Per club registration fee
                      </Paragraph>
                    </motion.div>

                    <div style={{ marginBottom: "28px" }}>
                      <p className="text-red-600 font-semibold italic text-center mb-3">
                        NOTE: Only authorized club representatives are permitted
                        to register their respective clubs
                      </p>
                      {[
                        "Select your zone and club",
                        "Upload proof of payment",
                        "GCash or Bank transfer accepted",
                      ].map((text, i) => (
                        <motion.div
                          key={i}
                          className="feature-item"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          viewport={{ once: true }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <CheckCircleOutlined
                            style={{ fontSize: "18px", color: "#d54839" }}
                          />
                          <span style={{ fontSize: "15px", color: "#1a1a2e" }}>
                            {text}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<ArrowRightOutlined />}
                      onClick={() => navigate("/club-payment-proof")}
                      style={{
                        background:
                          "linear-gradient(135deg, #d54839 0%, #a83a2d 100%)",
                        border: "none",
                        height: "56px",
                        fontSize: "17px",
                        fontWeight: "600",
                        borderRadius: "12px",
                        boxShadow: "0 6px 20px rgba(213, 72, 57, 0.4)",
                      }}
                    >
                      Register Club
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              className="registration-card h-full col-span-12 md:col-span-6 lg:col-span-4"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true }}
            >
              <Card
                style={{
                  height: "100%",
                  borderRadius: "24px",
                  boxShadow: "0 10px 40px rgba(247, 165, 10, 0.15)",
                  border: "2px solid #fff3d6",
                  overflow: "hidden",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #fff9eb 100%)",
                }}
                styles={{
                  body: {
                    height: "100%",
                  },
                }}
              >
                <div className="p-0 md:p-4 flex h-full flex-col">
                  <div className=" flex-1">
                    <motion.div
                      style={{ textAlign: "center", marginBottom: "24px" }}
                      whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <div
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 20px",
                          boxShadow: "0 10px 30px rgba(247, 165, 10, 0.3)",
                        }}
                      >
                        <TeamOutlined
                          style={{ fontSize: "48px", color: "white" }}
                        />
                      </div>
                    </motion.div>

                    <Title
                      level={2}
                      style={{
                        marginBottom: "12px",
                        textAlign: "center",
                        fontSize: "28px",
                      }}
                    >
                      Member Registration
                    </Title>
                    <Paragraph
                      style={{
                        fontSize: "16px",
                        color: "#666",
                        marginBottom: "24px",
                        textAlign: "center",
                      }}
                    >
                      Join as an individual member
                    </Paragraph>

                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      animate={{
                        boxShadow: [
                          "0 4px 15px rgba(247, 165, 10, 0.2)",
                          "0 8px 25px rgba(247, 165, 10, 0.3)",
                          "0 4px 15px rgba(247, 165, 10, 0.2)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        background:
                          "linear-gradient(135deg, #fff3d620 0%, #ffe7ad20 100%)",
                        padding: "20px",
                        borderRadius: "16px",
                        marginBottom: "24px",
                        border: "2px solid #f7a50a40",
                      }}
                    >
                      <Title
                        level={3}
                        style={{
                          margin: 0,
                          color: "#f7a50a",
                          fontSize: "32px",
                        }}
                      >
                        FREE
                      </Title>
                      <Paragraph
                        style={{
                          margin: "8px 0 0 0",
                          fontSize: "14px",
                          color: "#6b7280",
                        }}
                      >
                        No registration fee for members
                      </Paragraph>
                    </motion.div>

                    <div style={{ marginBottom: "28px" }}>
                      {[
                        "Select your registered club",
                        "Fill in your information",
                        "Get digital badge instantly",
                        "QR code sent via email",
                      ].map((text, i) => (
                        <motion.div
                          key={i}
                          className="feature-item"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          viewport={{ once: true }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <CheckCircleOutlined
                            style={{ fontSize: "18px", color: "#f7a50a" }}
                          />
                          <span style={{ fontSize: "15px", color: "#1a1a2e" }}>
                            {text}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<ArrowRightOutlined />}
                      onClick={() => navigate("/register-member")}
                      style={{
                        background:
                          "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
                        border: "none",
                        height: "56px",
                        fontSize: "17px",
                        fontWeight: "600",
                        borderRadius: "12px",
                        boxShadow: "0 6px 20px rgba(247, 165, 10, 0.4)",
                      }}
                    >
                      Register as Member
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              className="registration-card col-span-12 md:col-span-6 lg:col-span-4"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true }}
            >
              <Card
                style={{
                  height: "100%",
                  borderRadius: "24px",
                  boxShadow: "0 10px 40px rgba(28, 60, 109, 0.15)",
                  border: "2px solid #e1e5ef",
                  overflow: "hidden",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f0f2f7 100%)",
                }}
                styles={{
                  body: {
                    height: "100%",
                  },
                }}
              >
                <div className="p-0 md:p-4 flex h-full flex-col">
                  <div className=" flex-1">
                    <motion.div
                      style={{ textAlign: "center", marginBottom: "24px" }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      transition={{ duration: 0.5 }}
                    >
                      <img
                        src={shirtTemplate}
                        alt="Shirt Template"
                        onClick={() => setPreviewVisible(true)}
                        style={{
                          width: "100%",
                          maxWidth: "280px",
                          height: "auto",
                          margin: "0 auto 20px",
                          borderRadius: "12px",
                          boxShadow: "0 10px 30px rgba(28, 60, 109, 0.2)",
                          cursor: "pointer",
                        }}
                      />
                    </motion.div>

                    <Title
                      level={2}
                      style={{
                        marginBottom: "12px",
                        textAlign: "center",
                        fontSize: "28px",
                      }}
                    >
                      Order Customized Shirt
                    </Title>
                    <Paragraph
                      style={{
                        fontSize: "16px",
                        color: "#6b7280",
                        marginBottom: "12px",
                        textAlign: "center",
                      }}
                    >
                      Get your personalized PALAROTARY 2026 shirt
                    </Paragraph>

                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      animate={{
                        boxShadow: [
                          "0 4px 15px rgba(28, 60, 109, 0.2)",
                          "0 8px 25px rgba(28, 60, 109, 0.3)",
                          "0 4px 15px rgba(28, 60, 109, 0.2)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        background:
                          "linear-gradient(135deg, #fde5e320 0%, #fbcbc720 100%)",
                        padding: "20px",
                        borderRadius: "16px",
                        marginBottom: "24px",
                        border: "2px solid #9ca3af",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        <Title
                          level={3}
                          style={{
                            margin: 0,
                            color: "#173052",
                            fontSize: "32px",
                          }}
                        >
                          ₱320
                        </Title>
                        <Paragraph
                          style={{
                            margin: 0,
                            fontSize: "20px",
                            color: "#9ca3af",
                            textDecoration: "line-through",
                          }}
                        >
                          ₱350
                        </Paragraph>
                      </div>
                      <Paragraph
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#d54839",
                        }}
                      >
                        Promo price until December 25, 2025
                      </Paragraph>
                    </motion.div>

                    {/* Deadline Notice */}
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      style={{
                        background:
                          "linear-gradient(135deg, #17305210 0%, #17305210 100%)",
                        padding: "10px 16px",
                        borderRadius: "12px",
                        marginBottom: "16px",
                        border: "2px solid #9ca3af",
                        textAlign: "center",
                      }}
                    >
                      <Paragraph
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#173052",
                        }}
                      >
                        Orders available until January 5, 2026
                      </Paragraph>
                    </motion.div>
                    <div style={{ marginBottom: "28px" }}>
                      {[
                        "Customize your shirt",
                        "Choose your size",
                        "Add your name and 2-digit number (00-99)",
                      ].map((text, i) => (
                        <motion.div
                          key={i}
                          className="feature-item"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          viewport={{ once: true }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <CheckCircleOutlined
                            style={{ fontSize: "18px", color: "#d54839" }}
                          />
                          <span style={{ fontSize: "15px", color: "#1a1a2e" }}>
                            {text}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <motion.div
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<ArrowRightOutlined />}
                      onClick={() => navigate("/shirt-order")}
                      style={{
                        background:
                          "linear-gradient(135deg, #1c3c6d 0%, #173052 100%)",
                        border: "none",
                        height: "56px",
                        fontSize: "17px",
                        fontWeight: "600",
                        borderRadius: "12px",
                        boxShadow: "0 6px 20px rgba(28, 60, 109, 0.4)",
                      }}
                    >
                      Order Now
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
        {/* Information Section - Ground Rules & General Guide */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: "60px" }}
        >
          <Title
            level={2}
            style={{
              textAlign: "center",
              marginBottom: "40px",
              color: "#1c3c6d",
              fontSize: "clamp(28px, 4vw, 36px)",
            }}
          >
            Important Information
          </Title>

          <div className="grid grid-cols-12 gap-6 mb-6">
            {/* Ground Rules Card */}
            <motion.div
              className="col-span-12 lg:col-span-6"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true }}
            >
              <Card
                style={{
                  height: "100%",
                  borderRadius: "24px",
                  boxShadow: "0 10px 40px rgba(28, 60, 109, 0.15)",
                  border: "2px solid #e1e5ef",
                  overflow: "hidden",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f0f2f7 100%)",
                }}
                styles={{
                  body: {
                    height: "100%",
                  },
                }}
              >
                <div className="p-0 md:p-4 flex h-full flex-col">
                  <div className="flex-1">
                    <motion.div
                      style={{ textAlign: "center", marginBottom: "24px" }}
                      whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <div
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #1c3c6d 0%, #2a5085 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 20px",
                          boxShadow: "0 10px 30px rgba(28, 60, 109, 0.3)",
                        }}
                      >
                        <TrophyOutlined
                          style={{ fontSize: "48px", color: "white" }}
                        />
                      </div>
                    </motion.div>

                    <Title
                      level={2}
                      style={{
                        marginBottom: "12px",
                        textAlign: "center",
                        fontSize: "28px",
                      }}
                    >
                      Ground Rules
                    </Title>
                    <Paragraph
                      style={{
                        fontSize: "16px",
                        color: "#666",
                        marginBottom: "24px",
                        textAlign: "center",
                      }}
                    >
                      Official tournament rules and regulations
                    </Paragraph>

                    <div style={{ marginBottom: "28px" }}>
                      {[
                        "9 official sports events + Muse & Fun Games",
                        "International Sports Federation standards",
                        "Complete rules for Athletics, Badminton, Basketball",
                        "Table Tennis, Volleyball, Pickleball, Mobile Legends",
                        "Code of conduct and compliance guidelines",
                      ].map((text, i) => (
                        <motion.div
                          key={i}
                          className="feature-item"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          viewport={{ once: true }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <CheckCircleOutlined
                            style={{ fontSize: "18px", color: "#1c3c6d" }}
                          />
                          <span style={{ fontSize: "15px", color: "#1a1a2e" }}>
                            {text}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<ArrowRightOutlined />}
                      onClick={() => navigate("/ground-rules")}
                      style={{
                        background:
                          "linear-gradient(135deg, #1c3c6d 0%, #173052 100%)",
                        border: "none",
                        height: "56px",
                        fontSize: "17px",
                        fontWeight: "600",
                        borderRadius: "12px",
                        boxShadow: "0 6px 20px rgba(28, 60, 109, 0.4)",
                      }}
                    >
                      View Ground Rules
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            {/* General Guide Card */}
            <motion.div
              className="col-span-12 lg:col-span-6"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true }}
            >
              <Card
                style={{
                  height: "100%",
                  borderRadius: "24px",
                  boxShadow: "0 10px 40px rgba(247, 165, 10, 0.15)",
                  border: "2px solid #fff3d6",
                  overflow: "hidden",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #fff9eb 100%)",
                }}
                styles={{
                  body: {
                    height: "100%",
                  },
                }}
              >
                <div className="p-0 md:p-4 flex h-full flex-col">
                  <div className="flex-1">
                    <motion.div
                      style={{ textAlign: "center", marginBottom: "24px" }}
                      whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <div
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 20px",
                          boxShadow: "0 10px 30px rgba(247, 165, 10, 0.3)",
                        }}
                      >
                        <BookOutlined
                          style={{ fontSize: "48px", color: "white" }}
                        />
                      </div>
                    </motion.div>

                    <Title
                      level={2}
                      style={{
                        marginBottom: "12px",
                        textAlign: "center",
                        fontSize: "28px",
                      }}
                    >
                      General Guide
                    </Title>
                    <Paragraph
                      style={{
                        fontSize: "16px",
                        color: "#666",
                        marginBottom: "24px",
                        textAlign: "center",
                      }}
                    >
                      Complete technical guidelines and regulations
                    </Paragraph>

                    <div style={{ marginBottom: "28px" }}>
                      {[
                        "Eligibility requirements and attendance rules",
                        "Zone colors and uniform guidelines",
                        "Complete event schedule (6 AM - 5 PM)",
                        "Scoring system and awards structure",
                        "Code of conduct and health & safety protocols",
                      ].map((text, i) => (
                        <motion.div
                          key={i}
                          className="feature-item"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          viewport={{ once: true }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <CheckCircleOutlined
                            style={{ fontSize: "18px", color: "#f7a50a" }}
                          />
                          <span style={{ fontSize: "15px", color: "#1a1a2e" }}>
                            {text}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<ArrowRightOutlined />}
                      onClick={() => navigate("/general-guide")}
                      style={{
                        background:
                          "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
                        border: "none",
                        height: "56px",
                        fontSize: "17px",
                        fontWeight: "600",
                        borderRadius: "12px",
                        boxShadow: "0 6px 20px rgba(247, 165, 10, 0.4)",
                      }}
                    >
                      View General Guide
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Club Payment Proof Upload Section */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: "60px" }}
        >
          <Card
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(247, 165, 10, 0.15)",
              border: "2px solid #fff3d6",
              background: "linear-gradient(135deg, #ffffff 0%, #fff9eb 100%)",
            }}
          >
            <div style={{ textAlign: "center", padding: "20px" }}>
              <motion.div
                whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: "20px" }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    boxShadow: "0 8px 25px rgba(247, 165, 10, 0.3)",
                  }}
                >
                  <UploadOutlined
                    style={{ fontSize: "40px", color: "white" }}
                  />
                </div>
              </motion.div>

              <Title
                level={3}
                style={{
                  color: "#1c3c6d",
                  marginBottom: "12px",
                  fontWeight: "bold",
                }}
              >
                CLUB REGISTRATION
              </Title>

              <Paragraph
                style={{
                  fontSize: "16px",
                  color: "#6b7280",
                  marginBottom: "28px",
                  maxWidth: "600px",
                  margin: "0 auto 28px",
                }}
              >
                Upload or update your payment proof for verification
              </Paragraph>

              <motion.div
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate("/club-payment-proof")}
                  style={{
                    background:
                      "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
                    border: "none",
                    height: "56px",
                    fontSize: "17px",
                    fontWeight: "600",
                    borderRadius: "12px",
                    boxShadow: "0 6px 20px rgba(247, 165, 10, 0.4)",
                    minWidth: "300px",
                  }}
                >
                  Register your club
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div> */}

        {/* Footer */}
        <motion.div
          style={{
            textAlign: "center",
            marginTop: "60px",
            padding: "40px 20px",
            borderTop: "2px solid #e8edf5",
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Paragraph
            style={{
              fontSize: "15px",
              color: "#6b7280",
              marginBottom: "12px",
            }}
          >
            For questions and inquiries, please contact the organizing
            committee.
          </Paragraph>
          <Paragraph
            style={{
              fontSize: "13px",
              color: "#9ca3af",
              marginTop: "16px",
            }}
          >
            © 2026 PALAROTARY. All rights reserved.
          </Paragraph>

          {/* Powered By Section */}
          <div>
            <span className="text-[#1c3c6d] ">Powered By</span>
            <div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 1 }}
              transition={{ delay: 1 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                transition={{ delay: 1.2 }}
                animate={{ opacity: 1, y: 1 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  // padding: "16px 16px 16px 16px",
                  // borderRadius: "16px",
                  // backgroundColor: "#ffffff55",
                  // backdropFilter: "blur(10px)",
                  // boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                }}
              >
                <div className=" flex flex-wrap gap-4">
                  <motion.img
                    src={dgsiLogo}
                    alt="DGSI Logo"
                    whileHover={{ scale: 1.15, y: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    style={{
                      height: "35px",
                      width: "auto",
                      objectFit: "contain",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      window.open("https://dynamicglobalsoft.com/", "_blank")
                    }
                  />
                  <motion.img
                    src={eventbookLogo}
                    alt="Eventbook Logo"
                    whileHover={{ scale: 1.15, y: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    style={{
                      height: "35px",
                      width: "auto",
                      objectFit: "contain",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      window.open("https://eventbook.com.ph/", "_blank")
                    }
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="90%"
        style={{ maxWidth: "800px" }}
        centered
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Title level={3} style={{ marginBottom: "20px" }}>
            Shirt Template Preview
          </Title>
          <img
            src={shirtTemplate}
            alt="Shirt Template Preview"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "8px",
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
