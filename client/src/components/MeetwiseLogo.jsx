const MeetwiseLogo = ({ size = 32, title = "Meetwise", className = "" }) => (
  <svg
    aria-label={title}
    className={className}
    height={size}
    role="img"
    viewBox="0 0 40 40"
    width={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 6.5h24a4 4 0 0 1 4 4v13a4 4 0 0 1-4 4H20l-8.5 6v-6H8a4 4 0 0 1-4-4v-13a4 4 0 0 1 4-4Z"
      fill="currentColor"
      opacity=".18"
    />
    <path
      d="m11 19.5 5 5 13-13"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3.5"
    />
  </svg>
);

export default MeetwiseLogo;
