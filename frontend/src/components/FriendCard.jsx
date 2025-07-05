import { Link } from "react-router";
import { LANGUAGE_TO_FLAG } from "../constants";
import { removeFriend } from "../lib/api"; 
import { useState } from "react";

const FriendCard = ({ friend, onFriendRemoved }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveFriend = async () => {
    try {
      setIsRemoving(true);
      await removeFriend(friend._id);
      if (onFriendRemoved) {
        onFriendRemoved(friend._id); 
      }
    } catch (err) {
      console.error("Error removing friend:", err);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="card bg-base-200 hover:shadow-md transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img src={friend.profilePic} alt={friend.fullName} />
          </div>
          <h3 className="font-semibold truncate">{friend.fullName}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary text-xs">
            {getLanguageFlag(friend.nativeLanguage)}
            Native: {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline text-xs">
            {getLanguageFlag(friend.learningLanguage)}
            Learning: {friend.learningLanguage}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <Link to={`/chat/${friend._id}`} className="btn btn-outline w-full">
            Message
          </Link>

          <button
            onClick={handleRemoveFriend}
            className="btn btn-error btn-sm w-full"
            disabled={isRemoving}
          >
            {isRemoving ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-1 inline-block"
      />
    );
  }
  return null;
}
