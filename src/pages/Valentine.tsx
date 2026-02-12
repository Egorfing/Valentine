import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Container, Stack, Text, Title } from "@mantine/core";
import { IconHeartFilled } from "@tabler/icons-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useParams } from "react-router-dom";
import HeartImage from "../components/HeartImage";
import RunawayButton from "../components/RunawayButton";
import { decodeBase64Url } from "../utils/base64url";

const urlPattern = /^https?:\/\/.+/i;

export default function Valentine() {
  const { token } = useParams<{ token: string }>();
  const arenaRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<ReturnType<typeof confetti.create> | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [imageError, setImageError] = useState(false);

  const payload = useMemo(() => {
    const emptyPayload = { imageUrl: "", from: "" };
    if (!token) {
      return emptyPayload;
    }

    try {
      const decoded = decodeBase64Url(token);
      if (urlPattern.test(decoded)) {
        return { imageUrl: decoded, from: "" };
      }

      const parsed: unknown = JSON.parse(decoded);
      if (!parsed || typeof parsed !== "object") {
        return emptyPayload;
      }

      const imageUrlValue = "imageUrl" in parsed && typeof parsed.imageUrl === "string" ? parsed.imageUrl : "";
      const fromValue = "from" in parsed && typeof parsed.from === "string" ? parsed.from.trim() : "";

      return urlPattern.test(imageUrlValue) ? { imageUrl: imageUrlValue, from: fromValue } : emptyPayload;
    } catch {
      return emptyPayload;
    }
  }, [token]);
  const imageUrl = payload.imageUrl;
  const senderName = payload.from;

  const isValid = imageUrl.length > 0;

  useEffect(() => {
    if (!isValid) {
      return;
    }

    setImageReady(false);
    setImageError(false);

    // Preload image when opening the page so reveal after "Да" is instant.
    const preloaded = new Image();
    let active = true;
    preloaded.src = imageUrl;
    preloaded.onload = () => {
      if (active) {
        setImageReady(true);
      }
    };
    preloaded.onerror = () => {
      if (active) {
        setImageError(true);
      }
    };

    return () => {
      active = false;
    };
  }, [imageUrl, isValid]);

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.className = "confetti-canvas";
    root.appendChild(canvas);
    confettiRef.current = confetti.create(canvas, { resize: true, useWorker: true });

    return () => {
      confettiRef.current = null;
      canvas.remove();
    };
  }, []);

  const fireConfetti = (): void => {
    const shoot = confettiRef.current;
    const colors = ["#fa5252", "#ff8787", "#fcc2d7", "#f783ac"];

    if (!shoot) {
      confetti({
        particleCount: 160,
        spread: 110,
        origin: { y: 0.5 },
        colors
      });
      return;
    }

    shoot({
      particleCount: 90,
      spread: 96,
      startVelocity: 45,
      origin: { x: 0.15, y: 0.2 },
      ticks: 420,
      gravity: 0.95,
      decay: 0.93,
      colors
    });
    shoot({
      particleCount: 90,
      spread: 96,
      startVelocity: 45,
      origin: { x: 0.85, y: 0.2 },
      ticks: 420,
      gravity: 0.95,
      decay: 0.93,
      colors
    });
    shoot({
      particleCount: 70,
      spread: 110,
      startVelocity: 38,
      origin: { x: 0.5, y: 0.1 },
      ticks: 440,
      gravity: 0.95,
      decay: 0.93,
      colors
    });
  };

  const handleYes = (): void => {
    if (accepted) {
      return;
    }
    setAccepted(true);
    fireConfetti();
  };

  return (
    <Container className="page-shell">
      <div className="page-main">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <Card className={accepted ? "center-card center-card-wide" : "center-card"} shadow="xl" padding="xl" radius="lg">
            {!isValid ? (
              <Alert color="red" title="Некорректная ссылка">
                Не удалось прочитать ссылку на картинку. Проверь ссылку и попробуй снова.
              </Alert>
            ) : (
              <Stack gap="lg" align="center">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.4 }}>
                  <Title className="romantic-title" order={2} ta="center">
                    {accepted ? (senderName ? `С Любовью, твой ${senderName} 💘` : "Люблю тебя 💘") : "Будешь моим валентином? 💘"}
                  </Title>
                </motion.div>

                {!accepted ? (
                  <motion.div
                    className="arena"
                    ref={arenaRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14, duration: 0.4 }}
                  >
                    <div className="yes-slot">
                      <Button
                        className="yes-btn"
                        leftSection={<IconHeartFilled size={44} />}
                        color="pink"
                        onClick={handleYes}
                        disabled={!imageReady || imageError}
                      >
                        Да
                      </Button>
                      {imageError && (
                        <Text size="xs" c="red" mt={6}>
                          Упс, картинка не загрузилась. Попробуй другую ссылку.
                        </Text>
                      )}
                    </div>
                    {/* "Нет" starts at right and runs only when pointer gets very close (5px). */}
                    <RunawayButton arenaRef={arenaRef} />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  >
                    {imageError ? (
                      <Text ta="center" c="red" fw={600}>
                        Упс, картинка не загрузилась. Попробуй другую ссылку.
                      </Text>
                    ) : (
                      <div className="heart-stage">
                        <HeartImage imageUrl={imageUrl} onError={() => setImageError(true)} />
                      </div>
                    )}
                  </motion.div>
                )}
              </Stack>
            )}
          </Card>
        </motion.div>
      </div>
      <Text className="footer-sign" size="xs" c="dimmed">
        Egorfing with love
      </Text>
    </Container>
  );
}
