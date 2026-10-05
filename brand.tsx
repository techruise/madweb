export function Monogram({ animated = false }: { animated?: boolean }) {
  return (
    <svg
      viewBox="0 0 150 55"
      fill="none"
      aria-hidden="true"
      className={animated ? "monogram drawing" : "monogram"}
    >
      <path
        d="M5 48V7L24 33 43 7V48M54 48L74 7 94 48M63 32H85M105 48V7H120C151 7 151 48 120 48H105Z"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinejoin="miter"
      />
      <path d="M5 54H145" stroke="#C8A97E" strokeWidth="1" />
    </svg>
  );
}
