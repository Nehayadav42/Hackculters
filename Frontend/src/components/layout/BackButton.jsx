import { useNavigate } from "react-router-dom";
import { navigateBack } from "../../utils/navigation.js";

export default function BackButton({
  fallback = "/",
  children = "Back",
  className = "",
}) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigateBack(navigate, fallback)}
      className={className}
    >
      <span aria-hidden="true">←</span> {children}
    </button>
  );
}
