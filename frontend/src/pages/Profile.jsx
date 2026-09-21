import { useEffect, useRef, useState } from "react";
import {
  Camera,
  User,
  Shield,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Mail,
  LockKeyhole,
  UserRound,
  ImagePlus,
  BadgeCheck,
  ShieldCheck,
  CircleUserRound,
  Pencil,
} from "lucide-react";

const API = `${import.meta.env.VITE_API_URL}/users`;
const API_ROOT = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");
  const [avatarError, setAvatarError] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  const token = localStorage.getItem("token");

  /* =====================================================
     BUILD AVATAR URL
  ===================================================== */

  const getAvatarUrl = (avatarPath, cacheBust = false) => {
    if (!avatarPath) return "";

    const value = String(avatarPath).trim();

    if (!value) return "";

    let url = value;

    /*
      If backend already returned a complete URL,
      use it directly.
    */
    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:")
    ) {
      url = value;
    } else {
      /*
        Backend normally returns:

        /uploads/avatar.jpg

        VITE_API_URL:

        http://localhost:5000/api

        API_ROOT becomes:

        http://localhost:5000
      */

      if (value.startsWith("/")) {
        url = `${API_ROOT}${value}`;
      } else {
        url = `${API_ROOT}/${value}`;
      }
    }

    if (cacheBust) {
      const separator = url.includes("?") ? "&" : "?";
      url = `${url}${separator}t=${Date.now()}`;
    }

    return url;
  };

  /* =====================================================
     PASSWORD STRENGTH
  ===================================================== */

  const getStrength = (password) => {
    if (!password || password.length < 6) {
      return {
        label: "Weak",
        color: "#dc2626",
        width: "33%",
      };
    }

    if (password.length < 10) {
      return {
        label: "Medium",
        color: "#d97706",
        width: "66%",
      };
    }

    return {
      label: "Strong",
      color: "#16a34a",
      width: "100%",
    };
  };

  /* =====================================================
     LOAD PROFILE
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setProfileLoading(true);

        const res = await fetch(`${API}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "Unable to load profile"
          );
        }

        if (!mounted) return;

        setName(data.name || "");
        setEmail(data.email || "");

        if (data.avatar) {
          setAvatarError(false);
          setPreview(getAvatarUrl(data.avatar));
        } else {
          setPreview("");
          setAvatarError(false);
        }
      } catch (err) {
        console.error("PROFILE LOAD ERROR:", err);
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    };

    if (token) {
      load();
    } else {
      setProfileLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [token]);

  /* =====================================================
     CLEANUP OBJECT URL
  ===================================================== */

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  /* =====================================================
     SHOW MESSAGE
  ===================================================== */

  const showMessage = (type, text) => {
    setMessage(`${type}:${text}`);

    setTimeout(() => {
      setMessage("");
    }, 3500);
  };

  /* =====================================================
     UPDATE PROFILE
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showMessage("error", "Please enter your full name");
      return;
    }

    try {
      setLoading(true);

      const form = new FormData();

      form.append("name", name.trim());

      if (avatar) {
        form.append("avatar", avatar);
      }

      const res = await fetch(`${API}/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Profile update failed"
        );
      }

      /* =================================================
         UPDATE PROFILE PICTURE
      ================================================= */

      if (data.user?.avatar) {
        setAvatarError(false);

        setPreview(
          getAvatarUrl(
            data.user.avatar,
            true
          )
        );
      }

      if (data.user?.name) {
        setName(data.user.name);
      }

      setAvatar(null);

      /*
        Reset file input so selecting the same
        picture again will still trigger change.
      */

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      showMessage(
        "success",
        "Profile updated successfully"
      );
    } catch (err) {
      console.error("PROFILE UPDATE ERROR:", err);

      showMessage(
        "error",
        err.message || "Profile update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     CHANGE PASSWORD
  ===================================================== */

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      showMessage(
        "error",
        "Please enter your current password"
      );
      return;
    }

    if (!newPassword) {
      showMessage(
        "error",
        "Please enter a new password"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage(
        "error",
        "Passwords do not match"
      );
      return;
    }

    if (newPassword.length < 6) {
      showMessage(
        "error",
        "Password must be at least 6 characters"
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API}/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Password update failed"
        );
      }

      showMessage(
        "success",
        "Password updated successfully"
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(
        "PASSWORD UPDATE ERROR:",
        err
      );

      showMessage(
        "error",
        err.message || "Password update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     AVATAR
  ===================================================== */

  const handleAvatarChange = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage(
        "error",
        "Please select an image file"
      );
      return;
    }

    /*
      5MB maximum profile picture.
    */

    if (file.size > 5 * 1024 * 1024) {
      showMessage(
        "error",
        "Profile picture must be smaller than 5MB"
      );
      return;
    }

    setAvatar(file);
    setAvatarError(false);

    if (objectUrlRef.current) {
      URL.revokeObjectURL(
        objectUrlRef.current
      );
    }

    const objectUrl =
      URL.createObjectURL(file);

    objectUrlRef.current = objectUrl;

    setPreview(objectUrl);
  };

  /* =====================================================
     AVATAR ERROR
  ===================================================== */

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  /* =====================================================
     INITIALS
  ===================================================== */

  const getInitials = () => {
    if (!name) return "U";

    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  /* =====================================================
     MESSAGE TYPE
  ===================================================== */

  const messageType = message.startsWith(
    "success:"
  )
    ? "success"
    : "error";

  const messageText = message.replace(
    /^(success:|error:)/,
    ""
  );

  /* =====================================================
     LOADING SCREEN
  ===================================================== */

  if (profileLoading) {
    return (
      <div style={container}>
        <style>{responsiveStyles}</style>

        <div className="loadingCard" style={loadingCard}>
          <div style={loadingIcon}>
            <CircleUserRound
              size={34}
              strokeWidth={1.8}
            />
          </div>

          <h2 style={loadingTitle}>
            Loading Profile
          </h2>

          <p style={loadingText}>
            Please wait while we load your account
            information.
          </p>

          <div style={loadingBar}>
            <div style={loadingBarInner} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="profilePage"
      style={container}
    >
      <style>{responsiveStyles}</style>

      <div className="profileContent">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="pageHeading">

          <div
            className="pageHeadingLeft"
            style={pageHeadingLeft}
          >

            <div
              className="pageHeadingIcon"
              style={pageHeadingIcon}
            >
              <UserRound
                size={25}
                strokeWidth={2.2}
              />
            </div>

            <div className="headingText">

              <h1
                className="pageTitle"
                style={pageTitle}
              >
                My Profile
              </h1>

              <p
                className="pageSubtitle"
                style={pageSubtitle}
              >
                Manage your account information
                and security
              </p>

            </div>

          </div>

          <div
            className="accountBadge"
            style={accountBadge}
          >
            <ShieldCheck
              size={16}
              strokeWidth={2.2}
            />

            Account Secure
          </div>

        </div>

        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <div className="profileHero">

          <div
            className="heroBackgroundShape"
            style={heroBackgroundShape}
          />

          <div
            className="heroContent"
          >

            {/* AVATAR */}

            <div
              className="avatarArea"
              style={avatarArea}
            >

              <div
                className="avatarWrapper"
                style={avatarWrapper}
              >

                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) =>
                    handleAvatarChange(
                      e.target.files?.[0]
                    )
                  }
                />

                {/* PERFECT CIRCLE FRAME */}

                <div
                  className="avatarRing"
                  style={avatarRing}
                >

                  <div className="avatarClip">

                    {preview && !avatarError ? (
                      <img
                        className="avatarImage"
                        src={preview}
                        alt="Profile"
                        onError={handleAvatarError}
                      />
                    ) : (
                      <div
                        className="avatarFallback"
                        style={avatarFallback}
                      >
                        {getInitials()}
                      </div>
                    )}

                  </div>

                </div>

                {/* CAMERA BUTTON */}

                <button
                  type="button"
                  className="cameraButton"
                  style={cameraButton}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  title="Change profile picture"
                  aria-label="Change profile picture"
                >
                  <Camera
                    size={18}
                    strokeWidth={2.4}
                  />
                </button>

              </div>

              <button
                type="button"
                className="changePhotoButton"
                style={changePhotoButton}
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <ImagePlus
                  size={15}
                  strokeWidth={2.3}
                />

                Change Photo
              </button>

            </div>

            {/* PROFILE INFORMATION */}

            <div
              className="heroIdentity"
            >

              <div
                className="verifiedBadge"
                style={verifiedBadge}
              >
                <BadgeCheck
                  size={15}
                  strokeWidth={2.4}
                />

                Verified Account
              </div>

              <h2
                className="heroName"
                style={heroName}
              >
                {name || "User"}
              </h2>

              <div
                className="heroEmail"
                style={heroEmail}
              >
                <Mail
                  size={15}
                  strokeWidth={2}
                />

                <span>
                  {email ||
                    "No email available"}
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="profileGrid">

          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <section
            className="profileSection"
            style={profileSection}
          >

            <div
              className="sectionHeader"
              style={sectionHeader}
            >

              <div
                className="sectionHeaderIcon"
                style={sectionHeaderIcon}
              >
                <User
                  size={20}
                  strokeWidth={2.2}
                />
              </div>

              <div className="sectionHeaderText">

                <h2
                  className="sectionTitle"
                  style={sectionTitle}
                >
                  Profile Information
                </h2>

                <p
                  className="sectionSubtitle"
                  style={sectionSubtitle}
                >
                  Update your personal information
                </p>

              </div>

            </div>

            <form
              onSubmit={handleSubmit}
              style={form}
            >

              {/* NAME */}

              <div style={fieldGroup}>

                <label style={label}>
                  <UserRound
                    size={14}
                    strokeWidth={2.2}
                  />

                  Full Name
                </label>

                <div style={inputWrapper}>

                  <User
                    size={18}
                    strokeWidth={2}
                    style={inputIcon}
                  />

                  <input
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    className="inputField"
                    style={input}
                    autoComplete="name"
                  />

                  <Pencil
                    size={15}
                    strokeWidth={2}
                    style={inputRightIcon}
                  />

                </div>

              </div>

              {/* EMAIL */}

              <div style={fieldGroup}>

                <label style={label}>
                  <Mail
                    size={14}
                    strokeWidth={2.2}
                  />

                  Email Address
                </label>

                <div
                  style={{
                    ...inputWrapper,
                    ...disabledWrapper,
                  }}
                >

                  <Mail
                    size={18}
                    strokeWidth={2}
                    style={inputIcon}
                  />

                  <input
                    value={email}
                    disabled
                    className="inputField"
                    style={{
                      ...input,
                      ...inputDisabled,
                    }}
                  />

                  <ShieldCheck
                    size={17}
                    strokeWidth={2}
                    style={inputRightIcon}
                  />

                </div>

                <div style={fieldHint}>
                  <Shield
                    size={13}
                    strokeWidth={2}
                  />

                  Email address cannot be changed
                  here.
                </div>

              </div>

              {/* SAVE */}

              <button
                type="submit"
                style={{
                  ...btn,
                  opacity: loading
                    ? 0.7
                    : 1,
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                }}
                disabled={loading}
              >

                <Save
                  size={18}
                  strokeWidth={2.4}
                />

                {loading
                  ? "Saving Changes..."
                  : "Save Profile Changes"}

              </button>

            </form>

          </section>

          {/* =================================================
              SECURITY
          ================================================= */}

          <section
            className="profileSection"
            style={profileSection}
          >

            <div
              className="sectionHeader"
              style={sectionHeader}
            >

              <div
                className="sectionHeaderIcon"
                style={{
                  ...sectionHeaderIcon,
                  background:
                    "linear-gradient(135deg,#047857,#10b981)",
                  boxShadow:
                    "0 7px 16px rgba(5,150,105,.18)",
                }}
              >
                <Shield
                  size={20}
                  strokeWidth={2.2}
                />
              </div>

              <div className="sectionHeaderText">

                <h2
                  className="sectionTitle"
                  style={sectionTitle}
                >
                  Security
                </h2>

                <p
                  className="sectionSubtitle"
                  style={sectionSubtitle}
                >
                  Protect your account with a
                  strong password
                </p>

              </div>

            </div>

            <div style={securityNotice}>

              <div style={securityNoticeIcon}>
                <LockKeyhole
                  size={17}
                  strokeWidth={2.2}
                />
              </div>

              <div className="securityNoticeText">

                <strong>
                  Keep your password secure
                </strong>

                <span>
                  Use a password that is difficult
                  for others to guess.
                </span>

              </div>

            </div>

            <form
              onSubmit={handlePasswordChange}
              style={form}
            >

              {/* CURRENT PASSWORD */}

              <div style={fieldGroup}>

                <label style={label}>
                  <KeyRound
                    size={14}
                    strokeWidth={2.2}
                  />

                  Current Password
                </label>

                <div style={passwordWrapper}>

                  <KeyRound
                    size={18}
                    strokeWidth={2}
                    style={passwordLeftIcon}
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }
                    className="inputField"
                    style={{
                      ...passwordInput,
                      paddingLeft: 44,
                    }}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    style={passwordToggle}
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* NEW PASSWORD */}

              <div style={fieldGroup}>

                <label style={label}>
                  <LockKeyhole
                    size={14}
                    strokeWidth={2.2}
                  />

                  New Password
                </label>

                <div style={passwordWrapper}>

                  <LockKeyhole
                    size={18}
                    strokeWidth={2}
                    style={passwordLeftIcon}
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a new password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    className="inputField"
                    style={{
                      ...passwordInput,
                      paddingLeft: 44,
                    }}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    style={passwordToggle}
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                {/* PASSWORD STRENGTH */}

                {newPassword && (
                  <div style={strengthWrapper}>

                    <div
                      style={{
                        ...strengthText,
                        color:
                          getStrength(
                            newPassword
                          ).color,
                      }}
                    >
                      <span>
                        Password strength
                      </span>

                      <strong>
                        {
                          getStrength(
                            newPassword
                          ).label
                        }
                      </strong>
                    </div>

                    <div style={strengthTrack}>

                      <div
                        style={{
                          ...strengthBar,
                          width:
                            getStrength(
                              newPassword
                            ).width,
                          background:
                            getStrength(
                              newPassword
                            ).color,
                        }}
                      />

                    </div>

                  </div>
                )}

              </div>

              {/* CONFIRM PASSWORD */}

              <div style={fieldGroup}>

                <label style={label}>
                  <ShieldCheck
                    size={14}
                    strokeWidth={2.2}
                  />

                  Confirm New Password
                </label>

                <div style={passwordWrapper}>

                  <ShieldCheck
                    size={18}
                    strokeWidth={2}
                    style={passwordLeftIcon}
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    className="inputField"
                    style={{
                      ...passwordInput,
                      paddingLeft: 44,
                    }}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    style={passwordToggle}
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* SHOW PASSWORD */}

              <label style={checkbox}>

                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  style={checkboxInput}
                />

                <span>
                  Show passwords
                </span>

                <Eye
                  size={15}
                  strokeWidth={2}
                />

              </label>

              {/* UPDATE */}

              <button
                type="submit"
                style={{
                  ...btn,
                  background:
                    "linear-gradient(135deg,#047857,#059669)",
                  boxShadow:
                    "0 7px 18px rgba(5,150,105,.18)",
                  opacity: loading
                    ? 0.7
                    : 1,
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                }}
                disabled={loading}
              >

                <KeyRound
                  size={18}
                  strokeWidth={2.4}
                />

                {loading
                  ? "Updating Password..."
                  : "Update Password"}

              </button>

            </form>

          </section>

        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div
            className="profileMessage"
            style={{
              ...messageBox,
              background:
                messageType === "success"
                  ? "#ecfdf5"
                  : "#fef2f2",
              color:
                messageType === "success"
                  ? "#166534"
                  : "#b91c1c",
              border:
                messageType === "success"
                  ? "1px solid #bbf7d0"
                  : "1px solid #fecaca",
            }}
          >

            <div
              style={{
                ...messageIcon,
                background:
                  messageType === "success"
                    ? "#dcfce7"
                    : "#fee2e2",
              }}
            >

              {messageType === "success" ? (
                <CheckCircle
                  size={19}
                  strokeWidth={2.3}
                />
              ) : (
                <XCircle
                  size={19}
                  strokeWidth={2.3}
                />
              )}

            </div>

            <div style={messageContent}>

              <strong>
                {messageType === "success"
                  ? "Success"
                  : "Something went wrong"}
              </strong>

              <span>
                {messageText}
              </span>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

/* =====================================================
   RESPONSIVE CSS
===================================================== */

const responsiveStyles = `
  * {
    box-sizing: border-box;
  }

  button,
  input {
    font-family: inherit;
  }

  button {
    -webkit-tap-highlight-color: transparent;
  }

  input {
    -webkit-appearance: none;
  }

  .profilePage {
    overflow-x: hidden;
  }

  .profileContent {
    width: 100%;
    max-width: 1080px;
    margin: 0 auto;
  }

  /* ===================================================
     PAGE HEADER
  =================================================== */

  .pageHeading {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
  }

  .pageHeadingLeft {
    min-width: 0;
  }

  .headingText {
    min-width: 0;
  }

  /* ===================================================
     HERO
  =================================================== */

  .profileHero {
    position: relative;
    overflow: hidden;
    width: 100%;
    border-radius: 24px;
    margin-bottom: 22px;
  }

  .heroContent {
    position: relative;
    z-index: 2;
    min-height: 245px;
    display: flex;
    align-items: center;
    gap: 38px;
    padding: 35px 42px;
  }

  .avatarArea {
    flex-shrink: 0;
    text-align: center;
  }

  .avatarWrapper {
    position: relative;
  }

  /*
    THIS IS THE IMPORTANT FIX.

    The inner container forces the actual image
    to be clipped into a perfect circle.
  */

  .avatarClip {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    background: #1e3a8a;
  }

  .avatarImage {
    width: 100% !important;
    height: 100% !important;
    min-width: 100% !important;
    min-height: 100% !important;
    max-width: none !important;
    max-height: none !important;
    display: block !important;
    border-radius: 50% !important;
    object-fit: cover !important;
    object-position: center center !important;
    background: #1e3a8a;
  }

  .avatarFallback {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .heroIdentity {
    min-width: 0;
    flex: 1;
  }

  .heroName {
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .heroEmail {
    min-width: 0;
    max-width: 100%;
  }

  .heroEmail span {
    min-width: 0;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  /* ===================================================
     GRID
  =================================================== */

  .profileGrid {
    display: grid;
    grid-template-columns: repeat(
      2,
      minmax(0, 1fr)
    );
    gap: 22px;
  }

  .profileSection {
    min-width: 0;
    width: 100%;
  }

  .sectionHeader {
    min-width: 0;
  }

  .sectionHeaderText {
    min-width: 0;
  }

  .sectionTitle,
  .sectionSubtitle {
    overflow-wrap: anywhere;
  }

  .securityNoticeText {
    min-width: 0;
    line-height: 1.45;
  }

  .securityNoticeText strong {
    display: inline;
  }

  .securityNoticeText span {
    display: inline;
    margin-left: 3px;
  }

  /* ===================================================
     INPUTS
  =================================================== */

  .inputField {
    max-width: 100%;
  }

  /* ===================================================
     CAMERA
  =================================================== */

  .cameraButton {
    -webkit-appearance: none;
  }

  .changePhotoButton {
    -webkit-appearance: none;
  }

  /* ===================================================
     TABLET
  =================================================== */

  @media (max-width: 900px) {

    .profileContent {
      max-width: 760px;
    }

    .profileGrid {
      grid-template-columns: 1fr;
    }

    .heroContent {
      padding: 30px;
      gap: 28px;
    }
  }

  /* ===================================================
     MOBILE
  =================================================== */

  @media (max-width: 700px) {

    .profilePage {
      padding: 18px 14px !important;
    }

    .pageHeading {
      align-items: stretch;
      flex-direction: column;
      gap: 13px;
      margin-bottom: 18px;
    }

    .pageHeadingLeft {
      width: 100%;
      align-items: center;
    }

    .accountBadge {
      width: 100%;
      min-height: 38px;
      justify-content: center;
    }

    /* HERO */

    .profileHero {
      border-radius: 20px;
      margin-bottom: 16px;
    }

    .heroContent {
      min-height: auto;
      width: 100%;
      flex-direction: column;
      text-align: center;
      padding: 30px 18px 28px;
      gap: 17px;
    }

    .avatarArea {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .heroIdentity {
      width: 100%;
      max-width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .verifiedBadge {
      margin: 0 auto;
    }

    .heroName {
      width: 100%;
      max-width: 100%;
      margin-left: auto !important;
      margin-right: auto !important;
      text-align: center;
    }

    .heroEmail {
      width: 100%;
      justify-content: center !important;
      text-align: center;
    }

    /* GRID */

    .profileGrid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .profileSection {
      width: 100%;
      border-radius: 18px !important;
    }

    /* SECTIONS */

    .sectionHeader {
      align-items: center;
    }

    /* SECURITY */

    .securityNotice {
      width: 100%;
    }

    /* BUTTONS */

    .profileSection button[type="submit"] {
      width: 100%;
      min-height: 50px;
    }
  }

  /* ===================================================
     SMALL PHONES
  =================================================== */

  @media (max-width: 430px) {

    .profilePage {
      padding: 12px 10px !important;
    }

    .pageHeading {
      margin-bottom: 14px;
    }

    .pageHeadingLeft {
      gap: 10px;
    }

    .pageHeadingIcon {
      width: 44px !important;
      height: 44px !important;
      min-width: 44px !important;
      border-radius: 13px !important;
    }

    .pageTitle {
      font-size: 24px !important;
      letter-spacing: -0.4px !important;
    }

    .pageSubtitle {
      font-size: 12px !important;
      line-height: 1.35 !important;
    }

    .accountBadge {
      font-size: 11px !important;
      min-height: 36px;
    }

    /* HERO */

    .profileHero {
      border-radius: 18px;
    }

    .heroContent {
      padding: 25px 14px 24px;
      gap: 16px;
    }

    /*
      Perfectly sized mobile avatar.
    */

    .avatarWrapper {
      width: 118px !important;
      height: 118px !important;
    }

    .avatarRing {
      width: 118px !important;
      height: 118px !important;
      padding: 4px !important;
    }

    .avatarClip {
      width: 100% !important;
      height: 100% !important;
    }

    .avatarImage {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      object-position: center center !important;
    }

    .avatarFallback {
      width: 100% !important;
      height: 100% !important;
      font-size: 30px !important;
    }

    .cameraButton {
      width: 38px !important;
      height: 38px !important;
      right: -1px !important;
      bottom: 1px !important;
      border-width: 3px !important;
    }

    .cameraButton svg {
      width: 17px;
      height: 17px;
    }

    .changePhotoButton {
      margin-top: 8px !important;
      font-size: 11px !important;
    }

    .verifiedBadge {
      font-size: 10px !important;
      padding: 5px 9px !important;
    }

    .heroName {
      font-size: 24px !important;
      line-height: 1.15 !important;
      margin-top: 9px !important;
      margin-bottom: 5px !important;
    }

    .heroEmail {
      font-size: 11.5px !important;
      gap: 5px !important;
      line-height: 1.35 !important;
    }

    .heroEmail svg {
      flex-shrink: 0;
    }

    /* SECTIONS */

    .profileSection {
      padding: 20px 16px !important;
      border-radius: 18px !important;
    }

    .sectionHeader {
      gap: 10px !important;
      margin-bottom: 19px !important;
    }

    .sectionHeaderIcon {
      width: 40px !important;
      height: 40px !important;
      min-width: 40px !important;
      border-radius: 11px !important;
    }

    .sectionHeaderIcon svg {
      width: 18px;
      height: 18px;
    }

    .sectionTitle {
      font-size: 17px !important;
      line-height: 1.2 !important;
    }

    .sectionSubtitle {
      font-size: 11px !important;
      line-height: 1.35 !important;
    }

    /* FORM */

    .fieldGroup {
      margin-bottom: 15px !important;
    }

    .inputField {
      height: 47px !important;
      font-size: 14px !important;
      padding-top: 12px !important;
      padding-bottom: 12px !important;
    }

    .label {
      font-size: 11.5px !important;
    }

    /* SECURITY NOTICE */

    .securityNotice {
      padding: 10px !important;
      gap: 8px !important;
      margin-bottom: 18px !important;
    }

    .securityNoticeText {
      font-size: 11px !important;
    }

    .securityNoticeIcon {
      width: 30px !important;
      height: 30px !important;
      min-width: 30px !important;
    }

    /* MESSAGE */

    .profileMessage {
      align-items: flex-start !important;
    }
  }

  /* ===================================================
     VERY SMALL PHONES
  =================================================== */

  @media (max-width: 340px) {

    .profilePage {
      padding-left: 8px !important;
      padding-right: 8px !important;
    }

    .pageHeadingLeft {
      gap: 8px;
    }

    .pageHeadingIcon {
      width: 42px !important;
      height: 42px !important;
      min-width: 42px !important;
    }

    .pageTitle {
      font-size: 22px !important;
    }

    .pageSubtitle {
      font-size: 11px !important;
    }

    .profileSection {
      padding-left: 13px !important;
      padding-right: 13px !important;
    }

    .heroContent {
      padding-left: 11px !important;
      padding-right: 11px !important;
    }

    .avatarWrapper {
      width: 108px !important;
      height: 108px !important;
    }

    .avatarRing {
      width: 108px !important;
      height: 108px !important;
    }

    .cameraButton {
      width: 36px !important;
      height: 36px !important;
    }

    .heroName {
      font-size: 21px !important;
    }

    .heroEmail {
      font-size: 10.5px !important;
    }

    .sectionTitle {
      font-size: 16px !important;
    }
  }
`;

/* =====================================================
   PAGE
===================================================== */

const container = {
  minHeight: "100vh",
  width: "100%",
  padding: "clamp(18px, 3vw, 35px)",
  background:
    "linear-gradient(180deg,#f8fafc 0%,#eef2f7 100%)",
  color: "#0f172a",
  display: "block",
  boxSizing: "border-box",
};

/* =====================================================
   PAGE HEADING
===================================================== */

const pageHeadingLeft = {
  display: "flex",
  alignItems: "center",
  gap: 13,
  minWidth: 0,
};

const pageHeadingIcon = {
  width: 52,
  height: 52,
  minWidth: 52,
  borderRadius: 15,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  background:
    "linear-gradient(135deg,#1e3a8a,#020617)",
  boxShadow:
    "0 10px 24px rgba(30,58,138,.22)",
};

const pageTitle = {
  margin: 0,
  fontSize: "clamp(25px,4vw,34px)",
  lineHeight: 1.1,
  fontWeight: 900,
  letterSpacing: "-.5px",
};

const pageSubtitle = {
  margin: "5px 0 0",
  color: "#64748b",
  fontSize: 13,
  lineHeight: 1.4,
};

const accountBadge = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "8px 12px",
  borderRadius: 20,
  background: "#ecfdf5",
  color: "#047857",
  border: "1px solid #bbf7d0",
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: "nowrap",
};

/* =====================================================
   PROFILE HERO
===================================================== */

const heroBackgroundShape = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(135deg,#0f172a 0%,#1e3a8a 55%,#2563eb 100%)",
};

const avatarWrapper = {
  position: "relative",
  width: 138,
  height: 138,
  margin: "0 auto",
};

const avatarRing = {
  width: 138,
  height: 138,
  padding: 4,
  borderRadius: "50%",
  background:
    "linear-gradient(135deg,#ffffff,#93c5fd,#ffffff)",
  boxShadow:
    "0 12px 30px rgba(0,0,0,.25)",
  position: "relative",
};

const avatarFallback = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  background:
    "linear-gradient(135deg,#2563eb,#1e40af)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 34,
  fontWeight: 900,
};

const cameraButton = {
  position: "absolute",
  right: 0,
  bottom: 4,
  width: 42,
  height: 42,
  borderRadius: "50%",
  border: "3px solid #ffffff",
  background:
    "linear-gradient(135deg,#2563eb,#1d4ed8)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow:
    "0 7px 18px rgba(0,0,0,.28)",
  zIndex: 5,
};

const changePhotoButton = {
  marginTop: 9,
  border: "none",
  background: "transparent",
  color: "rgba(255,255,255,.86)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const verifiedBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 20,
  background: "rgba(255,255,255,.12)",
  border: "1px solid rgba(255,255,255,.18)",
  color: "#dbeafe",
  fontSize: 11,
  fontWeight: 800,
};

const heroName = {
  margin: "11px 0 6px",
  color: "#ffffff",
  fontSize: "clamp(25px,5vw,34px)",
  fontWeight: 900,
  lineHeight: 1.15,
};

const heroEmail = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  color: "rgba(255,255,255,.76)",
  fontSize: 13,
  minWidth: 0,
};

const avatarArea = {
  flexShrink: 0,
  textAlign: "center",
};

/* =====================================================
   SECTIONS
===================================================== */

const profileSection = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 25,
  boxShadow:
    "0 8px 25px rgba(15,23,42,.06)",
};

const sectionHeader = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 22,
};

const sectionHeaderIcon = {
  width: 44,
  height: 44,
  minWidth: 44,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  background:
    "linear-gradient(135deg,#1e3a8a,#2563eb)",
  boxShadow:
    "0 7px 16px rgba(37,99,235,.18)",
};

const sectionTitle = {
  margin: 0,
  color: "#0f172a",
  fontSize: 19,
  fontWeight: 900,
  lineHeight: 1.2,
};

const sectionSubtitle = {
  margin: "4px 0 0",
  color: "#64748b",
  fontSize: 12,
  lineHeight: 1.4,
};

/* =====================================================
   FORM
===================================================== */

const form = {
  width: "100%",
};

const fieldGroup = {
  width: "100%",
  marginBottom: 17,
};

const label = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 7,
  color: "#334155",
  fontSize: 12,
  fontWeight: 800,
};

const inputWrapper = {
  position: "relative",
  width: "100%",
};

const inputIcon = {
  position: "absolute",
  left: 13,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#64748b",
  pointerEvents: "none",
  zIndex: 2,
};

const inputRightIcon = {
  position: "absolute",
  right: 13,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#94a3b8",
  pointerEvents: "none",
  zIndex: 2,
};

const input = {
  width: "100%",
  minWidth: 0,
  height: 48,
  padding: "0 42px 0 43px",
  borderRadius: 11,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box",
};

const inputDisabled = {
  background: "#f1f5f9",
  color: "#64748b",
  cursor: "not-allowed",
};

const disabledWrapper = {
  opacity: 0.92,
};

const fieldHint = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  marginTop: 7,
  color: "#64748b",
  fontSize: 10.5,
  lineHeight: 1.4,
};

const btn = {
  width: "100%",
  minHeight: 48,
  marginTop: 4,
  padding: "12px 16px",
  border: "none",
  borderRadius: 11,
  background:
    "linear-gradient(135deg,#2563eb,#1e3a8a)",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontSize: 13,
  fontWeight: 800,
  boxShadow:
    "0 8px 18px rgba(37,99,235,.2)",
};

/* =====================================================
   SECURITY
===================================================== */

const securityNotice = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  marginBottom: 20,
  padding: 12,
  borderRadius: 12,
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
};

const securityNoticeIcon = {
  width: 32,
  height: 32,
  minWidth: 32,
  borderRadius: 9,
  background: "#dcfce7",
  color: "#15803d",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const passwordWrapper = {
  position: "relative",
  width: "100%",
};

const passwordLeftIcon = {
  position: "absolute",
  left: 14,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#64748b",
  pointerEvents: "none",
  zIndex: 2,
};

const passwordInput = {
  ...input,
  paddingRight: 50,
};

const passwordToggle = {
  position: "absolute",
  right: 7,
  top: "50%",
  transform: "translateY(-50%)",
  width: 35,
  height: 35,
  border: "none",
  borderRadius: 8,
  background: "transparent",
  color: "#64748b",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  padding: 0,
  zIndex: 3,
};

const strengthWrapper = {
  marginTop: -7,
  marginBottom: 17,
};

const strengthText = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 6,
  fontSize: 11,
  fontWeight: 700,
};

const strengthTrack = {
  width: "100%",
  height: 5,
  borderRadius: 20,
  overflow: "hidden",
  background: "#e2e8f0",
};

const strengthBar = {
  height: "100%",
  borderRadius: 20,
  transition: "width .3s ease",
};

const checkbox = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  marginBottom: 17,
  color: "#475569",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const checkboxInput = {
  cursor: "pointer",
  width: 15,
  height: 15,
};

/* =====================================================
   MESSAGE
===================================================== */

const messageBox = {
  width: "100%",
  marginTop: 18,
  padding: 13,
  borderRadius: 13,
  display: "flex",
  alignItems: "center",
  gap: 11,
  boxSizing: "border-box",
};

const messageIcon = {
  width: 35,
  height: 35,
  minWidth: 35,
  borderRadius: 9,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const messageContent = {
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  fontSize: 12,
  lineHeight: 1.4,
};

/* =====================================================
   LOADING
===================================================== */

const loadingCard = {
  width: "min(100%,420px)",
  margin: "15vh auto 0",
  padding: 35,
  borderRadius: 20,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow:
    "0 15px 40px rgba(15,23,42,.08)",
  textAlign: "center",
};

const loadingIcon = {
  width: 70,
  height: 70,
  margin: "0 auto 17px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#dbeafe",
  color: "#1d4ed8",
};

const loadingTitle = {
  margin: 0,
  color: "#0f172a",
  fontSize: 20,
  fontWeight: 900,
};

const loadingText = {
  margin: "7px 0 18px",
  color: "#64748b",
  fontSize: 13,
  lineHeight: 1.5,
};

const loadingBar = {
  width: "100%",
  height: 5,
  borderRadius: 20,
  overflow: "hidden",
  background: "#e2e8f0",
};

const loadingBarInner = {
  width: "45%",
  height: "100%",
  borderRadius: 20,
  background:
    "linear-gradient(90deg,#2563eb,#38bdf8)",
  animation:
    "profileLoading 1.3s ease-in-out infinite",
};

export default Profile;