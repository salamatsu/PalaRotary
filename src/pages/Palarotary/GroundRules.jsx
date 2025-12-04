import {
  ArrowLeftOutlined,
  HomeOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { Button, Card, Typography, Divider } from "antd";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { cloud } from "../../assets/images/Other";

gsap.registerPlugin(ScrollTrigger);

const { Title, Paragraph, Text } = Typography;

export default function GroundRules() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const sectionsRef = useRef([]);
  const floatingElementsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
        }
      );

      // Floating elements
      floatingElementsRef.current.forEach((el, i) => {
        if (el) {
          gsap.to(el, {
            y: "random(-40, 40)",
            x: "random(-30, 30)",
            rotation: "random(-30, 30)",
            duration: "random(5, 8)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.3,
          });
        }
      });

      // Sections scroll animation
      sectionsRef.current.forEach((section, i) => {
        if (section) {
          gsap.fromTo(
            section,
            {
              opacity: 0,
              y: 80,
              rotationX: -15,
            },
            {
              opacity: 1,
              y: 0,
              rotationX: 0,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );

          // Animate list items within each section
          const listItems = section.querySelectorAll(".rule-item");
          gsap.fromTo(
            listItems,
            {
              opacity: 0,
              x: -30,
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const sports = [
    {
      title: "Athletics",
      emoji: "🏃",
      color: "#d54839",
      events: [
        "Individual: 50m Women, 100m Men/Women, 200m Men, 400m Open",
        "Team: 4x100m relay Men/Women",
        "2 rounds – Elimination (heats) and Final Round",
        "Best Time Rule applies",
      ],
    },
    {
      title: "Badminton",
      emoji: "🏸",
      color: "#f7a50a",
      events: [
        "Mixed Doubles (1M + 1F per team)",
        "Single Elimination (Knockout)",
        "1 game of 35 points",
        "Players bring own rackets",
      ],
    },
    {
      title: "Basketball",
      emoji: "🏀",
      color: "#1c3c6d",
      events: [
        "Men's Team - Max 10 players, min 5",
        "15 minutes game time",
        "Single Elimination format",
        "2 timeouts per team (30 sec each)",
      ],
    },
    {
      title: "Pickleball",
      emoji: "🏓",
      color: "#16a34a",
      events: [
        "Mixed Doubles (1M + 1F per team)",
        "Maximum 2 players per team",
        "1 game of 21 points",
        "Players bring own paddles",
      ],
    },
    {
      title: "Mobile Legends",
      emoji: "🎮",
      color: "#9333ea",
      events: [
        "5 players per team + 1 substitute",
        "Best-of-3 series",
        "Single Elimination",
        "Fair play rules enforced",
      ],
    },
    {
      title: "Swimming",
      emoji: "🏊",
      color: "#0ea5e9",
      events: [
        "50m Women (Primary, Secondary, Open)",
        "100m Men (Primary, Secondary, Open)",
        "4x50m relay Men/Women",
        "2 rounds – Elimination and Final",
      ],
    },
    {
      title: "Volleyball",
      emoji: "🏐",
      color: "#dc2626",
      events: [
        "Mixed Team (6-10 players)",
        "3M + 3F on court at all times",
        "1 set of 25 points per match",
        "Men restricted to front zone spike",
      ],
    },
    {
      title: "Muse Competition",
      emoji: "🎀",
      color: "#ec4899",
      events: [
        "Individual or Team presentations",
        "Rotating categories per zone",
        "Judged on creativity and theme",
        "Sportsmanship required",
      ],
    },
    {
      title: "Fun Games",
      emoji: "🎯",
      color: "#f59e0b",
      events: [
        "Multiple mini-games",
        "Relay, balloon pop, sack race",
        "Elimination or point-based ranking",
        "Follow instructions and respect participants",
      ],
    },
  ];

  const generalRules = [
    "All tournaments follow official International Sports Federation laws",
    "Rules adapted for Palarotary purposes by Tournament Committee",
    "Tournament Manager has final decision in disputes",
    "Rule of Succession applies to all events",
    "5-minute grace period for defaults",
    "Players must refrain from misconduct",
    "Tournament Manager may disqualify for serious violations",
  ];

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8f9fc 0%, #e8edf5 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated floating background elements */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          ref={(el) => (floatingElementsRef.current[i] = el)}
          style={{
            position: "absolute",
            width: `${Math.random() * 100 + 50}px`,
            height: `${Math.random() * 100 + 50}px`,
            borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "20%" : "30%",
            background:
              i % 3 === 0
                ? "rgba(28, 60, 109, 0.06)"
                : i % 3 === 1
                ? "rgba(247, 165, 10, 0.06)"
                : "rgba(213, 72, 57, 0.06)",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            pointerEvents: "none",
            filter: "blur(2px)",
          }}
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 6 + 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <img
        src={cloud}
        alt="background"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.3,
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "40px 20px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="default"
              size="large"
              icon={<HomeOutlined />}
              onClick={() => navigate("/")}
              style={{
                background: "white",
                borderRadius: "12px",
                fontWeight: "500",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              Back to Home
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="default"
              size="large"
              icon={<BookOutlined />}
              onClick={() => navigate("/general-guide")}
              style={{
                background: "white",
                borderRadius: "12px",
                fontWeight: "500",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              View General Guide
            </Button>
          </motion.div>
        </motion.div>

        {/* Header */}
        <motion.div ref={headerRef}>
          <Card
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(28, 60, 109, 0.15)",
              border: "2px solid #e1e5ef",
              background: "linear-gradient(135deg, #1c3c6d 0%, #2a5085 100%)",
              marginBottom: "40px",
            }}
          >
            <div style={{ textAlign: "center", padding: "20px" }}>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
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
                    margin: "0 auto 24px",
                    boxShadow: "0 10px 30px rgba(247, 165, 10, 0.4)",
                  }}
                >
                  <TrophyOutlined
                    style={{ fontSize: "50px", color: "white" }}
                  />
                </div>
              </motion.div>

              <Title
                level={1}
                style={{
                  color: "white",
                  marginBottom: "12px",
                  fontSize: "clamp(28px, 5vw, 42px)",
                }}
              >
                GROUND RULES
              </Title>
              <Paragraph
                style={{
                  fontSize: "18px",
                  color: "rgba(255, 255, 255, 0.9)",
                  maxWidth: "800px",
                  margin: "0 auto",
                }}
              >
                Official tournament rules and regulations for PALAROTARY 2026 -
                Ensuring fair play and sportsmanship across all events
              </Paragraph>
            </div>
          </Card>
        </motion.div>

        {/* General Guidelines */}
        <div ref={(el) => (sectionsRef.current[0] = el)}>
          <Card
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(213, 72, 57, 0.12)",
              border: "2px solid #fde5e3",
              background: "linear-gradient(135deg, #ffffff 0%, #fef5f4 100%)",
              marginBottom: "30px",
            }}
          >
            <Title
              level={2}
              style={{
                color: "#d54839",
                marginBottom: "24px",
                fontSize: "clamp(22px, 4vw, 32px)",
              }}
            >
              GENERAL GUIDELINES
            </Title>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {generalRules.map((rule, i) => (
                <motion.div
                  key={i}
                  className="rule-item"
                  whileHover={{ x: 5, scale: 1.01 }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "12px",
                    background: "rgba(213, 72, 57, 0.04)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <CheckCircleOutlined
                    style={{
                      fontSize: "20px",
                      color: "#d54839",
                      marginTop: "4px",
                      flexShrink: 0,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: "16px",
                      color: "#1a1a2e",
                      lineHeight: "1.6",
                    }}
                  >
                    {rule}
                  </Text>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sports Specific Rules */}
        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <Title
            level={2}
            style={{
              textAlign: "center",
              marginBottom: "30px",
              color: "#1c3c6d",
              fontSize: "clamp(24px, 4vw, 36px)",
            }}
          >
            SPECIFIC SPORT RULES
          </Title>

          <div
            // style={{
            //   display: "grid",
            //   gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            //   gap: "24px",
            // }}
            className=" grid grid-cols-12 gap-6"
          >
            {sports.map((sport, index) => (
              <div key={index} className=" col-span-4">
                <motion.div
                  ref={(el) => (sectionsRef.current[index + 1] = el)}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card
                    style={{
                      borderRadius: "20px",
                      boxShadow: `0 8px 30px ${sport.color}20`,
                      border: `2px solid ${sport.color}30`,
                      background: "white",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "20px",
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.6 }}
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${sport.color} 0%, ${sport.color}dd 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "32px",
                          boxShadow: `0 6px 20px ${sport.color}40`,
                        }}
                      >
                        {sport.emoji}
                      </motion.div>
                      <Title
                        level={3}
                        style={{
                          margin: 0,
                          color: sport.color,
                          fontSize: "clamp(18px, 3vw, 24px)",
                        }}
                      >
                        {sport.title}
                      </Title>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {sport.events.map((event, i) => (
                        <motion.div
                          key={i}
                          className="rule-item"
                          whileHover={{ x: 5 }}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "10px",
                            padding: "10px",
                            borderRadius: "10px",
                            background: `${sport.color}08`,
                          }}
                        >
                          <div
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: sport.color,
                              marginTop: "8px",
                              flexShrink: 0,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: "15px",
                              color: "#1a1a2e",
                              lineHeight: "1.6",
                            }}
                          >
                            {event}
                          </Text>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Conduct & Compliance */}
        <div ref={(el) => (sectionsRef.current[sports.length + 1] = el)}>
          <Card
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(28, 60, 109, 0.15)",
              border: "2px solid #e1e5ef",
              background: "linear-gradient(135deg, #ffffff 0%, #f0f2f7 100%)",
            }}
          >
            <Title
              level={2}
              style={{
                color: "#1c3c6d",
                marginBottom: "24px",
                fontSize: "clamp(22px, 4vw, 32px)",
              }}
            >
              CONDUCT & COMPLIANCE
            </Title>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {[
                "Strict compliance with default rules; 5-minute grace period",
                "Players and coaches must avoid misconduct: damage to equipment, foul language, disrespecting officials",
                "Behavior that brings disrepute to the sport is prohibited",
                "The Tournament Manager may disqualify participants for serious violations",
                "Decisions of the Tournament Manager are final and binding",
              ].map((rule, i) => (
                <motion.div
                  key={i}
                  className="rule-item"
                  whileHover={{ x: 5, scale: 1.01 }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "14px",
                    borderRadius: "12px",
                    background: "rgba(28, 60, 109, 0.06)",
                  }}
                >
                  <CheckCircleOutlined
                    style={{
                      fontSize: "20px",
                      color: "#1c3c6d",
                      marginTop: "4px",
                      flexShrink: 0,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: "16px",
                      color: "#1a1a2e",
                      lineHeight: "1.6",
                    }}
                  >
                    {rule}
                  </Text>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            textAlign: "center",
            marginTop: "60px",
            padding: "30px",
            borderTop: "2px solid #e8edf5",
          }}
        >
          <Paragraph style={{ fontSize: "15px", color: "#6b7280" }}>
            For questions about the rules, please contact the Tournament
            Committee.
          </Paragraph>
          <Paragraph
            style={{ fontSize: "13px", color: "#9ca3af", marginTop: "12px" }}
          >
            © 2026 PALAROTARY. All rights reserved.
          </Paragraph>
        </motion.div>
      </div>
    </div>
  );
}
