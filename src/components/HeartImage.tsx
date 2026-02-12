import { Center } from "@mantine/core";

type HeartImageProps = {
  imageUrl: string;
  onError: () => void;
};

export default function HeartImage({ imageUrl, onError }: HeartImageProps) {
  return (
    <Center className="heart-image-wrap">
      <svg className="heart-image-svg" viewBox="0 0 210 190" aria-label="Heart image">
        <defs>
          {/* SVG clipPath trims the rectangular image to a heart silhouette. */}
          <clipPath id="heartClip">
            <path d="M105 180C102 176 21 116 21 67C21 38 44 15 73 15C88 15 100 21 105 34C110 21 122 15 137 15C166 15 189 38 189 67C189 116 108 176 105 180Z" />
          </clipPath>
        </defs>
        <image
          href={imageUrl}
          x="10"
          y="8"
          width="190"
          height="172"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#heartClip)"
          onError={onError}
        />
        <path
          d="M105 180C102 176 21 116 21 67C21 38 44 15 73 15C88 15 100 21 105 34C110 21 122 15 137 15C166 15 189 38 189 67C189 116 108 176 105 180Z"
          fill="none"
          stroke="#e03131"
          strokeWidth="6"
        />
      </svg>
    </Center>
  );
}
