import {
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  SafetyOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Button, Card, Tag, Typography } from "antd";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { cloud } from "../../assets/images/Other";

gsap.registerPlugin(ScrollTrigger);

const { Title, Paragraph, Text } = Typography;

export default function GeneralGuide() {
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
      sectionsRef.current.forEach((section) => {
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
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const zoneColors = {
    "Zone 1": { color: "#6b7280", name: "Grey" },
    "Zone 2": { color: "#dc2626", name: "Red" },
    "Zone 3": { color: "#fbbf24", name: "Yellow" },
    "Zone 4": { color: "#ffffff", name: "White" },
    "Zone 5": { color: "#2563eb", name: "Blue" },
    "Zone 6": { color: "#16a34a", name: "Green" },
    "Zone 7": { color: "#991b1b", name: "Maroon" },
    "Zone 8": { color: "#a78bfa", name: "Lavender" },
  };

  const zones = [
    { zone: "Zone 1", area: "Malabon, Navotas", color: "Grey", hex: "#6b7280" },
    { zone: "Zone 2", area: "Caloocan", color: "Red", hex: "#dc2626" },
    { zone: "Zone 3", area: "Valenzuela", color: "Yellow", hex: "#fbbf24" },
    { zone: "Zone 4", area: "Marikina", color: "White", hex: "#ffffff" },
    { zone: "Zone 5", area: "Rizal", color: "Blue", hex: "#2563eb" },
    { zone: "Zone 6", area: "Pasig", color: "Green", hex: "#16a34a" },
    { zone: "Zone 7", area: "San Juan", color: "Maroon", hex: "#991b1b" },
    { zone: "Zone 8", area: "Mandaluyong", color: "Lavender", hex: "#a78bfa" },
  ];

  const schedule = [
    { time: "6:00 – 7:00 AM", activity: "Registration" },
    { time: "7:00 – 8:00 AM", activity: "Sunday Mass" },
    {
      time: "8:00 – 9:00 AM",
      activity: "Parade, Opening Ceremony, Cheering, Miss Palarotary",
    },
    { time: "9:00 – 10:30 AM", activity: "Athletics (Various Events)" },
    { time: "9:00 – 11:00 AM", activity: "Volleyball (All-Female, 6+4)" },
    { time: "9:30 – 11:00 AM", activity: "Mobile Legends" },
    { time: "9:30 – 11:00 AM", activity: "Pickleball" },
    { time: "10:00 – 11:30 AM", activity: "Fun Games" },
    { time: "10:00 – 12:00 NN", activity: "Badminton" },
    { time: "12:00 – 2:00 PM", activity: "Table Tennis" },
    { time: "1:00 – 4:00 PM", activity: "Basketball" },
    { time: "5:00 PM", activity: "Awarding and Closing Ceremonies" },
  ];

  const scoringIndividual = [
    { rank: "1st Place", points: "10 / 50", medal: "🥇 Gold" },
    { rank: "2nd Place", points: "8 / 45", medal: "🥈 Silver" },
    { rank: "3rd Place", points: "7 / 40", medal: "🥉 Bronze" },
    { rank: "4th Place", points: "6 / 35", medal: "-" },
    { rank: "5th Place", points: "5 / 30", medal: "-" },
  ];

  const scoringTeam = [
    { rank: "1st Place", points: "50", medal: "🥇 Gold" },
    { rank: "2nd Place", points: "40", medal: "🥈 Silver" },
    { rank: "3rd Place", points: "30", medal: "🥉 Bronze" },
    { rank: "4th-9th Place", points: "20-10", medal: "-" },
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
      {/* Animated floating background */}
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
              onClick={() => navigate("/ground-rules")}
              style={{
                background: "white",
                borderRadius: "12px",
                fontWeight: "500",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              View Ground Rules
            </Button>
          </motion.div>
        </motion.div>

        {/* Header */}
        <motion.div ref={headerRef}>
          <Card
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(247, 165, 10, 0.15)",
              border: "2px solid #fff3d6",
              background: "linear-gradient(135deg, #f7a50a 0%, #c68408 100%)",
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
                      "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <BookOutlined
                    style={{ fontSize: "50px", color: "#f7a50a" }}
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
                GENERAL GUIDE
              </Title>
              <Paragraph
                style={{
                  fontSize: "18px",
                  color: "rgba(255, 255, 255, 0.95)",
                  maxWidth: "800px",
                  margin: "0 auto",
                }}
              >
                Complete technical guidelines, rules, and regulations for
                DISTRICT 3800 PALAROTARY 2026
              </Paragraph>
            </div>
          </Card>
        </motion.div>

        {/* Quick Info Cards */}
        <div
          ref={(el) => (sectionsRef.current[0] = el)}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {[
            {
              icon: CalendarOutlined,
              title: "Date",
              value: "January 25, 2026",
              color: "#d54839",
            },
            {
              icon: ClockCircleOutlined,
              title: "Time",
              value: "6:00 AM - 5:00 PM",
              color: "#f7a50a",
            },
            {
              icon: EnvironmentOutlined,
              title: "Venue",
              value: "Marikina Sports Center",
              color: "#1c3c6d",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card
                style={{
                  borderRadius: "16px",
                  boxShadow: `0 6px 20px ${item.color}20`,
                  border: `2px solid ${item.color}30`,
                  background: "white",
                  textAlign: "center",
                }}
              >
                <item.icon style={{ fontSize: "36px", color: item.color }} />
                <Title
                  level={4}
                  style={{ margin: "12px 0 4px", color: "#1a1a2e" }}
                >
                  {item.title}
                </Title>
                <Text style={{ fontSize: "16px", color: "#6b7280" }}>
                  {item.value}
                </Text>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Eligibility */}
        <div ref={(el) => (sectionsRef.current[1] = el)}>
          <Card
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(28, 60, 109, 0.12)",
              border: "2px solid #e1e5ef",
              background: "linear-gradient(135deg, #ffffff 0%, #f0f2f7 100%)",
              marginBottom: "30px",
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
              <TeamOutlined style={{ fontSize: "32px", color: "#1c3c6d" }} />
              <Title level={2} style={{ margin: 0, color: "#1c3c6d" }}>
                ELIGIBILITY & ATTENDANCE
              </Title>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <motion.div
                whileHover={{ x: 5 }}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "rgba(28, 60, 109, 0.06)",
                }}
              >
                <Title
                  level={4}
                  style={{ color: "#1c3c6d", marginBottom: "8px" }}
                >
                  Who Can Participate
                </Title>
                <Text style={{ fontSize: "16px", lineHeight: "1.6" }}>
                  Only Rotarians, their spouses, or children from District 3800
                  are eligible to participate in all events.
                </Text>
              </motion.div>
              <motion.div
                whileHover={{ x: 5 }}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "rgba(247, 165, 10, 0.06)",
                }}
              >
                <Title
                  level={4}
                  style={{ color: "#f7a50a", marginBottom: "8px" }}
                >
                  Attendance Requirements
                </Title>
                <Text style={{ fontSize: "16px", lineHeight: "1.6" }}>
                  Players must arrive 10 minutes before their scheduled match in
                  proper playing attire. Failure to present the prescribed
                  number of players 5 minutes before the match results in
                  automatic default.
                </Text>
              </motion.div>
            </div>
          </Card>
        </div>

        {/* Zone Colors */}
        <div ref={(el) => (sectionsRef.current[2] = el)}>
          <Card
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(213, 72, 57, 0.12)",
              border: "2px solid #fde5e3",
              marginBottom: "30px",
            }}
          >
            <Title level={2} style={{ color: "#d54839", marginBottom: "24px" }}>
              ZONE COLORS
            </Title>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              {zones.map((zone, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -5 }}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: `2px solid ${
                      zone.color === "White" ? "#e5e7eb" : zone.hex
                    }`,
                    background:
                      zone.color === "White" ? "#f9fafb" : `${zone.hex}15`,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      background: zone.hex,
                      margin: "0 auto 12px",
                      boxShadow: `0 4px 12px ${zone.hex}60`,
                      border:
                        zone.color === "White" ? "2px solid #e5e7eb" : "none",
                    }}
                  />
                  <Title
                    level={4}
                    style={{ margin: "0 0 4px", fontSize: "16px" }}
                  >
                    {zone.zone}
                  </Title>
                  <Text style={{ fontSize: "14px", color: "#6b7280" }}>
                    {zone.area}
                  </Text>
                  <div style={{ marginTop: "8px" }}>
                    <Tag
                      color={zone.hex}
                      style={{
                        fontWeight: "600",
                        border:
                          zone.color === "White" ? "1px solid #e5e7eb" : "none",
                        color:
                          zone.color === "White" || zone.color === "Yellow"
                            ? "#1a1a2e"
                            : "white",
                      }}
                    >
                      {zone.color}
                    </Tag>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Schedule */}
        <div ref={(el) => (sectionsRef.current[3] = el)}>
          <Card
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(28, 60, 109, 0.12)",
              border: "2px solid #e1e5ef",
              background: "white",
              marginBottom: "30px",
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
              <CalendarOutlined
                style={{ fontSize: "32px", color: "#1c3c6d" }}
              />
              <Title level={2} style={{ margin: 0, color: "#1c3c6d" }}>
                SCHEDULE OF EVENTS
              </Title>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "0 8px",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        background: "#1c3c6d",
                        color: "white",
                        borderRadius: "8px 0 0 8px",
                      }}
                    >
                      Time
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        background: "#1c3c6d",
                        color: "white",
                        borderRadius: "0 8px 8px 0",
                      }}
                    >
                      Activity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((item, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      style={{
                        background: i % 2 === 0 ? "#f9fafb" : "white",
                      }}
                    >
                      <td
                        style={{
                          padding: "14px 16px",
                          fontWeight: "600",
                          color: "#1c3c6d",
                          borderRadius: "8px 0 0 8px",
                        }}
                      >
                        {item.time}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          color: "#1a1a2e",
                          borderRadius: "0 8px 8px 0",
                        }}
                      >
                        {item.activity}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Scoring System */}
        <div ref={(el) => (sectionsRef.current[4] = el)}>
          <Card
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(247, 165, 10, 0.12)",
              border: "2px solid #fff3d6",
              background: "white",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <TrophyOutlined style={{ fontSize: "32px", color: "#f7a50a" }} />
              <Title level={2} style={{ margin: 0, color: "#f7a50a" }}>
                SCORING & AWARDS
              </Title>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              {/* Individual Events */}
              <div>
                <Title
                  level={4}
                  style={{ color: "#1c3c6d", marginBottom: "16px" }}
                >
                  Individual Events (Best Time)
                </Title>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "10px",
                          background: "#f7a50a",
                          color: "white",
                        }}
                      >
                        Rank
                      </th>
                      <th
                        style={{
                          textAlign: "center",
                          padding: "10px",
                          background: "#f7a50a",
                          color: "white",
                        }}
                      >
                        Points
                      </th>
                      <th
                        style={{
                          textAlign: "center",
                          padding: "10px",
                          background: "#f7a50a",
                          color: "white",
                        }}
                      >
                        Award
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoringIndividual.map((item, i) => (
                      <tr
                        key={i}
                        style={{
                          background: i % 2 === 0 ? "#fff9eb" : "white",
                        }}
                      >
                        <td style={{ padding: "10px" }}>{item.rank}</td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          {item.points}
                        </td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          {item.medal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Team Events */}
              <div>
                <Title
                  level={4}
                  style={{ color: "#1c3c6d", marginBottom: "16px" }}
                >
                  Team Events (Elimination)
                </Title>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "10px",
                          background: "#1c3c6d",
                          color: "white",
                        }}
                      >
                        Rank
                      </th>
                      <th
                        style={{
                          textAlign: "center",
                          padding: "10px",
                          background: "#1c3c6d",
                          color: "white",
                        }}
                      >
                        Points
                      </th>
                      <th
                        style={{
                          textAlign: "center",
                          padding: "10px",
                          background: "#1c3c6d",
                          color: "white",
                        }}
                      >
                        Award
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoringTeam.map((item, i) => (
                      <tr
                        key={i}
                        style={{
                          background: i % 2 === 0 ? "#f0f2f7" : "white",
                        }}
                      >
                        <td style={{ padding: "10px" }}>{item.rank}</td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          {item.points}
                        </td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          {item.medal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>

        {/* Conduct & Discipline */}
        <div ref={(el) => (sectionsRef.current[5] = el)}>
          <Card
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(213, 72, 57, 0.12)",
              border: "2px solid #fde5e3",
              background: "linear-gradient(135deg, #ffffff 0%, #fef5f4 100%)",
              marginBottom: "30px",
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
              <SafetyOutlined style={{ fontSize: "32px", color: "#d54839" }} />
              <Title level={2} style={{ margin: 0, color: "#d54839" }}>
                CONDUCT & DISCIPLINE
              </Title>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {[
                {
                  title: "Sportsmanship",
                  desc: "Uphold Rotary spirit of friendship, fairness, and integrity. Fellowship takes precedence over competition.",
                  color: "#1c3c6d",
                },
                {
                  title: "Code of Conduct",
                  desc: "Observe proper decorum on and off the field. No smoking, alcohol, or unruly behavior within premises.",
                  color: "#f7a50a",
                },
                {
                  title: "Officials' Authority",
                  desc: "Officials' decisions are final. Tournament Referee has full authority to suspend or disqualify for misconduct.",
                  color: "#d54839",
                },
                {
                  title: "Health & Safety",
                  desc: "Players must be medically fit. Emergency medical assistance available. Bring first aid kits and stay hydrated.",
                  color: "#16a34a",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5, scale: 1.03 }}
                  style={{
                    padding: "20px",
                    borderRadius: "16px",
                    border: `2px solid ${item.color}30`,
                    background: `${item.color}08`,
                  }}
                >
                  <Title
                    level={4}
                    style={{ color: item.color, marginBottom: "10px" }}
                  >
                    {item.title}
                  </Title>
                  <Text style={{ fontSize: "15px", lineHeight: "1.6" }}>
                    {item.desc}
                  </Text>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Palarotary Events */}
        <div ref={(el) => (sectionsRef.current[6] = el)}>
          <Card
            style={{
              borderRadius: "24px",
              boxShadow: "0 10px 40px rgba(28, 60, 109, 0.12)",
              border: "2px solid #e1e5ef",
              background: "white",
            }}
          >
            <Title
              level={2}
              style={{
                color: "#1c3c6d",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              OFFICIAL PALAROTARY 2026 EVENTS
            </Title>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                justifyContent: "center",
              }}
            >
              {[
                { name: "Muse Competition", emoji: "🎀", color: "#ec4899" },
                { name: "Fun Games", emoji: "🎯", color: "#f59e0b" },
                { name: "Athletics", emoji: "🏃", color: "#d54839" },
                { name: "Badminton", emoji: "🏸", color: "#f7a50a" },
                { name: "Basketball", emoji: "🏀", color: "#1c3c6d" },
                { name: "Pickleball", emoji: "🏓", color: "#16a34a" },
                { name: "Mobile Legends", emoji: "🎮", color: "#9333ea" },
                { name: "Table Tennis", emoji: "🏓", color: "#0ea5e9" },
                { name: "Volleyball", emoji: "🏐", color: "#dc2626" },
              ].map((event, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  style={{
                    padding: "16px 24px",
                    borderRadius: "16px",
                    background: `${event.color}15`,
                    border: `2px solid ${event.color}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "28px" }}>{event.emoji}</span>
                  <Text
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: event.color,
                    }}
                  >
                    {event.name}
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
            For questions and inquiries, please contact the organizing
            committee.
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
