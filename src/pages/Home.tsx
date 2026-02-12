import { useEffect, useState } from "react";
import { ActionIcon, Anchor, Button, Card, Container, Group, Stack, Text, TextInput, Title, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { encodeBase64Url } from "../utils/base64url";

const urlPattern = /^https?:\/\/.+/i;

export default function Home() {
  const [imageUrl, setImageUrl] = useState("");
  const [senderName, setSenderName] = useState("");
  const [error, setError] = useState("");
  const [senderError, setSenderError] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isCheckingImage, setIsCheckingImage] = useState(false);
  const [isImageReachable, setIsImageReachable] = useState<boolean>(false);

  useEffect(() => {
    const value = imageUrl.trim();
    setGeneratedLink("");
    setCopied(false);

    if (!value) {
      setError("");
      setIsCheckingImage(false);
      setIsImageReachable(false);
      return;
    }

    if (!urlPattern.test(value)) {
      setError("Похоже, это невалидный URL.");
      setIsCheckingImage(false);
      setIsImageReachable(false);
      return;
    }

    setError("");
    setIsCheckingImage(true);
    setIsImageReachable(false);

    const precheck = new Image();
    let active = true;
    let settled = false;
    const timer = window.setTimeout(() => {
      precheck.src = value;
    }, 250);
    const timeoutTimer = window.setTimeout(() => {
      if (!active || settled) {
        return;
      }
      settled = true;
      setIsCheckingImage(false);
      setIsImageReachable(false);
      setError("Картинка не ответила за 10 секунд. Нужна другая ссылка.");
    }, 10000);

    // Async precheck: if image can't be loaded, user sees immediate actionable error.
    precheck.onload = () => {
      if (!active || settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timeoutTimer);
      setIsCheckingImage(false);
      setIsImageReachable(true);
    };
    precheck.onerror = () => {
      if (!active || settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timeoutTimer);
      setIsCheckingImage(false);
      setIsImageReachable(false);
      setError("По этой ссылке не удалось загрузить картинку. Нужна другая.");
    };

    return () => {
      active = false;
      window.clearTimeout(timer);
      window.clearTimeout(timeoutTimer);
    };
  }, [imageUrl]);

  const generateLink = (): void => {
    const value = imageUrl.trim();
    const sender = senderName.trim();
    if (!value) {
      setError("Вставь ссылку на картинку.");
      setGeneratedLink("");
      return;
    }

    if (!urlPattern.test(value)) {
      setError("Похоже, это невалидный URL.");
      setGeneratedLink("");
      return;
    }
    if (isCheckingImage) {
      setError("Проверяем ссылку, подожди пару секунд.");
      setGeneratedLink("");
      return;
    }
    if (!isImageReachable) {
      setError("По этой ссылке не удалось загрузить картинку. Нужна другая.");
      setGeneratedLink("");
      return;
    }
    if (!sender) {
      setSenderError("Впиши имя отправителя.");
      setGeneratedLink("");
      return;
    }

    const token = encodeBase64Url(
      JSON.stringify({
        imageUrl: value,
        from: sender
      })
    );
    const link = `${window.location.origin}${window.location.pathname}#/i/${token}`;
    setError("");
    setSenderError("");
    setGeneratedLink(link);
    setCopied(false);
  };

  const copyLink = async (): Promise<void> => {
    if (!generatedLink) {
      return;
    }

    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Container className="page-shell">
      <div className="page-main">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }}>
          <Card className="center-card" shadow="xl" padding="xl" radius="lg">
            <Stack gap="md">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4 }}>
                <Title className="romantic-title" order={1} ta="center">
                  Сделай валентинку по ссылке ❤️
                </Title>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.4 }}>
                <Text className="romantic-subtitle" ta="center" c="dimmed">
                  Вставь прямую ссылку на картинку
                </Text>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.4 }}>
                <TextInput
                  label="URL картинки"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.currentTarget.value)}
                  error={error}
                  description={
                    isCheckingImage
                      ? "Проверяем, доступна ли картинка..."
                      : isImageReachable
                        ? "Ссылка рабочая, можно генерировать."
                        : undefined
                  }
                  withAsterisk
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.4 }}>
                <TextInput
                  label="От кого"
                  placeholder="Например: Егор"
                  value={senderName}
                  onChange={(event) => {
                    setSenderName(event.currentTarget.value);
                    setSenderError("");
                    setGeneratedLink("");
                    setCopied(false);
                  }}
                  error={senderError}
                  withAsterisk
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
                <Button className="romantic-cta" onClick={generateLink} disabled={!isImageReachable || isCheckingImage}>
                  Сгенерировать ссылку
                </Button>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, duration: 0.4 }}>
                <Text size="sm" c="dimmed">
                  Инструкция для корректной ссылки:
                  <br />
                  1. Загрузите фото к себе во{" "}
                  <Anchor href="https://vk.com/" target="_blank" rel="noreferrer">
                    ВКонтакте
                  </Anchor>
                  .
                  <br />
                  2. Откройте фото в полном размере и нажмите правой кнопкой мыши.
                  <br />
                  3. Выберите «Копировать URL картинки».
                  <br />
                  4. Вставьте ссылку в поле «URL картинки».
                </Text>
              </motion.div>

              {generatedLink && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
                  <Stack className="share-capsule" gap="xs">
                    <Text size="sm" fw={600}>
                      Готовая ссылка
                    </Text>
                    <Group wrap="nowrap" align="end">
                      <TextInput value={generatedLink} readOnly styles={{ input: { fontFamily: "monospace" } }} />
                      <Tooltip label={copied ? "Скопировано" : "Скопировать"}>
                        <ActionIcon className="copy-action" size="lg" variant="filled" onClick={copyLink} aria-label="Copy link">
                          {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Stack>
                </motion.div>
              )}
            </Stack>
          </Card>
        </motion.div>
      </div>
      <Text className="footer-sign" size="xs" c="dimmed">
        Egorfing with love
      </Text>
    </Container>
  );
}
